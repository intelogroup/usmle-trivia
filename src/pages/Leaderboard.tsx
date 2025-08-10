import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../services/convexAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingStates';
import { TrendingUp, Calendar, CalendarDays, BookOpen, Trophy, Medal, Award, Search, Users, Star, Lightbulb, Flame } from 'lucide-react';

// Helper function to generate avatar initials from name
const getAvatarInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);
};

type LeaderboardCategory = 'all' | 'weekly' | 'monthly' | 'by-level';

export const Leaderboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  
  // Get current user information
  const { user } = useAuth();
  
  // Fetch leaderboard data from Convex backend
  const leaderboardData = useQuery(api.auth.getLeaderboard, { 
    limit: 50 // Get top 50 users for comprehensive leaderboard
  });
  
  // Loading state
  if (leaderboardData === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }
  
  // No data state  
  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="text-center space-y-4 py-8">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">No leaderboard data yet</h3>
          <p className="text-gray-600">Start taking quizzes to see the leaderboard!</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';  
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    return 'bg-background';
  };

  const categories = [
    { id: 'all', label: 'All Time', icon: TrendingUp },
    { id: 'weekly', label: 'This Week', icon: Calendar },
    { id: 'monthly', label: 'This Month', icon: CalendarDays },
    { id: 'by-level', label: 'By Level', icon: BookOpen }
  ];

  const medicalLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  // Transform and filter the real leaderboard data
  const processedData = leaderboardData.map((user, index) => ({
    id: user.userId,
    name: user.userName || 'Anonymous User',
    points: user.points || 0,
    level: user.level || 1,
    accuracy: user.accuracy || 0,
    totalQuizzes: user.totalQuizzes || 0,
    streak: user.streak || 0,
    rank: user.rank,
    avatar: getAvatarInitials(user.userName || 'Anonymous User'),
    medicalLevel: 'Student' // Default for now, could be enhanced later
  }));
  
  const filteredData = processedData.filter(user => {
    if (selectedCategory === 'by-level' && selectedLevel !== 'all') {
      return user.medicalLevel === selectedLevel;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-gray-600">
          See how you rank against other medical students in your USMLE preparation
        </p>
      </div>

      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id as LeaderboardCategory)}
                className="w-full flex items-center gap-2 text-sm"
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
          
          {selectedCategory === 'by-level' && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Medical Level:</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedLevel === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('all')}
                  size="sm"
                >
                  All Levels
                </Button>
                {medicalLevels.map(level => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? 'default' : 'outline'}
                    onClick={() => setSelectedLevel(level)}
                    size="sm"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4">
        {filteredData.slice(0, 3).map((leaderboardUser, index) => (
          <Card key={leaderboardUser.id} className={`text-center ${getRankColor(leaderboardUser.rank)}`}>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-3">
                {getRankIcon(leaderboardUser.rank)}
              </div>
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">
                {leaderboardUser.avatar}
              </div>
              <h3 className="font-bold text-lg">{leaderboardUser.name}</h3>
              <Badge variant="secondary" className="mb-2">
                {leaderboardUser.medicalLevel}
              </Badge>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {leaderboardUser.points.toLocaleString()} pts
                </div>
                <div className="text-sm text-muted-foreground">
                  Level {leaderboardUser.level} • {leaderboardUser.accuracy}% accuracy
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {leaderboardUser.streak} day streak
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Rankings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredData.map((leaderboardUser, index) => (
              <div 
                key={leaderboardUser.id}
                className={`flex items-center p-4 rounded-lg border transition-colors hover:bg-accent ${
                  leaderboardUser.id === user?.userId ? 'bg-blue-50 border-blue-200' : getRankColor(leaderboardUser.rank)
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(leaderboardUser.rank)}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {leaderboardUser.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{leaderboardUser.name}</h4>
                      {leaderboardUser.id === user?.userId && (
                        <Badge variant="default" className="text-xs">You</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {leaderboardUser.medicalLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Level {leaderboardUser.level} • {leaderboardUser.totalQuizzes} quizzes • {leaderboardUser.accuracy}% accuracy
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {leaderboardUser.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {leaderboardUser.streak} days
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Points System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Easy Questions</h4>
              <p className="text-muted-foreground">10 points per correct answer</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600">Medium Questions</h4>
              <p className="text-muted-foreground">15 points per correct answer</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Hard Questions</h4>
              <p className="text-muted-foreground">20 points per correct answer</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span><strong>Tip:</strong> Build your ranking by maintaining study streaks, achieving high accuracy, 
              and tackling challenging questions. Consistency is key to climbing the leaderboard!</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};