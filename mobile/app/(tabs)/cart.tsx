import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { QuantityStepper } from '../../src/components/QuantityStepper';
import { EmptyState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { CartItem } from '../../src/types';
import { formatPrice, variantLabel } from '../../src/utils/format';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, loading, mutating, updateItem, removeItem, isGuestCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (loading && !cart.items.length) return <LoadingState label="Loading cart…" />;

  if (!cart.items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Browse the catalogue and add something you like."
        actionLabel="Start shopping"
        onAction={() => router.push('/')}
      />
    );
  }

  const onCheckout = () => {
    if (!isAuthenticated) {
      toast('Please sign in to check out', 'info');
      router.push('/auth/login');
      return;
    }
    router.push('/checkout');
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isGuestCart ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                You&apos;re browsing as a guest. Sign in at checkout and this cart comes with you.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <CartRow
            item={item}
            disabled={mutating}
            onChange={(q) => updateItem(item, q)}
            onRemove={() => removeItem(item)}
          />
        )}
      />

      {/* Summary */}
      <View style={[styles.summary, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subtotal ({cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'})
          </Text>
          <Text style={styles.summaryValue}>{formatPrice(cart.subtotal)}</Text>
        </View>
        <Text style={styles.summaryNote}>
          Shipping and any discounts are calculated at checkout.
        </Text>
        <Button label="Proceed to checkout" fullWidth onPress={onCheckout} loading={mutating} />
      </View>
    </View>
  );
}

function CartRow({
  item,
  disabled,
  onChange,
  onRemove,
}: {
  item: CartItem;
  disabled: boolean;
  onChange: (q: number) => void;
  onRemove: () => void;
}) {
  const label = variantLabel(item.variant.attributes);

  return (
    <View style={styles.row}>
      <Image source={item.product.image ?? undefined} style={styles.thumb} contentFit="cover" />

      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={2}>
          {item.product.name}
        </Text>
        {label ? <Text style={styles.rowVariant}>{label}</Text> : null}
        <Text style={styles.rowPrice}>{formatPrice(item.price)}</Text>

        <View style={styles.rowActions}>
          <QuantityStepper
            value={item.quantity}
            min={item.moq || 1}
            max={99}
            disabled={disabled}
            onChange={onChange}
          />
          <Pressable onPress={onRemove} disabled={disabled} hitSlop={8} accessibilityRole="button">
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.rowSubtotal}>{formatPrice(item.subtotal)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md },
  notice: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: { ...typography.small, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAlt,
  },
  rowBody: { flex: 1, gap: 3 },
  rowName: { ...typography.small, color: colors.text, fontWeight: '600' },
  rowVariant: { ...typography.tiny, color: colors.textMuted },
  rowPrice: { ...typography.small, color: colors.textMuted },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  remove: { ...typography.tiny, color: colors.error, fontWeight: '600' },
  rowSubtotal: { ...typography.bodyStrong, color: colors.text },
  summary: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.h2, color: colors.text },
  summaryNote: { ...typography.tiny, color: colors.textMuted, marginBottom: spacing.sm },
});
