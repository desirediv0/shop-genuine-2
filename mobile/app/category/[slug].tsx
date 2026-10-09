import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { catalogue } from '../../src/api/services';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { FloatingCartBar, FLOATING_CART_BAR_SPACE } from '../../src/components/FloatingCartBar';
import { HeaderActions } from '../../src/components/HeaderActions';
import { ProductCard } from '../../src/components/ProductCard';
import { useCart } from '../../src/context/CartContext';
import { useProductLayout } from '../../src/hooks/useProductLayout';
import { EmptyState, ErrorState } from '../../src/components/States';
import { colors, spacing } from '../../src/theme';

const PAGE_SIZE = 12;

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { verticalId, verticalParam } = useStoreVertical();
  const { columns, gridCardWidth: cardWidth } = useProductLayout();
  const { cart } = useCart();

  const query = useInfiniteQuery({
    queryKey: ['category', slug, verticalId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      catalogue.productsByCategory(slug, {
        page: pageParam,
        limit: PAGE_SIZE,
        ...verticalParam,
      }),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined,
    enabled: !!slug,
  });

  const products = useMemo(
    () => query.data?.pages.flatMap((p) => p.products) ?? [],
    [query.data],
  );

  /**
   * The endpoint returns the category itself, so use its real name. Falling
   * back to the slug renders "biscuits  cookies" — lower case, and a double
   * space where the "&" was stripped — so it is only a placeholder while the
   * first page is in flight.
   */
  const title = useMemo(() => {
    const name = query.data?.pages[0]?.category?.name;
    if (name) return name;
    return slug ? slug.replace(/-+/g, ' ').trim() : 'Category';
  }, [query.data, slug]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  }, [query]);

  if (query.isError) {
    return (
      <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />
    );
  }

  return (
    <>
      <Stack.Screen options={{ title, headerRight: () => <HeaderActions /> }} />
      <FlatList
        // numColumns cannot change on a mounted list; remount if it does.
        key={columns}
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={columns}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[
          styles.list,
          // Keep the last row clear of the floating cart bar.
          cart.totalQuantity > 0 && { paddingBottom: FLOATING_CART_BAR_SPACE + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <EmptyState title="No products here yet" message="Try another category." />
          )
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
      />
      <FloatingCartBar />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  column: { gap: spacing.sm },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  footer: { paddingVertical: spacing.lg, alignItems: 'center' },
});
