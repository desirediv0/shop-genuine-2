/**
 * Design tokens mirrored from the web storefront (client/src/app/globals.css)
 * so the app and site read as the same brand.
 */

export const colors = {
  // Brand
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#D95E08',
  secondary: '#1D4ED8',
  secondaryLight: '#3B82F6',

  // Neutrals
  text: '#2A2A35',
  textMuted: '#726A78',
  textInverse: '#FFFFFF',

  background: '#FFFFFF',
  backgroundAlt: '#FFF5F9',
  surface: '#FFFFFF',
  border: '#F1E1E9',
  borderStrong: '#E4D2DC',

  // Status
  success: '#3D9A5B',
  error: '#DC3545',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Misc
  overlay: 'rgba(42, 42, 53, 0.45)',
  skeleton: '#F1E1E9',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.4 },
  h2: { fontSize: 21, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  tiny: { fontSize: 11, fontWeight: '500' as const },
} as const;

export const shadow = {
  card: {
    shadowColor: '#2A2A35',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#2A2A35',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;
