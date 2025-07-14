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
      console.error('Fetch friends error:', error);
      set({ 
        error: 'Failed to fetch friends',
        isLoading: false 
      });
    }
  },

  fetchFriendRequests: async () => {
    try {
      const response = await apiService.getFriendRequests();
      set({ friendRequests: response.data || [] });
    } catch (error) {
      console.error('Fetch friend requests error:', error);
    }
  },

  fetchFriendActivities: async () => {
    try {
      const response = await apiService.getFriendActivities();
      set({ friendActivities: response.data || [] });
    } catch (error) {
      console.error('Fetch friend activities error:', error);
    }
  },

  addFriend: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.sendFriendRequest(email);
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Add friend error:', error);
      set({ 
        error: 'Failed to send friend request',
        isLoading: false 
      });
      return false;
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
      console.error('Accept friend request error:', error);
      set({ 
        error: 'Failed to accept friend request',
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
      console.error('Reject friend request error:', error);
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
      console.error('Remove friend error:', error);
      set({ 
        error: 'Failed to remove friend',
        isLoading: false 
      });
    }
  },

  getFriendById: (friendId: string) => {
    return get().friends.find(f => f.id === friendId);
  },

  getFriendActivities: (limit = 10) => {
    return get().friendActivities.slice(0, limit);
  },
}));