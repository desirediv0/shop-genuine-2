import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from './config';

/**
 * Tokens live in the device keychain/keystore, never AsyncStorage.
 *
 * The backend does not persist refresh tokens (see
 * server/helper/generateAccessAndRefreshTokens.js), so a token is valid until it
 * expires and cannot be revoked server-side. Keeping it in secure storage is
 * what limits the blast radius.
 */

let cachedAccessToken: string | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    cachedAccessToken = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
    return cachedAccessToken;
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
  } catch {
    return null;
  }
}

export async function setTokens(accessToken: string, refreshToken?: string): Promise<void> {
  cachedAccessToken = accessToken;
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refreshToken);
    }
  } catch {
    // Keychain unavailable (rare). The in-memory copy still works for this session.
  }
}

export async function clearTokens(): Promise<void> {
  cachedAccessToken = null;
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
  } catch {
    // ignore
  }
}
