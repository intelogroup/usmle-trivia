# Design System Theme Integration

This folder contains the centralized design system implementation for MedQuiz Pro, connecting design tokens from `docs/design-tokens.md` to code implementation.

## 📁 Files

- `index.ts` - Main theme export with all design tokens as TypeScript constants
- `README.md` - This documentation

## 🎨 Usage

### Import the Theme

```typescript
import { theme, colors, typography, spacing } from '@/theme';

// Use individual token categories
const primaryColor = colors.primary;
const baseSpacing = spacing.md;

// Or use the complete theme object
const buttonHeight = theme.components.button.height.md;
```

### In React Components

```tsx
import { theme } from '@/theme';

const MyComponent = () => (
  <div 
    style={{ 
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md
    }}
  >
    Content
  </div>
);
```

### With Tailwind CSS

The theme is integrated into `tailwind.config.js` via two approaches:

#### 1. Design Token Classes (Recommended)
```html
<!-- Use token-prefixed classes for design system colors -->
<div className="bg-token-primary text-white p-lg rounded-md">
  Design System Button
</div>

<!-- Medical-specific colors -->
<span className="text-medical-anatomy">Anatomy Topic</span>
<span className="text-medical-physiology">Physiology Topic</span>
```

#### 2. CSS Custom Properties (Existing)
```html
<!-- Existing approach using CSS variables -->
<div className="bg-primary text-primary-foreground p-6 rounded-lg">
  Standard Button
</div>
```

## 🏥 Medical Education Tokens

### Medical Subject Colors
```typescript
import { medicalColors } from '@/theme';

// Available colors for medical specialties
medicalColors.anatomy      // #E53E3E (Red)
medicalColors.physiology   // #3182CE (Blue)
medicalColors.pathology    // #805AD5 (Purple)
medicalColors.pharmacology // #38A169 (Green)
medicalColors.microbiology // #D69E2E (Yellow)
medicalColors.biochemistry // #ED8936 (Orange)
```

### Component-Specific Tokens
```typescript
import { components } from '@/theme';

// Button sizing
components.button.height.sm    // 2.25rem (36px)
components.button.height.md    // 2.5rem (40px)
components.button.height.lg    // 2.75rem (44px)

// Card styling
components.card.padding        // 1.5rem (24px)
components.card.borderRadius   // 0.5rem (8px)
components.card.shadow         // Medium shadow
```

## 🔄 Keeping Tokens in Sync

### 1. Update Design Tokens
When designers update `docs/design-tokens.md`:

1. Update the corresponding values in `src/theme/index.ts`
2. Run Storybook to preview changes: `npm run storybook`
3. Update components to use new token values
4. Test in both light and dark modes

### 2. Validation
```bash
# Run Storybook to validate design system
npm run storybook

# Test accessibility compliance
# (Storybook a11y addon will flag any issues)

# Type checking
npm run type-check
```

### 3. Migration Guide
Moving from hardcoded values to design tokens:

**Before:**
```tsx
<button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md">
  Click me
</button>
```

**After:**
```tsx
import { theme } from '@/theme';

<button 
  className="bg-token-primary hover:bg-token-primary/90 px-md py-sm rounded-md"
  // Or with inline styles for complex calculations:
  style={{
    backgroundColor: theme.colors.primary,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md
  }}
>
  Click me
</button>
```

## 🎭 Storybook Integration

All components in Storybook automatically use the design system:

1. **Component Stories** - Document design token usage
2. **Accessibility Panel** - Validates color contrast ratios
3. **Viewport Testing** - Tests responsive breakpoints
4. **Dark Mode Toggle** - Tests theme variants

### View in Storybook
```bash
npm run storybook
```

Navigate to:
- `UI Components/Button` - See all button variants with design tokens
- `UI Components/Card` - Medical education specific card examples
- `UI Components/Input` - Form elements with proper styling

## 📏 Responsive Breakpoints

```typescript
import { breakpoints } from '@/theme';

// Available breakpoints match Tailwind defaults
breakpoints.sm   // 640px
breakpoints.md   // 768px
breakpoints.lg   // 1024px
breakpoints.xl   // 1280px
breakpoints['2xl'] // 1536px
```

## 🎨 Animations

```typescript
import { animations } from '@/theme';

// Duration tokens
animations.duration.fast    // 150ms
animations.duration.normal  // 200ms
animations.duration.slow    // 300ms

// Easing functions
animations.easing.easeOut    // cubic-bezier(0.0, 0.0, 0.2, 1)
animations.easing.easeIn     // cubic-bezier(0.4, 0.0, 1, 1)
animations.easing.easeInOut  // cubic-bezier(0.4, 0.0, 0.2, 1)
```

## 🚀 Production Ready

This theme system is production-ready and provides:

- ✅ **Type Safety** - Full TypeScript support
- ✅ **Design Consistency** - Single source of truth
- ✅ **Developer Experience** - IntelliSense and autocompletion
- ✅ **Medical Context** - Healthcare-specific color semantics
- ✅ **Accessibility** - WCAG 2.1 AA compliant color combinations
- ✅ **Performance** - Minimal runtime overhead
- ✅ **Maintainability** - Easy to update and extend

## 🔗 Related Files

- `docs/design-tokens.md` - Design specification
- `tailwind.config.js` - Tailwind integration
- `.storybook/preview.ts` - Storybook configuration
- `src/components/ui/` - Component implementations