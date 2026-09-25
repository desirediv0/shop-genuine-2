import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { auth as authApi, referrals } from '../../src/api/services';
import { Button } from '../../src/components/Button';
import { DeleteAccountSheet } from '../../src/components/DeleteAccountSheet';
import { EmptyState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const referralQ = useQuery({
    queryKey: ['referralCode'],
    queryFn: () => referrals.myCode(),
    enabled: isAuthenticated,
  });

  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteAccount = useMutation({
    mutationFn: (input: { password?: string; confirmText?: string }) =>
      authApi.deleteAccount(input),
    onSuccess: async () => {
      setShowDelete(false);
      // The account is gone; drop the local session so the app returns to
      // signed-out state rather than holding a token for a deleted user.
      await logout();
      toast('Your account has been deleted.', 'success');
    },
    onError: (e: Error) => setDeleteError(e.message),
  });

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="You're not signed in"
        message="Sign in to track orders, save addresses and keep a wishlist."
        actionLabel="Sign in"
        onAction={() => router.push('/auth/login')}
      />
    );
  }

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await logout();
          setSigningOut(false);
          toast('Signed out', 'info');
        },
      },
    ]);
  };

  const openDelete = () => {
    setDeleteError(null);
    setShowDelete(true);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileBody}>
          <Text style={styles.name}>{user?.name ?? 'Your account'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.group}>
        <MenuRow label="My orders" glyph="📦" onPress={() => router.push('/orders')} />
        <MenuRow label="Saved addresses" glyph="📍" onPress={() => router.push('/addresses')} />
        <MenuRow label="Wishlist" glyph="♡" onPress={() => router.push('/wishlist')} />
      </View>

      {/* Referral */}
      {referralQ.data?.referralCode ? (
        <View style={styles.referral}>
          <Text style={styles.referralLabel}>Your referral code</Text>
          <Text style={styles.referralCode}>{referralQ.data.referralCode}</Text>
          <Text style={styles.referralHint}>
            Share it with friends — they get a welcome offer when they sign up.
          </Text>
        </View>
      ) : null}

      {/* Danger zone */}
      <View style={styles.group}>
        <Button
          label="Sign out"
          variant="outline"
          fullWidth
          loading={signingOut}
          onPress={confirmSignOut}
        />
        <Pressable onPress={openDelete} hitSlop={8} style={styles.deleteWrap}>
          <Text style={styles.delete}>Delete my account</Text>
        </Pressable>
      </View>

      <DeleteAccountSheet
        visible={showDelete}
        /*
         * Always true in practice: the app signs in with email + password, so a
         * user who can reach this screen necessarily has one on record. The
         * server still accepts confirmText for password-less OAuth accounts,
         * which can only exist on the website.
         */
        hasPassword
        submitting={deleteAccount.isPending}
        error={deleteError}
        onConfirm={(input) => {
          setDeleteError(null);
          deleteAccount.mutate(input);
        }}
        onClose={() => setShowDelete(false)}
      />
    </ScrollView>
  );
}

function MenuRow({
  label,
  glyph,
  onPress,
}: {
  label: string;
  glyph: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
    >
      <Text style={styles.menuGlyph}>{glyph}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h2, color: colors.textInverse },
  profileBody: { flex: 1, gap: 2 },
  name: { ...typography.h3, color: colors.text },
  email: { ...typography.small, color: colors.textMuted },
  group: { gap: spacing.sm },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  menuGlyph: { fontSize: 17 },
  menuLabel: { ...typography.body, color: colors.text, flex: 1 },
  chevron: { ...typography.h3, color: colors.textMuted },
  referral: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  referralLabel: { ...typography.tiny, color: colors.textMuted, textTransform: 'uppercase' },
  referralCode: { ...typography.h2, color: colors.primary, letterSpacing: 1 },
  referralHint: { ...typography.small, color: colors.textMuted },
  deleteWrap: { alignItems: 'center', paddingVertical: spacing.md },
  delete: { ...typography.small, color: colors.error, fontWeight: '600' },
});
