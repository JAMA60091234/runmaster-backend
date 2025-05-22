import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { User } from '../models/User';
import asyncHandler from 'express-async-handler';
import { IUser } from '../types/user';
import { Workout } from '../models/Workout';

const router = express.Router();

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// GET /strava/status/:userId
router.get('/status/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    connected: user.strava?.connected || false,
    expiresAt: user.strava?.expiresAt
  });
}));

// GET /strava/auth-url/:userId
router.get('/auth-url/:userId', (req: Request, res: Response): void => {
  const { userId } = req.params;
  const authURL = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.STRAVA_REDIRECT_URI}&approval_prompt=auto&scope=read,activity:read&state=${userId}`;
  res.json({ url: authURL });
});

// GET /strava/callback
router.get('/callback', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const code = req.query.code as string;
  const state = req.query.state as string; // Pass userId in state parameter
  const userId = state;

  if (!code || !userId) {
    res.status(400).json({ message: 'Missing required parameters' });
    return;
  }

  try {
    const tokenRes = await axios.post<StravaTokenResponse>('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });

    // Update user with Strava tokens
    await User.findByIdAndUpdate(userId, {
      'strava.connected': true,
      'strava.accessToken': tokenRes.data.access_token,
      'strava.refreshToken': tokenRes.data.refresh_token,
      'strava.expiresAt': new Date(tokenRes.data.expires_at * 1000)
    });

    res.redirect(`${process.env.FRONTEND_URL}/settings?strava=success`);
  } catch (error) {
    next(error);
  }
}));

// POST /strava/disconnect/:userId
router.post('/disconnect/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Revoke Strava access if token exists
  if (user.strava?.accessToken) {
    try {
      await axios.post('https://www.strava.com/oauth/deauthorize', null, {
        headers: {
          'Authorization': `Bearer ${user.strava.accessToken}`
        }
      });
    } catch (error) {
      // Log error but continue with disconnection
      console.error('Strava Deauth Error:', error);
    }
  }

  // Clear Strava data from user
  user.strava = {
    connected: false,
    accessToken: undefined,
    refreshToken: undefined,
    expiresAt: undefined
  };
  await user.save();

  res.json({ message: 'Strava disconnected successfully' });
}));

// POST /strava/sync/:userId
router.post('/sync/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (!user.strava?.connected) {
    res.status(400).json({ message: 'Strava not connected' });
    return;
  }

  try {
    // Check if token needs refresh
    let accessToken = user.strava.accessToken;
    if (user.strava.expiresAt && user.strava.expiresAt < new Date()) {
      accessToken = await refreshStravaToken(user);
    }

    // Get recent activities from Strava
    const activitiesResponse = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        per_page: 30 // Get last 30 activities
      }
    });

    const activities = activitiesResponse.data;

    // Process each activity
    for (const activity of activities) {
      if (activity.type === 'Run') {
        // Check if workout already exists
        const existingWorkout = await Workout.findOne({
          userId,
          stravaId: activity.id.toString()
        });

        if (!existingWorkout) {
          // Create new workout
          await Workout.create({
            userId,
            type: 'Run',
            distance: activity.distance / 1609.34, // Convert meters to miles
            duration: activity.moving_time / 60, // Convert seconds to minutes
            date: new Date(activity.start_date),
            rating: 5, // Default rating
            stravaId: activity.id.toString(),
            stravaData: activity
          });
        }
      }
    }

    res.json({ message: 'Sync completed successfully' });
  } catch (error) {
    next(error);
  }
}));

// Helper function to refresh token if expired
async function refreshStravaToken(user: IUser): Promise<string> {
  if (!user.strava?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const tokenRes = await axios.post<StravaTokenResponse>('https://www.strava.com/oauth/token', {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    refresh_token: user.strava.refreshToken,
    grant_type: 'refresh_token'
  });

  user.strava.accessToken = tokenRes.data.access_token;
  user.strava.refreshToken = tokenRes.data.refresh_token;
  user.strava.expiresAt = new Date(tokenRes.data.expires_at * 1000);
  await user.save();

  return user.strava.accessToken;
}

export default router; 