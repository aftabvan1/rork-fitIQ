import { useFriendsStore } from "@/store/friends-store";
import { useThemeStore } from "@/store/theme-store";
import Colors from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { User, Zap, Dumbbell, Target, Calendar, TrendingUp } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import MacroProgress from "@/components/MacroProgress";

export default function FriendProfileScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getFriendById } = useFriendsStore();
  
  const friend = getFriendById(id!);
  
  if (!friend) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Friend not found</ThemedText>
      </ThemedView>
    );
  }
  
  // Mock data for friend's progress
  const mockProgress = {
    todayCalories: 1420,
    todayProtein: 89,
    todayCarbs: 145,
    todayFat: 52,
    weeklyWorkouts: 4,
    weeklyAvgCalories: 1650,
    favoriteWorkouts: ['Strength Training', 'Cardio', 'Yoga'],
    recentMeals: [
      { name: 'Greek Yogurt Bowl', calories: 320, time: '2h ago' },
      { name: 'Grilled Salmon', calories: 280, time: '5h ago' },
      { name: 'Quinoa Salad', calories: 240, time: '8h ago' },
    ],
  };
  
  const getLastActiveText = () => {
    if (!friend.lastActive) return 'Never active';
    
    const now = new Date();
    const lastActive = new Date(friend.lastActive);
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Active ${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `Active ${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `Active ${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Header */}
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              {friend.profilePicture ? (
                <Image
                  source={{ uri: friend.profilePicture }}
                  style={styles.profilePicture}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.profilePicture, { backgroundColor: Colors[theme].primary + '20' }]}>
                  <User size={40} color={Colors[theme].primary} />
                </View>
              )}
              
              <View style={styles.profileDetails}>
                <ThemedText size="xxl" weight="bold">
                  {friend.name}
                </ThemedText>
                <ThemedText color="subtext" style={styles.lastActive}>
                  {getLastActiveText()}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors[theme].secondary + '20' }]}>
                  <Zap size={20} color={Colors[theme].secondary} />
                </View>
                <ThemedText size="lg" weight="bold" style={{ color: Colors[theme].secondary }}>
                  {friend.streak || 0}
                </ThemedText>
                <ThemedText size="sm" color="subtext">Day Streak</ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors[theme].success + '20' }]}>
                  <Dumbbell size={20} color={Colors[theme].success} />
                </View>
                <ThemedText size="lg" weight="bold" style={{ color: Colors[theme].success }}>
                  {friend.totalWorkouts || 0}
                </ThemedText>
                <ThemedText size="sm" color="subtext">Workouts</ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors[theme].info + '20' }]}>
                  <TrendingUp size={20} color={Colors[theme].info} />
                </View>
                <ThemedText size="lg" weight="bold" style={{ color: Colors[theme].info }}>
                  {mockProgress.weeklyWorkouts}
                </ThemedText>
                <ThemedText size="sm" color="subtext">This Week</ThemedText>
              </View>
            </View>
          </ThemedView>
          
          {/* Today's Progress */}
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                Today's Progress
              </ThemedText>
            </View>
            
            {friend.currentGoals && (
              <View style={styles.progressContainer}>
                <MacroProgress
                  current={mockProgress.todayCalories}
                  goal={friend.currentGoals.calories}
                  type="calories"
                />
                <MacroProgress
                  current={mockProgress.todayProtein}
                  goal={friend.currentGoals.protein}
                  type="protein"
                />
                <MacroProgress
                  current={mockProgress.todayCarbs}
                  goal={friend.currentGoals.carbs}
                  type="carbs"
                />
                <MacroProgress
                  current={mockProgress.todayFat}
                  goal={friend.currentGoals.fat}
                  type="fat"
                />
              </View>
            )}
          </ThemedView>
          
          {/* Weekly Summary */}
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                This Week
              </ThemedText>
            </View>
            
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyStat}>
                <ThemedText size="sm" color="subtext">Avg Calories</ThemedText>
                <ThemedText size="lg" weight="bold" style={{ color: Colors[theme].primary }}>
                  {mockProgress.weeklyAvgCalories}
                </ThemedText>
              </View>
              <View style={styles.weeklyStat}>
                <ThemedText size="sm" color="subtext">Workouts</ThemedText>
                <ThemedText size="lg" weight="bold" style={{ color: Colors[theme].success }}>
                  {mockProgress.weeklyWorkouts}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.favoriteWorkouts}>
              <ThemedText weight="semibold" style={styles.favoriteTitle}>
                Favorite Workouts
              </ThemedText>
              <View style={styles.workoutTags}>
                {mockProgress.favoriteWorkouts.map((workout, index) => (
                  <View 
                    key={index}
                    style={[styles.workoutTag, { backgroundColor: Colors[theme].primary + '20' }]}
                  >
                    <ThemedText size="sm" style={{ color: Colors[theme].primary }}>
                      {workout}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </ThemedView>
          
          {/* Recent Meals */}
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                Recent Meals
              </ThemedText>
            </View>
            
            <View style={styles.recentMeals}>
              {mockProgress.recentMeals.map((meal, index) => (
                <View key={index} style={styles.mealItem}>
                  <View style={styles.mealInfo}>
                    <ThemedText weight="semibold">{meal.name}</ThemedText>
                    <ThemedText size="sm" color="subtext">{meal.time}</ThemedText>
                  </View>
                  <ThemedText weight="semibold" style={{ color: Colors[theme].primary }}>
                    {meal.calories} cal
                  </ThemedText>
                </View>
              ))}
            </View>
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
  profileHeader: {
    padding: 24,
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flex: 1,
  },
  lastActive: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    flex: 1,
  },
  progressContainer: {
    gap: 16,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  weeklyStat: {
    alignItems: 'center',
  },
  favoriteWorkouts: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  favoriteTitle: {
    marginBottom: 12,
  },
  workoutTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workoutTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentMeals: {
    gap: 12,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mealInfo: {
    flex: 1,
  },
});