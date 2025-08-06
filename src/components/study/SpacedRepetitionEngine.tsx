import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Brain, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calendar,
  BookOpen,
  Star,
  Flame,
  ArrowRight,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuestionPerformance {
  questionId: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  correctCount: number;
  lastAttempted: Date;
  averageTime: number;
  confidenceRatings: number[];
  isBookmarked: boolean;
}

interface SpacedRepetitionProps {
  questionHistory: QuestionPerformance[];
  onStartReview: (questionIds: string[]) => void;
  onScheduleChange?: (questionId: string, nextReview: Date) => void;
  className?: string;
}

interface ReviewQueue {
  due: QuestionPerformance[];
  upcoming: QuestionPerformance[];
  mastered: QuestionPerformance[];
  struggling: QuestionPerformance[];
}

// Spaced repetition intervals (in days)
const INTERVALS = {
  first_attempt: 1,
  second_attempt: 3,
  third_attempt: 7,
  fourth_attempt: 14,
  fifth_attempt: 30,
  mastered: 90
};

export const SpacedRepetitionEngine: React.FC<SpacedRepetitionProps> = ({
  questionHistory,
  onStartReview,
  onScheduleChange,
  className
}) => {
  const reviewQueue = useMemo((): ReviewQueue => {
    const now = new Date();
    const due: QuestionPerformance[] = [];
    const upcoming: QuestionPerformance[] = [];
    const mastered: QuestionPerformance[] = [];
    const struggling: QuestionPerformance[] = [];

    questionHistory.forEach(question => {
      const accuracy = question.attempts > 0 ? question.correctCount / question.attempts : 0;
      const avgConfidence = question.confidenceRatings.length > 0 
        ? question.confidenceRatings.reduce((sum, rating) => sum + rating, 0) / question.confidenceRatings.length 
        : 0;
      
      // Determine next review date based on performance
      const daysSinceLastAttempt = Math.floor((now.getTime() - question.lastAttempted.getTime()) / (1000 * 60 * 60 * 24));
      
      let nextInterval: number;
      if (accuracy >= 0.9 && avgConfidence >= 4 && question.attempts >= 3) {
        nextInterval = INTERVALS.mastered;
        mastered.push(question);
      } else if (accuracy < 0.5 || avgConfidence < 2) {
        nextInterval = INTERVALS.first_attempt;
        struggling.push(question);
      } else if (question.attempts === 1) {
        nextInterval = INTERVALS.second_attempt;
      } else if (question.attempts === 2) {
        nextInterval = INTERVALS.third_attempt;
      } else if (question.attempts === 3) {
        nextInterval = INTERVALS.fourth_attempt;
      } else {
        nextInterval = INTERVALS.fifth_attempt;
      }

      // Check if review is due
      if (daysSinceLastAttempt >= nextInterval) {
        due.push(question);
      } else {
        upcoming.push(question);
      }
    });

    // Sort due questions by priority (struggling > bookmarked > time since last attempt)
    due.sort((a, b) => {
      const aAccuracy = a.correctCount / a.attempts;
      const bAccuracy = b.correctCount / b.attempts;
      
      // Prioritize struggling questions
      if (aAccuracy < 0.5 && bAccuracy >= 0.5) return -1;
      if (bAccuracy < 0.5 && aAccuracy >= 0.5) return 1;
      
      // Then prioritize bookmarked
      if (a.isBookmarked && !b.isBookmarked) return -1;
      if (b.isBookmarked && !a.isBookmarked) return 1;
      
      // Then by time since last attempt
      return b.lastAttempted.getTime() - a.lastAttempted.getTime();
    });

    return { due, upcoming, mastered, struggling };
  }, [questionHistory]);

  const getReviewPriority = (question: QuestionPerformance): { 
    label: string; 
    color: string; 
    icon: React.ReactNode;
    urgency: 'high' | 'medium' | 'low';
  } => {
    const accuracy = question.attempts > 0 ? question.correctCount / question.attempts : 0;
    const avgConfidence = question.confidenceRatings.length > 0 
      ? question.confidenceRatings.reduce((sum, rating) => sum + rating, 0) / question.confidenceRatings.length 
      : 0;

    if (accuracy < 0.5 && question.attempts >= 2) {
      return {
        label: 'Needs Focus',
        color: 'text-red-700 bg-red-100 border-red-200',
        icon: <AlertCircle className="h-3 w-3" />,
        urgency: 'high'
      };
    } else if (accuracy < 0.7 || avgConfidence < 2.5) {
      return {
        label: 'Review Soon',
        color: 'text-orange-700 bg-orange-100 border-orange-200',
        icon: <Clock className="h-3 w-3" />,
        urgency: 'medium'
      };
    } else if (accuracy >= 0.9 && avgConfidence >= 4) {
      return {
        label: 'Mastered',
        color: 'text-green-700 bg-green-100 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />,
        urgency: 'low'
      };
    } else {
      return {
        label: 'Practice',
        color: 'text-blue-700 bg-blue-100 border-blue-200',
        icon: <Target className="h-3 w-3" />,
        urgency: 'medium'
      };
    }
  };

  const getDaysUntilNextReview = (question: QuestionPerformance): number => {
    const accuracy = question.attempts > 0 ? question.correctCount / question.attempts : 0;
    const avgConfidence = question.confidenceRatings.length > 0 
      ? question.confidenceRatings.reduce((sum, rating) => sum + rating, 0) / question.confidenceRatings.length 
      : 0;
    
    let interval: number;
    if (accuracy >= 0.9 && avgConfidence >= 4 && question.attempts >= 3) {
      interval = INTERVALS.mastered;
    } else if (accuracy < 0.5) {
      interval = INTERVALS.first_attempt;
    } else if (question.attempts === 1) {
      interval = INTERVALS.second_attempt;
    } else if (question.attempts === 2) {
      interval = INTERVALS.third_attempt;
    } else if (question.attempts === 3) {
      interval = INTERVALS.fourth_attempt;
    } else {
      interval = INTERVALS.fifth_attempt;
    }

    const daysSinceLastAttempt = Math.floor((Date.now() - question.lastAttempted.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, interval - daysSinceLastAttempt);
  };

  const formatNextReview = (daysUntil: number): string => {
    if (daysUntil === 0) return 'Due now';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `In ${daysUntil} days`;
    if (daysUntil <= 30) return `In ${Math.round(daysUntil / 7)} weeks`;
    return `In ${Math.round(daysUntil / 30)} months`;
  };

  if (questionHistory.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Study History Yet</h3>
            <p className="text-muted-foreground">
              Take some quizzes to build your personalized spaced repetition schedule.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">{reviewQueue.due.length}</div>
                <div className="text-sm text-red-600">Due Now</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-700">{reviewQueue.upcoming.length}</div>
                <div className="text-sm text-orange-600">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">{reviewQueue.mastered.length}</div>
                <div className="text-sm text-green-600">Mastered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-700">{reviewQueue.struggling.length}</div>
                <div className="text-sm text-purple-600">Struggling</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Button
          onClick={() => onStartReview(reviewQueue.due.map(q => q.questionId))}
          disabled={reviewQueue.due.length === 0}
          className="h-16 text-base"
          variant="gradient"
        >
          <Flame className="h-5 w-5 mr-2" />
          Review {reviewQueue.due.length} Due Questions
        </Button>

        <Button
          onClick={() => onStartReview(reviewQueue.struggling.map(q => q.questionId))}
          disabled={reviewQueue.struggling.length === 0}
          variant="outline"
          className="h-16 text-base border-red-200 hover:bg-red-50"
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          Focus on {reviewQueue.struggling.length} Weak Areas
        </Button>
      </div>

      {/* Due Questions Detail */}
      {reviewQueue.due.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Questions Due for Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewQueue.due.slice(0, 10).map((question) => {
                const priority = getReviewPriority(question);
                const accuracy = question.attempts > 0 ? Math.round((question.correctCount / question.attempts) * 100) : 0;
                
                return (
                  <div key={question.questionId} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate max-w-md">
                          {question.question.length > 100 
                            ? `${question.question.substring(0, 100)}...` 
                            : question.question}
                        </span>
                        {question.isBookmarked && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{question.category}</span>
                        <span>{question.difficulty}</span>
                        <span>{accuracy}% accuracy</span>
                        <span>{question.attempts} attempts</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'px-2 py-1 rounded-md text-xs font-medium border flex items-center gap-1',
                        priority.color
                      )}>
                        {priority.icon}
                        {priority.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {reviewQueue.due.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {reviewQueue.due.length - 10} more questions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reviewQueue.upcoming.slice(0, 5).map((question) => {
              const daysUntil = getDaysUntilNextReview(question);
              const accuracy = question.attempts > 0 ? Math.round((question.correctCount / question.attempts) * 100) : 0;
              
              return (
                <div key={question.questionId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-blue-900 truncate max-w-md">
                        {question.category} - {accuracy}% accuracy
                      </span>
                      {question.isBookmarked && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    </div>
                    <div className="text-xs text-blue-700">
                      {question.difficulty} • {question.attempts} attempts
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-600 font-medium">
                    {formatNextReview(daysUntil)}
                  </div>
                </div>
              );
            })}
            
            {reviewQueue.upcoming.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming reviews scheduled</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Spaced Repetition Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm">Review questions when they're due for optimal retention</p>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm">Focus extra time on questions you struggle with</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-sm">Bookmark questions you find particularly important</p>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                <p className="text-sm">Consistent daily practice is more effective than cramming</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};