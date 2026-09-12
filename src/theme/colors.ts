export const colors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  primary: '#0B1F3A',
  primaryLight: '#13315C',
  accent: '#2F80ED',
  accentSoft: '#E8F0FE',
  success: '#1E9E6A',
  warning: '#D68A00',
  danger: '#D64545',
  textPrimary: '#0B1F3A',
  textSecondary: '#5B6B82',
  textMuted: '#8B98AC',
  border: '#E1E6EE',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '500' as const },
};
