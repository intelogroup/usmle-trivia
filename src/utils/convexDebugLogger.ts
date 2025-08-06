/**
 * 🏥 MedQuiz Pro - Enhanced Convex Debug Logger
 * 
 * This utility provides comprehensive logging and debugging capabilities
 * for Convex database operations and user interactions, following
 * VCT framework principles for systematic error handling.
 * 
 * Features:
 * - Real-time operation monitoring
 * - Performance metrics tracking
 * - User action analytics
 * - Error context preservation
 * - HIPAA-compliant logging
 */

interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  CRITICAL: 'critical';
}

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  category: string;
  operation: string;
  duration?: number;
  success: boolean;
  context?: Record<string, any>;
  error?: string;
  userId?: string;
  sessionId?: string;
  performanceMetrics?: {
    memoryUsage?: number;
    networkLatency?: number;
    renderTime?: number;
  };
}

class ConvexDebugLogger {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private isProduction: boolean;
  private maxLogEntries = 1000;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = import.meta.env.PROD;
    this.setupPerformanceMonitoring();
  }

  /**
   * Generate unique session identifier
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Monitor page load performance
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        this.logOperation('SYSTEM', 'Page Load Complete', {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstPaint: this.getFirstPaintTime()
        }, true);
      });
    }
  }

  /**
   * Get first paint timing
   */
  private getFirstPaintTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * Core logging method
   */
  private log(
    level: keyof LogLevel,
    category: string,
    operation: string,
    context?: Record<string, any>,
    success: boolean = true,
    duration?: number,
    error?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      operation,
      duration,
      success,
      context: this.sanitizeContext(context),
      error,
      sessionId: this.sessionId,
      performanceMetrics: this.getCurrentPerformanceMetrics()
    };

    this.logs.push(entry);
    this.maintainLogSize();

    // Output to console in development
    if (!this.isProduction) {
      this.consoleLog(entry);
    }

    // Store critical errors for review
    if (level === 'ERROR' || level === 'CRITICAL') {
      this.storeCriticalError(entry);
    }
  }

  /**
   * Sanitize context to remove PII (HIPAA compliance)
   */
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    
    // Remove or hash sensitive fields
    const sensitiveFields = ['email', 'password', 'ssn', 'phone', 'address'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = this.hashValue(sanitized[field]);
      }
    });

    // Hash user IDs for privacy
    if (sanitized.userId) {
      sanitized.userId = this.hashValue(sanitized.userId);
    }

    return sanitized;
  }

  /**
   * Hash sensitive values
   */
  private hashValue(value: string): string {
    // Simple hash for demo - use proper crypto in production
    return `hashed_${btoa(value).substring(0, 8)}`;
  }

  /**
   * Get current performance metrics
   */
  private getCurrentPerformanceMetrics(): LogEntry['performanceMetrics'] {
    if (typeof window === 'undefined') return undefined;

    return {
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      networkLatency: this.getAverageNetworkLatency(),
      renderTime: performance.now()
    };
  }

  /**
   * Calculate average network latency from recent requests
   */
  private getAverageNetworkLatency(): number {
    const networkEntries = performance.getEntriesByType('resource')
      .slice(-10) // Last 10 requests
      .filter(entry => entry.name.includes('convex.cloud'));
    
    if (networkEntries.length === 0) return 0;
    
    const totalLatency = networkEntries.reduce((sum, entry) => 
      sum + (entry.responseEnd - entry.requestStart), 0);
    
    return totalLatency / networkEntries.length;
  }

  /**
   * Maintain log size limit
   */
  private maintainLogSize(): void {
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }
  }

  /**
   * Console logging with formatting
   */
  private consoleLog(entry: LogEntry): void {
    const emoji = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      critical: '🚨'
    };

    const color = {
      debug: 'color: #888',
      info: 'color: #0066cc',
      warn: 'color: #ff8800',
      error: 'color: #cc0000',
      critical: 'color: #cc0000; font-weight: bold'
    };

    console.log(
      `%c${emoji[entry.level]} [${entry.category}] ${entry.operation} ${entry.success ? '✅' : '❌'}`,
      color[entry.level],
      entry.duration ? `(${entry.duration}ms)` : '',
      entry.context || ''
    );

    if (entry.error) {
      console.error('Error details:', entry.error);
    }
  }

  /**
   * Store critical errors for review
   */
  private storeCriticalError(entry: LogEntry): void {
    try {
      const criticalErrors = JSON.parse(localStorage.getItem('medquiz_critical_errors') || '[]');
      criticalErrors.push(entry);
      
      // Keep only last 50 critical errors
      if (criticalErrors.length > 50) {
        criticalErrors.splice(0, criticalErrors.length - 50);
      }
      
      localStorage.setItem('medquiz_critical_errors', JSON.stringify(criticalErrors));
    } catch (error) {
      console.error('Failed to store critical error:', error);
    }
  }

  /**
   * Public logging methods
   */
  logConvexOperation(operation: string, context?: Record<string, any>, duration?: number): void {
    this.log('INFO', 'CONVEX', operation, context, true, duration);
  }

  logConvexError(operation: string, error: string, context?: Record<string, any>): void {
    this.log('ERROR', 'CONVEX', operation, context, false, undefined, error);
  }

  logUserAction(action: string, context?: Record<string, any>): void {
    this.log('INFO', 'USER', action, context, true);
  }

  logQuizAction(action: string, context?: Record<string, any>, duration?: number): void {
    this.log('INFO', 'QUIZ', action, context, true, duration);
  }

  logQuizError(action: string, error: string, context?: Record<string, any>): void {
    this.log('ERROR', 'QUIZ', action, context, false, undefined, error);
  }

  logAuthentication(action: string, success: boolean, context?: Record<string, any>): void {
    this.log(success ? 'INFO' : 'WARN', 'AUTH', action, context, success);
  }

  logPerformance(operation: string, metrics: Record<string, number>): void {
    this.log('DEBUG', 'PERFORMANCE', operation, metrics, true);
  }

  logCritical(operation: string, error: string, context?: Record<string, any>): void {
    this.log('CRITICAL', 'SYSTEM', operation, context, false, undefined, error);
  }

  /**
   * Operation timer utility
   */
  startTimer(): () => void {
    const start = performance.now();
    return () => performance.now() - start;
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string, limit: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.category === category)
      .slice(-limit);
  }

  /**
   * Get error summary
   */
  getErrorSummary(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    recentErrors: LogEntry[];
  } {
    const errorLogs = this.logs.filter(log => !log.success);
    
    const errorsByCategory = errorLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: errorLogs.length,
      errorsByCategory,
      recentErrors: errorLogs.slice(-10)
    };
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): string {
    const exportData = {
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      totalLogs: this.logs.length,
      summary: this.getErrorSummary(),
      logs: this.logs
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('medquiz_critical_errors');
    this.log('INFO', 'SYSTEM', 'Logs cleared', undefined, true);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageOperationTime: number;
    totalOperations: number;
    networkLatency: number;
    memoryUsage: number;
  } {
    const timedOperations = this.logs.filter(log => log.duration !== undefined);
    const averageOperationTime = timedOperations.length > 0
      ? timedOperations.reduce((sum, log) => sum + (log.duration || 0), 0) / timedOperations.length
      : 0;

    const latestMetrics = this.logs
      .filter(log => log.performanceMetrics)
      .slice(-1)[0]?.performanceMetrics;

    return {
      averageOperationTime,
      totalOperations: this.logs.length,
      networkLatency: latestMetrics?.networkLatency || 0,
      memoryUsage: latestMetrics?.memoryUsage || 0
    };
  }
}

