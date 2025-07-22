import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const updateWorkoutProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      date: z.string().optional(),
      duration: z.number().optional(),
      exercises: z
        .array(
          z.object({
            name: z.string(),
            sets: z.array(
              z.object({
                reps: z.number(),
                weight: z.number(),
              })
            ),
          })
        )
        .optional(),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would update the workout in the database.
    // For this example, we'll just return the updated data.
    return {
      updatedWorkout: input,
    };
  });
