import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Icon } from './Icon';

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
  /** Renders a show/hide toggle and starts obscured. */
  secure?: boolean;
}

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, secure = false, style, ...rest },
  ref,
) {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.field, focused && styles.focused, !!error && styles.errored]}>
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />

        {secure ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.message}>
          <Icon name="warning" size={13} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { ...typography.smallStrong, color: colors.textSecondary },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    minHeight: 52,
  },
  // A focus ring in the brand colour is the one place orange earns its keep
  // on an input.
  focused: { borderColor: colors.primary, backgroundColor: colors.surface },
  errored: { borderColor: colors.error },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
  toggle: { ...typography.smallStrong, color: colors.primary },
  message: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  error: { ...typography.small, color: colors.error, flex: 1 },
  hint: { ...typography.small, color: colors.textMuted },
});
