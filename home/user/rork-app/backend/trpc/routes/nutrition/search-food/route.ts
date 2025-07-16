import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ query: z.string() }))
  .query(({ input }) => {
    // In a real app, this would search a food database
    // For now, we'll return mock search results
    const mockFoods = [
      {
        id: 'food_1',
        name: 'Chicken Breast',
        brand: 'Generic',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74,
        servingSize: '100g',
      },
      {
        id: 'food_2',
        name: 'Brown Rice',
        brand: 'Generic',
        calories: 111,
        protein: 2.6,
        carbs: 23,
        fat: 0.9,
        fiber: 1.8,
        sugar: 0.4,
        sodium: 5,
        servingSize: '100g',
      },
      {
        id: 'food_3',
        name: 'Broccoli',
        brand: 'Generic',
        calories: 34,
        protein: 2.8,
        carbs: 7,
        fat: 0.4,
        fiber: 2.6,
        sugar: 1.5,
        sodium: 33,
        servingSize: '100g',
      },
      {
        id: 'food_4',
        name: 'Greek Yogurt',
        brand: 'Generic',
        calories: 59,
        protein: 10,
        carbs: 3.6,
        fat: 0.4,
        fiber: 0,
        sugar: 3.6,
        sodium: 36,
        servingSize: '100g',
      },
      {
        id: 'food_5',
        name: 'Banana',
        brand: 'Generic',
        calories: 89,
        protein: 1.1,
        carbs: 23,
        fat: 0.3,
        fiber: 2.6,
        sugar: 12,
        sodium: 1,
        servingSize: '1 medium (118g)',
      }
    ];

    // Filter foods based on query
    const filteredFoods = mockFoods.filter(food =>
      food.name.toLowerCase().includes(input.query.toLowerCase()) ||
      food.brand.toLowerCase().includes(input.query.toLowerCase())
    );

    return {
      success: true,
      data: filteredFoods,
    };
  });