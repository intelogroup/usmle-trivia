/**
 * QuestionNavigation - Enhanced navigation controls for quiz questions
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Flag,
  RotateCcw,
  FastForward 
} from 'lucide-react';
import { useQuizNavigation, useQuizSession, useQuizTimer } from '../../hooks/useQuizSession';

interface QuestionNavigationProps {
  onAnswer?: (answerIndex: number) => void;
  onComplete?: () => void;
  onAbandon?: () => void;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  onAnswer,
  onComplete,
  onAbandon,
}) => {
  const { session } = useQuizSession();
  const { 
    currentIndex, 
    canGoNext, 
    canGoPrevious, 
    goToNext, 
    goToPrevious, 
    goToQuestion 
  } = useQuizNavigation();

  const { timeRemaining, formatTime, isTimerActive } = useQuizTimer();

  if (!session) return null;

  const currentAnswer = session.answers[currentIndex];
  const hasAnswered = currentAnswer !== null && currentAnswer !== undefined;
  const totalQuestions = session.questions.length;
  const questionsAttempted = session.answers.filter(answer => answer !== null).length;
  const progressPercent = Math.round((questionsAttempted / totalQuestions) * 100);

  const handlePrevious = () => {
    if (canGoPrevious) {
      goToPrevious();
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      goToNext();
    }
  };

  const handleQuestionSelect = (questionIndex: number) => {
    goToQuestion(questionIndex);
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Question Counter */}
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-primary">
                Question {currentIndex + 1} of {totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground">
                {questionsAttempted}/{totalQuestions} attempted ({progressPercent}%)
              </div>
            </div>

            {/* Timer (if applicable) */}
            {isTimerActive && timeRemaining !== null && (
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
                timeRemaining < 60 
                  ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
                  : timeRemaining < 300
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                <FastForward className="h-4 w-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-500 ease-out"
                style={{ width: `${(questionsAttempted / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <Button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {/* Question Status Indicators */}
        <div className="flex items-center space-x-1 max-w-md overflow-x-auto">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const isAnswered = session.answers[index] !== null;
            const isCurrent = index === currentIndex;

            return (
              <button
                key={index}
                onClick={() => handleQuestionSelect(index)}
                className={`
                  relative min-w-[2.5rem] h-10 rounded-lg border-2 text-xs font-medium
                  transition-all duration-200 hover:scale-105
                  ${isCurrent 
                    ? 'border-primary bg-primary text-white shadow-md' 
                    : isAnswered
                      ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                      : 'border-muted bg-background text-muted-foreground hover:border-primary/50'
                  }
                `}
                title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ' (Not answered)'}`}
              >
                <span className="relative z-10">{index + 1}</span>
                {isAnswered && !isCurrent && (
                  <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next/Complete Button - Hidden for auto-advance modes (quick and timed) */}
        {session.autoAdvanceConfig.enabled && session.autoAdvanceConfig.skipToNext ? (
          // Show completion button only for the last question in auto-advance modes
          !canGoNext ? (
            <Button
              onClick={onComplete}
              variant="default"
              size="sm"
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Complete Quiz</span>
            </Button>
          ) : (
            // Placeholder to maintain layout balance in auto-advance modes
            <div className="w-16" />
          )
        ) : (
          // Standard navigation for manual modes (custom)
          canGoNext ? (
            <Button
              onClick={handleNext}
              variant="default"
              size="sm"
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              variant="default"
              size="sm"
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Complete Quiz</span>
            </Button>
          )
        )}
      </div>

      {/* Additional Actions */}
      <div className="flex items-center justify-between text-sm">
        {/* Current Question Status */}
        <div className="flex items-center space-x-2 text-muted-foreground">
          {hasAnswered ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Question answered</span>
            </>
          ) : (
            <>
              <Circle className="h-4 w-4" />
              <span>Select an answer</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAbandon}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Abandon
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Quick question overview for large question sets
 */
export const QuestionOverview: React.FC = () => {
  const { session } = useQuizSession();
  const { goToQuestion, currentIndex } = useQuizNavigation();

  if (!session || session.questions.length <= 10) return null;

  const groupedQuestions = [];
  for (let i = 0; i < session.questions.length; i += 5) {
    groupedQuestions.push(session.questions.slice(i, i + 5));
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-3">Question Overview</h3>
        <div className="space-y-2">
          {groupedQuestions.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground w-8">
                {groupIndex * 5 + 1}-{Math.min((groupIndex + 1) * 5, session.questions.length)}
              </span>
              <div className="flex space-x-1">
                {group.map((_, questionIndex) => {
                  const globalIndex = groupIndex * 5 + questionIndex;
                  const isAnswered = session.answers[globalIndex] !== null;
                  const isCurrent = globalIndex === currentIndex;

                  return (
                    <button
                      key={globalIndex}
                      onClick={() => goToQuestion(globalIndex)}
                      className={`
                        w-6 h-6 rounded text-xs font-medium transition-all
                        ${isCurrent 
                          ? 'bg-primary text-white' 
                          : isAnswered
                            ? 'bg-green-200 text-green-800'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }
                      `}
                    >
                      {globalIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};