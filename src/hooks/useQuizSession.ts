/**
 * React hooks for QuizSessionManager integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  quizSessionManager, 
  type QuizSessionData, 
  // type QuizSessionState, // Available but not used in current implementation
  type QuizMode,
  type SessionEventData,
  type SessionEventHandler
} from '../services/QuizSessionManager';

/**
 * Main hook for managing quiz sessions
 */
export function useQuizSession() {
  const [session, setSession] = useState<QuizSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update session state when manager changes
  useEffect(() => {
    const updateSession = () => {
      setSession(quizSessionManager.getCurrentSession());
    };

    // Set up event listeners
    const eventHandlers: Array<[string, SessionEventHandler]> = [
      ['session_created', updateSession],
      ['session_started', updateSession],
      ['session_completed', updateSession],
      ['session_abandoned', updateSession],
      ['session_recovered', updateSession],
      ['question_changed', updateSession],
      ['answer_submitted', updateSession],
    ];

    eventHandlers.forEach(([event, handler]) => {
      quizSessionManager.addEventListener(event, handler);
    });

    // Initial session load
    updateSession();

    return () => {
      eventHandlers.forEach(([event, handler]) => {
        quizSessionManager.removeEventListener(event, handler);
      });
    };
  }, []);

  const createSession = useCallback(async (
    userId: string,
    mode: QuizMode,
    questionIds: string[],
    config?: { timeLimit?: number }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sessionId = await quizSessionManager.createSession(userId, mode, questionIds, config);
      return sessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await quizSessionManager.startSession();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const navigateToQuestion = useCallback((questionIndex: number) => {
    return quizSessionManager.navigateToQuestion(questionIndex);
  }, []);

  const submitAnswer = useCallback((answerIndex: number) => {
    return quizSessionManager.submitAnswer(answerIndex);
  }, []);

  const completeSession = useCallback(async (finalScore?: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await quizSessionManager.completeSession(finalScore);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete session';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const abandonSession = useCallback(async (reason?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await quizSessionManager.abandonSession(reason);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to abandon session';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    session,
    isLoading,
    error,
    hasActiveSession: quizSessionManager.hasActiveSession(),
    canNavigateNext: quizSessionManager.canNavigateNext(),
    canNavigatePrevious: quizSessionManager.canNavigatePrevious(),
    createSession,
    startSession,
    navigateToQuestion,
    submitAnswer,
    completeSession,
    abandonSession,
  };
}

/**
 * Hook for session navigation controls
 */
export function useQuizNavigation() {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [canGoNext, setCanGoNext] = useState(false);
  const [canGoPrevious, setCanGoPrevious] = useState(false);

  useEffect(() => {
    const updateNavigation = () => {
      setCurrentIndex(quizSessionManager.getCurrentQuestionIndex());
      setCanGoNext(quizSessionManager.canNavigateNext());
      setCanGoPrevious(quizSessionManager.canNavigatePrevious());
    };

    const eventHandlers: Array<[string, SessionEventHandler]> = [
      ['session_started', updateNavigation],
      ['question_changed', updateNavigation],
      ['session_completed', updateNavigation],
      ['session_abandoned', updateNavigation],
    ];

    eventHandlers.forEach(([event, handler]) => {
      quizSessionManager.addEventListener(event, handler);
    });

    updateNavigation();

    return () => {
      eventHandlers.forEach(([event, handler]) => {
        quizSessionManager.removeEventListener(event, handler);
      });
    };
  }, []);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      return quizSessionManager.navigateToQuestion(currentIndex + 1);
    }
    return false;
  }, [currentIndex, canGoNext]);

  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      return quizSessionManager.navigateToQuestion(currentIndex - 1);
    }
    return false;
  }, [currentIndex, canGoPrevious]);

  const goToQuestion = useCallback((index: number) => {
    return quizSessionManager.navigateToQuestion(index);
  }, []);

  return {
    currentIndex,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
    goToQuestion,
  };
}

/**
 * Hook for session events and monitoring
 */
