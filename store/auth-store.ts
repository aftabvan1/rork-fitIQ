import { create } from 'zustand';
import { authService, User } from '@/services/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.initialize();
      const user = authService.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: authService.isAuthenticated(),
        isLoading: false 
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Initialization failed',
        isLoading: false 
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, password);
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(email, password, name);
      set({ 
        user, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      console.error('Registration error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false 
      });
    }
  },

  updateUser: async (userData: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateUser(userData);
      set({ 
        user: updatedUser,
        isLoading: false 
      });
    } catch (error) {
      console.error('Update user error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Update failed',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));