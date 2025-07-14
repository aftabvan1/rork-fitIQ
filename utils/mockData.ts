import { Food, MealEntry, MealType } from '@/types';

export const mockFoods: Food[] = [
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
  {
    id: '4',
    name: 'Avocado',
    calories: 240,
    protein: 3,
    carbs: 12,
    fat: 22,
    servingSize: 1,
    servingUnit: 'medium',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=500',
  },
  {
    id: '5',
    name: 'Salmon',
    calories: 206,
    protein: 22,
    carbs: 0,
    fat: 13,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=500',
  },
  {
    id: '6',
    name: 'Quinoa',
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    servingSize: 100,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=500',
  },
  {
    id: '7',
    name: 'Almond Butter',
    brand: 'Justin\'s',
    calories: 190,
    protein: 7,
    carbs: 7,
    fat: 16,
    servingSize: 32,
    servingUnit: 'g',
    image: 'https://images.unsplash.com/photo-1612540943771-0f492d9be669?q=80&w=500',
  },
  {
    id: '8',
    name: 'Protein Bar',
    brand: 'Quest',
    calories: 190,
    protein: 20,
    carbs: 21,
    fat: 8,
    servingSize: 60,
    servingUnit: 'g',
    barcode: '888849000166',
    image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?q=80&w=500',
  },
];

export const createMockMealEntry = (
  foodId: string,
  mealType: MealType,
  date: string,
  quantity: number = 1
): MealEntry => {
  const food = mockFoods.find((f) => f.id === foodId);
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

export const mockMealEntries: MealEntry[] = [
  createMockMealEntry('1', 'breakfast', new Date().toISOString().split('T')[0]),
  createMockMealEntry('2', 'breakfast', new Date().toISOString().split('T')[0]),
  createMockMealEntry('3', 'lunch', new Date().toISOString().split('T')[0]),
  createMockMealEntry('5', 'dinner', new Date().toISOString().split('T')[0]),
];

export const generateMockScanResult = (barcode: string): Food | null => {
  // In a real app, this would call an API
  const mockBarcodeMap: Record<string, string> = {
    '888849000166': '8', // Quest protein bar
  };
  
  const foodId = mockBarcodeMap[barcode];
  if (!foodId) return null;
  
  return mockFoods.find((f) => f.id === foodId) || null;
};