import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const updateMealEntryProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      foodName: z.string(),
      quantity: z.number(),
      unit: z.string(),
      mealType: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      date: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would update the meal entry in the database.
    // For this example, we'll just return the updated data.
    return {
      updatedMealEntry: input,
    };
  });
