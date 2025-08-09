import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ArrowLeft, Play, Clock, Hash, Target, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TimedQuizConfig {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timeLimit: number; // in seconds
}

interface TimedQuizConfigProps {
  onStartQuiz: (config: TimedQuizConfig) => void;
  onBack: () => void;
}

const difficultyOptions = [
  {
    value: 'easy' as const,
    label: 'Easy',
    description: 'Foundational concepts',
    icon: '🟢',
    color: 'from-green-400 to-green-600'
  },
  {
    value: 'medium' as const,
    label: 'Medium',
    description: 'Intermediate level',
    icon: '🟡',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    value: 'hard' as const,
    label: 'Hard',
    description: 'Advanced concepts',
    icon: '🔴',
    color: 'from-red-400 to-red-600'
  },
  {
    value: 'mixed' as const,
    label: 'Mixed',
    description: 'All difficulty levels',
    icon: '🎯',
    color: 'from-blue-400 to-purple-600'
  }
];

export const TimedQuizConfig: React.FC<TimedQuizConfigProps> = ({ onStartQuiz, onBack }) => {
  const [config, setConfig] = useState<TimedQuizConfig>({
    questionCount: 15,
    difficulty: 'mixed',
    timeLimit: 30 * 60 // 30 minutes in seconds
  });

  const handleStartQuiz = () => {
    onStartQuiz(config);
  };

  const calculateTimePerQuestion = () => {
    return Math.round(config.timeLimit / config.questionCount / 60 * 10) / 10; // minutes per question, rounded to 1 decimal
  };

  const getTimePresets = () => [
    { label: '20 min', value: 20 * 60, description: 'Quick session' },
    { label: '30 min', value: 30 * 60, description: 'Standard timing' },
    { label: '40 min', value: 40 * 60, description: 'Extended practice' },
    { label: '50 min', value: 50 * 60, description: 'USMLE pace' }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timed Challenge</h1>
          <p className="text-sm text-gray-600">Configure your timed quiz session</p>
        </div>
      </div>

      {/* Quick Stats Preview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-blue-600 mb-1">
                <Hash className="h-4 w-4" />
                <span className="text-lg font-bold">{config.questionCount}</span>
              </div>
              <span className="text-xs text-gray-600">Questions</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-purple-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-lg font-bold">{Math.round(config.timeLimit / 60)}</span>
              </div>
              <span className="text-xs text-gray-600">Minutes</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-orange-600 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-lg font-bold">{calculateTimePerQuestion()}</span>
              </div>
              <span className="text-xs text-gray-600">Min/Question</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Count Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Question Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">
                Number of questions: <span className="text-blue-600 font-bold">{config.questionCount}</span>
              </label>
              <input
                type="range"
                min="10"
                max="20"
                step="1"
                value={config.questionCount}
                onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
            
            {/* Quick selection buttons */}
            <div className="flex gap-2">
              {[10, 15, 20].map(count => (
                <Button
                  key={count}
                  variant={config.questionCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, questionCount: count }))}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Difficulty Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setConfig(prev => ({ ...prev, difficulty: option.value }))}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-left",
                  config.difficulty === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Limit Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Limit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {getTimePresets().map((preset) => (
              <button
                key={preset.value}
                onClick={() => setConfig(prev => ({ ...prev, timeLimit: preset.value }))}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all text-left",
                  config.timeLimit === preset.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="font-medium">{preset.label}</div>
                <div className="text-sm text-gray-600">{preset.description}</div>
              </button>
            ))}
          </div>
          
          {/* Custom time input */}
          <div className="mt-4 pt-4 border-t">
            <label className="text-sm font-medium mb-2 block">Custom Duration (minutes)</label>
            <input
              type="number"
              min="10"
              max="120"
              value={Math.round(config.timeLimit / 60)}
              onChange={(e) => setConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) * 60 }))}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
              placeholder="Enter custom duration..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Summary */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3">Session Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Questions:</span>
              <span className="font-medium">{config.questionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty:</span>
              <Badge variant="outline">
                {difficultyOptions.find(d => d.value === config.difficulty)?.label}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Limit:</span>
              <span className="font-medium">{Math.round(config.timeLimit / 60)} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time per Question:</span>
              <span className="font-medium text-blue-600">{calculateTimePerQuestion()} min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Quiz Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleStartQuiz}
            className="w-full"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Timed Challenge
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Challenge yourself with time pressure and track your progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
