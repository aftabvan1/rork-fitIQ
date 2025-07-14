import { Friend } from '@/store/friends-store';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import { Image } from 'expo-image';
import { User, Zap, Dumbbell } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

interface FriendCardProps {
  friend: Friend;
  onPress: () => void;
  compact?: boolean;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onPress,
  compact = false,
}) => {
  const { theme } = useThemeStore();
  
  const getLastActiveText = () => {
    if (!friend.lastActive) return 'Never active';
    
    const now = new Date();
    const lastActive = new Date(friend.lastActive);
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };
  
  return (
    <Pressable onPress={onPress}>
      <ThemedView
        backgroundColor="card"
        shadow="sm"
        rounded="xl"
        style={[styles.container, compact && styles.compactContainer]}
      >
        <View style={styles.profileSection}>
          {friend.profilePicture ? (
            <Image
              source={{ uri: friend.profilePicture }}
              style={compact ? styles.compactAvatar : styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[
              compact ? styles.compactAvatar : styles.avatar,
              { backgroundColor: Colors[theme].primary + '20' }
            ]}>
              <User size={compact ? 20 : 24} color={Colors[theme].primary} />
            </View>
          )}
          
          <View style={styles.friendInfo}>
            <ThemedText weight="semibold" size={compact ? "md" : "lg"} numberOfLines={1}>
              {friend.name}
            </ThemedText>
            <ThemedText size="sm" color="subtext" numberOfLines={1}>
              {getLastActiveText()}
            </ThemedText>
          </View>
        </View>
        
        {!compact && (
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors[theme].secondary + '20' }]}>
                <Zap size={16} color={Colors[theme].secondary} />
              </View>
              <ThemedText size="sm" weight="semibold">
                {friend.streak || 0}
              </ThemedText>
              <ThemedText size="xs" color="subtext">
                streak
              </ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: Colors[theme].success + '20' }]}>
                <Dumbbell size={16} color={Colors[theme].success} />
              </View>
              <ThemedText size="sm" weight="semibold">
                {friend.totalWorkouts || 0}
              </ThemedText>
              <ThemedText size="xs" color="subtext">
                workouts
              </ThemedText>
            </View>
          </View>
        )}
      </ThemedView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 6,
  },
  compactContainer: {
    padding: 12,
    marginVertical: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default FriendCard;