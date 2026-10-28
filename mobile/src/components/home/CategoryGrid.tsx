import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCategoryArt } from '../../hooks/useCategoryArt';
import { colors, fonts, radius, spacing } from '../../theme';
import { categoryVisual } from '../../theme/stores';
import type { Category } from '../../types';
import { Icon } from '../Icon';
import { Appear } from '../motion/Appear';
import { PressableScale } from '../motion/PressableScale';

const COLUMNS = 4;
const MAX_TILES = 8;

/**
 * Categories as a four-column grid of tinted tiles — scannable at a glance,
 * where the old horizontal strip of circles showed four and hid the rest.
 *
 * The admin has uploaded no category artwork, so each tile shows the newest
 * product in that category (see useCategoryArt), blended into the pastel so
 * its white packshot background takes on the tile's colour.
 * Real products read as a shop; the matched icon only shows while the photo
 * loads, or for a category with no photographed product.
 */
export function CategoryGrid({
  categories,
  onSeeAll,
}: {
  categories: Category[];
  onSeeAll: () => void;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const gap = spacing.md;
  const tile = Math.floor((width - spacing.lg * 2 - gap * (COLUMNS - 1)) / COLUMNS);

  const overflow = categories.length > MAX_TILES;
  const shown = overflow ? categories.slice(0, MAX_TILES - 1) : categories;
  const art = useCategoryArt(shown);

  return (
    <View style={[styles.grid, { gap }]}>
      {shown.map((c, i) => {
        const visual = categoryVisual(c.name, i);
        const photo = art[i];
        return (
          <Appear key={c.id} index={i}>
            <PressableScale
              onPress={() => router.push(`/category/${c.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={c.name}
              style={{ width: tile }}
            >
              <View style={[styles.tile, { width: tile, height: tile, backgroundColor: visual.bg }]}>
                {photo ? (
                  <Image source={photo} style={styles.image} contentFit="contain" transition={250} />
                ) : (
                  <MaterialCommunityIcons name={visual.icon} size={Math.round(tile * 0.42)} color={visual.fg} />
                )}
              </View>
              {/* Tiles are ~78dp wide on a 360dp phone. With a large system
                  font, "Fruits & Vegetables" broke mid-word into "Fruits & V /
                  egetables", so the label stops growing at 115%. */}
              <Text style={styles.label} numberOfLines={2} maxFontSizeMultiplier={1.15}>
                {c.name}
              </Text>
            </PressableScale>
          </Appear>
        );
      })}

      {overflow ? (
        <Appear index={shown.length}>
          <PressableScale
            onPress={onSeeAll}
            accessibilityRole="button"
            accessibilityLabel={`See all ${categories.length} categories`}
            style={{ width: tile }}
          >
            <View style={[styles.tile, styles.moreTile, { width: tile, height: tile }]}>
              <Text style={styles.moreCount}>+{categories.length - shown.length}</Text>
              <Icon name="forward" size={16} color={colors.primary} />
            </View>
            <Text style={styles.label} maxFontSizeMultiplier={1.15}>
              See all
            </Text>
          </PressableScale>
        </Appear>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, rowGap: spacing.lg },
  tile: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // A soft light from the top-left corner, so the tile has some depth.
    experimental_backgroundImage:
      'radial-gradient(circle at 25% 15%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 62%)',
  },
  // Multiply: the photo's white background takes on the tile colour (Android
  // 10+ and iOS; older Android shows the photo on white, which still reads).
  image: { width: '78%', height: '78%', mixBlendMode: 'multiply' },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    lineHeight: 15,
    color: colors.text,
    textAlign: 'center',
    marginTop: 6,
  },
  moreTile: { backgroundColor: colors.primarySoft, flexDirection: 'row', gap: 2 },
  moreCount: { fontFamily: fonts.display, fontSize: 19, color: colors.primary },
});
