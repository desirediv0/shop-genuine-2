import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { catalogue } from '../../api/services';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { useProductLayout } from '../../hooks/useProductLayout';
import { colors, fonts, radius, spacing } from '../../theme';
import { discountPercent } from '../../utils/format';
import { ProductCard } from '../ProductCard';

/** Below this, a markdown is not worth headlining. */
const MIN_DISCOUNT = 10;

/**
 * The biggest real discounts among the store's 60 newest products, on a warm
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
    <View style={styles.band}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#FFE6D2', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.circle, styles.circleBig]} />
        <View style={[styles.circle, styles.circleRing]} />
      </View>

      <View style={styles.header}>
        <View style={styles.flame}>
          <MaterialCommunityIcons name="tag-heart-outline" size={18} color={colors.textInverse} />
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>Top deals</Text>
          <Text style={styles.subtitle}>Big savings on new arrivals</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Up to {deals[0].off}% off</Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={deals}
        keyExtractor={(d) => d.p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        renderItem={({ item }) => <ProductCard product={item.p} width={railCardWidth} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  band: { marginTop: spacing.xxl, paddingVertical: spacing.lg, overflow: 'hidden' },
  circle: { position: 'absolute', borderRadius: 999 },
  circleBig: {
    width: 200,
    height: 200,
    top: -100,
    left: -50,
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  circleRing: {
    width: 110,
    height: 110,
    top: 6,
    right: -36,
    borderWidth: 1.5,
    borderColor: colors.primary,
    opacity: 0.18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  flame: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.deal,
  },
  pillText: { fontFamily: fonts.bold, fontSize: 12, color: colors.textInverse },
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xs },
});
