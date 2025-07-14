import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

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
  return (
    <Stack>
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
      <Stack.Screen 
        name="login" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return <RootLayoutNav />;
}