import { publicProcedure } from "../../../../create-context";
import { z } from "zod";

export const sendFriendRequestProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would create a new friend request in the database.
    // For this example, we'll just return a success message.
    return {
      message: `Friend request sent to ${input.email}.`,
    };
  });
