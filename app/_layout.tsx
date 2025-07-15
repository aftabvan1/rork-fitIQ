import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="food-details" options={{ title: 'Food Details' }} />
            <Stack.Screen name="subscription" options={{ title: 'Subscription' }} />
            <Stack.Screen name="exercise-selector" options={{ title: 'Select Exercise' }} />
            <Stack.Screen name="friends" options={{ title: 'Friends' }} />
            <Stack.Screen name="friend-profile" options={{ title: 'Friend Profile' }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}