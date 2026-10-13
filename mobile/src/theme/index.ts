/**
 * Design system.
 *
 * The brand orange is kept exactly as the web storefront uses it, but every
 * neutral around it is warm. The previous palette paired that orange with
 * pink-tinted greys left over from the cosmetics brand (#FFF5F9, #F1E1E9),
 * and orange on pink reads muddy — that mismatch was most of why the app felt
 * harsh rather than calm.
 *
 * Depth comes from a warm off-white page behind white cards plus very soft
 * shadows, instead of a 1px border around everything.
 */

export const colors = {
  // Brand — unchanged, matches client/src/app/globals.css
  primary: '#F97316',
  primaryPressed: '#DD5F0B',
  /** Tinted background for chips, badges and selected rows. */
  primarySoft: '#FFF1E7',
  primaryBorder: '#FCD9BD',

  // Warm neutrals. Text is a warm near-black, never pure #000.
  text: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#8C837C',
  textInverse: '#FFFFFF',

  /** Page sits slightly warm; cards are pure white and lift off it. */
  background: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EFEA',
  /** Kept for compatibility with existing styles. */
  backgroundAlt: '#F3EFEA',

  border: '#EAE4DC',
  borderStrong: '#DCD4CA',

  // Status — desaturated so they sit calmly next to the orange.
  success: '#2F7D55',
  successSoft: '#E7F3EC',
  error: '#C4453A',
  errorSoft: '#FBEAE8',
  warning: '#B45309',
  info: '#2563EB',

  overlay: 'rgba(28, 25, 23, 0.45)',
  skeleton: '#EFEAE4',
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

/** Softer, larger radii read calmer than tight corners. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/**
 * Negative tracking on large text and slightly open tracking on small caps is
 * what makes a type scale feel designed rather than default.
 */
export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  h1: { fontFamily: fonts.bold, fontSize: 23, lineHeight: 29, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 25, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  smallStrong: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },
  tiny: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 15 },
  /** Uppercase eyebrow labels. */
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  /** Prices need tabular figures so columns line up. */
  price: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.3 },
  priceLarge: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.6 },
} as const;

/**
 * Warm-tinted shadows. A neutral grey shadow over a warm page looks dirty, so
 * the shadow colour carries the same warmth as the background.
 */
export const shadow = {
  /** Barely-there lift for cards sitting on the page. */
  card: {
    shadowColor: '#7C6A58',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  raised: {
    shadowColor: '#7C6A58',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  /** For bars pinned to the bottom of the screen. */
  bar: {
    shadowColor: '#7C6A58',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
} as const;
