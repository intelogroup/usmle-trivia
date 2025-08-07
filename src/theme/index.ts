/**
 * Design Tokens - Unified Theme System
 * Generated from docs/design-tokens.md with Tailwind CSS integration
 * 
 * This module exports design tokens as TypeScript constants with both
 * hex and HSL values to ensure consistency between documentation,
 * implementation, and Tailwind CSS.
 */

// Utility function to convert hex to HSL
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Color definition interface
interface ColorDefinition {
  hex: string;
  hsl: string;
}

function createColor(hex: string): ColorDefinition {
  return {
    hex,
    hsl: hexToHsl(hex)
  };
}

// Color Palette - Primary medical education theme (from docs/design-tokens.md)
export const colors = {
  // Core brand colors
  primary: createColor('#0052CC'),
  secondary: createColor('#0065FF'),
  success: createColor('#36B37E'),
  warning: createColor('#FFAB00'),
  danger: createColor('#FF5630'),
  background: createColor('#FFFFFF'),
  surface: createColor('#F4F5F7'),
  textPrimary: createColor('#172B4D'),
  textSecondary: createColor('#6B778C'),
  
  // Extended colors for Tailwind CSS compatibility
  foreground: createColor('#172B4D'),
  card: createColor('#FFFFFF'),
  cardForeground: createColor('#172B4D'),
  popover: createColor('#FFFFFF'),
  popoverForeground: createColor('#172B4D'),
  primaryForeground: createColor('#FFFFFF'),
  secondaryForeground: createColor('#172B4D'),
  muted: createColor('#F4F5F7'),
  mutedForeground: createColor('#6B778C'),
  accent: createColor('#F4F5F7'),
  accentForeground: createColor('#172B4D'),
  destructive: createColor('#FF5630'),
  destructiveForeground: createColor('#FFFFFF'),
  border: createColor('#E4E7EC'),
  input: createColor('#E4E7EC'),
  ring: createColor('#0052CC'),
  info: createColor('#E7F3FF'),
  infoForeground: createColor('#0052CC')
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
  anatomy: createColor('#E53E3E'),      // Red for anatomy
  physiology: createColor('#3182CE'),   // Blue for physiology  
  pathology: createColor('#805AD5'),    // Purple for pathology
  pharmacology: createColor('#38A169'), // Green for pharmacology
  microbiology: createColor('#D69E2E'), // Yellow for microbiology
  biochemistry: createColor('#ED8936')  // Orange for biochemistry
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

// CSS Custom Properties generator for CSS variables
export const generateCSSVariables = (isDark = false) => {
  const cssVars: Record<string, string> = {};
  
  // Base colors - convert camelCase to kebab-case
  Object.entries(colors).forEach(([key, color]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssVars[`--${cssKey}`] = color.hsl;
  });
  
  // Medical colors
  Object.entries(medicalColors).forEach(([key, color]) => {
    cssVars[`--medical-${key}`] = color.hsl;
  });

  // Shadows
  Object.entries(shadows).forEach(([key, shadow]) => {
    cssVars[`--shadow${key === 'md' ? '' : `-${key}`}`] = shadow;
  });

  // Border radius
  cssVars['--radius'] = borderRadius.lg;

  // Gradients
  cssVars['--gradient-primary'] = `linear-gradient(135deg, hsl(${colors.primary.hsl}) 0%, hsl(${colors.secondary.hsl}) 100%)`;
  cssVars['--gradient-secondary'] = `linear-gradient(135deg, hsl(${colors.muted.hsl}) 0%, hsl(${colors.surface.hsl}) 100%)`;
  
  // Dark mode adjustments
  if (isDark) {
    cssVars['--background'] = '222 84% 5%';
    cssVars['--foreground'] = '210 40% 98%';
    cssVars['--card'] = '222 84% 5%';
    cssVars['--card-foreground'] = '210 40% 98%';
    cssVars['--popover'] = '222 84% 5%';
    cssVars['--popover-foreground'] = '210 40% 98%';
    cssVars['--primary'] = '217 91% 60%';
    cssVars['--primary-foreground'] = '222 47% 11%';
    cssVars['--secondary'] = '217 33% 18%';
    cssVars['--secondary-foreground'] = '210 40% 98%';
    cssVars['--muted'] = '217 33% 18%';
    cssVars['--muted-foreground'] = '215 20% 65%';
    cssVars['--accent'] = '217 33% 18%';
    cssVars['--accent-foreground'] = '210 40% 98%';
    cssVars['--border'] = '217 33% 18%';
    cssVars['--input'] = '217 33% 18%';
    cssVars['--ring'] = '217 91% 60%';
    cssVars['--destructive'] = '0 63% 31%';
    cssVars['--info'] = '217 33% 18%';
    cssVars['--info-foreground'] = '204 91% 80%';
  }
  
  return cssVars;
};

// Tailwind CSS color configuration
export const tailwindColors = {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))'
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))'
  },
  success: {
    DEFAULT: 'hsl(var(--success))',
    foreground: 'hsl(var(--success-foreground) / 0.1)'
  },
  warning: {
    DEFAULT: 'hsl(var(--warning))',
    foreground: 'hsl(var(--warning-foreground) / 0.1)'
  },
  danger: {
    DEFAULT: 'hsl(var(--danger))',
    foreground: 'hsl(var(--destructive-foreground))'
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))'
  },
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))'
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))'
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))'
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))'
  },
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  info: {
    DEFAULT: 'hsl(var(--info))',
    foreground: 'hsl(var(--info-foreground))'
  },
  // Medical colors for Tailwind
  'medical-anatomy': 'hsl(var(--medical-anatomy))',
  'medical-physiology': 'hsl(var(--medical-physiology))',
  'medical-pathology': 'hsl(var(--medical-pathology))',
  'medical-pharmacology': 'hsl(var(--medical-pharmacology))',
  'medical-microbiology': 'hsl(var(--medical-microbiology))',
  'medical-biochemistry': 'hsl(var(--medical-biochemistry))'
};

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
  animations,
  // New unified utilities
  generateCSSVariables,
  tailwindColors
} as const;

// Type exports for TypeScript consumers
export type ColorDefinition = {
  hex: string;
  hsl: string;
};
export type ThemeColors = typeof colors;
export type ThemeTypography = typeof typography;
export type ThemeSpacing = typeof spacing;
export type Theme = typeof theme;

// Helper function to get hex colors (backward compatibility)
export const getHexColors = () => {
  const hexColors: Record<string, string> = {};
  Object.entries(colors).forEach(([key, color]) => {
    hexColors[key] = color.hex;
  });
  return hexColors;
};

// Helper function to get HSL colors
export const getHslColors = () => {
  const hslColors: Record<string, string> = {};
  Object.entries(colors).forEach(([key, color]) => {
    hslColors[key] = color.hsl;
  });
  return hslColors;
};