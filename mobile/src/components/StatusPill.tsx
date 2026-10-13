import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { OrderStatus } from '../types';

/**
 * Colour mapping for the OrderStatus enum. Tones are muted on purpose — a row
 * of saturated pills in an order list is noisy and makes nothing stand out.
 */
const TONE: Record<string, { bg: string; fg: string; label: string }> = {
  PENDING: { bg: '#FBF1E3', fg: '#9A6514', label: 'Pending' },
  PROCESSING: { bg: '#E9EFFB', fg: '#2B4E9B', label: 'Processing' },
  PAID: { bg: colors.successSoft, fg: colors.success, label: 'Paid' },
  SHIPPED: { bg: '#E9EFFB', fg: '#2B4E9B', label: 'Shipped' },
  DELIVERED: { bg: colors.successSoft, fg: colors.success, label: 'Delivered' },
  CANCELLED: { bg: colors.errorSoft, fg: colors.error, label: 'Cancelled' },
  REFUNDED: { bg: colors.surfaceAlt, fg: colors.textSecondary, label: 'Refunded' },
  RETURN_APPROVED: { bg: '#FBF1E3', fg: '#9A6514', label: 'Return approved' },
  RETURN_COMPLETED: { bg: colors.surfaceAlt, fg: colors.textSecondary, label: 'Return complete' },
};

export function StatusPill({ status }: { status: OrderStatus | string }) {
  const tone = TONE[status] ?? {
    bg: colors.surfaceAlt,
    fg: colors.textSecondary,
    label: String(status).replace(/_/g, ' ').toLowerCase(),
  };

  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <View style={[styles.dot, { backgroundColor: tone.fg }]} />
      <Text style={[styles.text, { color: tone.fg }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { ...typography.tiny, textTransform: 'capitalize' },
});
