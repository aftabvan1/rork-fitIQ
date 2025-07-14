import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import SubscriptionCard from "@/components/SubscriptionCard";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would integrate with Stripe/RevenueCat
      // For demo, we'll simulate the subscription process
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user premium status
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      await updateUser({
        isPremium: true,
        premiumUntil: expiryDate.toISOString(),
      });
      
      setLoading(false);
      
      Alert.alert(
        "Subscription Successful",
        "Thank you for subscribing to fitIQ Premium! You now have access to all premium features.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Subscription Failed",
        "There was an error processing your subscription. Please try again."
      );
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedText size="xxl" weight="bold" style={styles.title}>
            Upgrade Your Nutrition Journey
          </ThemedText>
          
          <ThemedText color="subtext" style={styles.subtitle}>
            Get unlimited access to all premium features and take your nutrition tracking to the next level.
          </ThemedText>
          
          <SubscriptionCard onSubscribe={handleSubscribe} loading={loading} />
          
          <ThemedText size="lg" weight="semibold" style={styles.comparisonTitle}>
            Free vs Premium
          </ThemedText>
          
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonRow}>
              <ThemedText style={styles.featureText}>Feature</ThemedText>
              <ThemedText style={styles.freeText}>Free</ThemedText>
              <ThemedText style={styles.premiumText}>Premium</ThemedText>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.comparisonRow}>
              <ThemedText>Food Logging</ThemedText>
              <ThemedText>✓</ThemedText>
              <ThemedText>✓</ThemedText>
            </View>
            
            <View style={styles.comparisonRow}>
              <ThemedText>Barcode Scanning</ThemedText>
              <ThemedText>5/day</ThemedText>
              <ThemedText>Unlimited</ThemedText>
            </View>
            
            <View style={styles.comparisonRow}>
              <ThemedText>AI Food Recognition</ThemedText>
              <ThemedText>3/day</ThemedText>
              <ThemedText>Unlimited</ThemedText>
            </View>
            
            <View style={styles.comparisonRow}>
              <ThemedText>Nutrition Insights</ThemedText>
              <ThemedText>Basic</ThemedText>
              <ThemedText>Advanced</ThemedText>
            </View>
            
            <View style={styles.comparisonRow}>
              <ThemedText>AI Assistant</ThemedText>
              <ThemedText>3 messages</ThemedText>
              <ThemedText>Unlimited</ThemedText>
            </View>
            
            <View style={styles.comparisonRow}>
              <ThemedText>Export Data</ThemedText>
              <ThemedText>-</ThemedText>
              <ThemedText>✓</ThemedText>
            </View>
            
            <View style={styles.comparisonRow}>
              <ThemedText>Meal Recommendations</ThemedText>
              <ThemedText>-</ThemedText>
              <ThemedText>✓</ThemedText>
            </View>
          </View>
          
          <ThemedText size="sm" color="subtext" style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy. Your subscription will automatically renew each month until canceled. You can cancel anytime.
          </ThemedText>
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
  title: {
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  comparisonTitle: {
    marginTop: 16,
    marginBottom: 16,
  },
  comparisonTable: {
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    padding: 16,
    marginBottom: 24,
  },
  comparisonRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  featureText: {
    flex: 2,
    fontWeight: "500",
  },
  freeText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "500",
  },
  premiumText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "500",
    color: "#4CAF50",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  termsText: {
    textAlign: "center",
    marginHorizontal: 24,
  },
});