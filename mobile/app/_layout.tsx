import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useNotificationRouting } from '../src/hooks/useNotificationRouting';
import { CartProvider } from '../src/context/CartContext';
import { StoreVerticalProvider } from '../src/context/StoreVerticalContext';
import { ToastProvider } from '../src/context/ToastContext';
import { colors } from '../src/theme';

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

  useEffect(() => {
    if (!initialising) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [initialising]);

  if (initialising) return null;
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
                      headerTitleStyle: { fontWeight: '600', fontSize: 17 },
                      headerShadowVisible: false,
                      contentStyle: { backgroundColor: colors.background },
                    }}
                  >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="product/[slug]" options={{ title: '' }} />
                    <Stack.Screen name="category/[slug]" options={{ title: 'Category' }} />
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
