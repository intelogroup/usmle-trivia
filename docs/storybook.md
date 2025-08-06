# Storybook Component Library

This document describes how to run and extend the Storybook instance for the USMLE Trivia component library.

## Installation & Startup
```bash
npm install
npm run storybook
```

Storybook will be available at <http://localhost:6006> by default.

## Documented Components
- `QuestionCard`: Displays question text, answer options, and timer
- `ProgressBar`: Shows quiz progress
- `ScoreIndicator`: Displays current score and feedback
- `Navigation`: Header and footer layouts
- `Modal`: Settings, feedback, and confirmation dialogs

## Accessibility & Addons
- a11y panel for accessibility checks
- viewport addon for responsive previews

## How to Add a New Component
1. Create a new `.tsx` file in `src/components`
2. Add a corresponding `*.stories.tsx` file in `src/components` or `src/stories`
3. Document props, states, and accessibility notes
4. Run Storybook to verify display
