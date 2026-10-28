import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import { catalogue } from '../../api/services';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { fonts, radius, shadow, spacing } from '../../theme';
import { Appear } from '../motion/Appear';
import { PressableScale } from '../motion/PressableScale';
import { SectionHeader } from './SectionHeader';

const CAPS = [99, 199, 499, 999];
/** Warm, cool, warm, cool — so neighbouring tiles never share a colour. */
const PALETTE: { from: string; to: string }[] = [
  { from: '#FB923C', to: '#EA580C' },
  { from: '#60A5FA', to: '#1D4ED8' },
  { from: '#F472B6', to: '#BE185D' },
  { from: '#34D399', to: '#047857' },
];
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
        {tiles.map(({ cap, total, tone }, i) => (
          <Appear key={cap} index={i}>
            <PressableScale
              onPress={() =>
                router.navigate({ pathname: '/search', params: { under: String(cap), t: String(Date.now()) } })
              }
              accessibilityRole="button"
              accessibilityLabel={`Under ${cap} rupees, ${total} products`}
              style={[
                styles.tile,
                {
                  width: tileWidth,
                  experimental_backgroundImage: `linear-gradient(150deg, ${tone.from} 0%, ${tone.to} 100%)`,
                },
                shadow.glow(tone.to, 0.3),
              ]}
            >
              {/* A big faint rupee sign in the corner, for texture. */}
              <Text style={styles.watermark} pointerEvents="none">
                ₹
              </Text>
              <Text style={styles.under}>UNDER</Text>
              <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit>
                ₹{cap}
              </Text>
              <Text style={styles.count} numberOfLines={1}>
                {total} items
              </Text>
            </PressableScale>
          </Appear>
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
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -8,
    bottom: -34,
    fontFamily: fonts.display,
    fontSize: 70,
    color: 'rgba(255,255,255,0.14)',
    transform: [{ rotate: '-12deg' }],
  },
  under: { fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.4, color: 'rgba(255,255,255,0.85)' },
  price: { fontFamily: fonts.display, fontSize: 23, letterSpacing: -0.6, marginTop: 1, color: '#FFFFFF' },
  count: { fontFamily: fonts.semibold, fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 1 },
});
