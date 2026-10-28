import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radius, spacing } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './motion/PressableScale';

/**
 * Top-right of the home screen, opposite the logo, which otherwise sat empty.
 *
 * Signed in, it is the shopper's initial — the profile shortcut quick-commerce
 * apps put in this corner. Signed out, it is a plain "Sign in" button, the one
 * prompt on Home that leads to an account (and so to saved items, order
 * tracking and checkout).
 *
 * `onColor` is for the coloured header: solid white, so it reads on any
 * store's colour, with `accent` (the store colour) for the icon and initial.
 */
export function HomeAccountButton({
  tone = 'light',
  accent = colors.primary,
}: {
  tone?: 'light' | 'onColor';
  accent?: string;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const onColor = tone === 'onColor';

  if (!isAuthenticated) {
    return (
      <PressableScale
        onPress={() => router.push('/auth/login')}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        hitSlop={6}
        scaleTo={0.94}
        style={[styles.signIn, onColor && styles.signInOnColor]}
      >
        <Icon name="account" size={16} color={onColor ? accent : colors.primary} />
        <Text style={[styles.signInText, onColor && styles.signInTextOnColor]}>Sign in</Text>
      </PressableScale>
    );
  }

  const initial = (user?.name?.trim() || user?.email || '?').charAt(0).toUpperCase();

  return (
    <PressableScale
      onPress={() => router.navigate('/account')}
      accessibilityRole="button"
      accessibilityLabel={`Your account${user?.name ? `, ${user.name}` : ''}`}
      hitSlop={6}
      scaleTo={0.92}
      style={[styles.avatar, onColor && styles.avatarOnColor]}
    >
      <Text style={[styles.initial, { color: onColor ? accent : colors.primary }]}>{initial}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  signIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.surface,
  },
  // Exact half-height radii: soft shadows on a 999 "pill" radius draw square.
  signInOnColor: {
    borderRadius: 19,
    borderWidth: 0,
    paddingHorizontal: 14,
    boxShadow: '0px 6px 16px rgba(2, 6, 23, 0.18)',
  },
  signInText: { fontFamily: fonts.displayBold, fontSize: 14, color: colors.primary },
  signInTextOnColor: { color: colors.text },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOnColor: {
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 0,
    boxShadow: '0px 6px 16px rgba(2, 6, 23, 0.18)',
  },
  initial: { fontFamily: fonts.display, fontSize: 18 },
});
