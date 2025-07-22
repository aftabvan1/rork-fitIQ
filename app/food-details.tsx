import { Food, MealType } from "@/types";
import { useNutritionStore } from "@/store/nutrition-store";
import { useThemeStore } from "@/store/theme-store";
import Colors from "@/constants/colors";
import { formatDate } from "@/utils/dateUtils";
import { fallbackFoods } from "@/utils/mockData";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Button from "@/components/Button";
import MacroProgress from "@/components/MacroProgress";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";

export default function FoodDetailsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const params = useLocalSearchParams<{
    id?: string;
    entryId?: string;
    action?: string;
    mealType?: MealType;
    date?: string;
    foodData?: string; // JSON string of food data
  }>();
  
  const { addMealEntry, removeMealEntry, updateMealEntry, dailyLogs } = useNutritionStore();
  
  const [food, setFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    params.mealType as MealType || "breakfast"
  );
  const [selectedDate, setSelectedDate] = useState(
    params.date || formatDate(new Date())
  );
  const [isLoading, setIsLoading] = useState(true);
  
  // Find the food item
  useEffect(() => {
    const loadFood = async () => {
      setIsLoading(true);
      
      try {
        // First check if food data was passed directly
        if (params.foodData) {
          const foodData = JSON.parse(params.foodData);
          setFood(foodData);
          setIsLoading(false);
          return;
        }
        
        // Then check if we have an ID to look up
        if (params.id) {
          // First try to find in fallback foods
          const foundFood = fallbackFoods.find((f) => f.id === params.id);
          if (foundFood) {
            setFood(foundFood);
            setIsLoading(false);
            return;
          }
          
          // If not found in fallback, the food might be from a scan result
          // In this case, we should have received the food data directly
          console.warn('Food ID not found in fallback foods:', params.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading food data:', error);
        setIsLoading(false);
      }
    };
    
    loadFood();
  }, [params.id, params.foodData]);
  
  // If editing an existing entry, load its data
  useEffect(() => {
    if (params.entryId && params.date) {
      const dailyLog = dailyLogs[params.date];
      if (dailyLog) {
        for (const mealType of ["breakfast", "lunch", "dinner", "snack"] as MealType[]) {
          const entry = dailyLog.meals[mealType].find(
            (e) => e.id === params.entryId
          );
          if (entry) {
            setFood(entry.food);
            setQuantity(entry.quantity.toString());
            setSelectedMealType(entry.mealType);
            break;
          }
        }
      }
    }
  }, [params.entryId, params.date, dailyLogs]);
  
  const handleQuantityChange = (text: string) => {
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      setQuantity(text);
    }
  };
  
  const handleAddFood = () => {
    if (!food) return;
    
    const parsedQuantity = parseFloat(quantity) || 1;
    
    if (params.entryId) {
      // Update existing entry
      updateMealEntry({
        id: params.entryId,
        food,
        quantity: parsedQuantity,
        mealType: selectedMealType,
        date: selectedDate,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Food entry updated");
    } else {
      // Add new entry
      addMealEntry({
        food,
        quantity: parsedQuantity,
        mealType: selectedMealType,
        date: selectedDate,
      });
      Alert.alert("Success", "Food added to your log");
    }
    
    router.back();
  };
  
  const handleDeleteFood = () => {
    if (params.entryId && params.date) {
      Alert.alert(
        "Delete Food",
        "Are you sure you want to remove this food from your log?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              removeMealEntry(params.entryId!, params.date!);
              router.back();
            },
          },
        ]
      );
    }
  };
  
  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading food details...</ThemedText>
        </View>
      </ThemedView>
    );
  }
  
  if (!food) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText size="lg" weight="semibold" style={styles.errorTitle}>
            Food Not Found
          </ThemedText>
          <ThemedText color="textSecondary" style={styles.errorText}>
            The food item could not be loaded. Please try again.
          </ThemedText>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </ThemedView>
    );
  }
  
  const parsedQuantity = parseFloat(quantity) || 0;
  const totalCalories = food.calories * parsedQuantity;
  const totalProtein = food.protein * parsedQuantity;
  const totalCarbs = food.carbs * parsedQuantity;
  const totalFat = food.fat * parsedQuantity;
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {food.image && (
            <Image
              source={{ uri: food.image }}
              style={styles.foodImage}
              contentFit="cover"
            />
          )}
          
          <View style={styles.foodInfo}>
            <ThemedText size="xxl" weight="semibold" style={styles.foodName}>
              {food.name}
            </ThemedText>
            {food.brand && (
              <ThemedText size="md" color="subtext">
                {food.brand}
              </ThemedText>
            )}
            
            <View style={styles.servingInfo}>
              <ThemedText>
                Serving size: {food.servingSize} {food.servingUnit}
              </ThemedText>
            </View>
          </View>
          
          <ThemedView backgroundColor="card" style={styles.nutritionCard}>
            <ThemedText size="lg" weight="semibold" style={styles.cardTitle}>
              Nutrition Facts
            </ThemedText>
            
            <View style={styles.nutritionRow}>
              <ThemedText size="lg" weight="semibold">
                {totalCalories.toFixed(0)}
              </ThemedText>
              <ThemedText size="lg" color="subtext">
                calories
              </ThemedText>
            </View>
            
            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <ThemedText
                  size="lg"
                  weight="semibold"
                  style={{ color: Colors[theme].protein }}
                >
                  {totalProtein.toFixed(1)}g
                </ThemedText>
                <ThemedText>Protein</ThemedText>
              </View>
              
              <View style={styles.macroItem}>
                <ThemedText
                  size="lg"
                  weight="semibold"
                  style={{ color: Colors[theme].carbs }}
                >
                  {totalCarbs.toFixed(1)}g
                </ThemedText>
                <ThemedText>Carbs</ThemedText>
              </View>
              
              <View style={styles.macroItem}>
                <ThemedText
                  size="lg"
                  weight="semibold"
                  style={{ color: Colors[theme].fat }}
                >
                  {totalFat.toFixed(1)}g
                </ThemedText>
                <ThemedText>Fat</ThemedText>
              </View>
            </View>
          </ThemedView>
          
          <ThemedView backgroundColor="card" style={styles.addToLogCard}>
            <ThemedText size="lg" weight="semibold" style={styles.cardTitle}>
              Add to Log
            </ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText weight="medium">Quantity</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: Colors[theme].text, borderColor: Colors[theme].border },
                ]}
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={Colors[theme].subtext}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText weight="medium">Meal</ThemedText>
              <View style={styles.mealTypeContainer}>
                {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(
                  (type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.mealTypeButton,
                        selectedMealType === type && {
                          backgroundColor: Colors[theme].primary,
                        },
                      ]}
                      onPress={() => setSelectedMealType(type)}
                    >
                      <ThemedText
                        color={selectedMealType === type ? "background" : "text"}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </ThemedText>
                    </Pressable>
                  )
                )}
              </View>
            </View>
            
            <Button
              title={params.entryId ? "Update Food" : "Add to Log"}
              onPress={handleAddFood}
              style={styles.addButton}
            />
            
            {params.entryId && (
              <Button
                title="Delete from Log"
                onPress={handleDeleteFood}
                variant="outline"
                style={styles.deleteButton}
              />
            )}
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  foodImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  foodInfo: {
    marginBottom: 24,
  },
  foodName: {
    marginBottom: 4,
  },
  servingInfo: {
    marginTop: 8,
  },
  nutritionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 16,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
  },
  addToLogCard: {
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  mealTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  mealTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  addButton: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    width: '100%',
    maxWidth: 300,
  },
});