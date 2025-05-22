import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Array of motivational quotes for runners
const motivationalQuotes = [
  "Every step forward is a step toward your goal.",
  "The only run you'll regret is the one you didn't take.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Running is the greatest metaphor for life, because you get out of it what you put into it.",
  "The difference between ordinary and extraordinary is that little extra.",
  "You don't have to be fast, but you'd better be fearless.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Running is not about being better than someone else. It's about being better than you used to be.",
  "The only way to define your limits is by going beyond them.",
  "Your legs are not giving out. Your head is giving out. Keep going.",
  "The hardest step is the first one out the door.",
  "Running is the key to unlocking your potential.",
  "Every mile is a victory.",
  "Your pace, your race.",
  "The road to success is always under construction.",
  "Running is a conversation with your body. Listen to it.",
  "The only bad run is the one that didn't happen.",
  "Your speed doesn't matter. Forward is forward.",
  "Running is a celebration of what your body can do.",
  "The best time to start was yesterday. The next best time is now."
];

// GET /api/quotes/today
router.get('/today', async (req, res) => {
  try {
    // Check if we already have a quote for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingQuote = await prisma.quote.findFirst({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    if (existingQuote) {
      return res.json({ quote: existingQuote.text });
    }

    // Get a random quote from our array
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    const quoteText = motivationalQuotes[randomIndex];

    // Save the quote to database
    const quote = await prisma.quote.create({
      data: {
        text: quoteText,
      },
    });

    res.json({ quote: quote.text });
  } catch (error) {
    console.error('Error generating quote:', error);
    res.status(500).json({ error: 'Failed to generate quote' });
  }
});

export default router; 