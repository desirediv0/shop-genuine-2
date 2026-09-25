import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>We hit a problem</Text>
      <Text style={styles.muted}>{message}</Text>
      {onRetry ? <Button label="Try again" variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.muted}>{message}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

/** Grey block used while real content loads. */
export function Skeleton({
  width,
  height,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  style?: object;
}) {
  return (
    <View
      style={[
        { width: width ?? '100%', height, backgroundColor: colors.skeleton, borderRadius: radius.sm },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: { ...typography.h3, color: colors.text, textAlign: 'center' },
  muted: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
});
