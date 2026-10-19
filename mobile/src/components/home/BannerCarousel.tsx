import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, shadow, spacing } from '../../theme';
import type { Banner } from '../../types';

const ADVANCE_MS = 4500;

/**
 * Promotional banners, swipeable, advancing on their own every few seconds
 * with dots to show where you are. A single banner just sits still.
 *
 * Each slide is a full-width page with the gutter inside it, so paging lands
 * exactly — a snap interval narrower than the screen left a sliver of the
 * previous banner showing at the edge.
 */
export function BannerCarousel({
  items,
  onPress,
}: {
  items: { banner: Banner; art: string }[];
  onPress: (banner: Banner) => void;
}) {
  const { width } = useWindowDimensions();
  const list = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      if (dragging.current) return;
      setIndex((current) => {
        const next = (current + 1) % items.length;
        list.current?.scrollToOffset({ offset: next * width, animated: true });
        return next;
      });
    }, ADVANCE_MS);
    return () => clearInterval(t);
  }, [items.length, width]);

  // Dots follow what is actually on screen, whether it got there by swipe or
  // by the timer.
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index && i >= 0 && i < items.length) setIndex(i);
  };

  return (
    <View>
      <FlatList
        ref={list}
        horizontal
        pagingEnabled
        data={items}
        keyExtractor={(b) => b.banner.id}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        onScrollBeginDrag={() => {
          dragging.current = true;
        }}
        onMomentumScrollEnd={() => {
          dragging.current = false;
        }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <Pressable
              onPress={() => onPress(item.banner)}
              accessibilityRole="button"
              accessibilityLabel={item.banner.title ?? 'Promotion'}
              style={styles.slide}
            >
              <Image source={item.art} style={styles.image} contentFit="cover" transition={200} />
            </Pressable>
          </View>
        )}
      />
      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((b, i) => (
            <View key={b.banner.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: spacing.lg, paddingBottom: 4 },
  slide: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, ...shadow.card },
  // Matches the uploaded artwork (1870x841), so nothing is cropped.
  image: { width: '100%', aspectRatio: 2.224 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 18, backgroundColor: colors.primary },
});
