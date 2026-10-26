import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { CategoryGlyph } from '../theme/stores';
import { Button } from './Button';
import { Illustration, type Tint } from './decor/Illustration';
import { type IconName } from './Icon';

/** The illustration's main symbol for each empty-state icon. */
const GLYPHS: Partial<Record<IconName, CategoryGlyph>> = {
  cart: 'cart-outline',
  wishlist: 'heart-outline',
  orders: 'package-variant-closed',
  search: 'magnify',
  address: 'map-marker-outline',
  empty: 'basket-outline',
};

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
      <Illustration
        icon="cloud-off-outline"
        tint={{ solid: colors.error, soft: colors.errorSoft }}
        size={150}
        floaters={[]}
      />
      <Text style={styles.title}>We hit a problem</Text>
      <Text style={styles.muted}>{message}</Text>
      {onRetry ? (
        <Button label="Try again" variant="outline" onPress={onRetry} style={styles.action} />
      ) : null}
    </View>
  );
}

/**
 * An empty screen that still looks finished: an illustration in the store's
 * colours, a line of copy, an action, and optionally something to browse
 * underneath (`footer`, e.g. <NewInStoreRail />). With a footer the screen
 * scrolls, and the message sits near the top instead of dead centre.
 */
export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon = 'empty',
  tint,
  footer,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
  tint?: Tint;
  footer?: React.ReactNode;
}) {
  const body = (
    <>
      <Illustration icon={GLYPHS[icon] ?? 'basket-outline'} tint={tint} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.muted}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </>
  );

  if (!footer) return <View style={styles.center}>{body}</View>;
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.top}>{body}</View>
      {footer}
    </ScrollView>
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
  scroll: { paddingBottom: spacing.xxl, flexGrow: 1 },
  top: { alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { ...typography.h3, color: colors.text, textAlign: 'center' },
  muted: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: { marginTop: spacing.sm, minWidth: 180 },
});
