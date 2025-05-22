'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, LogOut, User, Bell, HelpCircle, Shield } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { logout } from '@/lib/auth';

interface UserData {
  name: string;
  email: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const success = await logout();
      
      if (success) {
        router.push('/login');
      } else {
        // Handle logout failure
        console.error('Logout failed');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  const SettingItem = ({ icon: Icon, title, onClick }: { icon: any; title: string; onClick?: () => void }) => (
    <div
      onClick={onClick}
      className="w-full h-[60px] bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="h-full px-4 flex items-center">
        <Icon className="h-6 w-6 text-gray-500" />
        <span className="ml-3 text-gray-700 font-medium">{title}</span>
        <div className="flex-1" />
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header with Background Image */}
        <div className="relative h-[200px]">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1434394354979-a235cd36269d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vdW50YWluc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=900&q=60"
              alt="Header background"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-12 left-6">
            <div className="w-[90px] h-[90px] rounded-full border-2 border-white bg-white p-1">
              <Image
                src="https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OTZ8fHByb2ZpbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=900&q=60"
                alt="Profile picture"
                width={90}
                height={90}
                className="rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-16 px-6">
          <h1 className="text-2xl font-semibold">{userData?.name || 'Loading...'}</h1>
          <p className="text-sm text-gray-500 mt-1">Your Account</p>
        </div>

        {/* Account Settings */}
        <div className="mt-6 px-4 space-y-3">
          <SettingItem
            icon={User}
            title="Connected Apps"
            onClick={() => router.push('/connected-apps')}
          />
          <SettingItem
            icon={Bell}
            title="Goal Settings"
            onClick={() => router.push('/goal-settings')}
          />
          <SettingItem
            icon={HelpCircle}
            title="Account"
            onClick={() => router.push('/account')}
          />
        </div>

        {/* App Settings */}
        <div className="mt-8 px-6">
          <h2 className="text-sm font-medium text-gray-500">App Settings</h2>
        </div>
        <div className="mt-3 px-4 space-y-3">
          <SettingItem
            icon={Shield}
            title="Terms of Service"
            onClick={() => router.push('/terms')}
          />
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button
              onClick={handleLogout}
              disabled={isLoading}
              variant="outline"
              className="w-[150px] h-11 border-2 rounded-full"
            >
              <LogOut className="h-5 w-5 mr-2" />
              {isLoading ? 'Logging out...' : 'Log Out'}
            </Button>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
} 