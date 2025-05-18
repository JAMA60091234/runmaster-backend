import express, { Request, Response, NextFunction } from 'express';
import { startOfWeek, endOfWeek } from 'date-fns';
import { DailyChecklist } from '../models/DailyChecklist';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// GET /stats/:userId
router.get('/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  // Get all checklists for the current week
  const weeklyChecklists = await DailyChecklist.find({
    userId,
    date: {
      $gte: weekStart,
      $lte: weekEnd
    }
  });

  // Calculate stats
  const stats = {
    totalDistance: 0,
    totalCalories: 0,
    completedWorkouts: 0,
    averageMood: 'N/A'
  };

  if (weeklyChecklists.length > 0) {
    stats.completedWorkouts = weeklyChecklists.filter(c => c.runDone).length;
    stats.totalCalories = weeklyChecklists.reduce((sum, c) => sum + (c.caloriesEaten || 0), 0);
    
    // Calculate average mood (simplified)
    const moodMap: Record<string, number> = { 'great': 5, 'good': 4, 'okay': 3, 'tired': 2, 'stressed': 1 };
    const moodSum = weeklyChecklists
      .map(c => moodMap[c.mood])
      .reduce((sum, val) => sum + val, 0);
    const avgMoodScore = moodSum / weeklyChecklists.length;
    
    // Convert back to mood string
    const moodRanges = [
      { score: 4.5, mood: 'great' },
      { score: 3.5, mood: 'good' },
      { score: 2.5, mood: 'okay' },
      { score: 1.5, mood: 'tired' },
      { score: 0, mood: 'stressed' }
    ];
    
    stats.averageMood = moodRanges.find(range => avgMoodScore >= range.score)?.mood || 'okay';
  }

  res.json(stats);
}));

export default router; 