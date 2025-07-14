import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Theme from '@/constants/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  date,
  onDateChange,
}) => {
  const { theme } = useThemeStore();
  
  const goToPreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };
  
  const goToToday = () => {
    onDateChange(new Date());
  };
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  const isToday = date.toDateString() === new Date().toDateString();
  
  return (
    <ThemedView backgroundColor="card" shadow="sm" rounded="xl" style={styles.container}>
      <Pressable
        style={[styles.arrowButton, { backgroundColor: Colors[theme].background }]}
        onPress={goToPreviousDay}
      >
        <ChevronLeft size={24} color={Colors[theme].text} />
      </Pressable>
      
      <Pressable onPress={goToToday} style={styles.dateContainer}>
        <ThemedText size="xl" weight="bold">
          {formatDate(date)}
        </ThemedText>
        {!isToday && (
          <ThemedText size="xs" color="primary" weight="semibold" style={styles.todayText}>
            Go to Today
          </ThemedText>
        )}
      </Pressable>
      
      <Pressable
        style={[styles.arrowButton, { backgroundColor: Colors[theme].background }]}
        onPress={goToNextDay}
      >
        <ChevronRight size={24} color={Colors[theme].text} />
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    flex: 1,
  },
  todayText: {
    marginTop: 4,
  },
});

export default DateSelector;