import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { colors, fonts, radius, shadow, spacing, typography } from '../theme';
import { formatPrice } from '../utils/format';
import { Icon } from './Icon';

/** Height the bar occupies, so lists can leave room for it. */
export const FLOATING_CART_BAR_SPACE = 84;

/**
 * A "View cart" pill floating over the bottom of a product list once the cart
 * has something in it — the quick-commerce pattern Akash pointed to. Paired
 * with the ADD buttons on cards, a shopper can fill the cart from a category
 * and go straight to it without hunting for the tab bar.
 *
 * Renders nothing while the cart is empty.
 */
export function FloatingCartBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart } = useCart();

  if (cart.totalQuantity === 0) return null;

  const items = cart.totalQuantity;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + spacing.md }]}>
      <Pressable
        onPress={() => router.push('/basket')}
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${items} ${items === 1 ? 'item' : 'items'}, ${formatPrice(cart.subtotal)}`}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
      >
        <View style={styles.iconBox}>
          <Icon name="cart" size={18} color={colors.textInverse} filled />
        </View>
        <View style={styles.summary}>
          <Text style={styles.items}>
            {items} {items === 1 ? 'item' : 'items'}
          </Text>
          <Text style={styles.total}>{formatPrice(cart.subtotal)}</Text>
        </View>
        <Text style={styles.cta}>View cart</Text>
        <Icon name="forward" size={16} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    ...shadow.raised,
  },
  pressed: { opacity: 0.9 },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: { flex: 1 },
  items: { ...typography.tiny, color: colors.textInverse, opacity: 0.9 },
  total: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.textInverse },
  cta: { fontFamily: fonts.semibold, fontSize: 15, color: colors.textInverse },
});
