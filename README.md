# RunMaster Backend

A Node.js/Express backend for the RunMaster fitness app, providing AI-powered training plans and Strava integration.

## Features

- 📋 Daily workout checklists
- 🏃‍♂️ AI-generated training plans
- 📊 Weekly stats tracking
- 🎯 Goal setting and progress tracking
- 🔄 Strava integration

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example` and fill in your values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/runmaster
   FRONTEND_URL=http://localhost:5173
   OPENROUTER_API_KEY=your_openrouter_api_key
   STRAVA_CLIENT_ID=your_strava_client_id
   STRAVA_CLIENT_SECRET=your_strava_client_secret
   STRAVA_REDIRECT_URI=http://localhost:5000/strava/callback
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Daily Checklist
- `GET /checklist/:userId/:date` - Get checklist for specific date
- `POST /checklist/:userId/:date` - Update checklist
  ```json
  {
    "runDone": true,
    "caloriesEaten": 2000,
    "mood": "great",
    "notes": "Felt strong today!"
  }
  ```

### Training Plan
- `GET /plan/:userId` - Get user's current training plan
- `POST /plan/complete` - Mark workout as completed
  ```json
  {
    "workoutId": "workout_id",
    "stravaActivityId": "strava_activity_id"
  }
  ```

### Weekly Stats
- `GET /stats/:userId` - Get weekly statistics

### User Goals
- `POST /user/:userId/goal` - Update user's goal and generate new plan
  ```json
  {
    "type": "speed",
    "targetPace": 5.0,
    "targetDistance": 10,
    "experience": "intermediate"
  }
  ```

### Strava Integration
- `GET /strava/status/:userId` - Check Strava connection status
- `GET /strava/connect` - Connect Strava account
- `POST /strava/disconnect/:userId` - Disconnect Strava account

## Development

- Built with TypeScript for type safety
- Uses MongoDB for data storage
- Implements Zod for request validation
- Integrates with OpenRouter AI for plan generation
- Follows REST API best practices

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

All error responses follow the format:
```json
{
  "message": "Error description"
}
``` 