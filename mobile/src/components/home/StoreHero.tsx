import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { storeTheme } from '../../theme/stores';
import { Icon } from '../Icon';
import { bandText, StoreBand } from './StoreBand';
import { PressableScale } from '../motion/PressableScale';

/**
 * The top of Home: which Genuine store you are in, a search box, and one tap to
 * any other store. The old grey bar hid the app's most distinctive feature —
 * four stores in one — behind a picker.
 */
export function StoreHero() {
  const router = useRouter();
  const { vertical } = useStoreVertical();
  const theme = storeTheme(vertical?.name);
  const hint = useRotatingHint(theme.hints);

  return (
    <StoreBand>
      <Text style={bandText.overline}>SHOPPING IN</Text>
      <Animated.Text key={`name-${theme.short}`} entering={FadeIn.duration(300)} style={bandText.title}>
        {vertical ? vertical.name : 'All Genuine stores'}
      </Animated.Text>
      <Text style={bandText.tagline}>{theme.tagline}</Text>

      <PressableScale
        scaleTo={0.98}
        onPress={() => router.navigate('/search')}
        accessibilityRole="search"
        accessibilityLabel="Search products"
        style={styles.search}
      >
        <Icon name="search" size={19} color={theme.solid} />
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
    </StoreBand>
  );
}

/** Cycles the search placeholder through a store's examples. */
function useRotatingHint(hints: string[]): string {
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    height: 50,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  searchLead: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted, marginLeft: spacing.sm },
  hintBox: { flex: 1, height: 22, justifyContent: 'center' },
  hint: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
});
