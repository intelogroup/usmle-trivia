# MedQuiz Pro - Project Instructions

## 🎯 Project Overview
MedQuiz Pro is a comprehensive medical quiz application built with React + Vite and Appwrite. It features a responsive design that seamlessly transitions between desktop CRM-style dashboard and mobile app experience.

## 🏗️ Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI + Framer Motion
- **Backend**: Appwrite (BaaS)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Testing**: Vitest + Testing Library
- **Deployment**: Netlify

## 📁 Project Structure
```
medquiz-pro/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── DesktopLayout.tsx
│   │   │   ├── MobileLayout.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardGrid.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── QuizModeSelector.tsx
│   │   ├── quiz/
│   │   │   ├── QuizContainer.tsx
│   │   │   ├── QuizQuestion.tsx
│   │   │   └── QuizResults.tsx
│   │   └── ui/
│   │       └── [shadcn components]
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Quiz.tsx
│   │   ├── Progress.tsx
│   │   └── Leaderboard.tsx
│   ├── services/
│   │   ├── appwrite.ts
│   │   ├── auth.ts
│   │   └── quiz.ts
│   ├── store/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useQuiz.ts
│   │   └── useResponsive.ts
│   ├── types/
│   │   └── index.ts
│   └── lib/
│       └── utils.ts
├── tests/
│   ├── unit/
│   └── integration/
└── public/
```

## 🔑 Environment Variables
```env
VITE_APPWRITE_PROJECT_ID=688cb738000d2fbeca0a
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
```

## 📋 Development Guidelines

### Component Development
1. Always use TypeScript with proper type definitions
2. Follow React best practices (hooks, functional components)
3. Implement responsive design using Tailwind's mobile-first approach
4. Use Radix UI primitives for complex UI components
5. Apply Framer Motion for smooth animations

### State Management
- Use Zustand for global state (user, quiz session, UI state)
- Keep component state local when possible
- Implement proper TypeScript interfaces for all state

### Testing Requirements
- Write unit tests for all utility functions
- Create integration tests for critical user flows
- Test responsive behavior on different screen sizes
- Ensure accessibility standards are met

### Code Style
- Use ESLint and Prettier for consistent formatting
- Follow naming conventions:
  - Components: PascalCase
  - Functions/hooks: camelCase
  - Types/Interfaces: PascalCase with 'I' or 'T' prefix
  - Constants: UPPER_SNAKE_CASE

## 🚀 Key Features to Implement

### Phase 1: Core Layout & Navigation
- [x] Project setup with Vite + React + TypeScript
- [ ] Responsive layout system (desktop sidebar, mobile bottom nav)
- [ ] Basic routing structure
- [ ] Authentication flow with Appwrite

### Phase 2: Dashboard & Quiz System
- [ ] Dashboard with stats grid
- [ ] Quiz mode selector (Quick, Timed, Custom)
- [ ] Quiz taking interface
- [ ] Results and review system

### Phase 3: Progress & Analytics
- [ ] User progress tracking
- [ ] Performance charts
- [ ] Topic breakdown
- [ ] Leaderboard system

### Phase 4: Polish & Optimization
- [ ] Animations and transitions
- [ ] Loading states and error handling
- [ ] Performance optimization
- [ ] Accessibility improvements

## 🧪 Testing Commands
```bash
npm run test        # Run unit tests
npm run test:ui     # Run tests with UI
npm run test:e2e    # Run e2e tests
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript check
```

## 📦 Build & Deploy
```bash
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🎨 Design Tokens
- Primary Color: Blue (hsl(221.2 83.2% 53.3%))
- Success: Green
- Warning: Orange
- Error: Red
- Font: Inter (system-ui fallback)
- Border Radius: 8px (--radius)

## 🔒 Security Considerations
- Implement proper authentication with Appwrite
- Validate all user inputs
- Use environment variables for sensitive data
- Implement rate limiting for API calls
- Sanitize user-generated content

## 📱 Responsive Breakpoints
- Mobile: < 768px (bottom navigation)
- Tablet: 768px - 1024px (collapsible sidebar)
- Desktop: > 1024px (full sidebar)

## 🚨 Important Notes
1. Always run tests before committing
2. Follow the component hierarchy strictly
3. Ensure mobile-first development
4. Keep bundle size optimized
5. Document complex logic with comments
6. Use semantic HTML for accessibility