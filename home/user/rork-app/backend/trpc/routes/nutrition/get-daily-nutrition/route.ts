import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getDailyNutritionProcedure = publicProcedure
  .input(z.object({ date: z.string() }))
  .query(({ input }: { input: { date: string } }) => {
    // In a real app, this would fetch from a database
    // For now, return mock data
    return {
      success: true,
      data: {
        date: input.date,
        totalCalories: 1850,
        totalProtein: 95,
        totalCarbs: 220,
        totalFat: 65,
        totalFiber: 28,
        totalSugar: 45,
        totalSodium: 2100,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        }
      }
    };
  });