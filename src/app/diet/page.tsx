'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Apple } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Meal {
  name: string;
  calories: number;
  ingredients: string;
  image?: string;
  isVegetarian?: boolean;
}

interface DayPlan {
  day: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
}

export default function DietPage() {
  const router = useRouter();
  const [expandedDay, setExpandedDay] = useState<string | null>('Monday');
  const [selectedPlan, setSelectedPlan] = useState<string>('half-marathon');
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateMealPlan();
  }, [selectedPlan]);

  const generateMealPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const data = await response.json();
      setWeeklyPlan(data.weeklyPlan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      // Fallback to default plan if API fails
      setWeeklyPlan([{
        day: 'Monday',
        meals: {
          breakfast: {
            name: 'Power Oatmeal with Berries',
            calories: 520,
            ingredients: 'Oats, almond milk, mixed berries, chia seeds, honey',
            isVegetarian: true,
          },
          lunch: {
            name: 'Chicken Quinoa Power Bowl',
            calories: 650,
            ingredients: 'Quinoa, grilled chicken, avocado, cherry tomatoes, cucumber',
          },
          dinner: {
            name: 'Baked Salmon with Sweet Potatoes',
            calories: 720,
            ingredients: 'Wild salmon, sweet potatoes, broccoli, olive oil, lemon',
          },
          snacks: {
            name: 'Greek Yogurt with Nuts',
            calories: 510,
            ingredients: 'Greek yogurt, mixed nuts, honey, banana',
          },
        },
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMealPlan = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Weekly Meal Plan', 20, 20);
    
    // Add plan type
    doc.setFontSize(14);
    doc.text(`Plan Type: ${selectedPlan.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`, 20, 30);
    
    let yPosition = 50;
    
    weeklyPlan.forEach((dayPlan) => {
      // Add day header
      doc.setFontSize(16);
      doc.text(dayPlan.day, 20, yPosition);
      yPosition += 10;
      
      // Add meals
      doc.setFontSize(12);
      Object.entries(dayPlan.meals).forEach(([mealType, meal]) => {
        doc.text(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${meal.name}`, 30, yPosition);
        yPosition += 7;
        doc.text(`Calories: ${meal.calories}`, 40, yPosition);
        yPosition += 7;
        doc.text(`Ingredients: ${meal.ingredients}`, 40, yPosition);
        yPosition += 10;
      });
      
      yPosition += 10;
      
      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    doc.save('meal-plan.pdf');
  };

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const MealSection = ({ title, meal, icon }: { title: string; meal: Meal; icon: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-blue-600">{icon}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <span className="text-gray-500">{meal.calories} cal</span>
      </div>
      <div className="flex space-x-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 relative overflow-hidden">
          {meal.image && (
            <Image
              src={meal.image}
              alt={meal.name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{meal.name}</h4>
            {meal.isVegetarian && (
              <span className="text-green-600 text-sm">🌱</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{meal.ingredients}</p>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-semibold">Diet Plan</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Plan Selection */}
          <div className="flex items-center space-x-4">
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="half-marathon">Half Marathon</SelectItem>
                <SelectItem value="full-marathon">Full Marathon</SelectItem>
                <SelectItem value="5k">5K Training</SelectItem>
                <SelectItem value="10k">10K Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Banner */}
          <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-semibold mb-6">
              {selectedPlan.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Training Plan
            </h2>
            
            <div className="flex justify-between mb-6">
              <div>
                <p className="text-blue-100 text-sm">Daily Target</p>
                <p className="text-2xl font-semibold">2,400 Calories</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-blue-100 text-sm">Training Days</p>
                <p className="text-2xl font-semibold">5 days/week</p>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6">
              <p className="text-blue-100 text-sm mb-4">Macronutrient Breakdown</p>
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-2xl font-semibold">55%</p>
                  <p className="text-blue-100 text-sm">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">25%</p>
                  <p className="text-blue-100 text-sm">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">20%</p>
                  <p className="text-blue-100 text-sm">Fat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Plan */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyPlan.map((dayPlan) => (
                <div
                  key={dayPlan.day}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                  <button
                    onClick={() => toggleDay(dayPlan.day)}
                    className="w-full p-5 flex items-center justify-between"
                  >
                    <h3 className="text-xl font-semibold">{dayPlan.day}</h3>
                    <span className={cn(
                      "transform transition-transform",
                      expandedDay === dayPlan.day ? "rotate-180" : ""
                    )}>
                      ▼
                    </span>
                  </button>

                  {expandedDay === dayPlan.day && (
                    <div className="p-5 space-y-6 border-t">
                      <MealSection
                        title="Breakfast"
                        meal={dayPlan.meals.breakfast}
                        icon="🍳"
                      />
                      <div className="h-px bg-gray-100" />
                      <MealSection
                        title="Lunch"
                        meal={dayPlan.meals.lunch}
                        icon="🥗"
                      />
                      <div className="h-px bg-gray-100" />
                      <MealSection
                        title="Dinner"
                        meal={dayPlan.meals.dinner}
                        icon="🍽️"
                      />
                      <div className="h-px bg-gray-100" />
                      <MealSection
                        title="Snacks"
                        meal={dayPlan.meals.snacks}
                        icon="🥪"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <Button
              onClick={downloadMealPlan}
              className="bg-blue-600 text-white px-8 py-6 rounded-full hover:bg-blue-700"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Meal Plan
            </Button>
            <Button
              onClick={() => {}}
              variant="outline"
              className="px-8 py-6 rounded-full"
            >
              <Apple className="w-5 h-5 mr-2" />
              Sync with Health
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 