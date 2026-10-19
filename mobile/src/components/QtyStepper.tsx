import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon } from './Icon';

/**
 * The orange − qty + control, shared by product cards, the product page bar
 * and the cart so quantity changes look and behave the same everywhere.
 * Callers decide what "minus" means at the floor (usually: remove).
 */
export function QtyStepper({
  qty,
  onMinus,
  onPlus,
  busy = false,
  plusDisabled = false,
  size = 'sm',
  minusLabel = 'Decrease quantity',
  label,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
  busy?: boolean;
  plusDisabled?: boolean;
  size?: 'sm' | 'lg';
  minusLabel?: string;
  label?: string;
}) {
  const lg = size === 'lg';
  return (
    <View style={[styles.wrap, lg ? styles.lg : styles.sm]} accessibilityLabel={label}>
      <Pressable
        onPress={onMinus}
        disabled={busy}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={minusLabel}
        style={[styles.btn, { width: lg ? 44 : 26 }]}
      >
        <Icon name="minus" size={lg ? 18 : 15} color={colors.textInverse} />
      </Pressable>

      {busy ? (
        <ActivityIndicator size="small" color={colors.textInverse} />
      ) : (
        <Text style={[styles.qty, lg && styles.qtyLg]}>{qty}</Text>
      )}

      <Pressable
        onPress={onPlus}
        disabled={busy || plusDisabled}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: busy || plusDisabled }}
        style={[styles.btn, { width: lg ? 44 : 26 }, plusDisabled && styles.dim]}
      >
        <Icon name="plus" size={lg ? 18 : 15} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.card,
  },
  sm: { height: 30, width: 80, borderRadius: radius.sm },
  lg: { height: 52, flex: 1, borderRadius: radius.md, paddingHorizontal: 4 },
  btn: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  qty: { fontFamily: fonts.bold, fontSize: 13, color: colors.textInverse },
  qtyLg: { fontSize: 17 },
  dim: { opacity: 0.4 },
});
