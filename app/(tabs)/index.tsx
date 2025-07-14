import { useNutritionStore } from "@/store/nutrition-store";
import { useUserStore } from "@/store/user-store";
import { formatDate } from "@/utils/dateUtils";
import { mockFoods } from "@/utils/mockData";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import DateSelector from "@/components/DateSelector";
import FoodCard from "@/components/FoodCard";
import NutritionSummary from "@/components/NutritionSummary";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import Button from "@/components/Button";
import { Camera, Image as ImageIcon, Sparkles } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useThemeStore } from "@/store/theme-store";

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [initialized, setInitialized] = useState(false);
  const { user } = useUserStore();
  const { getDailyNutrition, recentFoods, addMealEntry } = useNutritionStore();
  
  const dailyNutrition = getDailyNutrition(formatDate(selectedDate));
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleFoodPress = (foodId: string) => {
    router.push({
      pathname: "/food-details",
      params: { id: foodId },
    });
  };
  
  const handleAddFood = (food: any) => {
    router.push({
      pathname: "/food-details",
      params: { id: food.id, action: "add" },
    });
  };
  
  // Initialize with some mock data if empty (only once)
  useEffect(() => {
    if (!initialized && recentFoods.length === 0) {
      // Add some sample foods to recent foods without adding to daily log
      mockFoods.slice(0, 3).forEach((food, index) => {
        // Add with a small delay to ensure unique timestamps
        setTimeout(() => {
          addMealEntry({
            food,
            quantity: 1,
            mealType: "breakfast",
            date: formatDate(new Date()),
          });
        }, index * 10);
      });
      setInitialized(true);
    }
  }, [initialized, recentFoods.length, addMealEntry]);
  
  const renderRecentFood = ({ item, index }: { item: any; index: number }) => (
    <FoodCard
      key={`recent-${item.id}-${index}`}
      food={item}
      onPress={() => handleFoodPress(item.id)}
      onAddPress={handleAddFood}
    />
  );
  
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
          
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Quick Add
            </ThemedText>
            <View style={styles.quickAddButtons}>
              <Button
                title="Scan Barcode"
                onPress={() => router.push("/scan")}
                style={styles.quickAddButton}
                variant="outline"
                leftIcon={<Camera size={20} color={Colors[theme].primary} />}
              />
              <Button
                title="Take Photo"
                onPress={() => router.push("/scan?mode=photo")}
                style={styles.quickAddButton}
                variant="outline"
                leftIcon={<ImageIcon size={20} color={Colors[theme].primary} />}
              />
            </View>
          </ThemedView>
          
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
            <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
              Recent Foods
            </ThemedText>
            {recentFoods.length > 0 ? (
              <FlatList
                data={recentFoods.slice(0, 5)}
                keyExtractor={(item, index) => `recent-${item.id}-${index}`}
                renderItem={renderRecentFood}
                scrollEnabled={false}
              />
            ) : (
              <ThemedView backgroundColor="background" rounded="lg" style={styles.emptyContainer}>
                <ThemedText color="subtext" style={styles.emptyText}>
                  No recent foods. Start adding foods to see them here.
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          
          {!user?.isPremium && (
            <ThemedView backgroundColor="card" shadow="lg" rounded="xl" style={styles.premiumSection}>
              <View style={styles.premiumHeader}>
                <Sparkles size={24} color={Colors[theme].primary} />
                <ThemedText size="xl" weight="bold" style={styles.premiumTitle}>
                  Upgrade to Premium
                </ThemedText>
              </View>
              <ThemedText color="subtext" style={styles.premiumText}>
                Get unlimited scans, AI food recognition, and personalized nutrition insights.
              </ThemedText>
              <Button
                title="View Premium Features"
                onPress={() => router.push("/subscription")}
                style={styles.premiumButton}
                leftIcon={<Sparkles size={18} color={Colors[theme].background} />}
              />
            </ThemedView>
          )}
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
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  premiumSection: {
    padding: 24,
    marginBottom: 20,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  premiumTitle: {
    flex: 1,
  },
  premiumText: {
    marginBottom: 20,
    lineHeight: 22,
  },
  premiumButton: {
    marginTop: 8,
  },
});