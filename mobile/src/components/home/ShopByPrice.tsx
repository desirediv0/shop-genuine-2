import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import { catalogue } from '../../api/services';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { fonts, radius, spacing } from '../../theme';
import { TILE_COLOURS } from '../../theme/stores';
import { SectionHeader } from './SectionHeader';

const CAPS = [99, 199, 499, 999];
/** Warm, cool, warm, cool — so neighbouring tiles never share a colour. */
const PALETTE = [TILE_COLOURS[0], TILE_COLOURS[2], TILE_COLOURS[3], TILE_COLOURS[1]];
const GAP = spacing.sm;

/**
 * "Under ₹99 / ₹199 / ₹499 / ₹999" tiles, each with how many products it
 * holds, opening Search with that price cap. Counts come from the server (one
 * tiny request per tile) so an empty bracket is never offered; the cap is the
 * price the shopper pays — the server filters on the sale price where there is
 * one.
 */
export function ShopByPrice() {
  const router = useRouter();
  const { verticalId, verticalParam } = useStoreVertical();
  const { width } = useWindowDimensions();

  const counts = useQueries({
    queries: CAPS.map((cap) => ({
      queryKey: ['priceCount', cap, verticalId],
      queryFn: () => catalogue.products({ limit: 1, maxPrice: cap, ...verticalParam }),
      staleTime: 5 * 60_000,
    })),
  });

  const tiles = CAPS.map((cap, i) => ({
    cap,
    total: counts[i]?.data?.pagination.total ?? 0,
    tone: PALETTE[i],
  })).filter((t) => t.total > 0);
  if (tiles.length < 2) return null;

  const tileWidth = (width - spacing.lg * 2 - GAP * (tiles.length - 1)) / tiles.length;

  return (
    <View style={styles.section}>
      <SectionHeader title="Shop by price" />
      <View style={styles.row}>
        {tiles.map(({ cap, total, tone }) => (
          <Pressable
            key={cap}
            onPress={() =>
              router.navigate({ pathname: '/search', params: { under: String(cap), t: String(Date.now()) } })
            }
            accessibilityRole="button"
            accessibilityLabel={`Under ${cap} rupees, ${total} products`}
            style={({ pressed }) => [
              styles.tile,
              { width: tileWidth, backgroundColor: tone.bg },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.dot, { backgroundColor: tone.fg }]} />
            <Text style={[styles.under, { color: tone.fg }]}>UNDER</Text>
            <Text style={[styles.price, { color: tone.fg }]} numberOfLines={1} adjustsFontSizeToFit>
              ₹{cap}
            </Text>
            <Text style={styles.count} numberOfLines={1}>
              {total} items
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl },
  row: { flexDirection: 'row', gap: GAP, paddingHorizontal: spacing.lg },
  tile: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  // A faint disc in the corner, so the tiles are not flat swatches.
  dot: { position: 'absolute', width: 60, height: 60, borderRadius: 30, top: -26, right: -22, opacity: 0.12 },
  under: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.2 },
  price: { fontFamily: fonts.bold, fontSize: 22, marginTop: 2 },
  count: { fontFamily: fonts.medium, fontSize: 11, color: '#57534E', marginTop: 2 },
});
