import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Settings, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

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
    features: ['20 questions', 'Time pressure', 'Detailed review'],
    duration: '30 min',
    questions: 20,
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
    navigate(`/quiz/${mode.id}`, { state: { mode } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Start New Quiz</CardTitle>
        <p className="text-muted-foreground">
          Choose your preferred quiz mode and begin practicing
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {quizModes.map((mode) => (
            <div
              key={mode.id}
              className="group relative overflow-hidden rounded-lg border bg-background p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleStartQuiz(mode)}
            >
              {/* Gradient accent */}
              <div className={cn('h-1 bg-gradient-to-r rounded-t-lg', mode.color)} />
              
              <div className="pt-4">
                {/* Icon and title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('p-2 rounded-lg bg-gradient-to-br text-white', mode.color)}>
                    <mode.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{mode.title}</h3>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
                  <span>{mode.questions} questions</span>
                  <span>{mode.duration}</span>
                </div>

                {/* Action button */}
                <Button 
                  className="w-full group-hover:shadow-sm"
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