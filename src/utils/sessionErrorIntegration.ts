/**
 * Session Error Integration Patterns for MedQuiz Pro
 * VCT Framework Compliant - Integration Examples and Utilities
 * 
 * Provides practical integration patterns and utilities for implementing
 * comprehensive session error handling across the MedQuiz Pro application.
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { 
  sessionErrorLogger, 
  SessionErrorType,
  type AuthSessionContext,
  type QuizSessionContext 
} from './sessionErrorLogger';
import { useSessionErrorStore } from '../store/sessionErrorStore';
import { useAppStore } from '../store';
import type { IQuizSession, IUser } from '../types';

/**
 * Session Error Integration Utilities
 * Provides high-level functions for common session error scenarios
 */
export class SessionErrorIntegration {
  
  /**
   * Wrap authentication operations with error handling
   */
  static async wrapAuthOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Partial<AuthSessionContext>
  ): Promise<T> {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      // Log the authentication error
      await sessionErrorLogger.logAuthError(
        error,
        {
          authMethod: 'email',
          failureReason: `${operationName} failed`,
          ...context
        },
        SessionErrorType.AUTH_SESSION_INVALID
      );
      
      // Record in store
      const errorStore = useSessionErrorStore.getState();
      errorStore.recordSessionError({
        id: `auth_${Date.now()}`,
        type: SessionErrorType.AUTH_SESSION_INVALID,
        severity: 'HIGH' as any,
        message: error instanceof Error ? error.message : 'Authentication failed',
        timestamp: new Date(),
        sessionType: 'authentication',
        recovered: false,
        userImpact: 'high'
      });
      
      throw error;
    }
  }

  /**
   * Wrap quiz operations with error handling
   */
  static async wrapQuizOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    quizContext?: Partial<QuizSessionContext>
  ): Promise<T> {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      // Log the quiz error
      await sessionErrorLogger.logQuizError(
        error,
        {
          mode: 'quick',
          ...quizContext
        },
        SessionErrorType.QUIZ_SESSION_SYNC_FAILED
      );
      
      // Record in store
      const errorStore = useSessionErrorStore.getState();
      errorStore.recordSessionError({
        id: `quiz_${Date.now()}`,
        type: SessionErrorType.QUIZ_SESSION_SYNC_FAILED,
        severity: 'MEDIUM' as any,
        message: error instanceof Error ? error.message : 'Quiz operation failed',
        timestamp: new Date(),
        sessionType: 'quiz',
        recovered: false,
        userImpact: 'medium'
      });
      
      throw error;
    }
  }

  /**
   * Monitor session timeouts
   */
  static setupSessionTimeoutMonitoring(
    user: IUser | null,
    onTimeout: () => void,
    timeoutMinutes: number = 30
  ): () => void {
    if (!user) return () => {};

    let timeoutId: NodeJS.Timeout;
    let lastActivity = Date.now();

    const checkTimeout = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeoutMs = timeoutMinutes * 60 * 1000;

      if (timeSinceActivity >= timeoutMs) {
        sessionErrorLogger.logAuthError(
          new Error('Session timeout exceeded'),
          {
            userId: user.id,
            sessionDuration: timeSinceActivity,
            authMethod: 'email'
          },
          SessionErrorType.AUTH_SESSION_EXPIRED
        );
        onTimeout();
      } else {
        timeoutId = setTimeout(checkTimeout, 60000); // Check every minute
      }
    };

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Start monitoring
    timeoutId = setTimeout(checkTimeout, 60000);

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }

  /**
   * Auto-save quiz progress with error handling
   */
  static setupQuizAutoSave(
    quizSession: IQuizSession | null,
    saveFunction: (session: IQuizSession) => Promise<void>,
    intervalSeconds: number = 30
  ): () => void {
    if (!quizSession) return () => {};

    const intervalId = setInterval(async () => {
      if (quizSession) {
        try {
          await saveFunction(quizSession);
        } catch (error) {
          await sessionErrorLogger.logQuizError(
            error,
            {
              quizId: quizSession.id,
              mode: quizSession.config.mode,
              currentQuestion: quizSession.answers?.length || 0,
              lastSyncTime: new Date()
            },
            SessionErrorType.QUIZ_SESSION_SYNC_FAILED
          );
        }
      }
    }, intervalSeconds * 1000);

    return () => clearInterval(intervalId);
  }

  /**
   * Handle network connectivity changes
   */
  static setupNetworkMonitoring(): () => void {
    const handleOnline = () => {
      console.log('Connection restored');
      // Attempt to sync any pending data
    };

    const handleOffline = async () => {
      await sessionErrorLogger.logAuthError(
        new Error('Network connection lost'),
        { authMethod: 'email', failureReason: 'Network offline' },
        SessionErrorType.SESSION_STORAGE_FAILED
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

/**
 * Higher-Order Component for Session Error Handling
 * Wraps components with automatic error boundary and monitoring
 * 
 * Note: Temporarily commented out JSX to fix build - can be implemented as a separate .tsx file
 */
export function withSessionErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  sessionType: 'authentication' | 'quiz' | 'general' = 'general'
) {
  // TODO: Implement HOC for session error boundaries
  // For now, return the wrapped component directly
  return WrappedComponent;
}

/**
 * Session Error Context for React Components
 * Provides session error utilities throughout the component tree
 */

interface SessionErrorContextType {
  logAuthError: (error: Error | unknown, context?: Partial<AuthSessionContext>) => Promise<void>;
  logQuizError: (error: Error | unknown, context?: Partial<QuizSessionContext>) => Promise<void>;
  getSessionHealth: () => ReturnType<typeof sessionErrorLogger.getSessionStatus>;
  isMonitoring: boolean;
}

const SessionErrorContext = createContext<SessionErrorContextType | undefined>(undefined);

export function SessionErrorProvider({ children }: { children: ReactNode }) {
  const errorStore = useSessionErrorStore();
  const appStore = useAppStore();

  useEffect(() => {
    // Start error monitoring when app initializes
    errorStore.startErrorMonitoring();

    // Setup network monitoring
    const cleanupNetwork = SessionErrorIntegration.setupNetworkMonitoring();

    // Setup session timeout monitoring for authenticated users
    let cleanupTimeout: (() => void) | undefined;
    if (appStore.isAuthenticated && appStore.user) {
      cleanupTimeout = SessionErrorIntegration.setupSessionTimeoutMonitoring(
        appStore.user,
        () => {
          appStore.logout();
          appStore.addNotification({
            type: 'warning',
            title: 'Session Expired',
            message: 'Your session has expired. Please log in again.'
          });
        }
      );
    }

    return () => {
      errorStore.stopErrorMonitoring();
      cleanupNetwork();
      if (cleanupTimeout) cleanupTimeout();
    };
  }, [appStore.isAuthenticated, appStore.user]);

  const contextValue: SessionErrorContextType = {
    logAuthError: async (error, context) => {
      await sessionErrorLogger.logAuthError(
        error,
        context || {},
        SessionErrorType.AUTH_SESSION_INVALID
      );
    },
    logQuizError: async (error, context) => {
      await sessionErrorLogger.logQuizError(
        error,
        context || { mode: 'quick' },
        SessionErrorType.QUIZ_SESSION_SYNC_FAILED
      );
    },
    getSessionHealth: () => sessionErrorLogger.getSessionStatus(),
    isMonitoring: errorStore.isMonitoring
  };

  // TODO: Implement JSX provider - temporarily returning children for build
  return React.createElement('div', {}, children);
}

export function useSessionErrorContext() {
  const context = useContext(SessionErrorContext);
  if (!context) {
    throw new Error('useSessionErrorContext must be used within SessionErrorProvider');
  }
  return context;
}

/**
 * API Interceptor for Error Handling
 * Wraps API calls with automatic error logging
 */
export class ApiErrorInterceptor {
  private static instance: ApiErrorInterceptor;
  
  private constructor() {}

  static getInstance(): ApiErrorInterceptor {
    if (!this.instance) {
      this.instance = new ApiErrorInterceptor();
    }
    return this.instance;
  }

  /**
   * Wrap fetch calls with error handling
   */
  async wrapFetch(
    input: RequestInfo | URL, 
    init?: RequestInit,
    context?: { operation: string; sessionType?: 'auth' | 'quiz' }
  ): Promise<Response> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(input, init);
      
      // Log slow responses
      const responseTime = Date.now() - startTime;
      if (responseTime > 5000) {
        await sessionErrorLogger.logAuthError(
          new Error(`Slow API response: ${responseTime}ms`),
          {
            authMethod: 'email',
            failureReason: `Slow response from ${input}`
          },
          SessionErrorType.SESSION_DISPLAY_ERROR
        );
      }

      // Handle HTTP errors
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        if (context?.sessionType === 'auth') {
          await sessionErrorLogger.logAuthError(
            error,
            { authMethod: 'email', failureReason: `API error: ${response.status}` },
            response.status === 401 
              ? SessionErrorType.AUTH_SESSION_EXPIRED 
              : SessionErrorType.AUTH_SESSION_INVALID
          );
        } else if (context?.sessionType === 'quiz') {
          await sessionErrorLogger.logQuizError(
            error,
            { mode: 'quick', lastSyncTime: new Date() },
            SessionErrorType.QUIZ_SESSION_SYNC_FAILED
          );
        }
        
        throw error;
      }
      
      return response;
    } catch (error) {
      // Network or other errors
      if (context?.sessionType === 'auth') {
        await sessionErrorLogger.logAuthError(
          error,
          { authMethod: 'email', failureReason: 'Network or fetch error' },
          SessionErrorType.SESSION_STORAGE_FAILED
        );
      } else if (context?.sessionType === 'quiz') {
        await sessionErrorLogger.logQuizError(
          error,
          { mode: 'quick', lastSyncTime: new Date() },
          SessionErrorType.QUIZ_SESSION_SYNC_FAILED
        );
      }
      
      throw error;
    }
  }
}

