import mongoose from 'mongoose';
import { IUser } from '../types/user';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  goal: {
    type: {
      type: String,
      enum: ['weight_loss', 'speed', 'endurance', 'general_fitness'],
      required: true
    },
    targetPace: Number,
    targetDistance: Number,
    targetWeight: Number
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  strava: {
    connected: { type: Boolean, default: false },
    accessToken: String,
    refreshToken: String,
    expiresAt: Date
  },
  currentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingPlan'
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 