import React from 'react';
import { Trophy, Target, TrendingUp, Flame, Calendar, Clock, Award, BookOpen } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { QuizModeSelector } from './QuizModeSelector';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

// Mock data - in real app, this would come from API/database
const mockStats = {
  totalPoints: 1250,
  quizzesCompleted: 28,
  accuracy: 78,
  currentStreak: 7,
  weeklyProgress: 85,
  timeSpent: 120, // minutes
  achievements: 5,
  topicsCompleted: 12,
};

const mockRecentActivity = [
  { date: '2 hours ago', activity: 'Completed Anatomy Quiz', score: '8/10' },
  { date: 'Yesterday', activity: 'Finished Pharmacology Review', score: '15/20' },
  { date: '2 days ago', activity: 'Quick Quiz - Mixed Topics', score: '7/8' },
  { date: '3 days ago', activity: 'Timed Challenge', score: '18/25' },
];

const mockTopPerformers = [
  { rank: 1, name: 'Alex Chen', points: 2150, accuracy: 92 },
  { rank: 2, name: 'Sarah Johnson', points: 1980, accuracy: 89 },
  { rank: 3, name: 'Mike Rodriguez', points: 1850, accuracy: 87 },
  { rank: 4, name: 'You', points: mockStats.totalPoints, accuracy: mockStats.accuracy },
];

export const DashboardGrid: React.FC = () => {
  return (
    <div className="grid gap-6">
      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Points"
          value={mockStats.totalPoints.toLocaleString()}
          icon={Trophy}
          trend="+12%"
          color="blue"
        />
        <StatsCard
          title="Quizzes Completed"
          value={mockStats.quizzesCompleted}
          icon={Target}
          trend="+3 this week"
          color="green"
        />
        <StatsCard
          title="Accuracy Rate"
          value={`${mockStats.accuracy}%`}
          icon={TrendingUp}
          trend="+5% improvement"
          color="purple"
        />
        <StatsCard
          title="Current Streak"
          value={`${mockStats.currentStreak} days`}
          icon={Flame}
          trend="Keep it up!"
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Weekly Progress"
          value={`${mockStats.weeklyProgress}%`}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="Study Time"
          value={`${mockStats.timeSpent}m`}
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Achievements"
          value={mockStats.achievements}
          icon={Award}
          color="purple"
        />
        <StatsCard
          title="Topics Mastered"
          value={mockStats.topicsCompleted}
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((activity, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.activity}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {activity.score}
                  </span>
                </div>
              ))}
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