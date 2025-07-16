import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getDailyNutritionProcedure = publicProcedure
  .input(z.object({ date: z.string() }))
  .query(({ input }: { input: { date: string } }) => {
    // Mock data for now
    return {
      date: input.date,
      totalCalories: 1850,
      totalProtein: 120,
      totalCarbs: 180,
      totalFat: 65,
      totalFiber: 25,
      totalSugar: 45,
      totalSodium: 2100,
      meals: {
        breakfast: {
          calories: 450,
          protein: 25,
          carbs: 45,
          fat: 18,
          items: []
        },
        lunch: {
          calories: 650,
          protein: 35,
          carbs: 70,
          fat: 22,
          items: []
        },
        dinner: {
          calories: 600,
          protein: 45,
          carbs: 50,
          fat: 20,
          items: []
        },
        snack: {
          calories: 150,
          protein: 15,
          carbs: 15,
          fat: 5,
          items: []
        }
      }
    };
  });