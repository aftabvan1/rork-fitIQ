import { publicProcedure } from "../../../../create-context";
import { z } from "zod";

export const createSubscriptionProcedure = publicProcedure
  .input(
    z.object({
      plan: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would create a new subscription with a payment provider.
    // For this example, we'll just return a success message.
    return {
      message: `Subscription to ${input.plan} plan created successfully.`,
    };
  });
