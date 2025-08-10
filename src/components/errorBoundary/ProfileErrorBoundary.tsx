/**
 * Enhanced Error Boundary for Profile Components
 * Provides graceful error handling with recovery options
 * For MedQuiz Pro - Medical Education Platform
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableReporting?: boolean;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
  retryCount: number;
}

/**
 * Enhanced Error Boundary with comprehensive error handling
 */
export class ProfileErrorBoundary extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableReporting = true } = this.props;
    
    console.error('ProfileErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Report error to monitoring service
    if (enableReporting) {
      this.reportError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  /**
   * Report error to monitoring service
   */
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real application, send to error tracking service like Sentry
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId() // Get current user ID if available
      };

      console.log('Error report:', errorReport);
      
      // Example: Send to monitoring service
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  /**
   * Get current user ID for error reporting
   */
  private getUserId = (): string | null => {
    try {
      // Try to get user ID from various sources
      const userState = (window as any).__MEDQUIZ_USER_STATE__;
      if (userState?.user?.id) return userState.user.id;
      
      const localStorage = window.localStorage.getItem('medquiz-user');
      if (localStorage) {
        const user = JSON.parse(localStorage);
        return user?.id || null;
      }
    } catch (error) {
      // Ignore errors in user ID extraction
    }
    return null;
  };

  /**
   * Attempt to recover from error
   */
  private handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;
    
    if (retryCount >= maxRetries) {
      this.handleReload();
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1
    });

    // Add a small delay to prevent immediate re-error
    const timeout = setTimeout(() => {
      if (this.state.hasError) {
        // If error occurred again, show it
        console.warn('Retry failed, error persists');
      }
    }, 100);
    
    this.retryTimeouts.push(timeout);
  };

  /**
   * Reload the page
   */
  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Navigate to home/dashboard
   */
  private handleNavigateHome = () => {
    window.location.href = '/dashboard';
  };

  /**
   * Toggle error details visibility
   */
  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  /**
   * Get error type classification
   */
  private getErrorType = (): 'network' | 'render' | 'data' | 'unknown' => {
    const { error } = this.state;
    if (!error) return 'unknown';
    
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    
    if (message.includes('render') || stack.includes('render') || message.includes('element')) {
      return 'render';
    }
    
    if (message.includes('undefined') || message.includes('null') || message.includes('property')) {
      return 'data';
    }
    
    return 'unknown';
  };

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage = (): string => {
    const errorType = this.getErrorType();
    
    switch (errorType) {
      case 'network':
        return 'There was a problem connecting to our servers. Please check your internet connection and try again.';
      case 'render':
        return 'There was a problem displaying this page. This might be a temporary issue.';
      case 'data':
        return 'There was a problem loading your profile data. Please try refreshing the page.';
      default:
        return 'Something unexpected happened. Our team has been notified and is working to fix this issue.';
    }
  };

  render() {
    const { children, fallbackComponent, showErrorDetails = false } = this.props;
    const { hasError, error, errorInfo, errorId, showDetails, retryCount } = this.state;

    if (hasError) {
      // Show custom fallback if provided
      if (fallbackComponent) {
        return fallbackComponent;
      }

      const errorType = this.getErrorType();
      const userFriendlyMessage = this.getUserFriendlyMessage();
      const maxRetries = 3;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-600">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                {userFriendlyMessage}
              </p>
              
              {/* Error ID for support */}
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-500">
                  Error ID: <code className="font-mono">{errorId}</code>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Please include this ID when contacting support
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {retryCount < maxRetries ? (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleReload}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleNavigateHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
              
              {/* Error Details (for development/debugging) */}
              {(showErrorDetails || process.env.NODE_ENV === 'development') && error && (
                <div className="border-t pt-4">
                  <Button
                    onClick={this.toggleDetails}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Bug className="w-4 h-4 mr-2" />
                      Technical Details
                    </div>
                    {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  
                  {showDetails && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Error Message:</h4>
                        <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto">
                          {error.message}
                        </pre>
                      </div>
                      
                      {error.stack && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Stack Trace:</h4>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-32">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      
                      {errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Component Stack:</h4>
                          <pre className="text-xs bg-blue-50 p-2 rounded overflow-x-auto max-h-32">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Support Information */}
              <div className="text-center text-sm text-gray-500 border-t pt-4">
                <p>Need help? Contact our support team with the error ID above.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export const withProfileErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) => {
  const WithErrorBoundary: React.FC<P> = (props) => {
    return (
      <ProfileErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ProfileErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `withProfileErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundary;
};

/**
 * Hook for programmatic error boundary interaction
 */
export const useErrorHandler = () => {
  const throwError = React.useCallback((error: Error) => {
    throw error;
  }, []);

  const handleAsyncError = React.useCallback((error: Error) => {
    // For async errors that don't get caught by error boundaries
    console.error('Async error handled:', error);
    
    // You could dispatch to a global error handler here
    // or show a toast notification
    
    return error;
  }, []);

  return {
    throwError,
    handleAsyncError
  };
};

export default ProfileErrorBoundary;