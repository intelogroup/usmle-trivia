import React, { useState, useEffect } from 'react';
import { Clock, Trophy, Target, Calendar, ChevronRight, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store';
import { quizService, type QuizSession } from '../../services/quiz';
import { useNavigate } from 'react-router-dom';

interface QuizSessionCardProps {
  session: QuizSession;
  onRetry: (mode: string) => void;
}

const QuizSessionCard: React.FC<QuizSessionCardProps> = ({ session, onRetry }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'quick':
        return 'bg-green-100 text-green-800';
      case 'timed':
        return 'bg-blue-100 text-blue-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'quick':
        return 'Quick Quiz';
      case 'timed':
        return 'Timed Challenge';
      case 'custom':
        return 'Custom Practice';
      default:
        return mode;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(session.mode)}`}>
            {getModeLabel(session.mode)}
          </div>
          <span className="text-sm text-gray-500">{formatDate(session.createdAt)}</span>
        </div>
        <div className={`text-xl font-bold ${getScoreColor(session.score)}`}>
          {session.score}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{session.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">{formatDuration(session.timeSpent)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            {Math.round((session.score / 100) * session.questions.length)}/{session.questions.length} correct
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-24">
            <div 
              className={`h-2 rounded-full ${
                session.score >= 80 ? 'bg-green-500' : 
                session.score >= 60 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${session.score}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{session.score}%</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRetry(session.mode)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Play className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    </div>
  );
};

export const QuizSessionCards: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizHistory = async () => {
      if (!user?.id) return;
      
      try {
        const history = await quizService.getUserQuizHistory(user.id, 5);
        setSessions(history);
      } catch (error) {
        console.error('Error fetching quiz history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizHistory();
  }, [user?.id]);

  const handleRetryQuiz = (mode: string) => {
    navigate(`/app/quiz/${mode}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Quiz Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Quiz Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No quiz sessions yet</p>
            <p className="text-sm text-gray-500">
              Your quiz history will appear here once you complete some quizzes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Recent Quiz Sessions
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/progress')}
            className="text-blue-600 hover:text-blue-800"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <QuizSessionCard
              key={session.id}
              session={session}
              onRetry={handleRetryQuiz}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};