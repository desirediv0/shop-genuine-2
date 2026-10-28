import { Platform, type ViewStyle } from 'react-native';

/**
 * Design system.
 *
 * Brand orange stays the action colour and the logo blue marks deals. Around
 * them the neutrals are cool and crisp: an earlier warm-beige page read as
 * dull and "blank", and white cards barely separated from it. A cool light
 * page lets white cards, product photos and the store colours carry the
 * screen instead.
 *
 * Headlines, prices and buttons use Plus Jakarta Sans (it has the ₹ glyph);
 * body copy stays Inter.
 */

export const colors = {
  // Brand — matches client/src/app/globals.css
  primary: '#F97316',
  primaryPressed: '#EA580C',
  /** Tinted background for chips, badges and selected rows. */
  primarySoft: '#FFF1E6',
  /** Orange text on primarySoft. */
  primaryDeep: '#C2410C',
  /** The blue from the Shop Genuine logo, used for discounts and deals. */
  deal: '#1D4ED8',
  dealSoft: '#E8EEFD',
  primaryBorder: '#FED7B5',

  // Cool neutrals. Text is a deep slate, never pure #000.
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#667085',
  textInverse: '#FFFFFF',

  /** Page is a cool light grey; cards are pure white and lift off it. */
  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F7',
  /** Kept for compatibility with existing styles. */
  backgroundAlt: '#EEF2F7',
  /**
   * Behind product photos. Packshots are white-background JPEGs, drawn with
   * `mixBlendMode: 'multiply'` so their white takes on this tint instead of
   * leaving a hard white square (Android 10+; older phones show the white).
   */
  well: '#F2F5F9',

  border: '#E4E9F0',
  borderStrong: '#D2D9E4',

  success: '#15803D',
  successSoft: '#E6F6EC',
  error: '#DC2626',
  errorSoft: '#FDECEC',
  warning: '#B45309',
  info: '#2563EB',

  overlay: 'rgba(15, 23, 42, 0.5)',
  skeleton: '#E7EBF1',
} as const;

/** 4pt rhythm. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Generous, soft corners — the modern default — with tighter ones for small parts. */
export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  /** Plus Jakarta Sans, for headlines, prices and buttons. */
  displaySemi: 'PlusJakartaSans_600SemiBold',
  displayBold: 'PlusJakartaSans_700Bold',
  display: 'PlusJakartaSans_800ExtraBold',
} as const;

/**
 * Negative tracking on large text and slightly open tracking on small caps is
 * what makes a type scale feel designed rather than default.
 */
export const typography = {
  display: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.9 },
  h1: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.displayBold, fontSize: 19, lineHeight: 25, letterSpacing: -0.4 },
  h3: { fontFamily: fonts.displayBold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  smallStrong: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
  tiny: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 15 },
  /** Uppercase eyebrow labels. */
  overline: {
    fontFamily: fonts.displayBold,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  price: { fontFamily: fonts.display, fontSize: 16, lineHeight: 22, letterSpacing: -0.3 },
  priceLarge: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.8 },
  button: { fontFamily: fonts.displayBold, fontSize: 15.5, letterSpacing: -0.1 },
} as const;

/** `#RRGGBB` → `rgba(r, g, b, a)`, for glows and tinted shadows. */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/**
 * Real, soft CSS shadows (`boxShadow`) instead of Android's flat elevation,
 * which draws a dark offset smudge. Android draws them from 9 (API 28); older
 * phones fall back to elevation so cards still separate.
 */
const OLD_ANDROID = Platform.OS === 'android' && Number(Platform.Version) < 28;
function lift(boxShadow: string, elevation: number): ViewStyle {
  return OLD_ANDROID ? { elevation } : { boxShadow };
}

export const shadow = {
  /** Barely-there lift for cards sitting on the page. */
  card: lift('0px 1px 2px rgba(15, 23, 42, 0.05), 0px 6px 16px rgba(15, 23, 42, 0.06)', 1),
  raised: lift('0px 2px 6px rgba(15, 23, 42, 0.06), 0px 16px 34px rgba(15, 23, 42, 0.13)', 5),
  /** For bars pinned to the bottom of the screen. */
  bar: lift('0px -4px 24px rgba(15, 23, 42, 0.08)', 12),
  /** A coloured glow under a filled button or tile, in its own colour. */
  glow: (hex: string, strength = 0.38): ViewStyle =>
    lift(`0px 8px 18px ${alpha(hex, strength)}`, 4),
};
