import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, radius, shadow, spacing, typography } from '../theme';
import type { ProductSummary } from '../types';
import { discountPercent, formatPrice, pickDefaultVariant, toNumber } from '../utils/format';
import { Icon } from './Icon';

interface Props {
  product: ProductSummary;
  /** Card width, set by the grid so two columns line up. */
  width?: number;
}

export function ProductCard({ product, width }: Props) {
  const router = useRouter();

  const { price, regular, off, outOfStock, image } = useMemo(() => {
    const variant = pickDefaultVariant(product.variants);
    const p = variant ? toNumber(variant.salePrice ?? variant.price) : product.basePrice;
    const r = variant ? toNumber(variant.price) : product.regularPrice;
    const stock = product.variants?.some((v) => v.isActive && v.quantity > 0) ?? false;
    // The list endpoint sends a flat `image`; the detail endpoint only sends
    // `images[]`, and a card can be rendered from either.
    const art =
      product.image ??
      product.images?.find((i) => i.isPrimary)?.url ??
      product.images?.[0]?.url ??
      null;
    return { price: p, regular: r, off: discountPercent(r, p), outOfStock: !stock, image: art };
  }, [product]);

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(price)}${
        off > 0 ? `, ${off} percent off` : ''
      }${outOfStock ? ', out of stock' : ''}`}
      style={({ pressed }) => [styles.card, !!width && { width }, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={image} style={styles.image} contentFit="contain" transition={220} />
        ) : (
          <View style={styles.noImage}>
            <Icon name="image" size={22} color={colors.textMuted} />
          </View>
        )}

        {off > 0 && !outOfStock ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{off}% OFF</Text>
          </View>
        ) : null}

        {outOfStock ? (
          <View style={styles.soldOut}>
            <View style={styles.soldOutPill}>
              <Text style={styles.soldOutText}>Out of stock</Text>
            </View>
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
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  // Packaging shots are shot on white, so `contain` on a warm tile keeps the
  // product whole instead of cropping it like `cover` did.
  // Packaging shots are white-background JPEGs, so a tinted tile leaves a hard
  // white square floating inside it. Matching the card keeps the product clean
  // and lets the card shadow do the separating.
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  image: { width: '100%', height: '100%' },
  noImage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: { ...typography.tiny, fontSize: 10, color: colors.textInverse },
  soldOut: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(250, 248, 245, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutPill: {
    backgroundColor: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  soldOutText: { ...typography.tiny, color: colors.textInverse },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: 3 },
  brand: { ...typography.overline, color: colors.textMuted },
  name: { ...typography.small, color: colors.text, minHeight: 38 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginTop: 2 },
  price: { ...typography.price, color: colors.text },
  strike: {
    ...typography.small,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
