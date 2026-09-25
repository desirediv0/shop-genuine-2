import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogue } from '../../src/api/services';
import { StoreVerticalSwitcher } from '../../src/components/StoreVerticalSwitcher';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { ProductCard } from '../../src/components/ProductCard';
import { EmptyState, ErrorState, Skeleton } from '../../src/components/States';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { Banner, Category, ProductSummary } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const { verticalId, verticalParam, vertical, select } = useStoreVertical();
  const [refreshing, setRefreshing] = useState(false);

  // Two columns with a gutter each side and one between.
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

  const bannersQ = useQuery({
    queryKey: ['banners'],
    queryFn: () => catalogue.banners(),
  });

  // Categories are derived from the products in this vertical, so the list
  // changes with the selected sub-brand.
  const categoriesQ = useQuery({
    queryKey: ['categories', verticalId],
    queryFn: () => catalogue.categories(verticalParam),
  });

  const featuredQ = useQuery({
    queryKey: ['products', 'featured', verticalId],
    queryFn: () => catalogue.products({ limit: 6, featured: true, ...verticalParam }),
  });

  const newestQ = useQuery({
    queryKey: ['products', 'newest', verticalId],
    queryFn: () =>
      catalogue.products({ limit: 8, sort: 'createdAt', order: 'desc', ...verticalParam }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const banners: Banner[] = bannersQ.data?.banners ?? [];
  const categories: Category[] = categoriesQ.data?.categories ?? [];

  // A selected sub-brand with nothing in it should say so once, rather than
  // repeating "Nothing here yet" under every rail and looking broken.
  const storeIsEmpty =
    !!verticalId &&
    !featuredQ.isLoading &&
    !newestQ.isLoading &&
    (featuredQ.data?.products.length ?? 0) === 0 &&
    (newestQ.data?.products.length ?? 0) === 0 &&
    categories.length === 0;

  if (featuredQ.isError && newestQ.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState
          message={(featuredQ.error as Error)?.message}
          onRetry={() => {
            featuredQ.refetch();
            newestQ.refetch();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.wordmark}>Shop Genuine</Text>
            <Text style={styles.tagline}>100% authentic. Delivered across India.</Text>
          </View>
        </View>

        {/* Search entry point */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          accessibilityLabel="Search products"
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search for products, brands…</Text>
        </Pressable>

        {/* Sub-brand switcher */}
        <View style={styles.switcherWrap}>
          <StoreVerticalSwitcher />
        </View>

        {/* Banners */}
        {banners.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.bannerScroll}
          >
            {banners.map((b) => (
              <Image
                key={b.id}
                source={b.image}
                style={[styles.banner, { width: width - spacing.lg * 2 }]}
                contentFit="cover"
                transition={200}
              />
            ))}
          </ScrollView>
        ) : null}

        {/* Categories */}
        {categories.length > 0 ? (
          <Section title="Shop by category">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.categoryItem}
                  onPress={() => router.push(`/category/${c.slug}`)}
                  accessibilityRole="button"
                  accessibilityLabel={c.name}
                >
                  <View style={styles.categoryThumb}>
                    <Image
                      source={c.image ?? undefined}
                      style={styles.categoryImage}
                      contentFit="cover"
                    />
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={2}>
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Section>
        ) : null}

        {storeIsEmpty ? (
          <View style={styles.emptyStore}>
            <Text style={styles.emptyStoreTitle}>
              {vertical?.name} isn&apos;t stocked yet
            </Text>
            <Text style={styles.emptyStoreText}>
              There are no products in this store right now. Switch to another
              Genuine store to carry on shopping.
            </Text>
            <Pressable
              onPress={() => select(null)}
              accessibilityRole="button"
              style={styles.emptyStoreBtn}
            >
              <Text style={styles.emptyStoreBtnText}>Browse all Genuine stores</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Featured */}
            <ProductRail
              title="Featured"
              loading={featuredQ.isLoading}
              products={featuredQ.data?.products ?? []}
              cardWidth={cardWidth}
            />

            {/* New arrivals */}
            <ProductRail
              title="New arrivals"
              loading={newestQ.isLoading}
              products={newestQ.data?.products ?? []}
              cardWidth={cardWidth}
              onSeeAll={() => router.push('/search')}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, styles.sectionTitleStandalone]}>{title}</Text>
      {children}
    </View>
  );
}

function ProductRail({
  title,
  products,
  loading,
  cardWidth,
  onSeeAll,
}: {
  title: string;
  products: ProductSummary[];
  loading: boolean;
  cardWidth: number;
  onSeeAll?: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.sectionTitleStandalone]}>{title}</Text>
        <View style={styles.railSkeleton}>
          <Skeleton width={cardWidth} height={cardWidth + 80} />
          <Skeleton width={cardWidth} height={cardWidth + 80} />
        </View>
      </View>
    );
  }

  if (!products.length) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.sectionTitleStandalone]}>{title}</Text>
        <EmptyState title="Nothing here yet" message="Check back soon." />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button">
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={products}
        keyExtractor={(p) => p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  wordmark: { ...typography.h1, color: colors.text },
  tagline: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 15 },
  searchPlaceholder: { ...typography.small, color: colors.textMuted },
  switcherWrap: { paddingTop: spacing.lg },
  emptyStore: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyStoreTitle: { ...typography.h3, color: colors.text, textAlign: 'center' },
  emptyStoreText: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStoreBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  emptyStoreBtnText: { ...typography.bodyStrong, color: colors.textInverse },
  bannerScroll: { marginTop: spacing.sm },
  banner: {
    height: 160,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundAlt,
  },
  section: { marginTop: spacing.xl },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  sectionTitleStandalone: { paddingHorizontal: spacing.lg },
  seeAll: { ...typography.small, color: colors.primary, fontWeight: '600', marginBottom: spacing.md },
  categoryRow: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  categoryItem: { width: 76, alignItems: 'center', gap: spacing.sm },
  categoryThumb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryImage: { width: '100%', height: '100%' },
  categoryLabel: { ...typography.tiny, color: colors.text, textAlign: 'center' },
  railContent: { paddingHorizontal: spacing.lg, gap: spacing.md },
  railSkeleton: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg },
});