// Create singleton instance
export const convexLogger = new ConvexDebugLogger();

// Export utility decorators for easy integration
export const withLogging = <T extends (...args: any[]) => any>(
  fn: T,
  operation: string,
  category: 'CONVEX' | 'QUIZ' | 'AUTH' | 'USER' = 'CONVEX'
): T => {
  return ((...args: Parameters<T>) => {
    const timer = convexLogger.startTimer();
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then(value => {
            const duration = timer();
            convexLogger.log('INFO', category, operation, { args: args.slice(0, 2) }, true, duration);
            return value;
          })
          .catch(error => {
            const duration = timer();
            convexLogger.log('ERROR', category, operation, { args: args.slice(0, 2) }, false, duration, error.message);
            throw error;
          });
      } else {
        const duration = timer();
        convexLogger.log('INFO', category, operation, { args: args.slice(0, 2) }, true, duration);
        return result;
      }
    } catch (error) {
      const duration = timer();
      convexLogger.log('ERROR', category, operation, { args: args.slice(0, 2) }, false, duration, error.message);
      throw error;
    }
  }) as T;
};

// React hook for logging
export const useConvexLogger = () => {
  return {
    logOperation: convexLogger.logConvexOperation.bind(convexLogger),
    logError: convexLogger.logConvexError.bind(convexLogger),
    logUserAction: convexLogger.logUserAction.bind(convexLogger),
    logQuizAction: convexLogger.logQuizAction.bind(convexLogger),
    getErrorSummary: convexLogger.getErrorSummary.bind(convexLogger),
    getPerformanceSummary: convexLogger.getPerformanceSummary.bind(convexLogger),
    exportLogs: convexLogger.exportLogs.bind(convexLogger)
  };
};

export default convexLogger;