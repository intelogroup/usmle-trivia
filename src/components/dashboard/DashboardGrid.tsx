import React from 'react';
import { Trophy, Target, TrendingUp, Flame } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { QuizModeSelector } from './QuizModeSelector';
import { WelcomeBanner } from './WelcomeBanner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppStore } from '../../store';
import { useGetUserQuizHistory } from '../../services/convexQuiz';
import { useGetLeaderboard } from '../../services/convexAuth';
import { useNavigate } from 'react-router-dom';

export const DashboardGrid: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  
  // Fetch user quiz history
  const quizHistory = useGetUserQuizHistory(user?.id || '', 10);
  
  // Fetch leaderboard
  const leaderboard = useGetLeaderboard(5);
  
  // Calculate user stats from quiz history
  const userStats = React.useMemo(() => {
    if (!user) {
      return {
        totalPoints: 0,
        quizzesCompleted: 0,
        accuracy: 0,
        currentStreak: 0,
        weeklyProgress: 0,
        timeSpent: 0,
        achievements: 0,
        topicsCompleted: 0,
      };
    }
    
    const completedQuizzes = quizHistory?.filter(q => q.status === 'completed') || [];
    const totalQuizzes = completedQuizzes.length;
    const totalTime = completedQuizzes.reduce((sum, q) => sum + q.timeSpent, 0);
    
    // Calculate streak (simplified - in production would check consecutive days)
    const today = new Date();
    const lastQuiz = completedQuizzes[0];
    const daysSinceLastQuiz = lastQuiz 
      ? Math.floor((today.getTime() - new Date(lastQuiz._creationTime).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const streak = daysSinceLastQuiz <= 1 ? user.streak || 0 : 0;
    
    return {
      totalPoints: user.points || 0,
      quizzesCompleted: user.totalQuizzes || 0,
      accuracy: user.accuracy || 0,
      currentStreak: streak,
      weeklyProgress: Math.min(totalQuizzes * 20, 100), // 5 quizzes = 100%
      timeSpent: Math.round(totalTime / 60), // Convert to minutes
      achievements: Math.floor((user.points || 0) / 250), // 1 achievement per 250 points
      topicsCompleted: completedQuizzes.filter(q => q.score >= 80).length,
    };
  }, [user, quizHistory]);
  
  // Format recent activity from quiz history
  const recentActivity = React.useMemo(() => {
    if (!quizHistory) return [];
    
    return quizHistory.slice(0, 4).map(quiz => {
      const date = new Date(quiz._creationTime);
      const now = new Date();
      const hoursAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      let dateStr = '';
      if (hoursAgo < 1) {
        dateStr = 'Just now';
      } else if (hoursAgo < 24) {
        dateStr = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
      } else {
        const daysAgo = Math.floor(hoursAgo / 24);
        dateStr = daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
      }
      
      const modeName = quiz.mode === 'quick' ? 'Quick Quiz' : 
                       quiz.mode === 'timed' ? 'Timed Challenge' : 'Custom Quiz';
      
      return {
        date: dateStr,
        activity: `Completed ${modeName}`,
        score: `${Math.round(quiz.score)}%`,
      };
    });
  }, [quizHistory]);


  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />
      
      {/* Essential Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Points"
          value={userStats.totalPoints.toLocaleString()}
          icon={Trophy}
        />
        <StatsCard
          title="Completed"
          value={userStats.quizzesCompleted}
          icon={Target}
        />
        <StatsCard
          title="Accuracy"
          value={`${userStats.accuracy}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Streak"
          value={`${userStats.currentStreak}`}
          icon={Flame}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quiz Mode Selector - Takes 2 columns */}
        <div className="lg:col-span-2">
          <QuizModeSelector />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.activity}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {activity.score}
                  </span>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No quizzes taken yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a quiz to see your activity!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Performance chart coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard && leaderboard.length > 0 ? leaderboard.map((performer: any) => {
                const isCurrentUser = user && performer.userId === user.id;
                return (
                  <div 
                    key={performer.userId} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCurrentUser
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        performer.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        performer.rank === 2 ? 'bg-gray-300 text-gray-800' :
                        performer.rank === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {performer.rank}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {isCurrentUser ? 'You' : performer.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">{performer.accuracy}% accuracy</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">{performer.points.toLocaleString()}</span>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No leaderboard data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete quizzes to join the leaderboard!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};