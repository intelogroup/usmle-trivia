/**
 * Design Tokens - Single Source of Truth
 * Generated from docs/design-tokens.md
 * 
 * This module exports design tokens as TypeScript constants
 * to ensure consistency between documentation and implementation.
 */

// Color Palette - Primary medical education theme
export const colors = {
  primary: '#0052CC',
  secondary: '#0065FF', 
  success: '#36B37E',
  warning: '#FFAB00',
  danger: '#FF5630',
  background: '#FFFFFF',
  surface: '#F4F5F7',
  textPrimary: '#172B4D',
  textSecondary: '#6B778C'
} as const;

// Typography Scale - Inter font family with medical-optimized sizing
export const typography = {
  fontFamily: {
    base: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px  
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'   // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500', 
    semibold: '600',
    bold: '700'
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  }
} as const;

// Spacing Scale - Consistent spacing system
export const spacing = {
  xxs: '0.25rem',  // 4px
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem'    // 64px
} as const;

// Border Radius - Modern, accessible radius values
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px'
} as const;

// Shadows - Consistent elevation system
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  lg: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  xl: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  '2xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
} as const;

// Breakpoints - Mobile-first responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Medical Education Specific Colors
export const medicalColors = {
  anatomy: '#E53E3E',      // Red for anatomy
  physiology: '#3182CE',   // Blue for physiology  
  pathology: '#805AD5',    // Purple for pathology
  pharmacology: '#38A169', // Green for pharmacology
  microbiology: '#D69E2E', // Yellow for microbiology
  biochemistry: '#ED8936'  // Orange for biochemistry
} as const;

// Component Specific Tokens
export const components = {
  button: {
    height: {
      sm: '2.25rem',   // 36px
      md: '2.5rem',    // 40px  
      lg: '2.75rem'    // 44px
    },
    padding: {
      sm: `${spacing.sm} ${spacing.md}`,
      md: `${spacing.md} ${spacing.lg}`, 
      lg: `${spacing.lg} ${spacing.xl}`
    }
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadow: shadows.md
  },
  input: {
    height: '2.5rem', // 40px
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md
  }
} as const;

// Animation Tokens
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms'
  },
  easing: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)', 
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  }
} as const;

// Combined theme object for easy consumption
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  medicalColors,
  components,
  animations
} as const;

// Type exports for TypeScript consumers
export type ThemeColors = typeof colors;
export type ThemeTypography = typeof typography;
export type ThemeSpacing = typeof spacing;
export type Theme = typeof theme;