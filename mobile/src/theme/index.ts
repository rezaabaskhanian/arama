/**
 * Aramina design system — kept 1:1 with the web frontend's design tokens
 * (src/app/globals.css). Brand = dreamy lilac-violet, accent = warm coral,
 * calm = teal-green, warm = amber; on a soft dusty-lavender surface.
 * Typography is Vazir (bundled), matching the web `--font-vazir`.
 */

export const colors = {
  // Brand (لَوندری-بنفشِ رؤیایی)
  primary: '#7e66c6', // brand-500
  primaryDark: '#47367b', // brand-800
  primaryDeep: '#3b2f63', // brand-900 (dark surfaces)
  primarySoft: '#e9e5f7', // brand-100
  primaryTint: '#f4f2fb', // brand-50

  // Accent (کورال گرم)
  accent: '#f43f5e', // accent-500
  accentDark: '#e11d48', // accent-600
  accentSoft: '#ffe4e6', // accent-100
  accentTint: '#fff1f2', // accent-50

  // Calm (سبز-فیروزه‌ای)
  calm: '#10b981', // calm-500
  calmDark: '#059669', // calm-600
  calmSoft: '#d1fae5', // calm-100
  calmTint: '#ecfdf5', // calm-50

  // Warm (کهربایی)
  warm: '#f59e0b', // warm-500
  warmSoft: '#fbbf24', // warm-400
  warmTint: '#fffbeb', // warm-50

  // Surfaces
  background: '#eeebf6', // --color-surface
  surface: '#ffffff', // --color-surface-2
  surfaceMuted: '#f4f2fb', // brand-50
  overlay: 'rgba(59, 47, 99, 0.45)',

  // Text (slate)
  text: '#0f172a', // slate-900 (headings)
  textBody: '#1e293b', // slate-800
  textMuted: '#64748b', // slate-500
  textFaint: '#94a3b8', // slate-400
  onPrimary: '#ffffff',

  // Feedback
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  dangerSoft: '#fee2e2',

  // Lines
  border: '#eef2f7', // ~slate-100
  white: '#ffffff',
} as const;

/** Per-feature accent gradients (start → end) — mirror the web `bg-gradient` pairs. */
export const gradients = {
  violet: ['#7e66c6', '#574098'] as const, // brand gradient
  brand: ['#7e66c6', '#47367b'] as const,
  pink: ['#fb7185', '#f43f5e'] as const, // btn-accent (coral)
  amber: ['#fbbf24', '#f59e0b'] as const,
  teal: ['#34d399', '#059669'] as const, // calm
  sky: ['#38bdf8', '#2563eb'] as const,
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
  lg: 24, // ~radius-xl2 (1.5rem)
  xl: 32, // ~radius-card (2rem)
  pill: 999,
} as const;

/** iOS/Android-agnostic soft shadow presets (mirror --shadow-soft/--shadow-card). */
export const shadow = {
  card: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  soft: {
    shadowColor: '#6a50b4',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  floating: {
    shadowColor: '#3b2f63',
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
} as const;

/**
 * The whole app is Persian, so text defaults to right alignment + rtl writing.
 * Spread this onto Text styles rather than forcing global I18nManager (which
 * needs a native restart and flips every flexbox unpredictably).
 */
/**
 * Vazir is bundled (see react-native.config.js). A single weight file is used
 * for every weight — matching the web app, which ships one Vazir.ttf and lets
 * the renderer synthesise bolder cuts. `fontWeight` is still set on styles.
 */
export const FONT_FAMILY = 'Vazir';

/**
 * Spread onto Persian text styles: right-aligned, RTL, and — crucially — the
 * Vazir family. Putting the font here guarantees it lands on virtually all text
 * (App.tsx also patches Text/TextInput render as a belt-and-braces fallback).
 */
export const rtlText = {
  fontFamily: FONT_FAMILY,
  textAlign: 'right' as const,
  writingDirection: 'rtl' as const,
};

export const font = {
  family: FONT_FAMILY,
  black: '800' as const,
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};
