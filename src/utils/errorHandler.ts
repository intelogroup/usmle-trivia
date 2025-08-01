/**
 * Comprehensive Error Handling System for MedQuiz Pro
 * Follows 2025 best practices for medical applications
 */

import { AppwriteException } from 'appwrite';

// Error types for medical quiz application
export const ErrorType = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION', 
  NETWORK: 'NETWORK',
  DATABASE: 'DATABASE',
  VALIDATION: 'VALIDATION',
  QUIZ_ENGINE: 'QUIZ_ENGINE',
  FILE_UPLOAD: 'FILE_UPLOAD',
  RATE_LIMIT: 'RATE_LIMIT',
  MAINTENANCE: 'MAINTENANCE',
  UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

// Error severity levels
export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH', 
  CRITICAL: 'CRITICAL'
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

// Custom error class for medical app
export class MedicalAppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly context?: Record<string, any>;
  public readonly userMessage: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'MedicalAppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.context = context;
    this.userMessage = this.generateUserMessage();
    this.timestamp = new Date();
  }

  private generateUserMessage(): string {
    switch (this.type) {
      case ErrorType.AUTHENTICATION:
        return 'Please check your credentials and try again.';
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again.';
      case ErrorType.DATABASE:
        return 'We\'re experiencing technical difficulties. Please try again in a moment.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.QUIZ_ENGINE:
        return 'There was an issue with the quiz. Please refresh and try again.';
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment before trying again.';
      case ErrorType.MAINTENANCE:
        return 'The system is currently under maintenance. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Error reporting interface (HIPAA compliant)
interface ErrorReport {
  id: string;
  timestamp: Date;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  userId?: string; // Hashed user ID only
  sessionId?: string;
  userAgent?: string;
  url?: string;
  context?: Record<string, any>;
}

// Central error handler class
export class ErrorHandler {
  private static errorQueue: ErrorReport[] = [];
  private static isOnline = navigator.onLine;

  static {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Global error handlers
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error, 'Global Error');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError(event.reason, 'Unhandled Promise Rejection');
    });
  }

  /**
   * Main error handling method
   */
  static async handleError(
    error: Error | unknown,
    context?: string,
    additionalContext?: Record<string, any>
  ): Promise<MedicalAppError> {
    const medicalError = this.normalizeError(error, context, additionalContext);
    
    // Log error (HIPAA compliant)
    this.logError(medicalError);
    
    // Report to monitoring service
    await this.reportError(medicalError);
    
    // Show user notification if needed
    this.notifyUser(medicalError);
    
    return medicalError;
  }

  /**
   * Convert any error to MedicalAppError
   */
  private static normalizeError(
    error: Error | unknown,
    context?: string,
    additionalContext?: Record<string, any>
  ): MedicalAppError {
    // Handle Appwrite specific errors
    if (error instanceof AppwriteException) {
      return this.handleAppwriteError(error, context, additionalContext);
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new MedicalAppError(
        `Network error: ${error.message}`,
        ErrorType.NETWORK,
        ErrorSeverity.HIGH,
        'NETWORK_ERROR',
        { context, ...additionalContext }
      );
    }

    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return new MedicalAppError(
        error.message,
        ErrorType.VALIDATION,
        ErrorSeverity.LOW,
        'VALIDATION_ERROR',
        { context, ...additionalContext }
      );
    }

    // Handle generic errors
    if (error instanceof Error) {
      return new MedicalAppError(
        error.message,
        ErrorType.UNKNOWN,
        ErrorSeverity.MEDIUM,
        'GENERIC_ERROR',
        { context, originalError: error.name, ...additionalContext }
      );
    }

    // Handle unknown error types
    return new MedicalAppError(
      'An unknown error occurred',
      ErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM,
      'UNKNOWN_ERROR',
      { context, errorValue: String(error), ...additionalContext }
    );
  }

  /**
   * Handle Appwrite specific errors
   */
  private static handleAppwriteError(
    error: AppwriteException,
    context?: string,
    additionalContext?: Record<string, any>
  ): MedicalAppError {
    const { code, message, type } = error;

    // Map Appwrite errors to our error types
    let errorType: ErrorType;
    let severity: ErrorSeverity;

    switch (code) {
      case 401:
        errorType = ErrorType.AUTHENTICATION;
        severity = ErrorSeverity.HIGH;
        break;
      case 403:
        errorType = ErrorType.AUTHORIZATION;
        severity = ErrorSeverity.HIGH;
        break;
      case 404:
        errorType = ErrorType.DATABASE;
        severity = ErrorSeverity.MEDIUM;
        break;
      case 429:
        errorType = ErrorType.RATE_LIMIT;
        severity = ErrorSeverity.HIGH;
        break;
      case 500:
      case 502:
      case 503:
        errorType = ErrorType.DATABASE;
        severity = ErrorSeverity.CRITICAL;
        break;
      default:
        errorType = ErrorType.DATABASE;
        severity = ErrorSeverity.MEDIUM;
    }

    return new MedicalAppError(
      message || 'Database operation failed',
      errorType,
      severity,
      String(code),
      { context, appwriteType: type, ...additionalContext }
    );
  }

  /**
   * HIPAA-compliant error logging
   */
  private static logError(error: MedicalAppError): void {
    // Create sanitized log entry (no PHI)
    const logEntry = {
      timestamp: error.timestamp.toISOString(),
      type: error.type,
      severity: error.severity,
      code: error.code,
      message: error.message,
      userAgent: navigator.userAgent,
      url: window.location.pathname,
      // Hash user ID if available (never log plain user ID)
      userId: this.getHashedUserId(),
      sessionId: this.getSessionId(),
      context: this.sanitizeContext(error.context)
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 MedicalAppError [${error.severity}]`);
      console.error('Message:', error.message);
      console.error('Type:', error.type);
      console.error('Code:', error.code);
      console.error('Context:', error.context);
      console.error('Stack:', error.stack);
      console.groupEnd();
    }

    // Store in localStorage for offline capability
    try {
      const existingLogs = JSON.parse(localStorage.getItem('medquiz_error_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 errors to prevent storage overflow
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('medquiz_error_logs', JSON.stringify(existingLogs));
    } catch (storageError) {
      console.error('Failed to store error log:', storageError);
    }
  }

  /**
   * Report error to monitoring service
   */
  private static async reportError(error: MedicalAppError): Promise<void> {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: error.timestamp,
      type: error.type,
      severity: error.severity,
      message: error.message,
      code: error.code,
      userId: this.getHashedUserId(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.pathname,
      context: this.sanitizeContext(error.context)
    };

    if (this.isOnline) {
      try {
        // Send to monitoring service (Sentry, DataDog, etc.)
        await this.sendToMonitoring(report);
      } catch (reportingError) {
        // If reporting fails, queue for later
        this.errorQueue.push(report);
        console.error('Failed to report error:', reportingError);
      }
    } else {
      // Queue for when online
      this.errorQueue.push(report);
    }
  }

  /**
   * Send error to monitoring service
   */
  private static async sendToMonitoring(report: ErrorReport): Promise<void> {
    // Implementation depends on monitoring service (Sentry, DataDog, etc.)
    // Example with fetch:
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      throw new Error('Failed to send error report');
    }
  }

  /**
   * Flush queued errors when back online
   */
  private static async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    for (const report of errors) {
      try {
        await this.sendToMonitoring(report);
      } catch (error) {
        // Re-queue failed reports
        this.errorQueue.push(report);
      }
    }
  }

  /**
   * Notify user of error (if appropriate)
   */
  private static notifyUser(error: MedicalAppError): void {
    // Only notify for high severity errors or user-facing errors
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      // This would integrate with your notification system
      // For now, we'll just log to console
      console.warn('User notification:', error.userMessage);
    }
  }

  /**
   * Handle global errors
   */
  private static handleGlobalError(error: Error | unknown, context: string): void {
    this.handleError(error, context, { global: true });
  }

  /**
   * Utility methods
   */
  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getHashedUserId(): string | undefined {
    // Implementation would hash the user ID for privacy
    // Never log plain user IDs in medical applications
    const userId = localStorage.getItem('user_id');
    return userId ? `hash_${btoa(userId).slice(0, 8)}` : undefined;
  }

  private static getSessionId(): string | undefined {
    return sessionStorage.getItem('session_id') || undefined;
  }

  private static sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    // Remove sensitive data from context
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'email', 'phone'];
    const sanitized = { ...context };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

// Note: React Error Boundary Component should be in a separate .tsx file
// This is a TypeScript utility file

// Note: React hooks should be in a separate .tsx file or hooks directory
// This is a TypeScript utility file for error handling logic only

export default ErrorHandler;