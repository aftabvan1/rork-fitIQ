import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const createWorkoutProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      date: z.string(),
      duration: z.number(),
      exercises: z.array(
        z.object({
          name: z.string(),
          sets: z.array(
            z.object({
              reps: z.number(),
              weight: z.number(),
            })
          ),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would create a new workout in the database.
    // For this example, we'll just return the created workout.
    return {
      createdWorkout: {
        id: "new-workout-id",
        ...input,
      },
    };
  });
