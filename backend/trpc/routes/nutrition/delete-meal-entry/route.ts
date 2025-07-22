import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const deleteMealEntryProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would delete the meal entry from the database.
    // For this example, we'll just return a success message.
    return {
      message: `Meal entry with id ${input.id} deleted successfully.`,
    };
  });
