import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, fonts, radius, shadow, spacing, typography } from '../theme';
import type { ProductSummary } from '../types';
import { discountPercent, formatPrice, pickDefaultVariant, toNumber } from '../utils/format';
import { AddToCartButton } from './AddToCartButton';
import { Icon } from './Icon';
import { PressableScale } from './motion/PressableScale';

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

  const saving = off > 0 ? regular - price : 0;

  return (
    <PressableScale
      scaleTo={0.97}
      onPress={() => router.push(`/product/${product.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(price)}${
        off > 0 ? `, ${off} percent off` : ''
      }${outOfStock ? ', out of stock' : ''}`}
      style={[styles.card, !!width && { width }]}
    >
      <View style={styles.well}>
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
        {/* Always takes its line, so cards in a row keep one height. */}
        <Text style={styles.save} numberOfLines={1}>
          {saving > 0 ? `Save ${formatPrice(saving)}` : ' '}
        </Text>
      </View>
    </PressableScale>
  );
}

/**
 * Packshots are white-background JPEGs. Dimming them 4% turns that white into
 * exactly the well's grey, so every product sits on the same soft stage
 * instead of a hard white square. A brightness filter is drawn once into a
 * cached layer on Android, so it costs nothing while a row scrolls — unlike
 * mixBlendMode, which re-blends every frame.
 */
const WELL = '#F5F5F5';
const DIM = 'brightness(0.96)';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 5,
    ...shadow.card,
  },
  well: {
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: WELL,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', filter: DIM },
  noImage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // A tag tucked into the corner, the way shelf stickers sit.
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.deal,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderBottomRightRadius: 10,
  },
  badgeText: { fontFamily: fonts.display, fontSize: 9.5, lineHeight: 12, letterSpacing: 0.2, color: colors.textInverse },
  soldOut: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(245, 245, 245, 0.72)',
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
  addSlot: { position: 'absolute', right: 5, bottom: 5 },
  body: { paddingHorizontal: 4, paddingTop: 8, paddingBottom: 4, gap: 2 },
  brand: { ...typography.overline, fontSize: 9, color: colors.textMuted },
  // Two lines at 12sp: product names here run long ("Tata Sampann Coriander
  // Whole (Dhaniya)…"). The fixed height keeps prices aligned across a row.
  name: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, minHeight: 32, color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 5, marginTop: 3 },
  price: { ...typography.price, fontSize: 15, lineHeight: 20, color: colors.text },
  strike: {
    ...typography.small,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  save: { fontFamily: fonts.semibold, fontSize: 10.5, lineHeight: 14, color: colors.success },
});
