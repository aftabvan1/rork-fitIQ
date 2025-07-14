import { useFriendsStore } from "@/store/friends-store";
import { useThemeStore } from "@/store/theme-store";
import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Search, UserPlus, Users, Check, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Button from "@/components/Button";
import FriendCard from "@/components/FriendCard";
import ActivityFeed from "@/components/ActivityFeed";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";

export default function FriendsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { 
    friends, 
    friendRequests, 
    addFriend, 
    acceptFriendRequest, 
    rejectFriendRequest,
    getFriendActivities 
  } = useFriendsStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [addFriendEmail, setAddFriendEmail] = useState("");
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'activity'>('friends');
  
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const friendActivities = getFriendActivities(20);
  
  const handleAddFriend = async () => {
    if (!addFriendEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    
    if (!addFriendEmail.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    try {
      const success = await addFriend(addFriendEmail.trim());
      if (success) {
        Alert.alert("Success", "Friend request sent!");
        setAddFriendEmail("");
      } else {
        Alert.alert("Error", "User not found or already added");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send friend request");
    }
  };
  
  const handleAcceptRequest = (friendId: string) => {
    acceptFriendRequest(friendId);
    Alert.alert("Success", "Friend request accepted!");
  };
  
  const handleRejectRequest = (friendId: string) => {
    rejectFriendRequest(friendId);
  };
  
  const handleViewFriend = (friendId: string) => {
    router.push({
      pathname: "/friend-profile",
      params: { id: friendId },
    });
  };
  
  const renderFriend = ({ item }: { item: any }) => (
    <FriendCard
      friend={item}
      onPress={() => handleViewFriend(item.id)}
    />
  );
  
  const renderFriendRequest = ({ item }: { item: any }) => (
    <ThemedView backgroundColor="card" shadow="sm" rounded="xl" style={styles.requestCard}>
      <FriendCard
        friend={item}
        onPress={() => {}}
        compact
      />
      <View style={styles.requestActions}>
        <Pressable
          style={[styles.requestButton, { backgroundColor: Colors[theme].success }]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Check size={16} color="#fff" />
        </Pressable>
        <Pressable
          style={[styles.requestButton, { backgroundColor: Colors[theme].error }]}
          onPress={() => handleRejectRequest(item.id)}
        >
          <X size={16} color="#fff" />
        </Pressable>
      </View>
    </ThemedView>
  );
  
  const renderTabButton = (tab: typeof activeTab, title: string, count?: number) => (
    <Pressable
      style={[
        styles.tabButton,
        activeTab === tab && { backgroundColor: Colors[theme].primary },
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <ThemedText
        color={activeTab === tab ? "background" : "text"}
        weight="semibold"
      >
        {title}
        {count !== undefined && count > 0 && ` (${count})`}
      </ThemedText>
    </Pressable>
  );
  
  return (
    <ThemedView style={styles.container}>
      {/* Add Friend Section */}
      <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.addFriendSection}>
        <View style={styles.addFriendHeader}>
          <UserPlus size={24} color={Colors[theme].primary} />
          <ThemedText size="xl" weight="bold" style={styles.addFriendTitle}>
            Add Friends
          </ThemedText>
        </View>
        
        <View style={styles.addFriendInputContainer}>
          <TextInput
            style={[
              styles.addFriendInput,
              { 
                color: Colors[theme].text, 
                borderColor: Colors[theme].border,
                backgroundColor: Colors[theme].background,
              },
            ]}
            placeholder="Enter friend's email address"
            placeholderTextColor={Colors[theme].subtext}
            value={addFriendEmail}
            onChangeText={setAddFriendEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            title="Add"
            onPress={handleAddFriend}
            size="sm"
            style={styles.addFriendButton}
          />
        </View>
      </ThemedView>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('friends', 'Friends', friends.length)}
        {renderTabButton('requests', 'Requests', friendRequests.length)}
        {renderTabButton('activity', 'Activity')}
      </View>
      
      {/* Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'friends' && (
          <>
            {/* Search */}
            <View style={[styles.searchContainer, { borderColor: Colors[theme].border }]}>
              <Search size={20} color={Colors[theme].subtext} />
              <TextInput
                style={[styles.searchInput, { color: Colors[theme].text }]}
                placeholder="Search friends..."
                placeholderTextColor={Colors[theme].subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            {/* Friends List */}
            {filteredFriends.length > 0 ? (
              <FlatList
                data={filteredFriends}
                renderItem={renderFriend}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <ThemedView backgroundColor="background" rounded="lg" style={styles.emptyContainer}>
                <Users size={48} color={Colors[theme].subtext} />
                <ThemedText size="lg" weight="semibold" style={styles.emptyTitle}>
                  No Friends Yet
                </ThemedText>
                <ThemedText color="subtext" style={styles.emptyText}>
                  Add friends to see their nutrition progress and stay motivated together!
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
        
        {activeTab === 'requests' && (
          <>
            {friendRequests.length > 0 ? (
              <FlatList
                data={friendRequests}
                renderItem={renderFriendRequest}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <ThemedView backgroundColor="background" rounded="lg" style={styles.emptyContainer}>
                <UserPlus size={48} color={Colors[theme].subtext} />
                <ThemedText size="lg" weight="semibold" style={styles.emptyTitle}>
                  No Friend Requests
                </ThemedText>
                <ThemedText color="subtext" style={styles.emptyText}>
                  Friend requests will appear here when someone wants to connect with you.
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
        
        {activeTab === 'activity' && (
          <>
            {friendActivities.length > 0 ? (
              <ThemedView backgroundColor="card" shadow="sm" rounded="xl" style={styles.activityContainer}>
                <ActivityFeed activities={friendActivities} maxItems={20} />
              </ThemedView>
            ) : (
              <ThemedView backgroundColor="background" rounded="lg" style={styles.emptyContainer}>
                <Users size={48} color={Colors[theme].subtext} />
                <ThemedText size="lg" weight="semibold" style={styles.emptyTitle}>
                  No Activity Yet
                </ThemedText>
                <ThemedText color="subtext" style={styles.emptyText}>
                  Friend activity will appear here when your friends log meals or complete workouts.
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addFriendSection: {
    margin: 16,
    padding: 20,
  },
  addFriendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  addFriendTitle: {
    flex: 1,
  },
  addFriendInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  addFriendInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  addFriendButton: {
    minWidth: 80,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 32,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});