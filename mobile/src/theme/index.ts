/**
 * Aramina design system.
 * Mirrors the web app's calm "butterfly" identity: violet primary, pink accent,
 * on a soft lilac background. Everything the UI needs lives here so screens stay
 * declarative and consistent.
 */

export const colors = {
  // Brand
  primary: '#7C3AED', // violet-600
  primaryDark: '#5B21B6', // violet-800
  primarySoft: '#EDE9FE', // violet-100
  accent: '#EC4899', // pink-500
  accentSoft: '#FCE7F3', // pink-100

  // Surfaces
  background: '#EEEBF6', // soft lilac
  surface: '#FFFFFF',
  surfaceMuted: '#F7F5FB',
  overlay: 'rgba(17, 12, 34, 0.45)',

  // Text
  text: '#1E1B2E',
  textMuted: '#6B6780',
  textFaint: '#A29DB5',
  onPrimary: '#FFFFFF',

  // Feedback
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Lines
  border: '#EAE6F2',
  white: '#FFFFFF',
} as const;

/** Per-feature accent gradients (start → end) used across cards and icons. */
export const gradients = {
  violet: ['#8B5CF6', '#6D28D9'] as const,
  pink: ['#F472B6', '#DB2777'] as const,
  amber: ['#FBBF24', '#EA580C'] as const,
  teal: ['#2DD4BF', '#0D9488'] as const,
  sky: ['#38BDF8', '#2563EB'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

/** iOS/Android-agnostic soft shadow presets. */
export const shadow = {
  card: {
    shadowColor: '#4C1D95',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  floating: {
    shadowColor: '#4C1D95',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const;

/**
 * The whole app is Persian, so text defaults to right alignment + rtl writing.
 * Spread this onto Text styles rather than forcing global I18nManager (which
 * needs a native restart and flips every flexbox unpredictably).
 */
export const rtlText = {
  textAlign: 'right' as const,
  writingDirection: 'rtl' as const,
};

export const font = {
  // System font; swap for a bundled Vazirmatn later if desired.
  black: '800' as const,
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};
