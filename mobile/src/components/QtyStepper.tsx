import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomIn } from 'react-native-reanimated';
import { colors, fonts, radius, shadow } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './motion/PressableScale';

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
    // skipEntering: the number only pops when it changes, not when the
    // stepper itself first appears.
    <LayoutAnimationConfig skipEntering>
      <View style={[styles.wrap, lg ? styles.lg : styles.sm]} accessibilityLabel={label}>
        <PressableScale
          scaleTo={0.82}
          onPress={onMinus}
          disabled={busy}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={minusLabel}
          style={[styles.btn, { width: lg ? 44 : 26 }]}
        >
          <Icon name="minus" size={lg ? 18 : 15} color={colors.textInverse} />
        </PressableScale>

        {busy ? (
          <ActivityIndicator size="small" color={colors.textInverse} />
        ) : (
          <Animated.Text key={qty} entering={ZoomIn.duration(180)} style={[styles.qty, lg && styles.qtyLg]}>
            {qty}
          </Animated.Text>
        )}

        <PressableScale
          scaleTo={0.82}
          onPress={onPlus}
          disabled={busy || plusDisabled}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
          accessibilityState={{ disabled: busy || plusDisabled }}
          style={[styles.btn, { width: lg ? 44 : 26 }, plusDisabled && styles.dim]}
        >
          <Icon name="plus" size={lg ? 18 : 15} color={colors.textInverse} />
        </PressableScale>
      </View>
    </LayoutAnimationConfig>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.glow(colors.primary, 0.32),
  },
  sm: { height: 30, width: 80, borderRadius: radius.sm },
  lg: { height: 52, flex: 1, borderRadius: radius.md, paddingHorizontal: 4 },
  btn: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  qty: { fontFamily: fonts.display, fontSize: 13.5, color: colors.textInverse },
  qtyLg: { fontSize: 17 },
  dim: { opacity: 0.4 },
});
