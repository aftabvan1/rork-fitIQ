import { useWorkoutStore } from "@/store/workout-store";
import { useThemeStore } from "@/store/theme-store";
import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Search, Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";

export default function ExerciseSelectorScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { exerciseTemplates, addExercise } = useWorkoutStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredExercises = exerciseTemplates.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.muscleGroups.some(muscle => 
      muscle.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const handleSelectExercise = (exercise: any) => {
    addExercise({
      name: exercise.name,
      category: exercise.category,
      muscleGroups: exercise.muscleGroups,
    });
    router.back();
  };
  
  const renderExercise = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleSelectExercise(item)}>
      <ThemedView backgroundColor="card" shadow="sm" rounded="xl" style={styles.exerciseCard}>
        <View style={styles.exerciseInfo}>
          <ThemedText weight="semibold" size="lg" style={styles.exerciseName}>
            {item.name}
          </ThemedText>
          <ThemedText size="sm" color="subtext" style={styles.exerciseCategory}>
            {item.category}
          </ThemedText>
          <View style={styles.muscleGroups}>
            {item.muscleGroups.map((muscle: string, index: number) => (
              <View 
                key={index}
                style={[styles.muscleChip, { backgroundColor: Colors[theme].primary + '20' }]}
              >
                <ThemedText size="xs" style={{ color: Colors[theme].primary }}>
                  {muscle}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
        <View style={[styles.addButton, { backgroundColor: Colors[theme].primary }]}>
          <Plus size={20} color="#fff" />
        </View>
      </ThemedView>
    </Pressable>
  );
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { borderColor: Colors[theme].border }]}>
          <Search size={20} color={Colors[theme].subtext} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Search exercises..."
            placeholderTextColor={Colors[theme].subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.exercisesList}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  exercisesList: {
    padding: 16,
    paddingTop: 8,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    marginBottom: 4,
  },
  exerciseCategory: {
    marginBottom: 8,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
});