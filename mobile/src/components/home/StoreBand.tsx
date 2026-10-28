import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, radius, spacing } from '../../theme';
import { DOT_GRID, storeMesh, storeTheme, type StoreTheme } from '../../theme/stores';
import { Icon } from '../Icon';
import { PressableScale } from '../motion/PressableScale';

/**
 * The faint store mark drifts and turns a few degrees, very slowly, so the
 * biggest block on Home has a little life without pulling the eye.
 */
function DriftingMark({ icon }: { icon: StoreTheme['icon'] }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t, reduceMotion]);
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: t.value * 8 }, { rotate: `${-12 + t.value * 6}deg` }],
  }));
  return (
    <Animated.View style={[styles.watermark, animated]} pointerEvents="none">
      <Icon name={icon} size={150} color="rgba(255,255,255,0.13)" filled />
    </Animated.View>
  );
}

/**
 * The coloured top of Search, edge to edge and under the status bar like
 * Home's header: the current store's colour mesh, a faint drifting store mark,
 * whatever the screen puts inside, and a row of chips to jump to any other
 * store. The colour cross-fades when the store changes.
 */
export function StoreBand({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { vertical, verticals, select } = useStoreVertical();
  const theme = storeTheme(vertical?.name);

  // Keep the outgoing gradient underneath while the new one fades in, so a
  // switch is a colour cross-fade rather than a flash.
  const [under, setUnder] = useState<StoreTheme>(theme);
  useEffect(() => {
    const t = setTimeout(() => setUnder(theme), 420);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.key, theme.short]);

  const choose = (id: string | null) => {
    if (id === (vertical?.id ?? null)) return;
    Haptics.selectionAsync().catch(() => {});
    select(id);
  };

  return (
    <View style={[styles.band, { paddingTop: insets.top }]}>
      <View style={[StyleSheet.absoluteFill, { experimental_backgroundImage: storeMesh(under) }]} />
      <Animated.View
        key={`bg-${theme.key}-${theme.short}`}
        entering={FadeIn.duration(380)}
        style={[StyleSheet.absoluteFill, { experimental_backgroundImage: storeMesh(theme) }]}
      >
        <DriftingMark icon={theme.icon} />
      </Animated.View>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, DOT_GRID, styles.dots]} />

      <View style={styles.content}>{children}</View>

      {verticals.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
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
      ) : (
        <View style={styles.chipsSpacer} />
      )}
    </View>
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
      <Icon name={icon} size={15} color={active ? theme.solid : colors.textInverse} filled={active} />
      <Text style={[styles.chipText, active && { color: theme.ink }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  band: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  dots: { opacity: 0.6 },
  watermark: { position: 'absolute', right: -26, bottom: -30 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg + 2 },
  chipsSpacer: { height: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  chipActive: { backgroundColor: colors.surface, borderColor: colors.surface },
  chipText: { fontFamily: fonts.displayBold, fontSize: 13.5, color: colors.textInverse },
});

/** Shared text styles for whatever sits inside the band. */
export const bandText = StyleSheet.create({
  overline: { fontFamily: fonts.displayBold, fontSize: 10.5, letterSpacing: 1.6, color: 'rgba(255,255,255,0.72)' },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.7, color: colors.textInverse, marginTop: 2 },
  tagline: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.86)', marginTop: 2 },
});
