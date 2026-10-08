import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { notifications as notificationsApi } from '../api/services';
import { diagnosePushToken, isPushAvailable } from '../utils/pushRegistration';
import { isRazorpayAvailable } from '../utils/razorpay';
import { colors, radius, spacing, typography } from '../theme';
import { Icon } from './Icon';

/**
 * Development-only push diagnostics.
 *
 * Push can fail quietly for several unrelated reasons — no native module (Expo
 * Go), no EAS projectId, permission denied, or an emulator without Play
 * Services. This surfaces which one it is instead of leaving a silent no-op,
 * and gives a one-tap way to prove delivery end to end.
 *
 * Rendered only when __DEV__, so it never reaches a store build.
 */
export function PushDebugPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.easConfig as { projectId?: string } | undefined)?.projectId ??
    null;

  const nativeModule = isPushAvailable();

  const check = useCallback(async () => {
    setChecking(true);
    const { token: t, error } = await diagnosePushToken();
    setToken(t);
    setTokenError(error);
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const sendTest = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await notificationsApi.sendTest();
      setResult(
        res.accepted > 0
          ? `Expo accepted the push for ${res.accepted} device(s)`
          : 'Expo accepted 0 devices — is this device registered?',
      );
    } catch (e) {
      setResult((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Icon name="bell" size={15} color={colors.textSecondary} />
        <Text style={styles.title}>Diagnostics (dev only)</Text>
      </View>

      <Row label="Environment" value={Constants.executionEnvironment ?? 'unknown'} />
      <Row label="Native module" value={nativeModule ? 'loaded' : 'absent'} ok={nativeModule} />
      <Row
        label="EAS projectId"
        value={projectId ? `${projectId.slice(0, 8)}…` : 'missing'}
        ok={!!projectId}
      />
      <Row
        label="Razorpay module"
        value={isRazorpayAvailable() ? 'loaded' : 'absent'}
        ok={isRazorpayAvailable()}
      />
      <Row
        label="Push token"
        value={checking ? 'checking…' : token ? `${token.slice(0, 26)}…` : 'none'}
        ok={!!token}
      />

      {tokenError && !token ? <Text style={styles.why}>{tokenError}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={check} style={styles.btn} accessibilityRole="button">
          <Text style={styles.btnText}>Re-check</Text>
        </Pressable>
        <Pressable
          onPress={sendTest}
          disabled={sending}
          style={[styles.btn, styles.btnPrimary]}
          accessibilityRole="button"
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <Text style={[styles.btnText, styles.btnTextPrimary]}>Send test push</Text>
          )}
        </Pressable>
      </View>

      {result ? <Text style={styles.result}>{result}</Text> : null}
    </View>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          ok === true && styles.good,
          ok === false && styles.bad,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  title: { ...typography.smallStrong, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { ...typography.small, color: colors.textMuted },
  rowValue: { ...typography.small, color: colors.text, flexShrink: 1 },
  good: { color: colors.success },
  bad: { color: colors.error },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: colors.text, borderColor: colors.text },
  btnText: { ...typography.smallStrong, color: colors.text },
  btnTextPrimary: { color: colors.textInverse },
  result: { ...typography.small, color: colors.textSecondary, marginTop: spacing.sm },
  why: { ...typography.small, color: colors.error, marginTop: spacing.sm },
});
