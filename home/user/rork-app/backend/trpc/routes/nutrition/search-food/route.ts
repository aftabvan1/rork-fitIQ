import { z } from "zod";
import { publicProcedure } from "../../create-context";

// Mock food database - fallback when OpenFoodFacts is unavailable
const mockFoods = [
  {
    id: "1",
    name: "Chicken Breast",
    brand: "Generic",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    servingSize: 100,
    servingUnit: "100g"
  },
  {
    id: "2",
    name: "Brown Rice",
    brand: "Generic",
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    fiber: 1.8,
    sugar: 0.4,
    sodium: 5,
    servingSize: 100,
    servingUnit: "100g"
  },
  {
    id: "3",
    name: "Broccoli",
    brand: "Generic",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.5,
    sodium: 33,
    servingSize: 100,
    servingUnit: "100g"
  }
];

async function searchOpenFoodFacts(query: string) {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search OpenFoodFacts');
    }
    
    const data = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }
    
    return data.products
      .map((product: any, index: number) => {
        const nutriments = product.nutriments || {};
        
        if (!product.product_name && !product.product_name_en) {
          return null;
        }
        
        return {
          id: `off_${product.code || index}_${Date.now()}`,
          name: product.product_name || product.product_name_en || 'Unknown Product',
          brand: product.brands || null,
          calories: nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || 0,
          protein: nutriments.proteins_100g || nutriments['proteins_100g'] || 0,
          carbs: nutriments.carbohydrates_100g || nutriments['carbohydrates_100g'] || 0,
          fat: nutriments.fat_100g || nutriments['fat_100g'] || 0,
          fiber: nutriments.fiber_100g || nutriments['fiber_100g'] || 0,
          sugar: nutriments.sugars_100g || nutriments['sugars_100g'] || 0,
          sodium: nutriments.sodium_100g || nutriments['sodium_100g'] || 0,
          servingSize: 100,
          servingUnit: product.serving_size || '100g'
        };
      })
      .filter((food: any) => food !== null)
      .slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('OpenFoodFacts search error:', error);
    return [];
  }
}

export const searchFoodProcedure = publicProcedure
  .input(z.object({ query: z.string() }))
  .query(async ({ input }: { input: { query: string } }) => {
    const { query } = input;
    
    // First try OpenFoodFacts API
    const openFoodFactsResults = await searchOpenFoodFacts(query);
    
    // Also search local mock data as fallback/supplement
    const lowerQuery = query.toLowerCase();
    const mockResults = mockFoods.filter(food => 
      food.name.toLowerCase().includes(lowerQuery) ||
      (food.brand && food.brand.toLowerCase().includes(lowerQuery))
    );
    
    // Combine results, prioritizing OpenFoodFacts
    const combinedResults = [...openFoodFactsResults, ...mockResults];
    
    return {
      success: true,
      data: combinedResults
    };
  });