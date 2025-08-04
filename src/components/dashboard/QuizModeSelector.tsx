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
        <div className="grid gap-6 md:grid-cols-3">
          {quizModes.map((mode) => (
            <div
              key={mode.id}
              className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-custom-lg transition-all duration-300 cursor-pointer animate-in hover:scale-105"
              onClick={() => handleStartQuiz(mode)}
            >
              {/* Gradient accent */}
              <div className={cn('absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r rounded-t-xl', mode.color)} />
              
              <div className="pt-2">
                {/* Icon and title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn('p-3 rounded-xl bg-gradient-to-br text-white shadow-custom transition-transform duration-200 group-hover:scale-110', mode.color)}>
                    <mode.icon className="h-6 w-6" />
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
                  variant="gradient"
                  size="lg"
                  className="w-full group-hover:shadow-custom-md"
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