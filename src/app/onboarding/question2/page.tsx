'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/onboarding';
import { validateTargetDate } from '@/lib/validation';
import { format } from 'date-fns';

export default function Question2Page() {
  const router = useRouter();
  const { targetDate, setTargetDate, isLoading, setIsLoading } = useOnboardingStore();
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    const validation = validateTargetDate(targetDate);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/onboarding/question3');
    } catch (error) {
      console.error('Error saving target date:', error);
      setError('Failed to save target date. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Question 2 of 5</h1>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            When do you want to achieve this goal?
          </h2>
          <p className="text-gray-600 mb-6">
            Choose a realistic target date for your goal. This will help us create a training plan that fits your timeline.
          </p>
          
          <input
            type="date"
            value={targetDate ? format(targetDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              setTargetDate(date);
              setError('');
            }}
            min={format(new Date(), 'yyyy-MM-dd')}
            max={format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd')}
            className="w-full p-4 border rounded-lg"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !targetDate}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
} 