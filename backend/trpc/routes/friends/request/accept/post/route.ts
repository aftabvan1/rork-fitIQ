import { publicProcedure } from "../../../../../create-context";
import { z } from "zod";

export const acceptFriendRequestProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would accept the friend request in the database.
    // For this example, we'll just return a success message.
    return {
      message: `Friend request with id ${input.id} accepted.`,
    };
  });
