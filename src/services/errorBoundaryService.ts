/**
 * Comprehensive Error Boundary Service
 * Advanced error handling, logging, and recovery for medical education platform
 * HIPAA-compliant error logging with patient data protection
 */

import React from 'react';
import { analyticsService } from './analytics';

// Error types and interfaces
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  eventType?: string;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: number;
  error: Error;
  errorInfo: ErrorInfo;
  userId?: string; // Hashed for HIPAA compliance
  sessionId: string;
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'data' | 'network' | 'security' | 'medical-content';
  recoverable: boolean;
  recoveryAttempts: number;
  context: ErrorContext;
}

export interface ErrorContext {
  page: string;
  userAction: string;
  medicalContent?: {
    questionId?: string;
    quizMode?: string;
    category?: string;
  };
  systemState: {
    memoryUsage?: number;
    networkStatus?: string;
    timeOfDay: string;
  };
}

export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'redirect' | 'reset' | 'refresh';
  maxAttempts: number;
  delay: number; // ms
  fallbackComponent?: React.ComponentType<any>;
  fallbackProps?: any;
  onRecovery?: () => void;
}

export interface ErrorBoundaryConfig {
  id: string;
  level: 'app' | 'page' | 'component' | 'widget';
  autoRecover: boolean;
  maxRecoveryAttempts: number;
  recoveryStrategies: ErrorRecoveryStrategy[];
  logErrors: boolean;
  showErrorDetails: boolean; // Only in development
  fallbackComponent: React.ComponentType<any>;
  medicalContentProtection: boolean; // Special handling for medical data
}

// Medical-specific error types
export type MedicalError = 
  | 'question-load-failed'
  | 'explanation-parse-error'
  | 'medical-validation-failed'
  | 'quiz-state-corrupted'
  | 'medical-term-lookup-failed'
  | 'patient-data-error'; // HIPAA sensitive

export class ErrorBoundaryService {
  private static instance: ErrorBoundaryService;
  private errorLog: ErrorLogEntry[] = [];
  private maxLogEntries = 1000;
  private recoveryAttempts = new Map<string, number>();
  private boundaryConfigs = new Map<string, ErrorBoundaryConfig>();

  constructor() {
    this.setupGlobalErrorHandlers();
    this.initializeDefaultConfigs();
  }

  static getInstance(): ErrorBoundaryService {
    if (!ErrorBoundaryService.instance) {
      ErrorBoundaryService.instance = new ErrorBoundaryService();
    }
    return ErrorBoundaryService.instance;
  }

