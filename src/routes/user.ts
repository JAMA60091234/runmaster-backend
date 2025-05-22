import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { TrainingPlan } from '../models/TrainingPlan';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const goalUpdateSchema = z.object({
  type: z.enum(['weight_loss', 'speed', 'endurance', 'general_fitness']),
  targetPace: z.number().optional(),
  targetDistance: z.number().optional(),
  targetWeight: z.number().optional(),
  experience: z.enum(['beginner', 'intermediate', 'advanced'])
});

// POST /user/:userId/goal
router.post('/:userId/goal', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  const goalData = goalUpdateSchema.parse(req.body);

  // Update user's goal
  const user = await User.findByIdAndUpdate(
    userId,
    {
      goal: {
        type: goalData.type,
        targetPace: goalData.targetPace,
        targetDistance: goalData.targetDistance,
        targetWeight: goalData.targetWeight
      },
      experience: goalData.experience
    },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Deactivate current plan if exists
  await TrainingPlan.findOneAndUpdate(
    { userId, active: true },
    { active: false }
  );

  // Generate new AI training plan
  const prompt = `
    Create a running plan for a ${goalData.experience} runner with the goal of ${goalData.type}.
    ${goalData.targetPace ? `Target pace: ${goalData.targetPace} min/km` : ''}
    ${goalData.targetDistance ? `Target distance: ${goalData.targetDistance} km` : ''}
    ${goalData.targetWeight ? `Target weight: ${goalData.targetWeight} kg` : ''}
  `;

  try {
    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const planData = aiResponse.data.choices[0].message.content;

    // Create new training plan
    const newPlan = await TrainingPlan.create({
      userId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week plan
      goal: goalData.type,
      weeklyWorkouts: [], // Parse AI response and structure workouts
      active: true
    });

    res.json({ user, plan: newPlan });
  } catch (error) {
    next(error);
  }
}));

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        personalBest: true,
        runningDays: true,
        shoes: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, personalBest, runningDays, shoes } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
        personalBest,
        runningDays: runningDays ? parseInt(runningDays) : undefined,
        shoes
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        personalBest: true,
        runningDays: true,
        shoes: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user goal
router.put('/goal', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { goal },
      select: {
        id: true,
        goal: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user goal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get terms of service
router.get('/terms', (req, res) => {
  const terms = {
    effectiveDate: 'May 19, 2025',
    content: `Welcome to RunMaster! These Terms of Service ("Terms") govern your use of the RunMaster app, website, and related services (collectively, the "Service") provided by RunMaster ("we," "us," or "our").

By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.

1. Eligibility
To use RunMaster, you must be at least 13 years old and legally able to enter into this agreement. If you are under 18, you must have your parent or guardian's consent.

2. Health Disclaimer
The plans provided through RunMaster are generated using AI and are for informational and educational purposes only.
They do not constitute medical advice. Always consult a doctor or certified health professional before starting any fitness or diet program. You are solely responsible for your health and safety while using the app.

3. Account & Data
You agree to provide accurate information when creating an account and to keep your login credentials secure.

If you connect to third-party services like Strava, you consent to sharing data (such as running stats) with our system for the purpose of generating your personalized plans.

4. Use of the Service
You agree to use the Service for personal, non-commercial purposes only. You will not:

• Misuse or interfere with the Service
• Attempt to reverse-engineer or copy features or data
• Use the Service to harass or harm others

5. Subscription & Fees
Some features may be offered as premium services. You'll be notified of any fees and terms before subscribing. All sales are final unless stated otherwise.

6. Termination
We may suspend or terminate your access if you violate these Terms or misuse the platform. You may delete your account at any time.

7. Intellectual Property
All content, designs, trademarks, and technology used in the Service are owned by or licensed to RunMaster. You may not use or reproduce them without permission.

8. Privacy
Your privacy is important to us. Please review our Privacy Policy for details on how we handle your data.

9. Limitation of Liability
We are not responsible for:

• Injuries or health issues resulting from following a plan
• Inaccuracies in AI-generated recommendations
• Service interruptions, data loss, or third-party platform issues

To the maximum extent allowed by law, our liability is limited to the amount you've paid us (if any) in the past 12 months.

10. Changes to These Terms
We may update these Terms from time to time. Continued use of the Service means you accept the revised Terms.`
  };

  res.json(terms);
});

export default router; 