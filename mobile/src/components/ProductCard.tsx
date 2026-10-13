import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, radius, shadow, spacing, typography } from '../theme';
import type { ProductSummary } from '../types';
import { discountPercent, formatPrice, pickDefaultVariant, toNumber } from '../utils/format';
import { AddToCartButton } from './AddToCartButton';
import { Icon } from './Icon';

interface Props {
  product: ProductSummary;
  /** Card width, from useProductLayout so grids and rows agree. */
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
    // `images[]`, and a card can be rendered from either. The last resort is a
    // variant's photo — the same order the list endpoint uses server-side. The
    // related-products list skips that step, so a product whose only photo sits
    // on its variant came back as `image: null` and rendered a blank card.
    const variantWithArt = product.variants?.find((v) => v.images?.length);
    const variantArt =
      variantWithArt?.images?.find((i) => i.isPrimary)?.url ?? variantWithArt?.images?.[0]?.url;
    const art =
      product.image ??
      product.images?.find((i) => i.isPrimary)?.url ??
      product.images?.[0]?.url ??
      variantArt ??
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

        {/* In the image corner rather than beside the price: at three across a
            card is ~105dp wide, and a price plus a − 1 + stepper in one row
            overflows. Here it fits on any phone. */}
        <View style={styles.addSlot}>
          <AddToCartButton product={product} />
        </View>
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
  // Smaller cards read better with a tighter corner than the old 18dp.
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  // Packaging shots are white-background JPEGs, so a tinted tile leaves a hard
  // white square floating inside it. Matching the card keeps the product clean
  // and lets the card shadow do the separating.
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  image: { width: '100%', height: '100%' },
  noImage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontFamily: typography.tiny.fontFamily, fontSize: 9, lineHeight: 12, color: colors.textInverse },
  soldOut: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(250, 248, 245, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutPill: {
    backgroundColor: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  soldOutText: { ...typography.tiny, fontSize: 10, color: colors.textInverse },
  addSlot: { position: 'absolute', right: 6, bottom: 6 },
  body: { paddingHorizontal: spacing.sm, paddingTop: 6, paddingBottom: 10, gap: 2 },
  brand: { ...typography.overline, fontSize: 9, color: colors.textMuted },
  // Two lines at 12sp: product names here run long ("Tata Sampann Coriander
  // Whole (Dhaniya)…"). The fixed height keeps prices aligned across a row.
  name: { ...typography.smallStrong, fontSize: 12, lineHeight: 16, minHeight: 32, color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 5, marginTop: 2 },
  price: { ...typography.price, fontSize: 14, lineHeight: 19, color: colors.text },
  strike: {
    ...typography.small,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
