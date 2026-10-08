import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: IconName;
  /** Use the solid icon variant — for an on/off action that is currently on. */
  iconFilled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconFilled = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const tint = isDisabled ? DISABLED_LABEL : LABEL_COLOR[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        SIZES[size],
        VARIANTS[variant],
        fullWidth && styles.fullWidth,
        // A pressed state that darkens rather than fades reads as a real
        // surface being pushed, not a glitch.
        pressed && !isDisabled && PRESSED[variant],
        isDisabled && DISABLED[variant],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Icon name={icon} size={ICON_SIZE[size]} color={tint} filled={iconFilled} />
          ) : null}
          <Text style={[LABEL_SIZE[size], { color: tint }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fullWidth: { alignSelf: 'stretch' },

});

const SIZES: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 38 },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 48 },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 56 },
};

const ICON_SIZE: Record<Size, number> = { sm: 15, md: 17, lg: 19 };

const LABEL_SIZE = {
  sm: typography.smallStrong,
  md: typography.bodyStrong,
  lg: typography.bodyStrong,
};

const VARIANTS: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.text },
  outline: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
};

const PRESSED: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { opacity: 0.85 },
  outline: { backgroundColor: colors.surfaceAlt },
  ghost: { backgroundColor: colors.surfaceAlt },
  danger: { opacity: 0.88 },
};

/**
 * Disabled states use a flat muted surface rather than reducing opacity —
 * a faded fill left white label text unreadable against it.
 */
const DISABLED: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  secondary: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  outline: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  ghost: { opacity: 0.5 },
  danger: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
};

const DISABLED_LABEL = colors.textMuted;

const LABEL_COLOR: Record<Variant, string> = {
  primary: colors.textInverse,
  secondary: colors.textInverse,
  // Outline buttons are secondary actions; orange text would compete with the
  // primary CTA sitting next to them.
  outline: colors.text,
  ghost: colors.textSecondary,
  danger: colors.textInverse,
};
