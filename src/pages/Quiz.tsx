import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Play } from 'lucide-react';
import { QuizEngine } from '../components/quiz/QuizEngine';
import { QuizResults } from '../components/quiz/QuizResults';
import { quizModes } from '../data/sampleQuestions';
import type { QuizSession } from '../services/quiz';

type QuizMode = 'quick' | 'timed' | 'custom';
type QuizState = 'setup' | 'active' | 'results';

export const Quiz: React.FC = () => {
  const { mode } = useParams<{ mode?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const quizMode = location.state?.mode;
  
  // Debug logging
  console.log('Quiz Debug:', { mode, pathname: location.pathname, quizMode });
  
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [completedSession, setCompletedSession] = useState<QuizSession | null>(null);
  
  const isValidMode = (m: string | undefined): m is QuizMode => {
    return m === 'quick' || m === 'timed' || m === 'custom';
  };
  
  const handleBack = () => {
    navigate('/app/dashboard');
  };
  
  const handleStartQuiz = () => {
    setQuizState('active');
  };
  
  const handleQuizComplete = (session: QuizSession) => {
    setCompletedSession(session);
    setQuizState('results');
  };
  
  const handleRetryQuiz = () => {
    setQuizState('setup');
    setCompletedSession(null);
  };
  
  const handleHomeReturn = () => {
    navigate('/app/dashboard');
  };
  
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
  
  // Show quiz engine when active
  if (quizState === 'active') {
    return (
      <QuizEngine 
        mode={mode}
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

  // Quiz setup screen
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

      {/* Sample Question Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sample Question Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Question 1 of 10</h3>
              <p className="text-sm mb-4">
                A 45-year-old male presents with chest pain and shortness of breath. 
                ECG shows ST-elevation in leads II, III, and aVF. Which coronary artery 
                is most likely occluded?
              </p>
              
              <div className="space-y-2">
                {['A) Left anterior descending artery', 'B) Right coronary artery', 'C) Left circumflex artery', 'D) Left main coronary artery'].map((option, index) => (
                  <div key={index} className="p-2 border rounded hover:bg-accent cursor-pointer transition-colors">
                    {option}
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              This is a preview. Actual quiz questions will be loaded when you start the quiz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};