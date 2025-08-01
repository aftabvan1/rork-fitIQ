import { z } from "zod";
import { publicProcedure } from "../../create-context";

// Simple in-memory storage - in a real app this would be a database
const mealEntries: any[] = [];
const dailyNutritionCache: Record<string, any> = {};

const addMealEntrySchema = z.object({
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
  date: z.string()
});

export const addMealEntryProcedure = publicProcedure
  .input(addMealEntrySchema)
  .mutation(({ input }: { input: z.infer<typeof addMealEntrySchema> }) => {
    const entry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      createdAt: new Date().toISOString()
    };
    
    mealEntries.push(entry);
    
    return {
      success: true,
      data: entry
    };
  });