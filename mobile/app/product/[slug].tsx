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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogue, wishlist as wishlistApi } from '../../src/api/services';
import { Button } from '../../src/components/Button';
import { QuantityStepper } from '../../src/components/QuantityStepper';
import { HeaderActions } from '../../src/components/HeaderActions';
import { DietMark } from '../../src/components/product/DietMark';
import {
  CollapsibleCard,
  DetailBlocks,
  ProductDetailsCard,
} from '../../src/components/product/DetailBlocks';
import { PromiseRow } from '../../src/components/product/PromiseRow';
import { Icon } from '../../src/components/Icon';
import { ProductCard } from '../../src/components/ProductCard';
import { ErrorState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useProductLayout } from '../../src/hooks/useProductLayout';
import { useWishlist } from '../../src/hooks/useWishlist';
import { useToast } from '../../src/context/ToastContext';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import type { ProductVariant } from '../../src/types';
import { dietFrom, findDetail, parseProductDetails } from '../../src/utils/productDetails';
import {
  discountPercent,
  formatPrice,
  pickDefaultVariant,
  toNumber,
  variantLabel,
} from '../../src/utils/format';

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const { railCardWidth } = useProductLayout();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, mutating } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogue.productBySlug(slug),
    enabled: !!slug,
  });

  const product = data?.product;
  const related = data?.relatedProducts ?? [];

  // The description is often a full spec sheet (brand, weight, ingredients,
  // FSSAI licence, nutrition…). Read its structure rather than flattening it.
  const details = useMemo(() => parseProductDetails(product?.description), [product?.description]);
  const packSize = findDetail(details, 'unit', 'net quantity', 'pack size', 'quantity', 'weight');
  const diet = dietFrom(findDetail(details, 'dietary preference', 'diet', 'food preference'));
  const shippingBlocks = useMemo(() => parseProductDetails(product?.shippingReturn), [product?.shippingReturn]);
  const legalBlocks = useMemo(() => parseProductDetails(product?.legalInfo), [product?.legalInfo]);
  const lifestyleBlocks = useMemo(
    () => parseProductDetails(product?.lifestyleDescription),
    [product?.lifestyleDescription],
  );

  // The server's related list is "same category", which is empty whenever a
  // category holds one product — true of every live product so far — and the
  // page then simply stopped. Fall back to other products from the store.
  const { verticalParam } = useStoreVertical();
  const suggestionsQ = useQuery({
    queryKey: ['productSuggestions', product?.id, verticalParam],
    queryFn: () => catalogue.products({ limit: 12, ...verticalParam }),
    enabled: !!product && related.length === 0,
  });
  const suggestions = related.length
    ? related
    : (suggestionsQ.data?.products ?? []).filter((p) => p.id !== product?.id).slice(0, 10);

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

  const queryClient = useQueryClient();

  const wishlistQ = useWishlist();

  // The API rejects a duplicate add with 409, so the button has to know the
  // current state rather than always offering "Save".
  const savedEntry = wishlistQ.data?.wishlistItems.find(
    (w) => w.productId === data?.product?.id,
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!product) return;
      if (savedEntry) {
        await wishlistApi.remove(savedEntry.id);
        return 'removed' as const;
      }
      await wishlistApi.add(product.id);
      return 'added' as const;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast(result === 'removed' ? 'Removed from saved' : 'Saved', 'success');
    },
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
    saveMutation.mutate();
  };

  return (
    <>
      <Stack.Screen options={{ title: '', headerRight: () => <HeaderActions /> }} />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 190 }}
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
                  contentFit="contain"
                  transition={220}
                />
              ))
            ) : (
              <View style={[styles.noImage, { width, height: width }]}>
                <Icon name="image" size={30} color={colors.textMuted} />
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
          {packSize || diet ? (
            <View style={styles.metaRow}>
              {diet ? <DietMark diet={diet} /> : null}
              {packSize ? <Text style={styles.packSize}>{packSize}</Text> : null}
            </View>
          ) : null}

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

          <PromiseRow />

          {/* A spec sheet reads as "Product details"; free text as prose. */}
          <ProductDetailsCard
            title={details.some((b) => b.type === 'row') ? 'Product details' : 'About this product'}
            blocks={details}
          />

          {lifestyleBlocks.length || product.lifestyleImage ? (
            <View style={styles.lifestyle}>
              {product.lifestyleImage ? (
                <Image
                  source={product.lifestyleImage}
                  style={styles.lifestyleImage}
                  contentFit="cover"
                  transition={220}
                />
              ) : null}
              {lifestyleBlocks.length ? (
                <View style={styles.lifestyleText}>
                  <DetailBlocks blocks={lifestyleBlocks} />
                </View>
              ) : null}
            </View>
          ) : null}

          <CollapsibleCard title="Shipping & returns" blocks={shippingBlocks} />
          <CollapsibleCard title="Legal information" blocks={legalBlocks} />

          {product.category?.name ? (
            <Pressable
              style={styles.categoryLink}
              onPress={() => router.push(`/category/${product.category?.slug}`)}
            >
              <Text style={styles.more}>More in {product.category.name}</Text>
              <Icon name="forward" size={15} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>

        {/* Same-category products from the server, or other products from the store. */}
        {suggestions.length > 0 ? (
          <View style={styles.related}>
            <Text style={[styles.blockTitle, styles.relatedTitle]}>You might also like</Text>
            <FlatList
              horizontal
              data={suggestions}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedRow}
              renderItem={({ item }) => <ProductCard product={item} width={railCardWidth} />}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky action bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={savedEntry ? 'Saved' : 'Save'}
          icon="wishlist"
          iconFilled={!!savedEntry}
          variant="outline"
          onPress={onSave}
          loading={saveMutation.isPending}
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
  noImage: { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
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
  dotActive: { backgroundColor: colors.primary, width: 20 },
  body: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.sm },
  brand: { ...typography.overline, color: colors.textMuted },
  name: { ...typography.h1, color: colors.text, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  packSize: { ...typography.smallStrong, color: colors.textMuted },
  lifestyle: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  lifestyleImage: { width: '100%', aspectRatio: 16 / 10 },
  lifestyleText: { padding: spacing.lg },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  price: { ...typography.priceLarge, color: colors.text },
  strike: { ...typography.body, color: colors.textMuted, textDecorationLine: 'line-through' },
  offBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  offText: { ...typography.tiny, color: colors.textInverse },
  stock: { ...typography.smallStrong },
  inStock: { color: colors.success },
  outStock: { color: colors.error },
  block: { marginTop: spacing.lg, gap: spacing.sm },
  blockTitle: { ...typography.h2, color: colors.text },
  variantWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  variant: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 96,
    gap: 2,
    backgroundColor: colors.surface,
  },
  variantSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  variantDisabled: { opacity: 0.4 },
  variantText: { ...typography.smallStrong, color: colors.textSecondary },
  variantTextSelected: { color: colors.text, fontFamily: fonts.semibold },
  variantPrice: { ...typography.tiny, color: colors.textMuted },
  more: { ...typography.smallStrong, color: colors.primary },
  categoryLink: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  related: { paddingBottom: spacing.xl, gap: spacing.md },
  relatedTitle: { paddingHorizontal: spacing.lg },
  relatedRow: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.surface,
    ...shadow.bar,
  },
  saveBtn: { flex: 1 },
  cartBtn: { flex: 2 },
});
