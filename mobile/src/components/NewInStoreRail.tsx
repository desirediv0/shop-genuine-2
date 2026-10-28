import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { catalogue } from '../api/services';
import { useStoreVertical } from '../context/StoreVerticalContext';
import { useProductLayout } from '../hooks/useProductLayout';
import { spacing } from '../theme';
import { ProductCard } from './ProductCard';
import { Appear } from './motion/Appear';
import { SectionHeader } from './home/SectionHeader';

/**
 * The newest products in the current store, as a swipeable row. Shown under
 * empty states (empty cart, nothing saved) so those screens offer something to
 * buy instead of a dead end. Titled for what it is — newest first — since the
 * app has no recommendation engine to back a "for you" claim.
 */
export function NewInStoreRail() {
  const router = useRouter();
  const { verticalId, verticalParam } = useStoreVertical();
  const { railCardWidth } = useProductLayout();

  const query = useQuery({
    queryKey: ['products', 'newest', verticalId],
    queryFn: () => catalogue.products({ limit: 12, sort: 'createdAt', order: 'desc', ...verticalParam }),
  });

  const products = query.data?.products ?? [];
  if (!products.length) return null;

  return (
    <View style={styles.wrap}>
      <SectionHeader title="New in store" onSeeAll={() => router.navigate('/search')} />
      <FlatList
        horizontal
        data={products}
        keyExtractor={(p) => p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        renderItem={({ item, index }) => (
          <Appear index={index} from="right" limit={6}>
            <ProductCard product={item} width={railCardWidth} />
          </Appear>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', marginTop: spacing.xl },
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xs },
});
