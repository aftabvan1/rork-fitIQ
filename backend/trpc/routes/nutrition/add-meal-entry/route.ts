import { z } from "zod";
import { publicProcedure } from "../../../create-context";

// Mock meal entries storage - in a real app this would be a database
const mealEntries: any[] = [];

export const addMealEntryProcedure = publicProcedure
  .input(z.object({
    foodId: z.string(),
    name: z.string(),
    brand: z.string().optional(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
    servingSize: z.number(),
    servingUnit: z.string(),
    quantity: z.number().default(1),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    date: z.string() // ISO date string
  }))
  .mutation(({ input }: { input: {
    foodId: string;
    name: string;
    brand?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    servingSize: number;
    servingUnit: string;
    quantity: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    date: string;
  } }) => {
    const entry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...input,
      createdAt: new Date().toISOString()
    };
    
    mealEntries.push(entry);
    
    return {
      success: true,
      data: entry
    };
  });