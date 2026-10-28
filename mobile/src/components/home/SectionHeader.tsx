import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStoreVertical } from '../../context/StoreVerticalContext';
import { colors, fonts, spacing } from '../../theme';
import { storeTheme, type CategoryGlyph } from '../../theme/stores';
import { Icon } from '../Icon';
import { PressableScale } from '../motion/PressableScale';

/**
 * A small symbol for each kind of section, matched from its title so the
 * admin's sections (whatever they are named) pick one up without code changes.
 * First match wins; an unmatched title simply has no symbol.
 */
const SECTION_ICONS: [RegExp, CategoryGlyph][] = [
  [/featured|collection|pick/i, 'creation'],
  [/best ?sell/i, 'trophy-outline'],
  [/trend|popular/i, 'fire'],
  [/new|latest|arrival|fresh/i, 'new-box'],
  [/categor/i, 'shape-outline'],
  [/store/i, 'storefront-outline'],
  [/price|budget|under/i, 'tag-outline'],
  [/deal|offer|sale/i, 'lightning-bolt'],
];

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
  const theme = storeTheme(vertical?.name);
  const accent = theme.solid;
  const glyph = SECTION_ICONS.find(([re]) => re.test(title))?.[1];

  return (
    <View style={styles.row}>
      {glyph ? (
        <View style={[styles.chip, { backgroundColor: theme.soft }]}>
          <MaterialCommunityIcons name={glyph} size={16} color={accent} />
        </View>
      ) : null}
      <View style={styles.titles}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onSeeAll ? (
        <PressableScale onPress={onSeeAll} hitSlop={8} accessibilityRole="button" scaleTo={0.92} style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: accent }]}>See all</Text>
          <Icon name="forward" size={14} color={accent} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  chip: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.3, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 2 },
  seeAllText: { fontFamily: fonts.semibold, fontSize: 13 },
});
