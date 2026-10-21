import * as Application from 'expo-application';
import * as Updates from 'expo-updates';

/**
 * "Version 1.0.0", plus the over-the-air update and lane when one is running —
 * e.g. "Version 1.0.0 · update 3f2a1c9e · preview". Shown at the foot of the
 * Account screen so anyone can tell which code a phone is actually running.
 */
export function buildLabel(): string {
  const version = Application.nativeApplicationVersion ?? '?';
  if (__DEV__ || !Updates.isEnabled) return `Version ${version} · development`;

  const parts = [`Version ${version}`];
  if (!Updates.isEmbeddedLaunch && Updates.updateId) {
    parts.push(`update ${Updates.updateId.slice(0, 8)}`);
  }
  // Customers are on "production"; only name the lane on test phones.
  if (Updates.channel && Updates.channel !== 'production') parts.push(Updates.channel);
  return parts.join(' · ');
}
