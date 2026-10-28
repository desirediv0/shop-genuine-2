import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { catalogue } from '../src/api/services';
import { bandText, StoreBand } from '../src/components/home/StoreBand';
import { Icon } from '../src/components/Icon';
import { Appear } from '../src/components/motion/Appear';
import { PressableScale } from '../src/components/motion/PressableScale';
import { EmptyState, ErrorState } from '../src/components/States';
import { useStoreVertical } from '../src/context/StoreVerticalContext';
import { useCategoryPhotos } from '../src/hooks/useCategoryArt';
import { useScreenStatusBar } from '../src/hooks/useScreenStatusBar';
import { colors, fonts, radius, shadow, spacing } from '../src/theme';
import { categoryVisual } from '../src/theme/stores';
import type { Category } from '../src/types';

const GAP = spacing.md;

/**
 * Every category in the current store, each as a card with a collage of its
 * newest products. Home shows seven categories and a "See all" tile; this is
 * where that leads. The store chips in the header switch which store's
 * categories are listed, as they do on Search.
 */
export default function CategoriesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { verticalId, verticalParam, vertical } = useStoreVertical();

  // The coloured header runs under the status bar.
  useScreenStatusBar('light');

  const query = useQuery({
    queryKey: ['categories', verticalId],
    queryFn: () => catalogue.categories(verticalParam),
  });
  // As on Home: a category with nothing in it in this store is a dead end.
  const categories: Category[] = (query.data?.categories ?? []).filter(
    (c) => (c._count?.products ?? c.productCount ?? 1) > 0,
  );
  const photos = useCategoryPhotos(categories);

  const cardWidth = Math.floor((width - spacing.lg * 2 - GAP) / 2);
  const storeName = vertical?.name ?? 'All Genuine stores';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <StoreBand>
        <View style={styles.titleRow}>
          <PressableScale
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={8}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.circle}
          >
            <Icon name="back" size={20} color={colors.textInverse} />
          </PressableScale>
          <View style={styles.titles}>
            <Text style={bandText.title} numberOfLines={1}>
              All categories
            </Text>
            <Text style={bandText.tagline} numberOfLines={1}>
              {query.isLoading
                ? storeName
                : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'} · ${storeName}`}
            </Text>
          </View>
          <PressableScale
            // Back to the tabs' Search rather than stacking a second copy of
            // the tab navigator on top of this screen.
            onPress={() => router.dismissTo('/search')}
            hitSlop={8}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel="Search products"
            style={styles.circle}
          >
            <Icon name="search" size={19} color={colors.textInverse} />
          </PressableScale>
        </View>
      </StoreBand>

      {query.isError ? (
        <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Appear index={index} limit={8}>
              <CategoryCard
                category={item}
                photos={photos[index] ?? []}
                index={index}
                width={cardWidth}
                onPress={() => router.push(`/category/${item.slug}`)}
              />
            </Appear>
          )}
          ListEmptyComponent={
            query.isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <EmptyState
                icon="grid"
                title="No categories yet"
                message="This store has nothing to show yet. Try another Genuine store."
              />
            )
          }
        />
      )}
    </View>
  );
}

/**
 * A category on its pastel, with its newest products as a 2×2 collage — the
 * last square says how many more there are. With fewer than four products a
 * single large photo reads better than a half-empty grid.
 */
function CategoryCard({
  category,
  photos,
  index,
  width,
  onPress,
}: {
  category: Category;
  photos: string[];
  index: number;
  width: number;
  onPress: () => void;
}) {
  const visual = categoryVisual(category.name, index);
  const total = category._count?.products ?? category.productCount ?? 0;
  const inner = width - CARD_PADDING * 2;
  const cell = (inner - CELL_GAP) / 2;

  // Three photos and a "+N" square when there are more than four products;
  // all four when there are exactly four; otherwise one big photo.
  const more = total > 4 && photos.length >= 3 ? total - 3 : 0;
  const collage = more > 0 || photos.length >= 4;
  const shown = more > 0 ? photos.slice(0, 3) : photos.slice(0, 4);

  return (
    <PressableScale
      scaleTo={0.97}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, ${total} ${total === 1 ? 'product' : 'products'}`}
      style={[styles.card, { width, backgroundColor: visual.bg }]}
    >
      {collage ? (
        <View style={styles.collage}>
          {shown.map((uri) => (
            <View key={uri} style={[styles.cell, { width: cell, height: cell }]}>
              <Image source={uri} style={styles.photo} contentFit="contain" transition={200} />
            </View>
          ))}
          {more > 0 ? (
            <View style={[styles.cell, styles.moreCell, { width: cell, height: cell }]}>
              <Text style={[styles.moreText, { color: visual.fg }]}>+{more}</Text>
              <Text style={[styles.moreLabel, { color: visual.fg }]}>more</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={[styles.cell, { width: inner, height: inner }]}>
          {photos[0] ? (
            <Image source={photos[0]} style={styles.photo} contentFit="contain" transition={200} />
          ) : (
            <MaterialCommunityIcons name={visual.icon} size={Math.round(inner * 0.36)} color={visual.fg} />
          )}
        </View>
      )}

      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
      <View style={styles.footer}>
        <Text style={[styles.count, { color: visual.fg }]}>
          {total} {total === 1 ? 'item' : 'items'}
        </Text>
        <View style={styles.go}>
          <Icon name="forward" size={13} color={visual.fg} />
        </View>
      </View>
    </PressableScale>
  );
}

const CARD_PADDING = spacing.sm;
const CELL_GAP = 6;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xs },
  titles: { flex: 1 },
  // Frosted discs on the coloured band, like the store chips beneath them.
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: GAP },
  column: { gap: GAP },
  center: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  card: {
    padding: CARD_PADDING,
    paddingBottom: spacing.md,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  collage: { flexDirection: 'row', flexWrap: 'wrap', gap: CELL_GAP },
  // White squares: packshots are shot on white, so they sit in them cleanly.
  cell: {
    borderRadius: 12,
    padding: 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%' },
  moreCell: { padding: 0 },
  moreText: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22 },
  moreLabel: { fontFamily: fonts.semibold, fontSize: 11 },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.2,
    color: colors.text,
    marginTop: spacing.sm,
    paddingHorizontal: 4,
    minHeight: 38,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  count: { fontFamily: fonts.semibold, fontSize: 12 },
  go: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
