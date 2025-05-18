import { Document } from 'mongoose';

export interface IStrava {
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  goal: {
    type: 'weight_loss' | 'speed' | 'endurance' | 'general_fitness';
    targetPace?: number;
    targetDistance?: number;
    targetWeight?: number;
  };
  experience: 'beginner' | 'intermediate' | 'advanced';
  strava: IStrava;
  currentPlan?: string;
} 