import mongoose from 'mongoose';

const dailyChecklistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  runDone: {
    type: Boolean,
    default: false
  },
  caloriesEaten: {
    type: Number,
    min: 0
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'tired', 'stressed'],
    required: true
  },
  notes: String,
  stravaActivityId: String
}, {
  timestamps: true
});

// Compound index for quick lookups by user and date
dailyChecklistSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyChecklist = mongoose.model('DailyChecklist', dailyChecklistSchema); 