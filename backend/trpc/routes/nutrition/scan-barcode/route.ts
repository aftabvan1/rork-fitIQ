import { z } from "zod";
import { publicProcedure } from "../../create-context";

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

async function fetchFromOpenFoodFacts(barcode: string) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product data');
    }
    
    const data = await response.json();
    
    if (data.status === 0 || !data.product) {
      return null;
    }
    
    const product = data.product;
    const nutriments = product.nutriments || {};
    
    return {
      id: barcode,
      name: product.product_name || product.product_name_en || 'Unknown Product',
      brand: product.brands || undefined,
      calories: nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || 0,
      protein: nutriments.proteins_100g || 0,
      carbs: nutriments.carbohydrates_100g || 0,
      fat: nutriments.fat_100g || 0,
      fiber: nutriments.fiber_100g || 0,
      sugar: nutriments.sugars_100g || 0,
      sodium: nutriments.sodium_100g || 0,
      servingSize: 100,
      servingUnit: product.serving_size || '100g'
    };
  } catch (error) {
    console.error('OpenFoodFacts API error:', error);
    return null;
  }
}

export const scanBarcodeProcedure = publicProcedure
  .input(z.object({ barcode: z.string() }))
  .query(async ({ input }: { input: { barcode: string } }) => {
    const { barcode } = input;
    
    // First try OpenFoodFacts API
    const openFoodFactsResult = await fetchFromOpenFoodFacts(barcode);
    
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