import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { catalogue } from '../../api/services';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, radius, spacing } from '../../theme';
import { DOT_GRID, storeMesh, storeTheme, type StoreTheme } from '../../theme/stores';
import { HomeAccountButton } from '../HomeAccountButton';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { PressableScale } from '../motion/PressableScale';

/** How far the page's content sheet slides up over the bottom of the header. */
export const SHEET_OVERLAP = 26;

/**
 * The top of Home, edge to edge and under the status bar: the current store's
 * colour mesh, the logo, which store you are in with two of its newest
 * products floating beside the name, search, and one tap to any other store.
 *
 * Switching store cross-fades the whole mesh, so the change is felt as well
 * as seen. The products are real catalogue items — the header shows what the
 * store actually sells rather than stock art.
 */
export function HomeHeader({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vertical, verticals, verticalId, verticalParam, select } = useStoreVertical();
  const theme = storeTheme(vertical?.name);
  const hint = useRotatingHint(theme.hints);

  // Keep the outgoing mesh underneath while the new one fades in.
  const [under, setUnder] = useState<StoreTheme>(theme);
  useEffect(() => {
    const t = setTimeout(() => setUnder(theme), 460);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.key, theme.short]);

  const showcaseQ = useQuery({
    queryKey: ['products', 'showcase', verticalId],
    queryFn: () => catalogue.products({ limit: 8, sort: 'createdAt', order: 'desc', ...verticalParam }),
    staleTime: 5 * 60_000,
  });
  const picks = (showcaseQ.data?.products ?? [])
    .map((p) => p.image)
    .filter((uri): uri is string => !!uri)
    .slice(0, 2);

  const choose = (id: string | null) => {
    if (id === (vertical?.id ?? null)) return;
    Haptics.selectionAsync().catch(() => {});
    select(id);
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]} onLayout={onLayout}>
      {/* Above the header, so an iOS pull-down bounce shows colour, not a gap. */}
      <View style={[styles.overscroll, { backgroundColor: under.gradient[0] }]} />
      <View style={[StyleSheet.absoluteFill, { experimental_backgroundImage: storeMesh(under) }]} />
      <Animated.View
        key={`mesh-${theme.key}-${theme.short}`}
        entering={FadeIn.duration(420)}
        style={[StyleSheet.absoluteFill, { experimental_backgroundImage: storeMesh(theme) }]}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, DOT_GRID, styles.dots]} />

      <View style={styles.topRow}>
        <View style={styles.logoChip}>
          <Logo height={32} />
        </View>
        <HomeAccountButton tone="onColor" accent={theme.solid} />
      </View>

      <View style={styles.heroRow}>
        <View style={styles.heroText}>
          <Text style={styles.overline}>SHOPPING IN</Text>
          <Animated.Text
            key={`name-${theme.key}-${theme.short}`}
            entering={FadeIn.duration(320)}
            style={styles.title}
            numberOfLines={2}
          >
            {vertical ? vertical.name : 'All Genuine stores'}
          </Animated.Text>
          <Text style={styles.tagline} numberOfLines={2}>
            {theme.tagline}
          </Text>
        </View>
        {picks.length === 2 ? <Showcase key={verticalId ?? 'all'} images={picks} /> : null}
      </View>

      <PressableScale
        scaleTo={0.98}
        onPress={() => router.navigate('/search')}
        accessibilityRole="search"
        accessibilityLabel="Search products"
        style={styles.search}
      >
        <Icon name="search" size={20} color={theme.solid} />
        <Text style={styles.searchLead}>Search for </Text>
        <View style={styles.hintBox}>
          <Animated.Text
            key={hint}
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(150)}
            style={styles.hint}
            numberOfLines={1}
          >
            &lsquo;{hint}&rsquo;
          </Animated.Text>
        </View>
      </PressableScale>

      {verticals.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipStrip}
          contentContainerStyle={styles.chips}
        >
          <StoreChip label="All" icon="grid" active={!vertical} theme={theme} onPress={() => choose(null)} />
          {verticals.map((v) => {
            const t = storeTheme(v.name);
            return (
              <StoreChip
                key={v.id}
                label={t.short}
                icon={t.icon}
                active={vertical?.id === v.id}
                theme={theme}
                onPress={() => choose(v.id)}
              />
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

/** Two product photos on white cards, tilted and gently bobbing. */
function Showcase({ images }: { images: string[] }) {
  return (
    <View style={styles.showcase} pointerEvents="none">
      <FloatCard uri={images[1]} size={66} rotate={9} delay={500} style={styles.cardBack} />
      <FloatCard uri={images[0]} size={82} rotate={-7} delay={0} style={styles.cardFront} />
    </View>
  );
}

function FloatCard({
  uri,
  size,
  rotate,
  delay,
  style,
}: {
  uri: string;
  size: number;
  rotate: number;
  delay: number;
  style: object;
}) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [t, delay, reduceMotion]);
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: -5 * t.value }, { rotate: `${rotate + t.value * 2}deg` }],
  }));
  return (
    <Animated.View
      entering={FadeIn.duration(500).delay(delay / 2)}
      style={[styles.floatCard, { width: size, height: size }, style, animated]}
    >
      <Image source={uri} style={styles.floatImage} contentFit="contain" transition={200} />
    </Animated.View>
  );
}

