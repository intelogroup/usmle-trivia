/**
 * Session Error Handling Hooks for MedQuiz Pro
 * VCT Framework Compliant - React Hooks for Session Error Management
 * 
 * Provides React hooks for session error handling that integrate with
 * the existing Zustand store and Convex services.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { 
  sessionErrorLogger, 
  SessionErrorType, 
  type AuthSessionContext, 
  type QuizSessionContext 
} from '../utils/sessionErrorLogger';
import type { IQuizSession, IUser } from '../types';

/**
 * Hook for authentication session error handling
 * Integrates with existing auth store actions
 */
export function useAuthSessionErrorHandling() {
  const { user, isAuthenticated, logout, addNotification } = useAppStore();
  const sessionTimeoutRef = useRef<NodeJS.Timeout>();

  // Session timeout monitoring
  useEffect(() => {
    if (isAuthenticated && user) {
      // Set up session timeout monitoring (30 minutes default)
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes

      sessionTimeoutRef.current = setTimeout(() => {
        sessionErrorLogger.logAuthError(
          new Error('Session timeout exceeded'),
          {
            userId: user.id,
            sessionDuration: sessionTimeout,
            authMethod: 'email'
          },
          SessionErrorType.AUTH_SESSION_EXPIRED
        );

        // Auto-logout on timeout
        logout();
        addNotification({
          type: 'warning',
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again.',
          duration: 0 // Don't auto-dismiss
        });
      }, sessionTimeout);
    }

    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user, logout, addNotification]);

  /**
   * Log authentication errors with context
   */
  const logAuthError = useCallback(
    async (
      error: Error | unknown,
      context: Partial<AuthSessionContext> = {},
      sessionErrorType: SessionErrorType = SessionErrorType.AUTH_SESSION_INVALID
    ) => {
      const authContext: Partial<AuthSessionContext> = {
        userId: user?.id,
        authMethod: 'email',
        ...context
      };

      await sessionErrorLogger.logAuthError(error, authContext, sessionErrorType);

      // Show user notification based on error type
      if (sessionErrorType === SessionErrorType.AUTH_SESSION_EXPIRED) {
        addNotification({
          type: 'warning',
          title: 'Session Expired',
          message: 'Please log in again to continue.',
          duration: 0
        });
      } else if (sessionErrorType === SessionErrorType.AUTH_TOKEN_REFRESH_FAILED) {
        addNotification({
          type: 'error',
          title: 'Authentication Error',
          message: 'Failed to refresh your session. Please log in again.',
          duration: 0
        });
      }
    },
    [user, addNotification]
  );

  /**
   * Handle login errors with session logging
   */
  const handleLoginError = useCallback(
    async (error: Error | unknown, email?: string) => {
      await logAuthError(
        error,
        { 
          authMethod: 'email',
          failureReason: error instanceof Error ? error.message : 'Unknown error'
        },
        SessionErrorType.AUTH_SESSION_INVALID
      );
    },
    [logAuthError]
  );

  /**
   * Handle logout with session cleanup
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      
      // Clear session timeout
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      
      // Log successful logout (informational)
      console.log('Session logged out successfully');
    } catch (error) {
      await logAuthError(
        error,
        { authMethod: 'email' },
        SessionErrorType.AUTH_SESSION_INVALID
      );
    }
  }, [logout, logAuthError]);

  return {
    logAuthError,
    handleLoginError,
    handleLogout
  };
}

/**
 * Hook for quiz session error handling
 * Integrates with quiz state management
 */
export function useQuizSessionErrorHandling() {
  const { currentQuiz, addNotification } = useAppStore();
  const quizTimeoutRef = useRef<NodeJS.Timeout>();
  const autoSaveRef = useRef<NodeJS.Timeout>();

  /**
   * Log quiz session errors with context
   */
  const logQuizError = useCallback(
    async (
      error: Error | unknown,
      context: Partial<QuizSessionContext> = {},
      sessionErrorType: SessionErrorType = SessionErrorType.QUIZ_SESSION_SYNC_FAILED
    ) => {
      const quizContext: Partial<QuizSessionContext> = {
        quizId: currentQuiz?.id,
        mode: currentQuiz?.config?.mode || 'quick',
        questionCount: currentQuiz?.questions?.length,
        ...context
      };

      await sessionErrorLogger.logQuizError(error, quizContext, sessionErrorType);

      // Show appropriate user notification
      if (sessionErrorType === SessionErrorType.QUIZ_SESSION_CORRUPTED) {
        addNotification({
          type: 'error',
          title: 'Quiz Session Error',
          message: 'Your quiz session encountered an error. We\'ll try to recover your progress.',
          duration: 8000
        });
      } else if (sessionErrorType === SessionErrorType.QUIZ_SESSION_SYNC_FAILED) {
        addNotification({
          type: 'warning',
          title: 'Sync Warning',
          message: 'Your progress might not be saved. Check your connection.',
          duration: 6000
        });
      }
    },
    [currentQuiz, addNotification]
  );

  /**
   * Handle quiz session timeout
   */
  const setupQuizTimeout = useCallback(
    (timeLimit: number) => {
      if (quizTimeoutRef.current) {
        clearTimeout(quizTimeoutRef.current);
      }

      quizTimeoutRef.current = setTimeout(() => {
        logQuizError(
          new Error('Quiz session timeout'),
          {
            timeRemaining: 0,
            completionPercentage: currentQuiz ? 
              (currentQuiz.answers?.length / currentQuiz.questions?.length) * 100 : 0
          },
          SessionErrorType.QUIZ_SESSION_TIMEOUT
        );
      }, timeLimit * 1000);
    },
    [currentQuiz, logQuizError]
  );

  /**
   * Auto-save quiz progress
   */
  const setupAutoSave = useCallback(
    (interval: number = 30000) => { // 30 seconds default
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }

      autoSaveRef.current = setInterval(async () => {
        if (currentQuiz) {
          try {
            // This would integrate with your quiz service to save progress
            console.log('Auto-saving quiz progress...');
            // await quizService.saveProgress(currentQuiz.id, currentQuiz.answers);
          } catch (error) {
            await logQuizError(
              error,
              { lastSyncTime: new Date() },
              SessionErrorType.QUIZ_SESSION_SYNC_FAILED
            );
          }
        }
      }, interval);
    },
    [currentQuiz, logQuizError]
  );

  /**
   * Handle quiz abandonment
   */
  const handleQuizAbandon = useCallback(
    async (reason: 'user_action' | 'error' | 'timeout' = 'user_action') => {
      if (currentQuiz) {
        await logQuizError(
          new Error(`Quiz abandoned: ${reason}`),
          {
            completionPercentage: (currentQuiz.answers?.length / currentQuiz.questions?.length) * 100,
            currentQuestion: currentQuiz.answers?.length || 0
          },
          SessionErrorType.QUIZ_SESSION_ABANDONED
        );
      }

      // Clean up timers
      if (quizTimeoutRef.current) {
        clearTimeout(quizTimeoutRef.current);
      }
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    },
    [currentQuiz, logQuizError]
  );

  /**
   * Clean up quiz session
   */
  useEffect(() => {
    return () => {
      if (quizTimeoutRef.current) {
        clearTimeout(quizTimeoutRef.current);
      }
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  return {
    logQuizError,
    setupQuizTimeout,
    setupAutoSave,
    handleQuizAbandon
  };
}

/**
 * Hook for general session error handling and recovery
 * Provides utilities for session health monitoring
 */
export function useSessionHealthMonitoring() {
  const recoveryAttemptRef = useRef<number>(0);
  const maxRecoveryAttempts = 3;

  /**
   * Monitor session health
   */
  const getSessionHealth = useCallback(() => {
    return sessionErrorLogger.getSessionStatus();
  }, []);

  /**
   * Attempt session recovery
   */
  const attemptSessionRecovery = useCallback(
    async (errorType: SessionErrorType): Promise<boolean> => {
      if (recoveryAttemptRef.current >= maxRecoveryAttempts) {
        console.warn('Maximum recovery attempts reached');
        return false;
      }

      recoveryAttemptRef.current += 1;

      try {
        // Log recovery attempt
        await sessionErrorLogger.logAuthError(
          new Error(`Recovery attempt ${recoveryAttemptRef.current}`),
          { 
            authMethod: 'email',
            failureReason: `Attempting recovery for ${errorType}`
          },
          SessionErrorType.SESSION_RECOVERY_FAILED
        );

        // Reset recovery counter on successful recovery
        recoveryAttemptRef.current = 0;
        return true;
      } catch (error) {
        console.error('Session recovery failed:', error);
        return false;
      }
    },
    []
  );

  /**
   * Export session logs for debugging
   */
  const exportSessionLogs = useCallback(() => {
    return sessionErrorLogger.exportSessionLogs();
  }, []);

  /**
   * Clear session error history
   */
  const clearSessionErrors = useCallback(() => {
    sessionErrorLogger.clearSessionLogs();
  }, []);

  return {
    getSessionHealth,
    attemptSessionRecovery,
    exportSessionLogs,
    clearSessionErrors
  };
}

/**
 * Hook for session error boundary integration
 * Provides error boundary callback for session-related errors
 */
export function useSessionErrorBoundary() {
  const { addNotification } = useAppStore();

  const handleSessionError = useCallback(
    async (error: Error, errorInfo: { componentStack: string }) => {
      // Log the error as a session display error
      await sessionErrorLogger.logAuthError(
        error,
        {
          authMethod: 'email',
          failureReason: 'React component error in session'
        },
        SessionErrorType.SESSION_DISPLAY_ERROR
      );

      // Show user-friendly error message
      addNotification({
        type: 'error',
        title: 'Display Error',
        message: 'A display error occurred. The page will recover automatically.',
        duration: 5000
      });

      // In development, log additional details
      if (import.meta.env.DEV) {
        console.group('🔥 Session Error Boundary');
        console.error('Error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();
      }
    },
    [addNotification]
  );

  return {
    handleSessionError
  };
}

/**
 * Hook for session performance monitoring
 * Tracks session-related performance metrics
 */
export function useSessionPerformanceMonitoring() {
  const performanceDataRef = useRef<{
    pageLoadTime?: number;
    apiResponseTimes: number[];
    errorCounts: Record<string, number>;
  }>({
    apiResponseTimes: [],
    errorCounts: {}
  });

  /**
   * Track page load time
   */
  useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      performanceDataRef.current.pageLoadTime = 
        navigation.loadEventEnd - navigation.loadEventStart;
    }
  }, []);

  /**
   * Track API response time
   */
  const trackApiResponse = useCallback((responseTime: number, endpoint?: string) => {
    performanceDataRef.current.apiResponseTimes.push(responseTime);
    
    // If response time is unusually slow, log as potential issue
    if (responseTime > 5000) { // 5 seconds
      sessionErrorLogger.logAuthError(
        new Error(`Slow API response: ${responseTime}ms`),
        {
          authMethod: 'email',
          failureReason: `Slow response from ${endpoint || 'unknown endpoint'}`
        },
        SessionErrorType.SESSION_DISPLAY_ERROR
      );
    }
  }, []);

  /**
   * Get performance summary
   */
  const getPerformanceSummary = useCallback(() => {
    const { pageLoadTime, apiResponseTimes, errorCounts } = performanceDataRef.current;
    
    return {
      pageLoadTime,
      averageApiResponseTime: apiResponseTimes.length > 0 
        ? apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length 
        : 0,
      totalApiCalls: apiResponseTimes.length,
      totalErrors: Object.values(errorCounts).reduce((a, b) => a + b, 0),
      errorBreakdown: { ...errorCounts }
    };
  }, []);

  return {
    trackApiResponse,
    getPerformanceSummary
  };
}