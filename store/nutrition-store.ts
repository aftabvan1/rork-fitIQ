import { create } from 'zustand';
import { trpcClient } from '@/lib/trpc';
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
  clearError: () => void;
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
      const response = await trpcClient.nutrition.getDailyNutrition.query({ date });
      // Convert backend response to our DailyNutrition format
      const backendData = response.data;
      const dailyNutrition: DailyNutrition = backendData ? {
        date: backendData.date,
        calories: backendData.totalCalories || 0,
        protein: backendData.totalProtein || 0,
        carbs: backendData.totalCarbs || 0,
        fat: backendData.totalFat || 0,
        meals: {
          breakfast: backendData.meals?.breakfast?.entries || [],
          lunch: backendData.meals?.lunch?.entries || [],
          dinner: backendData.meals?.dinner?.entries || [],
          snack: backendData.meals?.snack?.entries || [],
        },
      } : createEmptyDailyNutrition(date);
      
      set((state) => ({
        dailyLogs: {
          ...state.dailyLogs,
          [date]: dailyNutrition,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Fetch daily nutrition error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch nutrition data',
        isLoading: false,
        dailyLogs: {
          ...get().dailyLogs,
          [date]: createEmptyDailyNutrition(date),
        },
      });
    }
  },

  addMealEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      // Convert the entry to the format expected by tRPC
      const mealEntryData = {
        foodId: entry.food.id,
        name: entry.food.name,
        brand: (entry.food as any).brand || undefined,
        calories: entry.food.calories,
        protein: entry.food.protein,
        carbs: entry.food.carbs,
        fat: entry.food.fat,
        fiber: (entry.food as any).fiber || 0,
        sugar: (entry.food as any).sugar || 0,
        sodium: (entry.food as any).sodium || 0,
        servingSize: entry.food.servingSize,
        servingUnit: entry.food.servingUnit,
        quantity: entry.quantity,
        mealType: entry.mealType,
        date: entry.date,
      };
      
      const response = await trpcClient.nutrition.addMealEntry.mutate(mealEntryData);
      const newEntry: MealEntry = {
        id: response.data.id,
        food: entry.food,
        quantity: entry.quantity,
        mealType: entry.mealType,
        date: entry.date,
        createdAt: response.data.createdAt,
      };
      
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
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add meal entry',
        isLoading: false 
      });
      throw error;
    }
  },

  updateMealEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      // For now, just update locally since we don't have update endpoint in tRPC yet
      // await trpcClient.nutrition.updateMealEntry.mutate({ id: entry.id, ...entry });
      
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
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update meal entry',
        isLoading: false 
      });
      throw error;
    }
  },

  removeMealEntry: async (entryId, date) => {
    set({ isLoading: true, error: null });
    try {
      // For now, just update locally since we don't have delete endpoint in tRPC yet
      // await trpcClient.nutrition.deleteMealEntry.mutate({ id: entryId });
      
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
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove meal entry',
        isLoading: false 
      });
      throw error;
    }
  },

  searchFood: async (query: string) => {
    try {
      const response = await trpcClient.nutrition.searchFood.query({ query });
      // Convert the response to match our Food interface
      const foods: Food[] = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        servingSize: 100, // Default to 100g
        servingUnit: item.servingSize || '100g',
      }));
      return foods;
    } catch (error) {
      console.error('Search food error:', error);
      // Fallback to local search only if backend is unavailable
      const lowerQuery = query.toLowerCase();
      return fallbackFoods.filter(food => 
        food.name.toLowerCase().includes(lowerQuery) ||
        (food.brand && food.brand.toLowerCase().includes(lowerQuery))
      );
    }
  },

  scanBarcode: async (barcode: string) => {
    try {
      const response = await trpcClient.nutrition.scanBarcode.query({ barcode });
      if (response.success && response.data) {
        // Convert the response to match our Food interface
        const food: Food = {
          id: response.data.id,
          name: response.data.name,
          brand: response.data.brand,
          calories: response.data.calories,
          protein: response.data.protein,
          carbs: response.data.carbs,
          fat: response.data.fat,
          servingSize: response.data.servingSize,
          servingUnit: response.data.servingUnit,
        };
        return food;
      }
      return null;
    } catch (error) {
      console.error('Scan barcode error:', error);
      // Fallback to mock data only if backend is unavailable
      return fallbackFoods[0] || null;
    }
  },

  analyzeFoodPhoto: async (imageUri: string) => {
    try {
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.readAsDataURL(blob);
      });

      // Use backend tRPC endpoint for food analysis
      const analysisResponse = await trpcClient.nutrition.analyzeFoodPhoto.mutate({
        imageUri: imageUri,
        options: { maxResults: 5 }
      });
      
      if (analysisResponse.success && analysisResponse.data) {
        // Convert the response to match our Food interface
        const foods: Food[] = analysisResponse.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          servingSize: item.servingSize,
          servingUnit: item.servingUnit,
        }));
        return foods;
      }
      
      // Fallback to demo results if no foods found
      return fallbackFoods.slice(0, 2);
    } catch (error) {
      console.error('Analyze food photo error:', error);
      // Fallback to demo results
      return fallbackFoods.slice(0, 2);
    }
  },

  getDailyNutrition: (date: string) => {
    return get().dailyLogs[date] || createEmptyDailyNutrition(date);
  },

  clearError: () => set({ error: null }),
}));