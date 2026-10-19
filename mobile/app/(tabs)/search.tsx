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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { catalogue } from '../../src/api/services';
import { StoreBand } from '../../src/components/home/StoreBand';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useProductLayout } from '../../src/hooks/useProductLayout';
import { storeTheme } from '../../src/theme/stores';
import { Icon, type IconName } from '../../src/components/Icon';
import { ProductCard } from '../../src/components/ProductCard';
import { EmptyState, ErrorState } from '../../src/components/States';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import type { Category } from '../../src/types';
import { pickDefaultVariant, toNumber } from '../../src/utils/format';

const SORTS: { label: string; sort: string; order: 'asc' | 'desc'; icon: IconName }[] = [
  { label: 'Newest', sort: 'createdAt', order: 'desc', icon: 'star' },
  { label: 'Price: low to high', sort: 'price', order: 'asc', icon: 'up' },
  { label: 'Price: high to low', sort: 'price', order: 'desc', icon: 'down' },
  { label: 'Name', sort: 'name', order: 'asc', icon: 'filter' },
];

const PAGE_SIZE = 12;

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  // The grid used to size cards for a 12dp gap but lay them out with 16dp,
  // so rows ran a few pixels wide; one helper now owns both numbers.
  const { columns, gridCardWidth: cardWidth } = useProductLayout();

  const { verticalId, verticalParam, vertical } = useStoreVertical();
  const theme = storeTheme(vertical?.name);
  const [term, setTerm] = useState(params.q ?? '');
  const [debounced, setDebounced] = useState(params.q ?? '');
  const [category, setCategory] = useState<string | null>(null);
  const [sortIndex, setSortIndex] = useState(0);

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
    queryKey: ['search', debounced, category, sort.sort, sort.order, verticalId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      catalogue.products({
        page: pageParam,
        limit: PAGE_SIZE,
        sort: sort.sort,
        order: sort.order,
        ...(debounced ? { search: debounced } : {}),
        ...(category ? { category } : {}),
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

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Same store panel as Home, with the real search field inside */}
      <View style={styles.bandWrap}>
        <StoreBand>
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
          <Filter label="All" active={category === null} accent={theme.solid} onPress={() => setCategory(null)} />
          {categories.map((c) => (
            <Filter
              key={c.id}
              label={c.name}
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
          renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
          ListEmptyComponent={
            query.isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <EmptyState
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
    </SafeAreaView>
  );
}

function Filter({
  label,
  active,
  accent,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  accent: string;
  icon?: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.filter, active && { backgroundColor: accent, borderColor: accent }]}
    >
      {icon ? <Icon name={icon} size={14} color={active ? colors.textInverse : colors.textMuted} /> : null}
      <Text style={[styles.filterText, active && styles.filterTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  bandWrap: { paddingTop: spacing.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 0 },
  // flexGrow/Shrink 0 stops the row being squeezed by the list below it, which
  // otherwise clips the chip labels top and bottom.
  chipScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  sortRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    maxWidth: 200,
  },
  filterText: { ...typography.small, color: colors.textSecondary },
  filterTextActive: { color: colors.textInverse, fontFamily: fonts.medium },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  column: { gap: spacing.sm },
  count: { ...typography.small, color: colors.textMuted, marginBottom: spacing.lg },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  footer: { paddingVertical: spacing.lg, alignItems: 'center' },
});
