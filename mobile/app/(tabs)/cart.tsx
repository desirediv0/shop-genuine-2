import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Backdrop } from '../../src/components/decor/Backdrop';
import { Appear } from '../../src/components/motion/Appear';
import { Icon } from '../../src/components/Icon';
import { NewInStoreRail } from '../../src/components/NewInStoreRail';
import { QtyStepper } from '../../src/components/QtyStepper';
import { EmptyState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import { storeTheme } from '../../src/theme/stores';
import type { CartItem } from '../../src/types';
import { formatPrice, variantLabel } from '../../src/utils/format';

/** List price for a line: the server's `mrp` when it sends one. */
const listPrice = (i: CartItem) => Math.max(i.mrp ?? i.originalPrice ?? i.price, i.price);

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, loading, mutating, updateItem, removeItem, isGuestCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { vertical } = useStoreVertical();
  const theme = storeTheme(vertical?.name);

  if (loading && !cart.items.length) return <LoadingState label="Loading cart…" />;

  if (!cart.items.length) {
    return (
      <View style={styles.screen}>
        <Backdrop tint={theme} />
        <EmptyState
          title="Your cart is empty"
          message="Browse the catalogue and add something you like."
          actionLabel="Start shopping"
          icon="cart"
          tint={theme}
          // Opened from a product page, this goes back to it; as the Cart tab,
          // back goes to Home. Pushing '/' instead stacked a second copy of the
          // tab navigator on top of the first.
          onAction={() => (router.canGoBack() ? router.back() : router.push('/'))}
          footer={<NewInStoreRail />}
        />
      </View>
    );
  }

  // Savings against the list price. Lines from servers that do not send
  // `mrp` fall back to `originalPrice`, which can only under-count — this
  // never claims a saving the shopper is not getting.
  const itemTotal = cart.items.reduce((sum, i) => sum + listPrice(i) * i.quantity, 0);
  const savings = Math.max(0, Math.round(itemTotal - cart.subtotal));

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
      <Backdrop tint={theme} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {savings > 0 ? (
          <Appear index={0}>
            <View style={styles.savings}>
              <View style={styles.savingsIcon}>
                <Icon name="tag" size={16} color={colors.success} filled />
              </View>
              <Text style={styles.savingsText}>
                You&apos;re saving <Text style={styles.savingsAmount}>{formatPrice(savings)}</Text> on
                this order
              </Text>
            </View>
          </Appear>
        ) : null}

        {isGuestCart ? (
          <Pressable
            onPress={() => router.push('/auth/login')}
            accessibilityRole="button"
            style={styles.guest}
          >
            <Icon name="account" size={18} color={colors.primary} />
            <Text style={styles.guestText}>
              Shopping as a guest. <Text style={styles.guestLink}>Sign in</Text> and this cart comes
              with you.
            </Text>
          </Pressable>
        ) : null}

        {/* All items in one card, the way a basket reads */}
        <Appear index={1}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'} in your cart
            </Text>
            {cart.items.map((item, i) => (
              <CartRow
                key={item.id}
                item={item}
                first={i === 0}
                onChange={(q) => updateItem(item, q)}
                onRemove={() => removeItem(item)}
              />
            ))}
          </View>
        </Appear>

        {/* Bill */}
        <Appear index={2}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bill details</Text>
            <BillRow label="Item total" value={formatPrice(itemTotal)} />
            {savings > 0 ? (
              <BillRow label="Discount" value={`− ${formatPrice(savings)}`} tone="success" />
            ) : null}
            <View style={styles.billDivider} />
            <BillRow label="Subtotal" value={formatPrice(cart.subtotal)} strong />
            <Text style={styles.billNote}>Delivery and coupons are applied at checkout.</Text>
          </View>
        </Appear>
      </ScrollView>

      {/* Checkout bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View>
          <Text style={styles.barTotal}>{formatPrice(cart.subtotal)}</Text>
          <Text style={styles.barLabel}>TOTAL</Text>
        </View>
        <Button
          label="Proceed to checkout"
          onPress={onCheckout}
          loading={mutating}
          style={styles.barBtn}
        />
      </View>
    </View>
  );
}

function CartRow({
  item,
  first,
  onChange,
  onRemove,
}: {
  item: CartItem;
  first: boolean;
  onChange: (q: number) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const label = variantLabel(item.variant.attributes);
  const list = listPrice(item);
  const floor = Math.max(1, item.moq || 1);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setBusy(true);
    try {
      await action();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.row, !first && styles.rowDivider]}>
      <View style={styles.thumbTile}>
        <Image source={item.product.image ?? undefined} style={styles.thumb} contentFit="contain" />
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={2}>
          {item.product.name}
        </Text>
        {label ? <Text style={styles.rowVariant}>{label}</Text> : null}
        <View style={styles.rowPrices}>
          <Text style={styles.rowPrice}>{formatPrice(item.price)}</Text>
          {list > item.price ? <Text style={styles.rowStrike}>{formatPrice(list)}</Text> : null}
        </View>
      </View>

      <View style={styles.rowRight}>
        <QtyStepper
          qty={item.quantity}
          busy={busy}
          label={`${item.quantity} of ${item.product.name}`}
          minusLabel={item.quantity - 1 < floor ? `Remove ${item.product.name}` : 'Decrease quantity'}
          onMinus={() => run(() => (item.quantity - 1 < floor ? onRemove() : onChange(item.quantity - 1)))}
          onPlus={() => run(() => onChange(item.quantity + 1))}
        />
        <Text style={styles.rowSubtotal}>{formatPrice(item.subtotal)}</Text>
      </View>
    </View>
  );
}

function BillRow({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: 'success';
}) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, strong && styles.billStrong]}>{label}</Text>
      <Text
        style={[styles.billValue, strong && styles.billStrong, tone === 'success' && styles.billSuccess]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 140 },
  savings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  savingsIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsText: { ...typography.small, color: colors.success, flex: 1 },
  savingsAmount: { fontFamily: fonts.bold },
  guest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  guestText: { ...typography.small, color: colors.text, flex: 1 },
  guestLink: { fontFamily: fonts.semibold, color: colors.primary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  thumbTile: {
    width: 62,
    height: 62,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 4,
  },
  thumb: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: 2 },
  rowName: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.text },
  rowVariant: { ...typography.tiny, color: colors.textMuted },
  rowPrices: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  rowPrice: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  rowStrike: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  rowRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  rowSubtotal: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, marginTop: spacing.sm },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  billLabel: { ...typography.small, color: colors.textSecondary },
  billValue: { ...typography.small, color: colors.text },
  billStrong: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  billSuccess: { color: colors.success, fontFamily: fonts.semibold },
  billDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  billNote: { ...typography.tiny, color: colors.textMuted, marginTop: spacing.sm },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...shadow.bar,
  },
  barTotal: { fontFamily: fonts.bold, fontSize: 19, color: colors.text },
  barLabel: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1, color: colors.textMuted },
  barBtn: { flex: 1 },
});
