import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { Input } from './Input';
import { Sheet } from './Sheet';
import { colors, radius, spacing, typography } from '../theme';

/**
 * In-app account deletion, as App Review requires.
 *
 * Re-authentication is intentional: an unlocked phone should not be enough to
 * wipe the account. Users with a password confirm it; OAuth accounts (no
 * password on record) type DELETE instead.
 */
export function DeleteAccountSheet({
  visible,
  hasPassword,
  submitting,
  error,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  hasPassword: boolean;
  submitting: boolean;
  error: string | null;
  onConfirm: (input: { password?: string; confirmText?: string }) => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const ready = hasPassword ? password.length > 0 : confirmText.trim().toUpperCase() === 'DELETE';

  const close = () => {
    setPassword('');
    setConfirmText('');
    onClose();
  };

  return (
    // Through Sheet, like the address form: a bare page-sheet Modal drew its
    // title under the Android status bar, and the keyboard could cover the
    // password field on iOS.
    <Sheet visible={visible} title="Delete your account" onClose={close}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>This cannot be undone</Text>
          <Text style={styles.warningText}>
            Your profile, saved addresses, wishlist and order history will be permanently
            removed. Orders already placed will still be fulfilled.
          </Text>
        </View>

        {hasPassword ? (
          <Input
            label="Confirm your password"
            value={password}
            onChangeText={setPassword}
            secure
            autoCapitalize="none"
            placeholder="Your password"
            error={error}
          />
        ) : (
          <Input
            label="Type DELETE to confirm"
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="DELETE"
            error={error}
          />
        )}

        <View style={styles.actions}>
          <Button label="Keep my account" variant="ghost" onPress={close} style={styles.flex} />
          <Button
            label="Delete forever"
            variant="danger"
            disabled={!ready}
            loading={submitting}
            onPress={() =>
              onConfirm(hasPassword ? { password } : { confirmText: confirmText.trim() })
            }
            style={styles.flex}
          />
        </View>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg, paddingBottom: spacing.lg },
  warning: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#FDE8EA',
    borderWidth: 1,
    borderColor: colors.error,
    gap: spacing.xs,
  },
  warningTitle: { ...typography.bodyStrong, color: colors.error },
  warningText: { ...typography.small, color: colors.text, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  flex: { flex: 1 },
});
