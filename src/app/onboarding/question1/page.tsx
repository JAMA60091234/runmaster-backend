'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboardingStore } from '@/store/onboarding';
import { validateGoal } from '@/lib/validation';

export default function Question1Page() {
  const router = useRouter();
  const { goal, setGoal, isLoading, setIsLoading } = useOnboardingStore();
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    const validation = validateGoal(goal);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/onboarding/question2');
    } catch (error) {
      console.error('Error saving goal:', error);
      setError('Failed to save goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Question 1 of 5</h1>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What's your main running goal?
          </h2>
          <p className="text-gray-600 mb-6">
            Be specific about what you want to achieve. For example: "I want to run my first 5K race" or "I want to improve my marathon time to under 4 hours"
          </p>
          
          <Input
            type="text"
            placeholder="Enter your running goal..."
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
              setError('');
            }}
            className="w-full p-4 border rounded-lg"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !goal.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
} 