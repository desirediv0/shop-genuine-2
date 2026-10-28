import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useQueries } from '@tanstack/react-query';
import { catalogue } from '../../api/services';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { storeTheme } from '../../theme/stores';
import { Icon } from '../Icon';
import { Appear } from '../motion/Appear';
import { PressableScale } from '../motion/PressableScale';
import { SectionHeader } from './SectionHeader';

const GAP = spacing.md;

/**
 * One big card per Genuine store that has something to sell, in that store's
 * gradient, with its product count. Tapping one switches the whole app to the
 * store — the same as its chip in the hero, but a much larger, more inviting
 * target. Shown only on "All"; stores with no products are left out, so a card
 * never leads to an empty shop.
 */
export function ShopByStore({ onPick }: { onPick: (id: string) => void }) {
  const { verticals } = useStoreVertical();
  const { width } = useWindowDimensions();

  const counts = useQueries({
    queries: verticals.map((v) => ({
      queryKey: ['storeCount', v.id],
      queryFn: () => catalogue.products({ limit: 1, storeVerticalId: v.id }),
      staleTime: 5 * 60_000,
    })),
  });

  const stocked = verticals
    .map((v, i) => ({ v, total: counts[i]?.data?.pagination.total ?? 0 }))
    .filter((s) => s.total > 0);
  if (!stocked.length) return null;

  // Two across; a lone store gets the full width rather than half a row.
  const cardWidth = stocked.length === 1 ? width - spacing.lg * 2 : (width - spacing.lg * 2 - GAP) / 2;

  return (
    <View style={styles.section}>
      <SectionHeader title="Shop by store" />
      <View style={styles.grid}>
        {stocked.map(({ v, total }, i) => {
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
                style={[styles.card, { width: cardWidth }]}
              >
                <LinearGradient
                  colors={t.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.mark} pointerEvents="none">
                  <Icon name={t.icon} size={96} color="rgba(255,255,255,0.16)" filled />
                </View>
                <View style={styles.bubble}>
                  <Icon name={t.icon} size={18} color={t.solid} filled />
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {t.short}
                </Text>
                <Text style={styles.tagline} numberOfLines={2}>
                  {t.tagline}
                </Text>
                <View style={styles.footer}>
                  <Text style={styles.count}>
                    {total} {total === 1 ? 'product' : 'products'}
                  </Text>
                  <Icon name="forward" size={14} color={colors.textInverse} />
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
    minHeight: 150,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadow.raised,
  },
  mark: { position: 'absolute', right: -14, bottom: -14 },
  bubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: { fontFamily: fonts.bold, fontSize: 19, color: colors.textInverse },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  count: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.textInverse },
});
