import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import { useGetUserQuizHistory } from '../../services/convexQuiz';
import { useAppStore } from '../../store';

export const PerformanceChart: React.FC = () => {
  const { user } = useAppStore();
  const quizHistory = useGetUserQuizHistory(user?.id || '', 30); // Last 30 quizzes

  // Calculate performance metrics
  const performanceData = React.useMemo(() => {
    if (!quizHistory || quizHistory.length === 0) {
      return {
        averageScore: 0,
        trend: 0,
        categoryBreakdown: {},
        timeAnalysis: { average: 0, best: 0, worst: 0 },
        weeklyScores: [],
      };
    }

    // Sort by date
    const sortedHistory = [...quizHistory].sort((a, b) => 
      new Date(a._creationTime).getTime() - new Date(b._creationTime).getTime()
    );

    // Calculate average score
    const scores = sortedHistory.map(q => q.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Calculate trend (compare last 5 to previous 5)
    const recentScores = scores.slice(-5);
    const previousScores = scores.slice(-10, -5);
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const previousAvg = previousScores.length > 0 
      ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length 
      : recentAvg;
    const trend = Math.round(recentAvg - previousAvg);

    // Category breakdown
    const categoryBreakdown: Record<string, { total: number; correct: number; percentage: number }> = {};
    
    // Time analysis
    const times = sortedHistory.map(q => q.timeSpent);
    const timeAnalysis = {
      average: Math.round(times.reduce((a, b) => a + b, 0) / times.length / 60),
      best: Math.round(Math.min(...times) / 60),
      worst: Math.round(Math.max(...times) / 60),
    };

    // Weekly scores (last 4 weeks)
    const weeklyScores: { week: string; score: number; quizzes: number }[] = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      
      const weekQuizzes = sortedHistory.filter(q => {
        const date = new Date(q._creationTime);
        return date >= weekStart && date < weekEnd;
      });
      
      if (weekQuizzes.length > 0) {
        const weekScore = Math.round(
          weekQuizzes.reduce((sum, q) => sum + q.score, 0) / weekQuizzes.length
        );
        
        weeklyScores.unshift({
          week: `Week ${4 - i}`,
          score: weekScore,
          quizzes: weekQuizzes.length,
        });
      }
    }

    return {
      averageScore,
      trend,
      categoryBreakdown,
      timeAnalysis,
      weeklyScores,
    };
  }, [quizHistory]);

  return (
    <div className="grid gap-6">
      {/* Overall Performance */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.averageScore}%</div>
            <p className={`text-xs ${performanceData.trend > 0 ? 'text-green-600' : performanceData.trend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {performanceData.trend > 0 ? '+' : ''}{performanceData.trend}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizHistory?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData.timeAnalysis.average}m</div>
            <p className="text-xs text-muted-foreground">Per quiz</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${performanceData.trend > 0 ? 'text-green-600' : performanceData.trend < 0 ? 'text-red-600' : ''}`}>
              {performanceData.trend > 0 ? '↑' : performanceData.trend < 0 ? '↓' : '→'}
            </div>
            <p className="text-xs text-muted-foreground">Performance trend</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.weeklyScores.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{week.week}</span>
                  <span className="text-muted-foreground">{week.quizzes} quizzes</span>
                  <span className="font-medium">{week.score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${week.score}%` }}
                  />
                </div>
              </div>
            ))}
            {performanceData.weeklyScores.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No quiz data available yet. Start taking quizzes to see your progress!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance by Time */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Best Time</span>
                <span className="font-medium text-green-600">{performanceData.timeAnalysis.best}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Time</span>
                <span className="font-medium">{performanceData.timeAnalysis.average}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Worst Time</span>
                <span className="font-medium text-red-600">{performanceData.timeAnalysis.worst}m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceData.averageScore >= 80 ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Excellent!</strong> You're consistently scoring above 80%. Keep up the great work!
                  </p>
                </div>
              ) : performanceData.averageScore >= 70 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Good Progress!</strong> You're on track. Focus on weak areas to reach 80%+.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Keep Practicing!</strong> Review explanations and focus on understanding concepts.
                  </p>
                </div>
              )}
              
              {performanceData.trend > 0 && (
                <p className="text-sm text-muted-foreground">
                  📈 Your scores are improving! You've gained {performanceData.trend}% this week.
                </p>
              )}
              
              {performanceData.trend < 0 && (
                <p className="text-sm text-muted-foreground">
                  📉 Your scores have dropped {Math.abs(performanceData.trend)}% this week. Review recent topics.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};