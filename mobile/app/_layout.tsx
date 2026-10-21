// Crash reporting starts before anything else can throw.
import { withMonitoring } from '../src/utils/monitoring';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
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
import { APP_VERSION_QUERY, UpdateGate } from '../src/components/UpdateGate';
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

// React Query listens for browser focus by default, which never fires in a
// native app. Map it to the app returning to the foreground. Only queries that
// opt in (the version check) refetch on it; the default above stays off.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active');
  });
  return () => subscription.remove();
});

// Ask for the version policy while the splash is still up, so an "Update
// required" screen does not appear a moment after the shop has rendered.
queryClient.prefetchQuery(APP_VERSION_QUERY).catch(() => {});

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

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <StoreVerticalProvider>
                <CartProvider>
                  <SplashGate>
                  <UpdateGate>
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
                  </UpdateGate>
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

export default withMonitoring(RootLayout);
