import React from 'react';
import { Trophy, Target, TrendingUp, Flame, Calendar, Clock, Award, BookOpen } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { QuizModeSelector } from './QuizModeSelector';
import { QuizSessionCards } from './QuizSessionCards';
import { NewUserDashboard } from './NewUserDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAppStore } from '../../store';


export const DashboardGrid: React.FC = () => {
  const { user } = useAppStore();

  // Check if user is new (no quizzes completed)
  const isNewUser = !user || user.totalQuizzes === 0;

  // Show new user dashboard for users with no quiz history
  if (isNewUser) {
    return <NewUserDashboard userName={user?.name} />;
  }

  // Use real user data for existing users
  const userStats = {
    totalPoints: user?.points || 0,
    quizzesCompleted: user?.totalQuizzes || 0,
    accuracy: user?.accuracy || 0,
    currentStreak: user?.streak || 0,
    level: user?.level || 1,
  };

  return (
    <div className="grid gap-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'Medical Student'}! 👋
        </h1>
        <p className="text-blue-100">
          Ready to advance your medical knowledge? Let's continue your journey to USMLE success.
        </p>
      </div>

      {/* Stats Grid - Real User Data */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Points"
          value={userStats.totalPoints.toLocaleString()}
          icon={Trophy}
          trend="+12%"
          color="blue"
        />
        <StatsCard
          title="Quizzes Completed"
          value={userStats.quizzesCompleted}
          icon={Target}
          trend="+3 this week"
          color="green"
        />
        <StatsCard
          title="Accuracy Rate"
          value={`${userStats.accuracy}%`}
          icon={TrendingUp}
          trend="+5% improvement"
          color="purple"
        />
        <StatsCard
          title="Current Streak"
          value={`${userStats.currentStreak} days`}
          icon={Flame}
          trend="Keep it up!"
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="User Level"
          value={`Level ${userStats.level}`}
          icon={Award}
          color="purple"
        />
        <StatsCard
          title="Study Time"
          value="120m"
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Achievements"
          value="5"
          icon={Award}
          color="purple"
        />
        <StatsCard
          title="Topics Practiced"
          value="12"
          icon={BookOpen}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quiz Mode Selector - Takes 2 columns */}
        <div className="lg:col-span-2">
          <QuizModeSelector />
        </div>

        {/* Quiz Session Cards */}
        <QuizSessionCards />
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
              {mockTopPerformers.map((performer) => (
                <div 
                  key={performer.rank} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    performer.name === 'You' 
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
                      <p className="font-medium text-sm">{performer.name}</p>
                      <p className="text-xs text-muted-foreground">{performer.accuracy}% accuracy</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">{performer.points.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};