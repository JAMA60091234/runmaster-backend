import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { planType } = await request.json();

    const prompt = `Generate a detailed weekly meal plan for ${planType} training. Include breakfast, lunch, dinner, and snacks for each day. Each meal should include:
    1. Name of the meal
    2. Calorie count
    3. List of ingredients
    4. Whether it's vegetarian (if applicable)
    
    Format the response as a JSON object with the following structure:
    {
      "weeklyPlan": [
        {
          "day": "Monday",
          "meals": {
            "breakfast": {
              "name": "string",
              "calories": number,
              "ingredients": "string",
              "isVegetarian": boolean
            },
            "lunch": { ... },
            "dinner": { ... },
            "snacks": { ... }
          }
        },
        // ... repeat for each day
      ]
    }`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'RunMaster',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const mealPlan = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(mealPlan);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
} 