import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogue } from '../../src/api/services';
import { BannerCarousel } from '../../src/components/home/BannerCarousel';
import { CategoryGrid } from '../../src/components/home/CategoryGrid';
import { HomeHeader, SHEET_OVERLAP } from '../../src/components/home/HomeHeader';
import { HomeStickyBar, STICKY_BAR_HEIGHT } from '../../src/components/home/HomeStickyBar';
import { SectionHeader } from '../../src/components/home/SectionHeader';
import { ShopByPrice } from '../../src/components/home/ShopByPrice';
import { ShopByStore } from '../../src/components/home/ShopByStore';
import { Appear } from '../../src/components/motion/Appear';
import { TopDeals } from '../../src/components/home/TopDeals';
import { PromiseCard } from '../../src/components/PromiseCard';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useProductLayout } from '../../src/hooks/useProductLayout';
import { useScreenStatusBar } from '../../src/hooks/useScreenStatusBar';
import { storeTheme, type StoreTheme } from '../../src/theme/stores';
import { ProductCard } from '../../src/components/ProductCard';
import { ErrorState, Skeleton } from '../../src/components/States';
import { alpha, colors, fonts, radius, spacing, typography } from '../../src/theme';
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
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const insets = useSafeAreaInsets();

  // A little over three cards per row, so the next one peeks in.
  const { railCardWidth: cardWidth, gridCardWidth } = useProductLayout();

  // The sticky search bar takes over once the coloured header has scrolled
  // up behind it; until then the header is the top of the screen.
  const scrollY = useSharedValue(0);
  const headerHeight = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const stickyProgress = useDerivedValue(() => {
    const end = headerHeight.value - SHEET_OVERLAP - insets.top - STICKY_BAR_HEIGHT;
    if (end <= 0) return 0;
    return interpolate(scrollY.value, [end - 40, end], [0, 1], Extrapolation.CLAMP);
  });
  const [compact, setCompact] = useState(false);
  useAnimatedReaction(
    () => stickyProgress.value > 0.5,
    (now, before) => {
      if (now !== before) runOnJS(setCompact)(now);
    },
  );

  // White status bar icons over the header, dark ones over the white bar.
  useScreenStatusBar(compact ? 'dark' : 'light');

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

  const renderRail = (
    { section, products, loading }: { section: ProductSection; products: ProductSummary[]; loading: boolean },
    i: number,
  ) => (
    <ProductRail
      key={section.id}
      title={section.name}
      loading={loading}
      products={products}
      cardWidth={cardWidth}
      gridCardWidth={gridCardWidth}
      onSeeAll={() => router.navigate('/search')}
      // The first row sits on a band of the store colour, and the third is a
      // grid, so the page is not one row after another of the same shape.
      spotlight={i === 0 ? theme : undefined}
      grid={i === 2}
    />
  );

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
    <View style={styles.screen}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textInverse}
            progressViewOffset={insets.top}
          />
        }
      >
        <HomeHeader
          onLayout={(e) => {
            headerHeight.value = e.nativeEvent.layout.height;
          }}
        />

        {/* The rest of the page is a sheet laid over the bottom of the header. */}
        <View style={styles.sheet}>
          {bannersWithArt.length > 0 ? (
            <Appear index={0}>
              <BannerCarousel items={bannersWithArt} onPress={(b) => openBannerLink(b.link)} />
            </Appear>
          ) : null}

          {categories.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader title="Shop by category" onSeeAll={() => router.navigate('/search')} />
              <CategoryGrid categories={categories} onSeeAll={() => router.navigate('/search')} />
            </View>
          ) : null}

          {/* On "All", a big card per stocked store; picking one recolours the
              page from the top, so scroll back up to show the change. */}
          {!verticalId ? (
            <ShopByStore
              onPick={(id) => {
                select(id);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
            />
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
              {sectionRows.slice(0, 1).map(renderRail)}

              {/* Computed rows between the admin's sections, which often hold the
                  same few products: real discounts, and price brackets. */}
              <TopDeals />
              <ShopByPrice />

              {sectionRows.slice(1).map((row, i) => renderRail(row, i + 1))}

              {/* Only rendered when no section has been populated yet. */}
              {sectionsSettled && !anySectionHasProducts ? (
                <ProductRail
                  title="New arrivals"
                  loading={newestQ.isLoading}
                  products={newestQ.data?.products ?? []}
                  cardWidth={cardWidth}
                  gridCardWidth={gridCardWidth}
                  onSeeAll={() => router.push('/search')}
                />
              ) : null}
            </>
          )}

          <PromiseCard style={styles.promise} />

          {/* A deliberate ending instead of the page simply running out. */}
          <View style={styles.signoff}>
            <Text style={styles.signoffWord}>Genuine.</Text>
            <Text style={styles.signoffLine}>Authentic products, delivered across India.</Text>
          </View>
        </View>
      </Animated.ScrollView>

      <HomeStickyBar progress={stickyProgress} interactive={compact} />
    </View>
  );
}

