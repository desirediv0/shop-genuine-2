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
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogue, wishlist as wishlistApi } from '../../src/api/services';
import { Button } from '../../src/components/Button';
import { FloatingBack, HeaderActions } from '../../src/components/HeaderActions';
import { SectionHeader } from '../../src/components/home/SectionHeader';
import { QtyStepper } from '../../src/components/QtyStepper';
import { DietMark } from '../../src/components/product/DietMark';
import { CollapsibleCard, ProductDetailsCard } from '../../src/components/product/DetailBlocks';
import { PromiseRow } from '../../src/components/product/PromiseRow';
import { Icon } from '../../src/components/Icon';
import { ProductCard } from '../../src/components/ProductCard';
import { Appear } from '../../src/components/motion/Appear';
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
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { cart, addItem, updateItem, removeItem } = useCart();
  const [cartBusy, setCartBusy] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [variantId, setVariantId] = useState<string | null>(null);
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

  const saving = off > 0 ? regular - price : 0;

  // The bar works like the cards: "Add to cart", then − qty + once it is in.
  const line = variant ? cart.items.find((i) => i.variant.id === variant.id) : undefined;
  const floor = Math.max(1, line?.moq ?? 1);

  const runCart = async (action: () => Promise<void>) => {
    if (cartBusy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCartBusy(true);
    try {
      await action();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setCartBusy(false);
    }
  };

  const onAddToCart = () => {
    if (variant) runCart(() => addItem(product, variant, 1));
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
      {/* The header floats over the photo: back, search and cart as white discs. */}
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          // The stack's default header colour would still paint over the photo.
          headerStyle: { backgroundColor: 'transparent' },
          headerLeft: () => <FloatingBack />,
          headerRight: () => <HeaderActions floating />,
        }}
      />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 190 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery on a soft studio backdrop. Each photo is multiplied into its
            page, so a white packshot background takes on the backdrop's glow
            instead of showing as a white box. */}
        <View style={[styles.stage, { paddingTop: headerHeight }]}>
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
                <View key={uri} style={[styles.page, { width, height: width * 0.8 }]}>
                  <Image source={uri} style={styles.galleryImage} contentFit="contain" transition={220} />
                </View>
              ))
            ) : (
              <View style={[styles.page, { width, height: width * 0.8 }]}>
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

        {/* Name, price and options on a white sheet over the bottom of the photo */}
        <View style={styles.sheet}>
          {product.brand?.name ? <Text style={styles.brand}>{product.brand.name}</Text> : null}
          <Text style={styles.name}>{product.name}</Text>
          {packSize || diet ? (
            <View style={styles.metaRow}>
              {diet ? <DietMark diet={diet} /> : null}
              {packSize ? (
                <View style={styles.packChip}>
                  <Text style={styles.packSize}>{packSize}</Text>
                </View>
              ) : null}
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

          <View style={styles.statusRow}>
            {saving > 0 ? (
              <View style={styles.savingChip}>
                <Icon name="tag" size={13} color={colors.success} filled />
                <Text style={styles.saving}>You save {formatPrice(saving)}</Text>
              </View>
            ) : null}
            <View style={styles.stockRow}>
              <View style={[styles.stockDot, { backgroundColor: inStock ? colors.success : colors.error }]} />
              <Text style={[styles.stock, inStock ? styles.inStock : styles.outStock]}>
                {inStock ? (stock <= 5 ? `Only ${stock} left` : 'In stock') : 'Out of stock'}
              </Text>
            </View>
          </View>

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
        </View>

        <View style={styles.body}>
          <View style={styles.promiseCard}>
            <PromiseRow />
          </View>

          {/* A spec sheet reads as "Product details"; free text as prose. */}
          <ProductDetailsCard
            title={details.some((b) => b.type === 'row') ? 'Product details' : 'About this product'}
            blocks={details}
          />

          <CollapsibleCard title="Shipping & returns" blocks={shippingBlocks} />

          {product.category?.name ? (
            <Pressable
              style={styles.categoryLink}
              onPress={() => router.push(`/category/${product.category?.slug}`)}
              accessibilityRole="button"
            >
              <Text style={styles.more} numberOfLines={1}>
                More in {product.category.name}
              </Text>
              <Icon name="forward" size={15} color={colors.primaryDeep} />
            </Pressable>
          ) : null}
        </View>

        {/* Same-category products from the server, or other products from the store. */}
        {suggestions.length > 0 ? (
          <View style={styles.related}>
            <SectionHeader title="You might also like" />
            <FlatList
              horizontal
              data={suggestions}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedRow}
              renderItem={({ item, index }) => (
                <Appear index={index} from="right" limit={6}>
                  <ProductCard product={item} width={railCardWidth} />
                </Appear>
              )}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky action bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          onPress={onSave}
          disabled={saveMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={savedEntry ? 'Remove from saved' : 'Save for later'}
          accessibilityState={{ selected: !!savedEntry }}
          style={({ pressed }) => [styles.saveBtn, savedEntry && styles.saveBtnOn, pressed && styles.pressed]}
        >
          <Icon
            name="wishlist"
            size={22}
            filled={!!savedEntry}
            color={savedEntry ? colors.primary : colors.text}
          />
        </Pressable>

        {!inStock ? (
          <Button label="Out of stock" disabled style={styles.cartBtn} />
        ) : line ? (
          <>
            <QtyStepper
              size="lg"
              qty={line.quantity}
              busy={cartBusy}
              plusDisabled={line.quantity >= stock}
              minusLabel={line.quantity - 1 < floor ? 'Remove from cart' : 'Decrease quantity'}
              onMinus={() =>
                runCart(() =>
                  line.quantity - 1 < floor ? removeItem(line) : updateItem(line, line.quantity - 1),
                )
              }
              onPlus={() => runCart(() => updateItem(line, line.quantity + 1))}
            />
            <Button
              label="View cart"
              variant="outline"
              onPress={() => router.push('/basket')}
              style={styles.cartBtn}
            />
          </>
        ) : (
          <Button label="Add to cart" onPress={onAddToCart} loading={cartBusy} style={styles.cartBtn} />
        )}
      </View>
    </>
  );
}

/** The studio backdrop: a soft white glow on cool grey. */
const STAGE = '#EDF1F6';
// closest-side: the glow has fully faded before it reaches a page edge, so
// there is no seam between pages or against the backdrop above them.
const STAGE_GLOW = 'radial-gradient(circle closest-side at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  muted: { ...typography.small, color: colors.textMuted },
  stage: { backgroundColor: STAGE, paddingBottom: spacing.xxl + spacing.sm },
  page: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: STAGE,
    experimental_backgroundImage: STAGE_GLOW,
  },
  galleryImage: { width: '80%', height: '92%', mixBlendMode: 'multiply' },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    position: 'absolute',
    bottom: spacing.xxl + 4,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  sheet: {
    marginTop: -spacing.xl,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    ...shadow.card,
  },
  body: { padding: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  brand: { ...typography.overline, color: colors.textMuted },
  name: { fontFamily: fonts.displayBold, fontSize: 21, lineHeight: 28, letterSpacing: -0.4, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  packChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  packSize: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textSecondary },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  price: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -1, color: colors.text },
  strike: { ...typography.body, color: colors.textMuted, textDecorationLine: 'line-through' },
  offBadge: {
    backgroundColor: colors.deal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  offText: { fontFamily: fonts.display, fontSize: 12, color: colors.textInverse },
  statusRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
  savingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  saving: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.success },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stock: { ...typography.smallStrong },
  inStock: { color: colors.success },
  outStock: { color: colors.error },
  block: { marginTop: spacing.md, gap: spacing.sm },
  blockTitle: { ...typography.h3, color: colors.text },
  variantWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  variant: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm + 2,
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
  variantPrice: { fontFamily: fonts.displayBold, fontSize: 12, color: colors.textMuted },
  promiseCard: { backgroundColor: colors.surface, borderRadius: radius.lg, ...shadow.card },
  more: { flexShrink: 1, fontFamily: fonts.displayBold, fontSize: 13.5, color: colors.primaryDeep },
  categoryLink: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  related: { paddingTop: spacing.lg, paddingBottom: spacing.xl },
  relatedRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xs },
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
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.bar,
  },
  // Icon-only, so the buying controls get the width.
  saveBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnOn: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft },
  // Shares the row with the heart and the stepper, so the default 24dp side
  // padding left too little room for the label on a 360dp phone.
  cartBtn: { flex: 1, paddingHorizontal: spacing.sm },
  pressed: { opacity: 0.85 },
});
