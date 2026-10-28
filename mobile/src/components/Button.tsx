import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './motion/PressableScale';

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
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      scaleTo={0.97}
      style={[
        styles.base,
        SIZES[size],
        VARIANTS[variant],
        !isDisabled && FILL[variant],
        fullWidth && styles.fullWidth,
        isDisabled && DISABLED[variant],
        style,
      ]}
      // Darkens as well as springing down: it reads as a real surface being
      // pushed, not a glitch.
      pressedStyle={!isDisabled ? PRESSED[variant] : undefined}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Icon name={icon} size={ICON_SIZE[size]} color={tint} filled={iconFilled} />
          ) : null}
          {/* A button label never wraps: on a narrow phone, or with a larger
              system font, "View cart" broke onto two lines and the button
              grew taller than everything beside it. Shrink slightly instead. */}
          <Text
            style={[LABEL_SIZE[size], styles.label, { color: tint }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
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
  // maxWidth + flexShrink let a long label shrink inside the button rather
  // than spill past its edges.
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, maxWidth: '100%' },
  label: { flexShrink: 1 },
  fullWidth: { alignSelf: 'stretch' },

});

const SIZES: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 38 },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 48 },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 56 },
};

const ICON_SIZE: Record<Size, number> = { sm: 15, md: 17, lg: 19 };

const LABEL_SIZE = {
  sm: { fontFamily: fonts.displayBold, fontSize: 13.5, lineHeight: 19 },
  md: { fontFamily: fonts.displayBold, fontSize: 15.5, lineHeight: 22, letterSpacing: -0.1 },
  lg: { fontFamily: fonts.displayBold, fontSize: 16.5, lineHeight: 23, letterSpacing: -0.1 },
};

const VARIANTS: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.text },
  outline: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
};

/**
 * Filled buttons get a gentle gradient and a glow in their own colour, so the
 * main action on a screen looks like it can be pressed. Left off when
 * disabled, where the flat muted fill below takes over.
 */
const FILL: Partial<Record<Variant, ViewStyle>> = {
  primary: {
    experimental_backgroundImage: 'linear-gradient(135deg, #FB8B3D 0%, #F97316 55%, #EA580C 100%)',
    ...shadow.glow(colors.primary, 0.36),
  },
  secondary: {
    experimental_backgroundImage: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
    ...shadow.glow(colors.text, 0.22),
  },
};

const PRESSED: Record<Variant, ViewStyle> = {
  primary: { opacity: 0.92 },
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