export function useQuizSessionEvents() {
  const [events, setEvents] = useState<SessionEventData[]>([]);
  const [lastEvent, setLastEvent] = useState<SessionEventData | null>(null);
  const eventsRef = useRef<SessionEventData[]>([]);

  useEffect(() => {
    const handleEvent = (eventData: SessionEventData) => {
      console.log(`🎯 Quiz Session Event: ${eventData.currentState}`, eventData);
      
      const newEvent = { ...eventData };
      eventsRef.current = [...eventsRef.current.slice(-19), newEvent]; // Keep last 20 events
      
      setEvents([...eventsRef.current]);
      setLastEvent(newEvent);
    };

    const eventTypes = [
      'session_created',
      'session_started',
      'session_completed',
      'session_abandoned',
      'session_recovered',
      'question_changed',
      'answer_submitted',
      'session_visibility_changed',
    ];

    eventTypes.forEach(eventType => {
      quizSessionManager.addEventListener(eventType, handleEvent);
    });

    return () => {
      eventTypes.forEach(eventType => {
        quizSessionManager.removeEventListener(eventType, handleEvent);
      });
    };
  }, []);

  const clearEvents = useCallback(() => {
    eventsRef.current = [];
    setEvents([]);
    setLastEvent(null);
  }, []);

  return {
    events,
    lastEvent,
    clearEvents,
  };
}

/**
 * Hook for session abandonment protection
 */
export function useSessionProtection() {
  const [showAbandonWarning, setShowAbandonWarning] = useState(false);
  const [attemptedNavigation, setAttemptedNavigation] = useState<string | null>(null);

  useEffect(() => {
    const handleRouteChange = (_event: PopStateEvent) => {
      if (quizSessionManager.hasActiveSession()) {
        const confirmAbandon = window.confirm(
          'You have an active quiz session. Leaving this page will abandon your progress. Are you sure?'
        );
        
        if (!confirmAbandon) {
          // Prevent navigation
          window.history.pushState(null, '', window.location.pathname);
          return;
        } else {
          quizSessionManager.abandonSession('user_navigation');
        }
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const requestNavigation = useCallback((path: string): boolean => {
    if (quizSessionManager.hasActiveSession()) {
      setAttemptedNavigation(path);
      setShowAbandonWarning(true);
      return false; // Block navigation
    }
    return true; // Allow navigation
  }, []);

  const confirmAbandon = useCallback(() => {
    quizSessionManager.abandonSession('user_confirmed_navigation');
    setShowAbandonWarning(false);
    setAttemptedNavigation(null);
    return attemptedNavigation;
  }, [attemptedNavigation]);

  const cancelAbandon = useCallback(() => {
    setShowAbandonWarning(false);
    setAttemptedNavigation(null);
  }, []);

  return {
    showAbandonWarning,
    attemptedNavigation,
    requestNavigation,
    confirmAbandon,
    cancelAbandon,
  };
}

/**
 * Hook for timer management in timed quizzes
 */
export function useQuizTimer() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const session = quizSessionManager.getCurrentSession();
      if (session && session.isTimeLimited && session.timeRemaining !== undefined) {
        setTimeRemaining(session.timeRemaining);
        setIsTimerActive(session.state === 'active');
        setTimeUp(session.timeRemaining === 0);
      } else {
        setTimeRemaining(null);
        setIsTimerActive(false);
        setTimeUp(false);
      }
    };

    const eventHandlers: Array<[string, SessionEventHandler]> = [
      ['session_started', updateTimer],
      ['session_completed', updateTimer],
      ['session_abandoned', updateTimer],
    ];

    eventHandlers.forEach(([event, handler]) => {
      quizSessionManager.addEventListener(event, handler);
    });

    // Update timer every second
    const interval = setInterval(updateTimer, 1000);

    updateTimer();

    return () => {
      clearInterval(interval);
      eventHandlers.forEach(([event, handler]) => {
        quizSessionManager.removeEventListener(event, handler);
      });
    };
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeRemaining,
    isTimerActive,
    timeUp,
    formatTime,
  };
}

/**
 * Hook for safe navigation with session protection
 */
export function useSafeNavigation() {
  const navigate = useNavigate();

  const safeNavigate = useCallback((path: string) => {
    const hasActiveSession = quizSessionManager.hasActiveSession();
    
    if (!hasActiveSession) {
      navigate(path);
      return;
    }
    
    const confirmed = window.confirm(
      'You have an active quiz session. Leaving this page will abandon your progress. Are you sure?'
    );
    
    if (confirmed) {
      quizSessionManager.abandonSession('user_navigation');
      navigate(path);
    }
  }, [navigate]);

  return { 
    safeNavigate, 
    hasActiveSession: quizSessionManager.hasActiveSession() 
  };
}