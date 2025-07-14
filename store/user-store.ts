import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { NutritionGoals, UserProfile } from '@/types';

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateGoals: (goals: NutritionGoals) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setPremiumStatus: (isPremium: boolean, premiumUntil?: string) => void;
  logout: () => void;
}

const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

const defaultUser: UserProfile = {
  id: '1',
  name: 'User',
  email: 'user@example.com',
  profilePicture: '',
  goals: defaultGoals,
  isPremium: false,
  theme: 'light',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: defaultUser,
      setUser: (user) => set({ user }),
      updateGoals: (goals) => 
        set((state) => ({
          user: state.user ? { ...state.user, goals } : null,
        })),
      updateProfile: (profile) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...profile } : null,
        })),
      setPremiumStatus: (isPremium, premiumUntil) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, isPremium, premiumUntil }
            : null,
        })),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);