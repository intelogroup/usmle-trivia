import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Lightbulb,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  BookOpen,
  Star,
  ArrowRight,
  Calendar,
  Zap,
  Award,
  BarChart3,
  RefreshCw,
  Filter,
  X,
  Flame,
  Users,
  Trophy,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface UserPerformanceData {
  userId: string;
  overallAccuracy: number;
  totalQuizzes: number;
  studyStreak: number;
  averageConfidence: number;
  timeSpentMinutes: number;
  categoryPerformance: CategoryPerformance[];
  recentSessions: QuizSession[];
  weakAreas: WeakArea[];
  strengths: string[];
  studyGoals: StudyGoal[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  studyPreferences: StudyPreferences;
}

interface CategoryPerformance {
  category: string;
  accuracy: number;
  questionsAttempted: number;
  averageTime: number;
  confidenceLevel: number;
  lastStudied: Date;
  improvementTrend: number;
  masteryLevel: number;
}

interface QuizSession {
  id: string;
  score: number;
  timeSpent: number;
  date: Date;
  category: string;
  difficulty: string;
  mode: string;
}

interface WeakArea {
  category: string;
  specificTopics: string[];
  accuracy: number;
  priority: 'high' | 'medium' | 'low';
  recommendedActions: string[];
}

interface StudyGoal {
  id: string;
  type: 'score' | 'streak' | 'time' | 'category';
  target: number;
  current: number;
  deadline?: Date;
  description: string;
}

interface StudyPreferences {
  preferredStudyTime: 'morning' | 'afternoon' | 'evening';
  sessionDuration: number; // minutes
  difficultyProgression: 'gradual' | 'mixed' | 'challenging';
  includeReviews: boolean;
  focusOnWeakAreas: boolean;
}

interface Recommendation {
  id: string;
  type: 'quiz' | 'review' | 'study' | 'goal' | 'habit';
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  reasoning: string;
  estimatedTime: number;
  difficultyLevel: string;
  expectedBenefit: string;
  actionItems: ActionItem[];
  metrics?: {
    potentialScoreIncrease: number;
    confidenceBoost: number;
    retentionImprovement: number;
  };
}

interface ActionItem {
  id: string;
  text: string;
  type: 'quiz' | 'review' | 'read' | 'practice';
  completed?: boolean;
}

interface StudyRecommendationEngineProps {
  userPerformance: UserPerformanceData;
  onRecommendationSelect?: (recommendation: Recommendation) => void;
  onStartQuiz?: (config: any) => void;
  className?: string;
}

// Mock recommendation engine
const generateRecommendations = (userData: UserPerformanceData): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  // Find weakest category
  const weakestCategory = userData.categoryPerformance
    .sort((a, b) => a.accuracy - b.accuracy)[0];

  // Find strongest category
  const strongestCategory = userData.categoryPerformance
    .sort((a, b) => b.accuracy - a.accuracy)[0];

  // Recent performance trend
  const recentSessions = userData.recentSessions.slice(0, 5);
  const recentAverage = recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length;

  // Generate specific recommendations
  
  // 1. Address weak areas
  if (weakestCategory && weakestCategory.accuracy < 70) {
    recommendations.push({
      id: 'weak-area-focus',
      type: 'quiz',
      priority: 'high',
      category: weakestCategory.category,
      title: `Master ${weakestCategory.category}`,
      description: `Focus on ${weakestCategory.category} where you score ${Math.round(weakestCategory.accuracy)}%`,
      reasoning: `Your performance in ${weakestCategory.category} is below your target. Focused practice can improve retention and confidence.`,
      estimatedTime: 20,
      difficultyLevel: 'Progressive',
      expectedBenefit: 'Significant improvement in weak area',
      actionItems: [
        { id: '1', text: `Take 5 ${weakestCategory.category} questions`, type: 'quiz' },
        { id: '2', text: 'Review explanations carefully', type: 'review' },
        { id: '3', text: 'Read additional references', type: 'read' }
      ],
      metrics: {
        potentialScoreIncrease: 15,
        confidenceBoost: 20,
        retentionImprovement: 25
      }
    });
  }

  // 2. Maintain strengths
  if (strongestCategory && strongestCategory.accuracy > 85) {
    recommendations.push({
      id: 'maintain-strength',
      type: 'quiz',
      priority: 'medium',
      category: strongestCategory.category,
      title: `Excel in ${strongestCategory.category}`,
      description: `Build on your strength in ${strongestCategory.category} (${Math.round(strongestCategory.accuracy)}%)`,
      reasoning: `You're performing well in ${strongestCategory.category}. Advanced questions can help you reach mastery level.`,
      estimatedTime: 15,
      difficultyLevel: 'Advanced',
      expectedBenefit: 'Achieve mastery level',
      actionItems: [
        { id: '1', text: 'Take advanced questions', type: 'quiz' },
        { id: '2', text: 'Challenge yourself with complex scenarios', type: 'practice' }
      ],
      metrics: {
        potentialScoreIncrease: 5,
        confidenceBoost: 15,
        retentionImprovement: 10
      }
    });
  }

  // 3. Spaced repetition reminder
  const oldQuestions = userData.categoryPerformance.filter(
    cat => Date.now() - cat.lastStudied.getTime() > 7 * 24 * 60 * 60 * 1000 // 7 days
  );

  if (oldQuestions.length > 0) {
    recommendations.push({
      id: 'spaced-repetition',
      type: 'review',
      priority: 'medium',
      category: 'Mixed',
      title: 'Review Past Topics',
      description: `${oldQuestions.length} topics need review for long-term retention`,
      reasoning: 'Spaced repetition is crucial for moving knowledge to long-term memory.',
      estimatedTime: 25,
      difficultyLevel: 'Mixed',
      expectedBenefit: 'Enhanced long-term retention',
      actionItems: [
        { id: '1', text: 'Review questions from past week', type: 'review' },
        { id: '2', text: 'Focus on previously incorrect answers', type: 'quiz' }
      ]
    });
  }

  // 4. Study streak maintenance
  if (userData.studyStreak >= 3) {
    recommendations.push({
      id: 'maintain-streak',
      type: 'habit',
      priority: 'high',
      category: 'Habit',
      title: 'Maintain Your Streak!',
      description: `You're on a ${userData.studyStreak}-day streak! Keep the momentum going.`,
      reasoning: 'Consistent daily practice is more effective than irregular intensive sessions.',
      estimatedTime: userData.studyPreferences.sessionDuration,
      difficultyLevel: 'Your Choice',
      expectedBenefit: 'Consistent learning progress',
      actionItems: [
        { id: '1', text: 'Complete today\'s study session', type: 'quiz' },
        { id: '2', text: 'Set reminder for tomorrow', type: 'practice' }
      ]
    });
  }

  // 5. Confidence building
  if (userData.averageConfidence < 3.0) {
    recommendations.push({
      id: 'confidence-building',
      type: 'study',
      priority: 'medium',
      category: 'Psychology',
      title: 'Build Study Confidence',
      description: 'Start with easier questions to build confidence before tackling harder material',
      reasoning: 'Low confidence can impact performance. Building confidence through success can improve overall results.',
      estimatedTime: 15,
      difficultyLevel: 'Easy to Medium',
      expectedBenefit: 'Improved confidence and performance',
      actionItems: [
        { id: '1', text: 'Take 3 easy questions in your strong areas', type: 'quiz' },
        { id: '2', text: 'Celebrate small wins', type: 'practice' },
        { id: '3', text: 'Gradually increase difficulty', type: 'practice' }
      ],
      metrics: {
        potentialScoreIncrease: 10,
        confidenceBoost: 30,
        retentionImprovement: 15
      }
    });
  }

  // 6. Goal-based recommendations
  userData.studyGoals.forEach(goal => {
    if (goal.current < goal.target * 0.8) {
      recommendations.push({
        id: `goal-${goal.id}`,
        type: 'goal',
        priority: 'high',
        category: 'Goal',
        title: `Progress on: ${goal.description}`,
        description: `You're ${Math.round((goal.current / goal.target) * 100)}% of the way to your goal`,
        reasoning: `Focused effort on this goal can help you achieve your target ${goal.deadline ? 'by the deadline' : 'soon'}.`,
        estimatedTime: 30,
        difficultyLevel: 'Focused',
        expectedBenefit: 'Goal achievement progress',
        actionItems: [
          { id: '1', text: 'Take targeted quiz session', type: 'quiz' },
          { id: '2', text: 'Track daily progress', type: 'practice' }
        ]
      });
    }
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const StudyRecommendationEngine: React.FC<StudyRecommendationEngineProps> = ({
  userPerformance,
  onRecommendationSelect,
  onStartQuiz,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const recommendations = useMemo(() => 
    generateRecommendations(userPerformance), 
    [userPerformance]
  );

  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rec => rec.category === selectedCategory);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(rec => rec.priority === selectedPriority);
    }

    return filtered;
  }, [recommendations, selectedCategory, selectedPriority]);

  const getRecommendationIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'quiz':
        return <Target className="h-4 w-4" />;
      case 'review':
        return <RefreshCw className="h-4 w-4" />;
      case 'study':
        return <BookOpen className="h-4 w-4" />;
      case 'goal':
        return <Trophy className="h-4 w-4" />;
      case 'habit':
        return <Flame className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-green-200 bg-green-50 text-green-800';
    }
  };

  const handleRecommendationAction = (recommendation: Recommendation) => {
    onRecommendationSelect?.(recommendation);

    if (recommendation.type === 'quiz' && onStartQuiz) {
      onStartQuiz({
        category: recommendation.category,
        difficulty: recommendation.difficultyLevel,
        duration: recommendation.estimatedTime
      });
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Smart Study Recommendations</h2>
            <p className="text-muted-foreground text-sm">
              Personalized suggestions based on your performance and goals
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Overall Score</div>
                <div className="text-lg font-bold">{Math.round(userPerformance.overallAccuracy)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Flame className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Study Streak</div>
                <div className="text-lg font-bold">{userPerformance.studyStreak} days</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Confidence</div>
                <div className="text-lg font-bold">{userPerformance.averageConfidence.toFixed(1)}/5</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Study Time</div>
                <div className="text-lg font-bold">{Math.round(userPerformance.timeSpentMinutes / 60)}h</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-muted rounded-md"
                >
                  <option value="all">All Categories</option>
                  {Array.from(new Set(recommendations.map(r => r.category))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full p-2 border border-muted rounded-md"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div className="grid gap-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Great job!</h3>
                <p className="text-muted-foreground">
                  No urgent recommendations right now. Keep up your excellent study habits!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <Card
              key={recommendation.id}
              className="hover:shadow-md transition-all duration-200 hover:border-primary/50"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getRecommendationIcon(recommendation.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{recommendation.title}</h3>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium border',
                          getPriorityColor(recommendation.priority)
                        )}>
                          {recommendation.priority} priority
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {recommendation.description}
                      </p>
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>Why:</strong> {recommendation.reasoning}
                      </div>

                      {/* Metrics */}
                      {recommendation.metrics && (
                        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm font-bold text-blue-700">
                              +{recommendation.metrics.potentialScoreIncrease}%
                            </div>
                            <div className="text-xs text-blue-600">Score Boost</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-purple-700">
                              +{recommendation.metrics.confidenceBoost}%
                            </div>
                            <div className="text-xs text-purple-600">Confidence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-700">
                              +{recommendation.metrics.retentionImprovement}%
                            </div>
                            <div className="text-xs text-green-600">Retention</div>
                          </div>
                        </div>
                      )}

                      {/* Action Items */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Action Plan:</div>
                        <ul className="space-y-1">
                          {recommendation.actionItems.map((item) => (
                            <li key={item.id} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-muted-foreground" />
                              <span>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      <span>{recommendation.estimatedTime} min</span>
                    </div>
                    <div className="text-xs">{recommendation.difficultyLevel}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <strong>Expected:</strong> {recommendation.expectedBenefit}
                  </div>
                  <Button
                    onClick={() => handleRecommendationAction(recommendation)}
                    className="flex items-center gap-2"
                  >
                    {recommendation.type === 'quiz' ? (
                      <>
                        <Zap className="h-4 w-4" />
                        Start Quiz
                      </>
                    ) : recommendation.type === 'review' ? (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Start Review
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        Take Action
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};