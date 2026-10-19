import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, spacing } from '../../theme';
import { storeTheme } from '../../theme/stores';
import { Icon } from '../Icon';

/**
 * A section title with an optional "See all", the link drawn in the current
 * store's colour so each store's Home carries its identity below the hero too.
 */
export function SectionHeader({
  title,
  subtitle,
  onSeeAll,
}: {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}) {
  const { vertical } = useStoreVertical();
  const accent = storeTheme(vertical?.name).solid;

  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button" style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: accent }]}>See all</Text>
          <Icon name="forward" size={14} color={accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  titles: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.3, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 2 },
  seeAllText: { fontFamily: fonts.semibold, fontSize: 13 },
});
