import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogue } from '../../src/api/services';
import { HomeAccountButton } from '../../src/components/HomeAccountButton';
import { BannerCarousel } from '../../src/components/home/BannerCarousel';
import { CategoryGrid } from '../../src/components/home/CategoryGrid';
import { SectionHeader } from '../../src/components/home/SectionHeader';
import { StoreHero } from '../../src/components/home/StoreHero';
import { PromiseRow } from '../../src/components/product/PromiseRow';
import { Logo } from '../../src/components/Logo';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useProductLayout } from '../../src/hooks/useProductLayout';
import { storeTheme } from '../../src/theme/stores';
import { ProductCard } from '../../src/components/ProductCard';
import { ErrorState, Skeleton } from '../../src/components/States';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import type { Banner, Category, ProductSection, ProductSummary } from '../../src/types';

/** Banner links are stored as website paths, so translate them to app routes. */
function bannerRouteFor(link?: string | null): string | null {
  if (!link) return null;
  const path = link.replace(/^https?:\/\/[^/]+/, '');
  if (path.startsWith('/category/') || path.startsWith('/product/')) return path;
  // /products, /products?x=y and anything unrecognised land on search.
  if (path.startsWith('/products')) return '/search';
  return null;
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { verticalId, verticalParam, vertical, select } = useStoreVertical();
  const theme = storeTheme(vertical?.name);
  const [refreshing, setRefreshing] = useState(false);

  // A little over three cards per row, so the next one peeks in.
  const { railCardWidth: cardWidth } = useProductLayout();

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

  // Home rows come from the admin's Product Sections, so merchandising is
  // controlled there rather than hardcoded here.
  const sectionsQ = useQuery({
    queryKey: ['productSections'],
    queryFn: () => catalogue.productSections(),
  });

  const sections = useMemo(
    () => [...(sectionsQ.data?.sections ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [sectionsQ.data],
  );

  const sectionQueries = useQueries({
    queries: sections.map((section: ProductSection) => ({
      queryKey: ['section', section.slug, verticalId],
      queryFn: () =>
        catalogue.productsByType(section.slug, {
          limit: section.maxProducts || 12,
          ...verticalParam,
        }),
    })),
  });

  const sectionRows = sections
    .map((section: ProductSection, i: number) => ({
      section,
      products: sectionQueries[i]?.data?.products ?? [],
      loading: sectionQueries[i]?.isLoading ?? false,
    }))
    .filter((row: { products: ProductSummary[]; loading: boolean }) => row.loading || row.products.length > 0);

  // If the admin has not populated any section yet, the store would look empty
  // even with products in the catalogue — fall back to newest first.
  const anySectionHasProducts = sectionRows.some(
    (r: { products: ProductSummary[] }) => r.products.length > 0,
  );
  const sectionsSettled = sectionQueries.every((q) => !q.isLoading);

  const newestQ = useQuery({
    queryKey: ['products', 'newest', verticalId],
    queryFn: () =>
      catalogue.products({ limit: 12, sort: 'createdAt', order: 'desc', ...verticalParam }),
    enabled: sectionsSettled && !anySectionHasProducts,
  });

  const openBannerLink = useCallback(
    (link?: string | null) => {
      const route = bannerRouteFor(link);
      if (route) router.push(route as never);
    },
    [router],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  const banners: Banner[] = bannersQ.data?.banners ?? [];

  // A banner row can exist with no artwork uploaded yet; rendering it would
  // leave a large blank block on the home screen.
  const bannersWithArt = banners
    .map((banner) => ({ banner, art: banner.mobileImage ?? banner.desktopImage }))
    .filter((b): b is { banner: Banner; art: string } => !!b.art);
  // `/public/categories` returns every category, including ones with nothing in
  // them, so tapping those led to an empty list. Show only categories a shopper
  // can actually buy from. The count is vertical-scoped when a sub-brand is
  // selected, so this also hides categories empty *for that store*.
  const categories: Category[] = (categoriesQ.data?.categories ?? []).filter(
    (c) => (c._count?.products ?? c.productCount ?? 1) > 0,
  );

  // A selected sub-brand with nothing in it should say so once, rather than
  // repeating "Nothing here yet" under every rail and looking broken.
  const storeIsEmpty =
    !!verticalId &&
    sectionsSettled &&
    !newestQ.isLoading &&
    !anySectionHasProducts &&
    (newestQ.data?.products.length ?? 0) === 0 &&
    categories.length === 0;

  if (sectionsQ.isError && newestQ.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState
          message={(sectionsQ.error as Error)?.message}
          // Retry everything, as pull-to-refresh does. Retrying only the
          // product rows brought them back after a dropped connection but left
          // the banner, store picker and categories missing until the shopper
          // happened to pull down.
          onRetry={() => queryClient.invalidateQueries()}
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
        {/* Header — logo on the light page, where both its colours read */}
        <View style={styles.header}>
          <Logo height={60} />
          <HomeAccountButton />
        </View>

        {/* Which store, search, and every other store one tap away */}
        <StoreHero />

        {bannersWithArt.length > 0 ? (
          <View style={styles.block}>
            <BannerCarousel items={bannersWithArt} onPress={(b) => openBannerLink(b.link)} />
          </View>
        ) : null}

        {categories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Shop by category" onSeeAll={() => router.navigate('/search')} />
            <CategoryGrid categories={categories} onSeeAll={() => router.navigate('/search')} />
          </View>
        ) : null}

        {storeIsEmpty ? (
          <View style={[styles.emptyStore, { backgroundColor: theme.soft }]}>
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
              style={[styles.emptyStoreBtn, { backgroundColor: theme.solid }]}
            >
              <Text style={styles.emptyStoreBtnText}>Browse all Genuine stores</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {sectionRows.map(({ section, products, loading }) => (
              <ProductRail
                key={section.id}
                title={section.name}
                loading={loading}
                products={products}
                cardWidth={cardWidth}
                onSeeAll={() => router.navigate('/search')}
              />
            ))}

            {/* Only rendered when no section has been populated yet. */}
            {sectionsSettled && !anySectionHasProducts ? (
              <ProductRail
                title="New arrivals"
                loading={newestQ.isLoading}
                products={newestQ.data?.products ?? []}
                cardWidth={cardWidth}
                onSeeAll={() => router.push('/search')}
              />
            ) : null}
          </>
        )}

        <View style={styles.promise}>
          <Text style={styles.promiseTitle}>The Genuine promise</Text>
          <PromiseRow style={styles.promiseRow} />
        </View>
      </ScrollView>
    </SafeAreaView>
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
        <SectionHeader title={title} />
        <View style={styles.railSkeleton}>
          <Skeleton width={cardWidth} height={cardWidth + 64} />
          <Skeleton width={cardWidth} height={cardWidth + 64} />
          <Skeleton width={cardWidth} height={cardWidth + 64} />
        </View>
      </View>
    );
  }

  // An empty rail is worth nothing to a shopper and pushes real content off
  // screen, so drop the whole section rather than announcing the gap.
  if (!products.length) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} onSeeAll={onSeeAll} />

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  block: { marginTop: spacing.xl },
  section: { marginTop: spacing.xxl },
  emptyStore: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
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
  },
  emptyStoreBtnText: { ...typography.bodyStrong, color: colors.textInverse },
  railContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xs },
  railSkeleton: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
  promise: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  promiseTitle: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    textAlign: 'center',
  },
  promiseRow: { marginTop: spacing.sm, borderTopWidth: 0, borderBottomWidth: 0 },
});
