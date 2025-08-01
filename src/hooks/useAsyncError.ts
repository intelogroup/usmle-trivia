import { useState, useCallback } from 'react';
import { ErrorHandler, MedicalAppError } from '../utils/errorHandler';

export function useAsyncError() {
  const [error, setError] = useState<MedicalAppError | null>(null);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context?: string,
    additionalContext?: Record<string, any>
  ) => {
    try {
      setError(null);
      return await asyncFn();
    } catch (err) {
      const medicalError = await ErrorHandler.handleError(err, context, additionalContext);
      setError(medicalError);
      throw medicalError;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, handleAsyncError, clearError };
}