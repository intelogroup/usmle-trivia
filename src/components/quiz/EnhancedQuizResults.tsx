import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Home, 
  RotateCcw, 
  BookOpen,
  Brain,
  Clock,
  Star,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Lightbulb,
  Calendar,
  BarChart3
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { QuizSession } from '../../services/quiz';

interface EnhancedQuizResultsProps {
  session: QuizSession;
  onHome: () => void;
  onRetry: () => void;
  onReview?: () => void;
  questionsData?: any[];
  confidenceRatings?: { [questionId: string]: number };
  bookmarkedQuestions?: string[];
}

interface QuestionAnalysis {
  questionId: string;
  isCorrect: boolean;
  userAnswer: number | null;
  correctAnswer: number;
  confidenceRating: number;
  isBookmarked: boolean;
  category: string;
  difficulty: string;
  timeSpent?: number;
}

export const EnhancedQuizResults: React.FC<EnhancedQuizResultsProps> = ({ 
  session, 
  onHome, 
  onRetry, 
  onReview,
  questionsData = [],
  confidenceRatings = {},
  bookmarkedQuestions = []
}) => {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const totalQuestions = session.questions.length;
  const answeredQuestions = session.answers.filter(answer => answer !== null).length;
  const correctAnswersCount = Math.round((session.score / 100) * totalQuestions);
  const incorrectAnswersCount = answeredQuestions - correctAnswersCount;
  const timeSpentMinutes = Math.floor(session.timeSpent / 60);
  const timeSpentSeconds = session.timeSpent % 60;
  const avgTimePerQuestion = Math.round(session.timeSpent / totalQuestions);

  // Calculate confidence metrics
  const avgConfidence = Object.values(confidenceRatings).length > 0
    ? Object.values(confidenceRatings).reduce((sum, rating) => sum + rating, 0) / Object.values(confidenceRatings).length
    : 0;

  // Analyze question performance
  const questionAnalysis: QuestionAnalysis[] = questionsData.map((question, index) => ({
    questionId: question.id,
    isCorrect: session.answers[index] === question.correctAnswer,
    userAnswer: session.answers[index],
    correctAnswer: question.correctAnswer,
    confidenceRating: confidenceRatings[question.id] || 0,
    isBookmarked: bookmarkedQuestions.includes(question.id),
    category: question.category,
    difficulty: question.difficulty,
    timeSpent: session.timeSpent / totalQuestions // Simplified - would need individual tracking
  }));

  // Category performance analysis
  const categoryPerformance = questionsData.reduce((acc: any, question, index) => {
    const category = question.category;
    if (!acc[category]) {
      acc[category] = { correct: 0, total: 0, confidence: [], difficulties: [] };
    }
    acc[category].total += 1;
    if (session.answers[index] === question.correctAnswer) {
      acc[category].correct += 1;
    }
    if (confidenceRatings[question.id]) {
      acc[category].confidence.push(confidenceRatings[question.id]);
    }
    acc[category].difficulties.push(question.difficulty);
    return acc;
  }, {});

  // Performance messaging
  const getPerformanceMessage = (score: number): { 
    message: string; 
    color: string; 
    icon: React.ReactNode;
    advice: string;
  } => {
    if (score >= 90) {
      return {
        message: "Outstanding Performance!",
        color: "text-green-600",
        icon: <Trophy className="h-6 w-6 text-yellow-500" />,
        advice: "You're mastering this material excellently. Consider challenging yourself with harder questions or exploring advanced topics."
      };
    } else if (score >= 80) {
      return {
        message: "Great Work!",
        color: "text-blue-600", 
        icon: <Target className="h-6 w-6 text-blue-500" />,
        advice: "You have a solid understanding. Review the questions you missed to reach mastery level."
      };
    } else if (score >= 70) {
      return {
        message: "Good Progress!",
        color: "text-orange-600",
        icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
        advice: "You're on the right track. Focus on reviewing explanations and practicing more in your weak areas."
      };
    } else {
      return {
        message: "Keep Learning!",
        color: "text-purple-600",
        icon: <RotateCcw className="h-6 w-6 text-purple-500" />,
        advice: "Don't get discouraged! Review the explanations carefully and practice more questions to improve."
      };
    }
  };

  const performance = getPerformanceMessage(session.score);

  // Confidence vs Performance Analysis
  const getConfidenceInsight = () => {
    if (avgConfidence === 0) return null;

    const confidenceDiff = avgConfidence - (session.score / 20); // Convert score to 1-5 scale
    
    if (confidenceDiff > 1) {
      return {
        type: 'overconfident',
        message: "You were more confident than your performance suggests. This is normal when learning!",
        icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
        color: 'text-orange-700'
      };
    } else if (confidenceDiff < -1) {
      return {
        type: 'underconfident',
        message: "You performed better than you expected! Build confidence in your knowledge.",
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        color: 'text-green-700'
      };
    } else {
      return {
        type: 'calibrated',
        message: "Your confidence aligns well with your performance. Great self-awareness!",
        icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
        color: 'text-blue-700'
      };
    }
  };

  const confidenceInsight = getConfidenceInsight();

  return (
    <div className="space-y-6">
      {/* Header with Performance */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          {performance.icon}
        </div>
        <h1 className="text-3xl font-bold">Quiz Complete!</h1>
        <p className="text-muted-foreground capitalize">{session.mode} Quiz • {totalQuestions} Questions</p>
        
        {/* Main Score Display */}
        <div className="relative">
          <div className="text-6xl font-bold text-primary mb-2">
            {session.score}%
          </div>
          <p className={cn("text-lg font-medium", performance.color)}>
            {performance.message}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{correctAnswersCount}</div>
            <div className="text-sm text-green-600">Correct</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 text-center">
            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">{incorrectAnswersCount}</div>
            <div className="text-sm text-red-600">Incorrect</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{avgTimePerQuestion}s</div>
            <div className="text-sm text-blue-600">Avg/Question</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4 text-center">
            <Brain className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{avgConfidence.toFixed(1)}</div>
            <div className="text-sm text-purple-600">Avg Confidence</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Visualization */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Overall Accuracy</span>
              <span className="font-medium">{session.score}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full transition-all duration-1000 relative"
                style={{ width: `${session.score}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Confidence Analysis */}
          {confidenceInsight && (
            <div className="p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {confidenceInsight.icon}
                <span className="font-medium">Confidence Insight</span>
              </div>
              <p className={cn("text-sm", confidenceInsight.color)}>
                {confidenceInsight.message}
              </p>
            </div>
          )}

          {/* Time Analysis */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Total Time</div>
              <div className="text-2xl font-bold text-blue-600">
                {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Completed At</div>
              <div className="text-sm text-muted-foreground">
                {session.completedAt ? new Date(session.completedAt).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      {Object.keys(categoryPerformance).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categoryPerformance).map(([category, perf]: [string, any]) => {
                const accuracy = Math.round((perf.correct / perf.total) * 100);
                const avgCategoryConfidence = perf.confidence.length > 0 
                  ? (perf.confidence.reduce((a: number, b: number) => a + b, 0) / perf.confidence.length).toFixed(1)
                  : '0.0';

                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-semibold">{category}</div>
                      <div className="text-sm text-muted-foreground">
                        {perf.correct}/{perf.total} correct • {avgCategoryConfidence} confidence
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        accuracy >= 80 ? "bg-green-100 text-green-800" :
                        accuracy >= 60 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {accuracy}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Advice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personalized Study Advice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-900">{performance.advice}</p>
            </div>

            {/* Specific recommendations based on performance */}
            <div className="grid gap-3">
              {bookmarkedQuestions.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-900">
                    You bookmarked {bookmarkedQuestions.length} questions for review. Don't forget to revisit them!
                  </p>
                </div>
              )}

              {session.score < 70 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-900">
                    Focus on understanding the explanations rather than memorizing answers.
                  </p>
                </div>
              )}

              {avgConfidence < 2.5 && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-purple-900">
                    Work on building confidence by practicing more questions in your strong areas first.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          onClick={onRetry} 
          className="h-12 hover:bg-primary/5 hover:border-primary/50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        
        {onReview && (
          <Button 
            variant="outline" 
            onClick={onReview} 
            className="h-12 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Review Answers
          </Button>
        )}
        
        <Button 
          onClick={onHome} 
          className="h-12"
          variant="gradient"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Session Details (Collapsible) */}
      <Card>
        <CardHeader className="pb-3">
          <button
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle className="text-sm">Session Details</CardTitle>
            <ArrowRight className={cn(
              "h-4 w-4 transition-transform duration-200",
              showDetailedAnalysis && "rotate-90"
            )} />
          </button>
        </CardHeader>
        
        {showDetailedAnalysis && (
          <CardContent className="pt-0">
            <div className="text-xs text-muted-foreground space-y-2 grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium">Session Info</div>
                <div>ID: {session.id}</div>
                <div>Mode: {session.mode}</div>
                <div>Status: {session.status}</div>
              </div>
              <div>
                <div className="font-medium">Timing</div>
                <div>Started: {new Date(session.createdAt).toLocaleString()}</div>
                <div>Duration: {timeSpentMinutes}m {timeSpentSeconds}s</div>
                <div>Avg per Q: {avgTimePerQuestion}s</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};