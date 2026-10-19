import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing, typography } from '../theme';
import { storeTheme } from '../theme/stores';
import { Icon } from './Icon';
import { Logo } from './Logo';

/** One bubble per sub-brand, in each store's own colour. */
const STORES = ['Genuine Grocery', 'Genuine Nutrition', 'Genuine Pharmacy', 'Genuine Cosmetics'].map(
  (name) => storeTheme(name),
);

/**
 * Top of the sign-in and sign-up screens. The logo stays on the light page,
 * where both its colours read, and a card underneath says what the account is
 * for: one sign-in across all four Genuine stores.
 */
export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Logo height={56} style={styles.logo} />

      <View style={styles.card}>
        <View style={styles.bubbles}>
          {STORES.map((s, i) => (
            <View
              key={s.key}
              style={[
                styles.bubble,
                { backgroundColor: s.soft, marginLeft: i === 0 ? 0 : -8, zIndex: STORES.length - i },
              ]}
            >
              <Icon name={s.icon} size={16} color={s.solid} />
            </View>
          ))}
        </View>
        <Text style={styles.cardText}>
          One account for{' '}
          <Text style={styles.cardStrong}>Grocery, Nutrition, Pharmacy and Cosmetics</Text>
        </Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { marginTop: spacing.lg, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  bubbles: { flexDirection: 'row' },
  bubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  cardText: { ...typography.small, color: colors.textMuted, flex: 1, lineHeight: 18 },
  cardStrong: { fontFamily: fonts.semibold, color: colors.text },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
});
