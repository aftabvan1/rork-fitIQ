import { FriendActivity } from '@/store/friends-store';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import { Image } from 'expo-image';
import { User, Dumbbell, Utensils, Target, Zap } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ThemedText from './ThemedText';
import ThemedView from './ThemedView';

interface ActivityFeedProps {
  activities: FriendActivity[];
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 5,
}) => {
  const { theme } = useThemeStore();
  
  const getActivityIcon = (type: FriendActivity['type']) => {
    switch (type) {
      case 'workout':
        return <Dumbbell size={16} color={Colors[theme].success} />;
      case 'meal':
        return <Utensils size={16} color={Colors[theme].info} />;
      case 'goal_achieved':
        return <Target size={16} color={Colors[theme].primary} />;
      case 'streak':
        return <Zap size={16} color={Colors[theme].secondary} />;
      default:
        return <User size={16} color={Colors[theme].text} />;
    }
  };
  
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };
  
  const renderActivity = ({ item }: { item: FriendActivity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityLeft}>
        {item.friendProfilePicture ? (
          <Image
            source={{ uri: item.friendProfilePicture }}
            style={styles.activityAvatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.activityAvatar, { backgroundColor: Colors[theme].primary + '20' }]}>
            <User size={16} color={Colors[theme].primary} />
          </View>
        )}
        
        <View style={[styles.activityIcon, { backgroundColor: Colors[theme].background }]}>
          {getActivityIcon(item.type)}
        </View>
      </View>
      
      <View style={styles.activityContent}>
        <ThemedText size="sm" style={styles.activityText}>
          <ThemedText weight="semibold">{item.friendName}</ThemedText>
          {' '}
          {item.description}
        </ThemedText>
        <ThemedText size="xs" color="subtext">
          {getTimeAgo(item.timestamp)} ago
        </ThemedText>
      </View>
    </View>
  );
  
  if (activities.length === 0) {
    return (
      <ThemedView backgroundColor="background" rounded="lg" style={styles.emptyContainer}>
        <ThemedText color="subtext" style={styles.emptyText}>
          No recent activity from friends
        </ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <FlatList
      data={activities.slice(0, maxItems)}
      renderItem={renderActivity}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={styles.feedContainer}
    />
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityLeft: {
    position: 'relative',
    marginRight: 12,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityContent: {
    flex: 1,
    paddingTop: 2,
  },
  activityText: {
    lineHeight: 18,
    marginBottom: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default ActivityFeed;