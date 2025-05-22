'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/onboarding';

const fitnessLevels = [
  { value: 'beginner', label: 'Beginner', description: 'New to running or returning after a long break' },
  { value: 'intermediate', label: 'Intermediate', description: 'Regular runner with some race experience' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced runner with multiple races completed' }
];

export default function Question3Page() {
  const router = useRouter();
  const { fitnessLevel, setFitnessLevel, isLoading, setIsLoading } = useOnboardingStore();
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!fitnessLevel) {
      setError('Please select your fitness level');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/onboarding/question4');
    } catch (error) {
      console.error('Error saving fitness level:', error);
      setError('Failed to save fitness level. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Question 3 of 5</h1>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What's your current fitness level?
          </h2>
          <p className="text-gray-600 mb-6">
            This helps us create a training plan that matches your experience and capabilities.
          </p>
          
          <div className="space-y-4">
            {fitnessLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  setFitnessLevel(level.value);
                  setError('');
                }}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  fitnessLevel === level.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="font-medium text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </button>
            ))}
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !fitnessLevel}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
} 