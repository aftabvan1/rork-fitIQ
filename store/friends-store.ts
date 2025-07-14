import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  addFriend: (email: string) => Promise<boolean>;
  acceptFriendRequest: (friendId: string) => void;
  rejectFriendRequest: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  getFriendById: (friendId: string) => Friend | undefined;
  addFriendActivity: (activity: Omit<FriendActivity, 'id'>) => void;
  getFriendActivities: (limit?: number) => FriendActivity[];
}

// Mock friends data for demo
const mockFriends: Friend[] = [
  {
    id: 'friend1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?q=80&w=150',
    status: 'accepted',
    addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    streak: 12,
    totalWorkouts: 45,
    currentGoals: {
      calories: 1800,
      protein: 120,
      carbs: 180,
      fat: 60,
    },
  },
  {
    id: 'friend2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    status: 'accepted',
    addedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    streak: 8,
    totalWorkouts: 32,
    currentGoals: {
      calories: 2200,
      protein: 160,
      carbs: 220,
      fat: 75,
    },
  },
  {
    id: 'friend3',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150',
    status: 'accepted',
    addedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    streak: 15,
    totalWorkouts: 67,
    currentGoals: {
      calories: 1900,
      protein: 130,
      carbs: 190,
      fat: 65,
    },
  },
];

const mockFriendRequests: Friend[] = [
  {
    id: 'request1',
    name: 'Alex Rodriguez',
    email: 'alex@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
    status: 'pending',
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockActivities: FriendActivity[] = [
  {
    id: 'activity1',
    friendId: 'friend1',
    friendName: 'Sarah Johnson',
    friendProfilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?q=80&w=150',
    type: 'workout',
    description: 'completed a 45-minute strength training session',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'activity2',
    friendId: 'friend2',
    friendName: 'Mike Chen',
    friendProfilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    type: 'streak',
    description: 'reached an 8-day logging streak! 🔥',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'activity3',
    friendId: 'friend3',
    friendName: 'Emma Wilson',
    friendProfilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150',
    type: 'goal_achieved',
    description: 'hit their protein goal for the day! 💪',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'activity4',
    friendId: 'friend1',
    friendName: 'Sarah Johnson',
    friendProfilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?q=80&w=150',
    type: 'meal',
    description: 'logged a healthy quinoa bowl for lunch',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: mockFriends,
      friendRequests: mockFriendRequests,
      friendActivities: mockActivities,
      
      addFriend: async (email: string) => {
        // In a real app, this would make an API call
        // For demo, we'll simulate finding a user
        const mockUser: Friend = {
          id: `friend_${Date.now()}`,
          name: email.split('@')[0],
          email,
          status: 'pending',
          addedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          friendRequests: [...state.friendRequests, mockUser],
        }));
        
        return true;
      },
      
      acceptFriendRequest: (friendId: string) => {
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
          };
        });
      },
      
      rejectFriendRequest: (friendId: string) => {
        set((state) => ({
          friendRequests: state.friendRequests.filter(r => r.id !== friendId),
        }));
      },
      
      removeFriend: (friendId: string) => {
        set((state) => ({
          friends: state.friends.filter(f => f.id !== friendId),
        }));
      },
      
      getFriendById: (friendId: string) => {
        return get().friends.find(f => f.id === friendId);
      },
      
      addFriendActivity: (activity) => {
        const newActivity: FriendActivity = {
          ...activity,
          id: `activity_${Date.now()}`,
        };
        
        set((state) => ({
          friendActivities: [newActivity, ...state.friendActivities].slice(0, 50), // Keep last 50 activities
        }));
      },
      
      getFriendActivities: (limit = 10) => {
        return get().friendActivities.slice(0, limit);
      },
    }),
    {
      name: 'friends-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);