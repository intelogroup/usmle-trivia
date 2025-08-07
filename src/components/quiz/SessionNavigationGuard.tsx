/**
 * SessionNavigationGuard - Protects against accidental session abandonment
 */

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertTriangle, ArrowLeft, XCircle } from 'lucide-react';
import { useSessionProtection, useQuizSession } from '../../hooks/useQuizSession';

interface AbandonConfirmationDialogProps {
  isOpen: boolean;
  attemptedPath: string | null;
  onConfirm: () => string | null;
  onCancel: () => void;
}

const AbandonConfirmationDialog: React.FC<AbandonConfirmationDialogProps> = ({
  isOpen,
  attemptedPath,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    const confirmedPath = onConfirm();
    if (confirmedPath) {
      // Navigate to the attempted path after abandoning session
      window.location.href = confirmedPath;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Abandon Quiz Session?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              You have an active quiz session in progress. Leaving this page will abandon your current progress.
            </p>
            {attemptedPath && (
              <p className="text-xs text-gray-500">
                Attempting to navigate to: <code className="bg-gray-100 px-1 rounded">{attemptedPath}</code>
              </p>
            )}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <p className="font-medium">Your progress will be lost:</p>
                <ul className="mt-1 space-y-0.5">
                  <li>• Current answers and time spent</li>
                  <li>• Question navigation history</li>
                  <li>• Session scoring data</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Quiz
            </Button>
            <Button
              onClick={handleConfirm}
              variant="destructive"
              className="flex-1 text-sm"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Abandon & Leave
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Main navigation guard component
 */
export const SessionNavigationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasActiveSession } = useQuizSession();
  const {
    showAbandonWarning,
    attemptedNavigation,
    requestNavigation,
    confirmAbandon,
    cancelAbandon,
  } = useSessionProtection();

  // Handle programmatic navigation with session protection
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasActiveSession) {
        event.preventDefault();
        event.returnValue = 'You have an active quiz session. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasActiveSession]);

  // Custom navigation handler for programmatic navigation
  const handleProgrammaticNavigation = (path: string) => {
    if (requestNavigation(path)) {
      navigate(path);
    }
  };

  // Provide navigation context to children
  return (
    <>
      {children}
      <AbandonConfirmationDialog
        isOpen={showAbandonWarning}
        attemptedPath={attemptedNavigation}
        onConfirm={confirmAbandon}
        onCancel={cancelAbandon}
      />
    </>
  );
};

// This hook is exported separately below

/**
 * Component to show session status in the UI
 */
export const SessionStatusIndicator: React.FC = () => {
  const { session, hasActiveSession } = useQuizSession();

  if (!hasActiveSession || !session) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 bg-green-100 border border-green-300 rounded-lg px-3 py-2 shadow-md">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs font-medium text-green-700">
          {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)} Quiz Active
        </span>
        <span className="text-xs text-green-600">
          Q{session.currentQuestionIndex + 1}/{session.questions.length}
        </span>
      </div>
    </div>
  );
};