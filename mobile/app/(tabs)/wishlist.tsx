import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlist as wishlistApi } from '../../src/api/services';
import { Backdrop } from '../../src/components/decor/Backdrop';
import { Appear } from '../../src/components/motion/Appear';
import { PressableScale } from '../../src/components/motion/PressableScale';
import { Icon } from '../../src/components/Icon';
import { NewInStoreRail } from '../../src/components/NewInStoreRail';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useProductLayout } from '../../src/hooks/useProductLayout';
import { useWishlist } from '../../src/hooks/useWishlist';
import { useToast } from '../../src/context/ToastContext';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import { storeTheme } from '../../src/theme/stores';
import { discountPercent, formatPrice, toNumber } from '../../src/utils/format';

export default function WishlistScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useWishlist();
  const { columns, gridCardWidth: cardWidth } = useProductLayout();
  const { vertical } = useStoreVertical();
  const theme = storeTheme(vertical?.name);

  const remove = useMutation({
    mutationFn: (id: string) => wishlistApi.remove(id),
    onSuccess: () => {
      toast('Removed from wishlist', 'success');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.screen}>
        <Backdrop tint={theme} />
        <EmptyState
          icon="wishlist"
          tint={theme}
          title="Sign in to see your saved items"
          message="Saved items sync across your devices."
          actionLabel="Sign in"
          onAction={() => router.push('/auth/login')}
          footer={<NewInStoreRail />}
        />
      </View>
    );
  }

  if (query.isLoading) return <LoadingState label="Loading wishlist…" />;
  if (query.isError) {
    return (
      <ErrorState message={(query.error as Error)?.message} onRetry={() => query.refetch()} />
    );
  }

  const items = query.data?.wishlistItems ?? [];

  if (!items.length) {
    return (
      <View style={styles.screen}>
        <Backdrop tint={theme} />
        <EmptyState
          icon="wishlist"
          tint={theme}
          title="Nothing saved yet"
          message="Tap the heart on any product to keep it here."
          actionLabel="Browse products"
          onAction={() => router.push('/search')}
          footer={<NewInStoreRail />}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Backdrop tint={theme} />
      <FlatList
        // numColumns cannot change on a mounted list; remount if it does.
        key={columns}
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={columns}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.count}>
            {items.length} saved {items.length === 1 ? 'item' : 'items'}
          </Text>
        }
        renderItem={({ item, index }) => {
          const price = item.price != null ? toNumber(item.price) : null;
          const regular = item.regularPrice != null ? toNumber(item.regularPrice) : null;
          const off = price != null && regular != null ? discountPercent(regular, price) : 0;
          return (
            // Same card language as everywhere else. No ADD here: the saved-items
            // endpoint sends no stock levels, so a quick add could not tell what
            // is buyable — the product page can, and is one tap away.
            <Appear index={index}>
              <PressableScale
                scaleTo={0.97}
                style={[styles.card, { width: cardWidth }]}
                onPress={() => item.slug && router.push(`/product/${item.slug}`)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}${price != null ? `, ${formatPrice(price)}` : ''}`}
              >
                <View style={styles.imageWrap}>
                  <Image source={item.image ?? undefined} style={styles.image} contentFit="contain" transition={200} />
                  {off > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{off}% OFF</Text>
                    </View>
                  ) : null}
                  <Pressable
                    onPress={() => remove.mutate(item.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.name} from saved items`}
                    style={styles.heart}
                  >
                    <Icon name="wishlist" size={16} color={colors.primary} filled />
                  </Pressable>
                </View>
                <View style={styles.body}>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {price != null ? (
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{formatPrice(price)}</Text>
                      {off > 0 && regular != null ? <Text style={styles.strike}>{formatPrice(regular)}</Text> : null}
                    </View>
                  ) : null}
                </View>
              </PressableScale>
            </Appear>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  // No background of its own, so the <Backdrop> behind it shows through.
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  column: { gap: spacing.sm },
  count: { ...typography.small, color: colors.textMuted, marginBottom: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  imageWrap: { aspectRatio: 1, padding: spacing.sm, backgroundColor: colors.surface },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.deal,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 9, lineHeight: 12, color: colors.textInverse },
  heart: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: spacing.sm, paddingTop: 6, paddingBottom: 10, gap: 2 },
  name: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, minHeight: 32, color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 5, marginTop: 2 },
  price: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  strike: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, textDecorationLine: 'line-through' },
});
