import express from 'express';
import { z } from 'zod';
import { TrainingPlan } from '../models/TrainingPlan';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Validation schema
const completeWorkoutSchema = z.object({
  workoutId: z.string(),
  stravaActivityId: z.string().optional()
});

// GET /plan/:userId
router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const plan = await TrainingPlan.findOne({
    userId,
    active: true
  });

  if (!plan) {
    return res.status(404).json({ message: 'No active training plan found' });
  }

  res.json(plan);
}));

// POST /plan/complete
router.post('/complete', asyncHandler(async (req, res) => {
  const { workoutId, stravaActivityId } = completeWorkoutSchema.parse(req.body);
  
  const plan = await TrainingPlan.findOne({
    'weeklyWorkouts._id': workoutId
  });

  if (!plan) {
    return res.status(404).json({ message: 'Workout not found' });
  }

  // Find and update the specific workout in the array
  const workout = plan.weeklyWorkouts.id(workoutId);
  if (workout) {
    workout.completed = true;
    if (stravaActivityId) {
      workout.stravaActivityId = stravaActivityId;
    }
    await plan.save();
  }

  res.json(plan);
}));

export default router; 