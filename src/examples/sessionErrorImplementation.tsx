/**
 * Session Error Implementation Examples for MedQuiz Pro
 * VCT Framework Compliant - Complete Implementation Examples
 * 
 * This file demonstrates practical implementation patterns for integrating
 * the session error logging system into existing MedQuiz Pro components.
 */

import React, { useEffect, useState } from 'react';
import { 
  SessionErrorBoundary, 
  QuizSessionErrorBoundary 
} from '../components/error/SessionErrorBoundary';
import { 
  useAuthSessionErrorHandling, 
  useQuizSessionErrorHandling,
  useSessionHealthMonitoring 
} from '../hooks/useSessionErrorHandling';
import { useSessionErrorStore, useSessionErrorMonitoring } from '../store/sessionErrorStore';
import { 
  SessionErrorProvider, 
  SessionErrorIntegration,
  apiErrorInterceptor
} from '../utils/sessionErrorIntegration';
import { SessionErrorType } from '../utils/sessionErrorLogger';
import { useAppStore } from '../store';

/**
 * Enhanced App Component with Session Error Handling
 * This shows how to integrate session error handling at the root level
 */
export function EnhancedApp() {
  return (
    <SessionErrorProvider>
      <SessionErrorBoundary 
        sessionType="general"
        maxRetries={3}
        autoRecovery={true}
      >
        <AppRouter />
      </SessionErrorBoundary>
    </SessionErrorProvider>
  );
}

/**
 * Enhanced Authentication Component
 * Demonstrates auth session error handling integration
 */
export function EnhancedLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, addNotification } = useAppStore();
  const { handleLoginError, logAuthError } = useAuthSessionErrorHandling();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Wrap login operation with error handling
      await SessionErrorIntegration.wrapAuthOperation(
        () => login(email, password),
        'user_login',
        { 
          authMethod: 'email',
          failureReason: 'Form submission'
        }
      );
      
      // Success notification handled by store
    } catch (error) {
      await handleLoginError(error, email);
      
      // Show user-friendly error message
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: 'Please check your credentials and try again.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Monitor for session timeout
  useEffect(() => {
    const cleanup = SessionErrorIntegration.setupNetworkMonitoring();
    return cleanup;
  }, []);

  return (
    <SessionErrorBoundary 
      sessionType="authentication"
      maxRetries={1}
      onError={(error) => console.log('Auth component error:', error)}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </SessionErrorBoundary>
  );
}

/**
 * Enhanced Quiz Engine Component
 * Demonstrates quiz session error handling integration
 */
