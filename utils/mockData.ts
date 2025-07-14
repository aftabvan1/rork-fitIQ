// This file is now deprecated - all data should come from the backend API
// Keeping for backward compatibility during migration

import { Food, MealEntry, MealType } from '@/types';

// Fallback data for offline mode or API failures
export const fallbackFoods: Food[] = [
  {
    id: '1',
    name: 'Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    servingSize: 1,
    servingUnit: 'medium',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=500',
  },
  {
    id: '2',
    name: 'Greek Yogurt',
    brand: 'Fage',
    calories: 130,
    protein: 18,
    carbs: 6,
    fat: 4,
    servingSize: 170,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500',
  },
  {
    id: '3',
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=500',
  },
];

// Deprecated - use API instead
export const mockFoods = fallbackFoods;

export const createMockMealEntry = (
  foodId: string,
  mealType: MealType,
  date: string,
  quantity: number = 1
): MealEntry => {
  const food = fallbackFoods.find((f) => f.id === foodId);
  if (!food) throw new Error(`Food with id ${foodId} not found`);
  
  return {
    id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    food,
    quantity,
    mealType,
    date,
    createdAt: new Date().toISOString(),
  };
};

export const generateMockScanResult = (barcode: string): Food | null => {
  // Fallback for offline mode
  const mockBarcodeMap: Record<string, string> = {
    '888849000166': '8', // Quest protein bar
  };
  
  const foodId = mockBarcodeMap[barcode];
  if (!foodId) return null;
  
  return fallbackFoods.find((f) => f.id === foodId) || null;
};