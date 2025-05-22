import { create } from 'zustand';

interface OnboardingState {
  goal: string;
  targetDate: Date | null;
  fitnessLevel: string;
  trainingDays: number;
  personalRecord: string;
  isLoading: boolean;
  setGoal: (goal: string) => void;
  setTargetDate: (date: Date | null) => void;
  setFitnessLevel: (level: string) => void;
  setTrainingDays: (days: number) => void;
  setPersonalRecord: (record: string) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  goal: '',
  targetDate: null,
  fitnessLevel: '',
  trainingDays: 1,
  personalRecord: '',
  isLoading: false,
  setGoal: (goal) => set({ goal }),
  setTargetDate: (date) => set({ targetDate: date }),
  setFitnessLevel: (level) => set({ fitnessLevel: level }),
  setTrainingDays: (days) => set({ trainingDays: days }),
  setPersonalRecord: (record) => set({ personalRecord: record }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  reset: () => set({
    goal: '',
    targetDate: null,
    fitnessLevel: '',
    trainingDays: 1,
    personalRecord: '',
    isLoading: false,
  }),
})); 