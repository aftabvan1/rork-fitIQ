import { useNutritionStore } from "@/store/nutrition-store";
import { useUserStore } from "@/store/user-store";
import { useFriendsStore } from "@/store/friends-store";
import { formatDate } from "@/utils/dateUtils";
import { mockFoods } from "@/utils/mockData";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import DateSelector from "@/components/DateSelector";
import FoodCard from "@/components/FoodCard";
import NutritionSummary from "@/components/NutritionSummary";
import WeeklyProgressChart from "@/components/WeeklyProgressChart";
import ActivityFeed from "@/components/ActivityFeed";
import FriendCard from "@/components/FriendCard";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import Button from "@/components/Button";
import { Camera, Image as ImageIcon, Sparkles, Users, TrendingUp, Award, Droplets, Moon } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useThemeStore } from "@/store/theme-store";

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [initialized, setInitialized] = useState(false);
  const [waterIntake, setWaterIntake] = useState(6); // glasses of water
  const [sleepHours, setSleepHours] = useState(7.5);
  
  const { user } = useUserStore();
  const { getDailyNutrition, recentFoods, addMealEntry } = useNutritionStore();
  const { friends, getFriendActivities } = useFriendsStore();
  
  const dailyNutrition = getDailyNutrition(formatDate(selectedDate));
  const friendActivities = getFriendActivities(3);
  const activeFriends = friends.filter(f => f.status === 'accepted').slice(0, 3);
  
  // Calculate streak (mock for now)
  const currentStreak = 5;
  
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
  
  const handleViewFriends = () => {
    router.push("/friends");
  };
  
  const handleViewFriend = (friendId: string) => {
    router.push({
      pathname: "/friend-profile",
      params: { id: friendId },
    });
  };
  
  const addWater = () => {
    setWaterIntake(prev => Math.min(prev + 1, 12));
  };
  
  // Initialize with some mock data if empty (only once)
  useEffect(() => {
    if (!initialized && recentFoods.length === 0) {
      mockFoods.slice(0, 3).forEach((food, index) => {
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
      compact
    />
  );
  
  const renderFriend = ({ item }: { item: any }) => (
    <FriendCard
      friend={item}
      onPress={() => handleViewFriend(item.id)}
      compact
    />
  );
  
  return (
    <ThemedView style={styles.container}>
      <DateSelector date={selectedDate} onDateChange={handleDateChange} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Daily Stats Overview */}
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.statsOverview}>
            <View style={styles.statsHeader}>
              <TrendingUp size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.statsTitle}>
                Today's Overview
              </ThemedText>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: Colors[theme].secondary + '20' }]}>
                  <Award size={20} color={Colors[theme].secondary} />
                </View>
                <ThemedText size="lg" weight="bold" style={{ color: Colors[theme].secondary }}>
                  {currentStreak}
                </ThemedText>
                <ThemedText size="sm" color="subtext">Day Streak</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: Colors[theme].info + '20' }]}>
                  <Droplets size={20} color={Colors[theme].info} />
                </View>
                <ThemedText size="lg" weight="bold" style={{ color: Colors[theme].info }}>
                  {waterIntake}
                </ThemedText>
                <ThemedText size="sm" color="subtext">Glasses</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: Colors[theme].success + '20' }]}>
                  <Moon size={20} color={Colors[theme].success} />
                </View>
                <ThemedText size="lg" weight="bold" style={{ color: Colors[theme].success }}>
                  {sleepHours}h
                </ThemedText>
                <ThemedText size="sm" color="subtext">Sleep</ThemedText>
              </View>
            </View>
          </ThemedView>
          
          <NutritionSummary
            calories={dailyNutrition.calories}
            protein={dailyNutrition.protein}
            carbs={dailyNutrition.carbs}
            fat={dailyNutrition.fat}
            goals={user?.goals || { calories: 2000, protein: 150, carbs: 200, fat: 65 }}
          />
          
          <WeeklyProgressChart />
          
          {/* Quick Actions */}
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
            
            {/* Water Intake Tracker */}
            <View style={styles.waterTracker}>
              <View style={styles.waterHeader}>
                <Droplets size={20} color={Colors[theme].info} />
                <ThemedText weight="semibold">Water Intake</ThemedText>
                <ThemedText size="sm" color="subtext">
                  {waterIntake}/8 glasses
                </ThemedText>
              </View>
              <View style={styles.waterGlasses}>
                {Array.from({ length: 8 }, (_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waterGlass,
                      {
                        backgroundColor: i < waterIntake 
                          ? Colors[theme].info 
                          : Colors[theme].border,
                      },
                    ]}
                  />
                ))}
              </View>
              <Button
                title="Add Glass"
                onPress={addWater}
                variant="outline"
                size="sm"
                style={styles.addWaterButton}
              />
            </View>
          </ThemedView>
          
          {/* Friends Activity */}
          {activeFriends.length > 0 && (
            <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
              <View style={styles.sectionHeaderWithAction}>
                <View style={styles.sectionHeaderLeft}>
                  <Users size={24} color={Colors[theme].primary} />
                  <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                    Friends
                  </ThemedText>
                </View>
                <Button
                  title="View All"
                  onPress={handleViewFriends}
                  variant="text"
                  size="sm"
                />
              </View>
              
              <FlatList
                data={activeFriends}
                renderItem={renderFriend}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.friendsList}
              />
              
              {friendActivities.length > 0 && (
                <View style={styles.activitySection}>
                  <ThemedText weight="semibold" style={styles.activityTitle}>
                    Recent Activity
                  </ThemedText>
                  <ActivityFeed activities={friendActivities} maxItems={3} />
                </View>
              )}
            </ThemedView>
          )}
          
          {/* Recent Foods */}
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
          
          {/* Premium Upsell */}
          {!user?.isPremium && (
            <ThemedView backgroundColor="card" shadow="lg" rounded="xl" style={styles.premiumSection}>
              <View style={styles.premiumHeader}>
                <Sparkles size={24} color={Colors[theme].primary} />
                <ThemedText size="xl" weight="bold" style={styles.premiumTitle}>
                  Upgrade to Premium
                </ThemedText>
              </View>
              <ThemedText color="subtext" style={styles.premiumText}>
                Get unlimited scans, AI food recognition, advanced analytics, and connect with unlimited friends.
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
  statsOverview: {
    padding: 20,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  statsTitle: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAddButton: {
    flex: 1,
  },
  waterTracker: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  waterGlasses: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  waterGlass: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  addWaterButton: {
    alignSelf: 'flex-start',
  },
  friendsList: {
    marginBottom: 16,
  },
  activitySection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  activityTitle: {
    marginBottom: 12,
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