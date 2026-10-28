import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, shadow } from '../../theme';
import type { CategoryGlyph } from '../../theme/stores';

export interface Tint {
  solid: string;
  soft: string;
}

interface Floater {
  icon: CategoryGlyph;
  bg: string;
  fg: string;
}

/** Small product symbols around the main icon — one per Genuine store. */
const STORE_FLOATERS: Floater[] = [
  { icon: 'leaf', bg: '#E8F5EC', fg: '#15803D' },
  { icon: 'lotion-outline', bg: '#FDEBF2', fg: '#BE185D' },
  { icon: 'bottle-tonic-outline', bg: '#EAF0FD', fg: '#1D4ED8' },
  { icon: 'tag-heart-outline', bg: '#FFF1E5', fg: '#C2410C' },
];

/** Where the four floaters sit, as fractions of the illustration's size. */
const SPOTS = [
  { left: 0.02, top: 0.14 },
  { left: 0.74, top: 0.04 },
  { left: 0.08, top: 0.7 },
  { left: 0.76, top: 0.64 },
];

/** Tiny accent dots that finish the composition. */
const DOTS = [
  { left: 0.32, top: 0.0, d: 0.045 },
  { left: 0.93, top: 0.42, d: 0.035 },
  { left: 0.0, top: 0.5, d: 0.03 },
  { left: 0.6, top: 0.95, d: 0.04 },
];

/**
 * A flat illustration built from shapes and icons rather than artwork: a soft
 * tinted disc, a raised card holding the main symbol, and small product
 * symbols floating around it. Used where a screen would otherwise be a lone
 * icon in a sea of empty page (empty cart, nothing saved, no orders).
 *
 * Built from Views, so it takes any store's colours and needs no image assets
 * or native drawing library — it ships in an over-the-air update.
 */
export function Illustration({
  icon,
  tint = { solid: colors.primary, soft: colors.primarySoft },
  size = 190,
  floaters = STORE_FLOATERS,
}: {
  icon: CategoryGlyph;
  tint?: Tint;
  size?: number;
  floaters?: Floater[];
}) {
  const disc = size * 0.78;
  const card = size * 0.4;
  const bubble = size * 0.2;

  return (
    <View style={{ width: size, height: size }} accessible={false} importantForAccessibility="no-hide-descendants">
      <LinearGradient
        colors={[tint.soft, colors.background]}
        start={{ x: 0.15, y: 0.1 }}
        end={{ x: 0.9, y: 0.95 }}
        style={[
          styles.round,
          { width: disc, height: disc, left: (size - disc) / 2, top: (size - disc) / 2 },
        ]}
      />
      <View
        style={[
          styles.round,
          styles.ring,
          {
            width: size * 0.96,
            height: size * 0.96,
            left: size * 0.02,
            top: size * 0.02,
            borderColor: `${tint.solid}26`,
          },
        ]}
      />

      {DOTS.map((dot, i) => (
        <View
          key={`dot-${i}`}
          style={[
            styles.round,
            {
              width: size * dot.d,
              height: size * dot.d,
              left: size * dot.left,
              top: size * dot.top,
              backgroundColor: `${tint.solid}40`,
            },
          ]}
        />
      ))}

      <View
        style={[
          styles.card,
          {
            width: card,
            height: card,
            borderRadius: card * 0.3,
            left: (size - card) / 2,
            top: (size - card) / 2,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={card * 0.5} color={tint.solid} />
      </View>

      {floaters.slice(0, SPOTS.length).map((f, i) => (
        <Bobbing
          key={f.icon}
          index={i}
          style={[
            styles.round,
            styles.bubble,
            {
              width: bubble,
              height: bubble,
              // Exact radius: a soft shadow on the 999 one draws square.
              borderRadius: bubble / 2,
              left: size * SPOTS[i].left,
              top: size * SPOTS[i].top,
              backgroundColor: f.bg,
            },
          ]}
        >
          <MaterialCommunityIcons name={f.icon} size={bubble * 0.52} color={f.fg} />
        </Bobbing>
      ))}
    </View>
  );
}

/** Drifts its child up and down a few points, out of step with its siblings. */
function Bobbing({
  index,
  style,
  children,
}: {
  index: number;
  style: object;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const ease = Easing.inOut(Easing.quad);
    const half = 1300 + index * 220;
    y.value = withDelay(
      index * 260,
      withRepeat(
        withSequence(withTiming(-4, { duration: half, easing: ease }), withTiming(0, { duration: half, easing: ease })),
        -1,
      ),
    );
  }, [index, reduceMotion, y]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  round: { position: 'absolute', borderRadius: 999 },
  ring: { borderWidth: 1.5 },
  card: {
    position: 'absolute',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
    ...shadow.raised,
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadow.card,
  },
});
