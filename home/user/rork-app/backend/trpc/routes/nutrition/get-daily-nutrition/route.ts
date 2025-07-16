import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const createEmptyDailyNutrition = (date: string) => ({
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

export const getDailyNutritionProcedure = publicProcedure
  .input(z.object({ date: z.string() }))
  .query(({ input }) => {
    const { date } = input;
    
    // In a real app, this would fetch from a database
    // For now, return empty nutrition data
    return {
      success: true,
      data: createEmptyDailyNutrition(date)
    };
  });