import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { notifications as notificationsApi } from '../api/services';

/**
 * Expo push registration.
 *
 * expo-notifications is loaded lazily and never at module scope. Importing it
 * eagerly crashes the app on launch in any environment that lacks the native
 * module — Expo Go on Android dropped remote push in SDK 53, and the import
 * itself throws there, taking the whole app down before the first screen.
 *
 * Everything here fails soft: if push is unavailable the app runs normally and
 * simply never registers a token.
 */

/** Minimal surface we use, so the lazy require stays typed. */
type NotificationsModule = typeof import('expo-notifications');
type DeviceModule = typeof import('expo-device');

let notificationsModule: NotificationsModule | null | undefined;
let deviceModule: DeviceModule | null | undefined;
let handlerInstalled = false;

/**
 * Expo Go dropped remote push on Android in SDK 53, and its shim throws during
 * module initialisation — which a synchronous try/catch around require() cannot
 * contain, so the app dies on launch. Detect that environment and never load
 * the module there. `storeClient` is Expo Go; a real build reports `standalone`
 * or `bare`.
 */
function pushUnsupportedHere(): boolean {
  return (
    Constants.executionEnvironment === 'storeClient' && Platform.OS === 'android'
  );
}

function loadNotifications(): NotificationsModule | null {
  if (notificationsModule !== undefined) return notificationsModule;

  if (pushUnsupportedHere()) {
    notificationsModule = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notificationsModule = require('expo-notifications') as NotificationsModule;
  } catch {
    notificationsModule = null;
  }
  return notificationsModule;
}

function loadDevice(): DeviceModule | null {
  if (deviceModule !== undefined) return deviceModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    deviceModule = require('expo-device') as DeviceModule;
  } catch {
    deviceModule = null;
  }
  return deviceModule;
}

/** True when the native module is present in this build. */
export function isPushAvailable(): boolean {
  return loadNotifications() !== null;
}

/**
 * Foreground behaviour: show the banner rather than swallowing it silently.
 * Installed on first use, not at import, so it cannot crash startup.
 */
function ensureHandler(N: NotificationsModule): void {
  if (handlerInstalled) return;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerInstalled = true;
  } catch {
    // Non-fatal; notifications just won't surface in the foreground.
  }
}

/** Android requires a channel before any notification will display. */
async function ensureAndroidChannel(N: NotificationsModule): Promise<void> {
  if (Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync('default', {
    name: 'Order updates',
    importance: N.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F97316',
  });
}

/**
 * Asks for permission and returns the Expo push token, or null when push is
 * unavailable or the user declined. Never throws.
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const N = loadNotifications();
    if (!N) return null;

    const D = loadDevice();
    // Simulators and emulators cannot receive push.
    if (D && !D.isDevice) return null;

    ensureHandler(N);
    await ensureAndroidChannel(N);

    const existing = await N.getPermissionsAsync();
    let status = existing.status;

    if (status !== 'granted') {
      const asked = await N.requestPermissionsAsync();
      status = asked.status;
    }

    if (status !== 'granted') return null;

    // EAS projectId is required to mint a token outside the classic workflow.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

    const res = await N.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return res.data ?? null;
  } catch {
    // Missing native module, no network, revoked permission — all non-fatal.
    return null;
  }
}

/**
 * Registers this device against the signed-in user. Safe to call repeatedly;
 * the server upserts on the token. Returns the token so the caller can keep it
 * for unregistering at sign-out. Never throws.
 */
export async function registerForPush(): Promise<string | null> {
  try {
    const token = await getExpoPushToken();
    if (!token) return null;

    const D = loadDevice();

    await notificationsApi.registerDevice({
      token,
      platform: Platform.OS,
      deviceName: D?.deviceName ?? undefined,
      appVersion: Constants.expoConfig?.version ?? undefined,
    });

    return token;
  } catch {
    return null;
  }
}

/** Detaches this device at sign-out so the next user does not get these alerts. */
export async function unregisterFromPush(token: string | null): Promise<void> {
  try {
    if (!token) return;
    await notificationsApi.unregisterDevice(token);
  } catch {
    // Best-effort — sign-out must never be blocked by this.
  }
}

/**
 * Subscribes to notification taps. Returns an unsubscribe function, and a no-op
 * when push is unavailable. Never throws.
 */
export function addNotificationTapListener(
  onTap: (data: Record<string, unknown> | undefined) => void,
): () => void {
  const N = loadNotifications();
  if (!N) return () => {};

  try {
    ensureHandler(N);

    const sub = N.addNotificationResponseReceivedListener((response) => {
      onTap(response.notification.request.content.data as Record<string, unknown>);
    });

    // App launched by tapping a notification.
    N.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          onTap(response.notification.request.content.data as Record<string, unknown>);
        }
      })
      .catch(() => {});

    return () => {
      try {
        sub.remove();
      } catch {
        // already torn down
      }
    };
  } catch {
    return () => {};
  }
}
