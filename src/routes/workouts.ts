import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/workouts
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, distance, duration, rating, notes } = req.body;
    const userId = req.user.id; // From auth middleware

    const workout = await prisma.workout.create({
      data: {
        userId,
        type,
        distance,
        duration,
        rating,
        notes,
        date: new Date(),
      },
    });

    res.status(201).json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

// GET /api/workouts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

export default router; 