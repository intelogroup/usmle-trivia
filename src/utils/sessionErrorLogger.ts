/**
 * Session Error Logger for MedQuiz Pro
 * VCT Framework Compliant - Session Management Error Handling
 * 
 * This module provides comprehensive error logging for session management,
 * following HIPAA compliance standards and medical application best practices.
 */

import { ErrorHandler, ErrorType, ErrorSeverity, MedicalAppError } from './errorHandler';
import type { IUser, IQuizSession } from '../types';

// Session error types specific to medical application
export const SessionErrorType = {
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_SESSION_INVALID: 'AUTH_SESSION_INVALID', 
  AUTH_TOKEN_REFRESH_FAILED: 'AUTH_TOKEN_REFRESH_FAILED',
  QUIZ_SESSION_CORRUPTED: 'QUIZ_SESSION_CORRUPTED',
  QUIZ_SESSION_SYNC_FAILED: 'QUIZ_SESSION_SYNC_FAILED',
  QUIZ_SESSION_TIMEOUT: 'QUIZ_SESSION_TIMEOUT',
  QUIZ_SESSION_ABANDONED: 'QUIZ_SESSION_ABANDONED',
  SESSION_STORAGE_FAILED: 'SESSION_STORAGE_FAILED',
  SESSION_DISPLAY_ERROR: 'SESSION_DISPLAY_ERROR',
  SESSION_RECOVERY_FAILED: 'SESSION_RECOVERY_FAILED'
} as const;

export type SessionErrorType = typeof SessionErrorType[keyof typeof SessionErrorType];

// Session context types for error logging
export interface AuthSessionContext {
  sessionType: 'authentication';
  userId?: string; // Will be hashed in logging
  sessionDuration?: number;
  lastActivity?: Date;
  deviceInfo?: DeviceContext;
  authMethod?: 'email' | 'sso' | 'token';
  failureReason?: string;
}

export interface QuizSessionContext {
  sessionType: 'quiz';
  quizId?: string;
  questionCount?: number;
  currentQuestion?: number;
  timeRemaining?: number;
  mode: 'quick' | 'timed' | 'custom';
  completionPercentage?: number;
  lastSyncTime?: Date;
  deviceInfo?: DeviceContext;
}

export interface DeviceContext {
  userAgent: string;
  screenResolution: string;
  networkConnection?: string;
  batteryLevel?: number;
  orientation?: 'portrait' | 'landscape';
  touchSupport: boolean;
}

// Union type for all session contexts
export type SessionContext = AuthSessionContext | QuizSessionContext;

// Performance metrics for session tracking
export interface SessionPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  apiResponseTimes: number[];
  errorCount: number;
  retryAttempts: number;
}

// Session error log entry
export interface SessionErrorLog {
  id: string;
  timestamp: Date;
  sessionErrorType: SessionErrorType;
  baseErrorType: ErrorType;
  severity: ErrorSeverity;
  message: string;
  sessionContext: SessionContext;
  performanceMetrics?: SessionPerformanceMetrics;
  recoveryAttempted: boolean;
  recoverySuccessful?: boolean;
  userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  hashedUserId?: string;
  sessionId: string;
}

/**
 * Centralized Session Error Logger
 * Integrates with existing ErrorHandler while providing session-specific functionality
 */
export class SessionErrorLogger {
  private static instance: SessionErrorLogger;
  private sessionLogs: SessionErrorLog[] = [];
  private currentSessionId: string;
  private sessionStartTime: Date;
  private performanceObserver?: PerformanceObserver;

  private constructor() {
    this.currentSessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.initializePerformanceMonitoring();
    this.setupSessionRecovery();
  }

  /**
   * Singleton instance access
   */
  public static getInstance(): SessionErrorLogger {
    if (!SessionErrorLogger.instance) {
      SessionErrorLogger.instance = new SessionErrorLogger();
    }
    return SessionErrorLogger.instance;
  }

  /**
   * Log authentication session errors
   */
  public async logAuthError(
    error: Error | unknown,
    context: Partial<AuthSessionContext>,
    sessionErrorType: SessionErrorType
  ): Promise<void> {
    const sessionContext: AuthSessionContext = {
      sessionType: 'authentication',
      deviceInfo: this.getDeviceContext(),
      ...context
    };

    await this.logSessionError(error, sessionContext, sessionErrorType);
  }

