import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radius, spacing } from '../theme';
import { Icon } from './Icon';

/**
 * Top-right of the home screen, opposite the logo, which otherwise sat empty.
 *
 * Signed in, it is the shopper's initial — the profile shortcut quick-commerce
 * apps put in this corner. Signed out, it is a plain "Sign in" button, the one
 * prompt on Home that leads to an account (and so to saved items, order
 * tracking and checkout).
 */
export function HomeAccountButton() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Pressable
        onPress={() => router.push('/auth/login')}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        hitSlop={6}
        style={({ pressed }) => [styles.signIn, pressed && styles.pressed]}
      >
        <Icon name="account" size={16} color={colors.primary} />
        <Text style={styles.signInText}>Sign in</Text>
      </Pressable>
    );
  }

  const initial = (user?.name?.trim() || user?.email || '?').charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={() => router.navigate('/account')}
      accessibilityRole="button"
      accessibilityLabel={`Your account${user?.name ? `, ${user.name}` : ''}`}
      hitSlop={6}
      style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
    >
      <Text style={styles.initial}>{initial}</Text>
    </Pressable>
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
  signInText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  pressed: { opacity: 0.8 },
});
