import { NutritionGoals } from "@/types";
import { useThemeStore } from "@/store/theme-store";
import { useUserStore } from "@/store/user-store";
import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Moon, Sun, Crown, Settings } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { user, updateGoals, updateProfile, setPremiumStatus } = useUserStore();
  
  const [goals, setGoals] = useState<NutritionGoals>(user?.goals || {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  });
  
  const [name, setName] = useState(user?.name || "");
  const [weight, setWeight] = useState(user?.weight?.toString() || "");
  const [height, setHeight] = useState(user?.height?.toString() || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  
  const handleSaveGoals = () => {
    updateGoals(goals);
    Alert.alert("Success", "Nutrition goals updated successfully");
  };
  
  const handleSaveProfile = () => {
    updateProfile({
      name,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      age: age ? parseInt(age, 10) : undefined,
    });
    Alert.alert("Success", "Profile updated successfully");
  };
  
  const handleUpgrade = () => {
    router.push("/subscription");
  };
  
  // For demo purposes only - in a real app this would be handled by a payment provider
  const handleTogglePremium = () => {
    if (user?.isPremium) {
      Alert.alert(
        "Cancel Premium",
        "Are you sure you want to cancel your premium subscription?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes",
            onPress: () => {
              setPremiumStatus(false);
              Alert.alert("Premium Cancelled", "Your premium subscription has been cancelled");
            },
          },
        ]
      );
    } else {
      router.push("/subscription");
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                Profile
              </ThemedText>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText weight="semibold" style={styles.inputLabel}>Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: Colors[theme].text, 
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].background,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors[theme].subtext}
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText weight="semibold" style={styles.inputLabel}>Weight (kg)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: Colors[theme].text, 
                      borderColor: Colors[theme].border,
                      backgroundColor: Colors[theme].background,
                    },
                  ]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0"
                  placeholderTextColor={Colors[theme].subtext}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <ThemedText weight="semibold" style={styles.inputLabel}>Height (cm)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: Colors[theme].text, 
                      borderColor: Colors[theme].border,
                      backgroundColor: Colors[theme].background,
                    },
                  ]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="0"
                  placeholderTextColor={Colors[theme].subtext}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText weight="semibold" style={styles.inputLabel}>Age</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: Colors[theme].text, 
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].background,
                  },
                ]}
                value={age}
                onChangeText={setAge}
                placeholder="0"
                placeholderTextColor={Colors[theme].subtext}
                keyboardType="numeric"
              />
            </View>
            
            <Button
              title="Save Profile"
              onPress={handleSaveProfile}
              style={styles.saveButton}
            />
          </ThemedView>
          
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                Nutrition Goals
              </ThemedText>
            </View>
            
            <View style={styles.inputGroup}>
              <ThemedText weight="semibold" style={styles.inputLabel}>Daily Calories (kcal)</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: Colors[theme].text, 
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].background,
                  },
                ]}
                value={goals.calories.toString()}
                onChangeText={(text) =>
                  setGoals({ ...goals, calories: parseFloat(text) || 0 })
                }
                placeholder="0"
                placeholderTextColor={Colors[theme].subtext}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.macroInputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText weight="semibold" style={styles.inputLabel}>Protein (g)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: Colors[theme].text, 
                      borderColor: Colors[theme].border,
                      backgroundColor: Colors[theme].background,
                    },
                  ]}
                  value={goals.protein.toString()}
                  onChangeText={(text) =>
                    setGoals({ ...goals, protein: parseFloat(text) || 0 })
                  }
                  placeholder="0"
                  placeholderTextColor={Colors[theme].subtext}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText weight="semibold" style={styles.inputLabel}>Carbs (g)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: Colors[theme].text, 
                      borderColor: Colors[theme].border,
                      backgroundColor: Colors[theme].background,
                    },
                  ]}
                  value={goals.carbs.toString()}
                  onChangeText={(text) =>
                    setGoals({ ...goals, carbs: parseFloat(text) || 0 })
                  }
                  placeholder="0"
                  placeholderTextColor={Colors[theme].subtext}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText weight="semibold" style={styles.inputLabel}>Fat (g)</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: Colors[theme].text, 
                      borderColor: Colors[theme].border,
                      backgroundColor: Colors[theme].background,
                    },
                  ]}
                  value={goals.fat.toString()}
                  onChangeText={(text) =>
                    setGoals({ ...goals, fat: parseFloat(text) || 0 })
                  }
                  placeholder="0"
                  placeholderTextColor={Colors[theme].subtext}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <Button
              title="Save Goals"
              onPress={handleSaveGoals}
              style={styles.saveButton}
            />
          </ThemedView>
          
          <ThemedView backgroundColor="card" shadow="md" rounded="xl" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={24} color={Colors[theme].primary} />
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                App Settings
              </ThemedText>
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText weight="semibold">Dark Mode</ThemedText>
                <ThemedText size="sm" color="subtext">
                  Switch between light and dark theme
                </ThemedText>
              </View>
              <Pressable
                style={[
                  styles.themeToggle,
                  { backgroundColor: Colors[theme].background },
                ]}
                onPress={toggleTheme}
              >
                {theme === "light" ? (
                  <Sun size={20} color={Colors[theme].text} />
                ) : (
                  <Moon size={20} color={Colors[theme].text} />
                )}
              </Pressable>
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.premiumTitleRow}>
                  <ThemedText weight="semibold">Premium Subscription</ThemedText>
                  {user?.isPremium && <Crown size={16} color={Colors[theme].primary} />}
                </View>
                <ThemedText size="sm" color="subtext">
                  {user?.isPremium
                    ? "You are currently subscribed to Premium"
                    : "Unlock all features with Premium"}
                </ThemedText>
              </View>
              <Switch
                value={user?.isPremium || false}
                onValueChange={handleTogglePremium}
                trackColor={{
                  false: Colors[theme].border,
                  true: Colors[theme].primary,
                }}
                thumbColor="#fff"
              />
            </View>
            
            {!user?.isPremium && (
              <Button
                title="Upgrade to Premium"
                onPress={handleUpgrade}
                style={styles.upgradeButton}
                leftIcon={<Crown size={18} color={Colors[theme].background} />}
              />
            )}
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  macroInputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeButton: {
    marginTop: 16,
  },
});