function StoreChip({
  label,
  icon,
  active,
  theme,
  onPress,
}: {
  label: string;
  icon: StoreTheme['icon'];
  active: boolean;
  theme: StoreTheme;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label === 'All' ? 'All Genuine stores' : `Genuine ${label}`}
      scaleTo={0.92}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Icon name={icon} size={16} color={active ? theme.solid : colors.textInverse} filled={active} />
      <Text style={[styles.chipText, active && { color: theme.ink }]}>{label}</Text>
    </PressableScale>
  );
}

/** Cycles the search placeholder through a store's examples. */
export function useRotatingHint(hints: string[]): string {
  const [i, setI] = useState(0);
  // Keyed on the contents: the theme (and so this array) is rebuilt on every
  // render, and keying on identity would restart the timer each time.
  const key = hints.join('|');
  useEffect(() => {
    setI(0);
    const count = key.split('|').length;
    if (count < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % count), 2600);
    return () => clearInterval(t);
  }, [key]);
  return hints[i % hints.length] ?? 'products';
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg + SHEET_OVERLAP,
  },
  overscroll: { position: 'absolute', left: 0, right: 0, top: -600, height: 600 },
  dots: { opacity: 0.7 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoChip: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    boxShadow: '0px 6px 16px rgba(2, 6, 23, 0.18)',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, minHeight: 104 },
  heroText: { flex: 1, paddingRight: spacing.sm },
  overline: { fontFamily: fonts.displayBold, fontSize: 10.5, letterSpacing: 1.6, color: 'rgba(255,255,255,0.72)' },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: colors.textInverse,
    marginTop: 4,
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.86)',
    marginTop: 6,
  },
  showcase: { width: 128, height: 112 },
  floatCard: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 8,
    boxShadow: '0px 10px 24px rgba(2, 6, 23, 0.28)',
  },
  cardBack: { right: 0, top: 0 },
  cardFront: { left: 0, bottom: 0 },
  floatImage: { width: '100%', height: '100%' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    boxShadow: '0px 10px 24px rgba(2, 6, 23, 0.20)',
  },
  searchLead: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginLeft: spacing.sm },
  hintBox: { flex: 1, height: 22, justifyContent: 'center' },
  hint: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  chipStrip: { marginHorizontal: -spacing.lg, marginTop: spacing.md },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  chipActive: { backgroundColor: colors.surface, borderColor: colors.surface },
  chipText: { fontFamily: fonts.displayBold, fontSize: 13.5, color: colors.textInverse },
});
