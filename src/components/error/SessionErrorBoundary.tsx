/**
 * Session Error Boundary for MedQuiz Pro
 * VCT Framework Compliant - React Error Boundary with Session Context
 * 
 * Provides comprehensive error boundary coverage with session-aware
 * error handling and recovery mechanisms for medical applications.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  sessionErrorLogger, 
  SessionErrorType, 
  type AuthSessionContext 
} from '../../utils/sessionErrorLogger';

// Error boundary state interface
interface SessionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount: number;
  showDetails: boolean;
  isRecovering: boolean;
}

// Props interface with session context
interface SessionErrorBoundaryProps {
  children: ReactNode;
  sessionType: 'authentication' | 'quiz' | 'general';
  fallbackComponent?: React.ComponentType<SessionErrorFallbackProps>;
  maxRetries?: number;
  autoRecovery?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: Record<string, unknown>;
}

// Props for fallback component
export interface SessionErrorFallbackProps {
  error: Error;
  errorId: string;
  retryCount: number;
  onRetry: () => void;
  onShowDetails: () => void;
  showDetails: boolean;
  sessionType: 'authentication' | 'quiz' | 'general';
  canRetry: boolean;
  isRecovering: boolean;
}

/**
 * Session-aware Error Boundary Component
 * Provides medical application specific error handling with HIPAA compliance
 */
export class SessionErrorBoundary extends Component<
  SessionErrorBoundaryProps,
  SessionErrorBoundaryState
> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: SessionErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      retryCount: 0,
      showDetails: false,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SessionErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { sessionType, context, onError } = this.props;
    const { errorId } = this.state;

    // Log error with session context
    await this.logSessionError(error, errorInfo, sessionType, context);

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Attempt automatic recovery if enabled
    if (this.props.autoRecovery !== false) {
      this.attemptAutoRecovery();
    }

    // In development, log additional details
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔥 Session Error Boundary [${errorId}]`);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Session Type:', sessionType);
      console.error('Context:', context);
      console.groupEnd();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * Log session error with appropriate context
   */
  private async logSessionError(
    error: Error,
    errorInfo: ErrorInfo,
    sessionType: 'authentication' | 'quiz' | 'general',
    context?: Record<string, unknown>
  ): Promise<void> {
    try {
      const sessionContext: Partial<AuthSessionContext> = {
        sessionType: 'authentication', // Map to logger type
        authMethod: 'email',
        failureReason: `React Error Boundary: ${error.message}`,
        ...context
      };

      const sessionErrorType = this.mapToSessionErrorType(sessionType, error);
      
      await sessionErrorLogger.logAuthError(
        error,
        sessionContext,
        sessionErrorType
      );
    } catch (loggingError) {
      console.error('Failed to log session error:', loggingError);
    }
  }

  /**
   * Map component session type to session error type
   */
  private mapToSessionErrorType(
    sessionType: 'authentication' | 'quiz' | 'general',
    error: Error
  ): SessionErrorType {
    // Check if error is network related
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return SessionErrorType.SESSION_STORAGE_FAILED;
    }

    // Map based on session type
    switch (sessionType) {
      case 'authentication':
        return SessionErrorType.SESSION_DISPLAY_ERROR;
      case 'quiz':
        return SessionErrorType.QUIZ_SESSION_CORRUPTED;
      default:
        return SessionErrorType.SESSION_DISPLAY_ERROR;
    }
  }

  /**
   * Attempt automatic recovery
   */
  private attemptAutoRecovery = (): void => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({ isRecovering: true });
      
      // Delay recovery attempt to prevent immediate re-error
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, 2000 + (retryCount * 1000)); // Progressive delay
    }
  };

  /**
   * Handle manual retry
   */
  private handleRetry = (): void => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorId: undefined,
        retryCount: prevState.retryCount + 1,
        showDetails: false,
        isRecovering: false
      }));
    }
  };

  /**
   * Toggle error details display
   */
  private handleShowDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    const { children, fallbackComponent: FallbackComponent, sessionType, maxRetries = 3 } = this.props;
    const { hasError, error, errorId, retryCount, showDetails, isRecovering } = this.state;

    if (hasError && error && errorId) {
      const canRetry = retryCount < maxRetries;

      // Use custom fallback component if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorId={errorId}
            retryCount={retryCount}
            onRetry={this.handleRetry}
            onShowDetails={this.handleShowDetails}
            showDetails={showDetails}
            sessionType={sessionType}
            canRetry={canRetry}
            isRecovering={isRecovering}
          />
        );
      }

      // Default fallback UI with medical theme
      return (
        <DefaultSessionErrorFallback
          error={error}
          errorId={errorId}
          retryCount={retryCount}
          onRetry={this.handleRetry}
          onShowDetails={this.handleShowDetails}
          showDetails={showDetails}
          sessionType={sessionType}
          canRetry={canRetry}
          isRecovering={isRecovering}
        />
      );
    }

    return children;
  }
}

/**
 * Default Session Error Fallback Component
 * Medical-themed error display with recovery options
 */
const DefaultSessionErrorFallback: React.FC<SessionErrorFallbackProps> = ({
  error,
  errorId,
  retryCount,
  onRetry,
  onShowDetails,
  showDetails,
  sessionType,
  canRetry,
  isRecovering
}) => {
  const getSessionIcon = () => {
    switch (sessionType) {
      case 'authentication':
        return '🔐';
      case 'quiz':
        return '📝';
      default:
        return '⚡';
    }
  };

  const getSessionTitle = () => {
    switch (sessionType) {
      case 'authentication':
        return 'Authentication Error';
      case 'quiz':
        return 'Quiz Session Error';
      default:
        return 'Application Error';
    }
  };

  const getSessionMessage = () => {
    switch (sessionType) {
      case 'authentication':
        return 'There was an issue with your login session. We\'re working to restore your access.';
      case 'quiz':
        return 'Your quiz session encountered an error. Don\'t worry - your progress has been saved.';
      default:
        return 'The application encountered an unexpected error. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Error Icon and Title */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{getSessionIcon()}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getSessionTitle()}
          </h1>
          <p className="text-gray-600">
            {getSessionMessage()}
          </p>
        </div>

        {/* Error ID for Support */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <div className="text-xs text-gray-500 mb-1">Error ID for Support:</div>
          <div className="font-mono text-sm text-gray-800 break-all">
            {errorId}
          </div>
        </div>

        {/* Retry Section */}
        {canRetry && (
          <div className="mb-6">
            <button
              onClick={onRetry}
              disabled={isRecovering}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRecovering ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recovering...
                </div>
              ) : (
                `Try Again ${retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}`
              )}
            </button>
            
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Previous attempts: {retryCount}
              </p>
            )}
          </div>
        )}

        {/* Technical Details Toggle */}
        <div className="mb-4">
          <button
            onClick={onShowDetails}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </button>
        </div>

        {/* Technical Details */}
        {showDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <div className="mb-2">
                <span className="font-semibold">Error Type:</span> {error.name}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Message:</span> {error.message}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Session Type:</span> {sessionType}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Timestamp:</span>{' '}
                {new Date().toLocaleString()}
              </div>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2">
                  <span className="font-semibold">Stack Trace:</span>
                  <pre className="text-xs mt-1 overflow-auto max-h-32 bg-gray-100 p-2 rounded">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? Contact our support team:
          </p>
          <div className="text-sm text-blue-600">
            <div>📧 support@medquizpro.com</div>
            <div className="mt-1">Include Error ID: {errorId}</div>
          </div>
        </div>

        {/* Medical App Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            🏥 This is a medical education application. 
            No patient data is stored or transmitted.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Specialized Error Boundary for Quiz Sessions
 */
export const QuizSessionErrorBoundary: React.FC<{
  children: ReactNode;
  onQuizError?: (error: Error) => void;
}> = ({ children, onQuizError }) => {
  return (
    <SessionErrorBoundary
      sessionType="quiz"
      maxRetries={2}
      autoRecovery={true}
      onError={onQuizError}
      context={{ quizSession: true }}
    >
      {children}
    </SessionErrorBoundary>
  );
};

/**
 * Specialized Error Boundary for Authentication
 */
export const AuthSessionErrorBoundary: React.FC<{
  children: ReactNode;
  onAuthError?: (error: Error) => void;
}> = ({ children, onAuthError }) => {
  return (
    <SessionErrorBoundary
      sessionType="authentication"
      maxRetries={1}
      autoRecovery={false}
      onError={onAuthError}
      context={{ authSession: true }}
    >
      {children}
    </SessionErrorBoundary>
  );
};

export default SessionErrorBoundary;