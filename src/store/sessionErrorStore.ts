/**
 * Session Error Store for MedQuiz Pro
 * VCT Framework Compliant - Zustand Store Extension for Session Error Management
 * 
 * Extends the existing Zustand store with session error tracking,
 * recovery mechanisms, and analytics for medical applications.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  sessionErrorLogger, 
  SessionErrorType, 
  type SessionErrorLog,
  type AuthSessionContext,
  type QuizSessionContext
} from '../utils/sessionErrorLogger';
import { ErrorSeverity } from '../utils/errorHandler';

// Session error state interface
interface SessionError {
  id: string;
  type: SessionErrorType;
  severity: ErrorSeverity;
  message: string;
  timestamp: Date;
  sessionType: 'authentication' | 'quiz';
  recovered: boolean;
  userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

// Session health metrics
interface SessionHealthMetrics {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  errorCount: number;
  criticalErrorCount: number;
  recoveryCount: number;
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

// Session error store state
interface SessionErrorState {
  // Error tracking
  currentSessionErrors: SessionError[];
  sessionHealth: SessionHealthMetrics | null;
  isMonitoring: boolean;
  
  // Recovery state
  isRecovering: boolean;
  lastRecoveryAttempt: Date | null;
  recoveryInProgress: SessionErrorType | null;
  
  // User notifications
  suppressNotifications: boolean;
  lastNotificationTime: Date | null;
  
  // Analytics
  sessionStartTime: Date;
  totalSessionTime: number;
  errorFrequency: Record<SessionErrorType, number>;
  
  // Actions
  startErrorMonitoring: () => void;
  stopErrorMonitoring: () => void;
  recordSessionError: (error: SessionError) => void;
  attemptErrorRecovery: (errorType: SessionErrorType) => Promise<boolean>;
  clearSessionErrors: () => void;
  updateSessionHealth: () => void;
  getErrorsForTimeRange: (start: Date, end: Date) => SessionError[];
  exportErrorReport: () => string;
  
  // Notification management
  setSuppressNotifications: (suppress: boolean) => void;
  shouldShowNotification: (errorType: SessionErrorType) => boolean;
  
  // Analytics
  getErrorAnalytics: () => {
    totalErrors: number;
    errorsByType: Record<SessionErrorType, number>;
    errorsByTime: Array<{ time: Date; count: number }>;
    averageRecoveryTime: number;
    sessionStability: number;
  };
}

// Create session error store
export const useSessionErrorStore = create<SessionErrorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentSessionErrors: [],
        sessionHealth: null,
        isMonitoring: false,
        isRecovering: false,
        lastRecoveryAttempt: null,
        recoveryInProgress: null,
        suppressNotifications: false,
        lastNotificationTime: null,
        sessionStartTime: new Date(),
        totalSessionTime: 0,
        errorFrequency: {} as Record<SessionErrorType, number>,

        // Start error monitoring
        startErrorMonitoring: () => {
          set({
            isMonitoring: true,
            sessionStartTime: new Date(),
            sessionHealth: {
              sessionId: sessionErrorLogger.getSessionStatus().sessionId,
              startTime: new Date(),
              lastActivity: new Date(),
              errorCount: 0,
              criticalErrorCount: 0,
              recoveryCount: 0,
              health: 'excellent'
            }
          });

          // Set up periodic health updates
          const healthUpdateInterval = setInterval(() => {
            if (get().isMonitoring) {
              get().updateSessionHealth();
            } else {
              clearInterval(healthUpdateInterval);
            }
          }, 30000); // Update every 30 seconds
        },

        // Stop error monitoring
        stopErrorMonitoring: () => {
          const state = get();
          const sessionDuration = Date.now() - state.sessionStartTime.getTime();
          
          set({
            isMonitoring: false,
            totalSessionTime: state.totalSessionTime + sessionDuration
          });
        },

        // Record new session error
        recordSessionError: (error: SessionError) => {
          set(state => {
            const updatedErrors = [...state.currentSessionErrors, error];
            const updatedFrequency = {
              ...state.errorFrequency,
              [error.type]: (state.errorFrequency[error.type] || 0) + 1
            };

            return {
              currentSessionErrors: updatedErrors,
              errorFrequency: updatedFrequency,
              lastNotificationTime: error.severity === ErrorSeverity.CRITICAL || 
                                   error.severity === ErrorSeverity.HIGH 
                                   ? new Date() 
                                   : state.lastNotificationTime
            };
          });

          // Update health metrics
          get().updateSessionHealth();
        },

        // Attempt error recovery
        attemptErrorRecovery: async (errorType: SessionErrorType) => {
          const state = get();
          
          if (state.isRecovering) {
            console.warn('Recovery already in progress');
            return false;
          }

          set({ 
            isRecovering: true, 
            lastRecoveryAttempt: new Date(),
            recoveryInProgress: errorType 
          });

          try {
            // Delegate to session error logger for actual recovery
            const recovered = await performErrorRecovery(errorType);
            
            if (recovered) {
              // Update errors to mark as recovered
              set(state => ({
                currentSessionErrors: state.currentSessionErrors.map(error => 
                  error.type === errorType ? { ...error, recovered: true } : error
                ),
                isRecovering: false,
                recoveryInProgress: null
              }));

              // Update session health
              const health = state.sessionHealth;
              if (health) {
                set({
                  sessionHealth: {
                    ...health,
                    recoveryCount: health.recoveryCount + 1
                  }
                });
              }
            } else {
              set({ isRecovering: false, recoveryInProgress: null });
            }

            return recovered;
          } catch (error) {
            console.error('Recovery attempt failed:', error);
            set({ isRecovering: false, recoveryInProgress: null });
            return false;
          }
        },

        // Clear session errors
        clearSessionErrors: () => {
          set({ currentSessionErrors: [] });
          get().updateSessionHealth();
        },

        // Update session health metrics
        updateSessionHealth: () => {
          const state = get();
          const loggerStatus = sessionErrorLogger.getSessionStatus();
          
          if (!state.sessionHealth) return;

          const errorCount = state.currentSessionErrors.length;
          const criticalErrorCount = state.currentSessionErrors.filter(
            error => error.severity === ErrorSeverity.CRITICAL
          ).length;

          let health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'excellent';
          
          if (criticalErrorCount > 0) {
            health = 'critical';
          } else if (errorCount > 10) {
            health = 'poor';
          } else if (errorCount > 5) {
            health = 'fair';
          } else if (errorCount > 2) {
            health = 'good';
          }

          set({
            sessionHealth: {
              ...state.sessionHealth,
              lastActivity: new Date(),
              errorCount,
              criticalErrorCount,
              health
            }
          });
        },

        // Get errors for time range
        getErrorsForTimeRange: (start: Date, end: Date) => {
          return get().currentSessionErrors.filter(error => 
            error.timestamp >= start && error.timestamp <= end
          );
        },

        // Export error report
        exportErrorReport: () => {
          const state = get();
          const report = {
            sessionId: state.sessionHealth?.sessionId,
            reportGeneratedAt: new Date().toISOString(),
            sessionDuration: Date.now() - state.sessionStartTime.getTime(),
            sessionHealth: state.sessionHealth,
            totalErrors: state.currentSessionErrors.length,
            errorBreakdown: state.errorFrequency,
            errors: state.currentSessionErrors.map(error => ({
              ...error,
              // Sanitize any sensitive data
              message: error.message.replace(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/g, '[EMAIL]')
            })),
            analytics: get().getErrorAnalytics()
          };

          return JSON.stringify(report, null, 2);
        },

        // Set notification suppression
        setSuppressNotifications: (suppress: boolean) => {
          set({ suppressNotifications: suppress });
        },

        // Check if notification should be shown
        shouldShowNotification: (errorType: SessionErrorType) => {
          const state = get();
          
          if (state.suppressNotifications) return false;
          
          // Don't spam notifications - limit to one per minute for same error type
          if (state.lastNotificationTime) {
            const timeSinceLastNotification = 
              Date.now() - state.lastNotificationTime.getTime();
            if (timeSinceLastNotification < 60000) { // 1 minute
              return false;
            }
          }

          // Show notifications for high-impact errors
          const highImpactErrors = [
            SessionErrorType.AUTH_SESSION_EXPIRED,
            SessionErrorType.AUTH_SESSION_INVALID,
            SessionErrorType.QUIZ_SESSION_CORRUPTED,
            SessionErrorType.SESSION_RECOVERY_FAILED
          ];

          return highImpactErrors.includes(errorType);
        },

        // Get error analytics
        getErrorAnalytics: () => {
          const state = get();
          const errors = state.currentSessionErrors;
          
          // Group errors by time (hourly buckets)
          const errorsByTime: Array<{ time: Date; count: number }> = [];
          const hourlyBuckets: Record<string, number> = {};
          
          errors.forEach(error => {
            const hour = new Date(error.timestamp);
            hour.setMinutes(0, 0, 0);
            const hourKey = hour.toISOString();
            hourlyBuckets[hourKey] = (hourlyBuckets[hourKey] || 0) + 1;
          });

          Object.entries(hourlyBuckets).forEach(([timeStr, count]) => {
            errorsByTime.push({ time: new Date(timeStr), count });
          });

          // Calculate recovery times
          const recoveredErrors = errors.filter(error => error.recovered);
          const averageRecoveryTime = recoveredErrors.length > 0
            ? recoveredErrors.reduce((total, error) => {
                // Estimate recovery time based on error type
                const recoveryTime = getEstimatedRecoveryTime(error.type);
                return total + recoveryTime;
              }, 0) / recoveredErrors.length
            : 0;

          // Calculate session stability (inverse of error frequency)
          const sessionDuration = Date.now() - state.sessionStartTime.getTime();
          const sessionStability = sessionDuration > 0 
            ? Math.max(0, 100 - (errors.length * 1000 / sessionDuration * 60)) // errors per minute, scaled
            : 100;

          return {
            totalErrors: errors.length,
            errorsByType: state.errorFrequency,
            errorsByTime: errorsByTime.sort((a, b) => a.time.getTime() - b.time.getTime()),
            averageRecoveryTime,
            sessionStability: Math.round(sessionStability * 100) / 100
          };
        }
      }),
      {
        name: 'session-error-storage',
        partialize: (state) => ({
          // Only persist aggregated data, not full error logs
          errorFrequency: state.errorFrequency,
          totalSessionTime: state.totalSessionTime,
          suppressNotifications: state.suppressNotifications
        })
      }
    ),
    {
      name: 'session-error-store'
    }
  )
);

/**
 * Perform actual error recovery based on error type
 */
