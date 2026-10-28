import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { catalogue } from '../../api/services';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { useProductLayout } from '../../hooks/useProductLayout';
import { colors, fonts, radius, spacing } from '../../theme';
import { DOT_GRID } from '../../theme/stores';
import { discountPercent } from '../../utils/format';
import { ProductCard } from '../ProductCard';
import { Appear } from '../motion/Appear';

/** Below this, a markdown is not worth headlining. */
const MIN_DISCOUNT = 10;

/**
 * Deep navy with an orange glow: the one dark band on Home, so the deals stand
 * out from everything around them and white cards pop against it.
 */
const DEALS_MESH = [
  'radial-gradient(circle at 100% 0%, rgba(249, 115, 22, 0.55) 0%, rgba(249, 115, 22, 0) 52%)',
  'radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.42) 0%, rgba(139, 92, 246, 0) 55%)',
  'linear-gradient(160deg, #0B1B4D 0%, #12307F 100%)',
].join(', ');

/**
 * The biggest real discounts among the store's 60 newest products, on a dark
 * band headed "Up to N% off". Computed from the prices the server sends, so the
 * row is never a claim the shop cannot back — and it surfaces different
 * products from the admin's sections, which often repeat each other.
 *
 * Only the newest 60, and the copy says so ("new arrivals"): scanning the whole
 * catalogue cost ~340 KB per Home visit at 139 products and grows with it. The
 * server has no sort-by-discount to do this properly.
 */
export function TopDeals() {
  const { verticalId, verticalParam } = useStoreVertical();
  const { railCardWidth } = useProductLayout();

  const query = useQuery({
    queryKey: ['products', 'deals', verticalId],
    queryFn: () => catalogue.products({ limit: 60, sort: 'createdAt', order: 'desc', ...verticalParam }),
  });

  const deals = useMemo(
    () =>
      (query.data?.products ?? [])
        .map((p) => ({ p, off: discountPercent(p.regularPrice, p.basePrice) }))
        .filter((d) => d.off >= MIN_DISCOUNT)
        .sort((a, b) => b.off - a.off)
        .slice(0, 10),
    [query.data],
  );

  // A "Top deals" row of one or two looks like an accident.
  if (deals.length < 3) return null;

  return (
    <View style={[styles.band, { experimental_backgroundImage: DEALS_MESH }]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, DOT_GRID, styles.dots]} />

      <View style={styles.header}>
        <View style={styles.titles}>
          <View style={styles.kicker}>
            <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.primary} />
            <Text style={styles.kickerText}>TOP DEALS</Text>
          </View>
          <Text style={styles.title}>Up to {deals[0].off}% off</Text>
          <Text style={styles.subtitle}>Big savings on new arrivals</Text>
        </View>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="tag-heart" size={26} color={colors.textInverse} />
        </View>
      </View>

      <FlatList
        horizontal
        data={deals}
        keyExtractor={(d) => d.p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        renderItem={({ item, index }) => (
          <Appear index={index} from="right" limit={6}>
            <ProductCard product={item.p} width={railCardWidth} />
          </Appear>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  band: { marginTop: spacing.xxl, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  dots: { opacity: 0.5 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  titles: { flex: 1 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kickerText: { fontFamily: fonts.display, fontSize: 11, letterSpacing: 1.4, color: colors.primary },
  title: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.8,
    color: colors.textInverse,
    marginTop: 2,
  },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  badge: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: 'linear-gradient(145deg, #FB923C 0%, #EA580C 100%)',
    boxShadow: '0px 10px 22px rgba(249, 115, 22, 0.45)',
    transform: [{ rotate: '8deg' }],
  },
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xs },
});
