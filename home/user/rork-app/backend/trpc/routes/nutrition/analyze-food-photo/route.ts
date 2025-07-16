import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const analyzeFoodPhotoProcedure = publicProcedure
  .input(z.object({ 
    imageBase64: z.string(),
    mimeType: z.string().optional()
  }))
  .mutation(async ({ input }) => {
    const { imageBase64, mimeType = "image/jpeg" } = input;
    
    try {
      // Use external AI service for food analysis
      const aiResponse = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert. Analyze the food image and return a JSON array of foods you can identify. 
              Each food should have: 
              - id (generate a unique string like "food_1", "food_2")
              - name (specific food name)
              - brand (if visible, otherwise null)
              - calories (per 100g, realistic estimate)
              - protein (per 100g in grams)
              - carbs (per 100g in grams)
              - fat (per 100g in grams)
              - fiber (per 100g in grams, estimate)
              - sugar (per 100g in grams, estimate)
              - sodium (per 100g in mg, estimate)
              - servingSize (typical serving in grams)
              - servingUnit (e.g., "1 cup", "1 piece", "100g")
              
              Only return the JSON array, no other text. Be conservative with estimates and only include foods you can clearly identify.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this food image and identify the foods present with their nutritional information.'
                },
                {
                  type: 'image',
                  image: imageBase64
                }
              ]
            }
          ]
        }),
      });
      
      if (!aiResponse.ok) {
        throw new Error('AI service unavailable');
      }
      
      const aiData = await aiResponse.json();
      const foodsText = aiData.completion;
      
      try {
        // Parse the JSON response from AI
        const foods = JSON.parse(foodsText);
        
        if (!Array.isArray(foods)) {
          throw new Error('Invalid AI response format');
        }
        
        // Validate and clean the food data
        const validatedFoods = foods
          .filter((food: any) => food && food.name && typeof food.name === 'string')
          .map((food: any) => ({
            id: food.id || `ai_food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: food.name,
            brand: food.brand || null,
            calories: Math.max(0, Number(food.calories) || 0),
            protein: Math.max(0, Number(food.protein) || 0),
            carbs: Math.max(0, Number(food.carbs) || 0),
            fat: Math.max(0, Number(food.fat) || 0),
            fiber: Math.max(0, Number(food.fiber) || 0),
            sugar: Math.max(0, Number(food.sugar) || 0),
            sodium: Math.max(0, Number(food.sodium) || 0),
            servingSize: Math.max(1, Number(food.servingSize) || 100),
            servingUnit: food.servingUnit || '100g'
          }))
          .slice(0, 5); // Limit to 5 foods max
        
        return {
          success: true,
          data: validatedFoods
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        
        // Fallback to generic food items
        return {
          success: true,
          data: [
            {
              id: `fallback_${Date.now()}`,
              name: "Mixed Food",
              brand: null,
              calories: 200,
              protein: 10,
              carbs: 20,
              fat: 8,
              fiber: 3,
              sugar: 5,
              sodium: 300,
              servingSize: 100,
              servingUnit: "100g"
            }
          ]
        };
      }
    } catch (error) {
      console.error('Analyze food photo error:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Failed to analyze food photo"
      };
    }
  });