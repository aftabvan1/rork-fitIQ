import { useNutritionStore } from '@/store/nutrition-store';
import { useThemeStore } from '@/store/theme-store';
import { useUserStore } from '@/store/user-store';
import Colors from '@/constants/colors';
import { formatDate } from '@/utils/dateUtils';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

export const WeeklyProgressChart: React.FC = () => {
  const { theme } = useThemeStore();
  const { getDailyNutrition } = useNutritionStore();
  const { user } = useUserStore();
  
  // Get last 7 days of data
  const getWeeklyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      const nutrition = getDailyNutrition(dateStr);
      const calorieGoal = user?.goals?.calories || 2000;
      const progress = Math.min((nutrition.calories / calorieGoal) * 100, 100);
      
      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        progress,
        calories: nutrition.calories,
        isToday: i === 0,
      });
    }
    return data;
  };
  
  const weeklyData = getWeeklyData();
  const maxHeight = 60;
  
  return (
    <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.container}>
      <ThemedText size="lg" weight="semibold" style={styles.title}>
        Weekly Progress
      </ThemedText>
      
      <View style={styles.chartContainer}>
        {weeklyData.map((day, index) => (
          <View key={index} style={styles.dayColumn}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((day.progress / 100) * maxHeight, 4),
                    backgroundColor: day.isToday 
                      ? Colors[theme].primary 
                      : day.progress >= 80 
                        ? Colors[theme].success 
                        : day.progress >= 50 
                          ? Colors[theme].secondary 
                          : Colors[theme].border,
                  },
                ]}
              />
            </View>
            <ThemedText 
              size="xs" 
              color={day.isToday ? "primary" : "subtext"}
              weight={day.isToday ? "semibold" : "regular"}
              style={styles.dayLabel}
            >
              {day.day}
            </ThemedText>
          </View>
        ))}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors[theme].success }]} />
          <ThemedText size="xs" color="subtext">80%+ Goal</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors[theme].secondary }]} />
          <ThemedText size="xs" color="subtext">50-79% Goal</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors[theme].border }]} />
          <ThemedText size="xs" color="subtext">Below 50%</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 20,
  },
  title: {
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 16,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 60,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  dayLabel: {
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default WeeklyProgressChart;