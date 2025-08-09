import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// Mock data for demonstration - in real app this would come from the database
const mockLeaderboardData = [
  {
    id: 1,
    name: "Alex Chen",
    points: 2850,
    level: 12,
    accuracy: 89,
    totalQuizzes: 47,
    streak: 15,
    rank: 1,
    avatar: "AC",
    medicalLevel: "3rd Year"
  },
  {
    id: 2,
    name: "Sarah Johnson", 
    points: 2720,
    level: 11,
    accuracy: 87,
    totalQuizzes: 42,
    streak: 22,
    rank: 2,
    avatar: "SJ",
    medicalLevel: "4th Year"
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    points: 2650,
    level: 11,
    accuracy: 85,
    totalQuizzes: 39,
    streak: 8,
    rank: 3,
    avatar: "MR",
    medicalLevel: "2nd Year"
  },
  {
    id: 4,
    name: "Jay Veedz", // Our test user
    points: 1250,
    level: 8,
    accuracy: 78,
    totalQuizzes: 28,
    streak: 3,
    rank: 15,
    avatar: "JV",
    medicalLevel: "2nd Year"
  },
  {
    id: 5,
    name: "Emily Zhang",
    points: 2400,
    level: 10,
    accuracy: 91,
    totalQuizzes: 35,
    streak: 12,
    rank: 4,
    avatar: "EZ",
    medicalLevel: "3rd Year"
  },
  {
    id: 6,
    name: "David Kim",
    points: 2100,
    level: 9,
    accuracy: 83,
    totalQuizzes: 31,
    streak: 5,
    rank: 5,
    avatar: "DK",
    medicalLevel: "1st Year"
  }
].sort((a, b) => b.points - a.points);

type LeaderboardCategory = 'all' | 'weekly' | 'monthly' | 'by-level';

export const Leaderboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';  
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    return 'bg-background';
  };

  const categories = [
    { id: 'all', label: 'All Time', icon: '📈' },
    { id: 'weekly', label: 'This Week', icon: '📅' },
    { id: 'monthly', label: 'This Month', icon: '🗓️' },
    { id: 'by-level', label: 'By Level', icon: '📚' }
  ];

  const medicalLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const filteredData = mockLeaderboardData.filter(user => {
    if (selectedCategory === 'by-level' && selectedLevel !== 'all') {
      return user.medicalLevel === selectedLevel;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">🏆 Leaderboard</h1>
        <p className="text-gray-600">
          See how you rank against other medical students in your USMLE preparation
        </p>
      </div>

      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🔍</span>
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
                <span>{category.icon}</span>
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
        {filteredData.slice(0, 3).map((user, index) => (
          <Card key={user.id} className={`text-center ${getRankColor(user.rank)}`}>
            <CardContent className="pt-6">
              <div className="flex justify-center mb-3">
                {getRankIcon(user.rank)}
              </div>
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">
                {user.avatar}
              </div>
              <h3 className="font-bold text-lg">{user.name}</h3>
              <Badge variant="secondary" className="mb-2">
                {user.medicalLevel}
              </Badge>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {user.points.toLocaleString()} pts
                </div>
                <div className="text-sm text-muted-foreground">
                  Level {user.level} • {user.accuracy}% accuracy
                </div>
                <div className="text-xs text-muted-foreground">
                  🔥 {user.streak} day streak
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
            <span>👥</span>
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredData.map((user, index) => (
              <div 
                key={user.id}
                className={`flex items-center p-4 rounded-lg border transition-colors hover:bg-accent ${
                  user.name === 'Jay Veedz' ? 'bg-blue-50 border-blue-200' : getRankColor(user.rank)
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {user.avatar}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{user.name}</h4>
                      {user.name === 'Jay Veedz' && (
                        <Badge variant="default" className="text-xs">You</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {user.medicalLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Level {user.level} • {user.totalQuizzes} quizzes • {user.accuracy}% accuracy
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {user.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      🔥 {user.streak} days
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
            <span>⭐</span>
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
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Build your ranking by maintaining study streaks, achieving high accuracy, 
              and tackling challenging questions. Consistency is key to climbing the leaderboard!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};