export function EnhancedQuizEngine() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  
  const { currentQuiz, addNotification } = useAppStore();
  const { 
    logQuizError, 
    setupQuizTimeout, 
    setupAutoSave, 
    handleQuizAbandon 
  } = useQuizSessionErrorHandling();

  // Setup quiz session monitoring
  useEffect(() => {
    if (currentQuiz) {
      // Setup quiz timeout monitoring
      setupQuizTimeout(timeRemaining);
      
      // Setup auto-save every 30 seconds
      const cleanupAutoSave = setupAutoSave(30);
      
      // Setup quiz-specific network monitoring
      const cleanupNetwork = SessionErrorIntegration.setupNetworkMonitoring();

      return () => {
        cleanupAutoSave();
        cleanupNetwork();
      };
    }
  }, [currentQuiz, timeRemaining, setupQuizTimeout, setupAutoSave]);

  // Handle quiz abandonment on component unmount
  useEffect(() => {
    return () => {
      if (currentQuiz && currentQuestion < currentQuiz.questions.length) {
        handleQuizAbandon('user_action');
      }
    };
  }, [currentQuiz, currentQuestion, handleQuizAbandon]);

  const handleAnswerSubmit = async (answerIndex: number) => {
    try {
      // Wrap answer submission with error handling
      await SessionErrorIntegration.wrapQuizOperation(
        async () => {
          // Simulate API call to save answer
          const response = await apiErrorInterceptor.wrapFetch(
            '/api/quiz/submit-answer',
            {
              method: 'POST',
              body: JSON.stringify({
                quizId: currentQuiz?.id,
                questionId: currentQuiz?.questions[currentQuestion]?.id,
                answer: answerIndex
              })
            },
            { operation: 'submitAnswer', sessionType: 'quiz' }
          );
          
          if (!response.ok) {
            throw new Error(`Answer submission failed: ${response.status}`);
          }
          
          return response.json();
        },
        'submit_answer',
        {
          quizId: currentQuiz?.id,
          mode: currentQuiz?.config.mode,
          currentQuestion: currentQuestion + 1,
          timeRemaining
        }
      );

      // Update local state
      setAnswers(prev => [...prev, answerIndex]);
      setCurrentQuestion(prev => prev + 1);
      
    } catch (error) {
      await logQuizError(
        error,
        {
          quizId: currentQuiz?.id,
          mode: currentQuiz?.config.mode || 'quick',
          currentQuestion: currentQuestion + 1,
          timeRemaining,
          lastSyncTime: new Date()
        },
        SessionErrorType.QUIZ_SESSION_SYNC_FAILED
      );

      addNotification({
        type: 'warning',
        title: 'Sync Warning',
        message: 'Your answer may not have been saved. We\'ll retry automatically.',
        duration: 4000
      });
    }
  };

  const handleQuizComplete = async () => {
    try {
      await SessionErrorIntegration.wrapQuizOperation(
        async () => {
          // Complete quiz logic
          const response = await apiErrorInterceptor.wrapFetch(
            '/api/quiz/complete',
            {
              method: 'POST',
              body: JSON.stringify({
                quizId: currentQuiz?.id,
                answers
              })
            },
            { operation: 'completeQuiz', sessionType: 'quiz' }
          );
          
          return response.json();
        },
        'complete_quiz',
        {
          quizId: currentQuiz?.id,
          mode: currentQuiz?.config.mode,
          completionPercentage: 100
        }
      );

      addNotification({
        type: 'success',
        title: 'Quiz Completed',
        message: 'Your quiz has been submitted successfully!',
        duration: 5000
      });
      
    } catch (error) {
      await logQuizError(
        error,
        {
          quizId: currentQuiz?.id,
          mode: currentQuiz?.config.mode || 'quick',
          completionPercentage: (answers.length / (currentQuiz?.questions.length || 1)) * 100
        },
        SessionErrorType.QUIZ_SESSION_CORRUPTED
      );
    }
  };

  if (!currentQuiz) {
    return <div>No quiz available</div>;
  }

  const question = currentQuiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion >= currentQuiz.questions.length - 1;

  return (
    <QuizSessionErrorBoundary
      onQuizError={(error) => {
        console.log('Quiz component error:', error);
        addNotification({
          type: 'error',
          title: 'Quiz Error',
          message: 'An error occurred. Your progress has been saved.',
          duration: 6000
        });
      }}
    >
      <div className="quiz-container p-6">
        <div className="quiz-header mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Question {currentQuestion + 1} of {currentQuiz.questions.length}
            </h2>
            <div className="timer text-lg font-semibold">
              Time: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {question && (
          <div className="question-content">
            <div className="question-text mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-lg">{question.question}</p>
            </div>
            
            <div className="options space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSubmit(index)}
                  className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLastQuestion && (
          <div className="quiz-completion mt-6">
            <button
              onClick={handleQuizComplete}
              className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Quiz
            </button>
          </div>
        )}
      </div>
    </QuizSessionErrorBoundary>
  );
}

/**
 * Session Health Dashboard Component
 * Demonstrates session monitoring and analytics
 */
