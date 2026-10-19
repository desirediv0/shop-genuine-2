import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { IconName } from '../components/Icon';

/**
 * Each Genuine store gets its own colour world. The business is four stores
 * in one app, and the old design hid that behind a grey picker; giving each
 * store an identity makes switching between them the most visible thing on
 * Home, and tells a shopper at a glance which store they are in.
 *
 * Action colour stays the brand orange everywhere (ADD, buttons) so taps look
 * the same in every store — store colours are for identity, not for actions.
 *
 * Every `solid` and the dark end of every `gradient` keeps white text above
 * WCAG AA contrast. "All stores" uses the blue from the Shop Genuine logo,
 * which the app previously never used.
 */
export interface StoreTheme {
  key: 'all' | 'grocery' | 'nutrition' | 'pharmacy' | 'cosmetics' | 'other';
  /** Short label for chips — "Grocery" rather than "Genuine Grocery". */
  short: string;
  tagline: string;
  icon: IconName;
  /** Top-left → bottom-right hero gradient. */
  gradient: [string, string];
  /** Solid fill for accents (links, active chips). */
  solid: string;
  /** Pale wash for tiles and backgrounds. */
  soft: string;
  /** Dark text on `soft`. */
  ink: string;
  /** Rotating examples for the search box. */
  hints: string[];
}

const THEMES: Record<StoreTheme['key'], Omit<StoreTheme, 'short'> & { short?: string }> = {
  all: {
    key: 'all',
    short: 'All',
    tagline: 'Every Genuine store in one place',
    icon: 'grid',
    gradient: ['#2F62EA', '#0B2C86'],
    solid: '#1D4ED8',
    soft: '#E9EFFD',
    ink: '#1E3A8A',
    hints: ['atta', 'milk', 'chips', 'protein', 'biscuits'],
  },
  grocery: {
    key: 'grocery',
    tagline: 'Fresh staples and daily essentials',
    icon: 'leaf',
    gradient: ['#22A35A', '#0E5E35'],
    solid: '#15803D',
    soft: '#E6F5EC',
    ink: '#14532D',
    hints: ['atta', 'rice', 'milk', 'eggs', 'masala'],
  },
  nutrition: {
    key: 'nutrition',
    tagline: 'Fuel for every goal',
    icon: 'fitness',
    gradient: ['#F27A2A', '#A9370B'],
    solid: '#C2410C',
    soft: '#FDEFE5',
    ink: '#7C2D12',
    hints: ['whey protein', 'oats', 'peanut butter', 'multivitamin'],
  },
  pharmacy: {
    key: 'pharmacy',
    tagline: 'Everyday health and wellness',
    icon: 'pharmacy',
    gradient: ['#1AA39F', '#0B5A5F'],
    solid: '#0F766E',
    soft: '#E2F4F2',
    ink: '#134E4A',
    hints: ['vitamins', 'first aid', 'sanitiser', 'thermometer'],
  },
  cosmetics: {
    key: 'cosmetics',
    tagline: 'Skincare and beauty, genuine only',
    icon: 'sparkles',
    gradient: ['#E2468B', '#94164C'],
    solid: '#BE185D',
    soft: '#FBE8F0',
    ink: '#831843',
    hints: ['face wash', 'sunscreen', 'lip balm', 'moisturiser'],
  },
  other: {
    key: 'other',
    tagline: 'Genuine products, honest prices',
    icon: 'store',
    gradient: ['#5B6B86', '#2B3447'],
    solid: '#475569',
    soft: '#EEF0F4',
    ink: '#1E293B',
    hints: ['products', 'brands'],
  },
};

/**
 * Matches by name rather than slug: production's first store was created by
 * hand as "Genuine Grocery" / `genuine-grocery`, while the seed script uses
 * `grocery`. Names are what the admin types, so match on those.
 */
export function storeTheme(name?: string | null): StoreTheme {
  if (!name) return { ...THEMES.all, short: 'All' };
  const key: StoreTheme['key'] = /grocer/i.test(name)
    ? 'grocery'
    : /nutri|protein|supplement/i.test(name)
      ? 'nutrition'
      : /pharm|medic|health/i.test(name)
        ? 'pharmacy'
        : /cosmet|beauty|skin/i.test(name)
          ? 'cosmetics'
          : 'other';
  const short = name.replace(/^\s*genuine\s+/i, '').trim() || name;
  return { ...THEMES[key], short };
}

/** Pastel washes for category tiles, cycled so neighbours never match. */
const TILE_COLOURS: { bg: string; fg: string }[] = [
  { bg: '#FFF1E5', fg: '#C2410C' },
  { bg: '#E8F5EC', fg: '#15803D' },
  { bg: '#EAF0FD', fg: '#1D4ED8' },
  { bg: '#FDEBF2', fg: '#BE185D' },
  { bg: '#FFF8DC', fg: '#A16207' },
  { bg: '#E6F6F5', fg: '#0F766E' },
  { bg: '#F1ECFD', fg: '#6D28D9' },
  { bg: '#FDECEA', fg: '#B91C1C' },
];

/**
 * Category tiles use MaterialCommunityIcons (bundled in @expo/vector-icons
 * alongside Ionicons) because it has real grocery glyphs — grain, cookie, soda
 * bottle, chilli. Ionicons gave Atta an apple and Biscuits a coffee cup.
 *
 * Order matters: the first match wins, so "Masala & Dry Fruits" must hit the
 * spice rule before the fruit-and-vegetable one.
 */
export type CategoryGlyph = ComponentProps<typeof MaterialCommunityIcons>['name'];

const CATEGORY_ICONS: [RegExp, CategoryGlyph][] = [
  [/masala|spice|dry fruit/i, 'chili-hot-outline'],
  [/atta|rice|dal|grain|flour|oil/i, 'grain'],
  [/biscuit|cookie/i, 'cookie-outline'],
  [/dairy|egg|milk|paneer|curd/i, 'egg-outline'],
  [/bakery|bread|breakfast/i, 'bread-slice-outline'],
  [/cold drink|juice|beverage|drink|soda/i, 'bottle-soda-outline'],
  [/frozen/i, 'snowflake'],
  [/fruit|vegetable|veggie|fresh/i, 'carrot'],
  [/ice cream|dessert/i, 'ice-cream'],
  [/sweet|chocolate|cand/i, 'candy-outline'],
  [/munch|snack|chip|namkeen/i, 'popcorn'],
  [/tea|coffee/i, 'tea-outline'],
  [/packaged|ready|instant|noodle|sauce/i, 'noodles'],
  [/water/i, 'cup-water'],
  [/fish|meat|chicken/i, 'food-drumstick-outline'],
  [/protein|supplement|fitness|nutrition/i, 'dumbbell'],
  [/medicine|pharma|health|wellness/i, 'pill'],
  [/beauty|skin|cosmetic|makeup|hair/i, 'lipstick'],
  [/flower|puja|pooja/i, 'flower-outline'],
];

/** Icon and colours for a category tile when the admin uploaded no image. */
export function categoryVisual(name: string, index: number): { icon: CategoryGlyph; bg: string; fg: string } {
  const icon = CATEGORY_ICONS.find(([re]) => re.test(name))?.[1] ?? 'basket-outline';
  return { icon, ...TILE_COLOURS[index % TILE_COLOURS.length] };
}
