export interface OpenFoodFactsNutriments {
  energy_kcal_100g?: number;
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
}

export interface OpenFoodFactsProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: OpenFoodFactsNutriments;
}

export interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export interface NormalizedFoodData {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: number;
  servingUnit: string;
}

export async function fetchProductFromOpenFoodFacts(barcode: string): Promise<NormalizedFoodData | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product data');
    }
    
    const data: OpenFoodFactsResponse = await response.json();
    
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