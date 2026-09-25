import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, radius, shadow, spacing, typography } from '../theme';
import type { ProductSummary } from '../types';
import { discountPercent, formatPrice, pickDefaultVariant, toNumber } from '../utils/format';

interface Props {
  product: ProductSummary;
  /** Card width, set by the grid so two columns line up. */
  width?: number;
}

export function ProductCard({ product, width }: Props) {
  const router = useRouter();

  const { price, regular, off, outOfStock } = useMemo(() => {
    const variant = pickDefaultVariant(product.variants);
    const p = variant ? toNumber(variant.salePrice ?? variant.price) : product.basePrice;
    const r = variant ? toNumber(variant.price) : product.regularPrice;
    const stock = product.variants?.some((v) => v.isActive && v.quantity > 0) ?? false;
    return {
      price: p,
      regular: r,
      off: discountPercent(r, p),
      outOfStock: !stock,
    };
  }, [product]);

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(price)}`}
      style={({ pressed }) => [styles.card, !!width && { width }, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={product.image ?? undefined}
          style={styles.image}
          contentFit="cover"
          transition={180}
          accessibilityIgnoresInvertColors
        />

        {off > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{off}% OFF</Text>
          </View>
        ) : null}

        {outOfStock ? (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>Out of stock</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {product.brand?.name ? (
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand.name}
          </Text>
        ) : null}

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          {off > 0 ? <Text style={styles.strike}>{formatPrice(regular)}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: { opacity: 0.9 },
  imageWrap: { aspectRatio: 1, backgroundColor: colors.backgroundAlt },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: { ...typography.tiny, color: colors.textInverse, fontWeight: '700' },
  soldOut: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: { ...typography.small, color: colors.textInverse, fontWeight: '700' },
  body: { padding: spacing.md, gap: 2 },
  brand: { ...typography.tiny, color: colors.textMuted, textTransform: 'uppercase' },
  name: { ...typography.small, color: colors.text, fontWeight: '500', minHeight: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginTop: 2 },
  price: { ...typography.bodyStrong, color: colors.text },
  strike: {
    ...typography.tiny,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
