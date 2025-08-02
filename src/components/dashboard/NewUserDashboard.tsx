import React from 'react';
import { Trophy, Target, TrendingUp, Flame, Play, Star } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { QuizModeSelector } from './QuizModeSelector';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface NewUserDashboardProps {
  userName?: string;
}

export const NewUserDashboard: React.FC<NewUserDashboardProps> = ({ userName }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section for New Users */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to MedQuiz Pro, {userName || 'Future Doctor'}! 🎉
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Start your journey to USMLE success with our comprehensive quiz platform.
          </p>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-blue-100">
              Ready to begin? Take your first quiz and start building your medical knowledge!
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started Stats - All Zero */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Points"
          value="0"
          icon={Trophy}
          trend="Start your first quiz!"
          color="blue"
        />
        <StatsCard
          title="Quizzes Completed"
          value="0"
          icon={Target}
          trend="Begin your journey"
          color="green"
        />
        <StatsCard
          title="Accuracy Rate"
          value="-%"
          icon={TrendingUp}
          trend="No data yet"
          color="purple"
        />
        <StatsCard
          title="Current Streak"
          value="0 days"
          icon={Flame}
          trend="Start building!"
          color="orange"
        />
      </div>

      {/* Get Started Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quiz Mode Selector - Highlighted for new users */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Play className="h-6 w-6 text-blue-600" />
                Take Your First Quiz
              </CardTitle>
              <p className="text-gray-600">
                Choose a quiz mode below to start your medical education journey!
              </p>
            </CardHeader>
            <CardContent>
              <QuizModeSelector />
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Getting Started Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Quick Quiz</p>
                <p className="text-xs text-blue-700">Perfect for beginners - 5 questions, no time pressure</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">Build Habits</p>
                <p className="text-xs text-green-700">Take a quiz daily to build your streak and improve</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900">Track Progress</p>
                <p className="text-xs text-purple-700">Your statistics will appear here as you practice</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to Start Your Medical Journey?
            </h3>
            <p className="text-gray-600">
              Join thousands of medical students who are already using MedQuiz Pro to ace their USMLE exams.
              Your first quiz is just one click away!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};