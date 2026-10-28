import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { auth as authApi } from '../../src/api/services';
import { Button } from '../../src/components/Button';
import { Backdrop } from '../../src/components/decor/Backdrop';
import { Appear } from '../../src/components/motion/Appear';
import { PressableScale } from '../../src/components/motion/PressableScale';
import { DeleteAccountSheet } from '../../src/components/DeleteAccountSheet';
import { Icon, type IconName } from '../../src/components/Icon';
import { PromiseCard } from '../../src/components/PromiseCard';
import { PushDebugPanel } from '../../src/components/PushDebugPanel';
import { useAuth } from '../../src/context/AuthContext';
import { useStoreVertical } from '../../src/context/StoreVerticalContext';
import { useToast } from '../../src/context/ToastContext';
import { colors, fonts, radius, shadow, spacing, typography } from '../../src/theme';
import { DOT_GRID, storeMesh, storeTheme } from '../../src/theme/stores';
import { buildLabel } from '../../src/utils/buildInfo';

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const { vertical } = useStoreVertical();
  const tint = storeTheme(vertical?.name);
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
      <View style={styles.screen}>
        <Backdrop tint={tint} />
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
          <Appear index={0}>
            <View style={styles.hero}>
              <View pointerEvents="none" style={[StyleSheet.absoluteFill, DOT_GRID, styles.dots]} />
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

              <PressableScale
                onPress={() => router.push('/auth/login')}
                accessibilityRole="button"
                scaleTo={0.97}
                style={styles.heroBtn}
              >
                <Text style={[styles.heroBtnText, { color: BRAND.ink }]}>Sign in</Text>
              </PressableScale>
              <Pressable onPress={() => router.push('/auth/register')} hitSlop={8} accessibilityRole="button">
                <Text style={styles.heroLink}>
                  New here? <Text style={styles.heroLinkStrong}>Create an account</Text>
                </Text>
              </Pressable>
            </View>
          </Appear>

          <Appear index={1}>
            <PromiseCard />
          </Appear>

          {/* Minting a push token needs no account, so keep diagnostics reachable
              while signed out — only the test send requires auth. */}
          {__DEV__ ? <PushDebugPanel /> : null}
          <Text style={styles.build}>{buildLabel()}</Text>
        </ScrollView>
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
    <View style={styles.screen}>
      <Backdrop tint={tint} />
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        {/* Profile */}
        <Appear index={0}>
          <View style={styles.profileCard}>
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, DOT_GRID, styles.dots]} />
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
        </Appear>

        {/* The three places people go from here */}
        <Appear index={1}>
          <View style={styles.tiles}>
            <Tile icon="orders" label="Orders" onPress={() => router.push('/orders')} />
            <Tile icon="address" label="Addresses" onPress={() => router.push('/addresses')} />
            <Tile icon="wishlist" label="Saved" onPress={() => router.navigate('/wishlist')} />
          </View>
        </Appear>

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
    </View>
  );
}

function Tile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.tile}>
      <View style={styles.tileIcon}>
        <Icon name={icon} size={21} color={colors.primary} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </PressableScale>
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
const BRAND_MESH = storeMesh(BRAND);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },

  hero: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    experimental_backgroundImage: BRAND_MESH,
    ...shadow.glow(BRAND.gradient[1], 0.3),
  },
  dots: { opacity: 0.55 },
  heroMark: { position: 'absolute', right: -24, top: -20, transform: [{ rotate: '-10deg' }] },
  heroOverline: { fontFamily: fonts.displayBold, fontSize: 10.5, letterSpacing: 1.6, color: 'rgba(255,255,255,0.72)' },
  heroTitle: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.7, color: colors.textInverse, marginTop: 2 },
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
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnText: { fontFamily: fonts.displayBold, fontSize: 15.5 },
  heroLink: { ...typography.small, color: 'rgba(255,255,255,0.86)', textAlign: 'center', marginTop: spacing.md },
  heroLinkStrong: { fontFamily: fonts.semibold, color: colors.textInverse },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    overflow: 'hidden',
    experimental_backgroundImage: BRAND_MESH,
    ...shadow.glow(BRAND.gradient[1], 0.3),
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.display, fontSize: 24 },
  profileBody: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.4, color: colors.textInverse },
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
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontFamily: fonts.displayBold, fontSize: 13.5, color: colors.text },

  group: { gap: spacing.md },
  deleteWrap: { alignItems: 'center', paddingVertical: spacing.md },
  build: { ...typography.tiny, color: colors.textMuted, textAlign: 'center' },
  delete: { ...typography.small, color: colors.error, fontFamily: fonts.semibold },
});
