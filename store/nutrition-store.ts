import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DailyNutrition, Food, MealEntry, MealType } from '@/types';

interface NutritionState {
  dailyLogs: Record<string, DailyNutrition>;
  recentFoods: Food[];
  addMealEntry: (entry: Omit<MealEntry, 'id' | 'createdAt'>) => void;
  removeMealEntry: (entryId: string, date: string) => void;
  updateMealEntry: (entry: MealEntry) => void;
  addRecentFood: (food: Food) => void;
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

// Generate unique ID with timestamp and random string
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      dailyLogs: {},
      recentFoods: [],
      
      addMealEntry: (entry) => {
        const { date, food, quantity, mealType } = entry;
        const id = generateUniqueId();
        const createdAt = new Date().toISOString();
        const newEntry: MealEntry = { ...entry, id, createdAt };
        
        set((state) => {
          const currentLog = state.dailyLogs[date] || createEmptyDailyNutrition(date);
          
          // Calculate nutrition totals
          const calories = food.calories * quantity;
          const protein = food.protein * quantity;
          const carbs = food.carbs * quantity;
          const fat = food.fat * quantity;
          
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
          };
        });
        
        // Add to recent foods
        get().addRecentFood(food);
      },
      
      removeMealEntry: (entryId, date) => {
        set((state) => {
          const currentLog = state.dailyLogs[date];
          if (!currentLog) return state;
          
          let updatedLog = { ...currentLog };
          
          // Find and remove the entry
          for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]) {
            const entryIndex = currentLog.meals[mealType].findIndex(
              (entry) => entry.id === entryId
            );
            
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
          };
        });
      },
      
      updateMealEntry: (updatedEntry) => {
        set((state) => {
          const { date, id, mealType } = updatedEntry;
          const currentLog = state.dailyLogs[date];
          if (!currentLog) return state;
          
          let updatedLog = { ...currentLog };
          
          // Find the entry to update
          const entryIndex = currentLog.meals[mealType].findIndex(
            (entry) => entry.id === id
          );
          
          if (entryIndex !== -1) {
            const oldEntry = currentLog.meals[mealType][entryIndex];
            
            // Calculate nutrition differences
            const oldCalories = oldEntry.food.calories * oldEntry.quantity;
            const oldProtein = oldEntry.food.protein * oldEntry.quantity;
            const oldCarbs = oldEntry.food.carbs * oldEntry.quantity;
            const oldFat = oldEntry.food.fat * oldEntry.quantity;
            
            const newCalories = updatedEntry.food.calories * updatedEntry.quantity;
            const newProtein = updatedEntry.food.protein * updatedEntry.quantity;
            const newCarbs = updatedEntry.food.carbs * updatedEntry.quantity;
            const newFat = updatedEntry.food.fat * updatedEntry.quantity;
            
            updatedLog = {
              ...updatedLog,
              calories: updatedLog.calories - oldCalories + newCalories,
              protein: updatedLog.protein - oldProtein + newProtein,
              carbs: updatedLog.carbs - oldCarbs + newCarbs,
              fat: updatedLog.fat - oldFat + newFat,
              meals: {
                ...updatedLog.meals,
                [mealType]: [
                  ...updatedLog.meals[mealType].slice(0, entryIndex),
                  updatedEntry,
                  ...updatedLog.meals[mealType].slice(entryIndex + 1),
                ],
              },
            };
          }
          
          return {
            dailyLogs: {
              ...state.dailyLogs,
              [date]: updatedLog,
            },
          };
        });
      },
      
      addRecentFood: (food) => {
        set((state) => {
          // Check if food already exists in recent foods
          const existingIndex = state.recentFoods.findIndex(
            (item) => item.id === food.id
          );
          
          let updatedRecentFoods;
          if (existingIndex !== -1) {
            // Move to the front if it exists
            updatedRecentFoods = [
              food,
              ...state.recentFoods.slice(0, existingIndex),
              ...state.recentFoods.slice(existingIndex + 1),
            ];
          } else {
            // Add to the front, limit to 20 items
            updatedRecentFoods = [food, ...state.recentFoods].slice(0, 20);
          }
          
          return { recentFoods: updatedRecentFoods };
        });
      },
      
      getDailyNutrition: (date) => {
        return get().dailyLogs[date] || createEmptyDailyNutrition(date);
      },
    }),
    {
      name: 'nutrition-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);