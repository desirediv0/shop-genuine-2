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

      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
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
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { ...typography.small, color: colors.text, fontWeight: '600' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  fieldFocused: { borderColor: colors.primary },
  fieldError: { borderColor: colors.error },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.md },
  toggle: { ...typography.small, color: colors.primary, fontWeight: '600' },
  error: { ...typography.small, color: colors.error },
  hint: { ...typography.small, color: colors.textMuted },
});
