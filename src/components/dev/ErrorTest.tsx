import React, { useState } from 'react';

interface ErrorTestProps {
  shouldError?: boolean;
}

/**
 * Development component to test error boundary functionality
 * Only visible in development mode
 */
export const ErrorTest: React.FC<ErrorTestProps> = ({ shouldError = false }) => {
  const [triggerError, setTriggerError] = useState(shouldError);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  if (triggerError) {
    throw new Error('This is a test error to verify error boundaries are working correctly');
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Dev Mode:</span>
        <button
          onClick={() => setTriggerError(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
        >
          Test Error Boundary
        </button>
      </div>
    </div>
  );
};