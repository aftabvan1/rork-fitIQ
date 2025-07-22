import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { searchFoodInOpenFoodFacts } from "@/services/openfoodfacts";

const searchFoodSchema = z.object({ query: z.string() });

export const searchFoodProcedure = publicProcedure
  .input(searchFoodSchema)
  .query(async ({ input }) => {
    try {
      // First try OpenFoodFacts API
      const openFoodFactsResults = await searchFoodInOpenFoodFacts(input.query, 10);
      
      if (openFoodFactsResults.length > 0) {
        return {
          success: true,
          data: openFoodFactsResults
        };
      }
      
      // Fallback to mock results if no OpenFoodFacts results
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
    } catch (error) {
      console.error('Search food error:', error);
      return {
        success: false,
        error: 'Failed to search food',
        data: []
      };
    }
  });