import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { payments } from '../../src/api/services';
import { Icon } from '../../src/components/Icon';
import { Appear } from '../../src/components/motion/Appear';
import { PressableScale } from '../../src/components/motion/PressableScale';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/States';
import { StatusPill } from '../../src/components/StatusPill';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import {
  formatDate,
  formatPrice,
  orderItemImage,
  orderItemName,
  orderPaymentLabel,
} from '../../src/utils/format';
import type { OrderItem } from '../../src/types';

const MAX_THUMBS = 4;

export default function OrdersScreen() {
  const router = useRouter();

  const query = useQuery({
    queryKey: ['orders'],
    queryFn: () => payments.orders(),
  });

  if (query.isLoading) return <LoadingState label="Loading orders…" />;
  if (query.isError) {
    return <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />;
  }

  const orders = query.data?.orders ?? [];

  if (!orders.length) {
    return (
      <>
        <Stack.Screen options={{ title: 'My orders' }} />
        <EmptyState
          icon="orders"
          title="No orders yet"
          message="When you place an order it will show up here."
          actionLabel="Start shopping"
          onAction={() => router.push('/')}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'My orders' }} />
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        refreshing={query.isRefetching}
        onRefresh={() => query.refetch()}
        renderItem={({ item, index }) => (
          <Appear index={index} limit={8}>
            <PressableScale
              scaleTo={0.98}
              style={styles.card}
              onPress={() => router.push(`/orders/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Order ${item.orderNumber}, ${item.status}`}
            >
              <View style={styles.cardHead}>
                <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                <StatusPill status={item.status} />
              </View>

              <Text style={styles.meta}>
                {formatDate(item.date ?? item.createdAt)} · {item.items?.length ?? 0} item
                {(item.items?.length ?? 0) === 1 ? '' : 's'}
              </Text>

              <Thumbs items={item.items ?? []} />

              <View style={styles.cardFoot}>
                <Text style={styles.payment}>{orderPaymentLabel(item)}</Text>
                <View style={styles.totalRow}>
                  <Text style={styles.total}>{formatPrice(item.total)}</Text>
                  <Icon name="forward" size={16} color={colors.textMuted} />
                </View>
              </View>
            </PressableScale>
          </Appear>
        )}
      />
    </>
  );
}

/** What was in the order, at a glance — a number alone gave no hint. */
function Thumbs({ items }: { items: OrderItem[] }) {
  if (!items.length) return null;
  const shown = items.slice(0, MAX_THUMBS);
  const extra = items.length - shown.length;
  return (
    <View style={styles.thumbs}>
      {shown.map((it, i) => {
        const src = orderItemImage(it);
        return (
          <View key={it.id ?? i} style={styles.thumb}>
            {src ? (
              <Image
                source={src}
                style={styles.thumbImage}
                contentFit="contain"
                accessibilityLabel={orderItemName(it)}
              />
            ) : (
              <Icon name="basket" size={18} color={colors.textMuted} />
            )}
          </View>
        );
      })}
      {extra > 0 ? (
        <View style={[styles.thumb, styles.thumbMore]}>
          <Text style={styles.thumbMoreText}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background, flexGrow: 1 },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    ...shadow.card,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { ...typography.smallStrong, color: colors.text },
  meta: { ...typography.small, color: colors.textMuted },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  thumbs: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    // Product shots are on white, so a white tile with a hairline keeps them
    // from sitting as white squares on a grey one.
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '86%', height: '86%' },
  thumbMore: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  thumbMoreText: { fontFamily: fonts.bold, fontSize: 13, color: colors.primary },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  payment: { ...typography.overline, color: colors.textMuted },
  total: { ...typography.price, color: colors.text },
});
