import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { colors, fonts, radius, shadow } from '../theme';
import type { ProductSummary } from '../types';
import { pickDefaultVariant } from '../utils/format';
import { QtyStepper } from './QtyStepper';

/**
 * One-tap add for product cards, turning into a − qty + stepper once the item
 * is in the cart.
 *
 * Saves a trip into the product page for the common case of a single-variant
 * grocery item. A product with more than one active option opens its page
 * instead, so the shopper picks the size rather than silently getting the
 * cheapest.
 *
 * Every change goes through CartContext — the same calls the cart screen uses —
 * so guest and signed-in carts behave identically.
 */
export function AddToCartButton({ product }: { product: ProductSummary }) {
  const router = useRouter();
  const { cart, addItem, updateItem, removeItem } = useCart();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const variant = pickDefaultVariant(product.variants);
  const activeOptions = product.variants?.filter((v) => v.isActive).length ?? 0;
  const inStock = !!variant && variant.isActive && variant.quantity > 0;

  // Out of stock is already announced by the card's overlay.
  if (!variant || !inStock) return null;

  const line = cart.items.find((i) => i.variant.id === variant.id);
  const qty = line?.quantity ?? 0;
  const floor = Math.max(1, line?.moq ?? 1);
  const atStockLimit = qty >= variant.quantity;

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    // A light tap of feedback confirms the add before the network replies.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setBusy(true);
    try {
      await action();
    } catch (e) {
      toast((e as Error).message || 'Could not update your cart', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (activeOptions > 1 || qty === 0) {
    const opensPage = activeOptions > 1;
    return (
      <Pressable
        onPress={() =>
          opensPage
            ? router.push(`/product/${product.slug}`)
            : run(() => addItem(product, variant, 1))
        }
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={
          opensPage ? `Choose an option for ${product.name}` : `Add ${product.name} to cart`
        }
        style={({ pressed }) => [styles.add, pressed && styles.pressed]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.addText}>ADD</Text>
        )}
      </Pressable>
    );
  }

  return (
    <QtyStepper
      qty={qty}
      busy={busy}
      plusDisabled={atStockLimit}
      label={`${qty} of ${product.name} in cart`}
      minusLabel={qty - 1 < floor ? `Remove ${product.name}` : 'Decrease quantity'}
      onMinus={() => run(() => (qty - 1 < floor ? removeItem(line!) : updateItem(line!, qty - 1)))}
      onPlus={() => run(() => updateItem(line!, qty + 1))}
    />
  );
}

const HEIGHT = 30;

const styles = StyleSheet.create({
  add: {
    height: HEIGHT,
    minWidth: 58,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  addText: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.4, color: colors.primary },
  pressed: { opacity: 0.85 },
});
