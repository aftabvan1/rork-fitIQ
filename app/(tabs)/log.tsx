import { MealEntry, MealType } from "@/types";
import { useNutritionStore } from "@/store/nutrition-store";
import { useUserStore } from "@/store/user-store";
import { formatDate } from "@/utils/dateUtils";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import DateSelector from "@/components/DateSelector";
import MealSection from "@/components/MealSection";
import NutritionSummary from "@/components/NutritionSummary";
import ThemedView from "@/components/ThemedView";

export default function LogScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useUserStore();
  const { getDailyNutrition } = useNutritionStore();
  
  const dailyNutrition = getDailyNutrition(formatDate(selectedDate));
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleAddFood = (mealType: MealType) => {
    router.push({
      pathname: "/food-details",
      params: { action: "add", mealType, date: formatDate(selectedDate) },
    });
  };
  
  const handleEntryPress = (entry: MealEntry) => {
    router.push({
      pathname: "/food-details",
      params: { id: entry.food.id, entryId: entry.id, date: entry.date },
    });
  };
  
  // Calculate total calories for each meal type
  const getTotalCalories = (mealType: MealType): number => {
    return dailyNutrition.meals[mealType].reduce(
      (total, entry) => total + entry.food.calories * entry.quantity,
      0
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <DateSelector date={selectedDate} onDateChange={handleDateChange} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <NutritionSummary
            calories={dailyNutrition.calories}
            protein={dailyNutrition.protein}
            carbs={dailyNutrition.carbs}
            fat={dailyNutrition.fat}
            goals={user?.goals || { calories: 2000, protein: 150, carbs: 200, fat: 65 }}
          />
          
          <MealSection
            title="Breakfast"
            mealType="breakfast"
            entries={dailyNutrition.meals.breakfast}
            totalCalories={getTotalCalories("breakfast")}
            onAddFood={handleAddFood}
            onEntryPress={handleEntryPress}
          />
          
          <MealSection
            title="Lunch"
            mealType="lunch"
            entries={dailyNutrition.meals.lunch}
            totalCalories={getTotalCalories("lunch")}
            onAddFood={handleAddFood}
            onEntryPress={handleEntryPress}
          />
          
          <MealSection
            title="Dinner"
            mealType="dinner"
            entries={dailyNutrition.meals.dinner}
            totalCalories={getTotalCalories("dinner")}
            onAddFood={handleAddFood}
            onEntryPress={handleEntryPress}
          />
          
          <MealSection
            title="Snacks"
            mealType="snack"
            entries={dailyNutrition.meals.snack}
            totalCalories={getTotalCalories("snack")}
            onAddFood={handleAddFood}
            onEntryPress={handleEntryPress}
          />
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
});