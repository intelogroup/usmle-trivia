import React, { Component, ReactNode } from 'react';
import { errorBoundaryService, type ErrorBoundaryConfig, type ErrorInfo } from '../../services/errorBoundaryService';

interface ErrorBoundaryProps {
  boundaryId: string;
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'app' | 'page' | 'component' | 'widget';
  autoRecover?: boolean;
  maxRecoveryAttempts?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  recoveryAttempts: number;
  isRecovering: boolean;
}

export interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetErrorBoundary?: () => void;
  recoveryAttempts?: number;
  isRecovering?: boolean;
  boundaryId?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private config: ErrorBoundaryConfig | null = null;
  private recoveryTimer: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      recoveryAttempts: 0,
      isRecovering: false
    };

    // Get or create boundary configuration
    this.config = errorBoundaryService.getBoundaryConfig(props.boundaryId);
    
    if (!this.config) {
      // Create default configuration if not exists
      const defaultConfig: ErrorBoundaryConfig = {
        id: props.boundaryId,
        level: props.level || 'component',
        autoRecover: props.autoRecover ?? true,
        maxRecoveryAttempts: props.maxRecoveryAttempts ?? 2,
        recoveryStrategies: [
          {
            type: 'retry',
            maxAttempts: 2,
            delay: 1000
          },
          {
            type: 'fallback',
            maxAttempts: 1,
            delay: 0
          }
        ],
        logErrors: true,
        showErrorDetails: process.env.NODE_ENV === 'development',
        fallbackComponent: DefaultErrorFallback,
        medicalContentProtection: props.boundaryId.includes('medical') || props.boundaryId.includes('quiz')
      };
      
      errorBoundaryService.registerBoundaryConfig(defaultConfig);
      this.config = defaultConfig;
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (!this.config) return;

    // Log error to service
    const errorId = errorBoundaryService.logError(
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.boundaryId
      },
      {
        page: window.location.pathname,
        userAction: 'component-render',
        medicalContent: this.extractMedicalContext(),
        systemState: {
          memoryUsage: this.getCurrentMemoryUsage(),
          networkStatus: this.getNetworkStatus(),
          timeOfDay: new Date().toLocaleTimeString()
        }
      },
      this.determineErrorSeverity(error),
      this.determineErrorCategory(error)
    );

    this.setState({
      errorInfo,
      errorId,
      recoveryAttempts: 0
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Attempt auto-recovery if enabled
    if (this.config.autoRecover && this.state.recoveryAttempts < this.config.maxRecoveryAttempts) {
      this.attemptRecovery();
    }
  }

  componentWillUnmount(): void {
    if (this.recoveryTimer) {
      clearTimeout(this.recoveryTimer);
    }
  }

  private extractMedicalContext(): any {
    // Try to extract medical context from props or DOM
    const urlParams = new URLSearchParams(window.location.search);
    return {
      questionId: urlParams.get('question'),
      quizMode: urlParams.get('mode'),
      category: urlParams.get('category')
    };
  }

  private getCurrentMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  private getNetworkStatus(): string {
    return (navigator as any).connection?.effectiveType || 'unknown';
  }

  private determineErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'medium';
    }
    
    if (errorMessage.includes('memory') || errorMessage.includes('security')) {
      return 'critical';
    }
    
    if (errorMessage.includes('medical') || errorMessage.includes('patient')) {
      return 'high';
    }
    
    return 'medium';
  }

  private determineErrorCategory(error: Error): 'ui' | 'data' | 'network' | 'security' | 'medical-content' {
    const errorMessage = error.message.toLowerCase();
    const stackTrace = error.stack?.toLowerCase() || '';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('xhr')) {
      return 'network';
    }
    
    if (errorMessage.includes('security') || errorMessage.includes('permission')) {
      return 'security';
    }
    
    if (errorMessage.includes('medical') || errorMessage.includes('quiz') || errorMessage.includes('question')) {
      return 'medical-content';
    }
    
    if (stackTrace.includes('data') || errorMessage.includes('parse') || errorMessage.includes('json')) {
      return 'data';
    }
    
    return 'ui';
  }

  private async attemptRecovery(): Promise<void> {
    if (!this.config || !this.state.errorId) return;

    this.setState({ isRecovering: true });

    // Try each recovery strategy
    for (const strategy of this.config.recoveryStrategies) {
      const success = await errorBoundaryService.attemptRecovery(
        this.state.errorId,
        this.props.boundaryId,
        strategy
      );

      if (success) {
        if (strategy.type === 'retry') {
          // Clear error state to retry rendering
          this.resetErrorBoundary();
          return;
        } else if (strategy.type === 'fallback') {
          // Let fallback component render
          this.setState({ isRecovering: false });
          return;
        }
      }
    }

    // All recovery strategies failed
    this.setState({ 
      isRecovering: false,
      recoveryAttempts: this.state.recoveryAttempts + 1
    });
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      recoveryAttempts: this.state.recoveryAttempts + 1,
      isRecovering: false
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || this.config?.fallbackComponent || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error || undefined}
          errorInfo={this.state.errorInfo || undefined}
          resetErrorBoundary={this.resetErrorBoundary}
          recoveryAttempts={this.state.recoveryAttempts}
          isRecovering={this.state.isRecovering}
          boundaryId={this.props.boundaryId}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  recoveryAttempts = 0,
  isRecovering = false,
  boundaryId
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4 max-w-2xl mx-auto">
      <div className="flex items-start">
        <div className="text-red-600 mr-4 mt-1">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Something went wrong
          </h3>
          
          <p className="text-red-700 mb-4">
            {boundaryId?.includes('medical') || boundaryId?.includes('quiz') 
              ? 'There was an issue loading the medical content. Your progress has been saved.' 
              : 'An unexpected error occurred. Please try again.'
            }
          </p>

          {recoveryAttempts > 0 && (
            <p className="text-sm text-red-600 mb-4">
              Recovery attempts: {recoveryAttempts}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={resetErrorBoundary}
              disabled={isRecovering}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isRecovering && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isRecovering ? 'Recovering...' : 'Try Again'}
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Return to Dashboard
            </button>
          </div>

          {isDevelopment && error && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-red-600 font-medium mb-2">
                Developer Information
              </summary>
              <div className="bg-red-100 p-4 rounded border text-sm">
                <div className="mb-2">
                  <strong>Error:</strong> {error.name}: {error.message}
                </div>
                <div className="mb-2">
                  <strong>Boundary:</strong> {boundaryId}
                </div>
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized error boundaries for different contexts
export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    boundaryId="app"
    level="app"
    autoRecover={true}
    maxRecoveryAttempts={3}
  >
    {children}
  </ErrorBoundary>
);

export const QuizErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    boundaryId="quiz"
    level="page"
    autoRecover={true}
    maxRecoveryAttempts={2}
  >
    {children}
  </ErrorBoundary>
);

export const MedicalContentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    boundaryId="medical-content"
    level="component"
    autoRecover={true}
    maxRecoveryAttempts={1}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  componentName: string;
}> = ({ children, componentName }) => (
  <ErrorBoundary
    boundaryId={`component-${componentName}`}
    level="widget"
    autoRecover={false}
    maxRecoveryAttempts={1}
  >
    {children}
  </ErrorBoundary>
);