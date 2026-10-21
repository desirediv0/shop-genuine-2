import type { ComponentType } from 'react';
import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';

/**
 * Crash reporting (Sentry).
 *
 * Off unless the build was given EXPO_PUBLIC_SENTRY_DSN, and always off in
 * development — so it costs nothing until the account exists. It records crashes
 * and errors only: no performance tracing, and no personal data (no email, name
 * or IP address is attached).
 *
 * Imported first by app/_layout.tsx so it starts before anything can throw.
 */
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const monitoringEnabled = !!DSN && !__DEV__;

if (monitoringEnabled) {
  Sentry.init({
    dsn: DSN,
    // "preview" for test phones, "production" for the store build.
    environment: Updates.channel || 'unknown',
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
  // Ties a crash to the over-the-air update that was running, so a bad update
  // can be identified and rolled back.
  Sentry.setTag('update_id', Updates.updateId ?? 'embedded');
  Sentry.setTag('runtime_version', Updates.runtimeVersion ?? 'unknown');
}

/** Wraps the root component so React render errors are reported too. */
export function withMonitoring<P extends Record<string, unknown>>(
  Root: ComponentType<P>,
): ComponentType<P> {
  return monitoringEnabled ? Sentry.wrap(Root) : Root;
}