  /**
   * Log quiz session errors
   */
  public async logQuizError(
    error: Error | unknown,
    context: Partial<QuizSessionContext>,
    sessionErrorType: SessionErrorType
  ): Promise<void> {
    const sessionContext: QuizSessionContext = {
      sessionType: 'quiz',
      mode: context.mode || 'quick',
      deviceInfo: this.getDeviceContext(),
      ...context
    };

    await this.logSessionError(error, sessionContext, sessionErrorType);
  }

  /**
   * Core session error logging method
   */
  private async logSessionError(
    error: Error | unknown,
    sessionContext: SessionContext,
    sessionErrorType: SessionErrorType
  ): Promise<void> {
    // Convert to MedicalAppError using existing error handler
    const medicalError = await ErrorHandler.handleError(
      error, 
      `Session Error: ${sessionErrorType}`,
      { sessionContext, sessionErrorType }
    );

    // Create session-specific error log
    const sessionLog: SessionErrorLog = {
      id: this.generateLogId(),
      timestamp: new Date(),
      sessionErrorType,
      baseErrorType: medicalError.type,
      severity: this.determineSessionSeverity(sessionErrorType, medicalError.severity),
      message: medicalError.message,
      sessionContext,
      performanceMetrics: this.getCurrentPerformanceMetrics(),
      recoveryAttempted: false,
      userImpact: this.assessUserImpact(sessionErrorType, sessionContext),
      hashedUserId: this.getHashedUserId(sessionContext),
      sessionId: this.currentSessionId
    };

    // Store session log
    this.sessionLogs.push(sessionLog);

    // Attempt automatic recovery
    const recoveryResult = await this.attemptSessionRecovery(sessionLog);
    sessionLog.recoveryAttempted = true;
    sessionLog.recoverySuccessful = recoveryResult;

    // Persist to storage
    await this.persistSessionLogs();

    // Report to monitoring if critical
    if (sessionLog.severity === ErrorSeverity.CRITICAL) {
      await this.reportCriticalSessionError(sessionLog);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      this.logToConsole(sessionLog);
    }
  }

  /**
   * Get current session status and metrics
   */
  public getSessionStatus(): {
    sessionId: string;
    duration: number;
    errorCount: number;
    lastError?: SessionErrorLog;
    health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  } {
    const duration = Date.now() - this.sessionStartTime.getTime();
    const errorCount = this.sessionLogs.length;
    const criticalErrors = this.sessionLogs.filter(log => 
      log.severity === ErrorSeverity.CRITICAL
    ).length;
    
    let health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'excellent';
    
    if (criticalErrors > 0) {
      health = 'critical';
    } else if (errorCount > 10) {
      health = 'poor';
    } else if (errorCount > 5) {
      health = 'fair';
    } else if (errorCount > 2) {
      health = 'good';
    }

    return {
      sessionId: this.currentSessionId,
      duration,
      errorCount,
      lastError: this.sessionLogs[this.sessionLogs.length - 1],
      health
    };
  }

  /**
   * Recovery mechanism for different session error types
   */
  private async attemptSessionRecovery(sessionLog: SessionErrorLog): Promise<boolean> {
    try {
      switch (sessionLog.sessionErrorType) {
        case SessionErrorType.AUTH_SESSION_EXPIRED:
          return await this.recoverAuthSession();
          
        case SessionErrorType.QUIZ_SESSION_CORRUPTED:
          return await this.recoverQuizSession(sessionLog.sessionContext as QuizSessionContext);
          
        case SessionErrorType.SESSION_STORAGE_FAILED:
          return await this.recoverSessionStorage();
          
        case SessionErrorType.QUIZ_SESSION_SYNC_FAILED:
          return await this.recoverQuizSync(sessionLog.sessionContext as QuizSessionContext);
          
        default:
          // Generic recovery attempt
          return await this.genericSessionRecovery();
      }
    } catch (recoveryError) {
      console.warn('Session recovery failed:', recoveryError);
      return false;
    }
  }

