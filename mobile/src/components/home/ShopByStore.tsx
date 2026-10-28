import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useQueries } from '@tanstack/react-query';
import { catalogue } from '../../api/services';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { DOT_GRID, storeMesh, storeTheme } from '../../theme/stores';
import { Icon } from '../Icon';
import { Appear } from '../motion/Appear';
import { PressableScale } from '../motion/PressableScale';
import { SectionHeader } from './SectionHeader';

const GAP = spacing.md;

/** Where each photo in the fan sits: left, centre (raised, larger), right. */
const FAN = [
  { size: 58, rotate: '-9deg', left: '4%', top: 18, z: 1 },
  { size: 70, rotate: '0deg', left: '50%', top: 4, z: 3, centre: true },
  { size: 58, rotate: '9deg', right: '4%', top: 18, z: 2 },
] as const;

/**
 * One big card per Genuine store that has something to sell, on that store's
 * colour mesh, with a fan of three of its products and its product count.
 * Tapping one switches the whole app to the store — the same as its chip in
 * the hero, but a much larger, more inviting target. Shown only on "All";
 * stores with no products are left out, so a card never leads to an empty
 * shop.
 */
export function ShopByStore({ onPick }: { onPick: (id: string) => void }) {
  const { verticals } = useStoreVertical();
  const { width } = useWindowDimensions();

  // One request per store gives both the count and the photos for its fan.
  const stores = useQueries({
    queries: verticals.map((v) => ({
      queryKey: ['storeCard', v.id],
      queryFn: () => catalogue.products({ limit: 3, sort: 'createdAt', order: 'desc', storeVerticalId: v.id }),
      staleTime: 5 * 60_000,
    })),
  });

  const stocked = verticals
    .map((v, i) => ({
      v,
      total: stores[i]?.data?.pagination.total ?? 0,
      photos: (stores[i]?.data?.products ?? [])
        .map((p) => p.image)
        .filter((uri): uri is string => !!uri),
    }))
    .filter((s) => s.total > 0);
  if (!stocked.length) return null;

  // Two across; a lone store gets the full width rather than half a row.
  const cardWidth = stocked.length === 1 ? width - spacing.lg * 2 : (width - spacing.lg * 2 - GAP) / 2;

  return (
    <View style={styles.section}>
      <SectionHeader title="Shop by store" />
      <View style={styles.grid}>
        {stocked.map(({ v, total, photos }, i) => {
          const t = storeTheme(v.name);
          return (
            <Appear key={v.id} index={i} from="right">
              <PressableScale
                scaleTo={0.97}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onPick(v.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${v.name}, ${total} products`}
                style={[
                  styles.card,
                  { width: cardWidth, experimental_backgroundImage: storeMesh(t) },
                  shadow.glow(t.gradient[1], 0.3),
                ]}
              >
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, DOT_GRID, styles.dots]} />

                <View style={styles.fan} pointerEvents="none">
                  {photos.slice(0, 3).map((uri, k) => {
                    const spot = FAN[photos.length === 1 ? 1 : k];
                    return (
                      <View
                        key={uri}
                        style={[
                          styles.photo,
                          {
                            width: spot.size,
                            height: spot.size,
                            top: spot.top,
                            zIndex: spot.z,
                            transform: [
                              ...('centre' in spot ? [{ translateX: -spot.size / 2 }] : []),
                              { rotate: spot.rotate },
                            ],
                          },
                          'left' in spot ? { left: spot.left } : { right: spot.right },
                        ]}
                      >
                        <Image source={uri} style={styles.photoImage} contentFit="contain" transition={200} />
                      </View>
                    );
                  })}
                </View>

                <View style={styles.nameRow}>
                  <Icon name={t.icon} size={17} color={colors.textInverse} filled />
                  <Text style={styles.name} numberOfLines={1}>
                    {t.short}
                  </Text>
                </View>
                <Text style={styles.tagline} numberOfLines={2}>
                  {t.tagline}
                </Text>
                <View style={styles.footer}>
                  <Text style={styles.count} numberOfLines={1}>
                    {total} {total === 1 ? 'product' : 'products'}
                  </Text>
                  <View style={styles.go}>
                    <Icon name="forward" size={14} color={t.solid} />
                  </View>
                </View>
              </PressableScale>
            </Appear>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: spacing.lg },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    paddingTop: 98,
    overflow: 'hidden',
  },
  dots: { opacity: 0.55 },
  fan: { position: 'absolute', top: 10, left: 10, right: 10, height: 88 },
  photo: {
    position: 'absolute',
    borderRadius: 16,
    padding: 6,
    backgroundColor: colors.surface,
    boxShadow: '0px 8px 18px rgba(2, 6, 23, 0.25)',
  },
  photoImage: { width: '100%', height: '100%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.4, color: colors.textInverse },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.86)',
    marginTop: 3,
    minHeight: 34,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: spacing.md,
  },
  count: { flexShrink: 1, fontFamily: fonts.displayBold, fontSize: 13, color: colors.textInverse },
  go: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
