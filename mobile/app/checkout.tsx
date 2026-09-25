import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addresses as addressApi,
  cart as cartApi,
  coupons,
  payments,
} from '../src/api/services';
import { AddressForm, type AddressDraft } from '../src/components/AddressForm';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { ErrorState, LoadingState } from '../src/components/States';
import { useCart } from '../src/context/CartContext';
import { useStoreVertical } from '../src/context/StoreVerticalContext';
import { useToast } from '../src/context/ToastContext';
import { colors, radius, spacing, typography } from '../src/theme';
import type { Address } from '../src/types';
import { formatPrice } from '../src/utils/format';
import { payWithRazorpay, isRazorpayAvailable } from '../src/utils/razorpay';

type PaymentChoice = 'COD' | 'RAZORPAY';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { cart, refresh } = useCart();
  // Orders record which sub-brand the shopper was in, matching the website.
  const { verticalId } = useStoreVertical();
  const { toast } = useToast();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [method, setMethod] = useState<PaymentChoice>('COD');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discount: number;
  } | null>(null);
  const [placing, setPlacing] = useState(false);

  const addressesQ = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list(),
  });

  const settingsQ = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: () => payments.settings(),
  });

  const addressList: Address[] = useMemo(
    () => addressesQ.data?.addresses ?? [],
    [addressesQ.data],
  );

  // Preselect the default address, or the only one there is.
  useEffect(() => {
    if (!addressId && addressList.length) {
      setAddressId((addressList.find((a) => a.isDefault) ?? addressList[0]).id);
    }
  }, [addressList, addressId]);

  const createAddress = useMutation({
    mutationFn: (draft: AddressDraft) => addressApi.create(draft),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setAddressId(res.address.id);
      setShowAddressForm(false);
      toast('Address saved', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const verifyCoupon = useMutation({
    mutationFn: (code: string) =>
      coupons.verify({
        code: code.trim().toUpperCase(),
        cartTotal: cart.subtotal,
        cartItems: cart.items.map((i) => ({
          productId: i.product.id,
          productVariantId: i.variant.id,
          price: i.price,
          quantity: i.quantity,
        })),
      }),
    onSuccess: (res) => {
      setAppliedCoupon({
        id: res.coupon.id,
        code: res.coupon.code,
        discount: parseFloat(res.coupon.discountAmount) || 0,
      });
      toast(`Coupon ${res.coupon.code} applied`, 'success');
    },
    onError: (e: Error) => {
      setAppliedCoupon(null);
      toast(e.message, 'error');
    },
  });

  const settings = settingsQ.data;
  const codCharge = method === 'COD' ? (settings?.codCharge ?? 0) : 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(cart.subtotal + codCharge - discount, 0);

  // Keep the selected method valid if the admin disables a gateway.
  useEffect(() => {
    if (!settings) return;
    if (method === 'COD' && !settings.cashEnabled && settings.razorpayEnabled) {
      setMethod('RAZORPAY');
    }
    if (method === 'RAZORPAY' && !settings.razorpayEnabled && settings.cashEnabled) {
      setMethod('COD');
    }
  }, [settings, method]);

  if (addressesQ.isLoading || settingsQ.isLoading) {
    return <LoadingState label="Preparing checkout…" />;
  }

  if (addressesQ.isError) {
    return (
      <ErrorState
        message={(addressesQ.error as Error)?.message}
        onRetry={() => addressesQ.refetch()}
      />
    );
  }

  const placeOrder = async () => {
    if (!addressId) {
      toast('Choose a delivery address', 'error');
      return;
    }

    setPlacing(true);
    try {
      // Server revalidates stock and prices before we take any money.
      const validation = await cartApi.validate();
      if (!validation.valid) {
        toast('Some items are no longer available. Please review your cart.', 'error');
        await refresh();
        router.replace('/cart');
        return;
      }

      if (method === 'COD') {
        const order = await payments.cashOrder({
          shippingAddressId: addressId,
          billingAddressSameAsShipping: true,
          couponCode: appliedCoupon?.code ?? null,
          couponId: appliedCoupon?.id ?? null,
          discountAmount: discount,
          storeVerticalId: verticalId,
        });
        await refresh();
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        toast('Order placed', 'success');
        router.replace(`/orders/${order.orderId}`);
        return;
      }

      // Razorpay: create the order server-side, then open the SDK.
      if (!isRazorpayAvailable()) {
        toast(
          'Card/UPI payment needs the full app build. Please choose Cash on Delivery.',
          'error',
        );
        return;
      }

      const rzpOrder = await payments.checkout({
        ...(appliedCoupon
          ? { couponId: appliedCoupon.id, couponCode: appliedCoupon.code }
          : {}),
        ...(verticalId ? { storeVerticalId: verticalId } : {}),
      });
      const keyRes = await payments.razorpayKey();
      if (!keyRes.key) {
        toast('Online payment is not configured. Please choose Cash on Delivery.', 'error');
        return;
      }

      const result = await payWithRazorpay({
        key: keyRes.key,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Shop Genuine',
        description: `${cart.totalQuantity} item(s)`,
      });

      const verified = await payments.verify({
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
        shippingAddressId: addressId,
        billingAddressSameAsShipping: true,
        couponCode: appliedCoupon?.code ?? null,
        couponId: appliedCoupon?.id ?? null,
        discountAmount: discount,
        storeVerticalId: verticalId,
      });

      await refresh();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast('Payment successful', 'success');
      router.replace(`/orders/${verified.orderId}`);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Address */}
        <Section title="Delivery address">
          {addressList.length === 0 ? (
            <Text style={styles.muted}>No saved addresses yet.</Text>
          ) : (
            addressList.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setAddressId(a.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: addressId === a.id }}
                style={[styles.option, addressId === a.id && styles.optionSelected]}
              >
                <View style={styles.radio}>
                  {addressId === a.id ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.optionBody}>
                  <Text style={styles.optionTitle}>{a.name}</Text>
                  <Text style={styles.optionText}>
                    {a.street}, {a.city}, {a.state} {a.postalCode}
                  </Text>
                  <Text style={styles.optionText}>{a.phone}</Text>
                </View>
              </Pressable>
            ))
          )}

          <Button
            label="Add a new address"
            variant="outline"
            onPress={() => setShowAddressForm(true)}
          />
        </Section>

        {/* Payment */}
        <Section title="Payment method">
          {settings?.cashEnabled ? (
            <Choice
              selected={method === 'COD'}
              title="Cash on Delivery"
              subtitle={
                (settings?.codCharge ?? 0) > 0
                  ? `Extra ${formatPrice(settings.codCharge)} handling fee`
                  : 'Pay when your order arrives'
              }
              onPress={() => setMethod('COD')}
            />
          ) : null}

          {settings?.razorpayEnabled ? (
            <Choice
              selected={method === 'RAZORPAY'}
              title="Card / UPI / Netbanking"
              subtitle="Pay securely via Razorpay"
              onPress={() => setMethod('RAZORPAY')}
            />
          ) : null}

          {!settings?.cashEnabled && !settings?.razorpayEnabled ? (
            <Text style={styles.muted}>
              No payment methods are currently enabled. Please try again later.
            </Text>
          ) : null}
        </Section>

        {/* Coupon */}
        <Section title="Coupon">
          {appliedCoupon ? (
            <View style={styles.couponApplied}>
              <View style={styles.optionBody}>
                <Text style={styles.optionTitle}>{appliedCoupon.code} applied</Text>
                <Text style={styles.optionText}>You save {formatPrice(appliedCoupon.discount)}</Text>
              </View>
              <Pressable
                onPress={() => {
                  setAppliedCoupon(null);
                  setCouponCode('');
                }}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.removeCoupon}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <View style={styles.couponInput}>
                <Input
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholder="Enter coupon code"
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              <Button
                label="Apply"
                variant="outline"
                loading={verifyCoupon.isPending}
                disabled={!couponCode.trim()}
                onPress={() => verifyCoupon.mutate(couponCode)}
              />
            </View>
          )}
        </Section>

        {/* Summary */}
        <Section title="Order summary">
          <Row label={`Subtotal (${cart.totalQuantity} items)`} value={formatPrice(cart.subtotal)} />
          {codCharge > 0 ? <Row label="COD fee" value={formatPrice(codCharge)} /> : null}
          {discount > 0 ? (
            <Row label={`Discount (${appliedCoupon?.code})`} value={`−${formatPrice(discount)}`} />
          ) : null}
          <Text style={styles.muted}>
            Shipping is calculated by the server when the order is placed.
          </Text>
        </Section>
      </ScrollView>

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <Button
          label={method === 'COD' ? 'Place order' : 'Pay now'}
          fullWidth
          loading={placing}
          disabled={!addressId || !cart.items.length}
          onPress={placeOrder}
        />
      </View>

      {/* New address sheet */}
      <Modal
        visible={showAddressForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddressForm(false)}
      >
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>New address</Text>
          <AddressForm
            submitting={createAddress.isPending}
            onSubmit={(draft) => createAddress.mutate(draft)}
            onCancel={() => setShowAddressForm(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Choice({
  selected,
  title,
  subtitle,
  onPress,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={styles.radio}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <View style={styles.optionBody}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionText}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.optionText}>{label}</Text>
      <Text style={styles.optionTitle}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xl },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text },
  sectionBody: { gap: spacing.sm },
  muted: { ...typography.small, color: colors.textMuted },
  option: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.backgroundAlt },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionBody: { flex: 1, gap: 2 },
  optionTitle: { ...typography.small, color: colors.text, fontWeight: '600' },
  optionText: { ...typography.small, color: colors.textMuted },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { ...typography.body, color: colors.textMuted },
  totalValue: { ...typography.h2, color: colors.text },
  couponRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  couponInput: { flex: 1 },
  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.backgroundAlt,
  },
  removeCoupon: { ...typography.tiny, color: colors.error, fontWeight: '600' },
  modal: { flex: 1, padding: spacing.lg, backgroundColor: colors.background },
  modalTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
});
