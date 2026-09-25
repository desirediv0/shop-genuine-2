import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { catalogue } from '../../src/api/services';
import { StoreVerticalSwitcher } from '../../src/components/StoreVerticalSwitcher';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { ProductCard } from '../../src/components/ProductCard';
import { EmptyState, ErrorState } from '../../src/components/States';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { Category } from '../../src/types';

const SORTS = [
  { label: 'Newest', sort: 'createdAt', order: 'desc' as const },
  { label: 'Price: low to high', sort: 'price', order: 'asc' as const },
  { label: 'Price: high to low', sort: 'price', order: 'desc' as const },
  { label: 'Name', sort: 'name', order: 'asc' as const },
];

const PAGE_SIZE = 12;

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

  const { verticalId, verticalParam } = useStoreVertical();
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

  const products = useMemo(
    () => query.data?.pages.flatMap((p) => p.products) ?? [],
    [query.data],
  );

  const total = query.data?.pages[0]?.pagination.total ?? 0;
  const categories: Category[] = categoriesQ.data?.categories ?? [];

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.switcherWrap}>
        <StoreVerticalSwitcher />
      </View>

      {/* Search field */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder="Search products, brands…"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Search products"
        />
        {term.length > 0 ? (
          <Pressable onPress={() => setTerm('')} hitSlop={10} accessibilityRole="button">
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Category filter */}
      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.filterRow}
        >
          <Filter label="All" active={category === null} onPress={() => setCategory(null)} />
          {categories.map((c) => (
            <Filter
              key={c.id}
              label={c.name}
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
            active={sortIndex === i}
            onPress={() => setSortIndex(i)}
          />
        ))}
      </ScrollView>

      {query.isError ? (
        <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
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
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.filter, active && styles.filterActive]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  switcherWrap: { paddingTop: spacing.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
  clear: { ...typography.small, color: colors.textMuted, paddingHorizontal: spacing.xs },
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    maxWidth: 190,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.small, color: colors.text },
  filterTextActive: { color: colors.textInverse, fontWeight: '600' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  column: { gap: spacing.md },
  count: { ...typography.small, color: colors.textMuted, marginBottom: spacing.md },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  footer: { paddingVertical: spacing.lg, alignItems: 'center' },
});
