import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const mealEntrySchema = z.object({
  foodName: z.string(),
  quantity: z.number(),
  unit: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
  date: z.string(),
});

export default publicProcedure
  .input(mealEntrySchema)
  .mutation(({ input }) => {
    // In a real app, this would save to a database
    // For now, we'll just return a success response with the entry
    const entry = {
      id: `entry_${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Adding meal entry:', entry);

    return {
      success: true,
      data: entry,
      message: 'Meal entry added successfully',
    };
  });