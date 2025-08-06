/**
 * Quiz Error Boundary for MedQuiz Pro
 * Enhanced error boundary specifically for quiz components with comprehensive
 * error logging, recovery mechanisms, and user-friendly fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  BookOpen, 
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { sessionErrorLogger, SessionErrorType } from '../../utils/sessionErrorLogger';
import { useSessionErrorStore } from '../../store/sessionErrorStore';
import { ErrorHandler, ErrorSeverity } from '../../utils/errorHandler';

interface QuizErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount: number;
  isRecovering: boolean;
  recoveryAttempted: boolean;
  recoverySuccessful?: boolean;
  errorDetails?: {
    quizMode?: string;
    currentQuestion?: number;
    questionCount?: number;
    timestamp: Date;
    userAgent: string;
    url: string;
  };
}

interface QuizErrorBoundaryProps {
  children: ReactNode;
  quizMode?: 'quick' | 'timed' | 'custom';
  currentQuestion?: number;
  questionCount?: number;
  onReset?: () => void;
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class QuizErrorBoundary extends Component<QuizErrorBoundaryProps, QuizErrorBoundaryState> {
  private retryTimeoutId?: NodeJS.Timeout;
  private maxRetries = 3;

  constructor(props: QuizErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRecovering: false,
      recoveryAttempted: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<QuizErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      errorId: `quiz_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { quizMode, currentQuestion, questionCount } = this.props;
    
    // Create detailed error context
    const errorDetails = {
      quizMode: quizMode || 'unknown',
      currentQuestion: currentQuestion || 0,
      questionCount: questionCount || 0,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'QuizErrorBoundary'
    };

    this.setState({ errorDetails });

    try {
      // Log to session error logger with quiz context
      await sessionErrorLogger.logQuizError(
        error,
        {
          mode: quizMode || 'quick',
          currentQuestion: currentQuestion || 0,
          questionCount: questionCount || 0,
          lastSyncTime: new Date(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            touchSupport: 'ontouchstart' in window,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
          }
        },
        this.determineErrorType(error)
      );

      // Record in session error store
      const errorStore = useSessionErrorStore.getState();
      errorStore.recordSessionError({
        id: this.state.errorId || `quiz_error_${Date.now()}`,
        type: this.determineErrorType(error),
        severity: this.determineErrorSeverity(error),
        message: error.message,
        timestamp: new Date(),
        sessionType: 'quiz',
        recovered: false,
        userImpact: this.assessUserImpact(error, currentQuestion, questionCount)
      });

      // Log to ErrorHandler for centralized processing
      await ErrorHandler.handleError(
        error,
        'Quiz Component Error',
        {
          quizContext: errorDetails,
          errorInfo,
          boundary: 'QuizErrorBoundary'
        }
      );

    } catch (loggingError) {
      console.error('Failed to log quiz error:', loggingError);
    }

    // Attempt automatic recovery for certain error types
    if (this.canAttemptRecovery(error)) {
      this.attemptRecovery();
    }
  }

  private determineErrorType(error: Error): SessionErrorType {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return SessionErrorType.QUIZ_SESSION_SYNC_FAILED;
    }
    
    if (errorMessage.includes('timeout')) {
      return SessionErrorType.QUIZ_SESSION_TIMEOUT;
    }
    
    if (errorMessage.includes('session') || errorStack.includes('session')) {
      return SessionErrorType.QUIZ_SESSION_CORRUPTED;
    }
    
    if (errorMessage.includes('storage') || errorMessage.includes('quota')) {
      return SessionErrorType.SESSION_STORAGE_FAILED;
    }

    // Default to display error for UI-related issues
    return SessionErrorType.SESSION_DISPLAY_ERROR;
  }

  private determineErrorSeverity(error: Error): ErrorSeverity {
    const { currentQuestion, questionCount } = this.props;
    const completionPercentage = currentQuestion && questionCount 
      ? (currentQuestion / questionCount) * 100 
      : 0;

    // Critical if user has made significant progress
    if (completionPercentage > 75) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity for certain error types
    if (error.message.includes('network') || error.message.includes('session')) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity for mid-quiz errors
    if (completionPercentage > 25) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  private assessUserImpact(
    error: Error, 
    currentQuestion?: number, 
    questionCount?: number
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    const completionPercentage = currentQuestion && questionCount 
      ? (currentQuestion / questionCount) * 100 
      : 0;

    if (completionPercentage > 80) return 'critical';
    if (completionPercentage > 50) return 'high';
    if (completionPercentage > 20) return 'medium';
    if (currentQuestion && currentQuestion > 0) return 'low';
    return 'none';
  }

  private canAttemptRecovery(error: Error): boolean {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) return false;
    
    // Don't retry for certain critical errors
    const criticalErrors = ['ChunkLoadError', 'SecurityError', 'QuotaExceededError'];
    if (criticalErrors.some(criticalError => error.name === criticalError)) {
      return false;
    }

    return true;
  }

  private attemptRecovery = async () => {
    if (this.state.isRecovering) return;

    this.setState({ isRecovering: true, recoveryAttempted: true });

    try {
      // Clear potential corrupted state
      sessionStorage.removeItem('quiz_temp_data');
      sessionStorage.removeItem('quiz_current_state');
      
      // Attempt to recover using session error store
      const errorStore = useSessionErrorStore.getState();
      const errorType = this.determineErrorType(this.state.error!);
      const recovered = await errorStore.attemptErrorRecovery(errorType);
      
      if (recovered) {
        // Wait a moment then retry
        this.retryTimeoutId = setTimeout(() => {
          this.setState({
            hasError: false,
            error: undefined,
            errorId: undefined,
            isRecovering: false,
            recoverySuccessful: true,
            retryCount: this.state.retryCount + 1
          });
        }, 1500);
      } else {
        this.setState({ 
          isRecovering: false, 
          recoverySuccessful: false 
        });
      }
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      this.setState({ 
        isRecovering: false, 
        recoverySuccessful: false 
      });
    }
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      // Max retries reached, force full page reload
      window.location.reload();
      return;
    }

    // Clear error state and increment retry count
    this.setState({
      hasError: false,
      error: undefined,
      errorId: undefined,
      retryCount: retryCount + 1,
      isRecovering: false,
      recoveryAttempted: false,
      recoverySuccessful: undefined
    });

    // Call parent reset function if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleGoHome = () => {
    // Log navigation away from error
    if (this.state.error) {
      sessionErrorLogger.logQuizError(
        new Error('User navigated away from quiz error'),
        {
          mode: this.props.quizMode || 'quick',
          currentQuestion: this.props.currentQuestion || 0,
          lastSyncTime: new Date()
        },
        SessionErrorType.QUIZ_SESSION_ABANDONED
      );
    }
    
    window.location.href = '/';
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Use custom fallback if provided
    if (this.props.fallbackComponent) {
      const FallbackComponent = this.props.fallbackComponent;
      return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
    }

    const { error, errorDetails, retryCount, isRecovering, recoverySuccessful } = this.state;
    const canRetry = retryCount < this.maxRetries;
    const completionPercentage = errorDetails?.currentQuestion && errorDetails?.questionCount 
      ? Math.round((errorDetails.currentQuestion / errorDetails.questionCount) * 100)
      : 0;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              {isRecovering ? (
                <div className="relative">
                  <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              ) : recoverySuccessful === true ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : recoverySuccessful === false ? (
                <XCircle className="h-16 w-16 text-red-500" />
              ) : (
                <AlertTriangle className="h-16 w-16 text-amber-500" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Quiz Interrupted
            </h1>
            
            {isRecovering ? (
              <p className="text-lg text-blue-600 font-medium">
                Attempting to recover your quiz session...
              </p>
            ) : recoverySuccessful === true ? (
              <p className="text-lg text-green-600 font-medium">
                Recovery successful! Click retry to continue.
              </p>
            ) : (
              <p className="text-lg text-gray-600">
                We encountered an issue with your quiz session
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Information */}
            {errorDetails && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Quiz Progress</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Mode:</span>
                    <span className="ml-2 font-medium capitalize">{errorDetails.quizMode}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Progress:</span>
                    <span className="ml-2 font-medium">{completionPercentage}% Complete</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Question:</span>
                    <span className="ml-2 font-medium">
                      {errorDetails.currentQuestion} of {errorDetails.questionCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Time:</span>
                    <span className="ml-2 font-medium">
                      {errorDetails.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">What happened?</h3>
              <p className="text-red-700 text-sm mb-2">
                {this.getHumanReadableError(error?.message || 'Unknown error')}
              </p>
              {import.meta.env.DEV && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    Technical Details
                  </summary>
                  <pre className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded overflow-auto">
                    {error?.stack || error?.message}
                  </pre>
                </details>
              )}
            </div>

            {/* Recovery Status */}
            {this.state.recoveryAttempted && (
              <div className={`border rounded-lg p-4 ${
                recoverySuccessful === true 
                  ? 'bg-green-50 border-green-200'
                  : recoverySuccessful === false
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  recoverySuccessful === true 
                    ? 'text-green-900'
                    : recoverySuccessful === false
                      ? 'text-red-900'
                      : 'text-yellow-900'
                }`}>
                  Recovery Status
                </h3>
                <p className={`text-sm ${
                  recoverySuccessful === true 
                    ? 'text-green-700'
                    : recoverySuccessful === false
                      ? 'text-red-700'
                      : 'text-yellow-700'
                }`}>
                  {recoverySuccessful === true 
                    ? 'Your quiz session has been successfully recovered!'
                    : recoverySuccessful === false
                      ? 'Automatic recovery failed. Manual retry available.'
                      : 'Recovery in progress...'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={this.handleRetry}
                disabled={isRecovering || (!canRetry && retryCount > 0)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isRecovering ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Recovering...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {retryCount >= this.maxRetries ? 'Reload Page' : 'Try Again'}
                  </>
                )}
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-500 pt-2">
              <p>
                If this problem persists, try refreshing your browser or contact support.
                {errorDetails?.errorId && (
                  <span className="block mt-1 font-mono text-xs">
                    Error ID: {errorDetails.errorId}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  private getHumanReadableError(errorMessage: string): string {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (message.includes('timeout')) {
      return 'The request took too long to complete. This might be due to a slow connection.';
    }
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'Failed to load quiz content. This might be a temporary issue.';
    }
    
    if (message.includes('session')) {
      return 'Your quiz session encountered an issue. Your progress may have been saved.';
    }
    
    if (message.includes('storage') || message.includes('quota')) {
      return 'Browser storage is full or unavailable. Try clearing your browser data.';
    }
    
    return 'An unexpected error occurred during your quiz session.';
  }
}

// Convenience wrapper component for easier usage
export const withQuizErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<QuizErrorBoundaryProps, 'children'>
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <QuizErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </QuizErrorBoundary>
  ));
};