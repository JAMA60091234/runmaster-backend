'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Run } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import Image from 'next/image';

export default function LogWorkoutPage() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'Easy Run',
          distance: 4, // miles
          duration: 40, // minutes
          rating,
          notes: `Run felt ${getRatingEmoji(rating)}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log workout');
      }

      setIsCompleted(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingEmoji = (value: number) => {
    if (value >= 8) return 'amazing';
    if (value >= 6) return 'good';
    if (value >= 4) return 'okay';
    if (value >= 2) return 'tough';
    return 'difficult';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold">Today's Workout</h1>
        </div>

        {/* Workout Image */}
        <div className="relative w-full h-[230px]">
          <Image
            src="https://runkeeper.com/cms/wp-content/uploads/sites/4/2022/12/how-sleep-can-make-you-a-better-runner.jpg"
            alt="Running workout"
            fill
            className="object-cover"
          />
        </div>

        {/* Workout Details */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Easy Run</h2>
            <p className="text-gray-600">
              A comfortable-paced run to build endurance and maintain fitness. Focus on maintaining a steady pace where you can hold a conversation.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Run className="h-5 w-5 text-blue-600" />
              <span>4 miles • 40-45 minutes</span>
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">How did your run feel?</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{getRatingEmoji(rating)}</span>
                <span className="text-lg font-medium">{rating}/10</span>
              </div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[rating]}
                onValueChange={([value]) => setRating(value)}
                max={10}
                min={1}
                step={1}
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-5 h-5 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Workout rating"
                />
              </Slider.Root>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Terrible</span>
                <span>Amazing</span>
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <div className="pt-6">
            <Button
              onClick={handleComplete}
              disabled={isCompleted || isLoading}
              className="w-full bg-blue-600 text-white py-6 text-lg rounded-full hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Logging...' : isCompleted ? 'Workout Completed!' : 'Complete Workout'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 