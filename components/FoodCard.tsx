import { Food, MealType } from '@/types';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Theme from '@/constants/theme';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

interface FoodCardProps {
  food: Food;
  onPress: () => void;
  onAddPress?: (food: Food, mealType?: MealType) => void;
  compact?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  onAddPress,
  compact = false,
}) => {
  const { theme } = useThemeStore();
  
  const handleAddPress = (e: any) => {
    e.stopPropagation();
    if (onAddPress) {
      onAddPress(food);
    }
  };
  
  return (
    <Pressable onPress={onPress}>
      <ThemedView
        backgroundColor="card"
        shadow="sm"
        rounded="xl"
        style={[
          styles.container,
          compact ? styles.compactContainer : null,
        ]}
      >
        {food.image && (
          <View style={compact ? styles.compactImageContainer : styles.imageContainer}>
            <Image
              source={{ uri: food.image }}
              style={compact ? styles.compactImage : styles.image}
              contentFit="cover"
            />
          </View>
        )}
        <View style={styles.content}>
          <ThemedText weight="semibold" numberOfLines={1} style={styles.foodName}>
            {food.name}
          </ThemedText>
          {food.brand && (
            <ThemedText size="sm" color="subtext" numberOfLines={1} style={styles.brandName}>
              {food.brand}
            </ThemedText>
          )}
          <View style={styles.nutritionRow}>
            <ThemedText size="sm" weight="medium" style={styles.calories}>
              {food.calories} kcal
            </ThemedText>
            {!compact && (
              <View style={styles.macros}>
                <View style={[styles.macroChip, { backgroundColor: Colors[theme].protein + '20' }]}>
                  <ThemedText size="xs" style={{ color: Colors[theme].protein }}>
                    P: {food.protein}g
                  </ThemedText>
                </View>
                <View style={[styles.macroChip, { backgroundColor: Colors[theme].carbs + '20' }]}>
                  <ThemedText size="xs" style={{ color: Colors[theme].carbs }}>
                    C: {food.carbs}g
                  </ThemedText>
                </View>
                <View style={[styles.macroChip, { backgroundColor: Colors[theme].fat + '20' }]}>
                  <ThemedText size="xs" style={{ color: Colors[theme].fat }}>
                    F: {food.fat}g
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </View>
        {onAddPress && (
          <Pressable
            style={[
              styles.addButton,
              { backgroundColor: Colors[theme].primary },
              Theme.shadows[theme].sm,
            ]}
            onPress={handleAddPress}
          >
            <Plus size={16} color={Colors[theme].background} />
          </Pressable>
        )}
      </ThemedView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    padding: 16,
    alignItems: 'center',
  },
  compactContainer: {
    padding: 12,
    marginVertical: 4,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  compactImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: 64,
    height: 64,
  },
  compactImage: {
    width: 48,
    height: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  foodName: {
    marginBottom: 2,
  },
  brandName: {
    marginBottom: 6,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  calories: {
    marginRight: 12,
  },
  macros: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  macroChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default FoodCard;