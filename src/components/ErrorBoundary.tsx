import React from 'react';
import { ErrorHandler, MedicalAppError } from '../utils/errorHandler';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: MedicalAppError;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class MedicalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const medicalError = await ErrorHandler.handleError(
      error,
      'React Error Boundary',
      { errorInfo }
    );
    this.setState({ error: medicalError });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Oops! Something went wrong
                </h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                {this.state.error?.userMessage || 'An unexpected error occurred. Please refresh the page and try again.'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}