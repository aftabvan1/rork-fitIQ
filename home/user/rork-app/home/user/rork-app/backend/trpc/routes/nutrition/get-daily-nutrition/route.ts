import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const getDailyNutritionProcedure = publicProcedure
  .input(z.object({ date: z.string() }))
  .query(({ input }) => {
    // In a real app, this would fetch from a database
    // For now, we'll return mock data
    const mockData = {
      date: input.date,
      totalCalories: 1850,
      totalProtein: 120,
      totalCarbs: 180,
      totalFat: 65,
      totalFiber: 25,
      totalSugar: 45,
      totalSodium: 2100,
      meals: {
        breakfast: [
          {
            id: 'breakfast_1',
            foodName: 'Oatmeal with Berries',
            quantity: 1,
            unit: 'bowl',
            calories: 350,
            protein: 12,
            carbs: 65,
            fat: 8,
            fiber: 10,
            sugar: 15,
            sodium: 200,
          }
        ],
        lunch: [
          {
            id: 'lunch_1',
            foodName: 'Grilled Chicken Salad',
            quantity: 1,
            unit: 'serving',
            calories: 450,
            protein: 35,
            carbs: 25,
            fat: 18,
            fiber: 8,
            sugar: 12,
            sodium: 800,
          }
        ],
        dinner: [
          {
            id: 'dinner_1',
            foodName: 'Salmon with Quinoa',
            quantity: 1,
            unit: 'serving',
            calories: 550,
            protein: 40,
            carbs: 45,
            fat: 22,
            fiber: 5,
            sugar: 8,
            sodium: 600,
          }
        ],
        snack: [
          {
            id: 'snack_1',
            foodName: 'Greek Yogurt',
            quantity: 1,
            unit: 'cup',
            calories: 150,
            protein: 20,
            carbs: 15,
            fat: 4,
            fiber: 0,
            sugar: 12,
            sodium: 100,
          }
        ]
      }
    };

    return {
      success: true,
      data: mockData,
    };
  });