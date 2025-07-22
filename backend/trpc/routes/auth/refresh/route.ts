import { publicProcedure } from "../../../create-context";

export const refreshProcedure = publicProcedure.mutation(async () => {
  // In a real application, you would validate the existing token and issue a new one.
  // For this example, we'll just return a new mock token.
  const token = "new-mock-jwt-token";

  return {
    token,
  };
});
