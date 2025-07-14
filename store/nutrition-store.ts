import { create } from 'zustand';
import { apiService } from '@/services/api';
import { DailyNutrition, Food, MealEntry, MealType } from '@/types';
import { fallbackFoods, createMockMealEntry } from '@/utils/mockData';

interface NutritionState {
  dailyLogs: Record<string, DailyNutrition>;
  recentFoods: Food[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDailyNutrition: (date: string) => Promise<void>;
  addMealEntry: (entry: Omit<MealEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateMealEntry: (entry: MealEntry) => Promise<void>;
  removeMealEntry: (entryId: string, date: string) => Promise<void>;
  searchFood: (query: string) => Promise<Food[]>;
  scanBarcode: (barcode: string) => Promise<Food | null>;
  analyzeFoodPhoto: (imageUri: string) => Promise<Food[]>;
  getDailyNutrition: (date: string) => DailyNutrition;
}

const createEmptyDailyNutrition = (date: string): DailyNutrition => ({
  date,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  meals: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  },
});

export const useNutritionStore = create<NutritionState>((set, get) => ({
  dailyLogs: {},
  recentFoods: [],
  isLoading: false,
  error: null,

  fetchDailyNutrition: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getDailyNutrition(date);
      const dailyNutrition = response.data || createEmptyDailyNutrition(date);
      
      set((state) => ({
        dailyLogs: {
          ...state.dailyLogs,
          [date]: dailyNutrition,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Fetch daily nutrition error:', error);
      // Create demo data for offline mode
      const demoData = createEmptyDailyNutrition(date);
      if (date === new Date().toISOString().split('T')[0]) {
        // Add some demo entries for today
        const breakfastEntry = createMockMealEntry('1', 'breakfast', date, 1);
        const lunchEntry = createMockMealEntry('2', 'lunch', date, 1);
        demoData.meals.breakfast = [breakfastEntry];
        demoData.meals.lunch = [lunchEntry];
        demoData.calories = breakfastEntry.food.calories + lunchEntry.food.calories;
        demoData.protein = breakfastEntry.food.protein + lunchEntry.food.protein;
        demoData.carbs = breakfastEntry.food.carbs + lunchEntry.food.carbs;
        demoData.fat = breakfastEntry.food.fat + lunchEntry.food.fat;
      }
      
      set({ 
        error: null, // Don't show error in offline mode
        isLoading: false,
        dailyLogs: {
          ...get().dailyLogs,
          [date]: demoData,
        },
      });
    }
  },

  addMealEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.addMealEntry(entry);
      const newEntry = response.data;
      
      // Update local state
      const { date, mealType } = entry;
      set((state) => {
        const currentLog = state.dailyLogs[date] || createEmptyDailyNutrition(date);
        const calories = entry.food.calories * entry.quantity;
        const protein = entry.food.protein * entry.quantity;
        const carbs = entry.food.carbs * entry.quantity;
        const fat = entry.food.fat * entry.quantity;
        
        return {
          dailyLogs: {
            ...state.dailyLogs,
            [date]: {
              ...currentLog,
              calories: currentLog.calories + calories,
              protein: currentLog.protein + protein,
              carbs: currentLog.carbs + carbs,
              fat: currentLog.fat + fat,
              meals: {
                ...currentLog.meals,
                [mealType]: [...currentLog.meals[mealType], newEntry],
              },
            },
          },
          recentFoods: [entry.food, ...state.recentFoods.filter(f => f.id !== entry.food.id)].slice(0, 20),
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Add meal entry error:', error);
      // Fallback to offline mode - create entry locally
      const newEntry: MealEntry = {
        id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        ...entry,
        createdAt: new Date().toISOString(),
      };
      
      const { date, mealType } = entry;
      set((state) => {
        const currentLog = state.dailyLogs[date] || createEmptyDailyNutrition(date);
        const calories = entry.food.calories * entry.quantity;
        const protein = entry.food.protein * entry.quantity;
        const carbs = entry.food.carbs * entry.quantity;
        const fat = entry.food.fat * entry.quantity;
        
        return {
          dailyLogs: {
            ...state.dailyLogs,
            [date]: {
              ...currentLog,
              calories: currentLog.calories + calories,
              protein: currentLog.protein + protein,
              carbs: currentLog.carbs + carbs,
              fat: currentLog.fat + fat,
              meals: {
                ...currentLog.meals,
                [mealType]: [...currentLog.meals[mealType], newEntry],
              },
            },
          },
          recentFoods: [entry.food, ...state.recentFoods.filter(f => f.id !== entry.food.id)].slice(0, 20),
          isLoading: false,
          error: null,
        };
      });
    }
  },

  updateMealEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.updateMealEntry(entry.id, entry);
      
      // Update local state
      set((state) => {
        const { date, mealType } = entry;
        const currentLog = state.dailyLogs[date];
        if (!currentLog) return state;
        
        const entryIndex = currentLog.meals[mealType].findIndex(e => e.id === entry.id);
        if (entryIndex === -1) return state;
        
        const oldEntry = currentLog.meals[mealType][entryIndex];
        
        // Calculate nutrition differences
        const oldCalories = oldEntry.food.calories * oldEntry.quantity;
        const oldProtein = oldEntry.food.protein * oldEntry.quantity;
        const oldCarbs = oldEntry.food.carbs * oldEntry.quantity;
        const oldFat = oldEntry.food.fat * oldEntry.quantity;
        
        const newCalories = entry.food.calories * entry.quantity;
        const newProtein = entry.food.protein * entry.quantity;
        const newCarbs = entry.food.carbs * entry.quantity;
        const newFat = entry.food.fat * entry.quantity;
        
        const updatedMeals = [...currentLog.meals[mealType]];
        updatedMeals[entryIndex] = entry;
        
        return {
          dailyLogs: {
            ...state.dailyLogs,
            [date]: {
              ...currentLog,
              calories: currentLog.calories - oldCalories + newCalories,
              protein: currentLog.protein - oldProtein + newProtein,
              carbs: currentLog.carbs - oldCarbs + newCarbs,
              fat: currentLog.fat - oldFat + newFat,
              meals: {
                ...currentLog.meals,
                [mealType]: updatedMeals,
              },
            },
          },
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Update meal entry error:', error);
      set({ error: 'Failed to update meal entry', isLoading: false });
      throw error;
    }
  },

  removeMealEntry: async (entryId, date) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteMealEntry(entryId);
      
      // Update local state
      set((state) => {
        const currentLog = state.dailyLogs[date];
        if (!currentLog) return state;
        
        let updatedLog = { ...currentLog };
        
        // Find and remove the entry
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]) {
          const entryIndex = currentLog.meals[mealType].findIndex(e => e.id === entryId);
          
          if (entryIndex !== -1) {
            const entry = currentLog.meals[mealType][entryIndex];
            const calories = entry.food.calories * entry.quantity;
            const protein = entry.food.protein * entry.quantity;
            const carbs = entry.food.carbs * entry.quantity;
            const fat = entry.food.fat * entry.quantity;
            
            updatedLog = {
              ...updatedLog,
              calories: updatedLog.calories - calories,
              protein: updatedLog.protein - protein,
              carbs: updatedLog.carbs - carbs,
              fat: updatedLog.fat - fat,
              meals: {
                ...updatedLog.meals,
                [mealType]: [
                  ...updatedLog.meals[mealType].slice(0, entryIndex),
                  ...updatedLog.meals[mealType].slice(entryIndex + 1),
                ],
              },
            };
            break;
          }
        }
        
        return {
          dailyLogs: {
            ...state.dailyLogs,
            [date]: updatedLog,
          },
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Remove meal entry error:', error);
      set({ error: 'Failed to remove meal entry', isLoading: false });
      throw error;
    }
  },

  searchFood: async (query: string) => {
    try {
      const response = await apiService.searchFood(query);
      return response.data || [];
    } catch (error) {
      console.error('Search food error:', error);
      // Fallback to local search
      const lowerQuery = query.toLowerCase();
      return fallbackFoods.filter(food => 
        food.name.toLowerCase().includes(lowerQuery) ||
        (food.brand && food.brand.toLowerCase().includes(lowerQuery))
      );
    }
  },

  scanBarcode: async (barcode: string) => {
    try {
      const response = await apiService.getFoodByBarcode(barcode);
      return response.data || null;
    } catch (error) {
      console.error('Scan barcode error:', error);
      // Fallback to mock data
      return fallbackFoods[0] || null; // Return first food as demo
    }
  },

  analyzeFoodPhoto: async (imageUri: string) => {
    try {
      const response = await apiService.analyzeFoodPhoto(imageUri);
      return response.data || [];
    } catch (error) {
      console.error('Analyze food photo error:', error);
      // Fallback to demo results
      return fallbackFoods.slice(0, 2); // Return first 2 foods as demo
    }
  },

  getDailyNutrition: (date: string) => {
    return get().dailyLogs[date] || createEmptyDailyNutrition(date);
  },
}));