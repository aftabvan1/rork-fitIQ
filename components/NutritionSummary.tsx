import { NutritionGoals } from '@/types';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MacroProgress from './MacroProgress';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goals: NutritionGoals;
  compact?: boolean;
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  calories,
  protein,
  carbs,
  fat,
  goals,
  compact = false,
}) => {
  const { theme } = useThemeStore();
  const remaining = goals.calories - calories;
  
  return (
    <ThemedView backgroundColor="card" shadow="md" rounded="xxl" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statItem}>
          <ThemedText size="xxl" weight="bold" style={styles.statNumber}>
            {calories.toFixed(0)}
          </ThemedText>
          <ThemedText size="sm" color="subtext" weight="medium">
            consumed
          </ThemedText>
        </View>
        
        <View style={[styles.divider, { backgroundColor: Colors[theme].border }]} />
        
        <View style={styles.statItem}>
          <ThemedText size="xxl" weight="bold" style={[styles.statNumber, { color: Colors[theme].primary }]}>
            {remaining > 0 ? remaining.toFixed(0) : '0'}
          </ThemedText>
          <ThemedText size="sm" color="subtext" weight="medium">
            remaining
          </ThemedText>
        </View>
        
        <View style={[styles.divider, { backgroundColor: Colors[theme].border }]} />
        
        <View style={styles.statItem}>
          <ThemedText size="xxl" weight="bold" style={styles.statNumber}>
            {goals.calories.toFixed(0)}
          </ThemedText>
          <ThemedText size="sm" color="subtext" weight="medium">
            goal
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <MacroProgress
          current={calories}
          goal={goals.calories}
          type="calories"
          showLabel={!compact}
        />
        <MacroProgress
          current={protein}
          goal={goals.protein}
          type="protein"
          showLabel={!compact}
        />
        <MacroProgress
          current={carbs}
          goal={goals.carbs}
          type="carbs"
          showLabel={!compact}
        />
        <MacroProgress
          current={fat}
          goal={goals.fat}
          type="fat"
          showLabel={!compact}
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    marginBottom: 4,
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
  progressContainer: {
    gap: 16,
  },
});

export default NutritionSummary;