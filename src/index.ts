import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import checklistRoutes from './routes/checklist';
import planRoutes from './routes/plan';
import statsRoutes from './routes/stats';
import userRoutes from './routes/user';
import stravaRoutes from './routes/strava';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/runmaster')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/checklist', checklistRoutes);
app.use('/plan', planRoutes);
app.use('/stats', statsRoutes);
app.use('/user', userRoutes);
app.use('/strava', stravaRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 