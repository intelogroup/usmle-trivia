/** @type {import('tailwindcss').Config} */
// Enhanced Tailwind config with design token integration
// Note: This requires a build setup that can handle the TypeScript import

// For development, we'll use a JavaScript version to avoid import issues
const designTokens = {
  colors: {
    primary: '#0052CC',
    secondary: '#0065FF', 
    success: '#36B37E',
    warning: '#FFAB00',
    danger: '#FF5630',
    background: '#FFFFFF',
    surface: '#F4F5F7',
    textPrimary: '#172B4D',
    textSecondary: '#6B778C'
  },
  typography: {
    fontFamily: {
      base: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    fontSize: {
      xs: '0.75rem',   
      sm: '0.875rem',   
      md: '1rem',      
      lg: '1.125rem',  
      xl: '1.25rem',   
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  spacing: {
    xxs: '0.25rem',
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    lg: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    xl: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '2xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  medicalColors: {
    anatomy: '#E53E3E',
    physiology: '#3182CE',
    pathology: '#805AD5',
    pharmacology: '#38A169',
    microbiology: '#D69E2E',
    biochemistry: '#ED8936'
  },
  animations: {
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
  }
};

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Design token integration - colors
      colors: {
        // Existing CSS variable approach (for backwards compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Design token colors (from theme system)
        'token-primary': designTokens.colors.primary,
        'token-secondary': designTokens.colors.secondary,
        'token-success': designTokens.colors.success,
        'token-warning': designTokens.colors.warning,
        'token-danger': designTokens.colors.danger,
        'token-surface': designTokens.colors.surface,
        'token-text-primary': designTokens.colors.textPrimary,
        'token-text-secondary': designTokens.colors.textSecondary,
        // Medical education specific colors
        medical: designTokens.medicalColors,
      },
      // Design token integration - spacing
      spacing: {
        ...designTokens.spacing,
      },
      // Design token integration - border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)", 
        sm: "calc(var(--radius) - 4px)",
        // Design token values
        ...designTokens.borderRadius,
      },
      // Design token integration - typography
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        'token-base': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        ...designTokens.typography.fontSize,
      },
      // Design token integration - shadows
      boxShadow: {
        ...designTokens.shadows,
        'custom': 'var(--shadow)',
        'custom-md': 'var(--shadow-md)',
        'custom-lg': 'var(--shadow-lg)',
        'custom-xl': 'var(--shadow-xl)',
      },
      // Enhanced animations with design token values
      transitionDuration: {
        ...designTokens.animations.duration,
      },
      transitionTimingFunction: {
        'ease-out-custom': designTokens.animations.easing.easeOut,
        'ease-in-custom': designTokens.animations.easing.easeIn,
        'ease-in-out-custom': designTokens.animations.easing.easeInOut,
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Medical education specific animations
        "pulse-success": {
          "0%, 100%": { 
            backgroundColor: designTokens.colors.success,
            transform: "scale(1)",
          },
          "50%": { 
            backgroundColor: designTokens.colors.success,
            transform: "scale(1.05)",
          },
        },
        "slide-in-question": {
          "0%": {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          "100%": {
            opacity: "1", 
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-success": "pulse-success 1s ease-in-out infinite",
        "slide-in-question": "slide-in-question 0.3s ease-out",
      },
    },
  },
  plugins: [],
}