import { publicProcedure } from "../../../../create-context";
import { z } from "zod";

export const uploadProfilePictureProcedure = publicProcedure
  .input(
    z.object({
      image: z.string(), // base64 encoded image
    })
  )
  .mutation(async ({ input }) => {
    // In a real application, you would upload the image to a storage service like S3.
    // For this example, we'll just return a mock URL.
    const imageUrl = "https://example.com/new-profile.jpg";

    return {
      imageUrl,
    };
  });
