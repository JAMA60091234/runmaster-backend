'use client';

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { 
  HomeIcon, 
  CalendarIcon, 
  PlusSquareIcon, 
  UtensilsIcon, 
  UserIcon,
  PlayIcon,
  EditIcon,
  SyncIcon,
  QuoteIcon
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

interface UserData {
  id: string;
  name: string;
  email: string;
  goal?: string;
}

interface Workout {
  id: string;
  distance: number;
  duration: number;
  date: string;
  type: string;
  rating: number;
}

interface Plan {
  id: string;
  weeks: string; // JSON string containing weekly data
}

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [targetDistance, setTargetDistance] = useState(584); // Default 10K plan
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(12);
  const [dailyQuote, setDailyQuote] = useState("Stay consistent. Every step counts toward your goal.");
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([]);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      fetchUserData(user.id);
    }
    fetchDailyQuote();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch workouts
      const workoutsResponse = await fetch(`/api/workouts?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (workoutsResponse.ok) {
        const workoutsData = await workoutsResponse.json();
        setWorkouts(workoutsData);
        
        // Calculate total distance
        const total = workoutsData.reduce((sum: number, workout: Workout) => sum + workout.distance, 0);
        setTotalDistance(total);

        // Calculate weekly progress
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        
        const weekProgress = Array(7).fill(0);
        workoutsData.forEach((workout: Workout) => {
          const workoutDate = new Date(workout.date);
          if (workoutDate >= startOfWeek && workoutDate <= today) {
            const dayIndex = workoutDate.getDay();
            // Use rating to determine bar height (1-10 rating maps to 20-100% height)
            weekProgress[dayIndex] = (workout.rating / 10) * 100;
          }
        });
        setWeeklyProgress(weekProgress);
      }

      // Fetch plan
      const planResponse = await fetch(`/api/plan?userId=${userId}`);
      if (planResponse.ok) {
        const planData = await planResponse.json();
        setPlan(planData);
        
        // Parse plan data
        if (planData.weeks) {
          const weeksData = JSON.parse(planData.weeks);
          setTotalWeeks(weeksData.length);
          
          // Calculate current week based on start date
          const startDate = new Date(weeksData[0].startDate);
          const today = new Date();
          const weekDiff = Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          setCurrentWeek(Math.min(weekDiff + 1, totalWeeks));
          
          // Calculate total target distance
          const totalTarget = weeksData.reduce((sum: number, week: any) => 
            sum + week.runs.reduce((weekSum: number, run: any) => weekSum + run.distance, 0), 0);
          setTargetDistance(totalTarget);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchDailyQuote = async () => {
    try {
      const response = await fetch('/api/quotes/today');
      if (response.ok) {
        const data = await response.json();
        setDailyQuote(data.quote);
      }
    } catch (error) {
      console.error('Error fetching daily quote:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-semibold">RunMaster</h1>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome back, {userData?.name || 'User'}! 👋
        </h2>

        {/* Goal Overview Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Your Goal: {userData?.goal || 'Run My First 10K'}
              </h3>
              <p className="text-gray-600">Training Plan Generated by AI</p>
            </div>
            <div className="bg-blue-600 rounded-full p-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Weeks Completed:</span>
              <span className="font-semibold">Week {currentWeek} of {totalWeeks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Distance Completed:</span>
              <span className="font-semibold">{totalDistance.toFixed(1)} km of {targetDistance.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="0"
              max={targetDistance}
              value={totalDistance}
              readOnly
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
            See Full Plan
          </button>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
        <div className="flex justify-between">
          <div className="text-center">
            <button className="bg-white p-4 rounded-full shadow-md mb-2">
              <PlayIcon className="w-6 h-6 text-blue-600" />
            </button>
            <p className="text-sm text-gray-600">Log Today's Run</p>
          </div>
          <div className="text-center">
            <button className="bg-white p-4 rounded-full shadow-md mb-2">
              <EditIcon className="w-6 h-6 text-blue-600" />
            </button>
            <p className="text-sm text-gray-600">Edit My Goal</p>
          </div>
          <div className="text-center">
            <button className="bg-white p-4 rounded-full shadow-md mb-2">
              <SyncIcon className="w-6 h-6 text-blue-600" />
            </button>
            <p className="text-sm text-gray-600">Sync Strava</p>
          </div>
        </div>

        {/* Motivation Box */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Today's Motivation</h3>
            <QuoteIcon className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-600 text-center">
            {dailyQuote}
          </p>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">This Week's Progress</h3>
          <div className="flex justify-between items-end h-32 mb-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <div key={day} className="flex flex-col items-center">
                <div 
                  className={`w-8 rounded-t-lg ${
                    weeklyProgress[index] > 0 ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  style={{ height: `${weeklyProgress[index] || 20}px` }}
                />
                <span className="text-sm text-gray-600 mt-2">{day}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600">
            {weeklyProgress.filter(height => height > 0).length} of 7 runs completed this week
          </p>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between py-4">
              <button className="flex flex-col items-center text-blue-600">
                <HomeIcon className="w-6 h-6" />
                <span className="text-xs mt-1">Home</span>
              </button>
              <button className="flex flex-col items-center text-gray-400">
                <CalendarIcon className="w-6 h-6" />
                <span className="text-xs mt-1">Plan</span>
              </button>
              <button className="flex flex-col items-center text-gray-400">
                <PlusSquareIcon className="w-6 h-6" />
                <span className="text-xs mt-1">Log</span>
              </button>
              <button className="flex flex-col items-center text-gray-400">
                <UtensilsIcon className="w-6 h-6" />
                <span className="text-xs mt-1">Diet</span>
              </button>
              <button className="flex flex-col items-center text-gray-400">
                <UserIcon className="w-6 h-6" />
                <span className="text-xs mt-1">Settings</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </main>
  );
} 