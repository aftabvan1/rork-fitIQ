import { useWorkoutStore } from "@/store/workout-store";
import { useThemeStore } from "@/store/theme-store";
import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Plus, Play, Pause, RotateCcw, Trophy, TrendingUp, Calendar } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { formatDate } from "@/utils/dateUtils";

export default function WorkoutScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { 
    currentWorkout, 
    workoutHistory, 
    startWorkout, 
    endWorkout, 
    addExercise,
    getWeeklyStats 
  } = useWorkoutStore();
  
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const weeklyStats = getWeeklyStats();
  const todaysWorkouts = workoutHistory.filter(w => 
    w.date === formatDate(new Date()) && w.completed
  );
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && currentWorkout) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentWorkout]);
  
  // Auto-start timer when workout begins
  useEffect(() => {
    if (currentWorkout && !currentWorkout.completed) {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
      setTimer(0);
    }
  }, [currentWorkout]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartWorkout = () => {
    startWorkout();
    setTimer(0);
    setIsTimerRunning(true);
  };
  
  const handleEndWorkout = () => {
    if (currentWorkout) {
      endWorkout(timer);
      setIsTimerRunning(false);
      setTimer(0);
    }
  };
  
  const handleAddExercise = () => {
    router.push("/exercise-selector");
  };
  
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };
  
  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };
  
  const renderWorkoutHistory = ({ item }: { item: any }) => (
    <ThemedView backgroundColor="card" shadow="sm" rounded="xl" style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <ThemedText weight="semibold" size="lg">
          {item.name || "Workout"}
        </ThemedText>
        <ThemedText size="sm" color="subtext">
          {new Date(item.startTime).toLocaleDateString()}
        </ThemedText>
      </View>
      
      <View style={styles.historyStats}>
        <View style={styles.historyStat}>
          <ThemedText size="sm" color="subtext">Duration</ThemedText>
          <ThemedText weight="semibold">
            {Math.floor(item.duration / 60)}m {item.duration % 60}s
          </ThemedText>
        </View>
        <View style={styles.historyStat}>
          <ThemedText size="sm" color="subtext">Exercises</ThemedText>
          <ThemedText weight="semibold">
            {item.exercises.length}
          </ThemedText>
        </View>
        <View style={styles.historyStat}>
          <ThemedText size="sm" color="subtext">Total Sets</ThemedText>
          <ThemedText weight="semibold">
            {item.exercises.reduce((total: number, ex: any) => total + ex.sets.length, 0)}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
  
  const renderCurrentExercise = ({ item }: { item: any }) => (
    <ThemedView backgroundColor="card" shadow="sm" rounded="xl" style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <ThemedText weight="semibold" size="lg">
          {item.name}
        </ThemedText>
        <ThemedText size="sm" color="subtext">
          {item.category}
        </ThemedText>
      </View>
      
      <View style={styles.setsContainer}>
        {item.sets.map((set: any, index: number) => (
          <View key={index} style={styles.setRow}>
            <ThemedText size="sm" color="subtext" style={styles.setNumber}>
              Set {index + 1}
            </ThemedText>
            <ThemedText weight="medium">
              {set.weight}kg × {set.reps} reps
            </ThemedText>
            <View style={[
              styles.setStatus,
              { backgroundColor: set.completed ? Colors[theme].success : Colors[theme].border }
            ]}>
              <ThemedText size="xs" color={set.completed ? "background" : "subtext"}>
                {set.completed ? "✓" : "○"}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Stats Overview */}
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Trophy size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.statsTitle}>
                This Week
              </ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText size="xxl" weight="bold" style={{ color: Colors[theme].primary }}>
                  {weeklyStats.workouts}
                </ThemedText>
                <ThemedText size="sm" color="subtext">Workouts</ThemedText>
              </View>
              
              <View style={[styles.divider, { backgroundColor: Colors[theme].border }]} />
              
              <View style={styles.statItem}>
                <ThemedText size="xxl" weight="bold" style={{ color: Colors[theme].secondary }}>
                  {Math.floor(weeklyStats.totalDuration / 60)}
                </ThemedText>
                <ThemedText size="sm" color="subtext">Minutes</ThemedText>
              </View>
              
              <View style={[styles.divider, { backgroundColor: Colors[theme].border }]} />
              
              <View style={styles.statItem}>
                <ThemedText size="xxl" weight="bold" style={{ color: Colors[theme].success }}>
                  {weeklyStats.totalSets}
                </ThemedText>
                <ThemedText size="sm" color="subtext">Sets</ThemedText>
              </View>
            </View>
          </ThemedView>
          
          {/* Current Workout */}
          {currentWorkout && !currentWorkout.completed ? (
            <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.currentWorkoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutTitleContainer}>
                  <Play size={24} color={Colors[theme].primary} />
                  <ThemedText size="xl" weight="bold" style={styles.workoutTitle}>
                    Current Workout
                  </ThemedText>
                </View>
                
                <View style={styles.timerContainer}>
                  <ThemedText size="xxl" weight="bold" style={{ color: Colors[theme].primary }}>
                    {formatTime(timer)}
                  </ThemedText>
                  <View style={styles.timerControls}>
                    <Pressable
                      style={[styles.timerButton, { backgroundColor: Colors[theme].primary }]}
                      onPress={toggleTimer}
                    >
                      {isTimerRunning ? (
                        <Pause size={16} color="#fff" />
                      ) : (
                        <Play size={16} color="#fff" />
                      )}
                    </Pressable>
                    <Pressable
                      style={[styles.timerButton, { backgroundColor: Colors[theme].border }]}
                      onPress={resetTimer}
                    >
                      <RotateCcw size={16} color={Colors[theme].text} />
                    </Pressable>
                  </View>
                </View>
              </View>
              
              {currentWorkout.exercises.length > 0 ? (
                <FlatList
                  data={currentWorkout.exercises}
                  renderItem={renderCurrentExercise}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  style={styles.exercisesList}
                />
              ) : (
                <ThemedView backgroundColor="background" rounded="lg" style={styles.emptyExercises}>
                  <ThemedText color="subtext" style={styles.emptyText}>
                    No exercises added yet
                  </ThemedText>
                </ThemedView>
              )}
              
              <View style={styles.workoutActions}>
                <Button
                  title="Add Exercise"
                  onPress={handleAddExercise}
                  variant="outline"
                  style={styles.addExerciseButton}
                  leftIcon={<Plus size={18} color={Colors[theme].primary} />}
                />
                <Button
                  title="End Workout"
                  onPress={handleEndWorkout}
                  style={styles.endWorkoutButton}
                />
              </View>
            </ThemedView>
          ) : (
            /* Start Workout */
            <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.startWorkoutCard}>
              <View style={styles.startWorkoutContent}>
                <View style={styles.startWorkoutIcon}>
                  <Play size={32} color={Colors[theme].primary} />
                </View>
                <ThemedText size="xl" weight="bold" style={styles.startWorkoutTitle}>
                  Ready to Workout?
                </ThemedText>
                <ThemedText color="subtext" style={styles.startWorkoutSubtitle}>
                  Start a new workout session and track your progress
                </ThemedText>
                
                {todaysWorkouts.length > 0 && (
                  <View style={styles.todayStats}>
                    <ThemedText size="sm" weight="semibold" style={{ color: Colors[theme].success }}>
                      🎉 {todaysWorkouts.length} workout{todaysWorkouts.length > 1 ? 's' : ''} completed today!
                    </ThemedText>
                  </View>
                )}
                
                <Button
                  title="Start Workout"
                  onPress={handleStartWorkout}
                  style={styles.startButton}
                  leftIcon={<Play size={20} color={Colors[theme].background} />}
                />
              </View>
            </ThemedView>
          )}
          
          {/* Recent Workouts */}
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.historySection}>
            <View style={styles.historySectionHeader}>
              <Calendar size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.historySectionTitle}>
                Recent Workouts
              </ThemedText>
            </View>
            
            {workoutHistory.filter(w => w.completed).slice(0, 5).length > 0 ? (
              <FlatList
                data={workoutHistory.filter(w => w.completed).slice(0, 5)}
                renderItem={renderWorkoutHistory}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <ThemedView backgroundColor="background" rounded="lg" style={styles.emptyHistory}>
                <ThemedText color="subtext" style={styles.emptyText}>
                  No workout history yet. Start your first workout!
                </ThemedText>
              </ThemedView>
            )}
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
  statsCard: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
  currentWorkoutCard: {
    padding: 20,
    marginBottom: 20,
  },
  workoutHeader: {
    marginBottom: 20,
  },
  workoutTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  workoutTitle: {
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  timerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exercisesList: {
    marginBottom: 20,
  },
  exerciseCard: {
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  setNumber: {
    width: 50,
  },
  setStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyExercises: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addExerciseButton: {
    flex: 1,
  },
  endWorkoutButton: {
    flex: 1,
  },
  startWorkoutCard: {
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  startWorkoutContent: {
    alignItems: 'center',
  },
  startWorkoutIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  startWorkoutTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  startWorkoutSubtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  todayStats: {
    marginBottom: 20,
  },
  startButton: {
    width: '100%',
    maxWidth: 200,
  },
  historySection: {
    padding: 20,
  },
  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  historySectionTitle: {
    flex: 1,
  },
  historyCard: {
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStat: {
    alignItems: 'center',
  },
  emptyHistory: {
    padding: 24,
    alignItems: 'center',
  },
});