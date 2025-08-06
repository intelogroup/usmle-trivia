import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Flame,
  Brain,
  Clock,
  Award,
  BookOpen,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  Lightbulb,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';
import { QuizModeSelector } from './QuizModeSelector';
import { StudyAnalytics } from '../analytics/StudyAnalytics';
import { SpacedRepetitionEngine } from '../study/SpacedRepetitionEngine';

interface PerformanceTrend {
  date: string;
  score: number;
  confidence: number;
  timeSpent: number;
}

interface TopicMastery {
  category: string;
  masteryLevel: number; // 0-100
  questionsAttempted: number;
  averageScore: number;
  trend: 'up' | 'down' | 'stable';
  confidenceLevel: number;
}

// Mock data - in real implementation, this would come from the backend
const mockPerformanceTrends: PerformanceTrend[] = [
  { date: '2025-01-27', score: 65, confidence: 3.2, timeSpent: 480 },
  { date: '2025-01-28', score: 72, confidence: 3.5, timeSpent: 520 },
  { date: '2025-01-29', score: 68, confidence: 3.1, timeSpent: 445 },
  { date: '2025-01-30', score: 78, confidence: 3.8, timeSpent: 510 },
  { date: '2025-01-31', score: 82, confidence: 4.1, timeSpent: 490 },
  { date: '2025-02-01', score: 79, confidence: 3.9, timeSpent: 475 },
  { date: '2025-02-02', score: 85, confidence: 4.3, timeSpent: 460 },
];

const mockTopicMastery: TopicMastery[] = [
  { category: 'Cardiovascular', masteryLevel: 85, questionsAttempted: 45, averageScore: 82, trend: 'up', confidenceLevel: 4.2 },
  { category: 'Endocrine', masteryLevel: 72, questionsAttempted: 38, averageScore: 75, trend: 'up', confidenceLevel: 3.8 },
  { category: 'Pulmonary', masteryLevel: 68, questionsAttempted: 32, averageScore: 71, trend: 'stable', confidenceLevel: 3.5 },
  { category: 'Neurology', masteryLevel: 58, questionsAttempted: 25, averageScore: 64, trend: 'down', confidenceLevel: 2.9 },
  { category: 'Infectious Disease', masteryLevel: 91, questionsAttempted: 52, averageScore: 88, trend: 'up', confidenceLevel: 4.5 },
];

const EnhancedStatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  insight?: string;
}> = ({ title, value, change, changeLabel, icon: Icon, color, trend, insight }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    red: 'bg-red-100 text-red-600 border-red-200',
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {change !== undefined && (
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  trend === 'up' ? 'bg-green-100 text-green-700' :
                  trend === 'down' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                )}>
                  {trend === 'up' && <ArrowUp className="h-3 w-3" />}
                  {trend === 'down' && <ArrowDown className="h-3 w-3" />}
                  {change > 0 ? '+' : ''}{change}
                  {changeLabel && <span>{changeLabel}</span>}
                </div>
              )}
            </div>
            {insight && (
              <p className="text-xs text-muted-foreground">{insight}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl border', colorClasses[color as keyof typeof colorClasses])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceTrendChart: React.FC<{ data: PerformanceTrend[] }> = ({ data }) => {
  const maxScore = Math.max(...data.map(d => d.score));
  const minScore = Math.min(...data.map(d => d.score));
  const scoreRange = maxScore - minScore || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Performance Trend (7 days)</h4>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
            <span>Score</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-500 rounded"></div>
            <span>Confidence</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-32 bg-gradient-to-t from-muted/20 to-transparent rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          {/* Score line */}
          <polyline
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 280 + 10;
              const y = 90 - ((point.score - minScore) / scoreRange) * 70;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Confidence line */}
          <polyline
            fill="none"
            stroke="rgb(147, 51, 234)"
            strokeWidth="2"
            strokeDasharray="4,4"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 280 + 10;
              const y = 90 - ((point.confidence - 1) / 4) * 70;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 280 + 10;
            const y = 90 - ((point.score - minScore) / scoreRange) * 70;
            return (
              <circle key={index} cx={x} cy={y} r="3" fill="rgb(59, 130, 246)" />
            );
          })}
        </svg>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center text-xs">
        <div>
          <div className="font-medium text-blue-600">{data[data.length - 1]?.score}%</div>
          <div className="text-muted-foreground">Latest Score</div>
        </div>
        <div>
          <div className="font-medium text-purple-600">{data[data.length - 1]?.confidence.toFixed(1)}</div>
          <div className="text-muted-foreground">Confidence</div>
        </div>
        <div>
          <div className="font-medium text-green-600">
            {data[data.length - 1]?.score - data[0]?.score > 0 ? '+' : ''}{data[data.length - 1]?.score - data[0]?.score}%
          </div>
          <div className="text-muted-foreground">7-day Change</div>
        </div>
      </div>
    </div>
  );
};

