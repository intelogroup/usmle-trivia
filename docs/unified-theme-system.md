# 🎨 Unified Theme System Documentation

## Overview

The MedQuiz Pro application now uses a **unified theme system** that consolidates design tokens with Tailwind CSS, ensuring consistency between documentation, TypeScript code, and CSS styling.

## Architecture

### Files Structure

```
src/theme/
├── index.ts              # Main theme system with TypeScript definitions
├── README.md            # Theme-specific documentation
tailwind.theme.js        # JavaScript theme exports for Tailwind CSS
tailwind.config.js       # Tailwind configuration using unified theme
src/index.css            # CSS variables based on design tokens
docs/
└── unified-theme-system.md  # This comprehensive guide
```

## Core Features

### ✅ Design Token Compliance
- **100% compliant** with `/docs/design-tokens.md` specifications
- All colors, typography, spacing, and other tokens exactly match documentation
- Hex colors (`#0052CC`) automatically converted to HSL for CSS compatibility

### ✅ Dual Format Support
Every color provides both hex and HSL values:
```typescript
colors.primary.hex  // "#0052CC"
colors.primary.hsl  // "216 90% 39%"
```

### ✅ Tailwind CSS Integration
CSS variables work seamlessly with Tailwind:
```jsx
<div className="bg-primary text-primary-foreground">
<div className="bg-medical-anatomy">  {/* Medical specialty colors */}
```

### ✅ Medical Education Specific
Specialized colors for medical subjects:
- `medical-anatomy` - Red for anatomy
- `medical-physiology` - Blue for physiology
- `medical-pathology` - Purple for pathology
- `medical-pharmacology` - Green for pharmacology
- `medical-microbiology` - Yellow for microbiology
- `medical-biochemistry` - Orange for biochemistry

## Usage Examples

### TypeScript Components

```typescript
import { theme, colors } from '../theme';

// Use hex colors for JavaScript calculations
const primaryColor = colors.primary.hex; // "#0052CC"

// Use theme object for comprehensive access
const buttonPadding = theme.components.button.padding.md;
```

### React Components with Tailwind

```jsx
// Standard semantic colors
<Button className="bg-primary text-primary-foreground">
  Start Quiz
</Button>

// Medical specialty colors
<div className="bg-medical-cardiology text-white">
  Cardiology Questions
</div>

// Using CSS variables directly
<div style={{ backgroundColor: 'hsl(var(--primary))' }}>
  Custom styling
</div>
```

### CSS Classes

```css
/* Design token based utilities */
.custom-component {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: var(--spacing-md);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}

/* Medical specialty utilities */
.anatomy-highlight {
  color: hsl(var(--medical-anatomy));
}

.gradient-medical {
  background: var(--gradient-primary);
}
```

## Theme Configuration

### Available Colors

#### Core Brand Colors (from design tokens)
- `primary` - #0052CC (Medical blue)
- `secondary` - #0065FF (Bright blue)
- `success` - #36B37E (Medical green)
- `warning` - #FFAB00 (Medical amber)
- `danger` - #FF5630 (Medical red)

#### Medical Specialty Colors
- `medical-anatomy` - #E53E3E (Red)
- `medical-physiology` - #3182CE (Blue)
- `medical-pathology` - #805AD5 (Purple)
- `medical-pharmacology` - #38A169 (Green)
- `medical-microbiology` - #D69E2E (Yellow)
- `medical-biochemistry` - #ED8936 (Orange)

#### UI Semantic Colors
- `background` - #FFFFFF
- `foreground` - #172B4D
- `muted` - #F4F5F7
- `border` - #E4E7EC
- `input` - #E4E7EC
- And many more...

### Typography Scale

```typescript
typography: {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem'  // 36px
  }
}
```

### Spacing System

```typescript
spacing: {
  xxs: '0.25rem',   // 4px
  xs: '0.5rem',     // 8px
  sm: '0.75rem',    // 12px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '2.5rem',  // 40px
  '3xl': '3rem',    // 48px
  '4xl': '4rem'     // 64px
}
```

## Dark Mode Support

The theme system includes complete dark mode support:

```css
.dark {
  --background: 222 84% 5%;
  --foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  /* ... all colors adjusted for dark mode */
}
```

Enable dark mode by adding the `dark` class to the root element:

```jsx
<html className="dark">
```

## Advanced Features

### CSS Variable Generation

Generate CSS variables programmatically:

```typescript
import { generateCSSVariables } from '../theme';

const lightVars = generateCSSVariables(false);
const darkVars = generateCSSVariables(true);
```

### Backward Compatibility

The old theme system imports still work:

```typescript
// Still works, but use new unified system
import { colors } from '../theme';
const primaryHex = colors.primary.hex; // New way
```

### Medical Color Utilities

Special utilities for medical education:

```jsx
// Use medical specialty colors in components
<span className="text-medical-anatomy">Anatomy</span>
<div className="bg-medical-physiology">Physiology</div>
```

## Migration Guide

### From Old Theme System

**Before:**
```typescript
import { theme } from '../theme';
const primaryColor = theme.colors.primary; // "#0052CC"
```

**After:**
```typescript
import { theme } from '../theme';
const primaryColor = theme.colors.primary.hex; // "#0052CC"
const primaryHsl = theme.colors.primary.hsl;   // "216 90% 39%"
```

### CSS Variables

**Before:**
```css
:root {
  --primary: 216 90% 58%;
}
```

**After:**
```css
/* Generated from design tokens */
:root {
  --primary: 216 90% 39%;  /* Accurate HSL conversion */
}
```

## Best Practices

### ✅ Do:
- Use semantic color names (`bg-primary`, `text-success`)
- Leverage medical specialty colors for subject-specific UI
- Use design token spacing and typography
- Import from the unified theme system

### ❌ Don't:
- Hard-code color values or spacing
- Mix old and new theme approaches in the same component
- Override CSS variables without updating theme tokens
- Use non-semantic color references

## Troubleshooting

### Build Issues
If you encounter build errors:

1. Ensure `tailwind.theme.js` is in sync with `src/theme/index.ts`
2. Check that CSS variables match the generated values
3. Verify imports use the correct file paths

### Color Inconsistencies
If colors don't match between CSS and TypeScript:

1. Use the hex-to-HSL conversion utility
2. Check that CSS variables are generated from design tokens
3. Ensure dark mode colors are properly configured

### Performance
The theme system is optimized for:
- Build-time processing (no runtime overhead)
- CSS variable efficiency
- Tree-shaking unused theme parts

## Contributing

When adding new colors or theme tokens:

1. Update `src/theme/index.ts` with TypeScript definitions
2. Update `tailwind.theme.js` with JavaScript exports
3. Update `src/index.css` with CSS variables
4. Add documentation to this README
5. Test both light and dark modes

## Reference Links

- [Design Tokens Specification](./design-tokens.md)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**🏥 This unified theme system ensures MedQuiz Pro maintains consistent, professional medical education branding across all interfaces while providing developers with a flexible, maintainable styling solution.**