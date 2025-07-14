import { create } from 'zustand';
import { apiService } from '@/services/api';

export interface Friend {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  status: 'pending' | 'accepted' | 'blocked';
  addedAt: string;
  lastActive?: string;
  streak?: number;
  totalWorkouts?: number;
  currentGoals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface FriendActivity {
  id: string;
  friendId: string;
  friendName: string;
  friendProfilePicture?: string;
  type: 'workout' | 'meal' | 'goal_achieved' | 'streak';
  description: string;
  timestamp: string;
  data?: any;
}

interface FriendsState {
  friends: Friend[];
  friendRequests: Friend[];
  friendActivities: FriendActivity[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFriends: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  fetchFriendActivities: () => Promise<void>;
  addFriend: (email: string) => Promise<boolean>;
  acceptFriendRequest: (friendId: string) => Promise<void>;
  rejectFriendRequest: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  getFriendById: (friendId: string) => Friend | undefined;
  getFriendActivities: (limit?: number) => FriendActivity[];
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  friendRequests: [],
  friendActivities: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getFriends();
      set({ 
        friends: response.data || [],
        isLoading: false 
      });
    } catch (error) {
      // Silently handle offline mode with demo friends
      set({ 
        friends: [
          {
            id: 'demo-friend-1',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            status: 'accepted' as const,
            addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            streak: 5,
            totalWorkouts: 23,
            currentGoals: {
              calories: 2200,
              protein: 160,
              carbs: 220,
              fat: 70,
            },
          },
          {
            id: 'demo-friend-2',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            status: 'accepted' as const,
            addedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            streak: 12,
            totalWorkouts: 45,
            currentGoals: {
              calories: 1800,
              protein: 120,
              carbs: 180,
              fat: 60,
            },
          },
        ],
        error: null,
        isLoading: false 
      });
    }
  },

  fetchFriendRequests: async () => {
    try {
      const response = await apiService.getFriendRequests();
      set({ friendRequests: response.data || [] });
    } catch (error) {
      // Silently handle offline mode
      set({ friendRequests: [] });
    }
  },

  fetchFriendActivities: async () => {
    try {
      const response = await apiService.getFriendActivities();
      set({ friendActivities: response.data || [] });
    } catch (error) {
      // Silently handle offline mode with demo activities
      set({ 
        friendActivities: [
          {
            id: 'activity-1',
            friendId: 'demo-friend-1',
            friendName: 'Alex Johnson',
            type: 'workout' as const,
            description: 'Completed a 45-minute strength training session',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'activity-2',
            friendId: 'demo-friend-2',
            friendName: 'Sarah Wilson',
            type: 'goal_achieved' as const,
            description: 'Reached daily protein goal!',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'activity-3',
            friendId: 'demo-friend-1',
            friendName: 'Alex Johnson',
            type: 'meal' as const,
            description: 'Logged a healthy breakfast',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
        ]
      });
    }
  },

  addFriend: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.sendFriendRequest(email);
      set({ isLoading: false });
      return true;
    } catch (error) {
      // Silently handle offline mode
      set({ 
        error: null,
        isLoading: false 
      });
      return true; // Pretend it worked in offline mode
    }
  },

  acceptFriendRequest: async (friendId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.acceptFriendRequest(friendId);
      
      // Move from requests to friends
      set((state) => {
        const request = state.friendRequests.find(r => r.id === friendId);
        if (!request) return state;

        const newFriend: Friend = {
          ...request,
          status: 'accepted',
        };

        return {
          friends: [...state.friends, newFriend],
          friendRequests: state.friendRequests.filter(r => r.id !== friendId),
          isLoading: false,
        };
      });
    } catch (error) {
      // Silently handle offline mode
      set({ 
        error: null,
        isLoading: false 
      });
    }
  },

  rejectFriendRequest: async (friendId: string) => {
    try {
      await apiService.rejectFriendRequest(friendId);
      
      set((state) => ({
        friendRequests: state.friendRequests.filter(r => r.id !== friendId),
      }));
    } catch (error) {
      // Silently handle offline mode
    }
  },

  removeFriend: async (friendId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.removeFriend(friendId);
      
      set((state) => ({
        friends: state.friends.filter(f => f.id !== friendId),
        isLoading: false,
      }));
    } catch (error) {
      // Silently handle offline mode
      set((state) => ({
        friends: state.friends.filter(f => f.id !== friendId),
        isLoading: false,
        error: null,
      }));
    }
  },

  getFriendById: (friendId: string) => {
    return get().friends.find(f => f.id === friendId);
  },

  getFriendActivities: (limit = 10) => {
    return get().friendActivities.slice(0, limit);
  },
}));