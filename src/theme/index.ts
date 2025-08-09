/**
 * Simplified Design Tokens - Minimal Light Theme
 */

// Essential color palette - light theme only
export const colors = {
  primary: '#0052CC',
  secondary: '#0065FF', 
  success: '#36B37E',
  warning: '#FFAB00',
  destructive: '#FF5630',
  background: '#FFFFFF',
  foreground: '#172B4D',
  muted: '#F4F5F7',
  mutedForeground: '#6B778C',
  border: '#E4E7EC',
} as const;

// Medical education colors
export const medicalColors = {
  anatomy: '#E53E3E',
  physiology: '#3182CE',
  pathology: '#805AD5',
  pharmacology: '#38A169',
} as const;

// Typography - Inter font system
export const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
} as const;

// Simplified spacing system
export const spacing = {
  xs: '0.5rem',
  sm: '0.75rem', 
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

// Combined theme export
export const theme = {
  colors,
  medicalColors,
  typography,
  spacing,
} as const;

export type Theme = typeof theme;