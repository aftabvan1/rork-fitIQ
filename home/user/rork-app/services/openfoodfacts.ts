import { Food } from '@/types';

export interface OpenFoodFactsProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  nutriments?: {
    energy_kcal_100g?: number;
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  image_url?: string;
  image_front_url?: string;
  ingredients_text?: string;
  categories?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export class OpenFoodFactsService {
  private static readonly BASE_URL = 'https://world.openfoodfacts.org/api/v0';

  static async getProductByBarcode(barcode: string): Promise<Food | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/product/${barcode}.json`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product data');
      }
      
      const data: OpenFoodFactsResponse = await response.json();
      
      if (data.status === 0 || !data.product) {
        return null;
      }
      
      return this.convertToFood(data.product, barcode);
    } catch (error) {
      console.error('OpenFoodFacts API error:', error);
      return null;
    }
  }

  static async searchProducts(query: string, limit: number = 20): Promise<Food[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search products');
      }
      
      const data = await response.json();
      
      if (!data.products || !Array.isArray(data.products)) {
        return [];
      }
      
      return data.products
        .map((product: OpenFoodFactsProduct, index: number) => 
          this.convertToFood(product, `search_${index}_${Date.now()}`)
        )
        .filter((food: Food | null) => food !== null) as Food[];
    } catch (error) {
      console.error('OpenFoodFacts search error:', error);
      return [];
    }
  }

  private static convertToFood(product: OpenFoodFactsProduct, id: string): Food | null {
    const nutriments = product.nutriments || {};
    
    // Skip products without basic nutrition info
    if (!product.product_name && !product.product_name_en) {
      return null;
    }
    
    return {
      id,
      name: product.product_name || product.product_name_en || 'Unknown Product',
      brand: product.brands || undefined,
      calories: nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || 0,
      protein: nutriments.proteins_100g || nutriments['proteins_100g'] || 0,
      carbs: nutriments.carbohydrates_100g || nutriments['carbohydrates_100g'] || 0,
      fat: nutriments.fat_100g || nutriments['fat_100g'] || 0,
      servingSize: 100,
      servingUnit: product.serving_size || '100g',
    };
  }
}