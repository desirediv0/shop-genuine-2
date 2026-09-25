import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { catalogue, wishlist as wishlistApi } from '../../src/api/services';
import { Button } from '../../src/components/Button';
import { QuantityStepper } from '../../src/components/QuantityStepper';
import { ProductCard } from '../../src/components/ProductCard';
import { ErrorState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { ProductVariant } from '../../src/types';
import {
  discountPercent,
  formatPrice,
  pickDefaultVariant,
  stripHtml,
  toNumber,
  variantLabel,
} from '../../src/utils/format';

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, mutating } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogue.productBySlug(slug),
    enabled: !!slug,
  });

  const product = data?.product;
  const related = data?.relatedProducts ?? [];

  // Default to the cheapest in-stock variant once the product arrives.
  useEffect(() => {
    if (product && !variantId) {
      const def = pickDefaultVariant(product.variants);
      if (def) setVariantId(def.id);
    }
  }, [product, variantId]);

  const variant: ProductVariant | undefined = useMemo(() => {
    if (!product?.variants?.length) return undefined;
    return product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  }, [product, variantId]);

  const gallery = useMemo(() => {
    const variantImages = variant?.images?.map((i) => i.url) ?? [];
    const productImages = product?.images?.map((i) => i.url) ?? [];
    const all = [...variantImages, ...productImages];
    if (!all.length && product?.image) all.push(product.image);
    return Array.from(new Set(all));
  }, [product, variant]);

  const wishlistMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.add(productId),
    onSuccess: () => toast('Saved to wishlist', 'success'),
    onError: (e: Error) => toast(e.message, 'error'),
  });

  if (isLoading) return <LoadingState label="Loading product…" />;
  if (isError || !product) {
    return <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />;
  }

  const price = variant ? toNumber(variant.salePrice ?? variant.price) : product.basePrice;
  const regular = variant ? toNumber(variant.price) : product.regularPrice;
  const off = discountPercent(regular, price);
  const stock = variant?.quantity ?? 0;
  const inStock = !!variant?.isActive && stock > 0;
  const description = stripHtml(product.description);

  const onAddToCart = async () => {
    if (!variant) return;
    try {
      await addItem(product, variant, quantity);
      toast('Added to cart', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const onSave = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    wishlistMutation.mutate(product.id);
  };

  return (
    <>
      <Stack.Screen options={{ title: '' }} />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
            }
          >
            {gallery.length ? (
              gallery.map((uri) => (
                <Image
                  key={uri}
                  source={uri}
                  style={{ width, height: width }}
                  contentFit="cover"
                  transition={200}
                />
              ))
            ) : (
              <View style={[styles.noImage, { width, height: width }]}>
                <Text style={styles.muted}>No image</Text>
              </View>
            )}
          </ScrollView>

          {gallery.length > 1 ? (
            <View style={styles.dots}>
              {gallery.map((uri, i) => (
                <View key={uri} style={[styles.dot, i === imageIndex && styles.dotActive]} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          {product.brand?.name ? <Text style={styles.brand}>{product.brand.name}</Text> : null}
          <Text style={styles.name}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(price)}</Text>
            {off > 0 ? (
              <>
                <Text style={styles.strike}>{formatPrice(regular)}</Text>
                <View style={styles.offBadge}>
                  <Text style={styles.offText}>{off}% OFF</Text>
                </View>
              </>
            ) : null}
          </View>

          <Text style={[styles.stock, inStock ? styles.inStock : styles.outStock]}>
            {inStock ? (stock <= 5 ? `Only ${stock} left` : 'In stock') : 'Out of stock'}
          </Text>

          {/* Variants */}
          {product.variants.length > 1 ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Options</Text>
              <View style={styles.variantWrap}>
                {product.variants.map((v) => {
                  const label = variantLabel(v.attributes) || v.sku;
                  const selected = v.id === variant?.id;
                  const disabled = !v.isActive || v.quantity === 0;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => {
                        setVariantId(v.id);
                        setQuantity(1);
                      }}
                      disabled={disabled}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled }}
                      style={[
                        styles.variant,
                        selected && styles.variantSelected,
                        disabled && styles.variantDisabled,
                      ]}
                    >
                      <Text
                        style={[styles.variantText, selected && styles.variantTextSelected]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                      <Text style={styles.variantPrice}>
                        {formatPrice(toNumber(v.salePrice ?? v.price))}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Quantity */}
          {inStock ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Quantity</Text>
              <QuantityStepper
                value={quantity}
                min={1}
                max={Math.min(stock, 20)}
                onChange={setQuantity}
              />
            </View>
          ) : null}

          {/* Description */}
          {description ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Description</Text>
              <Text style={styles.description} numberOfLines={descExpanded ? undefined : 6}>
                {description}
              </Text>
              {description.length > 260 ? (
                <Pressable onPress={() => setDescExpanded((v) => !v)} hitSlop={8}>
                  <Text style={styles.more}>{descExpanded ? 'Show less' : 'Read more'}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {product.category?.name ? (
            <Pressable
              style={styles.categoryLink}
              onPress={() => router.push(`/category/${product.category?.slug}`)}
            >
              <Text style={styles.more}>More in {product.category.name} →</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Related products — the detail endpoint returns these already. */}
        {related.length > 0 ? (
          <View style={styles.related}>
            <Text style={[styles.blockTitle, styles.relatedTitle]}>You might also like</Text>
            <FlatList
              horizontal
              data={related}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedRow}
              renderItem={({ item }) => <ProductCard product={item} width={150} />}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky action bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Save"
          variant="outline"
          onPress={onSave}
          loading={wishlistMutation.isPending}
          style={styles.saveBtn}
        />
        <Button
          label={inStock ? 'Add to cart' : 'Out of stock'}
          onPress={onAddToCart}
          disabled={!inStock}
          loading={mutating}
          style={styles.cartBtn}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  noImage: { backgroundColor: colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' },
  muted: { ...typography.small, color: colors.textMuted },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary, width: 18 },
  body: { padding: spacing.lg, gap: spacing.sm },
  brand: { ...typography.tiny, color: colors.textMuted, textTransform: 'uppercase' },
  name: { ...typography.h2, color: colors.text },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  price: { ...typography.h1, color: colors.text },
  strike: { ...typography.small, color: colors.textMuted, textDecorationLine: 'line-through' },
  offBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  offText: { ...typography.tiny, color: colors.textInverse, fontWeight: '700' },
  stock: { ...typography.small, fontWeight: '600' },
  inStock: { color: colors.success },
  outStock: { color: colors.error },
  block: { marginTop: spacing.lg, gap: spacing.sm },
  blockTitle: { ...typography.h3, color: colors.text },
  variantWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  variant: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 92,
    gap: 2,
  },
  variantSelected: { borderColor: colors.primary, backgroundColor: colors.backgroundAlt },
  variantDisabled: { opacity: 0.4 },
  variantText: { ...typography.small, color: colors.text },
  variantTextSelected: { color: colors.primary, fontWeight: '600' },
  variantPrice: { ...typography.tiny, color: colors.textMuted },
  description: { ...typography.body, color: colors.textMuted, lineHeight: 22 },
  more: { ...typography.small, color: colors.primary, fontWeight: '600' },
  categoryLink: { marginTop: spacing.lg },
  related: { paddingBottom: spacing.xl, gap: spacing.md },
  relatedTitle: { paddingHorizontal: spacing.lg },
  relatedRow: { paddingHorizontal: spacing.lg, gap: spacing.md },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: { flex: 1 },
  cartBtn: { flex: 2 },
});
