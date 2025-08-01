const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Check if backend is available
let backendAvailable = false;
let backendCheckPromise: Promise<boolean> | null = null;

const checkBackendAvailability = async (): Promise<boolean> => {
  if (backendCheckPromise) {
    return backendCheckPromise;
  }
  
  backendCheckPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      backendAvailable = response.ok;
      console.log('Backend availability check:', backendAvailable);
      return backendAvailable;
    } catch (error) {
      console.log('Backend health check failed:', error);
      backendAvailable = false;
      return false;
    }
  })();
  
  return backendCheckPromise;
};

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipBackendCheck = false
  ): Promise<ApiResponse<T>> {
    // Check backend availability first (except for health check and certain endpoints)
    const skipBackendCheckEndpoints = ['/health'];
    if (!skipBackendCheck && !skipBackendCheckEndpoints.some(ep => endpoint === ep)) {
      const isAvailable = await checkBackendAvailability();
      if (!isAvailable) {
        throw new Error('Backend service is not available. Please check your connection or contact support.');
      }
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token && this.token !== 'demo-token') {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error(`API Error (${response.status}):`, data);
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`API Success for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; message: string }>('/health', {
      method: 'GET',
    }, true);
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async refreshToken() {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile() {
    return this.request<any>('/user/profile');
  }

  async updateProfile(data: any) {
    return this.request<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadProfilePicture(imageUri: string) {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    return this.request<{ url: string }>('/user/profile-picture', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  // Food endpoints
  async searchFood(query: string) {
    return this.request<any[]>(`/food/search?q=${encodeURIComponent(query)}`);
  }

  async getFoodByBarcode(barcode: string) {
    return this.request<any>(`/food/barcode/${barcode}`);
  }

  async analyzeFoodPhoto(imageUri: string) {
    // This method is deprecated - food photo analysis is now handled directly in the nutrition store
    // using the external AI service to avoid backend dependency
    throw new Error('This method is deprecated. Use the nutrition store analyzeFoodPhoto method instead.');
  }

  // Nutrition endpoints
  async getDailyNutrition(date: string) {
    return this.request<any>(`/nutrition/daily/${date}`);
  }

  async addMealEntry(entry: any) {
    return this.request<any>('/nutrition/meal-entry', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateMealEntry(entryId: string, entry: any) {
    return this.request<any>(`/nutrition/meal-entry/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deleteMealEntry(entryId: string) {
    return this.request<any>(`/nutrition/meal-entry/${entryId}`, {
      method: 'DELETE',
    });
  }

  // Workout endpoints
  async getWorkouts() {
    return this.request<any[]>('/workouts');
  }

  async createWorkout(workout: any) {
    return this.request<any>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    });
  }

  async updateWorkout(workoutId: string, workout: any) {
    return this.request<any>(`/workouts/${workoutId}`, {
      method: 'PUT',
      body: JSON.stringify(workout),
    });
  }

  async deleteWorkout(workoutId: string) {
    return this.request<any>(`/workouts/${workoutId}`, {
      method: 'DELETE',
    });
  }

  async getExerciseTemplates() {
    return this.request<any[]>('/exercises/templates');
  }

  // Friends endpoints
  async getFriends() {
    return this.request<any[]>('/friends');
  }

  async getFriendRequests() {
    return this.request<any[]>('/friends/requests');
  }

  async sendFriendRequest(email: string) {
    return this.request<any>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async acceptFriendRequest(requestId: string) {
    return this.request<any>(`/friends/request/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async rejectFriendRequest(requestId: string) {
    return this.request<any>(`/friends/request/${requestId}/reject`, {
      method: 'POST',
    });
  }

  async removeFriend(friendId: string) {
    return this.request<any>(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  }

  async getFriendActivities() {
    return this.request<any[]>('/friends/activities');
  }

  // Subscription endpoints
  async getSubscriptionStatus() {
    return this.request<any>('/subscription/status');
  }

  async createSubscription(paymentMethodId: string) {
    return this.request<any>('/subscription/create', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId }),
    });
  }

  async cancelSubscription() {
    return this.request<any>('/subscription/cancel', {
      method: 'POST',
    });
  }

  // AI Assistant endpoints
  async chatWithAssistant(messages: any[]) {
    // Use external AI service instead of backend for now
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        throw new Error('AI service unavailable');
      }
      
      const data = await response.json();
      return { data: { response: data.completion }, success: true };
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  async getMealSuggestions(nutritionData: any) {
    return this.request<any[]>('/ai/meal-suggestions', {
      method: 'POST',
      body: JSON.stringify(nutritionData),
    });
  }

  // Backend status check
  async getBackendStatus() {
    try {
      const health = await this.healthCheck();
      return {
        available: true,
        status: health.data.status,
        message: health.data.message,
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const apiService = new ApiService();