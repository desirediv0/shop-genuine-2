import * as Application from 'expo-application';
import * as Updates from 'expo-updates';

/**
 * "Version 1.0.0", plus the over-the-air update and lane when one is running —
 * e.g. "Version 1.0.0 · update 26 Oct, 2:52 pm (b97d0c) · preview". Shown at the
 * foot of the Account screen so anyone can tell which code a phone is running.
 *
 * The update is named by when it was published, which a person can match
 * against the publish log, plus the tail of its id. Not the head: update ids
 * are time-ordered (UUIDv7), so the first 8 characters were identical for any
 * two updates published within about a minute of each other.
 */
export function buildLabel(): string {
  const version = Application.nativeApplicationVersion ?? '?';
  if (__DEV__ || !Updates.isEnabled) return `Version ${version} · development`;

  const parts = [`Version ${version}`];
  if (!Updates.isEmbeddedLaunch && Updates.updateId) {
    const tail = Updates.updateId.replace(/-/g, '').slice(-6);
    const when = Updates.createdAt
      ? Updates.createdAt.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
        })
      : null;
    parts.push(when ? `update ${when} (${tail})` : `update ${tail}`);
  }
  // Customers are on "production"; only name the lane on test phones.
  if (Updates.channel && Updates.channel !== 'production') parts.push(Updates.channel);
  return parts.join(' · ');
}