export function SessionHealthDashboard() {
  const { 
    sessionHealth, 
    currentErrors, 
    getAnalytics, 
    exportReport,
    isMonitoring 
  } = useSessionErrorMonitoring();
  
  const { getSessionHealth } = useSessionHealthMonitoring();
  
  const [analytics, setAnalytics] = useState(getAnalytics());
  const [sessionStatus, setSessionStatus] = useState(getSessionHealth());

  // Update analytics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(getAnalytics());
      setSessionStatus(getSessionHealth());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [getAnalytics, getSessionHealth]);

  const handleExportReport = () => {
    const report = exportReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-error-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="session-health-dashboard p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Session Health Dashboard</h2>
      
      {/* Session Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="stat-card p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Session Health</h3>
          <p className={`text-2xl font-bold ${getHealthColor(sessionHealth?.health || 'unknown')}`}>
            {sessionHealth?.health || 'Unknown'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Session ID: {sessionStatus.sessionId.slice(0, 8)}...
          </p>
        </div>
        
        <div className="stat-card p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Errors</h3>
          <p className="text-2xl font-bold text-gray-800">
            {analytics.totalErrors}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Duration: {Math.round(sessionStatus.duration / 1000 / 60)}min
          </p>
        </div>
        
        <div className="stat-card p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Session Stability</h3>
          <p className="text-2xl font-bold text-gray-800">
            {analytics.sessionStability}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Monitoring: {isMonitoring ? '✅ Active' : '❌ Inactive'}
          </p>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="recent-errors mb-6">
        <h3 className="text-lg font-semibold mb-3">Recent Errors</h3>
        {currentErrors.length === 0 ? (
          <p className="text-gray-600 italic">No recent errors - excellent!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentErrors.slice(-5).map((error) => (
              <div key={error.id} className="error-item p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-red-800">{error.type}</span>
                    <p className="text-sm text-red-600 mt-1">{error.message}</p>
                  </div>
                  <div className="text-xs text-red-500">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Analytics */}
      <div className="error-analytics mb-6">
        <h3 className="text-lg font-semibold mb-3">Error Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(analytics.errorsByType).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">{type}</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="actions flex gap-4">
        <button
          onClick={handleExportReport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Export Error Report
        </button>
        
        <button
          onClick={() => {
            const { clearSessionErrors } = useSessionErrorStore.getState();
            clearSessionErrors();
            setAnalytics(getAnalytics());
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Clear Error History
        </button>
      </div>

      {/* Development Tools */}
      {process.env.NODE_ENV === 'development' && (
        <div className="dev-tools mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold mb-2">Development Tools</h4>
          <div className="space-x-2">
            <button
              onClick={() => {
                import('../utils/sessionErrorIntegration').then(({ sessionTestUtils }) => {
                  sessionTestUtils.simulateError(SessionErrorType.AUTH_SESSION_EXPIRED);
                });
              }}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Simulate Auth Error
            </button>
            <button
              onClick={() => {
                import('../utils/sessionErrorIntegration').then(({ sessionTestUtils }) => {
                  sessionTestUtils.simulateError(SessionErrorType.QUIZ_SESSION_SYNC_FAILED);
                });
              }}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Simulate Quiz Error
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * App Router with Session Error Boundaries
 * Demonstrates proper error boundary placement
 */
function AppRouter() {
  const { isAuthenticated, user } = useAppStore();

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <SessionErrorBoundary sessionType="authentication">
          <EnhancedLoginForm />
        </SessionErrorBoundary>
      ) : (
        <SessionErrorBoundary sessionType="authentication">
          <div className="authenticated-app">
            <header className="app-header p-4 bg-blue-600 text-white">
              <h1>MedQuiz Pro - Welcome {user?.name}</h1>
            </header>
            
            <main className="app-main p-6">
              <QuizSessionErrorBoundary>
                <EnhancedQuizEngine />
              </QuizSessionErrorBoundary>
            </main>
            
            <aside className="app-sidebar">
              <SessionHealthDashboard />
            </aside>
          </div>
        </SessionErrorBoundary>
      )}
    </div>
  );
}

export default EnhancedApp;