# Storybook Component Library - Minimal Design System

This document describes the Storybook setup for MedQuiz Pro's minimal light theme component library, focusing on accessibility validation and clean design patterns.

## Design System Philosophy in Storybook

### Minimal Theme Validation
- **Clean component examples** without visual complexity
- **Accessibility-first testing** for all component states
- **Performance impact documentation** for each component
- **Responsive design verification** across device sizes

## Installation & Startup
```bash
npm install
npm run storybook
```

Storybook will be available at <http://localhost:6006> by default.

## Core Component Documentation

### Essential Components
- **`QuestionCard`**: Minimal card design with white background and subtle shadows
- **`ProgressBar`**: Clean progress indicator using primary blue (#0052CC)
- **`ScoreIndicator`**: Simple score display without complex visual effects
- **`Button`**: Solid color buttons with clear hover states
- **`Navigation`**: Clean header and sidebar layouts
- **`Modal`**: Simple overlay dialogs with high contrast

### Minimal Theme Examples
Each component includes stories for:
- **Default state** - Clean minimal styling
- **Loading state** - Simple skeleton placeholders
- **Error state** - High contrast error messages
- **Empty state** - Clear messaging with actionable buttons
- **Accessibility state** - High contrast and keyboard focus examples

## Accessibility Testing & Validation

### Required Addons
```json
{
  "@storybook/addon-a11y": "Accessibility panel for WCAG compliance",
  "@storybook/addon-viewport": "Responsive design testing",
  "@storybook/addon-controls": "Component prop testing",
  "@storybook/addon-docs": "Documentation generation"
}
```

### Accessibility Validation Checklist
For each component story:
- [ ] **Color contrast** meets WCAG 2.1 AA standards (4.5:1 minimum)
- [ ] **Keyboard navigation** functions without mouse interaction
- [ ] **Screen reader** announces content appropriately
- [ ] **Focus indicators** are clearly visible (2px outline minimum)
- [ ] **Touch targets** meet 44px minimum size requirement
- [ ] **Motion preferences** respect prefers-reduced-motion

### Testing Stories Required
```javascript
// Example minimal button stories
export const Default = {
  args: {
    children: 'Start Quiz',
    variant: 'primary'
  }
};

export const AccessibilityFocus = {
  args: {
    children: 'Focused Button',
    className: 'focus-visible'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates high-contrast focus indicator meeting WCAG AA standards.'
      }
    }
  }
};

export const HighContrast = {
  args: {
    children: 'High Contrast',
    variant: 'primary'
  },
  parameters: {
    backgrounds: { 
      default: 'dark',
      values: [{ name: 'dark', value: '#000000' }]
    }
  }
};
```

## Medical Education Component Patterns

### Question Display Components
- **Clinical Scenario Cards** - Clean white backgrounds with readable typography
- **Answer Option Lists** - Simple radio/checkbox styling without decorative elements
- **Explanation Panels** - Clear text hierarchy for medical content
- **Progress Indicators** - Minimal progress bars using primary blue

### Interactive Elements
- **Quiz Navigation** - Clean button groups for question advancement
- **Timer Components** - Simple countdown displays without complex animations
- **Score Displays** - Clear numerical feedback with semantic colors
- **Settings Panels** - Minimal form layouts for user preferences

## Performance Documentation

### Component Metrics
Document for each component:
- **Bundle size impact** - Additional CSS/JS weight
- **Render performance** - Paint complexity score
- **Accessibility overhead** - ARIA attributes and screen reader support
- **Mobile optimization** - Touch interaction and responsive behavior

### Example Performance Story
```javascript
export const PerformanceProfile = {
  parameters: {
    docs: {
      description: {
        story: `
          **Bundle Impact**: +2.4KB CSS, +1.1KB JS
          **Render Performance**: Low complexity (no gradients/animations)  
          **Accessibility**: WCAG AA compliant with ARIA labels
          **Mobile**: Touch-optimized with 44px minimum targets
        `
      }
    }
  }
};
```

## Visual Regression Testing

### Chromatic Integration
```bash
# Visual testing for minimal theme consistency
npm run chromatic
```

### Critical Visual Tests
- **Color consistency** across all component variants
- **Typography rendering** with Inter font and fallbacks
- **Spacing consistency** using design token system
- **Border and shadow rendering** for subtle depth
- **Focus state visibility** across all interactive elements

## How to Add Minimal Theme Components

### 1. Component Creation
```bash
# Create component with minimal styling
src/components/ComponentName.tsx
src/components/ComponentName.module.css  # Optional for complex styling
```

### 2. Story Documentation
```bash
src/stories/ComponentName.stories.tsx
```

Required story structure:
```javascript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '../components/ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'MedQuiz/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      description: {
        component: 'Minimal design component following MedQuiz Pro accessibility standards.'
      }
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

// Required stories
export const Default: Story = { /* default state */ };
export const Loading: Story = { /* loading skeleton */ };
export const Error: Story = { /* error state */ };
export const AccessibilityTest: Story = { /* a11y validation */ };
```

### 3. Accessibility Documentation
Include for each story:
- **Contrast ratios** for all color combinations
- **Keyboard interaction** patterns
- **Screen reader** behavior description
- **ARIA attributes** explanation
- **Mobile accessibility** considerations

### 4. Performance Notes
Document:
- **CSS complexity** - avoid gradients, complex animations
- **Bundle size** - measure impact on overall application
- **Render cost** - minimize paint and layout complexity
- **Accessibility performance** - screen reader efficiency

## Quality Standards

### Acceptance Criteria
Before merging component stories:
- [ ] **Accessibility score** 100/100 in Storybook a11y panel
- [ ] **Visual regression** tests pass in Chromatic
- [ ] **Documentation** includes performance and accessibility notes
- [ ] **Mobile responsive** design verified across viewport addon
- [ ] **Minimal styling** follows design system color palette
- [ ] **Loading states** implemented with simple animations

### Review Process
1. **Design review** - Ensure minimal theme compliance
2. **Accessibility audit** - WCAG 2.1 AA validation
3. **Performance check** - Bundle size and render complexity
4. **Medical education review** - Appropriate for learning context
5. **Code review** - Clean implementation following patterns

**🏥 The Storybook component library serves as the source of truth for MedQuiz Pro's minimal design system, ensuring all components meet accessibility standards while maintaining optimal performance for medical education environments.**
