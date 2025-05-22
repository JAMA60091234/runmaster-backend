'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function ConnectedAppsPage() {
  const router = useRouter();
  const [stravaConnected, setStravaConnected] = useState(true);

  const AppConnection = ({ 
    icon: Icon, 
    title, 
    isConnected, 
    onToggle 
  }: { 
    icon: any; 
    title: string; 
    isConnected: boolean; 
    onToggle: (value: boolean) => void;
  }) => (
    <div className="w-full h-[100px] bg-white rounded-lg shadow-md flex items-center px-10">
      <Icon className="h-10 w-10 text-gray-900" />
      <span className="ml-8 text-xl text-gray-900">{title}</span>
      <div className="flex-1" />
      <Switch
        checked={isConnected}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-blue-600"
      />
    </div>
  );

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
          <h1 className="text-2xl font-semibold">Connected Apps</h1>
        </div>

        <div className="p-4">
          {/* Section Title */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold px-4">Connected Apps</h2>
            <p className="text-sm text-gray-500 mt-2 px-4">Your Connected Apps</p>
          </div>

          {/* App Connections */}
          <div className="mt-6 space-y-4">
            <AppConnection
              icon={Save}
              title="Connect to Strava"
              isConnected={stravaConnected}
              onToggle={setStravaConnected}
            />
            {/* Add more app connections here */}
          </div>
        </div>
      </div>
    </div>
  );
} 