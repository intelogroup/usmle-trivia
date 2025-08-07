/**
 * EnhancedQuizEngine - Session-managed quiz engine with navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { BookOpen, CheckCircle, XCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import { QuestionNavigation } from './QuestionNavigation';
import { useQuizSession, useQuizNavigation, useQuizTimer } from '../../hooks/useQuizSession';
// import { useGetRandomQuestions } from '../../services/convexQuiz'; // TODO: Implement random questions
import { type Question } from '../../services/quiz';
import { sampleQuestions } from '../../data/sampleQuestions';

interface EnhancedQuizEngineProps {
  onBack: () => void;
  onComplete: () => void;
}

export const EnhancedQuizEngine: React.FC<EnhancedQuizEngineProps> = ({ 
  onBack, 
  onComplete 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  // Session management hooks
  const { 
    session, 
    submitAnswer, 
    completeSession, 
    abandonSession 
  } = useQuizSession();

  const { currentIndex } = useQuizNavigation();
  // const { timeRemaining, isTimerActive, formatTime } = useQuizTimer(); // TODO: Implement timer display

  // Load questions when session is available
  useEffect(() => {
    if (session && session.state === 'active') {
      // For now, use sample questions based on session question count
      const sessionQuestions: Question[] = sampleQuestions
        .slice(0, session.questions.length)
        .map((q, index) => ({
          ...q,
          id: session.questions[index] || `q${index + 1}`,
        }));
      
      setQuestions(sessionQuestions);
      console.log(`📚 Loaded ${sessionQuestions.length} questions for session ${session.sessionId}`);
    }
  }, [session]);

  // Handle answer selection
  const handleAnswerSelect = useCallback(async (answerIndex: number) => {
    if (!session || showExplanation || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const success = submitAnswer(answerIndex);
      if (success) {
        setShowExplanation(true);
        console.log(`✅ Answer ${answerIndex} submitted for Q${currentIndex + 1}`);
        
        // Handle auto-advance for Quick and Timed Quiz modes
        if (session.autoAdvanceConfig.enabled && session.autoAdvanceConfig.skipToNext) {
          const delayMs = session.autoAdvanceConfig.delayMs;
          
          if (delayMs > 0) {
            // Show countdown for delayed auto-advance
            const countdownSeconds = Math.ceil(delayMs / 1000);
            setAutoAdvanceCountdown(countdownSeconds);
            
            const countdownInterval = setInterval(() => {
              setAutoAdvanceCountdown(prev => {
                if (prev === null || prev <= 1) {
                  clearInterval(countdownInterval);
                  return null;
                }
                return prev - 1;
              });
            }, 1000);
            
            // Clear countdown when component unmounts or question changes
            return () => clearInterval(countdownInterval);
          } else {
            // No countdown for immediate auto-advance
            setAutoAdvanceCountdown(null);
          }
        }
      } else {
        setError('Failed to submit answer. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      console.error('Answer submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [session, showExplanation, isSubmitting, submitAnswer, currentIndex]);

  // Handle question navigation
  const handleQuestionChange = useCallback(() => {
    setShowExplanation(false);
    setError(null);
    setAutoAdvanceCountdown(null); // Reset countdown on question change
    
    // Check if current question is answered
    if (session && session.answers[currentIndex] !== null) {
      setShowExplanation(true);
    }
  }, [session, currentIndex]);

  // Listen for question changes
  useEffect(() => {
    handleQuestionChange();
  }, [currentIndex, handleQuestionChange]);

  // Handle quiz completion
  const handleCompleteQuiz = useCallback(async () => {
    if (!session) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate final score
      const correctAnswers = questions.reduce((count, question, index) => {
        const userAnswer = session.answers[index];
        return userAnswer === question.correctAnswer ? count + 1 : count;
      }, 0);

      const finalScore = Math.round((correctAnswers / questions.length) * 100);

      await completeSession(finalScore);
      onComplete();
      
      console.log(`🏁 Quiz completed with score: ${finalScore}%`);
    } catch (err) {
      setError('Failed to complete quiz. Please try again.');
      console.error('Quiz completion error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [session, questions, completeSession, onComplete]);

  // Handle quiz abandonment
  const handleAbandonQuiz = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to abandon this quiz? Your progress will be lost.'
    );
    
    if (confirmed) {
      await abandonSession('user_abandoned');
      onBack();
    }
  }, [abandonSession, onBack]);

  // Error state
  if (!session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No Active Session</h3>
              <p className="text-muted-foreground">
                No quiz session is currently active. Please start a new quiz.
              </p>
            </div>
            <Button onClick={onBack}>Back to Setup</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (questions.length === 0) {
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

  const currentQuestion = questions[currentIndex];
  const currentAnswer = session.answers[currentIndex];
  const hasAnswered = currentAnswer !== null && currentAnswer !== undefined;

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Question Not Found</h3>
              <p className="text-muted-foreground">
                Unable to load the current question.
              </p>
            </div>
            <Button onClick={onBack}>Back to Setup</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Controls */}
      <QuestionNavigation
        onAnswer={handleAnswerSelect}
        onComplete={handleCompleteQuiz}
        onAbandon={handleAbandonQuiz}
      />

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Card */}
      <Card className="border-0 shadow-custom-lg bg-gradient-to-br from-background to-muted/20">
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
          {/* Question Text */}
          <div className="prose prose-sm max-w-none">
            <div className="p-6 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border-l-4 border-primary">
              <p className="text-base leading-relaxed font-medium text-foreground m-0">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = showExplanation;
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
                buttonClass += "border-muted hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/2 hover:shadow-md hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered || isSubmitting}
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
          {showExplanation && (
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

              {/* Auto-advance countdown (only shown when there's a delay) */}
              {autoAdvanceCountdown !== null && session?.autoAdvanceConfig.enabled && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
                        <div className="absolute -inset-1 bg-blue-400/20 rounded-full animate-ping" />
                      </div>
                      <span className="text-sm font-semibold text-blue-900">Auto-Advance</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-bold tabular-nums">
                        {autoAdvanceCountdown}s
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 text-center mt-2">
                    {currentIndex < (session.questions.length - 1) 
                      ? `Automatically advancing to question ${currentIndex + 2}...` 
                      : 'Automatically completing quiz...'}
                  </p>
                </div>
              )}

              {/* Auto-advance immediate notification (for quick and timed modes without delay) */}
              {session?.autoAdvanceConfig.enabled && session.autoAdvanceConfig.delayMs === 0 && showExplanation && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Zap className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-green-900">
                        {session.mode === 'quick' ? 'Quick Quiz' : 'Timed Quiz'} Auto-Advance
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 text-center mt-2">
                    {currentIndex < (session.questions.length - 1) 
                      ? 'Answer selected! Moving to next question...' 
                      : 'Answer selected! Quiz will complete automatically...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};