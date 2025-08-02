import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, Clock, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { quizService, type Question, type QuizSession } from '../../services/quiz';
import { useAppStore } from '../../store';
import { getRandomQuestions } from '../../data/sampleQuestions';
import { useAsyncError } from '../../hooks/useAsyncError';

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
        return { questionCount: 5, timeLimit: null };
      case 'timed':
        return { questionCount: 10, timeLimit: 600 }; // 10 minutes
      case 'custom':
        return { questionCount: 8, timeLimit: 480 }; // 8 minutes for demo
      default:
        return { questionCount: 5, timeLimit: null };
    }
  }, [mode]);

  // Initialize quiz
  useEffect(() => {
    const initializeQuiz = async () => {
      // Use mock user if no authenticated user (for demo purposes)
      const currentUser = user || { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' };

      await handleAsyncError(async () => {
        const config = getQuizConfig();
        
        // For now, use sample questions since we haven't seeded the database yet
        // In production, this would fetch from the database
        const selectedQuestions = getRandomQuestions(config.questionCount);
        
        // Convert sample questions to our Question format
        const questions: Question[] = selectedQuestions.map((q, index) => ({
          id: `sample_${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          usmleCategory: q.usmleCategory,
          tags: q.tags,
          medicalReferences: q.medicalReferences,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Create quiz session (skip database for demo, use mock session)
        const questionIds = questions.map(q => q.id);
        
        // Create a mock session for demo purposes
        const mockSession = {
          id: `mock-session-${Date.now()}`,
          userId: currentUser.id,
          mode,
          questions: questionIds,
          answers: new Array(questions.length).fill(null),
          score: 0,
          timeSpent: 0,
          status: 'active' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setQuizState(prev => ({
          ...prev,
          questions,
          answers: new Array(questions.length).fill(null),
          session: mockSession,
          timeRemaining: config.timeLimit,
        }));
      }, 'Initialize Quiz');
    };

    initializeQuiz();
  }, [mode, getQuizConfig, handleAsyncError]);

  // Handle quiz completion (defined early to avoid hoisting issues)
  const handleCompleteQuiz = useCallback(async () => {
    if (!quizState.session || quizState.isSubmitting) return;

    setQuizState(prev => ({ ...prev, isSubmitting: true }));

    await handleAsyncError(async () => {
      // Calculate score locally for demo
      let correctAnswers = 0;
      quizState.answers.forEach((answer, index) => {
        if (answer !== null && quizState.questions[index] && answer === quizState.questions[index].correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / quizState.questions.length) * 100);
      
      // Create completed session locally
      const completedSession = {
        ...quizState.session!,
        score,
        status: 'completed' as const,
        answers: quizState.answers,
        completedAt: new Date(),
        updatedAt: new Date(),
      };
      
      onComplete(completedSession);
    }, 'Complete Quiz');
  }, [quizState.session, quizState.isSubmitting, quizState.questions, quizState.answers, handleAsyncError, onComplete]);

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

  // Handle answer selection
  const handleAnswerSelect = async (answerIndex: number) => {
    if (quizState.hasAnswered || !quizState.session) return;

    await handleAsyncError(async () => {
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

      // Update session in database (skip for demo)
      // if (quizState.session) {
      //   await quizService.submitAnswer(
      //     quizState.session.id,
      //     quizState.currentQuestionIndex,
      //     answerIndex,
      //     timeSpent
      //   );
      // }
    }, 'Submit Answer');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </h1>
            <p className="text-muted-foreground capitalize">{mode} Quiz</p>
          </div>
        </div>
        
        {quizState.timeRemaining !== null && quizState.timeRemaining !== undefined && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Clock className="h-4 w-4" />
            <span className={`font-mono ${quizState.timeRemaining < 60 ? 'text-red-500' : ''}`}>
              {formatTime(quizState.timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${((quizState.currentQuestionIndex + (quizState.hasAnswered ? 1 : 0)) / quizState.questions.length) * 100}%` 
          }}
        />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              {currentQuestion.category}
            </div>
            <div className="px-2 py-1 bg-muted rounded text-xs font-medium capitalize">
              {currentQuestion.difficulty}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed">{currentQuestion.question}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = quizState.showExplanation;
              
              let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-all ";
              
              if (showResult) {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-green-50 text-green-900";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 text-red-900";
                } else {
                  buttonClass += "border-muted bg-muted/50 text-muted-foreground";
                }
              } else if (isSelected) {
                buttonClass += "border-primary bg-primary/10 text-primary";
              } else {
                buttonClass += "border-muted hover:border-primary/50 hover:bg-primary/5";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={quizState.hasAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
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