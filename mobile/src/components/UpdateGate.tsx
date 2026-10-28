import React, { useEffect, useState } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { STORAGE_KEYS } from '../api/config';
import { appInfo } from '../api/services';
import { colors, radius, shadow, spacing, typography } from '../theme';
import type { AppVersionRule } from '../types';
import { updateRequirement } from '../utils/version';
import { Button } from './Button';
import { Icon } from './Icon';
import { Logo } from './Logo';

/** Shared with app/_layout.tsx, which prefetches it while the splash is up. */
export const APP_VERSION_QUERY = {
  queryKey: ['appVersionPolicy'],
  queryFn: () => appInfo.versionPolicy(),
};

/**
 * Store link for this platform. Android can always be derived from the package
 * name; iOS needs the App Store link from the server, since the app's store id
 * only exists once it has been published.
 */
function storeUrlFor(rule: AppVersionRule | undefined): string | null {
  if (rule?.storeUrl) return rule.storeUrl;
  if (Platform.OS === 'android' && Application.applicationId) {
    return `market://details?id=${Application.applicationId}`;
  }
  return null;
}

async function openStore(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // No Play Store app (rare, e.g. some emulators): use the website instead.
    if (url.startsWith('market://')) {
      await Linking.openURL(url.replace('market://', 'https://play.google.com/store/apps/')).catch(
        () => {},
      );
    }
  }
}

/**
 * Applies the server's version policy (`/public/app-version`).
 *
 * - Below `minVersion`: the app is replaced by an "Update required" screen.
 *   Used when a store release is unavoidable — a native change, or a server
 *   change old versions cannot handle.
 * - Below `latestVersion`: a dismissible prompt, shown once per new version.
 *
 * Checked on launch, and again on returning to the foreground once the last
 * answer is 30 minutes old. If the check fails — offline, server down — nothing
 * is shown: a shopper is never locked out because the policy could not be read.
 */
export function UpdateGate({ children }: { children: React.ReactNode }) {
  const installed = Application.nativeApplicationVersion;
  const query = useQuery({
    ...APP_VERSION_QUERY,
    staleTime: 30 * 60_000,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const rule = Platform.OS === 'ios' ? query.data?.ios : query.data?.android;
  const need = updateRequirement(installed, rule);
  const storeUrl = storeUrlFor(rule);

  // undefined while the stored answer is being read, so the prompt cannot
  // flash up for someone who already said "Not now".
  const [dismissed, setDismissed] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.updateDismissed)
      .then(setDismissed)
      .catch(() => setDismissed(null));
  }, []);

  if (need === 'required') {
    return (
      <UpdateRequired
        installed={installed}
        required={rule?.minVersion ?? null}
        message={query.data?.message ?? null}
        storeUrl={storeUrl}
      />
    );
  }

  const showPrompt =
    need === 'available' && !!storeUrl && dismissed !== undefined && dismissed !== rule?.latestVersion;

  return (
    <>
      {children}
      <UpdatePrompt
        visible={showPrompt}
        message={query.data?.message ?? null}
        onUpdate={() => storeUrl && openStore(storeUrl)}
        onLater={() => {
          const version = rule?.latestVersion ?? null;
          setDismissed(version);
          if (version) AsyncStorage.setItem(STORAGE_KEYS.updateDismissed, version).catch(() => {});
        }}
      />
    </>
  );
}

function UpdateRequired({
  installed,
  required,
  message,
  storeUrl,
}: {
  installed: string | null;
  required: string | null;
  message: string | null;
  storeUrl: string | null;
}) {
  return (
    <SafeAreaView style={styles.required}>
      {/* This screen replaces the app, including its StatusBar — without one
          the clock and battery draw white on the light page. */}
      <StatusBar style="dark" />
      <Logo height={56} />
      <View style={styles.requiredBody}>
        <View style={styles.iconCircle}>
          <Icon name="sparkles" size={30} color={colors.primary} />
        </View>
        <Text style={styles.requiredTitle}>Time to update</Text>
        <Text style={styles.requiredText}>
          {message ??
            'This version of Shop Genuine is no longer supported. Update to the latest version to keep shopping.'}
        </Text>
      </View>
      <View style={styles.requiredFoot}>
        {storeUrl ? (
          <Button label="Update now" fullWidth onPress={() => openStore(storeUrl)} />
        ) : (
          <Text style={styles.requiredText}>
            Please update Shop Genuine from the App Store.
          </Text>
        )}
        {installed && required ? (
          <Text style={styles.versions}>
            You have version {installed} · version {required} or newer is needed
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function UpdatePrompt({
  visible,
  message,
  onUpdate,
  onLater,
}: {
  visible: boolean;
  message: string | null;
  onUpdate: () => void;
  onLater: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onLater}
      // Edge-to-edge is on, so draw under both bars and pad by the insets
      // ourselves — otherwise the card sits under the gesture bar.
      statusBarTranslucent
      navigationBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onLater} accessibilityLabel="Not now">
        <Pressable
          style={[styles.card, { marginBottom: insets.bottom + spacing.lg }]}
          // Taps on the card must not fall through to the backdrop.
          onPress={() => {}}
        >
          <View style={styles.iconCircle}>
            <Icon name="sparkles" size={26} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>A new version is available</Text>
          <Text style={styles.cardText}>
            {message ?? 'Update Shop Genuine for the latest fixes and improvements.'}
          </Text>
          <View style={styles.cardButtons}>
            <Button label="Not now" variant="outline" onPress={onLater} style={styles.cardButton} />
            <Button label="Update" onPress={onUpdate} style={styles.cardButton} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  required: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  requiredBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  requiredTitle: { ...typography.h1, color: colors.text, textAlign: 'center' },
  requiredText: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  requiredFoot: { gap: spacing.md, paddingBottom: spacing.xl },
  versions: { ...typography.tiny, color: colors.textMuted, textAlign: 'center' },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  cardTitle: { ...typography.h3, color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  cardText: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  cardButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, alignSelf: 'stretch' },
  cardButton: { flex: 1 },
});
