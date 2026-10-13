import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, TextStyle } from 'react-native';
import { colors } from '../theme';

/**
 * Every icon in the app comes from here.
 *
 * Ionicons is used because it ships matched outline/filled pairs, which is what
 * makes a tab bar read correctly — outline when inactive, solid when active.
 * Emoji were used before and looked like clip-art next to real UI type.
 */

/** Semantic names, so screens never hardcode an icon-set string. */
const GLYPHS = {
  home: ['home-outline', 'home'],
  search: ['search-outline', 'search'],
  cart: ['bag-outline', 'bag'],
  wishlist: ['heart-outline', 'heart'],
  account: ['person-outline', 'person'],

  back: ['chevron-back', 'chevron-back'],
  forward: ['chevron-forward', 'chevron-forward'],
  down: ['chevron-down', 'chevron-down'],
  up: ['chevron-up', 'chevron-up'],
  close: ['close', 'close'],
  check: ['checkmark', 'checkmark'],
  plus: ['add', 'add'],
  minus: ['remove', 'remove'],

  store: ['storefront-outline', 'storefront'],
  orders: ['receipt-outline', 'receipt'],
  address: ['location-outline', 'location'],
  tag: ['pricetag-outline', 'pricetag'],
  truck: ['cube-outline', 'cube'],
  card: ['card-outline', 'card'],
  cash: ['wallet-outline', 'wallet'],
  shield: ['shield-checkmark-outline', 'shield-checkmark'],
  bell: ['notifications-outline', 'notifications'],
  logout: ['log-out-outline', 'log-out'],
  trash: ['trash-outline', 'trash'],
  gift: ['gift-outline', 'gift'],
  info: ['information-circle-outline', 'information-circle'],
  warning: ['alert-circle-outline', 'alert-circle'],
  empty: ['file-tray-outline', 'file-tray'],
  image: ['image-outline', 'image'],
  filter: ['options-outline', 'options'],
} as const;

export type IconName = keyof typeof GLYPHS;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  /** Use the solid variant — for an active tab, say. */
  filled?: boolean;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 20, color = colors.text, filled = false, style }: Props) {
  const glyph = GLYPHS[name][filled ? 1 : 0];
  return (
    <Ionicons
      name={glyph as React.ComponentProps<typeof Ionicons>['name']}
      size={size}
      color={color}
      style={style}
      // Icons are decorative wherever they sit beside a label; the label is the
      // accessible name, so an icon announcing itself would just be noise.
      accessible={false}
    />
  );
}
