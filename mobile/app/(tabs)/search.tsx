import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { catalogue } from '../../src/api/services';
import { bandText, StoreBand } from '../../src/components/home/StoreBand';
import { PressableScale } from '../../src/components/motion/PressableScale';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useCategoryArt } from '../../src/hooks/useCategoryArt';
import { useProductLayout } from '../../src/hooks/useProductLayout';
import { useScreenStatusBar } from '../../src/hooks/useScreenStatusBar';
import { storeTheme } from '../../src/theme/stores';
import { Icon, type IconName } from '../../src/components/Icon';
import { ProductCard } from '../../src/components/ProductCard';
import { Appear } from '../../src/components/motion/Appear';
import { EmptyState, ErrorState } from '../../src/components/States';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import type { Category } from '../../src/types';
import { formatPrice, pickDefaultVariant, toNumber } from '../../src/utils/format';

const SORTS: { label: string; sort: string; order: 'asc' | 'desc'; icon: IconName }[] = [
  { label: 'Newest', sort: 'createdAt', order: 'desc', icon: 'star' },
  { label: 'Price: low to high', sort: 'price', order: 'asc', icon: 'up' },
  { label: 'Price: high to low', sort: 'price', order: 'desc', icon: 'down' },
  { label: 'Name', sort: 'name', order: 'asc', icon: 'filter' },
];

const PAGE_SIZE = 12;

