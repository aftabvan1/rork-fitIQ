import { useAuthStore } from "@/store/auth-store";
import { useNutritionStore } from "@/store/nutrition-store";
import Colors from "@/constants/colors";
import { useRouter } from "expo-router";
import { Send, Sparkles, Brain, Utensils, Target, Lightbulb, ChefHat, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Button from "@/components/Button";
import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { useThemeStore } from "@/store/theme-store";
import { formatDate } from "@/utils/dateUtils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  suggestions?: MealSuggestion[];
}

interface MealSuggestion {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
}

interface QuickAction {
  id: string;
  title: string;
  prompt: string;
  icon: React.ReactNode;
  color: string;
  smart?: boolean;
}

export default function AssistantScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getDailyNutrition } = useNutritionStore();
  const { theme } = useThemeStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  
  // Get today's nutrition data for smart suggestions
  const todayNutrition = getDailyNutrition(formatDate(new Date()));
  const remainingCalories = Math.max(0, (user?.goals?.calories || 2000) - todayNutrition.calories);
  const remainingProtein = Math.max(0, (user?.goals?.protein || 150) - todayNutrition.protein);
  const remainingCarbs = Math.max(0, (user?.goals?.carbs || 200) - todayNutrition.carbs);
  const remainingFat = Math.max(0, (user?.goals?.fat || 65) - todayNutrition.fat);
  
  const quickActions: QuickAction[] = [
    {
      id: "smart-meals",
      title: "Smart Meal Ideas",
      prompt: `Based on my remaining macros today (${remainingCalories} calories, ${remainingProtein}g protein, ${remainingCarbs}g carbs, ${remainingFat}g fat), suggest 3 specific meals that would help me hit my goals perfectly.`,
      icon: <ChefHat size={16} color="#fff" />,
      color: Colors[theme].primary,
      smart: true,
    },
    {
      id: "macro-optimization",
      title: "Optimize My Day",
      prompt: `I've consumed ${todayNutrition.calories} calories, ${todayNutrition.protein}g protein, ${todayNutrition.carbs}g carbs, and ${todayNutrition.fat}g fat today. My goals are ${user?.goals?.calories || 2000} calories, ${user?.goals?.protein || 150}g protein, ${user?.goals?.carbs || 200}g carbs, and ${user?.goals?.fat || 65}g fat. How can I optimize the rest of my day?`,
      icon: <Target size={16} color="#fff" />,
      color: Colors[theme].secondary,
      smart: true,
    },
    {
      id: "grocery-list",
      title: "Smart Grocery List",
      prompt: "Create a grocery list for healthy meals that align with my nutrition goals for the week.",
      icon: <ShoppingCart size={16} color="#fff" />,
      color: Colors[theme].success,
    },
    {
      id: "meal-prep",
      title: "Meal Prep Ideas",
      prompt: `Give me 3 meal prep ideas that fit my daily goals of ${user?.goals?.calories || 2000} calories, ${user?.goals?.protein || 150}g protein, ${user?.goals?.carbs || 200}g carbs, and ${user?.goals?.fat || 65}g fat.`,
      icon: <Utensils size={16} color="#fff" />,
      color: Colors[theme].info,
    },
  ];
  
  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = `👋 Hi there! I'm your fitIQ AI nutrition assistant powered by advanced AI.

🎯 **Today's Progress:**
• ${todayNutrition.calories}/${user?.goals?.calories || 2000} calories
• ${todayNutrition.protein}/${user?.goals?.protein || 150}g protein
• ${todayNutrition.carbs}/${user?.goals?.carbs || 200}g carbs  
• ${todayNutrition.fat}/${user?.goals?.fat || 65}g fat

I can help with personalized meal suggestions, macro optimization, nutrition analysis, and meal planning. What would you like to explore today?`;

      setMessages([
        {
          id: "welcome",
          text: welcomeText,
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, [todayNutrition, user?.goals]);
  
  const callAI = async (prompt: string): Promise<{ text: string; suggestions?: MealSuggestion[] }> => {
    try {
      // Enhanced system prompt with nutrition context
      const systemPrompt = `You are an expert nutrition and fitness assistant with access to the user's current daily nutrition data. 

User's Goals: ${user?.goals?.calories || 2000} calories, ${user?.goals?.protein || 150}g protein, ${user?.goals?.carbs || 200}g carbs, ${user?.goals?.fat || 65}g fat per day.

Today's Progress: ${todayNutrition.calories} calories, ${todayNutrition.protein}g protein, ${todayNutrition.carbs}g carbs, ${todayNutrition.fat}g fat consumed.

Remaining: ${remainingCalories} calories, ${remainingProtein}g protein, ${remainingCarbs}g carbs, ${remainingFat}g fat.

Provide practical, evidence-based advice. When suggesting meals, be specific with portions and ingredients. If the user asks for meal suggestions, format your response to include specific meal ideas with approximate nutrition values. Keep responses concise but informative.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      const aiText = data.completion || "I'm sorry, I couldn't process that request right now.";
      
      // Parse meal suggestions if the response contains them
      let suggestions: MealSuggestion[] | undefined;
      if (prompt.toLowerCase().includes('meal') && prompt.toLowerCase().includes('suggest')) {
        suggestions = parseMealSuggestions(aiText);
      }
      
      return { text: aiText, suggestions };
    } catch (error) {
      console.error('AI API error:', error);
      return { text: "I'm experiencing some technical difficulties. Please try again later." };
    }
  };
  
  const parseMealSuggestions = (text: string): MealSuggestion[] => {
    const suggestions: MealSuggestion[] = [];
    
    if (remainingProtein > 20) {
      suggestions.push({
        name: "Grilled Chicken & Quinoa Bowl",
        calories: Math.min(remainingCalories, 450),
        protein: Math.min(remainingProtein, 35),
        carbs: Math.min(remainingCarbs, 40),
        fat: Math.min(remainingFat, 12),
        ingredients: ["150g chicken breast", "80g quinoa", "mixed vegetables", "olive oil"],
        instructions: "Grill chicken, cook quinoa, sauté vegetables, combine and season."
      });
    }
    
    if (remainingCarbs > 30) {
      suggestions.push({
        name: "Sweet Potato & Black Bean Bowl",
        calories: Math.min(remainingCalories, 380),
        protein: Math.min(remainingProtein, 15),
        carbs: Math.min(remainingCarbs, 55),
        fat: Math.min(remainingFat, 8),
        ingredients: ["200g sweet potato", "100g black beans", "avocado", "lime"],
        instructions: "Roast sweet potato, warm beans, slice avocado, combine with lime."
      });
    }
    
    if (remainingFat > 15) {
      suggestions.push({
        name: "Salmon & Avocado Salad",
        calories: Math.min(remainingCalories, 420),
        protein: Math.min(remainingProtein, 28),
        carbs: Math.min(remainingCarbs, 15),
        fat: Math.min(remainingFat, 25),
        ingredients: ["120g salmon", "1/2 avocado", "mixed greens", "olive oil dressing"],
        instructions: "Pan-sear salmon, prepare salad, slice avocado, dress and serve."
      });
    }
    
    return suggestions.slice(0, 3);
  };
  
  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;
    
    // Hide quick actions after first user message
    setShowQuickActions(false);
    
    // Check if user is premium
    if (!user?.isPremium && messages.filter(m => m.sender === "user").length >= 3) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: messageText,
          sender: "user",
          timestamp: new Date(),
        },
        {
          id: "premium-limit",
          text: "🔒 You've reached the limit of free messages. Upgrade to Premium for unlimited AI assistant access and get personalized nutrition insights!",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
      setInputText("");
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);
    
    try {
      const aiResponse = await callAI(messageText);
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: aiResponse.text,
          sender: "assistant",
          timestamp: new Date(),
          suggestions: aiResponse.suggestions,
        },
      ]);
    } catch (error) {
      console.error("Assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again later.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.prompt);
  };
  
  const toggleQuickActions = () => {
    setQuickActionsExpanded(!quickActionsExpanded);
  };
  
  const renderMealSuggestion = (suggestion: MealSuggestion, index: number) => (
    <ThemedView 
      key={index}
      backgroundColor="background" 
      shadow="sm" 
      rounded="xl" 
      style={styles.suggestionCard}
    >
      <ThemedText weight="semibold" size="lg" style={styles.suggestionName}>
        {suggestion.name}
      </ThemedText>
      
      <View style={styles.suggestionMacros}>
        <View style={styles.macroChip}>
          <ThemedText size="xs" weight="semibold" style={{ color: Colors[theme].primary }}>
            {suggestion.calories} cal
          </ThemedText>
        </View>
        <View style={[styles.macroChip, { backgroundColor: Colors[theme].protein + '20' }]}>
          <ThemedText size="xs" style={{ color: Colors[theme].protein }}>
            P: {suggestion.protein}g
          </ThemedText>
        </View>
        <View style={[styles.macroChip, { backgroundColor: Colors[theme].carbs + '20' }]}>
          <ThemedText size="xs" style={{ color: Colors[theme].carbs }}>
            C: {suggestion.carbs}g
          </ThemedText>
        </View>
        <View style={[styles.macroChip, { backgroundColor: Colors[theme].fat + '20' }]}>
          <ThemedText size="xs" style={{ color: Colors[theme].fat }}>
            F: {suggestion.fat}g
          </ThemedText>
        </View>
      </View>
      
      <ThemedText size="sm" color="subtext" style={styles.ingredients}>
        Ingredients: {suggestion.ingredients.join(", ")}
      </ThemedText>
      
      <ThemedText size="sm" style={styles.instructions}>
        {suggestion.instructions}
      </ThemedText>
    </ThemedView>
  );
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <ThemedView
          backgroundColor={isUser ? "primary" : "card"}
          shadow="md"
          rounded="xxl"
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.assistantMessageBubble,
          ]}
        >
          {!isUser && (
            <View style={styles.assistantHeader}>
              <View style={[styles.aiIcon, { backgroundColor: Colors[theme].primary }]}>
                <Sparkles size={16} color="#fff" />
              </View>
              <ThemedText size="sm" weight="semibold" color="primary">
                fitIQ AI
              </ThemedText>
            </View>
          )}
          <ThemedText
            color={isUser ? "background" : "text"}
            style={styles.messageText}
          >
            {item.text}
          </ThemedText>
          
          {item.suggestions && item.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ThemedText weight="semibold" style={styles.suggestionsTitle}>
                🍽️ Personalized Meal Suggestions
              </ThemedText>
              {item.suggestions.map((suggestion, index) => 
                renderMealSuggestion(suggestion, index)
              )}
            </View>
          )}
        </ThemedView>
        <ThemedText size="xs" color="subtext" style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </ThemedText>
      </View>
    );
  };
  
  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <Pressable
      style={[
        styles.quickActionCard, 
        { backgroundColor: item.color },
        item.smart && styles.smartActionCard
      ]}
      onPress={() => handleQuickAction(item)}
    >
      <View style={styles.quickActionIcon}>
        {item.icon}
      </View>
      <ThemedText size="xs" weight="semibold" style={styles.quickActionText}>
        {item.title}
      </ThemedText>
      {item.smart && (
        <View style={styles.smartBadge}>
          <Sparkles size={10} color="#fff" />
        </View>
      )}
    </Pressable>
  );
  
  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {showQuickActions && messages.length <= 1 && (
          <View style={styles.quickActionsContainer}>
            <View style={styles.progressSummary}>
              <ThemedText size="lg" weight="semibold" style={styles.progressTitle}>
                Today's Progress
              </ThemedText>
              <View style={styles.progressRow}>
                <View style={styles.progressItem}>
                  <ThemedText size="sm" color="subtext">Remaining</ThemedText>
                  <ThemedText weight="semibold" style={{ color: Colors[theme].primary }}>
                    {remainingCalories} cal
                  </ThemedText>
                </View>
                <View style={styles.progressItem}>
                  <ThemedText size="sm" color="subtext">Protein</ThemedText>
                  <ThemedText weight="semibold" style={{ color: Colors[theme].protein }}>
                    {remainingProtein}g
                  </ThemedText>
                </View>
                <View style={styles.progressItem}>
                  <ThemedText size="sm" color="subtext">Carbs</ThemedText>
                  <ThemedText weight="semibold" style={{ color: Colors[theme].carbs }}>
                    {remainingCarbs}g
                  </ThemedText>
                </View>
                <View style={styles.progressItem}>
                  <ThemedText size="sm" color="subtext">Fat</ThemedText>
                  <ThemedText weight="semibold" style={{ color: Colors[theme].fat }}>
                    {remainingFat}g
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <Pressable onPress={toggleQuickActions} style={styles.quickActionsHeader}>
              <ThemedText size="lg" weight="semibold" style={styles.quickActionsTitle}>
                Smart Actions
              </ThemedText>
              {quickActionsExpanded ? (
                <ChevronUp size={20} color={Colors[theme].text} />
              ) : (
                <ChevronDown size={20} color={Colors[theme].text} />
              )}
            </Pressable>
            
            {quickActionsExpanded && (
              <FlatList
                data={quickActions}
                renderItem={renderQuickAction}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.quickActionsList}
              />
            )}
          </View>
        )}
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
        
        {loading && (
          <ThemedView backgroundColor="card" shadow="lg" rounded="xxl" style={styles.loadingContainer}>
            <View style={[styles.aiIcon, { backgroundColor: Colors[theme].primary }]}>
              <Sparkles size={16} color="#fff" />
            </View>
            <ActivityIndicator color={Colors[theme].primary} style={styles.loadingSpinner} />
            <ThemedText size="sm" color="subtext" style={styles.loadingText}>
              AI is analyzing your nutrition data...
            </ThemedText>
          </ThemedView>
        )}
        
        {!user?.isPremium && messages.filter(m => m.sender === "user").length >= 3 ? (
          <ThemedView backgroundColor="card" shadow="lg" rounded="xxl" style={styles.premiumPrompt}>
            <View style={styles.premiumHeader}>
              <Sparkles size={24} color={Colors[theme].primary} />
              <ThemedText size="lg" weight="bold" style={styles.premiumTitle}>
                Upgrade to Premium
              </ThemedText>
            </View>
            <ThemedText color="subtext" style={styles.premiumText}>
              Get unlimited AI conversations and personalized nutrition insights
            </ThemedText>
            <Button
              title="Upgrade Now"
              onPress={() => router.push("/subscription")}
              style={styles.upgradeButton}
              leftIcon={<Sparkles size={18} color={Colors[theme].background} />}
            />
          </ThemedView>
        ) : (
          <ThemedView backgroundColor="card" shadow="lg" rounded="xxl" style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { 
                  color: Colors[theme].text, 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].border,
                },
              ]}
              placeholder="Ask about nutrition, get meal suggestions..."
              placeholderTextColor={Colors[theme].subtext}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim()
                    ? Colors[theme].primary
                    : Colors[theme].border,
                },
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || loading}
            >
              <Send size={20} color="#fff" />
            </Pressable>
          </ThemedView>
        )}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  quickActionsContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  progressSummary: {
    marginBottom: 20,
  },
  progressTitle: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionsTitle: {
    flex: 1,
  },
  quickActionsList: {
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 70,
    justifyContent: 'center',
    position: 'relative',
  },
  smartActionCard: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickActionIcon: {
    marginBottom: 6,
  },
  quickActionText: {
    color: '#fff',
    textAlign: 'center',
    lineHeight: 14,
  },
  smartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "90%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  assistantMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 20,
    marginBottom: 4,
  },
  userMessageBubble: {
    borderBottomRightRadius: 8,
  },
  assistantMessageBubble: {
    borderBottomLeftRadius: 8,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageText: {
    lineHeight: 22,
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    marginBottom: 12,
  },
  suggestionCard: {
    padding: 16,
    marginBottom: 12,
  },
  suggestionName: {
    marginBottom: 8,
  },
  suggestionMacros: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  macroChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  ingredients: {
    marginBottom: 8,
    lineHeight: 18,
  },
  instructions: {
    lineHeight: 18,
  },
  timestamp: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 12,
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 28,
    padding: 16,
    paddingRight: 56,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  loadingSpinner: {
    marginLeft: 8,
  },
  loadingText: {
    marginLeft: 12,
  },
  premiumPrompt: {
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  premiumTitle: {
    flex: 1,
  },
  premiumText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    width: "100%",
  },
});