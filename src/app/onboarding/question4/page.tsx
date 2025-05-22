'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/onboarding';
import * as Slider from '@radix-ui/react-slider';

export default function Question4Page() {
  const router = useRouter();
  const { trainingDays, setTrainingDays, isLoading, setIsLoading } = useOnboardingStore();
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!trainingDays) {
      setError('Please select your training days');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/onboarding/question5');
    } catch (error) {
      console.error('Error saving training days:', error);
      setError('Failed to save training days. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Question 4 of 5</h1>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How many days per week can you train?
          </h2>
          <p className="text-gray-600 mb-6">
            Select the number of days you can commit to training each week. Be realistic about your schedule.
          </p>
          
          <div className="px-4 py-8">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[trainingDays]}
              onValueChange={([value]) => {
                setTrainingDays(value);
                setError('');
              }}
              max={7}
              min={1}
              step={1}
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Training days"
              />
            </Slider.Root>
            <div className="mt-4 text-center">
              <span className="text-2xl font-bold text-gray-900">{trainingDays}</span>
              <span className="text-gray-600 ml-2">days per week</span>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !trainingDays}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
} 