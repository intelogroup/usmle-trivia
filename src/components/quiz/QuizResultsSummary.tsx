/**
 * QuizResultsSummary - Comprehensive results display with performance analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Award, 
  Trophy, 
  Target, 
  Clock, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  BookOpen,
  Download,
  Share2,
  RefreshCw,
  Home
} from 'lucide-react';
import { QuizSessionData } from '../../services/QuizSessionManager';
import { Question } from '../../services/quiz';

interface QuizResultsSummaryProps {
  session: QuizSessionData;
  questions: Question[];
  onSaveResults: (results: QuizResults) => Promise<boolean>;
  onStartNewQuiz: () => void;
  onBackToDashboard: () => void;
  onUnmountSession: () => void;
}

interface QuizResults {
  sessionId: string;
  userId: string;
  mode: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  completionRate: number;
  performanceMetrics: {
    accuracy: number;
    speed: number;
    consistency: number;
    strengthAreas: string[];
    improvementAreas: string[];
  };
  questionBreakdown: Array<{
    questionId: string;
    category: string;
    difficulty: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    timeSpent?: number;
  }>;
  timestamp: Date;
  autoAdvanceCount?: number;
}

export const QuizResultsSummary: React.FC<QuizResultsSummaryProps> = ({
  session,
  questions,
  onSaveResults,
  onStartNewQuiz,
  onBackToDashboard,
  onUnmountSession
}) => {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate comprehensive results
  useEffect(() => {
    if (session && questions.length > 0) {
      const correctAnswers = questions.reduce((count, question, index) => {
        const userAnswer = session.answers[index];
        return userAnswer === question.correctAnswer ? count + 1 : count;
      }, 0);

      const incorrectAnswers = session.metadata.questionsAttempted - correctAnswers;
      const score = Math.round((correctAnswers / questions.length) * 100);
      const completionRate = Math.round((session.metadata.questionsAttempted / questions.length) * 100);

      // Calculate performance metrics
      const accuracy = (correctAnswers / session.metadata.questionsAttempted) * 100;
      const averageSpeed = session.metadata.averageTimePerQuestion;
      
      // Analyze performance by category
      const categoryStats = new Map<string, { correct: number; total: number }>();
      const questionBreakdown = questions.map((question, index) => {
        const userAnswer = session.answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        // Track category performance
        const categoryKey = question.category;
        if (!categoryStats.has(categoryKey)) {
          categoryStats.set(categoryKey, { correct: 0, total: 0 });
        }
        const catStat = categoryStats.get(categoryKey)!;
        catStat.total++;
        if (isCorrect) catStat.correct++;

        return {
          questionId: question.id,
          category: question.category,
          difficulty: question.difficulty,
          userAnswer: userAnswer ?? -1,
          correctAnswer: question.correctAnswer,
          isCorrect,
          timeSpent: averageSpeed, // Simplified for now
        };
      });

      // Identify strengths and improvement areas
      const strengthAreas: string[] = [];
      const improvementAreas: string[] = [];
      
      categoryStats.forEach((stats, category) => {
        const percentage = (stats.correct / stats.total) * 100;
        if (percentage >= 75) {
          strengthAreas.push(`${category} (${Math.round(percentage)}%)`);
        } else if (percentage < 50) {
          improvementAreas.push(`${category} (${Math.round(percentage)}%)`);
        }
      });

      const calculatedResults: QuizResults = {
        sessionId: session.sessionId,
        userId: session.userId,
        mode: session.mode,
        score,
        totalQuestions: questions.length,
        correctAnswers,
        incorrectAnswers,
        timeSpent: session.timeSpent,
        averageTimePerQuestion: session.metadata.averageTimePerQuestion,
        completionRate,
        performanceMetrics: {
          accuracy: Math.round(accuracy),
          speed: Math.round(60 / averageSpeed), // questions per minute
          consistency: Math.round(Math.max(0, 100 - (Math.abs(accuracy - score) * 2))),
          strengthAreas,
          improvementAreas,
        },
        questionBreakdown,
        timestamp: new Date(),
        autoAdvanceCount: session.metadata.autoAdvanceCount,
      };

      setResults(calculatedResults);
      console.log('📊 Quiz results calculated:', calculatedResults);
    }
  }, [session, questions]);

  // Handle saving results to backend
  const handleSaveResults = useCallback(async () => {
    if (!results) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const success = await onSaveResults(results);
      if (success) {
        setSaveSuccess(true);
        console.log('✅ Quiz results saved successfully');
      } else {
        setSaveError('Failed to save results to database');
      }
    } catch (error) {
      setSaveError('An error occurred while saving results');
      console.error('Results save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [results, onSaveResults]);

  // Handle session cleanup and navigation
  const handleFinish = useCallback(() => {
    onUnmountSession();
    onBackToDashboard();
  }, [onUnmountSession, onBackToDashboard]);

  const handleNewQuiz = useCallback(() => {
    onUnmountSession();
    onStartNewQuiz();
  }, [onUnmountSession, onStartNewQuiz]);

  if (!results) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Calculating quiz results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-8 w-8 text-gold-500" />;
    if (score >= 60) return <Award className="h-8 w-8 text-blue-500" />;
    return <Target className="h-8 w-8 text-amber-500" />;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card className="border-0 shadow-custom-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            {getPerformanceIcon(results.score)}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground mb-2">
            Quiz Complete!
          </CardTitle>
          <div className="flex items-center justify-center gap-4">
            <div className={`px-4 py-2 rounded-full border text-sm font-semibold ${getScoreColor(results.score)}`}>
              Score: {results.score}%
            </div>
            <div className="px-4 py-2 rounded-full border bg-muted text-muted-foreground text-sm font-medium">
              {session.mode} Quiz
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{results.performanceMetrics.accuracy}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{formatTime(results.timeSpent)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{results.correctAnswers}/{results.totalQuestions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold">{Math.round(results.averageTimePerQuestion)}s</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        {results.performanceMetrics.strengthAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.performanceMetrics.strengthAreas.map((area, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {area}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas for Improvement */}
        {results.performanceMetrics.improvementAreas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.performanceMetrics.improvementAreas.map((area, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {area}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Auto-advance Info for Quick Quiz */}
      {results.autoAdvanceCount && results.autoAdvanceCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Quick Quiz Mode</p>
                <p className="text-xs text-blue-700">
                  Auto-advanced {results.autoAdvanceCount} time{results.autoAdvanceCount !== 1 ? 's' : ''} for faster completion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Results Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Save Your Results</h3>
            <p className="text-sm text-muted-foreground">
              Save your quiz performance to track your progress over time
            </p>
            
            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}
            
            {saveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Results saved successfully!
                </p>
              </div>
            )}

            <Button 
              onClick={handleSaveResults}
              disabled={isSaving || saveSuccess}
              className="min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Save Results
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={handleNewQuiz}
          className="min-w-[140px]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          New Quiz
        </Button>
        <Button 
          onClick={handleFinish}
          className="min-w-[140px]"
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
    </div>
  );
};