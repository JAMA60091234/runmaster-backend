import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import quotesRoutes from './routes/quotes';
import workoutsRoutes from './routes/workouts';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/workouts', workoutsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 