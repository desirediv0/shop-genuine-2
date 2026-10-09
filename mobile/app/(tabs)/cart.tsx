import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { QuantityStepper } from '../../src/components/QuantityStepper';
import { EmptyState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, radius, shadow, spacing, typography } from '../../src/theme';
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
        icon="cart"
        // Opened from a product page, this goes back to it; as the Cart tab,
        // back goes to Home. Pushing '/' instead stacked a second copy of the
        // tab navigator on top of the first.
        onAction={() => (router.canGoBack() ? router.back() : router.push('/'))}
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
          <Pressable
            onPress={onRemove}
            disabled={disabled}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.product.name} from cart`}
            style={styles.removeBtn}
          >
            <Icon name="trash" size={15} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.rowSubtotal}>{formatPrice(item.subtotal)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  notice: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  noticeText: { ...typography.small, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  rowBody: { flex: 1, gap: 3 },
  rowName: { ...typography.smallStrong, color: colors.text },
  rowVariant: { ...typography.tiny, color: colors.textMuted },
  rowPrice: { ...typography.smallStrong, color: colors.textSecondary },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  removeBtn: { padding: spacing.xs },
  rowSubtotal: { ...typography.price, color: colors.text },
  summary: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.priceLarge, color: colors.text },
  summaryNote: { ...typography.tiny, color: colors.textMuted, marginBottom: spacing.sm },
});
