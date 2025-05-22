'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Phone } from 'lucide-react';

interface UserData {
  phone: string;
  name: string;
  email: string;
  personalBest: string;
  runningDays: string;
  shoes: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserData>({
    phone: '',
    name: '',
    email: '',
    personalBest: '',
    runningDays: '',
    shoes: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setFormData(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If there's an error, we'll keep the form empty
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      // You might want to show an error message to the user here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-blue-600">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-4 text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-white">Account</h1>
        </div>

        <div className="p-4">
          {/* Phone Number Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">Link your phone number</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Enable security by connecting your phone number
                </p>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Your number here..."
                  className="w-full border-2 border-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Your information</h2>
            <div className="space-y-4">
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                className="w-full border-2 focus:ring-2 focus:ring-blue-500"
              />
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full border-2 focus:ring-2 focus:ring-blue-500"
              />
              <Input
                name="personalBest"
                value={formData.personalBest}
                onChange={handleInputChange}
                placeholder="Your PR"
                className="w-full border-2 focus:ring-2 focus:ring-blue-500"
              />
              <Input
                name="runningDays"
                value={formData.runningDays}
                onChange={handleInputChange}
                placeholder="Amount of days in a week you run"
                className="w-full border-2 focus:ring-2 focus:ring-blue-500"
              />
              <Input
                name="shoes"
                value={formData.shoes}
                onChange={handleInputChange}
                placeholder="What Shoes you run with"
                className="w-full border-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              className="w-[270px] h-[50px] text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 