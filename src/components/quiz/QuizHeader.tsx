import React from 'react';
import { Button } from '../ui/Button';
import { ArrowLeft, Clock } from 'lucide-react';

interface QuizHeaderProps {
  mode: 'quick' | 'timed' | 'custom';
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining?: number | null;
  onBack: () => void;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  mode,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  onBack,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-background to-muted/30 rounded-2xl border shadow-custom animate-in" role="banner">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack} 
          className="hover:bg-primary/10 transition-colors duration-200"
          aria-label="Go back to quiz selection"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Question {currentQuestion} of {totalQuestions}
          </h1>
          <p className="text-muted-foreground capitalize font-medium">{mode} Quiz</p>
        </div>
      </div>
      
      {timeRemaining !== null && timeRemaining !== undefined && (
        <div 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            timeRemaining < 60 
              ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
              : 'bg-muted border'
          }`}
          role="timer"
          aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
          aria-live="polite"
        >
          <Clock className="h-4 w-4" />
          <span className={`font-mono font-bold ${timeRemaining < 60 ? 'text-red-600' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      )}
    </div>
  );
};