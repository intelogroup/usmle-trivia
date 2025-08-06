import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, Clock, CheckCircle, XCircle, BookOpen, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { type Question, type QuizSession } from '../../services/quiz';
import { useAppStore } from '../../store';
import { useAsyncError } from '../../hooks/useAsyncError';
import { useGetRandomQuestions, useCreateQuizSession, useSubmitAnswer, useCompleteQuizSession } from '../../services/convexQuiz';
import { SessionErrorIntegration } from '../../utils/sessionErrorIntegration';
import { QuizErrorBoundary } from './QuizErrorBoundary';
import { sessionErrorLogger, SessionErrorType } from '../../utils/sessionErrorLogger';
import { useSessionErrorStore } from '../../store/sessionErrorStore';

interface QuizEngineProps {
  mode: 'quick' | 'timed' | 'custom';
  onBack: () => void;
  onComplete: (session: QuizSession) => void;
}

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  startTime: Date;
  timeRemaining?: number | null; // For timed quizzes
  session?: QuizSession;
  showExplanation: boolean;
  isSubmitting: boolean;
  hasAnswered: boolean;
  // Enhanced error tracking
  isOnline: boolean;
  networkRetries: number;
  lastSyncTime?: Date;
  syncErrors: number;
  autoSaveEnabled: boolean;
  debugInfo?: {
    loadTime?: number;
    renderErrors?: number;
    apiCalls?: number;
    memoryUsage?: number;
  };
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ mode, onBack, onComplete }) => {
  const { user } = useAppStore();
  const { handleAsyncError, error } = useAsyncError();
  const sessionErrorStore = useSessionErrorStore();
  const componentStartTime = useRef(Date.now());
  const apiCallsRef = useRef(0);
  const renderCountRef = useRef(0);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout>();
  
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    startTime: new Date(),
    showExplanation: false,
    isSubmitting: false,
    hasAnswered: false,
    // Enhanced error tracking
    isOnline: navigator.onLine,
    networkRetries: 0,
    syncErrors: 0,
    autoSaveEnabled: true,
    debugInfo: {
      loadTime: 0,
      renderErrors: 0,
      apiCalls: 0,
      memoryUsage: 0
    }
  });

  // Quiz configuration based on mode
  const getQuizConfig = useCallback(() => {
    switch (mode) {
      case 'quick':
        return { questionCount: 5, timeLimit: null };
      case 'timed':
        return { questionCount: 10, timeLimit: 600 }; // 10 minutes
      case 'custom':
        return { questionCount: 8, timeLimit: 480 }; // 8 minutes for demo
      default:
        return { questionCount: 5, timeLimit: null };
    }
  }, [mode]);

  // Convex hooks
  const randomQuestions = useGetRandomQuestions(getQuizConfig().questionCount);
  const createQuizSession = useCreateQuizSession();
  const submitAnswer = useSubmitAnswer();
  const completeQuizSession = useCompleteQuizSession();

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setQuizState(prev => ({ ...prev, isOnline: true, networkRetries: 0 }));
      sessionErrorLogger.logQuizError(
        new Error('Network connection restored'),
        { mode, currentQuestion: quizState.currentQuestionIndex },
        SessionErrorType.QUIZ_SESSION_SYNC_FAILED
      );
    };

    const handleOffline = () => {
      setQuizState(prev => ({ ...prev, isOnline: false }));
      sessionErrorLogger.logQuizError(
        new Error('Network connection lost'),
        { mode, currentQuestion: quizState.currentQuestionIndex },
        SessionErrorType.QUIZ_SESSION_SYNC_FAILED
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [mode, quizState.currentQuestionIndex]);

  // Auto-save setup
  useEffect(() => {
    if (quizState.session && quizState.autoSaveEnabled) {
      autoSaveIntervalRef.current = setInterval(async () => {
        try {
          // Save quiz state to local storage as backup
          const backupState = {
            sessionId: quizState.session?.id,
            answers: quizState.answers,
            currentQuestionIndex: quizState.currentQuestionIndex,
            startTime: quizState.startTime,
            timeRemaining: quizState.timeRemaining,
            lastSaved: new Date().toISOString()
          };
          localStorage.setItem(`quiz_backup_${mode}`, JSON.stringify(backupState));
          
          setQuizState(prev => ({ 
            ...prev, 
            lastSyncTime: new Date() 
          }));
        } catch (error) {
          console.error('Auto-save failed:', error);
          setQuizState(prev => ({ 
            ...prev, 
            syncErrors: prev.syncErrors + 1 
          }));
        }
      }, 15000); // Auto-save every 15 seconds
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [quizState.session, quizState.autoSaveEnabled, mode]);

  // Performance monitoring
  useEffect(() => {
    renderCountRef.current += 1;
    
    if (renderCountRef.current % 10 === 0) {
      // Update performance metrics every 10 renders
      const memoryInfo = (performance as any).memory;
      setQuizState(prev => ({
        ...prev,
        debugInfo: {
          ...prev.debugInfo,
          renderErrors: renderCountRef.current > 50 ? 1 : 0,
          memoryUsage: memoryInfo?.usedJSHeapSize || 0,
          loadTime: Date.now() - componentStartTime.current
        }
      }));
    }
  });

  // Initialize quiz
  useEffect(() => {
    const initializeQuiz = async () => {
      if (!user || !randomQuestions || randomQuestions.length === 0) return;

      const initStartTime = Date.now();
      apiCallsRef.current += 1;

      await handleAsyncError(async () => {
        const config = getQuizConfig();
        
        // Convert Convex questions to our Question format
        const questions: Question[] = randomQuestions.map((q) => ({
          id: q._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          usmleCategory: q.usmleCategory,
          tags: q.tags,
          medicalReferences: q.medicalReferences,
          createdAt: new Date(q._creationTime),
          updatedAt: new Date(q._creationTime),
        }));

        // Create quiz session with comprehensive error logging
        const questionIds = questions.map(q => q.id);
        
        const sessionId = await SessionErrorIntegration.wrapQuizOperation(
          async () => {
            apiCallsRef.current += 1;
            const result = await createQuizSession({
              userId: user.id,
              mode,
              questionIds,
            });
            
            // Log successful session creation
            await sessionErrorLogger.logQuizError(
              new Error('Quiz session created successfully'),
              {
                mode,
                questionCount: questions.length,
                currentQuestion: 0,
                timeRemaining: config.timeLimit,
                lastSyncTime: new Date(),
                deviceInfo: {
                  userAgent: navigator.userAgent,
                  screenResolution: `${window.screen.width}x${window.screen.height}`,
                  touchSupport: 'ontouchstart' in window,
                  orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
                }
              },
              SessionErrorType.QUIZ_SESSION_SYNC_FAILED // Using as info log
            );
            
            return result;
          },
          'quiz_session_start',
          {
            sessionType: 'quiz',
            mode,
            questionCount: questions.length,
            currentQuestion: 0,
            timeRemaining: config.timeLimit,
            completionPercentage: 0,
            deviceInfo: {
              userAgent: navigator.userAgent,
              screenResolution: `${window.screen.width}x${window.screen.height}`,
              touchSupport: 'ontouchstart' in window,
              orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
            }
          }
        );

        if (sessionId) {
          // Create session object
          const session: QuizSession = {
            id: sessionId,
            userId: user.id,
            mode,
            questions: questionIds,
            answers: new Array(questions.length).fill(null),
            score: 0,
            timeSpent: 0,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Update state with performance metrics
          const initLoadTime = Date.now() - initStartTime;
          setQuizState(prev => ({
            ...prev,
            questions,
            answers: new Array(questions.length).fill(null),
            session,
            timeRemaining: config.timeLimit,
            lastSyncTime: new Date(),
            debugInfo: {
              ...prev.debugInfo,
              loadTime: initLoadTime,
              apiCalls: apiCallsRef.current
            }
          }));
        }
      }, 'Initialize Quiz');
    };

    initializeQuiz();
  }, [mode, getQuizConfig, handleAsyncError, user, randomQuestions, createQuizSession]);

  // Handle quiz completion
  const handleCompleteQuiz = useCallback(async () => {
    if (!quizState.session || quizState.isSubmitting) return;

    setQuizState(prev => ({ ...prev, isSubmitting: true }));

    await handleAsyncError(async () => {
      // Calculate final time spent
      const finalTimeSpent = Math.floor((Date.now() - quizState.startTime.getTime()) / 1000);
      
      // Complete session in Convex with enhanced error logging
      if (completeQuizSession) {
        const completedSession = await SessionErrorIntegration.wrapQuizOperation(
          () => completeQuizSession({
            sessionId: quizState.session!.id,
            finalTimeSpent,
          }),
          'quiz_session_complete',
          {
            sessionType: 'quiz',
            mode,
            questionCount: quizState.questions.length,
            currentQuestion: quizState.questions.length,
            timeRemaining: quizState.timeRemaining,
            completionPercentage: 100,
            lastSyncTime: new Date()
          }
        );
        
        if (completedSession) {
          // Create completed session object
          const session: QuizSession = {
            ...quizState.session!,
            score: completedSession.score,
            status: 'completed',
            answers: completedSession.answers,
            timeSpent: completedSession.timeSpent,
            completedAt: new Date(completedSession.completedAt || Date.now()),
            updatedAt: new Date(),
          };
          
          onComplete(session);
        }
      }
    }, 'Complete Quiz');
  }, [quizState.session, quizState.isSubmitting, quizState.startTime, handleAsyncError, completeQuizSession, onComplete]);

  // Timer for timed quizzes
  useEffect(() => {
    if (quizState.timeRemaining === null || quizState.timeRemaining === undefined) return;

    const timer = setInterval(() => {
      setQuizState(prev => {
        if (prev.timeRemaining === null || prev.timeRemaining === undefined) return prev;
        
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          // Auto-submit quiz when time runs out
          handleCompleteQuiz();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.timeRemaining, handleCompleteQuiz]);

  // Enhanced answer selection with retry logic
  const handleAnswerSelect = async (answerIndex: number) => {
    if (quizState.hasAnswered || !quizState.session) return;

    const answerStartTime = Date.now();
    let retryCount = 0;
    const maxRetries = 3;

    const submitWithRetry = async (): Promise<void> => {
      try {
        apiCallsRef.current += 1;
        
        // Check network status
        if (!navigator.onLine) {
          throw new Error('Network offline - answer will be saved locally');
        }

        await handleAsyncError(async () => {
      // Track time spent
      const timeSpent = Math.floor((Date.now() - quizState.startTime.getTime()) / 1000);
      
      // Update local state
      const newAnswers = [...quizState.answers];
      newAnswers[quizState.currentQuestionIndex] = answerIndex;
      
      setQuizState(prev => ({
        ...prev,
        answers: newAnswers,
        hasAnswered: true,
        showExplanation: true,
      }));

          // Update session in Convex database with comprehensive error logging
          if (quizState.session && submitAnswer) {
            await SessionErrorIntegration.wrapQuizOperation(
              async () => {
                const result = await submitAnswer({
                  sessionId: quizState.session.id,
                  questionIndex: quizState.currentQuestionIndex,
                  answer: answerIndex,
                  timeSpent,
                });
                
                // Log successful answer submission
                console.log(`Answer ${answerIndex} submitted successfully for question ${quizState.currentQuestionIndex}`);
                
                // Update sync status
                setQuizState(prev => ({
                  ...prev,
                  lastSyncTime: new Date(),
                  syncErrors: Math.max(0, prev.syncErrors - 1) // Reduce error count on success
                }));
                
                return result;
              },
              'quiz_answer_submission',
              {
                sessionType: 'quiz',
                mode,
                questionCount: quizState.questions.length,
                currentQuestion: quizState.currentQuestionIndex + 1,
                timeRemaining: quizState.timeRemaining,
                completionPercentage: ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100,
                lastSyncTime: new Date()
              }
            );
          }
        });
      } catch (error) {
        retryCount += 1;
        
        // Log the error
        await sessionErrorLogger.logQuizError(
          error,
          {
            mode,
            currentQuestion: quizState.currentQuestionIndex,
            questionCount: quizState.questions.length,
            lastSyncTime: new Date()
          },
          SessionErrorType.QUIZ_SESSION_SYNC_FAILED
        );
        
        // Update error count
        setQuizState(prev => ({
          ...prev,
          syncErrors: prev.syncErrors + 1,
          networkRetries: prev.networkRetries + 1
        }));

        if (retryCount < maxRetries && navigator.onLine) {
          console.log(`Answer submission failed, retrying... (${retryCount}/${maxRetries})`);
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return submitWithRetry();
        } else {
          // Store answer locally as fallback
          const backupAnswer = {
            questionIndex: quizState.currentQuestionIndex,
            answer: answerIndex,
            timestamp: new Date().toISOString(),
            sessionId: quizState.session?.id
          };
          
          const existingBackups = JSON.parse(localStorage.getItem('quiz_answer_backups') || '[]');
          existingBackups.push(backupAnswer);
          localStorage.setItem('quiz_answer_backups', JSON.stringify(existingBackups));
          
          console.warn('Answer saved locally due to network issues');
          
          if (retryCount >= maxRetries) {
            throw error;
          }
        }
      }
    };

    await submitWithRetry();
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showExplanation: false,
        hasAnswered: false,
      }));
    } else {
      handleCompleteQuiz();
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Quiz Error</h3>
              <p className="text-muted-foreground">{error.userMessage}</p>
            </div>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizState.questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading quiz questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const currentAnswer = quizState.answers[quizState.currentQuestionIndex];
  const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-background to-muted/30 rounded-2xl border shadow-custom animate-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </h1>
            <p className="text-muted-foreground capitalize font-medium">{mode} Quiz</p>
          </div>
        </div>
        
        {quizState.timeRemaining !== null && quizState.timeRemaining !== undefined && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            quizState.timeRemaining < 60 
              ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
              : 'bg-muted border'
          }`}>
            <Clock className="h-4 w-4" />
            <span className={`font-mono font-bold ${quizState.timeRemaining < 60 ? 'text-red-600' : ''}`}>
              {formatTime(quizState.timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Progress Bar */}
      <div className="relative">
        <div className="w-full bg-muted/50 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ 
              width: `${((quizState.currentQuestionIndex + (quizState.hasAnswered ? 1 : 0)) / quizState.questions.length) * 100}%` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground font-medium">Progress</span>
          <span className="text-xs text-muted-foreground font-medium">
            {Math.round(((quizState.currentQuestionIndex + (quizState.hasAnswered ? 1 : 0)) / quizState.questions.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Enhanced Question Card */}
      <Card className="border-0 shadow-custom-lg bg-gradient-to-br from-background to-muted/20 animate-fade-up">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full text-xs font-semibold shadow-sm">
                {currentQuestion.category}
              </div>
              <div className="px-3 py-1.5 bg-muted/70 text-muted-foreground rounded-full text-xs font-medium capitalize border">
                {currentQuestion.difficulty}
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-medium">USMLE Style</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Enhanced Question Text */}
          <div className="prose prose-sm max-w-none">
            <div className="p-6 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border-l-4 border-primary">
              <p className="text-base leading-relaxed font-medium text-foreground m-0">{currentQuestion.question}</p>
            </div>
          </div>

          {/* Enhanced Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = quizState.showExplanation;
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
              
              let buttonClass = "group w-full p-5 text-left border-2 rounded-xl transition-all duration-300 relative overflow-hidden ";
              
              if (showResult) {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-gradient-to-r from-green-50 to-green-100/50 text-green-900 shadow-green-200/50 shadow-lg";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 text-red-900 shadow-red-200/50 shadow-lg";
                } else {
                  buttonClass += "border-muted bg-muted/30 text-muted-foreground";
                }
              } else if (isSelected) {
                buttonClass += "border-primary bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-primary/20 shadow-lg transform scale-[1.02]";
              } else {
                buttonClass += "border-muted hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/2 hover:shadow-md hover:scale-[1.01]";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={quizState.hasAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                      showResult && isCorrect 
                        ? 'bg-green-500 text-white' 
                        : showResult && isSelected && !isCorrect
                          ? 'bg-red-500 text-white'
                          : isSelected
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                    }`}>
                      {optionLabel}
                    </div>
                    <span className="flex-1 font-medium">{option}</span>
                    <div className="flex-shrink-0 transition-all duration-200">
                      {showResult && isCorrect && <CheckCircle className="h-6 w-6 text-green-600" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-600" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {quizState.showExplanation && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Explanation</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                {currentQuestion.explanation}
              </p>
              
              {currentQuestion.medicalReferences && currentQuestion.medicalReferences.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">References:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {currentQuestion.medicalReferences.map((ref, index) => (
                      <li key={index}>• {ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {quizState.showExplanation && (
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={isLastQuestion ? handleCompleteQuiz : handleNextQuestion}
                disabled={quizState.isSubmitting}
                className="min-w-[120px]"
              >
                {quizState.isSubmitting 
                  ? 'Submitting...' 
                  : isLastQuestion 
                    ? 'Finish Quiz' 
                    : 'Next Question'
                }
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};