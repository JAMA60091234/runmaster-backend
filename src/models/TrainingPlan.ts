import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  type: {
    type: String,
    enum: ['easy', 'tempo', 'intervals', 'long', 'rest'],
    required: true
  },
  distance: Number,
  duration: Number,
  description: String,
  completed: {
    type: Boolean,
    default: false
  },
  stravaActivityId: String
});

const trainingPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  weeklyWorkouts: [workoutSchema],
  calorieTarget: {
    type: Number,
    required: true
  },
  macros: {
    protein: Number,
    carbs: Number,
    fats: Number
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const TrainingPlan = mongoose.model('TrainingPlan', trainingPlanSchema); 