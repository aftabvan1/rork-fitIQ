import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  restTime?: number;
}

export interface Workout {
  id: string;
  name?: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  exercises: Exercise[];
  completed: boolean;
  notes?: string;
}

interface WorkoutState {
  currentWorkout: Workout | null;
  workoutHistory: Workout[];
  exerciseTemplates: Exercise[];
  startWorkout: (name?: string) => void;
  endWorkout: (duration: number) => void;
  addExercise: (exercise: Omit<Exercise, 'id' | 'sets'>) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string, set: Omit<WorkoutSet, 'id'>) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  getWeeklyStats: () => { workouts: number; totalDuration: number; totalSets: number };
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

const defaultExerciseTemplates: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    category: 'Chest',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    sets: [],
  },
  {
    id: '2',
    name: 'Squat',
    category: 'Legs',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    sets: [],
  },
  {
    id: '3',
    name: 'Deadlift',
    category: 'Back',
    muscleGroups: ['Back', 'Hamstrings', 'Glutes'],
    sets: [],
  },
  {
    id: '4',
    name: 'Pull-ups',
    category: 'Back',
    muscleGroups: ['Back', 'Biceps'],
    sets: [],
  },
  {
    id: '5',
    name: 'Overhead Press',
    category: 'Shoulders',
    muscleGroups: ['Shoulders', 'Triceps'],
    sets: [],
  },
  {
    id: '6',
    name: 'Barbell Row',
    category: 'Back',
    muscleGroups: ['Back', 'Biceps'],
    sets: [],
  },
  {
    id: '7',
    name: 'Dips',
    category: 'Chest',
    muscleGroups: ['Chest', 'Triceps'],
    sets: [],
  },
  {
    id: '8',
    name: 'Lunges',
    category: 'Legs',
    muscleGroups: ['Quadriceps', 'Glutes'],
    sets: [],
  },
];

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      currentWorkout: null,
      workoutHistory: [],
      exerciseTemplates: defaultExerciseTemplates,
      
      startWorkout: (name) => {
        const workout: Workout = {
          id: generateId(),
          name,
          date: new Date().toISOString().split('T')[0],
          startTime: new Date().toISOString(),
          duration: 0,
          exercises: [],
          completed: false,
        };
        
        set({ currentWorkout: workout });
      },
      
      endWorkout: (duration) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        
        const completedWorkout: Workout = {
          ...currentWorkout,
          endTime: new Date().toISOString(),
          duration,
          completed: true,
        };
        
        set((state) => ({
          currentWorkout: null,
          workoutHistory: [completedWorkout, ...state.workoutHistory],
        }));
      },
      
      addExercise: (exerciseData) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        
        const exercise: Exercise = {
          ...exerciseData,
          id: generateId(),
          sets: [],
        };
        
        set((state) => ({
          currentWorkout: {
            ...state.currentWorkout!,
            exercises: [...state.currentWorkout!.exercises, exercise],
          },
        }));
      },
      
      removeExercise: (exerciseId) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        
        set((state) => ({
          currentWorkout: {
            ...state.currentWorkout!,
            exercises: state.currentWorkout!.exercises.filter(ex => ex.id !== exerciseId),
          },
        }));
      },
      
      addSet: (exerciseId, setData) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        
        const newSet: WorkoutSet = {
          ...setData,
          id: generateId(),
        };
        
        set((state) => ({
          currentWorkout: {
            ...state.currentWorkout!,
            exercises: state.currentWorkout!.exercises.map(ex =>
              ex.id === exerciseId
                ? { ...ex, sets: [...ex.sets, newSet] }
                : ex
            ),
          },
        }));
      },
      
      updateSet: (exerciseId, setId, updates) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        
        set((state) => ({
          currentWorkout: {
            ...state.currentWorkout!,
            exercises: state.currentWorkout!.exercises.map(ex =>
              ex.id === exerciseId
                ? {
                    ...ex,
                    sets: ex.sets.map(set =>
                      set.id === setId ? { ...set, ...updates } : set
                    ),
                  }
                : ex
            ),
          },
        }));
      },
      
      removeSet: (exerciseId, setId) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;
        
        set((state) => ({
          currentWorkout: {
            ...state.currentWorkout!,
            exercises: state.currentWorkout!.exercises.map(ex =>
              ex.id === exerciseId
                ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
                : ex
            ),
          },
        }));
      },
      
      getWeeklyStats: () => {
        const { workoutHistory } = get();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const weeklyWorkouts = workoutHistory.filter(workout => 
          workout.completed && new Date(workout.startTime) >= oneWeekAgo
        );
        
        return {
          workouts: weeklyWorkouts.length,
          totalDuration: weeklyWorkouts.reduce((total, workout) => total + workout.duration, 0),
          totalSets: weeklyWorkouts.reduce((total, workout) => 
            total + workout.exercises.reduce((exerciseTotal, exercise) => 
              exerciseTotal + exercise.sets.length, 0
            ), 0
          ),
        };
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);