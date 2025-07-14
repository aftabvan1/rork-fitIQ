import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import ThemedView from '@/components/ThemedView';
import ThemedText from '@/components/ThemedText';
import Button from '@/components/Button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isRegisterMode && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      if (isRegisterMode) {
        await useAuthStore.getState().register(email.trim(), password, name.trim());
      } else {
        await login(email.trim(), password);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || `Failed to ${isRegisterMode ? 'register' : 'login'}`
      );
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setName('');
    setPassword('');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText size="xxxl" weight="bold" style={styles.title}>
              Welcome to fitIQ
            </ThemedText>
            <ThemedText size="lg" color="subtext" style={styles.subtitle}>
              {isRegisterMode
                ? 'Create your account to start tracking'
                : 'Sign in to continue your journey'}
            </ThemedText>
          </View>

          <ThemedView backgroundColor="card" shadow="lg" rounded="xxl" style={styles.formContainer}>
            {isRegisterMode && (
              <View style={styles.inputGroup}>
                <ThemedText weight="semibold" style={styles.inputLabel}>
                  Full Name
                </ThemedText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: Colors[theme].text,
                        backgroundColor: Colors[theme].background,
                        borderColor: Colors[theme].border,
                      },
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={Colors[theme].subtext}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <ThemedText weight="semibold" style={styles.inputLabel}>
                Email Address
              </ThemedText>
              <View style={styles.inputContainer}>
                <Mail
                  size={20}
                  color={Colors[theme].subtext}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                    {
                      color: Colors[theme].text,
                      backgroundColor: Colors[theme].background,
                      borderColor: Colors[theme].border,
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors[theme].subtext}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText weight="semibold" style={styles.inputLabel}>
                Password
              </ThemedText>
              <View style={styles.inputContainer}>
                <Lock
                  size={20}
                  color={Colors[theme].subtext}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                    {
                      color: Colors[theme].text,
                      backgroundColor: Colors[theme].background,
                      borderColor: Colors[theme].border,
                    },
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors[theme].subtext}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors[theme].subtext} />
                  ) : (
                    <Eye size={20} color={Colors[theme].subtext} />
                  )}
                </Pressable>
              </View>
            </View>

            <Button
              title={isRegisterMode ? 'Create Account' : 'Sign In'}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />

            <View style={styles.switchModeContainer}>
              <ThemedText color="subtext">
                {isRegisterMode
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </ThemedText>
              <Pressable onPress={toggleMode}>
                <ThemedText color="primary" weight="semibold" style={styles.switchModeText}>
                  {isRegisterMode ? 'Sign In' : 'Sign Up'}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>

          <ThemedText size="sm" color="subtext" style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    padding: 24,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 48,
    paddingRight: 48,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 18,
    zIndex: 1,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  switchModeText: {
    marginLeft: 4,
  },
  termsText: {
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});