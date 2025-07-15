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
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove meal entry',
        isLoading: false 
      });
      throw error;
    }
  },

  searchFood: async (query: string) => {
    try {
      const response = await apiService.searchFood(query);
      return response.data || [];
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
      const response = await apiService.getFoodByBarcode(barcode);
      return response.data || null;
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

      // Use external AI service for food analysis
      const aiResponse = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition expert. Analyze the food image and return a JSON array of foods you can identify. Each food should have: id (generate a unique string), name, brand (if applicable, otherwise null), calories (per 100g), protein (per 100g), carbs (per 100g), fat (per 100g), fiber (per 100g), sugar (per 100g), sodium (per 100g), servingSize (typical serving in grams), servingUnit (e.g., "1 cup", "1 piece"). Only return the JSON array, no other text.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this food image and identify the foods present.'
                },
                {
                  type: 'image',
                  image: base64
                }
              ]
            }
          ]
        }),
      });
      
      if (!aiResponse.ok) {
        throw new Error('AI service unavailable');
      }
      
      const aiData = await aiResponse.json();
      const foodsText = aiData.completion;
      
      try {
        // Parse the JSON response from AI
        const foods = JSON.parse(foodsText);
        return Array.isArray(foods) ? foods : [];
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to demo results
        return fallbackFoods.slice(0, 2);
      }
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