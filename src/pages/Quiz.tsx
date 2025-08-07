import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react';
import { EnhancedQuizEngine } from '../components/quiz/EnhancedQuizEngine';
import { QuizResults } from '../components/quiz/QuizResults';
import { QuizResultsSummary } from '../components/quiz/QuizResultsSummary';
import { SessionNavigationGuard, SessionStatusIndicator } from '../components/quiz/SessionNavigationGuard';
import { CustomQuizConfig } from '../components/quiz/CustomQuizConfig';
import { useQuizSession, useQuizSessionEvents, useSafeNavigation } from '../hooks/useQuizSession';
import { useAppStore } from '../store';
import { quizModes, processedSampleQuestions } from '../data/sampleQuestions';
import type { QuizSession } from '../services/quiz';
import type { Question } from '../services/quiz';
import { type QuizSessionData, quizSessionManager } from '../services/QuizSessionManager';

type QuizMode = 'quick' | 'timed' | 'custom';
type QuizState = 'setup' | 'active' | 'results';

export const Quiz: React.FC = () => {
  const { mode } = useParams<{ mode?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const quizMode = location.state?.mode;
  const { user } = useAppStore();
  
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [completedSession, setCompletedSession] = useState<QuizSession | null>(null);
  const [completedSessionData, setCompletedSessionData] = useState<QuizSessionData | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [enhancedResults, setEnhancedResults] = useState<{
    pointsEarned: number;
    userStats: any;
    performanceMetrics: any;
  } | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [customQuizConfig, setCustomQuizConfig] = useState<any>(null);
  
  // Session management hooks
  const { 
    session, 
    hasActiveSession, 
    createSession, 
    startSession, 
    // abandonSession, // Available but not used in current implementation
    error: sessionError 
  } = useQuizSession();
  
  const { safeNavigate } = useSafeNavigation();
  const { lastEvent } = useQuizSessionEvents();
  
  // Enhanced quiz results now auto-saved - no manual save needed
  
  const isValidMode = (m: string | undefined): m is QuizMode => {
    return m === 'quick' || m === 'timed' || m === 'custom';
  };
  
  // Check for existing active session on mount
  useEffect(() => {
    if (session && session.state === 'active') {
      setQuizState('active');
    }
  }, [session]);

  // Handle session events
  useEffect(() => {
    if (lastEvent) {
      switch (lastEvent.currentState) {
        case 'active':
          setQuizState('active');
          break;
        case 'completed':
          if (session) {
            // Convert session to QuizSession format for backward compatibility
            const convertedSession: QuizSession = {
              id: session.sessionId,
              userId: session.userId,
              mode: session.mode,
              questions: session.questions,
              answers: session.answers,
              score: session.score,
              timeSpent: session.timeSpent,
              status: 'completed',
              createdAt: session.startTime,
              updatedAt: session.endTime || new Date(),
            };
            
            // Prepare questions for results summary
            const sessionQuestions: Question[] = processedSampleQuestions
              .slice(0, session.questions.length)
              .map((q, index) => ({
                ...q,
                id: session.questions[index] || `q${index + 1}`,
              }));
            
            setCompletedSession(convertedSession);
            setCompletedSessionData(session);
            setQuizQuestions(sessionQuestions);
            setQuizState('results');
          }
          break;
        case 'abandoned':
          setQuizState('setup');
          setStartError('Previous quiz session was abandoned. You can start a new one.');
          break;
      }
    }
  }, [lastEvent, session]);

  const handleBack = () => {
    if (hasActiveSession) {
      safeNavigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };
  
  const handleStartQuiz = async () => {
    if (!user) {
      setStartError('Please log in to start a quiz session.');
      return;
    }

    if (!mode || !isValidMode(mode)) {
      setStartError('Invalid quiz mode selected.');
      return;
    }

    setStartError(null);

    try {
      let questionCount: number;
      let timeLimit: number | undefined;
      
      if (mode === 'custom' && customQuizConfig) {
        questionCount = customQuizConfig.questionCount;
        timeLimit = customQuizConfig.timeLimit ? customQuizConfig.timeLimit * 60 : undefined; // convert minutes to seconds
      } else {
        // Default values for quick and timed modes
        questionCount = mode === 'quick' ? 5 : mode === 'timed' ? 10 : 8;
        timeLimit = mode === 'timed' ? 600 : mode === 'custom' ? 480 : undefined; // seconds
      }
      
      // Generate question IDs based on mode
      const questionIds = Array.from({ length: questionCount }, (_, i) => `q${i + 1}`);

      console.log(`🎯 Creating ${mode} quiz session with ${questionCount} questions`);
      
      // Create session
      const sessionId = await createSession(user.id, mode, questionIds, { timeLimit });
      
      console.log(`✅ Session created: ${sessionId}, starting...`);
      
      // Start the session
      await startSession();
      
      console.log('🚀 Session started successfully');
      
    } catch (error) {
      console.error('Failed to start quiz session:', error);
      setStartError(error instanceof Error ? error.message : 'Failed to start quiz session');
    }
  };

  const handleCustomQuizConfig = (config: any) => {
    setCustomQuizConfig(config);
    handleStartQuiz();
  };
  
  const handleQuizComplete = (session: QuizSession, enhancedData?: {
    pointsEarned: number;
    userStats: any;
    performanceMetrics: any;
  }) => {
    setCompletedSession(session);
    if (enhancedData) {
      setEnhancedResults(enhancedData);
    }
    setQuizState('results');
  };
  
  const handleRetryQuiz = () => {
    setQuizState('setup');
    setCompletedSession(null);
  };
  
  const handleHomeReturn = () => {
    navigate('/');
  };

  // Handle session cleanup and unmounting after results
  const handleUnmountSession = () => {
    quizSessionManager.cleanup();
    setCompletedSession(null);
    setCompletedSessionData(null);
    setQuizQuestions([]);
    setEnhancedResults(null);
  };

  // Handle starting a new quiz from results
  const handleStartNewQuiz = () => {
    navigate('/dashboard');
  };

  // Handle returning to dashboard from results
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (!mode || !isValidMode(mode)) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quiz</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Please select a valid quiz mode from the dashboard to get started.
            </p>
            <div className="text-center mt-4">
              <Button onClick={handleBack}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show enhanced quiz engine when active
  if (quizState === 'active') {
    return (
      <SessionNavigationGuard>
        <SessionStatusIndicator />
        <EnhancedQuizEngine 
          onBack={() => setQuizState('setup')}
          onComplete={handleQuizComplete}
        />
      </SessionNavigationGuard>
    );
  }
  
  // Show results when completed
  if (quizState === 'results') {
    // Use comprehensive results summary if session data and questions are available
    if (completedSessionData && quizQuestions.length > 0) {
      return (
        <QuizResultsSummary
          session={completedSessionData}
          questions={quizQuestions}
          pointsEarned={enhancedResults?.pointsEarned}
          userStats={enhancedResults?.userStats}
          onStartNewQuiz={handleStartNewQuiz}
          onBackToDashboard={handleBackToDashboard}
          onUnmountSession={handleUnmountSession}
        />
      );
    }
    
    // Fallback to basic results if only basic session data is available
    if (completedSession) {
      return (
        <QuizResults 
          session={completedSession}
          onHome={handleHomeReturn}
          onRetry={handleRetryQuiz}
        />
      );
    }
  }
  
  // Get quiz mode configuration
  const modeConfig = quizModes[mode];

  // Quiz setup screen - show custom config for custom mode
  if (mode === 'custom') {
    return (
      <SessionNavigationGuard>
        <SessionStatusIndicator />
        <CustomQuizConfig 
          onStartQuiz={handleCustomQuizConfig}
          onBack={handleBack}
        />
      </SessionNavigationGuard>
    );
  }
  
  // Quiz setup screen for quick and timed modes
  return (
    <SessionNavigationGuard>
      <SessionStatusIndicator />
      <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {modeConfig.name}
          </h1>
          <p className="text-muted-foreground">
            {modeConfig.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {(startError || sessionError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {startError || sessionError}
                </p>
              </div>
            </div>
          )}

          {/* Session Conflict Warning */}
          {hasActiveSession && session && session.mode !== mode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Active Session Detected</p>
                  <p>
                    You have an active <span className="font-medium">{session.mode}</span> quiz session. 
                    Starting a new {mode} quiz will abandon your current progress.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Questions:</span>
              <span className="ml-2 font-medium">{quizMode?.questions || 10}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-medium">{quizMode?.duration || '15 min'}</span>
            </div>
          </div>
          
          {quizMode?.features && (
            <div>
              <p className="text-sm font-medium mb-2">Features:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {quizMode.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4">
            <Button className="w-full" size="lg" onClick={handleStartQuiz}>
              <Play className="w-4 h-4 mr-2" />
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      </div>
    </SessionNavigationGuard>
  );
};