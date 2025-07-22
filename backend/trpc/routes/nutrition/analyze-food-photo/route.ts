import { z } from "zod";
import { publicProcedure } from "../../create-context";

// Mock food recognition results - in a real app this would use AI/ML services
const mockFoodRecognitionResults = [
  {
    id: "apple_detected",
    name: "Apple",
    brand: "Fresh",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10,
    sodium: 1,
    servingSize: 100,
    servingUnit: "100g"
  },
  {
    id: "banana_detected",
    name: "Banana",
    brand: "Fresh",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12,
    sodium: 1,
    servingSize: 100,
    servingUnit: "100g"
  },
  {
    id: "chicken_detected",
    name: "Grilled Chicken Breast",
    brand: "Prepared",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    servingSize: 100,
    servingUnit: "100g"
  }
];

async function analyzePhotoWithAI(imageUri: string) {
  try {
    // In a real app, you would send the image to an AI service
    // For now, return a random mock result
    const randomIndex = Math.floor(Math.random() * mockFoodRecognitionResults.length);
    const randomResult = mockFoodRecognitionResults[randomIndex];
    
    // Add some randomness to make it feel more realistic
    const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence
    
    return [{
      ...randomResult,
      id: `${randomResult.id}_${Date.now()}`,
      confidence
    }];
  } catch (error) {
    console.error('AI photo analysis error:', error);
    throw new Error('Failed to analyze photo');
  }
}

export const analyzeFoodPhotoProcedure = publicProcedure
  .input(z.object({ 
    imageUri: z.string(),
    options: z.object({
      maxResults: z.number().optional().default(3)
    }).optional()
  }))
  .mutation(async ({ input }: { input: { imageUri: string; options?: { maxResults?: number } } }) => {
    const { imageUri, options = {} } = input;
    const { maxResults = 3 } = options;
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const results = await analyzePhotoWithAI(imageUri);
      
      return {
        success: true,
        data: results.slice(0, maxResults)
      };
    } catch (error) {
      console.error('Photo analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze photo',
        data: []
      };
    }
  });