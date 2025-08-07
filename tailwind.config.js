import { tailwindColors, typography, spacing, borderRadius, animations } from './tailwind.theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
      // Use unified color system from design tokens
      colors: {
        ...tailwindColors,
      },
      // Use design token typography
      fontFamily: {
        sans: typography.fontFamily.base.split(', '),
      },
      fontSize: {
        ...typography.fontSize,
      },
      fontWeight: {
        ...typography.fontWeight,
      },
      lineHeight: {
        ...typography.lineHeight,
      },
      // Use design token spacing (extend with additional values)
      spacing: {
        ...spacing,
      },
      // Use design token border radius with CSS variable fallback
      borderRadius: {
        ...borderRadius,
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Use design token animations
      transitionDuration: {
        ...animations.duration,
      },
      transitionTimingFunction: {
        ...animations.easing,
      },
      // Custom keyframes and animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Add custom animations based on design tokens
        "animate-in": {
          from: { 
            opacity: "0", 
            transform: "translateY(10px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        "fade-up": {
          from: { 
            opacity: "0", 
            transform: "translateY(20px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        "slide-in": {
          from: { 
            opacity: "0", 
            transform: "translateX(-20px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateX(0)" 
          },
        },
      },
      animation: {
        "accordion-down": `accordion-down ${animations.duration.normal} ${animations.easing.easeOut}`,
        "accordion-up": `accordion-up ${animations.duration.normal} ${animations.easing.easeOut}`,
        "animate-in": `animate-in ${animations.duration.slow} ${animations.easing.easeOut}`,
        "fade-up": `fade-up 0.5s ${animations.easing.easeOut}`,
        "slide-in": `slide-in 0.4s ${animations.easing.easeOut}`,
      },
      // Add medical-specific utilities
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
      },
      boxShadow: {
        'custom': 'var(--shadow)',
        'custom-md': 'var(--shadow-md)',
        'custom-lg': 'var(--shadow-lg)',
        'custom-xl': 'var(--shadow-xl)',
      },
    },
  },
  plugins: [],
}