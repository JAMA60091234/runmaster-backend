import express from 'express';
import axios from 'axios';
import { User } from '../models/User';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// GET /strava/status/:userId
router.get('/status/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    connected: user.strava.connected,
    expiresAt: user.strava.expiresAt
  });
}));

// GET /connect-strava
router.get('/connect', (req, res) => {
  const authURL = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${process.env.STRAVA_REDIRECT_URI}&approval_prompt=auto&scope=read,activity:read`;
  res.redirect(authURL);
});

// GET /strava/callback
router.get('/callback', asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const userId = state; // Pass userId in state parameter

  try {
    const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
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

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/settings?strava=success`);
  } catch (error) {
    console.error('Strava Auth Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?strava=error`);
  }
}));

// POST /strava/disconnect/:userId
router.post('/disconnect/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Revoke Strava access
  if (user.strava.accessToken) {
    try {
      await axios.post('https://www.strava.com/oauth/deauthorize', null, {
        headers: {
          'Authorization': `Bearer ${user.strava.accessToken}`
        }
      });
    } catch (error) {
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

// Helper function to refresh token if expired
async function refreshStravaToken(user) {
  if (!user.strava.refreshToken) {
    throw new Error('No refresh token available');
  }

  const tokenRes = await axios.post('https://www.strava.com/oauth/token', {
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