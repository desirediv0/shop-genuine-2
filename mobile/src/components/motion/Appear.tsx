import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

/** Gap between consecutive items, so a row or grid ripples in. */
const STEP_MS = 55;

/**
 * Slides its children gently into place when they first mount, staggered by
 * `index` so a list ripples in instead of popping all at once.
 *
 * Only the first `limit` items animate: further down a long list the content
 * should simply be there, not replay an entrance on every scroll. The entrance
 * runs once, on mount; Reanimated skips it when the system asks for reduced
 * motion.
 */
export function Appear({
  index = 0,
  from = 'below',
  limit = 12,
  style,
  children,
}: {
  index?: number;
  from?: 'below' | 'right';
  limit?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  if (index >= limit) return <View style={style}>{children}</View>;
  const base = from === 'right' ? FadeInRight : FadeInDown;
  return (
    <Animated.View style={style} entering={base.delay(index * STEP_MS).duration(420)}>
      {children}
    </Animated.View>
  );
}
