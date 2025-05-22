'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Run, Timer, Dumbbell, SelfImprovement } from 'lucide-react';
import { format, addDays, isToday, isPast, isFuture } from 'date-fns';

interface Workout {
  day: string;
  type: string;
  distance: string;
  duration: string;
  status: 'completed' | 'today' | 'upcoming' | 'skipped';
  icon: React.ReactNode;
}

interface Week {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  workouts: Workout[];
  isExpanded: boolean;
}

interface UserData {
  id: string;
  name: string;
  goal?: string;
  raceDate?: string;
  currentMileage?: number;
  targetMileage?: number;
}

interface WorkoutData {
  id: string;
  type: string;
  distance: number;
  duration: number;
  date: string;
  rating: number;
}

export default function PlanPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [totalWeeks, setTotalWeeks] = useState(16);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [percentComplete, setPercentComplete] = useState(0);
  const [currentMileage, setCurrentMileage] = useState(0);
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(user);

          // Check Strava connection status
          const stravaStatusResponse = await fetch(`/api/strava/status/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (stravaStatusResponse.ok) {
            const { connected } = await stravaStatusResponse.json();
            setIsStravaConnected(connected);
          }

          // Fetch workouts
          const workoutsResponse = await fetch(`/api/workouts?userId=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (workoutsResponse.ok) {
            const workoutsData = await workoutsResponse.json();
            setWorkouts(workoutsData);
            
            // Calculate current mileage
            const totalMiles = workoutsData.reduce((sum: number, workout: WorkoutData) => sum + workout.distance, 0);
            setCurrentMileage(totalMiles);
          }

          // Fetch plan
          const planResponse = await fetch(`/api/plan?userId=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (planResponse.ok) {
            const planData = await planResponse.json();
            if (planData.weeks) {
              const weeksData = JSON.parse(planData.weeks);
              setTotalWeeks(weeksData.length);
              
              // Calculate current week and percent complete
              const startDate = new Date(weeksData[0].startDate);
              const today = new Date();
              const weekDiff = Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
              const currentWeekNum = Math.min(weekDiff + 1, weeksData.length);
              setCurrentWeek(currentWeekNum);
              setPercentComplete((currentWeekNum / weeksData.length) * 100);

              // Generate weeks with workout status
              const generatedWeeks = weeksData.map((weekData: any, index: number) => {
                const weekStartDate = new Date(weekData.startDate);
                const weekEndDate = addDays(weekStartDate, 6);
                
                const weekWorkouts = weekData.runs.map((run: any, dayIndex: number) => {
                  const workoutDate = addDays(weekStartDate, dayIndex);
                  let status: 'completed' | 'today' | 'upcoming' | 'skipped' = 'upcoming';
                  
                  if (isToday(workoutDate)) {
                    status = 'today';
                  } else if (isPast(workoutDate)) {
                    // Check if workout was completed
                    const completedWorkout = workoutsData.find((w: WorkoutData) => 
                      new Date(w.date).toDateString() === workoutDate.toDateString()
                    );
                    status = completedWorkout ? 'completed' : 'skipped';
                  }

                  return {
                    day: format(workoutDate, 'EEEE'),
                    type: run.type,
                    distance: `${run.distance} miles`,
                    duration: `${run.duration} minutes`,
                    status,
                    icon: getWorkoutIcon(run.type)
                  };
                });

                return {
                  weekNumber: index + 1,
                  startDate: weekStartDate,
                  endDate: weekEndDate,
                  workouts: weekWorkouts,
                  isExpanded: index + 1 === currentWeekNum
                };
              });

              setWeeks(generatedWeeks);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const getWorkoutIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'easy run':
        return <Run className="w-6 h-6 text-blue-600" />;
      case 'tempo run':
        return <Timer className="w-6 h-6 text-orange-600" />;
      case 'long run':
        return <TrendingUp className="w-6 h-6 text-purple-600" />;
      case 'cross training':
        return <Dumbbell className="w-6 h-6 text-purple-600" />;
      case 'rest day':
        return <SelfImprovement className="w-6 h-6 text-gray-600" />;
      default:
        return <Run className="w-6 h-6 text-blue-600" />;
    }
  };

  const toggleWeek = (weekNumber: number) => {
    setWeeks(weeks.map(week => 
      week.weekNumber === weekNumber 
        ? { ...week, isExpanded: !week.isExpanded }
        : week
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600';
      case 'today':
        return 'bg-orange-50 text-orange-600';
      case 'skipped':
        return 'bg-red-50 text-red-600';
      case 'upcoming':
        return 'bg-gray-50 text-gray-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const handleStravaSync = async () => {
    if (!userData) return;

    try {
      setIsSyncing(true);
      const token = localStorage.getItem('token');

      if (!isStravaConnected) {
        // Get Strava auth URL
        const authResponse = await fetch(`/api/strava/auth-url/${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (authResponse.ok) {
          const { url } = await authResponse.json();
          window.location.href = url;
        }
      } else {
        // Trigger sync with Strava
        const syncResponse = await fetch(`/api/strava/sync/${userData.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (syncResponse.ok) {
          // Refresh workouts after sync
          const workoutsResponse = await fetch(`/api/workouts?userId=${userData.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (workoutsResponse.ok) {
            const workoutsData = await workoutsResponse.json();
            setWorkouts(workoutsData);
            
            // Recalculate current mileage
            const totalMiles = workoutsData.reduce((sum: number, workout: WorkoutData) => sum + workout.distance, 0);
            setCurrentMileage(totalMiles);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing with Strava:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold">Your Training Plan</h1>
        </div>

        {/* Goal Overview Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            {userData?.goal || 'Loading...'} on {userData?.raceDate ? format(new Date(userData.raceDate), 'MMMM d, yyyy') : 'Loading...'}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Week {currentWeek} of {totalWeeks}</span>
              <span className="text-blue-600">{Math.round(percentComplete)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${percentComplete}%` }} 
              />
            </div>
            <div className="flex items-center text-sm">
              <Run className="h-5 w-5 text-blue-600 mr-2" />
              <span>Current weekly mileage: {currentMileage} miles</span>
            </div>
          </div>
        </div>

        {/* Training Weeks */}
        <div className="space-y-4">
          {weeks.map((week) => (
            <div key={week.weekNumber} className="bg-white rounded-xl shadow-md overflow-hidden">
              <button
                onClick={() => toggleWeek(week.weekNumber)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <h3 className="text-lg font-semibold">Week {week.weekNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d')}
                  </p>
                </div>
                <svg
                  className={`w-6 h-6 text-blue-600 transform transition-transform ${
                    week.isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {week.isExpanded && (
                <div className="px-6 py-4 space-y-4">
                  {week.workouts.map((workout, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {workout.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{workout.type}</h4>
                          <p className="text-sm text-gray-600">
                            {workout.distance} • {workout.duration}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(workout.status)}`}>
                        {workout.status.charAt(0).toUpperCase() + workout.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <Button
            className="w-full bg-[#FC4C02] text-white hover:bg-[#E34402]"
            onClick={handleStravaSync}
            disabled={isSyncing}
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? 'Syncing...' : isStravaConnected ? 'Sync with Strava' : 'Connect with Strava'}
          </Button>
          <Button
            variant="outline"
            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
} 