import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Settings, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { analyticsService, getAnalyticsAttributes } from '../../services/analytics';

interface QuizMode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features: string[];
  duration?: string;
  questions?: number;
}

const quizModes: QuizMode[] = [
  {
    id: 'quick',
    title: 'Quick Quiz',
    description: 'Fast practice session',
    icon: Zap,
    color: 'from-green-500 to-teal-600',
    features: ['5-10 questions', 'Mixed topics', 'Instant feedback'],
    duration: '5-10 min',
    questions: 5,
  },
  {
    id: 'timed',
    title: 'Timed Challenge',
    description: 'Test your speed and accuracy',
    icon: Clock,
    color: 'from-blue-500 to-purple-600',
    features: ['10-20 questions', 'Choose difficulty', 'Customizable time limit'],
    duration: '20-50 min',
    questions: 15,
  },
  {
    id: 'custom',
    title: 'Custom Practice',
    description: 'Design your own quiz',
    icon: Settings,
    color: 'from-purple-500 to-pink-600',
    features: ['Choose topics', 'Set difficulty', 'Review mode'],
    duration: 'Variable',
    questions: 10,
  },
];

export const QuizModeSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleStartQuiz = (mode: QuizMode) => {
    // Track quiz start event
    analyticsService.trackQuizStart(mode.id as 'quick' | 'timed' | 'custom', mode.questions || 0, mode.title);
    
    // Only pass serializable data in the navigation state
    const serializableMode = {
      id: mode.id,
      title: mode.title,
      description: mode.description,
      color: mode.color,
      features: mode.features,
      duration: mode.duration,
      questions: mode.questions,
    };
    navigate(`/quiz/${mode.id}`, { state: { mode: serializableMode } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Practice Mode</CardTitle>
        <p className="text-muted-foreground text-sm">
          Select quiz type to begin
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {quizModes.map((mode) => (
            <div
              key={mode.id}
              className="border bg-card rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleStartQuiz(mode)}
              {...getAnalyticsAttributes('quiz_start', { 
                mode: mode.id,
                questions: mode.questions?.toString() || '0',
                duration: mode.duration || 'unknown'
              })}
            >
              
              <div className="pt-2">
                {/* Icon and title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-muted border">
                    <mode.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{mode.title}</h3>
                    <p className="text-muted-foreground">{mode.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-6 py-3 px-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">{mode.questions} questions</span>
                  <span className="font-medium">{mode.duration}</span>
                </div>

                {/* Action button */}
                <Button 
                  variant="default"
                  size="lg"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartQuiz(mode);
                  }}
                >
                  Start Quiz
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
