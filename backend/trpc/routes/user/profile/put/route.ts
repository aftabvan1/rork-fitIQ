import { publicProcedure } from "../../../../create-context";
import { z } from "zod";

export const updateProfileProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(2).optional(),
      weight: z.number().optional(),
      height: z.number().optional(),
      age: z.number().optional(),
      goals: z
        .object({
          calories: z.number().optional(),
          protein: z.number().optional(),
          carbs: z.number().optional(),
          fat: z.number().optional(),
        })
        .optional(),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would update the user's profile in the database.
    // For this example, we'll just return the updated data.
    return {
      updatedProfile: input,
    };
  });
