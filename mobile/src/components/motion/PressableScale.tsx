import React, { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Quick to dip, soft to settle — a touch that feels physical, not a flicker. */
const SPRING = { damping: 14, stiffness: 340, mass: 0.6 };

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  /** Extra style while the finger is down (e.g. a darker fill). */
  pressedStyle?: StyleProp<ViewStyle>;
  /** How far it shrinks under the finger. */
  scaleTo?: number;
  children?: React.ReactNode;
};

/**
 * A Pressable that springs down under the finger and back on release. Used for
 * cards, tiles and buttons so every tap answers the same way — the old static
 * pressed styles changed instantly and made the app feel like a picture.
 *
 * Springs honour the system "reduce motion" setting (Reanimated's default).
 */
export function PressableScale({
  style,
  pressedStyle,
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) scale.value = withSpring(scaleTo, SPRING);
        if (pressedStyle) setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, SPRING);
        if (pressedStyle) setPressed(false);
        onPressOut?.(e);
      }}
      style={[style, pressed && pressedStyle, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}
