import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Mock Convex Auth provider for testing
 * This provides a minimal implementation that satisfies the auth context requirements
 */
export const mockConvexAuth = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

/**
 * Mock useAuth hook for testing
 */
export const createMockUseAuth = (overrides = {}) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  ...overrides,
});

/**
 * Test wrapper component that provides necessary context for Convex Auth
 */
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Custom render function that wraps components with necessary providers
 */
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    wrapper: TestWrapper,
    ...options,
  });
};

/**
 * Setup mocks for Convex auth modules
 * Call this in test files that use auth-dependent components
 */
export const setupAuthMocks = () => {
  // Mock the convex/react module
  vi.mock('convex/react', () => ({
    useConvexAuth: () => mockConvexAuth,
    useQuery: vi.fn(() => null),
    useMutation: vi.fn(() => vi.fn()),
    ConvexReactClient: vi.fn(),
  }));

  // Mock the @convex-dev/auth/react module
  vi.mock('@convex-dev/auth/react', () => ({
    useAuthActions: () => ({
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    }),
    ConvexAuthProvider: ({ children }: any) => children,
  }));

  // Mock the generated API
  vi.mock('../../convex/_generated/api', () => ({
    api: {
      userProfiles: {
        getCurrentUser: vi.fn(),
        updateUserStats: vi.fn(),
        getLeaderboard: vi.fn(),
        getCurrentUserProfile: vi.fn(),
        updateUserProfile: vi.fn(),
      },
      quizSessions: {
        getUserQuizHistory: vi.fn(),
      },
    },
  }));
};

/**
 * Create a mock user object for testing
 */
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create a mock quiz session for testing
 */
export const createMockQuizSession = (overrides = {}) => ({
  id: 'quiz-session-123',
  userId: 'test-user-123',
  score: 80,
  totalQuestions: 10,
  correctAnswers: 8,
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  mode: 'quick',
  ...overrides,
});

export default {
  mockConvexAuth,
  createMockUseAuth,
  TestWrapper,
  renderWithProviders,
  setupAuthMocks,
  createMockUser,
  createMockQuizSession,
};