export default function SearchScreen() {
  // `under` comes from Home's "Shop by price" tiles; `t` changes on every tap
  // so the same tile re-applies its filter after the shopper cleared it.
  const params = useLocalSearchParams<{ q?: string; under?: string; t?: string }>();
  // The grid used to size cards for a 12dp gap but lay them out with 16dp,
  // so rows ran a few pixels wide; one helper now owns both numbers.
  const { columns, gridCardWidth: cardWidth } = useProductLayout();

  const { verticalId, verticalParam, vertical } = useStoreVertical();
  const theme = storeTheme(vertical?.name);
  const [term, setTerm] = useState(params.q ?? '');
  const [debounced, setDebounced] = useState(params.q ?? '');
  const [category, setCategory] = useState<string | null>(null);
  const [sortIndex, setSortIndex] = useState(0);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // The coloured header runs under the status bar.
  useScreenStatusBar('light');

  useEffect(() => {
    const n = Number(params.under);
    if (params.under && n > 0) setMaxPrice(n);
  }, [params.under, params.t]);

  // Debounce so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 350);
    return () => clearTimeout(t);
  }, [term]);

  // A category from the previous sub-brand may not exist in the new one, which
  // would silently return zero results. Clear it on switch.
  useEffect(() => {
    setCategory(null);
  }, [verticalId]);

  const categoriesQ = useQuery({
    queryKey: ['categories', verticalId],
    queryFn: () => catalogue.categories(verticalParam),
  });

  const sort = SORTS[sortIndex];

  const query = useInfiniteQuery({
    queryKey: ['search', debounced, category, sort.sort, sort.order, maxPrice, verticalId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      catalogue.products({
        page: pageParam,
        limit: PAGE_SIZE,
        sort: sort.sort,
        order: sort.order,
        ...(debounced ? { search: debounced } : {}),
        ...(category ? { category } : {}),
        ...(maxPrice ? { maxPrice } : {}),
        ...verticalParam,
      }),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined,
  });

  const products = useMemo(() => {
    const all = query.data?.pages.flatMap((p) => p.products) ?? [];
    if (sort.sort !== 'price') return all;
    // The server used to ignore a price sort and return date order. That is
    // fixed server-side, but until the fix is deployed this keeps whatever has
    // loaded in the order the shopper asked for, by the price each card shows.
    // Against a fixed server it changes nothing.
    const priceOf = (item: (typeof all)[number]) => {
      const v = pickDefaultVariant(item.variants);
      return v ? toNumber(v.salePrice ?? v.price) : null;
    };
    const dir = sort.order === 'desc' ? -1 : 1;
    return [...all].sort((a, b) => {
      const pa = priceOf(a);
      const pb = priceOf(b);
      // Nothing to price goes last in either direction.
      if (pa === null || pb === null) return pa === null ? (pb === null ? 0 : 1) : -1;
      return (pa - pb) * dir;
    });
  }, [query.data, sort.sort, sort.order]);

  const total = query.data?.pages[0]?.pagination.total ?? 0;
  // Same reasoning as Home: a filter chip that always yields zero results is a
  // dead end, so drop categories with nothing in them.
  const categories: Category[] = (categoriesQ.data?.categories ?? []).filter(
    (c) => (c._count?.products ?? c.productCount ?? 1) > 0,
  );
  // A small product photo on each category chip — shared with Home's tiles.
  const art = useCategoryArt(categories);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return (
    <View style={styles.safe}>
      {/* The store's colour panel, as on Home, with the real search field inside */}
      <View>
        <StoreBand>
          <Text style={bandText.title}>Search</Text>
          <View style={styles.searchWrap}>
            <Icon name="search" size={19} color={theme.solid} />
            <TextInput
              value={term}
              onChangeText={setTerm}
              placeholder={`Search in ${vertical ? theme.short : 'all stores'}…`}
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
              autoCorrect={false}
              clearButtonMode="while-editing"
              accessibilityLabel="Search products"
            />
            {term.length > 0 ? (
              <Pressable onPress={() => setTerm('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
                <Icon name="close" size={17} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </StoreBand>
      </View>

      {/* Category filter */}
      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.filterRow}
        >
          <Filter label="All" icon="grid" active={category === null} accent={theme.solid} onPress={() => setCategory(null)} />
          {categories.map((c, i) => (
            <Filter
              key={c.id}
              label={c.name}
              image={art[i]}
              accent={theme.solid}
              active={category === c.slug}
              onPress={() => setCategory(category === c.slug ? null : c.slug)}
            />
          ))}
        </ScrollView>
      ) : null}

      {/* Sort */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.sortRow}
      >
        {maxPrice ? (
          <Filter
            label={`Under ${formatPrice(maxPrice)}`}
            icon="close"
            accent={theme.solid}
            active
            onPress={() => setMaxPrice(null)}
          />
        ) : null}
        {SORTS.map((s, i) => (
          <Filter
            key={s.label}
            label={s.label}
            icon={s.icon}
            accent={theme.solid}
            active={sortIndex === i}
            onPress={() => setSortIndex(i)}
          />
        ))}
      </ScrollView>

      {query.isError ? (
        <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />
      ) : (
        <FlatList
          // numColumns cannot change on a mounted list; remount if it does.
          key={columns}
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={columns}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            query.isLoading ? null : (
              <Text style={styles.count}>
                {total} {total === 1 ? 'product' : 'products'}
              </Text>
            )
          }
          renderItem={({ item, index }) => (
            // Ripples in on load, and again when a filter swaps the results.
            <Appear index={index}>
              <ProductCard product={item} width={cardWidth} />
            </Appear>
          )}
          ListEmptyComponent={
            query.isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <EmptyState
                icon="search"
                title="No products found"
                message={
                  debounced
                    ? `Nothing matched “${debounced}”. Try a different search.`
                    : 'Try a different filter.'
                }
              />
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
      )}
    </View>
  );
}

function Filter({
  label,
  active,
  accent,
  icon,
  image,
  onPress,
}: {
  label: string;
  active: boolean;
  accent: string;
  icon?: IconName;
  /** A product photo for the chip, in a small round frame. */
  image?: string | null;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.filter,
        image ? styles.filterWithImage : null,
        active && { backgroundColor: accent },
        active && shadow.glow(accent, 0.3),
      ]}
    >
      {image ? (
        <View style={styles.thumb}>
          <Image source={image} style={styles.thumbImage} contentFit="contain" />
        </View>
      ) : icon ? (
        <Icon name={icon} size={15} color={active ? colors.textInverse : colors.textMuted} />
      ) : null}
      <Text style={[styles.filterText, active && styles.filterTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 52,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    boxShadow: '0px 10px 24px rgba(2, 6, 23, 0.20)',
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 0 },
  // flexGrow/Shrink 0 stops the row being squeezed by the list below it, which
  // otherwise clips the chip labels top and bottom.
  chipScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingTop: spacing.lg,
    // Room for the chips' shadows, which a horizontal ScrollView clips.
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  sortRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    // Half the height rather than 999: a soft shadow on a 999 radius draws square.
    borderRadius: 20,
    backgroundColor: colors.surface,
    maxWidth: 220,
    ...shadow.card,
  },
  filterWithImage: { paddingLeft: 5 },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    padding: 3,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%', filter: 'brightness(0.96)' },
  filterText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: colors.textInverse, fontFamily: fonts.semibold },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  column: { gap: spacing.sm },
  count: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  footer: { paddingVertical: spacing.lg, alignItems: 'center' },
});
