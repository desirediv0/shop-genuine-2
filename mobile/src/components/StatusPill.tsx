import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { OrderStatus } from '../types';

/** Colour mapping for the OrderStatus enum in server/prisma/schema.prisma. */
const TONE: Record<string, { bg: string; fg: string; label: string }> = {
  PENDING: { bg: '#FFF4E5', fg: '#B45309', label: 'Pending' },
  PROCESSING: { bg: '#E8F0FE', fg: '#1D4ED8', label: 'Processing' },
  PAID: { bg: '#E7F5EC', fg: '#3D9A5B', label: 'Paid' },
  SHIPPED: { bg: '#E8F0FE', fg: '#1D4ED8', label: 'Shipped' },
  DELIVERED: { bg: '#E7F5EC', fg: '#3D9A5B', label: 'Delivered' },
  CANCELLED: { bg: '#FDE8EA', fg: '#DC3545', label: 'Cancelled' },
  REFUNDED: { bg: '#F3F0F7', fg: '#726A78', label: 'Refunded' },
  RETURN_APPROVED: { bg: '#FFF4E5', fg: '#B45309', label: 'Return approved' },
  RETURN_COMPLETED: { bg: '#F3F0F7', fg: '#726A78', label: 'Return complete' },
};

export function StatusPill({ status }: { status: OrderStatus | string }) {
  const tone = TONE[status] ?? {
    bg: colors.backgroundAlt,
    fg: colors.textMuted,
    label: String(status),
  };

  return (
    <View style={[styles.pill, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { ...typography.tiny, fontWeight: '700' },
});
