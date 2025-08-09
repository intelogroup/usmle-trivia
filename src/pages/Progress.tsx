import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Target, Clock, TrendingUp } from 'lucide-react';

export const Progress: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Progress</h1>
        <p className="text-gray-600">Track your learning journey and improvement over time.</p>
      </div>

      {/* Empty State */}
      <Card className="p-8">
        <CardContent className="text-center p-0">
          <div className="mb-6">
            <TrendingUp className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your Learning Journey
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Take your first quiz to begin tracking your progress and see detailed analytics about your USMLE preparation.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link to="/quiz">
              <Button size="lg" className="w-full sm:w-auto">
                Take Your First Quiz
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              Complete quizzes to unlock progress tracking, performance analytics, and personalized study insights.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Future Progress Features Preview */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-700 mb-1">Accuracy Tracking</h4>
            <p className="text-sm text-gray-600">Monitor your performance across different medical topics</p>
          </div>
        </Card>
        
        <Card className="p-6 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-700 mb-1">Study Time</h4>
            <p className="text-sm text-gray-600">Track daily and weekly study sessions</p>
          </div>
        </Card>
      </div>
    </div>
  );
};