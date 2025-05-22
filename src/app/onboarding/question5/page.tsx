'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboardingStore } from '@/store/onboarding';
import { validatePersonalRecord } from '@/lib/validation';

export default function Question5Page() {
  const router = useRouter();
  const { personalRecord, setPersonalRecord, isLoading, setIsLoading } = useOnboardingStore();
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    const validation = validatePersonalRecord(personalRecord);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving personal record:', error);
      setError('Failed to save personal record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Question 5 of 5</h1>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What's your personal record run?
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your best run time. This helps us understand your current fitness level and set appropriate goals.
          </p>
          
          <Input
            type="text"
            placeholder="e.g., 5K in 25 minutes"
            value={personalRecord}
            onChange={(e) => {
              setPersonalRecord(e.target.value);
              setError('');
            }}
            className="w-full p-4 border rounded-lg"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Format examples: "5K in 25 minutes", "10K in 55 minutes", "Half marathon in 1:45"
          </p>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !personalRecord.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
} 