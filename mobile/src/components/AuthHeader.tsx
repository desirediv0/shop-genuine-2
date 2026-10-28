import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing, typography } from '../theme';
import { useStoreVertical } from '../context/StoreVerticalContext';
import { storeTheme } from '../theme/stores';
import { Icon } from './Icon';
import { Logo } from './Logo';

/** "Grocery", "Grocery and Cosmetics", "Grocery, Nutrition and Cosmetics". */
function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * Top of the sign-in and sign-up screens. The logo stays on the light page,
 * where both its colours read, and a card underneath says what the account is
 * for: one sign-in across every Genuine store.
 *
 * The stores come from the server's active list, not a fixed four: Nutrition
 * and Pharmacy were switched off in the admin, and the card went on promising
 * them. Before the list has loaded it just says "every Genuine store".
 */
export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { verticals } = useStoreVertical();
  const stores = verticals.map((v) => storeTheme(v.name));
  const names = listNames(stores.map((s) => s.short));

  return (
    <View>
      {/* A soft glow of the logo's own orange and blue behind it. */}
      <View pointerEvents="none" style={styles.glow} />
      <Logo height={56} style={styles.logo} />

      <View style={styles.card}>
        <View style={styles.bubbles}>
          {(stores.length ? stores : [storeTheme(null)]).map((s, i, all) => (
            <View
              key={`${s.key}-${i}`}
              style={[
                styles.bubble,
                { backgroundColor: s.soft, marginLeft: i === 0 ? 0 : -8, zIndex: all.length - i },
              ]}
            >
              <Icon name={s.icon} size={16} color={s.solid} />
            </View>
          ))}
        </View>
        <Text style={styles.cardText}>
          One account for{' '}
          <Text style={styles.cardStrong}>{names || 'every Genuine store'}</Text>
        </Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Placed low enough in the box that each glow has faded out before the top
  // edge, so there is no cut line under the header.
  glow: {
    position: 'absolute',
    top: -spacing.lg,
    left: -spacing.lg,
    right: -spacing.lg,
    height: 440,
    experimental_backgroundImage: [
      'radial-gradient(circle at 12% 58%, rgba(249, 115, 22, 0.22) 0%, rgba(249, 115, 22, 0) 40%)',
      'radial-gradient(circle at 92% 50%, rgba(29, 78, 216, 0.18) 0%, rgba(29, 78, 216, 0) 40%)',
    ].join(', '),
  },
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
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
});
