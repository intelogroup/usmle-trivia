/**
 * Authentication Verification Service
 * Ensures proper authentication flow and credentials validation
 * Uses only Convex Auth - no mock data or hardcoded credentials
 */

import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";

/**
 * Verify user authentication status
 * This is the single source of truth for auth state
 */
export const verifyAuthStatus = async (): Promise<boolean> => {
  try {
    // Check if user has valid auth token
    const response = await fetch('/api/auth/verify', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return false;
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Hook to check if current session is valid
 */
export const useSessionVerification = () => {
  const user = useQuery(api.userProfiles.getCurrentUser);
  
  return {
    isValid: !!user,
    user,
    isExpired: false, // Convex handles session expiry
  };
};

/**
 * Clear all auth-related data from browser
 */
export const clearAuthData = () => {
  // Clear any stored tokens or session data
  localStorage.removeItem('auth_token');
  sessionStorage.clear();
  
  // Clear cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

/**
 * Security headers for auth requests
 */
export const getAuthHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Add CSRF token if available
    ...(getCsrfToken() && { 'X-CSRF-Token': getCsrfToken() }),
  };
};

/**
 * Get CSRF token for security
 */
const getCsrfToken = (): string | null => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
};

/**
 * Rate limiting for auth attempts
 */
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const attempt = authAttempts.get(identifier);
  
  if (!attempt) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset after 15 minutes
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Allow max 5 attempts per 15 minutes
  if (attempt.count >= 5) {
    return false;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  return true;
};

/**
 * Authentication error messages
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account has been locked due to too many failed attempts',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  RATE_LIMITED: 'Too many attempts. Please try again later',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  EMAIL_EXISTS: 'An account with this email already exists',
  INVALID_EMAIL: 'Please enter a valid email address',
} as const;