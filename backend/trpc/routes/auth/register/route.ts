import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const registerProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would create a new user in the database.
    // For this example, we'll just return a mock user and token.
    const user = {
      id: "1",
      name: input.name,
      email: input.email,
      isPremium: false,
    };
    const token = "mock-jwt-token";

    return {
      user,
      token,
    };
  });
