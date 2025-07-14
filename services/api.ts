const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.fitiq.app';

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
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
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
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'food.jpg',
    } as any);

    return this.request<any[]>('/food/analyze-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
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
    return this.request<{ response: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async getMealSuggestions(nutritionData: any) {
    return this.request<any[]>('/ai/meal-suggestions', {
      method: 'POST',
      body: JSON.stringify(nutritionData),
    });
  }
}

export const apiService = new ApiService();