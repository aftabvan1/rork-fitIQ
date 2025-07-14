export type ThemeMode = 'light' | 'dark';

export interface Food {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  barcode?: string;
  image?: string;
}

export interface MealEntry {
  id: string;
  food: Food;
  quantity: number;
  mealType: MealType;
  date: string; // ISO string
  createdAt: string; // ISO string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: NutritionGoals;
  isPremium: boolean;
  premiumUntil?: string; // ISO string
  theme: ThemeMode;
}

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: {
    breakfast: MealEntry[];
    lunch: MealEntry[];
    dinner: MealEntry[];
    snack: MealEntry[];
  };
}

export interface ScanResult {
  food: Food;
  confidence?: number;
}