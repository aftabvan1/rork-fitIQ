import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  isPremium: boolean;
  premiumUntil?: string;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  weight?: number;
  height?: number;
  age?: number;
  theme: 'light' | 'dark';
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  async initialize() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_KEY);

      if (token && userData) {
        this.token = token;
        this.currentUser = JSON.parse(userData);
        apiService.setToken(token);
        
        // Verify token is still valid
        try {
          const response = await apiService.getProfile();
          this.currentUser = response.data;
        } catch (error) {
          // Token expired, clear auth data
          await this.logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiService.login(email, password);
      
      this.token = response.data.token;
      this.currentUser = response.data.user;
      
      await AsyncStorage.setItem(TOKEN_KEY, this.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
      
      apiService.setToken(this.token);
      
      return this.currentUser!;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const response = await apiService.register(email, password, name);
      
      this.token = response.data.token;
      this.currentUser = response.data.user;
      
      await AsyncStorage.setItem(TOKEN_KEY, this.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
      
      apiService.setToken(this.token);
      
      return this.currentUser!;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      
      this.token = null;
      this.currentUser = null;
      apiService.setToken('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.currentUser !== null;
  }

  async updateUser(userData: Partial<User>) {
    if (!this.currentUser) return;

    try {
      const response = await apiService.updateProfile(userData);
      this.currentUser = { ...this.currentUser, ...response.data };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
      return this.currentUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();