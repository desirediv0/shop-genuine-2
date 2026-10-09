import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useNotificationRouting } from '../src/hooks/useNotificationRouting';
import { CartProvider } from '../src/context/CartContext';
import { StoreVerticalProvider } from '../src/context/StoreVerticalContext';
import { ToastProvider } from '../src/context/ToastContext';
import { colors, fonts } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden — safe to ignore.
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Catalogue data barely changes between screens; avoid refetch churn.
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Holds the splash screen until the stored session has been restored. */
function SplashGate({ children }: { children: React.ReactNode }) {
  const { initialising } = useAuth();
  useNotificationRouting();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // If the font fails to load we still show the app in the system face rather
  // than holding the splash forever.
  const ready = !initialising && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <StoreVerticalProvider>
                <CartProvider>
                  <SplashGate>
                  <StatusBar style="dark" />
                  <Stack
                    screenOptions={{
                      headerStyle: { backgroundColor: colors.background },
                      headerTintColor: colors.text,
                      headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17 },
                      headerShadowVisible: false,
                      contentStyle: { backgroundColor: colors.background },
                    }}
                  >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="product/[slug]" options={{ title: '' }} />
                    <Stack.Screen name="category/[slug]" options={{ title: 'Category' }} />
                    <Stack.Screen name="basket" options={{ title: 'Cart' }} />
                    <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
                    <Stack.Screen name="orders/[id]" options={{ title: 'Order' }} />
                    <Stack.Screen
                      name="auth"
                      options={{ headerShown: false, presentation: 'modal' }}
                    />
                  </Stack>
                  </SplashGate>
                </CartProvider>
              </StoreVerticalProvider>
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
