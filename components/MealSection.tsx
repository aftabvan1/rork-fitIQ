import { MealEntry, MealType } from '@/types';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import FoodCard from './FoodCard';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';
import { useRouter } from 'expo-router';

interface MealSectionProps {
  title: string;
  mealType: MealType;
  entries: MealEntry[];
  totalCalories: number;
  onAddFood: (mealType: MealType) => void;
  onEntryPress: (entry: MealEntry) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  title,
  mealType,
  entries,
  totalCalories,
  onAddFood,
  onEntryPress,
}) => {
  const { theme } = useThemeStore();
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const handleAddFood = () => {
    onAddFood(mealType);
  };
  
  return (
    <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.container}>
      <Pressable onPress={toggleExpanded} style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText weight="bold" size="lg">
            {title}
          </ThemedText>
          <View style={[styles.calorieChip, { backgroundColor: Colors[theme].primary + '20' }]}>
            <ThemedText size="sm" weight="semibold" style={{ color: Colors[theme].primary }}>
              {totalCalories} kcal
            </ThemedText>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.addButton, { backgroundColor: Colors[theme].primary }]}
            onPress={handleAddFood}
          >
            <Plus size={18} color={Colors[theme].background} />
          </Pressable>
          {expanded ? (
            <ChevronUp size={24} color={Colors[theme].text} />
          ) : (
            <ChevronDown size={24} color={Colors[theme].text} />
          )}
        </View>
      </Pressable>
      
      {expanded && (
        <View style={styles.content}>
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <FoodCard
                key={`${mealType}-${entry.id}-${index}`}
                food={entry.food}
                onPress={() => onEntryPress(entry)}
                compact
              />
            ))
          ) : (
            <ThemedView 
              backgroundColor="background" 
              rounded="lg" 
              style={styles.emptyContainer}
            >
              <ThemedText color="subtext" style={styles.emptyText}>
                No foods added yet
              </ThemedText>
            </ThemedView>
          )}
          <Pressable
            style={[styles.addFoodButton, { backgroundColor: Colors[theme].primary + '10' }]}
            onPress={handleAddFood}
          >
            <Plus size={16} color={Colors[theme].primary} style={styles.addIcon} />
            <ThemedText color="primary" weight="semibold">Add food</ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calorieChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  addIcon: {
    marginRight: 8,
  },
});

export default MealSection;