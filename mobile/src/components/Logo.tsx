import React from 'react';
import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

/**
 * The Shop Genuine logo.
 *
 * Source art is `mobile/logo.png`, a 1437x710 RGBA lockup of the "Shop genuine"
 * wordmark in a rounded frame with the cart roundel in its bottom-right gap.
 * `assets/logo.png` is that file with its transparent margins trimmed, which is
 * what pins the aspect ratio below — regenerate both with
 * `build-logo-assets.py` rather than cropping by hand.
 *
 * Only the height is set; the width follows the aspect so the mark can never be
 * stretched. At roughly 2:1 the lockup carries two lines of type, so it needs
 * noticeably more height than a single-line wordmark to stay legible — below
 * about 36 the word "genuine" starts to close up.
 */

const ASPECT = 1378 / 657;

export function Logo({
  height = 48,
  style,
}: {
  height?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source={require('../../assets/logo.png')}
      style={[{ height, width: height * ASPECT }, style]}
      contentFit="contain"
      // The wordmark reads "Shop Genuine"; screen readers should say that.
      accessibilityLabel="Shop Genuine"
      accessible
    />
  );
}
