import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlist as wishlistApi } from '../../src/api/services';
import { Icon } from '../../src/components/Icon';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useWishlist } from '../../src/hooks/useWishlist';
import { useToast } from '../../src/context/ToastContext';
import { colors, radius, shadow, spacing, typography } from '../../src/theme';
import { formatPrice } from '../../src/utils/format';

export default function WishlistScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useWishlist();

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
      <EmptyState
        icon="wishlist"
        title="Sign in to see your saved items"
        message="Saved items sync across your devices."
        actionLabel="Sign in"
        onAction={() => router.push('/auth/login')}
      />
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
      <EmptyState
        icon="wishlist"
        title="Nothing saved yet"
        message="Tap Save on any product to keep it here."
        actionLabel="Browse products"
        onAction={() => router.push('/search')}
      />
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() => item.slug && router.push(`/product/${item.slug}`)}
          accessibilityRole="button"
        >
          <Image source={item.image ?? undefined} style={styles.thumb} contentFit="cover" />
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            {item.price != null ? (
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => remove.mutate(item.id)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name} from saved items`}
            style={styles.removeBtn}
          >
            <Icon name="trash" size={16} color={colors.textMuted} />
          </Pressable>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  thumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  body: { flex: 1, gap: 3 },
  name: { ...typography.smallStrong, color: colors.text },
  price: { ...typography.price, color: colors.text },
  removeBtn: { padding: spacing.sm },
});
