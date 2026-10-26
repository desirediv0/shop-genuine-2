import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import type { Tint } from './Illustration';

/**
 * A soft wash of the store's colour across the top of a screen, with a few
 * large faint circles — the decoration behind Cart, Saved and Account, whose
 * flat beige page read as empty. Sits behind the content, which keeps its own
 * white cards, and takes no touches.
 *
 * The tab header is painted `tint.soft` (app/(tabs)/_layout.tsx), so the wash
 * continues the header rather than starting under a hard line.
 */
export function Backdrop({ tint, height = 300 }: { tint: Tint; height?: number }) {
  return (
    <View pointerEvents="none" style={[styles.fill, { height }]}>
      <LinearGradient
        colors={[tint.soft, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.circle, styles.big, { backgroundColor: tint.solid }]} />
      <View style={[styles.circle, styles.ring, { borderColor: tint.solid }]} />
      <View style={[styles.circle, styles.small, { backgroundColor: tint.solid }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  circle: { position: 'absolute', borderRadius: 999 },
  big: { width: 240, height: 240, top: -120, right: -70, opacity: 0.07 },
  ring: { width: 130, height: 130, top: 40, right: 36, borderWidth: 1.5, opacity: 0.12 },
  small: { width: 110, height: 110, top: 150, left: -46, opacity: 0.05 },
});
