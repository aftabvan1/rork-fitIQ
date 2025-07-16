import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getDailyNutritionProcedure = publicProcedure
  .input(z.object({ date: z.string() }))
  .query(({ input }: { input: { date: string } }) => {
    // Mock daily nutrition data - in a real app this would query the database
    const mockNutrition = {
      date: input.date,
      totalCalories: 1850,
      totalProtein: 125,
      totalCarbs: 180,
      totalFat: 65,
      totalFiber: 28,
      totalSugar: 45,
      totalSodium: 1200,
      goals: {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 70
      },
      meals: {
        breakfast: {
          calories: 450,
          protein: 25,
          carbs: 45,
          fat: 18,
          entries: []
        },
        lunch: {
          calories: 650,
          protein: 35,
          carbs: 60,
          fat: 22,
          entries: []
        },
        dinner: {
          calories: 550,
          protein: 45,
          carbs: 50,
          fat: 18,
          entries: []
        },
        snack: {
          calories: 200,
          protein: 20,
          carbs: 25,
          fat: 7,
          entries: []
        }
      }
    };
    
    return {
      success: true,
      data: mockNutrition
    };
  });