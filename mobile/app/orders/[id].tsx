import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orders as ordersApi, payments } from '../../src/api/services';
import { Button } from '../../src/components/Button';
import { ErrorState, LoadingState } from '../../src/components/States';
import { StatusPill } from '../../src/components/StatusPill';
import { useToast } from '../../src/context/ToastContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { Order } from '../../src/types';
import { formatDate, formatPrice, toNumber } from '../../src/utils/format';

/** Statuses the customer is still allowed to cancel from. */
const CANCELLABLE = new Set(['PENDING', 'PROCESSING', 'PAID']);

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await ordersApi.byId(id);
      // Endpoint shape differs between routes; normalise to an Order.
      return ((res as { order?: Order }).order ?? res) as Order;
    },
    enabled: !!id,
  });

  const cancel = useMutation({
    mutationFn: () => payments.cancel(id, 'Cancelled from the app'),
    onSuccess: () => {
      toast('Order cancelled', 'success');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  if (query.isLoading) return <LoadingState label="Loading order…" />;
  if (query.isError || !query.data) {
    return <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />;
  }

  const order = query.data;
  const canCancel = CANCELLABLE.has(order.status);

  const confirmCancel = () => {
    Alert.alert('Cancel order', 'Are you sure you want to cancel this order?', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: () => cancel.mutate() },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: order.orderNumber }} />

      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {/* Status */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <StatusPill status={order.status} />
          </View>
          <Text style={styles.meta}>Placed {formatDate(order.date ?? order.createdAt)}</Text>
          <Text style={styles.meta}>Payment: {order.paymentMethod}</Text>
        </View>

        {/* Tracking */}
        {order.awbCode ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shipping</Text>
            {order.courierName ? (
              <Text style={styles.meta}>Courier: {order.courierName}</Text>
            ) : null}
            <Text style={styles.meta}>AWB: {order.awbCode}</Text>
            {order.shiprocketStatus ? (
              <Text style={styles.meta}>Status: {order.shiprocketStatus}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.item}>
              <Image source={item.image ?? undefined} style={styles.thumb} contentFit="cover" />
              <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.meta}>
                  {formatPrice(item.price)} × {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatPrice(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Address */}
        {order.shippingAddress ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery address</Text>
            <Text style={styles.meta}>{order.shippingAddress.name}</Text>
            <Text style={styles.meta}>
              {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </Text>
            <Text style={styles.meta}>{order.shippingAddress.phone}</Text>
          </View>
        ) : null}

        {/* Totals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment summary</Text>
          <Row label="Subtotal" value={formatPrice(order.subTotal)} />
          {toNumber(order.shippingCost) > 0 ? (
            <Row label="Shipping" value={formatPrice(order.shippingCost)} />
          ) : null}
          {toNumber(order.codCharge) > 0 ? (
            <Row label="COD fee" value={formatPrice(order.codCharge)} />
          ) : null}
          {toNumber(order.discount) > 0 ? (
            <Row
              label={order.couponCode ? `Discount (${order.couponCode})` : 'Discount'}
              value={`−${formatPrice(order.discount)}`}
            />
          ) : null}
          <View style={styles.divider} />
          <Row label="Total" value={formatPrice(order.total)} strong />
        </View>

        {canCancel ? (
          <Button
            label="Cancel this order"
            variant="outline"
            fullWidth
            loading={cancel.isPending}
            onPress={confirmCancel}
          />
        ) : null}

        <Button
          label="Continue shopping"
          variant="ghost"
          fullWidth
          onPress={() => router.push('/')}
        />
      </ScrollView>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.meta, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.meta, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  headerCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { ...typography.h3, color: colors.text },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  meta: { ...typography.small, color: colors.textMuted },
  strong: { color: colors.text, fontWeight: '700', fontSize: 15 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.backgroundAlt },
  itemBody: { flex: 1, gap: 2 },
  itemName: { ...typography.small, color: colors.text, fontWeight: '600' },
  itemTotal: { ...typography.small, color: colors.text, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
