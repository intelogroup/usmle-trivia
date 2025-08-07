import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { XCircle } from 'lucide-react';
import { type Question, type QuizSession } from '../../services/quiz';
import { useAppStore } from '../../store';
import { useAsyncError } from '../../hooks/useAsyncError';
import { useGetRandomQuestions, useCreateQuizSession, useSubmitAnswer, useCompleteQuizWithStats } from '../../services/convexQuiz';
import { analyticsService } from '../../services/analytics';
import { QuizHeader } from './QuizHeader';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';

interface QuizEngineProps {
  mode: 'quick' | 'timed' | 'custom';
  onBack: () => void;
  onComplete: (session: QuizSession, enhancedResults?: {
    pointsEarned: number;
    userStats: any;
    performanceMetrics: any;
  }) => void;
}

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  startTime: Date;
  timeRemaining?: number | null;
  session?: QuizSession;
  showExplanation: boolean;
  isSubmitting: boolean;
  hasAnswered: boolean;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ mode, onBack, onComplete }) => {
  const { user } = useAppStore();
  const { handleAsyncError, error } = useAsyncError();
  
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    startTime: new Date(),
    showExplanation: false,
    isSubmitting: false,
    hasAnswered: false,
  });

  // Quiz configuration based on mode
  const getQuizConfig = useCallback(() => {
    switch (mode) {
      case 'quick':
        return { numQuestions: 5, timeLimit: null };
      case 'timed':
        return { numQuestions: 10, timeLimit: 600 }; // 10 minutes
      case 'custom':
        return { numQuestions: 8, timeLimit: null };
      default:
        return { numQuestions: 5, timeLimit: null };
    }
  }, [mode]);

  // Convex hooks
  const getRandomQuestions = useGetRandomQuestions();
  const createQuizSession = useCreateQuizSession();
  const submitAnswer = useSubmitAnswer();
  const completeQuizWithStats = useCompleteQuizWithStats();

  // Initialize quiz
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        if (!user) throw new Error('User not authenticated');
        
        const config = getQuizConfig();
        const questions = await handleAsyncError(async () => {
          return await getRandomQuestions({ count: config.numQuestions });
        }, 'Load Questions');

        if (questions && questions.length > 0) {
          // Track question view for first question
          analyticsService.trackQuestionView(questions[0].id, 0);
          
          setQuizState(prev => ({
            ...prev,
            questions,
            answers: new Array(questions.length).fill(null),
            timeRemaining: config.timeLimit,
          }));

          // Create quiz session
          const sessionId = await createQuizSession({
            userId: user.id,
            mode,
            questionIds: questions.map(q => q.id),
            startTime: new Date().toISOString(),
          });

          setQuizState(prev => ({
            ...prev,
            session: {
              id: sessionId,
              userId: user.id,
              mode,
              questions: questions.map(q => q.id),
              answers: [],
              score: 0,
              status: 'in_progress',
              startTime: prev.startTime,
              timeSpent: 0,
            } as QuizSession
          }));
        }
      } catch (error) {
        console.error('Failed to initialize quiz:', error);
      }
    };

    initializeQuiz();
  }, [user, mode, getQuizConfig, getRandomQuestions, createQuizSession, handleAsyncError]);

  // Handle answer selection
  const handleAnswerSelect = useCallback(async (answerIndex: number) => {
    if (quizState.hasAnswered || !quizState.session) return;

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // Track answer selection
    analyticsService.trackAnswerSelected(currentQuestion.id, answerIndex, isCorrect);

    // Update answers
    const newAnswers = [...quizState.answers];
    newAnswers[quizState.currentQuestionIndex] = answerIndex;

    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      hasAnswered: true,
      showExplanation: true,
    }));

    // Submit answer to backend
    await handleAsyncError(async () => {
      await submitAnswer({
        sessionId: quizState.session!.id,
        questionIndex: quizState.currentQuestionIndex,
        answer: answerIndex,
      });
    }, 'Submit Answer');
  }, [quizState.hasAnswered, quizState.session, quizState.questions, quizState.currentQuestionIndex, quizState.answers, handleAsyncError, submitAnswer]);

  // Handle next question
  const handleNextQuestion = useCallback(() => {
    const nextIndex = quizState.currentQuestionIndex + 1;
    if (nextIndex < quizState.questions.length) {
      // Track question view for next question
      analyticsService.trackQuestionView(quizState.questions[nextIndex].id, nextIndex);
      
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        showExplanation: false,
        hasAnswered: false,
      }));
    } else {
      handleCompleteQuiz();
    }
  }, [quizState.currentQuestionIndex, quizState.questions]);

  // Handle quiz completion
  const handleCompleteQuiz = useCallback(async () => {
    if (!quizState.session || quizState.isSubmitting) return;

    setQuizState(prev => ({ ...prev, isSubmitting: true }));

    await handleAsyncError(async () => {
      const finalTimeSpent = Math.floor((Date.now() - quizState.startTime.getTime()) / 1000);
      
      const enhancedResult = await completeQuizWithStats({
        sessionId: quizState.session!.id,
        timeSpent: finalTimeSpent,
      });

      if (enhancedResult && enhancedResult.session) {
        const session: QuizSession = {
          ...quizState.session!,
          score: enhancedResult.session.score,
          status: 'completed',
          answers: enhancedResult.session.answers,
          timeSpent: enhancedResult.session.timeSpent,
          completedAt: new Date(enhancedResult.session.completedAt || Date.now()),
          updatedAt: new Date(),
        };
        
        // Track quiz completion
        const totalCorrect = quizState.answers.filter((answer, index) => 
          answer === quizState.questions[index]?.correctAnswer
        ).length;
        analyticsService.trackQuizComplete(totalCorrect, quizState.questions.length, finalTimeSpent);
        
        onComplete(session, {
          pointsEarned: enhancedResult.results.pointsEarned,
          userStats: enhancedResult.userStats,
          performanceMetrics: enhancedResult.results.performanceMetrics
        });
      }
    }, 'Complete Quiz');
  }, [quizState.session, quizState.isSubmitting, quizState.startTime, quizState.answers, quizState.questions, handleAsyncError, completeQuizWithStats, onComplete]);

  // Timer for timed quizzes
  useEffect(() => {
    if (quizState.timeRemaining === null || quizState.timeRemaining === undefined) return;

    const timer = setInterval(() => {
      setQuizState(prev => {
        if (prev.timeRemaining === null || prev.timeRemaining === undefined) return prev;
        
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          handleCompleteQuiz();
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.timeRemaining, handleCompleteQuiz]);

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
    <div className="space-y-6" role="main" aria-label={`USMLE ${mode} quiz`}>
      {/* Accessibility Live Regions */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        aria-label="Quiz status updates"
      >
        {quizState.showExplanation && currentAnswer !== null && 
          `Answer ${currentAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`
        }
      </div>
      
      <div 
        role="status" 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        aria-label="Timer updates"
      >
        {quizState.timeRemaining !== null && quizState.timeRemaining !== undefined && quizState.timeRemaining <= 60 &&
          `${Math.floor(quizState.timeRemaining / 60)}:${String(quizState.timeRemaining % 60).padStart(2, '0')} remaining`
        }
      </div>

      {/* Quiz Header */}
      <QuizHeader
        mode={mode}
        currentQuestion={quizState.currentQuestionIndex + 1}
        totalQuestions={quizState.questions.length}
        timeRemaining={quizState.timeRemaining}
        onBack={onBack}
      />

      {/* Progress Bar */}
      <QuizProgress
        currentQuestion={quizState.currentQuestionIndex}
        totalQuestions={quizState.questions.length}
        hasAnswered={quizState.hasAnswered}
      />

      {/* Question */}
      <QuizQuestion
        question={currentQuestion}
        selectedAnswer={currentAnswer}
        showExplanation={quizState.showExplanation}
        hasAnswered={quizState.hasAnswered}
        onAnswerSelect={handleAnswerSelect}
        questionNumber={quizState.currentQuestionIndex + 1}
      />

      {/* Navigation */}
      {quizState.showExplanation && (
        <div className="flex justify-end">
          <Button 
            onClick={isLastQuestion ? handleCompleteQuiz : handleNextQuestion}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-8 py-2.5 rounded-xl font-semibold shadow-custom transition-all duration-200 hover:scale-105"
            disabled={quizState.isSubmitting}
            aria-label={isLastQuestion ? "Complete quiz" : "Next question"}
          >
            {quizState.isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>{isLastQuestion ? 'Submitting...' : 'Processing...'}</span>
              </div>
            ) : (
              isLastQuestion ? 'Complete Quiz' : 'Next Question'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};