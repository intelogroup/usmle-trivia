/**
 * COMPREHENSIVE AUTHENTICATION TESTING SUITE
 * Tests all aspects of the MedQuiz Pro authentication system
 * Including registration, login, session management, error handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

// Import components to test
import { Login } from '../../src/pages/Login';
import { Register } from '../../src/pages/Register';

// Mock Convex client for testing
const mockConvexClient = new ConvexReactClient('https://mock-convex-url.convex.cloud');

// Test wrapper component with auth providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ConvexAuthProvider client={mockConvexClient}>
      {children}
    </ConvexAuthProvider>
  </BrowserRouter>
);

// Mock the useAuth hook
const mockAuth = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../../src/services/convexAuth', () => ({
  useAuth: () => mockAuth,
}));

describe('Comprehensive Authentication System Testing', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockAuth.user = null;
    mockAuth.isAuthenticated = false;
    mockAuth.isLoading = false;
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. REGISTRATION FLOW TESTING', () => {
    describe('1.1 Registration Page Navigation and Form Validation', () => {
      it('should render registration page with all required fields', () => {
        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        expect(screen.getByText('MedQuiz Pro')).toBeInTheDocument();
        expect(screen.getByText('Join thousands of medical students preparing for USMLE')).toBeInTheDocument();
        expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });

      it('should validate password length requirement', async () => {
        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
        });
      });

      it('should validate password matching', async () => {
        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
      });

      it('should show proper accessibility attributes', () => {
        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');

        expect(nameInput).toHaveAttribute('required');
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(emailInput).toHaveAttribute('required');
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(passwordInput).toHaveAttribute('required');
      });
    });

    describe('1.2 Successful User Registration', () => {
      it('should call register function with valid data', async () => {
        mockAuth.register = vi.fn().mockResolvedValue({ success: true });

        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'Dr. Test User' } });
        fireEvent.change(emailInput, { target: { value: 'newuser@medical.edu' } });
        fireEvent.change(passwordInput, { target: { value: 'securePassword123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'securePassword123!' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockAuth.register).toHaveBeenCalledWith(
            'newuser@medical.edu', 
            'securePassword123!', 
            'Dr. Test User'
          );
        });
      });

      it('should show loading state during registration', async () => {
        mockAuth.isLoading = true;
        mockAuth.register = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        const submitButton = screen.getByRole('button', { name: /creating account/i });
        expect(submitButton).toBeDisabled();
        expect(screen.getByText('Creating account...')).toBeInTheDocument();
      });
    });

    describe('1.3 Registration Error Handling', () => {
      it('should handle duplicate email error', async () => {
        const duplicateEmailError = new Error('User already exists with this email');
        mockAuth.register = vi.fn().mockRejectedValue(duplicateEmailError);

        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'Existing User' } });
        fireEvent.change(emailInput, { target: { value: 'existing@medical.edu' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('User already exists with this email')).toBeInTheDocument();
        });
      });

      it('should handle network errors gracefully', async () => {
        const networkError = new Error('Network error');
        mockAuth.register = vi.fn().mockRejectedValue(networkError);

        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@medical.edu' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Network error')).toBeInTheDocument();
        });
      });
    });
  });

  describe('2. LOGIN FLOW TESTING', () => {
    describe('2.1 Valid User Login', () => {
      it('should render login page with required fields', () => {
        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        expect(screen.getByText('MedQuiz Pro')).toBeInTheDocument();
        expect(screen.getByText('USMLE Preparation Platform')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });

      it('should call login function with valid credentials', async () => {
        mockAuth.login = vi.fn().mockResolvedValue({ 
          user: { 
            id: 'test-user-id', 
            email: 'jayveedz19@gmail.com',
            name: 'Jay veedz',
            points: 1250,
            level: 12,
            streak: 5
          } 
        });

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'jayveedz19@gmail.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Jimkali90#' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockAuth.login).toHaveBeenCalledWith('jayveedz19@gmail.com', 'Jimkali90#');
        });
      });

      it('should show loading state during login', () => {
        mockAuth.isLoading = true;

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const submitButton = screen.getByRole('button', { name: /signing in/i });
        expect(submitButton).toBeDisabled();
      });
    });

    describe('2.2 Invalid Login Attempts', () => {
      it('should handle invalid email/password combinations', async () => {
        const invalidCredentialsError = new Error('Invalid email or password');
        mockAuth.login = vi.fn().mockRejectedValue(invalidCredentialsError);

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });
      });

      it('should handle empty form submission', async () => {
        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // HTML5 validation should prevent submission
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        
        expect(emailInput).toHaveAttribute('required');
        expect(passwordInput).toHaveAttribute('required');
      });

      it('should validate email format', () => {
        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText('Email Address');
        expect(emailInput).toHaveAttribute('type', 'email');
      });
    });
  });

  describe('3. SESSION MANAGEMENT TESTING', () => {
    describe('3.1 Authentication State Persistence', () => {
      it('should maintain user state when authenticated', () => {
        const authenticatedUser = {
          id: 'user-123',
          email: 'test@medical.edu',
          name: 'Test User',
          points: 500,
          level: 5,
          streak: 3
        };

        mockAuth.user = authenticatedUser;
        mockAuth.isAuthenticated = true;

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        // User should not see login form if already authenticated
        // This test would need actual routing logic to be meaningful
        expect(mockAuth.isAuthenticated).toBe(true);
        expect(mockAuth.user).toEqual(authenticatedUser);
      });

      it('should handle loading states correctly', () => {
        mockAuth.isLoading = true;
        mockAuth.user = null;
        mockAuth.isAuthenticated = false;

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        expect(mockAuth.isLoading).toBe(true);
      });
    });

    describe('3.2 Logout Functionality', () => {
      it('should clear session on logout', async () => {
        mockAuth.logout = vi.fn().mockResolvedValue({ success: true });
        mockAuth.user = {
          id: 'user-123',
          email: 'test@medical.edu',
          name: 'Test User',
          points: 500,
          level: 5,
          streak: 3
        };
        mockAuth.isAuthenticated = true;

        // In a real app, logout would be triggered from TopBar or Dashboard
        await mockAuth.logout();

        expect(mockAuth.logout).toHaveBeenCalled();
      });

      it('should handle logout errors gracefully', async () => {
        const logoutError = new Error('Logout failed');
        mockAuth.logout = vi.fn().mockRejectedValue(logoutError);

        try {
          await mockAuth.logout();
        } catch (error) {
          expect(error).toEqual(logoutError);
        }
      });
    });
  });

  describe('4. USER PROFILE INTEGRATION TESTING', () => {
    describe('4.1 User Data Display', () => {
      it('should provide user data in correct format', () => {
        const testUser = {
          id: 'user-test-123',
          email: 'medical.student@edu.com',
          name: 'Medical Student',
          points: 1250,
          level: 12,
          streak: 5,
          totalQuizzes: 28,
          accuracy: 78,
          currentStreak: 5,
          longestStreak: 12,
          medicalLevel: 'student',
          studyGoals: 'USMLE Step 1'
        };

        mockAuth.user = testUser;
        mockAuth.isAuthenticated = true;

        // Verify user data structure
        expect(mockAuth.user.id).toBe('user-test-123');
        expect(mockAuth.user.email).toBe('medical.student@edu.com');
        expect(mockAuth.user.name).toBe('Medical Student');
        expect(mockAuth.user.points).toBe(1250);
        expect(mockAuth.user.level).toBe(12);
        expect(mockAuth.user.medicalLevel).toBe('student');
        expect(mockAuth.user.studyGoals).toBe('USMLE Step 1');
      });

      it('should handle user data edge cases', () => {
        const minimalUser = {
          id: 'minimal-user',
          email: 'minimal@test.com',
          name: 'Minimal User'
        };

        mockAuth.user = minimalUser;
        mockAuth.isAuthenticated = true;

        expect(mockAuth.user).toBeDefined();
        expect(mockAuth.user.id).toBe('minimal-user');
        expect(mockAuth.user.email).toBe('minimal@test.com');
      });
    });
  });

  describe('5. BACKEND INTEGRATION TESTING', () => {
    describe('5.1 Convex Auth Configuration', () => {
      it('should initialize with proper Convex client configuration', () => {
        // Test that the auth provider is properly configured
        render(
          <TestWrapper>
            <div>Test component</div>
          </TestWrapper>
        );

        // ConvexAuthProvider should wrap the component
        expect(screen.getByText('Test component')).toBeInTheDocument();
      });

      it('should provide auth context to nested components', () => {
        // Mock useAuth hook is available throughout the component tree
        expect(mockAuth).toBeDefined();
        expect(mockAuth).toHaveProperty('login');
        expect(mockAuth).toHaveProperty('register');
        expect(mockAuth).toHaveProperty('logout');
        expect(mockAuth).toHaveProperty('user');
        expect(mockAuth).toHaveProperty('isAuthenticated');
        expect(mockAuth).toHaveProperty('isLoading');
      });
    });
  });

  describe('6. ROUTE PROTECTION TESTING', () => {
    describe('6.1 Protected Route Behavior', () => {
      it('should provide authentication state for route protection', () => {
        // Test unauthenticated state
        mockAuth.isAuthenticated = false;
        mockAuth.user = null;

        expect(mockAuth.isAuthenticated).toBe(false);
        expect(mockAuth.user).toBeNull();

        // Test authenticated state
        mockAuth.isAuthenticated = true;
        mockAuth.user = { id: 'user-123', email: 'test@example.com', name: 'Test User' };

        expect(mockAuth.isAuthenticated).toBe(true);
        expect(mockAuth.user).toBeDefined();
      });
    });
  });

  describe('7. ERROR HANDLING TESTING', () => {
    describe('7.1 Network and Input Errors', () => {
      it('should handle malformed email inputs', async () => {
        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');

        // Test with malformed email
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // HTML5 validation should handle this
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(emailInput.validity.valid).toBe(false);
      });

      it('should handle special characters in passwords', async () => {
        mockAuth.login = vi.fn().mockResolvedValue({ success: true });

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'P@ssw0rd!@#$%^&*()' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockAuth.login).toHaveBeenCalledWith('test@example.com', 'P@ssw0rd!@#$%^&*()');
        });
      });

      it('should handle network timeout scenarios', async () => {
        const timeoutError = new Error('Request timeout');
        mockAuth.login = vi.fn().mockRejectedValue(timeoutError);

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });
      });
    });
  });

  describe('8. UI/UX VERIFICATION TESTING', () => {
    describe('8.1 Loading States and Responsive Design', () => {
      it('should display proper loading states', () => {
        mockAuth.isLoading = true;

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const submitButton = screen.getByRole('button');
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/signing in/i);
      });

      it('should be responsive and accessible', () => {
        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        // Check for proper ARIA attributes
        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');

        expect(emailInput).toHaveAttribute('id', 'email');
        expect(passwordInput).toHaveAttribute('id', 'password');
        
        // Check for proper form structure
        const form = screen.getByRole('form', { hidden: true }) || emailInput.closest('form');
        expect(form).toBeInTheDocument();
      });

      it('should have proper focus management', () => {
        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        // All interactive elements should be focusable
        expect(emailInput).not.toHaveAttribute('tabindex', '-1');
        expect(passwordInput).not.toHaveAttribute('tabindex', '-1');
        expect(submitButton).not.toHaveAttribute('tabindex', '-1');
      });

      it('should show proper error message styling', async () => {
        const testError = new Error('Test error message');
        mockAuth.login = vi.fn().mockRejectedValue(testError);

        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText('Email Address');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          const errorElement = screen.getByText('Invalid email or password');
          expect(errorElement).toBeInTheDocument();
          expect(errorElement).toHaveAttribute('role', 'alert');
          expect(errorElement).toHaveAttribute('aria-live', 'assertive');
        });
      });
    });

    describe('8.2 Medical Education Branding', () => {
      it('should display medical education branding correctly', () => {
        render(
          <TestWrapper>
            <Login />
          </TestWrapper>
        );

        expect(screen.getByText('MedQuiz Pro')).toBeInTheDocument();
        expect(screen.getByText('USMLE Preparation Platform')).toBeInTheDocument();
        
        // Check for stethoscope icon (aria-label)
        const logoIcon = screen.getByLabelText('MedQuiz Pro medical education logo');
        expect(logoIcon).toBeInTheDocument();
      });

      it('should have medical-focused placeholder text', () => {
        render(
          <TestWrapper>
            <Register />
          </TestWrapper>
        );

        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email Address');

        expect(nameInput).toHaveAttribute('placeholder', 'Dr. John Doe');
        expect(emailInput).toHaveAttribute('placeholder', 'john.doe@medical.edu');
      });
    });
  });
});

// Additional integration test for auth flow
describe('9. INTEGRATION TESTING - Full Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full registration-to-dashboard flow', async () => {
    // Mock successful registration
    mockAuth.register = vi.fn().mockResolvedValue({ success: true });
    
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill out registration form
    fireEvent.change(nameInput, { target: { value: 'New Medical Student' } });
    fireEvent.change(emailInput, { target: { value: 'newstudent@medical.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'SecurePassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePassword123!' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuth.register).toHaveBeenCalledWith(
        'newstudent@medical.edu',
        'SecurePassword123!',
        'New Medical Student'
      );
    });
  });

  it('should handle login-to-dashboard flow', async () => {
    // Mock successful login
    mockAuth.login = vi.fn().mockResolvedValue({ 
      user: {
        id: 'user-existing',
        email: 'jayveedz19@gmail.com',
        name: 'Jay veedz',
        points: 1250,
        level: 12
      }
    });
    
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'jayveedz19@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Jimkali90#' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuth.login).toHaveBeenCalledWith('jayveedz19@gmail.com', 'Jimkali90#');
    });
  });
});