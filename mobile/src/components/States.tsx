import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export function LoadingState({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
      {label ? <Text style={styles.muted}>{label}</Text> : null}
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
      <View style={[styles.halo, styles.haloError]}>
        <Icon name="warning" size={26} color={colors.error} />
      </View>
      <Text style={styles.title}>We hit a problem</Text>
      <Text style={styles.muted}>{message}</Text>
      {onRetry ? (
        <Button label="Try again" variant="outline" onPress={onRetry} style={styles.action} />
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon = 'empty',
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
}) {
  return (
    <View style={styles.center}>
      <View style={styles.halo}>
        <Icon name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.muted}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
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
        {
          width: width ?? '100%',
          height,
          backgroundColor: colors.skeleton,
          borderRadius: radius.md,
        },
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
  // A soft tinted disc behind the glyph stops an empty screen feeling blank.
  halo: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  haloError: { backgroundColor: colors.errorSoft },
  title: { ...typography.h3, color: colors.text, textAlign: 'center' },
  muted: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: { marginTop: spacing.sm, minWidth: 180 },
});
