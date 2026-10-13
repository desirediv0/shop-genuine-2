import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';

/**
 * The screen that slides up for adding or editing an address — shared by
 * Checkout and Saved addresses so the two cannot drift apart again.
 *
 * On Android a page-sheet modal opens full screen and, with edge-to-edge on,
 * draws underneath the status bar: the "New address" title sat on top of the
 * clock. iOS presents the sheet below the status bar, so only Android adds the
 * top inset. Both need the bottom inset to keep the Save button clear of the
 * gesture bar, and room for the keyboard so the PIN code and phone fields are
 * not hidden while typing.
 */
export function AddressSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const top = Platform.OS === 'android' ? insets.top + spacing.lg : spacing.lg;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      // Stated outright so Android always draws behind the bars and the
      // insets above are always the right amount — never twice.
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { paddingTop: top, paddingBottom: insets.bottom + spacing.md }]}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, paddingHorizontal: spacing.lg, backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
});