function ProductRail({
  title,
  products,
  loading,
  cardWidth,
  gridCardWidth,
  onSeeAll,
  spotlight,
  grid = false,
}: {
  title: string;
  products: ProductSummary[];
  loading: boolean;
  cardWidth: number;
  gridCardWidth: number;
  onSeeAll?: () => void;
  /** Draw the row on a soft band of this store's colour. */
  spotlight?: StoreTheme;
  /** Lay the products out as a grid of up to six instead of a row. */
  grid?: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.section}>
        <SectionHeader title={title} />
        <View style={styles.railSkeleton}>
          <Skeleton width={cardWidth} height={cardWidth + 72} />
          <Skeleton width={cardWidth} height={cardWidth + 72} />
          <Skeleton width={cardWidth} height={cardWidth + 72} />
        </View>
      </View>
    );
  }

  // An empty rail is worth nothing to a shopper and pushes real content off
  // screen, so drop the whole section rather than announcing the gap.
  if (!products.length) return null;

  return (
    <View
      style={[
        styles.section,
        spotlight && styles.spotlight,
        spotlight && { experimental_backgroundImage: spotlightBand(spotlight) },
      ]}
    >
      <SectionHeader title={title} onSeeAll={onSeeAll} />

      {grid ? (
        <View style={styles.grid}>
          {products.slice(0, 6).map((p, index) => (
            <Appear key={p.id} index={index}>
              <ProductCard product={p} width={gridCardWidth} />
            </Appear>
          ))}
        </View>
      ) : (
        <FlatList
          horizontal
          data={products}
          keyExtractor={(p) => p.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.railContent}
          renderItem={({ item, index }) => (
            <Appear index={index} from="right" limit={6}>
              <ProductCard product={item} width={cardWidth} />
            </Appear>
          )}
        />
      )}
    </View>
  );
}

/** A pale wash of the store colour that glows in from the top corner. */
function spotlightBand(t: StoreTheme): string {
  return [
    `radial-gradient(circle at 100% 0%, ${alpha(t.solid, 0.2)} 0%, ${alpha(t.solid, 0)} 55%)`,
    `radial-gradient(circle at 0% 30%, ${alpha(t.glows[0], 0.22)} 0%, ${alpha(t.glows[0], 0)} 45%)`,
    `linear-gradient(180deg, ${t.soft} 0%, ${colors.background} 100%)`,
  ].join(', ');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxl },
  sheet: {
    marginTop: -SHEET_OVERLAP,
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background,
  },
  section: { marginTop: spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg },
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
  promise: { marginTop: spacing.xxl, marginHorizontal: spacing.lg },
  signoff: { marginTop: spacing.xxl, paddingHorizontal: spacing.lg },
  signoffWord: { fontFamily: fonts.display, fontSize: 52, lineHeight: 60, letterSpacing: -2, color: colors.text, opacity: 0.12 },
  signoffLine: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  spotlight: { paddingVertical: spacing.lg },
});
