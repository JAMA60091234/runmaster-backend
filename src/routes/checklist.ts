import express from 'express';
import { z } from 'zod';
import { DailyChecklist } from '../models/DailyChecklist';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Validation schema
const checklistSchema = z.object({
  runDone: z.boolean(),
  caloriesEaten: z.number().min(0).optional(),
  mood: z.enum(['great', 'good', 'okay', 'tired', 'stressed']),
  notes: z.string().optional()
});

// GET /checklist/:userId/:date
router.get('/:userId/:date', asyncHandler(async (req, res) => {
  const { userId, date } = req.params;
  const queryDate = new Date(date);
  
  const checklist = await DailyChecklist.findOne({
    userId,
    date: {
      $gte: new Date(queryDate.setHours(0, 0, 0)),
      $lt: new Date(queryDate.setHours(23, 59, 59))
    }
  });

  if (!checklist) {
    return res.status(404).json({ message: 'Checklist not found' });
  }

  res.json(checklist);
}));

// POST /checklist/:userId/:date
router.post('/:userId/:date', asyncHandler(async (req, res) => {
  const { userId, date } = req.params;
  const validatedData = checklistSchema.parse(req.body);
  
  const checklist = await DailyChecklist.findOneAndUpdate(
    { 
      userId,
      date: new Date(date)
    },
    {
      ...validatedData,
      userId,
      date: new Date(date)
    },
    { 
      new: true,
      upsert: true
    }
  );

  res.json(checklist);
}));

export default router; 