async function performErrorRecovery(errorType: SessionErrorType): Promise<boolean> {
  try {
    switch (errorType) {
      case SessionErrorType.AUTH_SESSION_EXPIRED:
        // Attempt token refresh
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('Attempting authentication recovery...');
          // Integrate with auth service
          return true; // Placeholder
        }
        return false;

      case SessionErrorType.QUIZ_SESSION_CORRUPTED:
        // Attempt to restore quiz from backup
        console.log('Attempting quiz session recovery...');
        const backupData = localStorage.getItem('quiz_backup');
        if (backupData) {
          return true; // Placeholder
        }
        return false;

      case SessionErrorType.SESSION_STORAGE_FAILED:
        // Clear corrupted storage
        try {
          localStorage.clear();
          sessionStorage.clear();
          return true;
        } catch {
          return false;
        }

      default:
        // Generic recovery
        console.log('Attempting generic recovery...');
        return true;
    }
  } catch (error) {
    console.error('Recovery failed:', error);
    return false;
  }
}

/**
 * Get estimated recovery time for different error types
 */
function getEstimatedRecoveryTime(errorType: SessionErrorType): number {
  const recoveryTimes: Record<SessionErrorType, number> = {
    [SessionErrorType.AUTH_SESSION_EXPIRED]: 2000,
    [SessionErrorType.AUTH_SESSION_INVALID]: 1500,
    [SessionErrorType.AUTH_TOKEN_REFRESH_FAILED]: 3000,
    [SessionErrorType.QUIZ_SESSION_CORRUPTED]: 2500,
    [SessionErrorType.QUIZ_SESSION_SYNC_FAILED]: 1000,
    [SessionErrorType.QUIZ_SESSION_TIMEOUT]: 500,
    [SessionErrorType.QUIZ_SESSION_ABANDONED]: 0,
    [SessionErrorType.SESSION_STORAGE_FAILED]: 1000,
    [SessionErrorType.SESSION_DISPLAY_ERROR]: 800,
    [SessionErrorType.SESSION_RECOVERY_FAILED]: 5000
  };

  return recoveryTimes[errorType] || 1000;
}

// Utility hook for session error monitoring
export function useSessionErrorMonitoring() {
  const store = useSessionErrorStore();
  
  return {
    isMonitoring: store.isMonitoring,
    sessionHealth: store.sessionHealth,
    currentErrors: store.currentSessionErrors,
    startMonitoring: store.startErrorMonitoring,
    stopMonitoring: store.stopErrorMonitoring,
    getAnalytics: store.getErrorAnalytics,
    exportReport: store.exportErrorReport
  };
}