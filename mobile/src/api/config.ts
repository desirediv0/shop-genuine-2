import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Base URL for the backend.
 *
 * The app talks to /api/v2 — the namespace server/routes/v2.index.js mounts
 * specifically for mobile. It reuses the same controllers as the website, so
 * behaviour matches the web storefront exactly.
 *
 * On a physical device "localhost" points at the phone, not the dev machine, so
 * in development we fall back to the host that is serving the Metro bundle.
 */
function resolveHost(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  if (__DEV__) {
    // e.g. "192.168.1.5:8081" — the machine running `expo start`
    const hostUri =
      Constants.expoConfig?.hostUri ??
      (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

    const lanIp = hostUri?.split(':')[0];
    if (lanIp) return `http://${lanIp}:4000`;

    // Android emulator reaches the host machine on 10.0.2.2
    if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
    return 'http://localhost:4000';
  }

  return 'https://api.shopgenuine.online';
}

export const API_HOST = resolveHost();
export const API_BASE = `${API_HOST}/api/v2`;

/** Requests that take longer than this are treated as failures. */
export const REQUEST_TIMEOUT_MS = 20000;

export const STORAGE_KEYS = {
  accessToken: 'sg.accessToken',
  refreshToken: 'sg.refreshToken',
  guestCart: 'sg.guestCart',
  recentSearches: 'sg.recentSearches',
} as const;
