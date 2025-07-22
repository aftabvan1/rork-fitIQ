import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { fetchProductFromOpenFoodFacts } from "@/services/openfoodfacts";

// Mock barcode database - in a real app this would be a proper database
const mockBarcodeDatabase: Record<string, any> = {
  "123456789012": {
    id: "123456789012",
    name: "Organic Banana",
    brand: "Fresh Market",
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
  "987654321098": {
    id: "987654321098",
    name: "Greek Yogurt",
    brand: "Healthy Choice",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    sugar: 3.2,
    sodium: 36,
    servingSize: 100,
    servingUnit: "100g"
  }
};



export const scanBarcodeProcedure = publicProcedure
  .input(z.object({ barcode: z.string() }))
  .query(async ({ input }) => {
    const { barcode } = input;
    
    // First try OpenFoodFacts API
    const openFoodFactsResult = await fetchProductFromOpenFoodFacts(barcode);
    
    if (openFoodFactsResult) {
      return {
        success: true,
        data: openFoodFactsResult
      };
    }
    
    // Fallback to mock database
    const mockResult = mockBarcodeDatabase[barcode];
    
    if (mockResult) {
      return {
        success: true,
        data: mockResult
      };
    }
    
    // Product not found
    return {
      success: false,
      error: 'Product not found',
      data: null
    };
  });