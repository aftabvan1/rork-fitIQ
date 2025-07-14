import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Theme from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';

interface MacroProgressProps {
  current: number;
  goal: number;
  type: 'calories' | 'protein' | 'carbs' | 'fat';
  showLabel?: boolean;
}

export const MacroProgress: React.FC<MacroProgressProps> = ({
  current,
  goal,
  type,
  showLabel = true,
}) => {
  const { theme } = useThemeStore();
  const progress = Math.min(current / goal, 1);
  
  const getColor = () => {
    switch (type) {
      case 'protein':
        return Colors[theme].protein;
      case 'carbs':
        return Colors[theme].carbs;
      case 'fat':
        return Colors[theme].fat;
      case 'calories':
      default:
        return Colors[theme].primary;
    }
  };
  
  const getLabel = () => {
    switch (type) {
      case 'protein':
        return 'Protein';
      case 'carbs':
        return 'Carbs';
      case 'fat':
        return 'Fat';
      case 'calories':
      default:
        return 'Calories';
    }
  };
  
  const getUnit = () => {
    return type === 'calories' ? 'kcal' : 'g';
  };
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <ThemedText weight="semibold" size="sm">{getLabel()}</ThemedText>
          <ThemedText size="sm" color="subtext">
            {current.toFixed(0)}/{goal.toFixed(0)} {getUnit()}
          </ThemedText>
        </View>
      )}
      <View style={[styles.progressBar, { backgroundColor: Colors[theme].border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: getColor(),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 20,
  },
});

export default MacroProgress;