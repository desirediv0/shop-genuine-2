import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { payments } from '../../src/api/services';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/States';
import { StatusPill } from '../../src/components/StatusPill';
import { colors, radius, spacing, typography } from '../../src/theme';
import { formatDate, formatPrice } from '../../src/utils/format';

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
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
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

            <View style={styles.cardFoot}>
              <Text style={styles.payment}>{item.paymentMethod}</Text>
              <Text style={styles.total}>{formatPrice(item.total)}</Text>
            </View>
          </Pressable>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background, flexGrow: 1 },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.9 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { ...typography.small, color: colors.text, fontWeight: '700' },
  meta: { ...typography.small, color: colors.textMuted },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  payment: { ...typography.tiny, color: colors.textMuted, textTransform: 'uppercase' },
  total: { ...typography.h3, color: colors.text },
});
