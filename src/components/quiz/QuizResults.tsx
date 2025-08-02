import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Trophy, Target, TrendingUp, Home, RotateCcw } from 'lucide-react';
import type { QuizSession } from '../../services/quiz';

interface QuizResultsProps {
  session: QuizSession;
  onHome: () => void;
  onRetry: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ session, onHome, onRetry }) => {
  const totalQuestions = session.questions.length;
  const answeredQuestions = session.answers.filter(answer => answer !== null).length;
  // Calculate correct answers from the score
  const correctAnswersCount = Math.round((session.score / 100) * totalQuestions);
  
  const accuracy = correctAnswersCount;
  const timeSpentMinutes = Math.floor(session.timeSpent / 60);
  const timeSpentSeconds = session.timeSpent % 60;

  // Performance messaging
  const getPerformanceMessage = (score: number): { message: string; color: string; icon: React.ReactNode } => {
    if (score >= 90) {
      return {
        message: "Outstanding! You're mastering this material!",
        color: "text-green-600",
        icon: <Trophy className="h-6 w-6 text-yellow-500" />
      };
    } else if (score >= 80) {
      return {
        message: "Great work! You have a solid understanding.",
        color: "text-blue-600", 
        icon: <Target className="h-6 w-6 text-blue-500" />
      };
    } else if (score >= 70) {
      return {
        message: "Good progress! Keep studying to improve.",
        color: "text-orange-600",
        icon: <TrendingUp className="h-6 w-6 text-orange-500" />
      };
    } else {
      return {
        message: "Keep going! Review the explanations and try again.",
        color: "text-purple-600",
        icon: <RotateCcw className="h-6 w-6 text-purple-500" />
      };
    }
  };

  const performance = getPerformanceMessage(session.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          {performance.icon}
        </div>
        <h1 className="text-3xl font-bold">Quiz Complete!</h1>
        <p className="text-muted-foreground capitalize">{session.mode} Quiz Results</p>
      </div>

      {/* Score Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary">
            {session.score}%
          </CardTitle>
          <p className={`text-lg font-medium ${performance.color}`}>
            {performance.message}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{accuracy}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - accuracy}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">{answeredQuestions}</div>
              <div className="text-sm text-muted-foreground">Answered</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-600">
                {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Accuracy Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Accuracy</span>
              <span className="font-medium">{session.score}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${session.score}%` }}
              />
            </div>
          </div>

          {/* Quiz Mode Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm font-medium">Quiz Mode</div>
              <div className="text-muted-foreground capitalize">{session.mode}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Questions</div>
              <div className="text-muted-foreground">{totalQuestions} total</div>
            </div>
          </div>

          {/* Time Analysis */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Average per Question</div>
              <div className="text-muted-foreground">
                {Math.round(session.timeSpent / totalQuestions)}s
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Completed At</div>
              <div className="text-muted-foreground">
                {session.completedAt ? new Date(session.completedAt).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Study Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {session.score < 70 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Focus Areas:</strong> Review the question explanations and consider studying 
                  the topics where you missed questions. Practice more questions in those categories.
                </p>
              </div>
            )}
            
            {session.score >= 70 && session.score < 85 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Good Progress:</strong> You're on the right track! Review any missed questions 
                  and continue practicing to reach mastery level.
                </p>
              </div>
            )}
            
            {session.score >= 85 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Excellent Work:</strong> You demonstrate strong knowledge in this area. 
                  Consider challenging yourself with harder questions or exploring related topics.
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Regular practice with spaced repetition is key to long-term retention. 
              Try to quiz yourself on these topics again in a few days.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" onClick={onRetry} className="h-12">
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button onClick={onHome} className="h-12">
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Session Details */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm">Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Session ID: {session.id}</div>
            <div>Started: {new Date(session.createdAt).toLocaleString()}</div>
            <div>Mode: {session.mode}</div>
            <div>Status: {session.status}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};