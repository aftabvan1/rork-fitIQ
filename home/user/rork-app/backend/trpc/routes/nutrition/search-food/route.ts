import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const searchFoodProcedure = publicProcedure
  .input(z.object({ query: z.string() }))
  .query(({ input }: { input: { query: string } }) => {
    // In a real app, this would search a food database
    // For now, return mock search results
    const mockResults = [
      {
        id: "apple_001",
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
        id: "banana_001", 
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
      }
    ];

    const filteredResults = mockResults.filter(food => 
      food.name.toLowerCase().includes(input.query.toLowerCase())
    );

    return {
      success: true,
      data: filteredResults
    };
  });