import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const scanBarcodeProcedure = publicProcedure
  .input(z.object({ barcode: z.string() }))
  .query(async ({ input }) => {
    const { barcode } = input;
    
    try {
      // Fetch from OpenFoodFacts API
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product data');
      }
      
      const data = await response.json();
      
      if (data.status === 0 || !data.product) {
        return {
          success: false,
          data: null,
          message: "Product not found"
        };
      }
      
      const product = data.product;
      const nutriments = product.nutriments || {};
      
      // Convert OpenFoodFacts data to our Food format
      const food = {
        id: barcode,
        name: product.product_name || product.product_name_en || "Unknown Product",
        brand: product.brands || null,
        calories: nutriments.energy_kcal_100g || nutriments["energy-kcal_100g"] || 0,
        protein: nutriments.proteins_100g || nutriments["proteins_100g"] || 0,
        carbs: nutriments.carbohydrates_100g || nutriments["carbohydrates_100g"] || 0,
        fat: nutriments.fat_100g || nutriments["fat_100g"] || 0,
        fiber: nutriments.fiber_100g || nutriments["fiber_100g"] || 0,
        sugar: nutriments.sugars_100g || nutriments["sugars_100g"] || 0,
        sodium: nutriments.sodium_100g || nutriments["sodium_100g"] || 0,
        servingSize: 100,
        servingUnit: product.serving_size || "100g",
        imageUrl: product.image_url || product.image_front_url || null,
        ingredients: product.ingredients_text || null,
        categories: product.categories || null,
        barcode: barcode
      };
      
      return {
        success: true,
        data: food
      };
    } catch (error) {
      console.error('Barcode scan error:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to scan barcode"
      };
    }
  });