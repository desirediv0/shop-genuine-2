import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { auth as authApi, referrals } from '../../src/api/services';
import { Button } from '../../src/components/Button';
import { DeleteAccountSheet } from '../../src/components/DeleteAccountSheet';
import { Icon, type IconName } from '../../src/components/Icon';
import { PushDebugPanel } from '../../src/components/PushDebugPanel';
import { EmptyState } from '../../src/components/States';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';

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
      <View style={styles.signedOut}>
        <EmptyState
          title="You're not signed in"
          message="Sign in to track orders, save addresses and keep a wishlist."
          actionLabel="Sign in"
          onAction={() => router.push('/auth/login')}
        />
        {/* Minting a push token needs no account, so keep diagnostics reachable
            while signed out — only the test send requires auth. */}
        {__DEV__ ? (
          <View style={styles.signedOutPanel}>
            <PushDebugPanel />
          </View>
        ) : null}
      </View>
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
        <MenuRow
          label="My orders"
          caption="Track and manage your orders"
          icon="orders"
          onPress={() => router.push('/orders')}
        />
        <MenuRow
          label="Saved addresses"
          caption="Where we deliver"
          icon="address"
          onPress={() => router.push('/addresses')}
        />
        <MenuRow
          label="Saved items"
          caption="Your wishlist"
          icon="wishlist"
          onPress={() => router.push('/wishlist')}
        />
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

      {__DEV__ ? <PushDebugPanel /> : null}

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
  caption,
  icon,
  onPress,
}: {
  label: string;
  caption?: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
    >
      <View style={styles.menuIcon}>
        <Icon name={icon} size={19} color={colors.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuLabel}>{label}</Text>
        {caption ? <Text style={styles.menuCaption}>{caption}</Text> : null}
      </View>
      <Icon name="forward" size={17} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  signedOut: { flex: 1 },
  signedOutPanel: { padding: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h1, color: colors.textInverse },
  profileBody: { flex: 1, gap: 2 },
  name: { ...typography.h2, color: colors.text },
  email: { ...typography.small, color: colors.textMuted },
  group: { gap: spacing.md },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  pressed: { opacity: 0.85 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, gap: 1 },
  menuLabel: { ...typography.bodyStrong, color: colors.text },
  menuCaption: { ...typography.small, color: colors.textMuted },
  referral: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    gap: spacing.xs,
  },
  referralLabel: { ...typography.overline, color: colors.primary },
  referralCode: { ...typography.h1, color: colors.text, letterSpacing: 1.5, marginVertical: 2 },
  referralHint: { ...typography.small, color: colors.textSecondary },
  deleteWrap: { alignItems: 'center', paddingVertical: spacing.md },
  delete: { ...typography.small, color: colors.error, fontFamily: fonts.semibold },
});
