import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would verify the user's credentials against a database.
    // For this example, we'll just return a mock user and token.
    const user = {
      id: "1",
      email: input.email,
      name: "Test User",
      isPremium: false,
    };
    const token = "mock-jwt-token";

    return {
      user,
      token,
    };
  });
