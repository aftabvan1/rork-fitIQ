import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated/lib/reanimated2/js-reanimated';

import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { theme } = useThemeStore();
  const { isAuthenticated, initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  // Don't render anything while checking auth status
  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {!isAuthenticated ? (
          <Stack.Screen name="login" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen 
              name="food-details" 
              options={{ 
                title: 'Food Details',
                headerBackTitle: 'Back',
              }} 
            />
            <Stack.Screen 
              name="exercise-selector" 
              options={{ 
                title: 'Add Exercise',
                headerBackTitle: 'Back',
              }} 
            />
            <Stack.Screen 
              name="subscription" 
              options={{ 
                title: 'Premium Subscription',
                headerBackTitle: 'Back',
              }} 
            />
            <Stack.Screen 
              name="friends" 
              options={{ 
                title: 'Friends',
                headerBackTitle: 'Back',
              }} 
            />
            <Stack.Screen 
              name="friend-profile" 
              options={{ 
                title: 'Friend Profile',
                headerBackTitle: 'Back',
              }} 
            />
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}