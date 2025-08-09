import React from 'react';
import { Loader2, Brain, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent } from './Card';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn(
      'animate-spin text-blue-600',
      sizes[size],
      className
    )} />
  );
};

interface QuizLoadingProps {
  message?: string;
  step?: 'preparing' | 'loading' | 'starting';
}

export const QuizLoading: React.FC<QuizLoadingProps> = ({ 
  message = 'Preparing your quiz...', 
  step = 'preparing' 
}) => {
  const stepIcons = {
    preparing: Brain,
    loading: BookOpen,
    starting: Clock
  };

  const StepIcon = stepIcons[step];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <div className="h-16 w-16 bg-blue-100 rounded-full"></div>
        </div>
        <div className="relative h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
          <StepIcon className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
        <div className="flex space-x-1 justify-center">
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'text' }) => {
  const variants = {
    text: 'h-4 rounded',
    card: 'h-32 rounded-lg',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 rounded-md'
  };

  return (
    <div className={cn(
      'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
      'bg-animate-shimmer',
      variants[variant],
      className
    )} />
  );
};

export const QuestionCardSkeleton: React.FC = () => {
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
      
      <div className="space-y-3 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <div className="w-4 h-4 border border-gray-300 rounded"></div>
            <Skeleton variant="text" className={`w-${['full', '5/6', '4/5', '3/4'][i - 1]}`} />
          </div>
        ))}
      </div>
      
      <div className="flex justify-between pt-4">
        <Skeleton variant="button" className="w-20" />
        <Skeleton variant="button" className="w-24" />
      </div>
    </Card>
  );
};

interface ProgressSkeletonProps {
  steps?: number;
}

export const ProgressSkeleton: React.FC<ProgressSkeletonProps> = ({ steps = 5 }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-32" />
        <Skeleton variant="text" className="w-16" />
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full w-1/3 animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: steps }).map((_, i) => (
          <div key={i} className={cn(
            "h-8 rounded border-2",
            i < 2 ? "bg-blue-100 border-blue-300" : "bg-gray-100 border-gray-300"
          )}>
            <Skeleton className="h-full w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface TransitionScreenProps {
  type: 'quiz-starting' | 'question-loading' | 'submitting-answer' | 'quiz-complete';
  message?: string;
  children?: React.ReactNode;
}

export const TransitionScreen: React.FC<TransitionScreenProps> = ({ 
  type, 
  message,
  children 
}) => {
  const configs = {
    'quiz-starting': {
      icon: Clock,
      title: 'Quiz Starting...',
      message: message || 'Get ready to test your knowledge!',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    'question-loading': {
      icon: BookOpen,
      title: 'Loading Question...',
      message: message || 'Preparing your next challenge',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    'submitting-answer': {
      icon: Brain,
      title: 'Processing...',
      message: message || 'Checking your answer',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    'quiz-complete': {
      icon: Clock,
      title: 'Finalizing Results...',
      message: message || 'Calculating your performance',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className={cn('p-8 max-w-md mx-4', config.bgColor)}>
        <CardContent className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 animate-ping">
              <div className={cn('h-full w-full rounded-full opacity-30', config.bgColor)}></div>
            </div>
            <div className={cn('relative h-full w-full rounded-full flex items-center justify-center', config.bgColor)}>
              <Icon className={cn('h-10 w-10 animate-pulse', config.color)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
            <p className="text-gray-600">{config.message}</p>
          </div>

          {children && (
            <div className="pt-4">
              {children}
            </div>
          )}

          <div className="flex space-x-1 justify-center">
            <div className={cn('h-2 w-2 rounded-full animate-bounce', config.color.replace('text-', 'bg-'))}></div>
            <div className={cn('h-2 w-2 rounded-full animate-bounce', config.color.replace('text-', 'bg-'))} style={{ animationDelay: '0.1s' }}></div>
            <div className={cn('h-2 w-2 rounded-full animate-bounce', config.color.replace('text-', 'bg-'))} style={{ animationDelay: '0.2s' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};