/**
 * Development and Testing Utilities
 */
export class SessionErrorTestUtils {
  /**
   * Simulate different types of session errors for testing
   */
  static async simulateError(
    errorType: SessionErrorType,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const error = new Error(`Simulated ${errorType} error`);
    
    if (errorType.includes('AUTH_')) {
      await sessionErrorLogger.logAuthError(
        error,
        { authMethod: 'email', failureReason: 'Test simulation' },
        errorType
      );
    } else if (errorType.includes('QUIZ_')) {
      await sessionErrorLogger.logQuizError(
        error,
        { mode: 'quick', questionCount: 10 },
        errorType
      );
    }
  }

  /**
   * Get comprehensive session report for debugging
   */
  static getDebugReport(): string {
    const sessionStatus = sessionErrorLogger.getSessionStatus();
    const errorStore = useSessionErrorStore.getState();
    const analytics = errorStore.getErrorAnalytics();
    
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      sessionStatus,
      errorAnalytics: analytics,
      recentErrors: errorStore.currentSessionErrors.slice(-10),
      sessionHealth: errorStore.sessionHealth
    }, null, 2);
  }

  /**
   * Clear all error data for testing
   */
  static clearAllErrors(): void {
    sessionErrorLogger.clearSessionLogs();
    const errorStore = useSessionErrorStore.getState();
    errorStore.clearSessionErrors();
  }
}

// Export singleton instances
export const apiErrorInterceptor = ApiErrorInterceptor.getInstance();
export const sessionTestUtils = SessionErrorTestUtils;