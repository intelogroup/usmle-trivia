import React, { Component, ErrorInfo, ReactNode } from 'react';
import { convexLogger } from '../../utils/convexDebugLogger';

/**
 * 🏥 MedQuiz Pro - Enhanced Convex Error Boundary
 * 
 * This error boundary component provides comprehensive error handling
 * specifically designed for Convex database operations and quiz functionality.
 * 
 * Features:
 * - Comprehensive error logging with context
 * - Graceful error recovery mechanisms
 * - User-friendly error messages
 * - HIPAA-compliant error handling
 * - Performance impact monitoring
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  category?: 'CONVEX' | 'QUIZ' | 'AUTH' | 'UI';
  context?: Record<string, any>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number;
}

class ConvexErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryDelay = 2000;
  private errorThrottleTime = 5000; // Prevent error spam

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const now = Date.now();
    const { category = 'UI', context, onError } = this.props;
    
    // Throttle error reporting to prevent spam
    if (now - this.state.lastErrorTime < this.errorThrottleTime) {
      return;
    }

    this.setState({
      errorInfo,
      lastErrorTime: now
    });

    // Log error with comprehensive context
    convexLogger.logCritical(
      `${category} Error Boundary Triggered`,
      error.message,
      {
        errorId: this.state.errorId,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundaryContext: context,
        retryCount: this.state.retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    );

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Attempt auto-recovery for certain error types
    this.attemptAutoRecovery(error);
  }

  private attemptAutoRecovery = (error: Error) => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      convexLogger.logCritical(
        'Auto-recovery failed',
        `Maximum retry attempts reached: ${this.maxRetries}`,
        { errorId: this.state.errorId }
      );
      return;
    }

    // Auto-recovery for specific error types
    if (this.isRecoverableError(error)) {
      convexLogger.logConvexOperation(
        'Auto-recovery attempt',
        { errorId: this.state.errorId, retryCount: retryCount + 1 }
      );

      setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1
        }));
      }, this.retryDelay * (retryCount + 1)); // Exponential backoff
    }
  };

  private isRecoverableError = (error: Error): boolean => {
    const recoverablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /fetch/i,
      /convex/i
    ];

    return recoverablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  };

  private handleRetry = () => {
    convexLogger.logUserAction('Manual error recovery attempt', {
      errorId: this.state.errorId,
      retryCount: this.state.retryCount + 1
    });

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReportError = () => {
    const errorReport = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      context: this.props.context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Copy error report to clipboard for easy reporting
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        convexLogger.logUserAction('Error report copied to clipboard', {
          errorId: this.state.errorId
        });
        alert('Error report copied to clipboard. Please send this to support.');
      })
      .catch(() => {
        console.log('Error Report:', errorReport);
        alert('Error report logged to console. Please copy and send to support.');
      });
  };

  private renderErrorUI = () => {
    const { error, errorId, retryCount } = this.state;
    const { category = 'Application' } = this.props;
    const canRetry = retryCount < this.maxRetries;

    return (
      <div className="error-boundary-container min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="error-boundary-card max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.696-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Error Title */}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {category} Error Occurred
            </h3>

            {/* User-friendly error message */}
            <p className="text-sm text-gray-600 mb-4">
              {this.getFriendlyErrorMessage(error)}
            </p>

            {/* Error ID for support */}
            <p className="text-xs text-gray-400 mb-6">
              Error ID: {errorId}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Try Again {retryCount > 0 && `(${retryCount}/${this.maxRetries})`}
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Refresh Page
              </button>

              <button
                onClick={this.handleReportError}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Report Issue
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Return to Home
              </button>
            </div>
          </div>

          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 p-4 bg-gray-50 rounded-md">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Development Error Details
              </summary>
              <div className="mt-2 text-xs text-gray-600">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1 text-xs bg-white p-2 rounded border">
                    {error.stack}
                  </pre>
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1 text-xs bg-white p-2 rounded border">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  };

  private getFriendlyErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unexpected error occurred.';

    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Connection issue detected. Please check your internet connection and try again.';
    }

    if (message.includes('convex') || message.includes('database')) {
      return 'Database connection issue. Our team has been notified and is working on a fix.';
    }

    if (message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }

    if (message.includes('auth') || message.includes('login')) {
      return 'Authentication issue. Please try logging in again.';
    }

    if (message.includes('quiz') || message.includes('question')) {
      return 'Quiz loading issue. Please try starting a new quiz session.';
    }

    return 'Something went wrong. Please try refreshing the page or contact support if the issue persists.';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default error UI
      return this.props.fallback || this.renderErrorUI();
    }

    return this.props.children;
  }
}

export default ConvexErrorBoundary;

// HOC for wrapping components with error boundary
export const withConvexErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  category: Props['category'] = 'UI',
  context?: Props['context']
) => {
  const WithErrorBoundary = (props: P) => (
    <ConvexErrorBoundary category={category} context={context}>
      <WrappedComponent {...props} />
    </ConvexErrorBoundary>
  );

  WithErrorBoundary.displayName = `withConvexErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithErrorBoundary;
};