import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Brain, 
  Clock, 
  Target, 
  TrendingUp, 
  Award, 
  BookOpen, 
  PieChart,
  Activity,
  Zap,
  Calendar,
  Users
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const analyticsFeatures = [
    {
      id: 'performance',
      title: 'Performance Breakdown',
      description: 'Detailed accuracy analysis by medical specialty and topic',
      icon: BarChart3,
      color: 'blue',
      preview: 'See which areas need more focus with subject-specific accuracy rates'
    },
    {
      id: 'trends',
      title: 'Learning Trends',
      description: 'Track your improvement over time with visual progress charts',
      icon: TrendingUp,
      color: 'green',
      preview: 'Monitor daily, weekly, and monthly performance improvements'
    },
    {
      id: 'timing',
      title: 'Timing Analysis',
      description: 'Optimize your question-answering speed and efficiency',
      icon: Clock,
      color: 'orange',
      preview: 'Average time per question and identify areas for time management'
    },
    {
      id: 'strengths',
      title: 'Strengths & Weaknesses',
      description: 'AI-powered insights into your knowledge gaps and strong areas',
      icon: Brain,
      color: 'purple',
      preview: 'Personalized recommendations based on your performance patterns'
    },
    {
      id: 'comparison',
      title: 'Peer Comparison',
      description: 'See how you rank against other medical students',
      icon: Users,
      color: 'indigo',
      preview: 'Anonymous benchmarking with national averages and percentiles'
    },
    {
      id: 'goals',
      title: 'Goal Tracking',
      description: 'Monitor progress toward your USMLE preparation goals',
      icon: Target,
      color: 'red',
      preview: 'Visual progress indicators for daily, weekly, and exam goals'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      red: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Get in-depth insights into your USMLE preparation performance and study patterns.</p>
      </div>

      {/* Main Empty State */}
      <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="text-center p-0">
          <div className="mb-6">
            <div className="relative">
              <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                <Zap className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Unlock Powerful Analytics
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete your first quiz to access comprehensive performance analytics, personalized insights, 
              and data-driven recommendations to optimize your USMLE preparation strategy.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link to="/quiz">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Activity className="h-5 w-5 mr-2" />
                Start Analyzing Your Performance
              </Button>
            </Link>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Your analytics dashboard will provide detailed insights, performance trends, and study recommendations 
              based on your quiz results and learning patterns.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview of Analytics Features */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get Access To:</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsFeatures.map((feature) => (
            <Card 
              key={feature.id}
              className={`p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
                selectedInsight === feature.id 
                  ? getColorClasses(feature.color)
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedInsight(selectedInsight === feature.id ? null : feature.id)}
            >
              <CardContent className="p-0">
                <div className="flex items-start space-x-3">
                  <feature.icon 
                    className={`h-6 w-6 mt-0.5 ${
                      selectedInsight === feature.id 
                        ? `text-${feature.color}-600` 
                        : 'text-gray-400'
                    }`} 
                  />
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${
                      selectedInsight === feature.id ? `text-${feature.color}-900` : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className={`text-sm mb-2 ${
                      selectedInsight === feature.id ? `text-${feature.color}-700` : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                    {selectedInsight === feature.id && (
                      <div className={`text-xs p-2 rounded ${
                        feature.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        feature.color === 'green' ? 'bg-green-100 text-green-800' :
                        feature.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        feature.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                        feature.color === 'indigo' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feature.preview}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sample Analytics Preview */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-0">
          <div className="flex items-center space-x-3 mb-4">
            <PieChart className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sample Analytics View</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">2:15</div>
              <div className="text-sm text-gray-600">Avg. Time/Question</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">247</div>
              <div className="text-sm text-gray-600">Questions Completed</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg">
            <p className="text-sm text-indigo-700 text-center">
              <strong>Preview:</strong> This is how your analytics will look after completing quizzes. 
              Real data will replace these sample metrics.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="p-6 border-2 border-dashed border-blue-300 bg-blue-50">
        <CardContent className="text-center p-0">
          <Calendar className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start?</h3>
          <p className="text-gray-600 mb-4">
            Begin your USMLE preparation journey and unlock comprehensive analytics to guide your studies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/quiz">
              <Button className="w-full sm:w-auto">Take First Quiz</Button>
            </Link>
            <Link to="/progress">
              <Button variant="outline" className="w-full sm:w-auto">Set Study Goals</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};