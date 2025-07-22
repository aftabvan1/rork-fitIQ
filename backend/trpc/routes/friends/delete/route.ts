import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const removeFriendProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would remove the friend from the database.
    // For this example, we'll just return a success message.
    return {
      message: `Friend with id ${input.id} removed successfully.`,
    };
  });
