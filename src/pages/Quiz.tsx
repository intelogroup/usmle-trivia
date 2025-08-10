import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react';
import { QuizEngineLocal as QuizEngine } from '../components/quiz/QuizEngineLocal';
import { QuizResults } from '../components/quiz/QuizResults';
import { TransitionScreen } from '../components/ui/LoadingStates';
// Removed complex session components for simpler architecture
import { CustomQuizConfig } from '../components/quiz/CustomQuizConfig';
import { TimedQuizConfig, type TimedQuizConfig as TimedQuizConfigType } from '../components/quiz/TimedQuizConfig';
// Simplified architecture without complex session hooks
import { useAppStore } from '../store';
import { useAuth, useUpdateUserStats } from '../services/convexAuth';
import { quizModes } from '../data/sampleQuestions';
import type { QuizSession } from '../services/quiz';
import type { Question } from '../services/quiz';
// Removed complex session manager import

type QuizMode = 'quick' | 'timed' | 'custom';
type QuizState = 'setup' | 'starting' | 'active' | 'results';

export const Quiz: React.FC = () => {
  const { mode } = useParams<{ mode?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const quizMode = location.state?.mode;
  const { user } = useAuth();
  const updateUserStats = useUpdateUserStats();
  
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [completedSession, setCompletedSession] = useState<QuizSession | null>(null);
  // Simplified session data handling
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [enhancedResults, setEnhancedResults] = useState<{
    pointsEarned: number;
    userStats: any;
    performanceMetrics: any;
  } | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [customQuizConfig, setCustomQuizConfig] = useState<any>(null);
  const [timedQuizConfig, setTimedQuizConfig] = useState<TimedQuizConfigType | null>(null);
  
  // Simplified state management without complex session hooks
  
  // Enhanced quiz results now auto-saved - no manual save needed
  
  const isValidMode = (m: string | undefined): m is QuizMode => {
    return m === 'quick' || m === 'timed' || m === 'custom';
  };
  
  // Simplified state management - removed complex session handling

  const handleBack = () => {
    navigate('/dashboard');
  };
  
  const handleStartQuiz = async () => {
    if (!user) {
      setStartError('Please log in to start a quiz session.');
      return;
    }

    if (!mode || !isValidMode(mode)) {
      setStartError('Invalid quiz mode selected.');
      return;
    }

    setStartError(null);

    try {
      let questionCount: number;
      let timeLimit: number | undefined;
      
      if (mode === 'custom' && customQuizConfig) {
        questionCount = customQuizConfig.questionCount;
        timeLimit = customQuizConfig.timeLimit ? customQuizConfig.timeLimit * 60 : undefined; // convert minutes to seconds
      } else if (mode === 'timed' && timedQuizConfig) {
        questionCount = timedQuizConfig.questionCount;
        timeLimit = timedQuizConfig.timeLimit; // already in seconds
      } else {
        // Default values for quick and timed modes
        questionCount = mode === 'quick' ? 5 : mode === 'timed' ? 15 : 8;
        timeLimit = mode === 'timed' ? 30 * 60 : mode === 'custom' ? 480 : undefined; // seconds
      }
      
      // Generate question IDs based on mode
      const questionIds = Array.from({ length: questionCount }, (_, i) => `q${i + 1}`);

      console.log(`🎯 Starting ${mode} quiz with ${questionCount} questions`);
      
      // Show loading state before starting quiz
      setQuizState('starting');
      
      // Add small delay for smooth transition
      setTimeout(() => {
        setQuizState('active');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to start quiz session:', error);
      setStartError(error instanceof Error ? error.message : 'Failed to start quiz session');
    }
  };

  const handleCustomQuizConfig = (config: any) => {
    setCustomQuizConfig(config);
    handleStartQuiz();
  };

  const handleTimedQuizConfig = (config: TimedQuizConfigType) => {
    setTimedQuizConfig(config);
    handleStartQuiz();
  };
  
  const handleQuizComplete = async (session: QuizSession, enhancedData?: {
    pointsEarned: number;
    userStats: any;
    performanceMetrics: any;
  }) => {
    setCompletedSession(session);
    if (enhancedData && user) {
      setEnhancedResults(enhancedData);
      
      try {
        // Update user stats in the database first
        await updateUserStats({
          userId: user.userId,
          quizScore: enhancedData.userStats.accuracy,
          questionsCount: enhancedData.userStats.totalQuestions,
          pointsEarned: enhancedData.pointsEarned,
          timeSpent: enhancedData.userStats.timeSpent
        });
        
        console.log(`✅ Successfully updated user stats: +${enhancedData.pointsEarned} points, ${enhancedData.userStats.accuracy}% accuracy`);
        
        // Update local store for immediate UI feedback
        const currentPoints = user.points || 0;
        const newPoints = currentPoints + enhancedData.pointsEarned;
        const newLevel = Math.floor(newPoints / 100) + 1;
        const currentTotalQuizzes = user.totalQuizzes || 0;
        const newTotalQuizzes = currentTotalQuizzes + 1;
        const newAccuracy = currentTotalQuizzes === 0 
          ? enhancedData.userStats.accuracy 
          : Math.round((((user.accuracy || 0) * currentTotalQuizzes) + enhancedData.userStats.accuracy) / newTotalQuizzes);
        
        useAppStore.getState().updateUserStats({
          points: newPoints,
          level: newLevel,
          totalQuizzes: newTotalQuizzes,
          accuracy: newAccuracy,
        });
        
      } catch (error) {
        console.error('Failed to update user stats in database:', error);
        // Still update local store for UI feedback even if backend fails
        const currentPoints = user.points || 0;
        const newPoints = currentPoints + enhancedData.pointsEarned;
        const newLevel = Math.floor(newPoints / 100) + 1;
        
        useAppStore.getState().updateUserStats({
          points: newPoints,
          level: newLevel,
        });
      }
    }
    setQuizState('results');
  };
  
  const handleRetryQuiz = () => {
    setQuizState('setup');
    setCompletedSession(null);
  };
  
  const handleHomeReturn = () => {
    navigate('/');
  };

  // Simplified handlers
  
  if (!mode || !isValidMode(mode)) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quiz</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Please select a valid quiz mode from the dashboard to get started.
            </p>
            <div className="text-center mt-4">
              <Button onClick={handleBack}>Back to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show starting transition
  if (quizState === 'starting') {
    return (
      <TransitionScreen
        type="quiz-starting"
        message={`Preparing your ${mode} quiz with ${quizModes[mode as QuizMode]?.questionCount || 5} questions`}
      />
    );
  }
  
  // Show quiz engine when active
  if (quizState === 'active') {
    // Prepare configuration based on mode
    let quizConfig = undefined;
    if (mode === 'timed' && timedQuizConfig) {
      quizConfig = {
        questionCount: timedQuizConfig.questionCount,
        difficulty: timedQuizConfig.difficulty,
        timeLimit: timedQuizConfig.timeLimit
      };
    } else if (mode === 'custom' && customQuizConfig) {
      quizConfig = {
        questionCount: customQuizConfig.questionCount,
        difficulty: customQuizConfig.difficulty?.[0] || 'mixed', // Take first difficulty if array
        timeLimit: customQuizConfig.timeLimit ? customQuizConfig.timeLimit * 60 : undefined
      };
    }

    return (
      <QuizEngine
        mode={mode}
        config={quizConfig}
        onBack={() => setQuizState('setup')}
        onComplete={handleQuizComplete}
      />
    );
  }
  
  // Show results when completed
  if (quizState === 'results' && completedSession) {
    return (
      <QuizResults 
        session={completedSession}
        onHome={handleHomeReturn}
        onRetry={handleRetryQuiz}
      />
    );
  }
  
  // Get quiz mode configuration
  const modeConfig = quizModes[mode];

  // Quiz setup screen - show config for custom and timed modes
  if (mode === 'custom') {
    return (
      <CustomQuizConfig
        onStartQuiz={handleCustomQuizConfig}
        onBack={handleBack}
      />
    );
  }

  if (mode === 'timed') {
    return (
      <TimedQuizConfig
        onStartQuiz={handleTimedQuizConfig}
        onBack={handleBack}
      />
    );
  }
  
  // Quiz setup screen for quick mode only (timed mode has its own config)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {modeConfig.name}
          </h1>
          <p className="text-muted-foreground">
            {modeConfig.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {startError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {startError}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Questions:</span>
              <span className="ml-2 font-medium">{quizMode?.questions || 10}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-medium">{quizMode?.duration || '15 min'}</span>
            </div>
          </div>
          
          {quizMode?.features && (
            <div>
              <p className="text-sm font-medium mb-2">Features:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {quizMode.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4">
            <Button className="w-full" size="lg" onClick={handleStartQuiz}>
              <Play className="w-4 h-4 mr-2" />
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
