import React from 'react';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  hasAnswered: boolean;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  hasAnswered,
}) => {
  const progress = ((currentQuestion + (hasAnswered ? 1 : 0)) / totalQuestions) * 100;

  return (
    <div 
      className="relative" 
      role="progressbar" 
      aria-label="Quiz progress" 
      aria-valuenow={Math.round(progress)} 
      aria-valuemin={0} 
      aria-valuemax={100}
    >
      <div className="w-full bg-muted/50 rounded-full h-3 shadow-inner">
        <div 
          className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-muted-foreground font-medium">Progress</span>
        <span className="text-xs text-muted-foreground font-medium" aria-live="polite">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};