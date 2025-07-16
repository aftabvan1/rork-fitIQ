import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const mealEntrySchema = z.object({
  foodName: z.string(),
  quantity: z.number(),
  unit: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
  date: z.string(),
});

export const addMealEntryProcedure = publicProcedure
  .input(mealEntrySchema)
  .mutation(({ input }) => {
    // In a real app, this would save to a database
    // For now, just return a mock response
    const id = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      data: {
        id,
        ...input,
        createdAt: new Date().toISOString(),
      }
    };
  });