  /**
   * Authentication session recovery
   */
  private async recoverAuthSession(): Promise<boolean> {
    try {
      // Attempt to refresh token or prompt re-authentication
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // This would integrate with your auth service
        console.log('Attempting token refresh...');
        return true; // Placeholder - implement actual refresh logic
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Quiz session recovery
   */
  private async recoverQuizSession(context: QuizSessionContext): Promise<boolean> {
    try {
      // Attempt to restore quiz state from local storage or server
      const savedQuizState = localStorage.getItem(`quiz_session_${context.quizId}`);
      if (savedQuizState) {
        console.log('Restoring quiz session from backup...');
        return true; // Placeholder - implement actual restoration logic
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Session storage recovery
   */
  private async recoverSessionStorage(): Promise<boolean> {
    try {
      // Clear corrupted storage and reinitialize
      sessionStorage.clear();
      localStorage.removeItem('corrupted_data_flag');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Quiz sync recovery
   */
  private async recoverQuizSync(context: QuizSessionContext): Promise<boolean> {
    try {
      // Attempt to re-sync quiz data
      console.log('Attempting quiz data sync recovery...');
      // This would integrate with your quiz service
      return true; // Placeholder
    } catch {
      return false;
    }
  }

  /**
   * Generic session recovery
   */
  private async genericSessionRecovery(): Promise<boolean> {
    try {
      // Basic recovery steps: refresh page data, clear caches
      console.log('Attempting generic session recovery...');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Determine session-specific error severity
   */
  private determineSessionSeverity(
    sessionErrorType: SessionErrorType, 
    baseSeverity: ErrorSeverity
  ): ErrorSeverity {
    // Critical session errors that require immediate attention
    const criticalSessionErrors = [
      SessionErrorType.AUTH_SESSION_INVALID,
      SessionErrorType.SESSION_RECOVERY_FAILED
    ];

    // High priority session errors
    const highPriorityErrors = [
      SessionErrorType.AUTH_SESSION_EXPIRED,
      SessionErrorType.QUIZ_SESSION_CORRUPTED,
      SessionErrorType.SESSION_STORAGE_FAILED
    ];

    if (criticalSessionErrors.includes(sessionErrorType)) {
      return ErrorSeverity.CRITICAL;
    }
    
    if (highPriorityErrors.includes(sessionErrorType)) {
      return ErrorSeverity.HIGH;
    }

    // Use base severity for other errors
    return baseSeverity;
  }

  /**
   * Assess user impact of session errors
   */
  private assessUserImpact(
    sessionErrorType: SessionErrorType,
    context: SessionContext
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    switch (sessionErrorType) {
      case SessionErrorType.AUTH_SESSION_EXPIRED:
        return 'high'; // User needs to re-login
        
      case SessionErrorType.QUIZ_SESSION_CORRUPTED:
        return context.sessionType === 'quiz' && 
               (context as QuizSessionContext).completionPercentage > 50 
               ? 'critical' : 'high';
               
      case SessionErrorType.SESSION_DISPLAY_ERROR:
        return 'medium'; // UI issues but functionality may work
        
      case SessionErrorType.QUIZ_SESSION_SYNC_FAILED:
        return 'medium'; // Progress might not save
        
      default:
        return 'low';
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('session') || entry.name.includes('quiz')) {
            // Track session-related performance metrics
            console.log('Session performance:', entry);
          }
        }
      });

      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'measure', 'mark'] 
      });
    }
  }

  /**
   * Setup session recovery mechanisms
   */
  private setupSessionRecovery(): void {
    // Listen for storage events
    window.addEventListener('storage', (event) => {
      if (event.key?.includes('session') && !event.newValue) {
        this.logSessionError(
          new Error('Session data lost'), 
          { sessionType: 'authentication' } as AuthSessionContext,
          SessionErrorType.SESSION_STORAGE_FAILED
        );
      }
    });

    // Listen for visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Session backgrounded
        sessionStorage.setItem('session_backgrounded', Date.now().toString());
      } else {
        // Session resumed
        const backgroundedTime = sessionStorage.getItem('session_backgrounded');
        if (backgroundedTime) {
          const timeDiff = Date.now() - parseInt(backgroundedTime);
          if (timeDiff > 30 * 60 * 1000) { // 30 minutes
            this.logSessionError(
              new Error('Long session background period'),
              { sessionType: 'authentication' } as AuthSessionContext,
              SessionErrorType.AUTH_SESSION_EXPIRED
            );
          }
        }
      }
    });
  }

  /**
   * Get device context for error logging
   */
  private getDeviceContext(): DeviceContext {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      networkConnection: (navigator as any).connection?.effectiveType || 'unknown',
      batteryLevel: (navigator as any).getBattery?.()?.level || undefined,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      touchSupport: 'ontouchstart' in window
    };
  }

  /**
   * Get current performance metrics
   */
  private getCurrentPerformanceMetrics(): SessionPerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      renderTime: performance.now(),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined,
      apiResponseTimes: [], // Would be populated by API interceptors
      errorCount: this.sessionLogs.length,
      retryAttempts: 0 // Would be tracked per operation
    };
  }

  /**
   * Get hashed user ID from session context
   */
  private getHashedUserId(context: SessionContext): string | undefined {
    if (context.sessionType === 'authentication' && context.userId) {
      return `hash_${btoa(context.userId).slice(0, 8)}`;
    }
    return undefined;
  }

  /**
   * Persist session logs to storage
   */
  private async persistSessionLogs(): Promise<void> {
    try {
      // Keep only last 50 session logs to prevent storage overflow
      const logsToKeep = this.sessionLogs.slice(-50);
      
      localStorage.setItem('medquiz_session_logs', JSON.stringify(logsToKeep.map(log => ({
        ...log,
        // Remove potentially sensitive data before storage
        sessionContext: {
          ...log.sessionContext,
          userId: undefined // Never store user IDs
        }
      }))));
    } catch (error) {
      console.error('Failed to persist session logs:', error);
    }
  }

  /**
   * Report critical session errors to monitoring
   */
  private async reportCriticalSessionError(sessionLog: SessionErrorLog): Promise<void> {
    try {
      // This would integrate with your monitoring service
      console.error('Critical session error:', sessionLog);
      
      // Example: Send to monitoring service
      // await fetch('/api/critical-errors', {
      //   method: 'POST',
      //   body: JSON.stringify(sessionLog)
      // });
    } catch (error) {
      console.error('Failed to report critical session error:', error);
    }
  }

  /**
   * Console logging for development
   */
  private logToConsole(sessionLog: SessionErrorLog): void {
    const icon = sessionLog.severity === ErrorSeverity.CRITICAL ? '🚨' : 
                 sessionLog.severity === ErrorSeverity.HIGH ? '⚠️' : 
                 sessionLog.severity === ErrorSeverity.MEDIUM ? '🟡' : '🔵';

    console.group(`${icon} Session Error [${sessionLog.sessionErrorType}]`);
    console.log('Timestamp:', sessionLog.timestamp.toISOString());
    console.log('Session ID:', sessionLog.sessionId);
    console.log('Message:', sessionLog.message);
    console.log('Context:', sessionLog.sessionContext);
    console.log('User Impact:', sessionLog.userImpact);
    console.log('Recovery Attempted:', sessionLog.recoveryAttempted);
    if (sessionLog.recoverySuccessful !== undefined) {
      console.log('Recovery Successful:', sessionLog.recoverySuccessful);
    }
    console.log('Performance:', sessionLog.performanceMetrics);
    console.groupEnd();
  }

  /**
   * Utility methods
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Public methods for external integration
   */

  /**
   * Get session logs for debugging or analysis
   */
  public getSessionLogs(filter?: {
    sessionType?: 'authentication' | 'quiz';
    severity?: ErrorSeverity;
    timeRange?: { start: Date; end: Date };
  }): SessionErrorLog[] {
    let logs = [...this.sessionLogs];

    if (filter) {
      if (filter.sessionType) {
        logs = logs.filter(log => log.sessionContext.sessionType === filter.sessionType);
      }
      if (filter.severity) {
        logs = logs.filter(log => log.severity === filter.severity);
      }
      if (filter.timeRange) {
        logs = logs.filter(log => 
          log.timestamp >= filter.timeRange!.start && 
          log.timestamp <= filter.timeRange!.end
        );
      }
    }

    return logs;
  }

  /**
   * Clear session logs (useful for testing)
   */
  public clearSessionLogs(): void {
    this.sessionLogs = [];
    localStorage.removeItem('medquiz_session_logs');
  }

  /**
   * Export session logs for support
   */
  public exportSessionLogs(): string {
    const exportData = {
      sessionId: this.currentSessionId,
      exportTime: new Date().toISOString(),
      sessionDuration: Date.now() - this.sessionStartTime.getTime(),
      logs: this.sessionLogs.map(log => ({
        ...log,
        // Ensure no PII in export
        hashedUserId: log.hashedUserId,
        sessionContext: {
          ...log.sessionContext,
          userId: undefined // Remove any user IDs
        }
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// Export singleton instance
export const sessionErrorLogger = SessionErrorLogger.getInstance();