const TopicMasteryVisual: React.FC<{ topics: TopicMastery[] }> = ({ topics }) => {
  const getMasteryColor = (level: number) => {
    if (level >= 90) return 'bg-green-500';
    if (level >= 80) return 'bg-blue-500';
    if (level >= 70) return 'bg-yellow-500';
    if (level >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 90) return 'Expert';
    if (level >= 80) return 'Advanced';
    if (level >= 70) return 'Intermediate';
    if (level >= 60) return 'Developing';
    return 'Beginner';
  };

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <div key={topic.category} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{topic.category}</span>
              <span className="text-xs text-muted-foreground">
                ({topic.questionsAttempted} questions)
              </span>
              {topic.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
              {topic.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-600" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{topic.masteryLevel}%</span>
              <span className="text-xs text-muted-foreground">
                {getMasteryLabel(topic.masteryLevel)}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn('h-2 rounded-full transition-all duration-500', getMasteryColor(topic.masteryLevel))}
                style={{ width: `${topic.masteryLevel}%` }}
              />
            </div>
            
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{topic.averageScore}% avg score</span>
              <span>{topic.confidenceLevel.toFixed(1)} confidence</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const EnhancedDashboard: React.FC = () => {
  const { user } = useAppStore();

  // Mock user stats - in real implementation, these would be calculated from actual data
  const userStats = {
    totalPoints: 1250,
    quizzesCompleted: 28,
    accuracy: 78,
    currentStreak: 7,
    weeklyProgress: 85,
    timeSpent: 420, // minutes
    achievements: 5,
    topicsCompleted: 3,
    averageConfidence: 3.7,
    improvementTrend: 12, // percentage improvement over time
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "🔥 Amazing dedication!";
    if (streak >= 14) return "⭐ Great momentum!";
    if (streak >= 7) return "💪 Building habits!";
    if (streak >= 3) return "🎯 Keep it up!";
    return "📚 Start your journey!";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-blue-50 to-purple-50 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Student'}! 👋</h1>
            <p className="text-muted-foreground mt-1">
              You're on a {userStats.currentStreak}-day streak. {getStreakMessage(userStats.currentStreak)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-orange-500" />
            <span className="text-3xl font-bold text-orange-600">{userStats.currentStreak}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatsCard
          title="Average Score"
          value={`${userStats.accuracy}%`}
          change={userStats.improvementTrend}
          changeLabel="%"
          icon={Target}
          color="blue"
          trend="up"
          insight="12% improvement this week"
        />
        
        <EnhancedStatsCard
          title="Study Confidence"
          value={userStats.averageConfidence.toFixed(1)}
          change={0.3}
          icon={Brain}
          color="purple"
          trend="up"
          insight="Growing self-awareness"
        />
        
        <EnhancedStatsCard
          title="Study Time"
          value={`${userStats.timeSpent}m`}
          change={45}
          changeLabel="m"
          icon={Clock}
          color="green"
          trend="up"
          insight="7 hours this week"
        />
        
        <EnhancedStatsCard
          title="Topics Mastered"
          value={userStats.topicsCompleted}
          icon={Award}
          color="orange"
          insight={`${mockTopicMastery.filter(t => t.masteryLevel >= 80).length} near mastery`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quiz Mode Selector - Enhanced */}
        <div className="lg:col-span-2">
          <QuizModeSelector />
        </div>

        {/* Smart Study Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Focus Area</span>
              </div>
              <p className="text-sm text-blue-800">
                Neurology needs attention. 3 questions due for review.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Strength</span>
              </div>
              <p className="text-sm text-green-800">
                Infectious Disease mastery at 91%. Great job!
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Goal</span>
              </div>
              <p className="text-sm text-purple-800">
                3 more days to reach a 10-day study streak!
              </p>
            </div>
            
            <Button variant="outline" className="w-full">
              <Activity className="h-4 w-4 mr-2" />
              View All Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceTrendChart data={mockPerformanceTrends} />
          </CardContent>
        </Card>

        {/* Topic Mastery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Topic Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopicMasteryVisual topics={mockTopicMastery} />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goals & Achievements */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">5/5</div>
                <div className="text-sm text-blue-600">Days Studied</div>
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mt-2" />
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">85%</div>
                <div className="text-sm text-purple-600">Target Accuracy</div>
                <TrendingUp className="h-5 w-5 text-green-600 mx-auto mt-2" />
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">420m</div>
                <div className="text-sm text-orange-600">Study Time</div>
                <Target className="h-5 w-5 text-green-600 mx-auto mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
              <Award className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-sm font-medium">Week Warrior</div>
                <div className="text-xs text-muted-foreground">7-day streak!</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Sharp Shooter</div>
                <div className="text-xs text-muted-foreground">85% accuracy</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg border border-purple-100">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium">Topic Master</div>
                <div className="text-xs text-muted-foreground">ID mastery</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};