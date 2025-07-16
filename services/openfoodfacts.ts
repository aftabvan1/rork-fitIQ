// OpenFoodFacts API integration
export interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriments: {
      energy_100g?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
      sugars_100g?: number;
      sodium_100g?: number;
    };
    serving_size?: string;
  };
  status: number;
  status_verbose: string;
}

export interface NormalizedFoodItem {
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
  imageUrl?: string;
}

export async function fetchProductFromOpenFoodFacts(barcode: string): Promise<NormalizedFoodItem | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (!response.ok) {
      console.error('OpenFoodFacts API error:', response.status, response.statusText);
      return null;
    }
    
    const data: OpenFoodFactsProduct = await response.json();
    
    if (data.status !== 1 || !data.product) {
      console.log('Product not found in OpenFoodFacts database');
      return null;
    }
    
    const product = data.product;
    const nutriments = product.nutriments;
    
    // Normalize the data to our format
    const normalizedProduct: NormalizedFoodItem = {
      id: barcode,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || undefined,
      calories: Math.round((nutriments.energy_100g || 0) / 4.184), // Convert kJ to kcal
      protein: nutriments.proteins_100g || 0,
      carbs: nutriments.carbohydrates_100g || 0,
      fat: nutriments.fat_100g || 0,
      fiber: nutriments.fiber_100g || 0,
      sugar: nutriments.sugars_100g || 0,
      sodium: (nutriments.sodium_100g || 0) * 1000, // Convert g to mg
      servingSize: 100,
      servingUnit: "100g",
      imageUrl: product.image_url || undefined
    };
    
    return normalizedProduct;
  } catch (error) {
    console.error('Error fetching from OpenFoodFacts:', error);
    return null;
  }
}

export async function searchFoodInOpenFoodFacts(query: string, limit: number = 20): Promise<NormalizedFoodItem[]> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}`);
    
    if (!response.ok) {
      console.error('OpenFoodFacts search API error:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.products || !Array.isArray(data.products)) {
      return [];
    }
    
    const normalizedProducts: NormalizedFoodItem[] = data.products
      .filter((product: any) => product.product_name && product.nutriments)
      .map((product: any) => ({
        id: product.code || `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || undefined,
        calories: Math.round((product.nutriments.energy_100g || 0) / 4.184), // Convert kJ to kcal
        protein: product.nutriments.proteins_100g || 0,
        carbs: product.nutriments.carbohydrates_100g || 0,
        fat: product.nutriments.fat_100g || 0,
        fiber: product.nutriments.fiber_100g || 0,
        sugar: product.nutriments.sugars_100g || 0,
        sodium: (product.nutriments.sodium_100g || 0) * 1000, // Convert g to mg
        servingSize: 100,
        servingUnit: "100g",
        imageUrl: product.image_url || undefined
      }));
    
    return normalizedProducts;
  } catch (error) {
    console.error('Error searching OpenFoodFacts:', error);
    return [];
  }
}