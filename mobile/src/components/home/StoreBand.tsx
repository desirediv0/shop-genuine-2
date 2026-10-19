import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { storeTheme, type StoreTheme } from '../../theme/stores';
import { Icon } from '../Icon';

/**
 * The coloured store panel shared by Home and Search: the current store's
 * gradient, a faint store mark for depth, whatever the screen puts inside, and
 * a row of chips to jump to any other store. The colour cross-fades when the
 * store changes, so the switch is felt as well as seen.
 */
export function StoreBand({ children }: { children: React.ReactNode }) {
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
    <View style={styles.band}>
      <LinearGradient colors={under.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Animated.View key={`bg-${theme.key}-${theme.short}`} entering={FadeIn.duration(380)} style={StyleSheet.absoluteFill}>
        <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.watermark} pointerEvents="none">
          <Icon name={theme.icon} size={150} color="rgba(255,255,255,0.13)" filled />
        </View>
      </Animated.View>

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
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label === 'All' ? 'All Genuine stores' : `Genuine ${label}`}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Icon name={icon} size={15} color={active ? theme.solid : colors.textInverse} filled={active} />
      <Text style={[styles.chipText, active && { color: theme.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  band: { marginHorizontal: spacing.lg, borderRadius: radius.xl, overflow: 'hidden', ...shadow.raised },
  watermark: { position: 'absolute', right: -26, top: -18, transform: [{ rotate: '-12deg' }] },
  content: { paddingHorizontal: spacing.lg + 2, paddingTop: spacing.lg + 2 },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg + 2, paddingTop: spacing.md, paddingBottom: spacing.lg },
  chipsSpacer: { height: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  chipActive: { backgroundColor: colors.surface, borderColor: colors.surface },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textInverse },
  pressed: { opacity: 0.85 },
});

/** Shared text styles for whatever sits inside the band. */
export const bandText = StyleSheet.create({
  overline: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.4, color: 'rgba(255,255,255,0.72)' },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, color: colors.textInverse, marginTop: 2 },
  tagline: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.86)', marginTop: 2 },
});
