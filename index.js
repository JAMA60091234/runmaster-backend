const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// AI Running Plan Generator
app.post("/generate-plan", async (req, res) => {
  const { age, weight, goal, experience, daysPerWeek } = req.body;

  const prompt = `
  You are a running coach and nutritionist. Create a weekly running plan for someone who is:
  - Age: ${age}
  - Weight: ${weight} lbs
  - Goal: ${goal}
  - Experience level: ${experience}
  - Wants to train ${daysPerWeek} days per week
  
  Also provide:
  - A daily calorie target to optimize fat loss + performance
  - Macronutrient breakdown (protein, carbs, fats)
  - Motivational message.
  `;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
        },
      }
    );

    res.json({ plan: response.data.choices[0].message.content });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

// STRAVA Integration
app.get("/connect-strava", (req, res) => {
  const authURL = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:5000/strava/callback&approval_prompt=auto&scope=read,activity:read`;
  res.redirect(authURL);
});

app.get("/strava/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const tokenRes = await axios.post("https://www.strava.com/oauth/token", {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    });

    res.json({ access_token: tokenRes.data.access_token });
  } catch (err) {
    console.error("Strava Auth Error:", err.message);
    res.status(500).json({ error: "Strava auth failed" });
  }
});

app.get("/strava-runs", async (req, res) => {
  const { token } = req.query;

  try {
    const runData = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const runs = runData.data.filter((act) => act.type === "Run");
    res.json({ runs });
  } catch (err) {
    console.error("Fetch Runs Error:", err.message);
    res.status(500).json({ error: "Failed to fetch runs" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
