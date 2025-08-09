# Design Tokens - Minimal Light Theme

This document defines the core design tokens for the MedQuiz Pro minimal light theme design system, focusing on clean functionality and optimal performance.

## Design Philosophy
**Minimal • Functional • Fast • Accessible**

The design system prioritizes:
- **Clean interfaces** without visual clutter
- **Fast loading** and optimal performance
- **Accessibility first** with WCAG 2.1 AA compliance
- **Medical education focus** without distracting effects

## Simplified Color Palette

### Primary Colors
```json
{
  "color-primary": "#0052CC",
  "color-primary-hover": "#003C99",
  "color-primary-light": "#E8F2FF",
  "color-text-primary": "#1A1A1A",
  "color-text-secondary": "#666666",
  "color-background": "#FFFFFF",
  "color-surface": "#F8F9FA"
}
```

### Functional Colors
```json
{
  "color-success": "#16A34A",
  "color-warning": "#EA580C", 
  "color-danger": "#DC2626",
  "color-border": "#E5E7EB",
  "color-border-light": "#F3F4F6"
}
```

### Grayscale System
```json
{
  "color-gray-50": "#F9FAFB",
  "color-gray-100": "#F3F4F6",
  "color-gray-200": "#E5E7EB",
  "color-gray-300": "#D1D5DB",
  "color-gray-500": "#6B7280",
  "color-gray-700": "#374151",
  "color-gray-900": "#111827"
}
```

## Clean Typography Scale
```json
{
  "font-family-base": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  "font-size-xs": "0.75rem",
  "font-size-sm": "0.875rem", 
  "font-size-base": "1rem",
  "font-size-lg": "1.125rem",
  "font-size-xl": "1.25rem",
  "font-size-2xl": "1.5rem",
  "font-size-3xl": "1.875rem"
}
```

## Simplified Spacing System
```json
{
  "spacing-1": "0.25rem",
  "spacing-2": "0.5rem",
  "spacing-3": "0.75rem", 
  "spacing-4": "1rem",
  "spacing-6": "1.5rem",
  "spacing-8": "2rem",
  "spacing-12": "3rem",
  "spacing-16": "4rem"
}
```

## Minimal Visual Effects

### Subtle Shadows
```json
{
  "shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  "shadow-base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  "shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
}
```

### Clean Borders
```json
{
  "border-width-thin": "1px",
  "border-radius-sm": "0.25rem",
  "border-radius-base": "0.375rem",
  "border-radius-md": "0.5rem",
  "border-radius-lg": "0.75rem"
}
```

## Removed Visual Complexity
The minimal theme **eliminates**:
- ❌ Gradients and complex color transitions
- ❌ Glass/frosted effects and backdrop blur
- ❌ Complex animations and micro-interactions
- ❌ Heavy drop shadows and multiple shadow layers
- ❌ Unnecessary visual flourishes
- ❌ Complex dark mode theming (light theme focus)

## Performance Optimizations
- **Minimal color palette** reduces CSS bundle size
- **Simple effects** improve rendering performance
- **Clean borders** reduce paint complexity
- **Subtle shadows** optimize compositing layers
- **System fonts** improve loading speed
