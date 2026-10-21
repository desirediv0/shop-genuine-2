import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { auth as authApi } from '../../src/api/services';
import { Button } from '../../src/components/Button';
import { DeleteAccountSheet } from '../../src/components/DeleteAccountSheet';
import { Icon, type IconName } from '../../src/components/Icon';
import { PushDebugPanel } from '../../src/components/PushDebugPanel';
import { useAuth } from '../../src/context/AuthContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import { storeTheme } from '../../src/theme/stores';
import { buildLabel } from '../../src/utils/buildInfo';

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

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
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <LinearGradient colors={BRAND.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.heroMark} pointerEvents="none">
            <Icon name="account" size={140} color="rgba(255,255,255,0.12)" filled />
          </View>
          <Text style={styles.heroOverline}>WELCOME</Text>
          <Text style={styles.heroTitle}>Your Genuine account</Text>
          <Text style={styles.heroText}>
            Sign in to track orders, check out faster and keep your favourites in one place.
          </Text>

          <View style={styles.benefits}>
            <Benefit icon="orders" text="Track every order, step by step" />
            <Benefit icon="address" text="Saved addresses for one-tap checkout" />
            <Benefit icon="wishlist" text="Save products for later" />
          </View>

          <Pressable
            onPress={() => router.push('/auth/login')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
          >
            <Text style={[styles.heroBtnText, { color: BRAND.ink }]}>Sign in</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/auth/register')} hitSlop={8} accessibilityRole="button">
            <Text style={styles.heroLink}>
              New here? <Text style={styles.heroLinkStrong}>Create an account</Text>
            </Text>
          </Pressable>
        </View>

        {/* Minting a push token needs no account, so keep diagnostics reachable
            while signed out — only the test send requires auth. */}
        {__DEV__ ? <PushDebugPanel /> : null}
        <Text style={styles.build}>{buildLabel()}</Text>
      </ScrollView>
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
      {/* Profile */}
      <View style={styles.profileCard}>
        <LinearGradient colors={BRAND.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { color: BRAND.ink }]}>
            {(user?.name?.trim() || user?.email || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileBody}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name ?? 'Your account'}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* The three places people go from here */}
      <View style={styles.tiles}>
        <Tile icon="orders" label="Orders" onPress={() => router.push('/orders')} />
        <Tile icon="address" label="Addresses" onPress={() => router.push('/addresses')} />
        <Tile icon="wishlist" label="Saved" onPress={() => router.navigate('/wishlist')} />
      </View>

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
      {/* Which version and over-the-air update this phone runs — the first
          thing to ask when a shopper reports a problem. */}
      <Text style={styles.build}>{buildLabel()}</Text>
    </ScrollView>
  );
}

function Tile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.tileIcon}>
        <Icon name={icon} size={21} color={colors.primary} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

function Benefit({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.benefit}>
      <View style={styles.benefitIcon}>
        <Icon name={icon} size={15} color={colors.textInverse} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

/** "All stores" blue — the account belongs to every store, not one. */
const BRAND = storeTheme(null);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  pressed: { opacity: 0.85 },

  hero: { borderRadius: radius.xl, overflow: 'hidden', padding: spacing.xl, ...shadow.raised },
  heroMark: { position: 'absolute', right: -24, top: -20, transform: [{ rotate: '-10deg' }] },
  heroOverline: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.4, color: 'rgba(255,255,255,0.72)' },
  heroTitle: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5, color: colors.textInverse, marginTop: 2 },
  heroText: { ...typography.small, color: 'rgba(255,255,255,0.88)', marginTop: spacing.xs },
  benefits: { gap: spacing.md, marginTop: spacing.xl },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { ...typography.smallStrong, color: colors.textInverse, flex: 1 },
  heroBtn: {
    marginTop: spacing.xl,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnText: { fontFamily: fonts.bold, fontSize: 15 },
  heroLink: { ...typography.small, color: 'rgba(255,255,255,0.86)', textAlign: 'center', marginTop: spacing.md },
  heroLinkStrong: { fontFamily: fonts.semibold, color: colors.textInverse },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.raised,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 24 },
  profileBody: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 19, color: colors.textInverse },
  email: { ...typography.small, color: 'rgba(255,255,255,0.82)' },

  tiles: { flexDirection: 'row', gap: spacing.md },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },


  group: { gap: spacing.md },
  deleteWrap: { alignItems: 'center', paddingVertical: spacing.md },
  build: { ...typography.tiny, color: colors.textMuted, textAlign: 'center' },
  delete: { ...typography.small, color: colors.error, fontFamily: fonts.semibold },
});
