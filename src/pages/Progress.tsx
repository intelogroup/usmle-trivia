import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Target, Clock, TrendingUp, Plus, BookOpen, Trophy, Calendar, CheckSquare } from 'lucide-react';

export const Progress: React.FC = () => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'exam'>('daily');
  const [goalValue, setGoalValue] = useState('');

  const handleSetGoal = () => {
    // TODO: Implement goal setting logic
    console.log(`Setting ${goalType} goal: ${goalValue}`);
    setShowGoalForm(false);
    setGoalValue('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Progress</h1>
        <p className="text-gray-600">Track your learning journey, set goals, and monitor your USMLE preparation progress.</p>
      </div>

      {/* Goal Setting Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Set Your Study Goals</h3>
            </div>
            {!showGoalForm && (
              <Button 
                onClick={() => setShowGoalForm(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
            )}
          </div>

          {showGoalForm ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { type: 'daily' as const, label: 'Daily Questions', icon: Calendar, desc: 'Questions per day' },
                  { type: 'weekly' as const, label: 'Weekly Score', icon: Trophy, desc: 'Target accuracy %' },
                  { type: 'exam' as const, label: 'Exam Date', icon: BookOpen, desc: 'USMLE exam date' }
                ].map((goal) => (
                  <button
                    key={goal.type}
                    onClick={() => setGoalType(goal.type)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      goalType === goal.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <goal.icon className={`h-5 w-5 mb-2 ${goalType === goal.type ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className={`font-medium ${goalType === goal.type ? 'text-blue-900' : 'text-gray-700'}`}>
                      {goal.label}
                    </div>
                    <div className={`text-sm ${goalType === goal.type ? 'text-blue-600' : 'text-gray-500'}`}>
                      {goal.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <input
                  type={goalType === 'exam' ? 'date' : 'number'}
                  placeholder={
                    goalType === 'daily' ? 'e.g., 20' :
                    goalType === 'weekly' ? 'e.g., 75' : ''
                  }
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleSetGoal} disabled={!goalValue}>
                  Set Goal
                </Button>
                <Button variant="ghost" onClick={() => setShowGoalForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">No goals set yet</p>
              <p className="text-sm text-gray-500">Set study goals to track your progress and stay motivated</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State - Start Journey */}
      <Card className="p-8">
        <CardContent className="text-center p-0">
          <div className="mb-6">
            <TrendingUp className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Begin Your USMLE Journey
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Take your first quiz to start tracking your progress, identify strengths and weaknesses, and get personalized study recommendations.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link to="/quiz">
              <Button size="lg" className="w-full sm:w-auto">
                <BookOpen className="h-5 w-5 mr-2" />
                Take Your First Quiz
              </Button>
            </Link>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Your progress dashboard will show detailed analytics, goal tracking, and performance trends across all medical specialties once you complete your first quiz.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Features Preview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-700 mb-1">Goal Progress</h4>
            <p className="text-sm text-gray-600">Track daily, weekly, and exam preparation goals with visual progress indicators</p>
          </div>
        </Card>
        
        <Card className="p-6 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-700 mb-1">Performance Trends</h4>
            <p className="text-sm text-gray-600">Monitor accuracy improvements across medical topics and question types</p>
          </div>
        </Card>

        <Card className="p-6 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <CheckSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-700 mb-1">Study Milestones</h4>
            <p className="text-sm text-gray-600">Celebrate achievements and track completed study sessions</p>
          </div>
        </Card>
      </div>
    </div>
  );
};