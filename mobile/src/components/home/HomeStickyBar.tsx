import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, radius, spacing } from '../../theme';
import { storeTheme } from '../../theme/stores';
import { HomeAccountButton } from '../HomeAccountButton';
import { Icon } from '../Icon';
import { PressableScale } from '../motion/PressableScale';
import { useRotatingHint } from './HomeHeader';

/** Height of the bar below the status bar. */
export const STICKY_BAR_HEIGHT = 62;

/**
 * Slides in once the coloured header has scrolled away, so search is always
 * one tap off and the status bar never sits over bare product photos.
 * `progress` runs 0 → 1 as the header leaves; `interactive` is its settled
 * state, so the hidden bar never swallows taps meant for the page.
 */
export function HomeStickyBar({
  progress,
  interactive,
}: {
  progress: SharedValue<number>;
  interactive: boolean;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { vertical } = useStoreVertical();
  const theme = storeTheme(vertical?.name);
  const hint = useRotatingHint(theme.hints);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -14 }],
  }));

  return (
    <Animated.View
      pointerEvents={interactive ? 'auto' : 'none'}
      style={[styles.bar, { paddingTop: insets.top + 8 }, animated]}
    >
      <PressableScale
        scaleTo={0.98}
        onPress={() => router.navigate('/search')}
        accessibilityRole="search"
        accessibilityLabel="Search products"
        style={styles.search}
      >
        <Icon name="search" size={18} color={theme.solid} />
        <Text style={styles.searchText} numberOfLines={1}>
          Search for <Text style={styles.hint}>&lsquo;{hint}&rsquo;</Text>
        </Text>
      </PressableScale>
      <HomeAccountButton />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    boxShadow: '0px 6px 20px rgba(15, 23, 42, 0.08)',
  },
  search: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 14,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.surfaceAlt,
  },
  searchText: { flex: 1, fontFamily: fonts.regular, fontSize: 14.5, color: colors.textMuted },
  hint: { fontFamily: fonts.semibold, color: colors.text },
});
