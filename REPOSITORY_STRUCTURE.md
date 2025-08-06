# Repository Structure

This document outlines the organized structure of the MedQuiz Pro codebase after reorganization.

## 📁 Directory Structure

### `/src/` - Source Code
- **Primary application code**: React components, pages, services, hooks, utilities
- **Well-organized**: Components grouped by feature, clear separation of concerns
- **Modern stack**: React 19.1 + TypeScript 5.8 + Vite 7.0

### `/tests/` - Testing Suite
Organized testing infrastructure with clear separation:

- **`/tests/unit/`** - Unit tests for components and utilities
- **`/tests/e2e/`** - End-to-end tests (auth flows, user journeys)  
- **`/tests/integration/`** - Integration tests (API, database, Convex)
- **`/tests/accessibility/`** - Accessibility testing files (ready for expansion)

### `/design/` - Visual Assets & Documentation
Design system assets organized for easy reference:

- **`/design/mockups/`** - Static PNG mockups and UI screenshots
- **`/design/screenshots/`** - Testing screenshots and visual documentation
- **`/design/auth-test-screenshots/`** - Authentication flow screenshots
- **`/design/production-test-screenshots/`** - Production testing visuals
- **`/design/security-accessibility-screenshots/`** - Security & A11y testing

### `/scripts/` - Development & Deployment Tools
Utility scripts for development workflow:

- **`/scripts/dev-tools/`** - Development utilities (seeding, debugging, testing)
- **`/scripts/convex-migrations/`** - Database migration scripts (ready for expansion)

### `/docs/` - Documentation
Comprehensive documentation system:
- Design tokens, accessibility guidelines, analytics specs
- Storybook configuration, responsive checklists
- UI states documentation, usability testing plans

### `/convex/` - Backend Configuration
Convex backend setup:
- Database schema, authentication, quiz logic
- Generated API types and server configurations

## 🎯 Benefits of This Structure

### ✅ **Developer Experience**
- **Clear navigation**: Easy to find tests, assets, and utilities
- **Logical grouping**: Related files are co-located
- **Reduced root clutter**: Clean project root with only essential config files

### ✅ **Testing Organization**
- **By type**: Unit, E2E, and integration tests clearly separated
- **By purpose**: Accessibility, security, and performance tests organized
- **Easy CI/CD**: Structured for automated testing pipelines

### ✅ **Design System Support**
- **Asset management**: All visual assets in dedicated directories
- **Documentation linkage**: Design docs connected to visual assets
- **Design-dev workflow**: Clear handoff between design and development

### ✅ **Maintenance & Scale**
- **Future-ready**: Structure supports team growth and feature expansion
- **Tool integration**: Ready for Storybook, accessibility tools, CI/CD pipelines
- **Documentation**: Self-documenting structure with clear purpose per directory

## 🚀 Next Steps

With this foundation in place, the codebase is ready for:

1. **Storybook integration** - Component documentation and design system
2. **Enhanced testing** - Automated accessibility and visual regression testing  
3. **CI/CD pipelines** - Organized tests enable robust automation
4. **Design system tools** - Theme generation and design token integration
5. **Team collaboration** - Clear structure supports multiple developers

## 📋 Quick Reference

| Need to... | Look in... |
|------------|------------|
| Run tests | `/tests/` (organized by type) |
| Find mockups | `/design/mockups/` |
| Debug issues | `/scripts/dev-tools/` |
| Update documentation | `/docs/` |
| Modify components | `/src/components/` |
| Configure backend | `/convex/` |

---

**Result**: A production-ready, maintainable codebase structure that supports the current MVP and scales for future development. 🎉