  /**
   * Setup global error handlers for unhandled errors
   */
  private setupGlobalErrorHandlers(): void {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.logError(
        event.error || new Error(event.message),
        {
          componentStack: 'Global',
          eventType: 'javascript-error'
        },
        {
          page: window.location.pathname,
          userAction: 'unknown',
          systemState: {
            networkStatus: (navigator as any).connection?.effectiveType || 'unknown',
            timeOfDay: new Date().toLocaleTimeString()
          }
        },
        'high',
        'ui'
      );
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          componentStack: 'Promise',
          eventType: 'promise-rejection'
        },
        {
          page: window.location.pathname,
          userAction: 'async-operation',
          systemState: {
            timeOfDay: new Date().toLocaleTimeString()
          }
        },
        'medium',
        'network'
      );
    });

    // Medical content specific error handler
    this.setupMedicalErrorHandlers();
  }

  /**
   * Setup medical content specific error handlers
   */
  private setupMedicalErrorHandlers(): void {
    // Listen for custom medical errors
    document.addEventListener('medical-error', ((event: CustomEvent) => {
      const { error, context } = event.detail;
      this.handleMedicalError(error, context);
    }) as EventListener);
  }

  /**
   * Handle medical-specific errors with HIPAA compliance
   */
  handleMedicalError(error: Error, context: any): void {
    // Sanitize medical context to remove any PII
    const sanitizedContext = this.sanitizeMedicalContext(context);
    
    this.logError(
      error,
      {
        componentStack: context.componentStack || 'Medical Component',
        eventType: 'medical-error'
      },
      {
        page: window.location.pathname,
        userAction: context.userAction || 'medical-content-interaction',
        medicalContent: sanitizedContext,
        systemState: {
          timeOfDay: new Date().toLocaleTimeString()
        }
      },
      'high',
      'medical-content'
    );
  }

  /**
   * Sanitize medical context to ensure HIPAA compliance
   */
  private sanitizeMedicalContext(context: any): any {
    return {
      questionId: context.questionId ? `q-${this.hashId(context.questionId)}` : undefined,
      quizMode: context.quizMode,
      category: context.category,
      // Remove any potential PII
      userAnswers: undefined,
      patientData: undefined,
      personalInfo: undefined
    };
  }

  /**
   * Hash ID for HIPAA compliance
   */
  private hashId(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Initialize default error boundary configurations
   */
  private initializeDefaultConfigs(): void {
    // App-level error boundary
    this.boundaryConfigs.set('app', {
      id: 'app',
      level: 'app',
      autoRecover: true,
      maxRecoveryAttempts: 3,
      recoveryStrategies: [
        {
          type: 'fallback',
          maxAttempts: 1,
          delay: 0,
          fallbackComponent: AppErrorFallback
        },
        {
          type: 'refresh',
          maxAttempts: 1,
          delay: 5000
        }
      ],
      logErrors: true,
      showErrorDetails: process.env.NODE_ENV === 'development',
      fallbackComponent: AppErrorFallback,
      medicalContentProtection: true
    });

    // Quiz-level error boundary
    this.boundaryConfigs.set('quiz', {
      id: 'quiz',
      level: 'page',
      autoRecover: true,
      maxRecoveryAttempts: 2,
      recoveryStrategies: [
        {
          type: 'retry',
          maxAttempts: 2,
          delay: 1000
        },
        {
          type: 'fallback',
          maxAttempts: 1,
          delay: 0,
          fallbackComponent: QuizErrorFallback
        }
      ],
      logErrors: true,
      showErrorDetails: false,
      fallbackComponent: QuizErrorFallback,
      medicalContentProtection: true
    });

    // Component-level error boundary
    this.boundaryConfigs.set('component', {
      id: 'component',
      level: 'component',
      autoRecover: true,
      maxRecoveryAttempts: 1,
      recoveryStrategies: [
        {
          type: 'fallback',
          maxAttempts: 1,
          delay: 0,
          fallbackComponent: ComponentErrorFallback
        }
      ],
      logErrors: true,
      showErrorDetails: false,
      fallbackComponent: ComponentErrorFallback,
      medicalContentProtection: false
    });
  }

  /**
   * Log error with comprehensive context
   */
  logError(
    error: Error,
    errorInfo: ErrorInfo,
    context: ErrorContext,
    severity: ErrorLogEntry['severity'] = 'medium',
    category: ErrorLogEntry['category'] = 'ui'
  ): string {
    const errorId = this.generateErrorId();
    
    const logEntry: ErrorLogEntry = {
      id: errorId,
      timestamp: Date.now(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as Error,
      errorInfo,
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      severity,
      category,
      recoverable: this.isRecoverable(error, category),
      recoveryAttempts: this.recoveryAttempts.get(errorId) || 0,
      context
    };

    // Add to error log
    this.errorLog.push(logEntry);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogEntries) {
      this.errorLog.shift();
    }

    // Send to analytics (with privacy considerations)
    this.sendErrorToAnalytics(logEntry);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${severity.toUpperCase()}] - ${category}`);
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Error Info:', errorInfo);
      console.groupEnd();
    }

    return errorId;
  }

  /**
   * Attempt error recovery
   */
  async attemptRecovery(
    errorId: string,
    boundaryId: string,
    strategy: ErrorRecoveryStrategy
  ): Promise<boolean> {
    const attempts = this.recoveryAttempts.get(errorId) || 0;
    
    if (attempts >= strategy.maxAttempts) {
      console.warn(`Max recovery attempts reached for error ${errorId}`);
      return false;
    }

    this.recoveryAttempts.set(errorId, attempts + 1);

    try {
      switch (strategy.type) {
        case 'retry':
          await this.delay(strategy.delay);
          return true; // Let the component retry

        case 'fallback':
          // Fallback component will be rendered
          return true;

        case 'redirect':
          window.location.href = '/dashboard';
          return true;

        case 'reset':
          // Reset application state
          this.resetApplicationState();
          return true;

        case 'refresh':
          await this.delay(strategy.delay);
          window.location.reload();
          return true;

        default:
          return false;
      }
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      return false;
    }
  }

  /**
   * Get error boundary configuration
   */
  getBoundaryConfig(boundaryId: string): ErrorBoundaryConfig | null {
    return this.boundaryConfigs.get(boundaryId) || null;
  }

  /**
   * Register custom error boundary configuration
   */
  registerBoundaryConfig(config: ErrorBoundaryConfig): void {
    this.boundaryConfigs.set(config.id, config);
  }

  /**
   * Get error log for debugging/analysis
   */
  getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: number;
    recoveryRate: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const recentErrors = this.errorLog.filter(entry => entry.timestamp > oneHourAgo);
    const recoveredErrors = this.errorLog.filter(entry => entry.recoverable && entry.recoveryAttempts > 0);
    
    const errorsByCategory = this.errorLog.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const errorsBySeverity = this.errorLog.reduce((acc, entry) => {
      acc[entry.severity] = (acc[entry.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errorLog.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: recentErrors.length,
      recoveryRate: this.errorLog.length > 0 ? (recoveredErrors.length / this.errorLog.length) * 100 : 0
    };
  }

  /**
   * Clear error log (for testing)
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.recoveryAttempts.clear();
    console.log('🗑️ Error log cleared');
  }

  /**
   * Test error scenarios for debugging
   */
  triggerTestError(type: 'component' | 'medical' | 'network' | 'memory'): void {
    switch (type) {
      case 'component':
        throw new Error('Test component error for debugging');
      
      case 'medical':
        const medicalError = new Error('Medical content validation failed');
        document.dispatchEvent(new CustomEvent('medical-error', {
          detail: {
            error: medicalError,
            context: {
              questionId: 'test-q-123',
              quizMode: 'practice',
              category: 'cardiology',
              userAction: 'answer-submission'
            }
          }
        }));
        break;
      
      case 'network':
        Promise.reject(new Error('Network request failed for test'));
        break;
      
      case 'memory':
        const memoryError = new Error('Memory allocation failed');
        this.logError(memoryError, 
          { componentStack: 'Memory Test', eventType: 'memory-error' },
          {
            page: '/test',
            userAction: 'memory-stress-test',
            systemState: {
              memoryUsage: 90000000, // 90MB
              timeOfDay: new Date().toLocaleTimeString()
            }
          },
          'critical',
          'ui'
        );
        break;
    }
  }

  /**
   * Helper methods
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('error-session-id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error-session-id', sessionId);
    }
    return sessionId;
  }

  private isRecoverable(error: Error, category: ErrorLogEntry['category']): boolean {
    // Network and UI errors are typically recoverable
    if (category === 'network' || category === 'ui') return true;
    
    // Medical content errors may be recoverable depending on type
    if (category === 'medical-content') {
      return !error.message.includes('security') && !error.message.includes('validation');
    }
    
    // Security errors are not recoverable
    if (category === 'security') return false;
    
    return true;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private resetApplicationState(): void {
    // Clear caches
    sessionStorage.clear();
    
    // Reset any global state (would integrate with your state management)
    console.log('🔄 Application state reset');
  }

  private sendErrorToAnalytics(logEntry: ErrorLogEntry): void {
    // Send sanitized error data to analytics
    analyticsService.trackError({
      errorId: logEntry.id,
      category: logEntry.category,
      severity: logEntry.severity,
      recoverable: logEntry.recoverable,
      page: logEntry.context.page,
      // Don't send full error details or PII
      hashedUserId: logEntry.userId ? this.hashId(logEntry.userId) : undefined
    });
  }
}

// Fallback components
const AppErrorFallback: React.FC<{ error?: Error; resetErrorBoundary?: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-6xl mb-4">🏥</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        Medical Platform Error
      </h1>
      <p className="text-gray-600 mb-6">
        We're experiencing technical difficulties. Your patient data is safe and secure.
      </p>
      <div className="space-y-3">
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Return to Dashboard
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

const QuizErrorFallback: React.FC<{ error?: Error; resetErrorBoundary?: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="flex items-center justify-center min-h-[400px] p-4">
    <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6 text-center">
      <div className="text-4xl mb-4">📚</div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Quiz Loading Error
      </h2>
      <p className="text-gray-600 mb-6">
        Unable to load the quiz content. This may be a temporary issue.
      </p>
      <div className="space-y-3">
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Retry Quiz
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
);

const ComponentErrorFallback: React.FC<{ error?: Error; resetErrorBoundary?: () => void }> = ({ 
  resetErrorBoundary 
}) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-2">
    <div className="flex items-center">
      <div className="text-yellow-600 mr-3">⚠️</div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-yellow-800">
          Component Error
        </h3>
        <p className="text-sm text-yellow-700">
          This section couldn't load properly.
        </p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="ml-3 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
      >
        Retry
      </button>
    </div>
  </div>
);

// Export singleton instance
export const errorBoundaryService = ErrorBoundaryService.getInstance();