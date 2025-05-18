import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { TrainingPlan } from '../models/TrainingPlan';
import asyncHandler from 'express-async-handler';
import axios from 'axios';

const router = express.Router();

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

export default router; 