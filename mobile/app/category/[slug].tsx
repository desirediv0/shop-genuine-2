import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { catalogue } from '../../src/api/services';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { ProductCard } from '../../src/components/ProductCard';
import { EmptyState, ErrorState } from '../../src/components/States';
import { colors, spacing } from '../../src/theme';

const PAGE_SIZE = 12;

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const { verticalId, verticalParam } = useStoreVertical();
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

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
      <Stack.Screen options={{ title: slug?.replace(/-/g, ' ') ?? 'Category' }} />
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
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
  column: { gap: spacing.md },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  footer: { paddingVertical: spacing.lg, alignItems: 'center' },
});
