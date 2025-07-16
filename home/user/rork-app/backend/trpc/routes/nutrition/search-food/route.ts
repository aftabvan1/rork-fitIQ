import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const searchFoodProcedure = publicProcedure
  .input(z.object({ query: z.string() }))
  .query(({ input }: { input: { query: string } }) => {
    // Mock search results for now
    const mockResults = [
      {
        id: '1',
        name: 'Apple',
        brand: 'Generic',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        fiber: 4,
        sugar: 19,
        sodium: 2,
        servingSize: '1 medium (182g)'
      },
      {
        id: '2',
        name: 'Banana',
        brand: 'Generic',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        fiber: 3,
        sugar: 14,
        sodium: 1,
        servingSize: '1 medium (118g)'
      }
    ];

    return mockResults.filter(item => 
      item.name.toLowerCase().includes(input.query.toLowerCase())
    );
  });