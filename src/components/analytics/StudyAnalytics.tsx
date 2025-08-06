import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Clock, 
  BookOpen, 
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuizPerformance {
  id: string;
  score: number;
  timeSpent: number;
  mode: string;
  category: string;
  difficulty: string;
  createdAt: Date;
  confidenceRating?: number;
  isBookmarked?: boolean;
}

interface StudyAnalyticsProps {
  quizHistory: QuizPerformance[];
  className?: string;
}

interface TopicPerformance {
  category: string;
  attempts: number;
  averageScore: number;
  averageTime: number;
  averageConfidence: number;
  improvement: number;
  difficulty: string;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({ 
  quizHistory, 
  className 
}) => {
  const analytics = useMemo(() => {
    if (!quizHistory || quizHistory.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        averageTime: 0,
        averageConfidence: 0,
        improvementTrend: 0,
        strongestTopics: [],
        weakestTopics: [],
        studyStreak: 0,
        topicPerformance: [],
        weeklyProgress: [],
        recommendations: []
      };
    }

    // Basic stats
    const totalQuizzes = quizHistory.length;
    const averageScore = quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes;
    const averageTime = quizHistory.reduce((sum, quiz) => sum + quiz.timeSpent, 0) / totalQuizzes;
    const averageConfidence = quizHistory.reduce((sum, quiz) => sum + (quiz.confidenceRating || 0), 0) / totalQuizzes;

    // Improvement trend (last 5 vs first 5)
    const recentQuizzes = quizHistory.slice(-5);
    const earlyQuizzes = quizHistory.slice(0, 5);
    const recentAvg = recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / recentQuizzes.length;
    const earlyAvg = earlyQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / earlyQuizzes.length;
    const improvementTrend = recentAvg - earlyAvg;

    // Topic performance analysis
    const topicStats: { [key: string]: { scores: number[], times: number[], confidence: number[], difficulties: string[] } } = {};
    
    quizHistory.forEach(quiz => {
      if (!topicStats[quiz.category]) {
        topicStats[quiz.category] = { scores: [], times: [], confidence: [], difficulties: [] };
      }
      topicStats[quiz.category].scores.push(quiz.score);
      topicStats[quiz.category].times.push(quiz.timeSpent);
      topicStats[quiz.category].confidence.push(quiz.confidenceRating || 0);
      topicStats[quiz.category].difficulties.push(quiz.difficulty);
    });

    const topicPerformance: TopicPerformance[] = Object.entries(topicStats).map(([category, stats]) => {
      const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
      const avgTime = stats.times.reduce((a, b) => a + b, 0) / stats.times.length;
      const avgConfidence = stats.confidence.reduce((a, b) => a + b, 0) / stats.confidence.length;
      
      // Calculate improvement (first half vs second half)
      const midPoint = Math.floor(stats.scores.length / 2);
      const firstHalf = stats.scores.slice(0, midPoint);
      const secondHalf = stats.scores.slice(midPoint);
      const improvement = secondHalf.length > 0 
        ? (secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length) - (firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length)
        : 0;

      // Determine mastery level
      let masteryLevel: TopicPerformance['masteryLevel'] = 'beginner';
      if (avgScore >= 90 && avgConfidence >= 4) masteryLevel = 'expert';
      else if (avgScore >= 80 && avgConfidence >= 3) masteryLevel = 'advanced';
      else if (avgScore >= 70 && avgConfidence >= 2) masteryLevel = 'intermediate';

      // Most common difficulty
      const difficultyCount: { [key: string]: number } = {};
      stats.difficulties.forEach(d => difficultyCount[d] = (difficultyCount[d] || 0) + 1);
      const commonDifficulty = Object.keys(difficultyCount).reduce((a, b) => 
        difficultyCount[a] > difficultyCount[b] ? a : b
      );

      return {
        category,
        attempts: stats.scores.length,
        averageScore: avgScore,
        averageTime: avgTime,
        averageConfidence: avgConfidence,
        improvement,
        difficulty: commonDifficulty,
        masteryLevel
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    const strongestTopics = topicPerformance.slice(0, 3);
    const weakestTopics = topicPerformance.slice(-3).reverse();

    // Study streak calculation
    const today = new Date();
    let studyStreak = 0;
    const sortedHistory = [...quizHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    for (const quiz of sortedHistory) {
      const daysDiff = Math.floor((today.getTime() - new Date(quiz.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= studyStreak + 1) {
        studyStreak = Math.max(studyStreak, daysDiff + 1);
      } else {
        break;
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (averageScore < 70) {
      recommendations.push("Focus on reviewing explanations after each question");
    }
    if (averageConfidence < 2.5) {
      recommendations.push("Build confidence by practicing more questions in your strong areas first");
    }
    if (weakestTopics.length > 0) {
      recommendations.push(`Consider additional study in ${weakestTopics[0].category}`);
    }
    if (improvementTrend < 0) {
      recommendations.push("Review previous mistakes and focus on consistent practice");
    }
    if (studyStreak === 0) {
      recommendations.push("Establish a daily study routine for better retention");
    }

    return {
      totalQuizzes,
      averageScore,
      averageTime,
      averageConfidence,
      improvementTrend,
      strongestTopics,
      weakestTopics,
      studyStreak,
      topicPerformance,
      recommendations
    };
  }, [quizHistory]);

  const getMasteryColor = (level: TopicPerformance['masteryLevel']) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'beginner': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (quizHistory.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Study Data Yet</h3>
            <p className="text-muted-foreground">
              Complete some quizzes to see your detailed analytics and personalized insights.
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
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(analytics.averageScore)}%</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics.improvementTrend > 0 ? '+' : ''}{Math.round(analytics.improvementTrend)}%
                </div>
                <div className="text-sm text-muted-foreground">Improvement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.averageConfidence.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.studyStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Topic Mastery Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topicPerformance.map((topic, index) => (
              <div key={topic.category} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{topic.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {topic.attempts} attempts • Avg {Math.round(topic.averageScore)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'px-2 py-1 rounded-md text-xs font-medium border',
                    getMasteryColor(topic.masteryLevel)
                  )}>
                    {topic.masteryLevel}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {topic.improvement > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      topic.improvement > 0 ? 'text-green-600' : 'text-orange-600'
                    )}>
                      {topic.improvement > 0 ? '+' : ''}{Math.round(topic.improvement)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.strongestTopics.map((topic, index) => (
                <div key={topic.category} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <div className="font-medium text-green-900">{topic.category}</div>
                    <div className="text-sm text-green-700">
                      {Math.round(topic.averageScore)}% accuracy • {topic.attempts} attempts
                    </div>
                  </div>
                  <Award className="h-5 w-5 text-green-600" />
                </div>
              ))}
              {analytics.strongestTopics.length === 0 && (
                <p className="text-muted-foreground text-sm">Complete more quizzes to identify your strengths.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.weakestTopics.map((topic, index) => (
                <div key={topic.category} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div>
                    <div className="font-medium text-orange-900">{topic.category}</div>
                    <div className="text-sm text-orange-700">
                      {Math.round(topic.averageScore)}% accuracy • {topic.attempts} attempts
                    </div>
                  </div>
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
              ))}
              {analytics.weakestTopics.length === 0 && (
                <p className="text-muted-foreground text-sm">Great job! No weak areas identified yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personalized Study Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900">{rec}</p>
              </div>
            ))}
            {analytics.recommendations.length === 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-900">
                  Great job! Keep up your current study pattern.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};