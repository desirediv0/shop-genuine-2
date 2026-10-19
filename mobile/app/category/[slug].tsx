import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { colors, fonts, radius, spacing, typography } from '../../src/theme';
import { categoryVisual, storeTheme } from '../../src/theme/stores';

const PAGE_SIZE = 12;
/** Roughly where the header card's bottom edge sits, in list scroll offset. */
const HEADER_CARD_HEIGHT = 72;

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { verticalId, verticalParam, vertical } = useStoreVertical();
  const theme = storeTheme(vertical?.name);
  const { columns, gridCardWidth: cardWidth } = useProductLayout();
  const { cart } = useCart();
  // The header card already names the category, so the bar title only appears
  // once the card has scrolled away — otherwise the name shows twice.
  const [cardHidden, setCardHidden] = useState(false);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const hidden = e.nativeEvent.contentOffset.y > HEADER_CARD_HEIGHT;
    setCardHidden((prev) => (prev === hidden ? prev : hidden));
  }, []);

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

  const category = query.data?.pages[0]?.category;
  const total = query.data?.pages[0]?.pagination.total;

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
      <Stack.Screen
        options={{
          title: query.isLoading || cardHidden ? title : '',
          headerRight: () => <HeaderActions />,
        }}
      />
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
        onScroll={onScroll}
        scrollEventThrottle={64}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
        ListHeaderComponent={
          query.isLoading ? null : (
            <CategoryHeader
              name={title}
              image={category?.image}
              total={total ?? products.length}
              store={vertical?.name}
              accent={theme.solid}
              soft={theme.soft}
            />
          )
        }
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

/**
 * Names the aisle the shopper is in, and how much is in it, in the store's
 * colour — the bare grid gave no sense of place under a plain header.
 */
function CategoryHeader({
  name,
  image,
  total,
  store,
  accent,
  soft,
}: {
  name: string;
  image?: string | null;
  total: number;
  store?: string;
  accent: string;
  soft: string;
}) {
  const visual = categoryVisual(name, 0);
  const count = `${total} ${total === 1 ? 'product' : 'products'}`;
  return (
    <View style={[styles.header, { backgroundColor: soft }]}>
      <View style={styles.headerTile}>
        {image ? (
          <Image source={image} style={styles.headerImage} contentFit="contain" />
        ) : (
          <MaterialCommunityIcons name={visual.icon} size={30} color={accent} />
        )}
      </View>
      <View style={styles.headerText}>
        <Text style={styles.headerName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[styles.headerMeta, { color: accent }]} numberOfLines={1}>
          {count} · {store ?? 'All Genuine stores'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
  },
  headerTile: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerImage: { width: '80%', height: '80%' },
  headerText: { flex: 1, gap: 2 },
  headerName: { ...typography.h3, color: colors.text },
  headerMeta: { fontFamily: fonts.semibold, fontSize: 12.5 },
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
