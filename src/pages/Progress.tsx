import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useGetUserQuizHistory } from '../services/convexQuiz';
import { SpacedRepetitionEngine } from '../components/study/SpacedRepetitionEngine';
import { StudyAnalytics } from '../components/analytics/StudyAnalytics';
import { StudyRecommendationEngine } from '../components/study/StudyRecommendationEngine';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Calendar, 
  Award,
  Clock,
  Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuestionPerformance {
  questionId: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  correctCount: number;
  lastAttempted: Date;
  averageTime: number;
  confidenceRatings: number[];
  isBookmarked: boolean;
}

export const Progress: React.FC = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [questionHistory, setQuestionHistory] = useState<QuestionPerformance[]>([]);

  // Fetch user quiz history
  const quizHistory = useGetUserQuizHistory(user?.id || '', 50);

  // Generate mock question performance data (in real app, this would come from quiz sessions)
  useEffect(() => {
    if (quizHistory && quizHistory.length > 0) {
      const mockPerformance: QuestionPerformance[] = [];
      
      // Generate sample data based on quiz history
      quizHistory.forEach((session, sessionIndex) => {
        session.questions.forEach((questionId, questionIndex) => {
          const wasCorrect = session.answers[questionIndex] === 0; // Mock correct answer
          const existingQuestion = mockPerformance.find(q => q.questionId === questionId);
          
          if (existingQuestion) {
            existingQuestion.attempts += 1;
            if (wasCorrect) existingQuestion.correctCount += 1;
            existingQuestion.lastAttempted = new Date(session._creationTime);
            existingQuestion.confidenceRatings.push(Math.floor(Math.random() * 5) + 1);
          } else {
            mockPerformance.push({
              questionId,
              question: `Sample medical question ${questionIndex + 1}`,
              category: ['Cardiology', 'Neurology', 'Endocrinology', 'Pulmonology'][questionIndex % 4],
              difficulty: ['easy', 'medium', 'hard'][questionIndex % 3] as 'easy' | 'medium' | 'hard',
              attempts: 1,
              correctCount: wasCorrect ? 1 : 0,
              lastAttempted: new Date(session._creationTime),
              averageTime: 60 + Math.random() * 120, // 1-3 minutes
              confidenceRatings: [Math.floor(Math.random() * 5) + 1],
              isBookmarked: Math.random() > 0.8
            });
          }
        });
      });
      
      setQuestionHistory(mockPerformance);
    }
  }, [quizHistory]);

  const handleStartSpacedReview = (questionIds: string[]) => {
    // Create a custom quiz with the selected questions
    navigate('/quiz/custom', { 
      state: { 
        mode: 'spaced-repetition',
        questionIds,
        title: 'Spaced Repetition Review'
      } 
    });
  };

  const overallStats = {
    totalQuizzes: user?.totalQuizzes || 0,
    accuracy: user?.accuracy || 0,
    currentStreak: user?.streak || 0,
    totalPoints: user?.points || 0,
    level: user?.level || 1
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and improvement over time
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">Level {overallStats.level}</div>
          <div className="text-sm text-muted-foreground">{overallStats.totalPoints.toLocaleString()} points</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{overallStats.totalQuizzes}</div>
                <div className="text-sm text-muted-foreground">Quizzes Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{overallStats.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{overallStats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{overallStats.level}</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different progress views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="spaced-repetition" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Spaced Rep
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Study Plan
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <StudyAnalytics />
        </TabsContent>

        <TabsContent value="spaced-repetition">
          <SpacedRepetitionEngine
            questionHistory={questionHistory}
            onStartReview={handleStartSpacedReview}
          />
        </TabsContent>

        <TabsContent value="recommendations">
          <StudyRecommendationEngine />
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Study Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Study Schedule Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  We're building an intelligent scheduling system to help you plan your study sessions for optimal retention.
                </p>
                <Button onClick={() => navigate('/quiz')}>
                  Take a Quiz Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};