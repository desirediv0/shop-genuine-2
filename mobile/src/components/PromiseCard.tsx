import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { PromiseRow } from './product/PromiseRow';

/**
 * "The Genuine promise" — the three trust points (authentic, delivery,
 * payment) on a white card. Closes Home and fills the signed-out Account
 * screen. The points themselves come from PromiseRow, which only claims what
 * is true (COD appears only while the admin has it switched on).
 */
export function PromiseCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>The Genuine promise</Text>
      <PromiseRow style={styles.row} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: { marginTop: spacing.sm, borderTopWidth: 0, borderBottomWidth: 0 },
});
