import { z } from "zod";
import { publicProcedure } from "../../create-context";

const searchFoodSchema = z.object({ query: z.string() });

export const searchFoodProcedure = publicProcedure
  .input(searchFoodSchema)
  .query(({ input }: { input: z.infer<typeof searchFoodSchema> }) => {
    // Mock food search results - in a real app this would query a food database
    const mockResults = [
      {
        id: "apple_1",
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
        id: "banana_1",
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
        id: "chicken_1",
        name: "Chicken Breast",
        brand: "Fresh",
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
    
    // Filter results based on query
    const filteredResults = mockResults.filter(food => 
      food.name.toLowerCase().includes(input.query.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(input.query.toLowerCase()))
    );
    
    return {
      success: true,
      data: filteredResults
    };
  });