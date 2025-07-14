import { create } from 'zustand';
import { authService, User } from '@/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      await authService.initialize();
      const user = authService.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: authService.isAuthenticated(),
        isLoading: false 
      });
    } catch (error) {
      // Silently handle initialization errors
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.login(email, password);
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.register(email, password, name);
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error) {
      // Silently handle logout errors
      set({ isLoading: false });
    }
  },

  updateUser: async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateUser(userData);
      set({ user: updatedUser });
    } catch (error) {
      // Silently handle update errors
      throw error;
    }
  },
}));