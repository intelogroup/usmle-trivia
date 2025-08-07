import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { configure } from '@testing-library/react';

// Configure testing library for better accessibility testing
configure({ 
  testIdAttribute: 'data-testid',
  // Increase timeout for accessibility tests
  asyncUtilTimeout: 5000
});

// Mock environment variables for tests
process.env.VITE_APPWRITE_PROJECT_ID = 'test-project-id';
process.env.VITE_APPWRITE_ENDPOINT = 'https://test.appwrite.io/v1';

// Global test setup for accessibility testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));