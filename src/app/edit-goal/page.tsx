'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function EditGoalPage() {
  const router = useRouter();
  const [goal, setGoal] = useState('');

  const handleSubmit = () => {
    // TODO: Implement goal update logic
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-semibold text-gray-900">Edit Goal</h1>
        </div>

        <div className="p-4">
          {/* Goal Input */}
          <div className="mt-8">
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter your running goal..."
              className="w-full h-48 p-4 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 