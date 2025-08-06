import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MedicalErrorBoundary } from '../../src/components/ErrorBoundary';
import React from 'react';
import '@testing-library/jest-dom';

// Component that throws an error when prop is true
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>No error - component rendered successfully</div>;
};

// Component with button that triggers error
const ErrorTriggerComponent = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setShouldThrow(true)}
        data-testid="error-trigger-button"
      >
        Trigger Error
      </button>
      <ErrorThrowingComponent shouldThrow={shouldThrow} />
    </div>
  );
};

describe('MedicalErrorBoundary', () => {
  let consoleSpy: any;

  beforeEach(() => {
    // Suppress console.error during tests
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should render children when there is no error', () => {
    render(
      <MedicalErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </MedicalErrorBoundary>
    );

    expect(screen.getByText('No error - component rendered successfully')).toBeInTheDocument();
  });

  it('should render error UI when child component throws error', () => {
    render(
      <MedicalErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </MedicalErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh Page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Home' })).toBeInTheDocument();
  });

  it('should handle user-triggered errors', async () => {
    const user = userEvent.setup();

    render(
      <MedicalErrorBoundary>
        <ErrorTriggerComponent />
      </MedicalErrorBoundary>
    );

    // Initially should show no error
    expect(screen.getByText('No error - component rendered successfully')).toBeInTheDocument();

    // Click button to trigger error
    await user.click(screen.getByTestId('error-trigger-button'));

    // Should now show error boundary UI
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('should provide refresh and home navigation options', () => {
    render(
      <MedicalErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </MedicalErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: 'Refresh Page' });
    const homeButton = screen.getByRole('button', { name: 'Go Home' });

    expect(refreshButton).toBeInTheDocument();
    expect(homeButton).toBeInTheDocument();

    // Test that buttons have correct attributes
    expect(refreshButton).toHaveClass('bg-blue-600');
    expect(homeButton).toHaveClass('bg-gray-200');
  });

  it('should display medical-themed error icon', () => {
    render(
      <MedicalErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </MedicalErrorBoundary>
    );

    const errorIcon = screen.getByRole('img', { hidden: true });
    expect(errorIcon).toHaveClass('text-red-400');
  });

  it('should have proper styling for medical app theme', () => {
    render(
      <MedicalErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </MedicalErrorBoundary>
    );

    const container = screen.getByText('Oops! Something went wrong').closest('div');
    expect(container?.parentElement).toHaveClass('bg-white');
    expect(container?.parentElement).toHaveClass('shadow-lg');
    expect(container?.parentElement).toHaveClass('rounded-lg');
  });
});

describe('Error Boundary Integration', () => {
  it('should handle nested error boundaries correctly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MedicalErrorBoundary>
        <div>
          <h1>Outer Content</h1>
          <MedicalErrorBoundary>
            <ErrorThrowingComponent shouldThrow={true} />
          </MedicalErrorBoundary>
        </div>
      </MedicalErrorBoundary>
    );

    // Inner error boundary should catch the error
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    // Outer content should still be visible
    expect(screen.getByText('Outer Content')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});