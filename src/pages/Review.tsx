import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useGetUserBookmarks, useGetUserQuizHistory } from '../services/convexQuiz';
import { QuizReview } from '../components/quiz/QuizReview';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BookOpen, Clock, Star, TrendingUp } from 'lucide-react';

export const Review: React.FC = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'recent' | 'bookmarks' | 'review'>('recent');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Fetch user data
  const bookmarkedQuestions = useGetUserBookmarks(user?.id || '', 20);
  const recentSessions = useGetUserQuizHistory(user?.id || '', 10);

  const tabs = [
    {
      id: 'recent' as const,
      label: 'Recent Quizzes',
      icon: Clock,
      count: recentSessions?.length || 0
    },
    {
      id: 'bookmarks' as const,
      label: 'Bookmarked',
      icon: Star,
      count: bookmarkedQuestions?.length || 0
    },
    {
      id: 'review' as const,
      label: 'Need Review',
      icon: TrendingUp,
      count: 0 // TODO: Implement questions that need review based on performance
    }
  ];

  // Handle quiz review
  const handleReviewSession = (sessionId: string) => {
    setSelectedSession(sessionId);
  };

  const handleBackToList = () => {
    setSelectedSession(null);
  };

  // If reviewing a specific session, show the QuizReview component
  if (selectedSession) {
    return (
      <QuizReview 
        sessionId={selectedSession}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Review</h1>
          <p className="text-muted-foreground">
            Review your progress and revisit important questions
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{user?.accuracy || 0}%</div>
          <div className="text-sm text-muted-foreground">Overall Accuracy</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Recent Quizzes Tab */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {recentSessions && recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <Card key={session._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium capitalize">
                            {session.mode} Quiz
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            session.score >= 80 ? 'bg-green-100 text-green-800' :
                            session.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {session.score}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.questions.length} questions • {Math.floor(session.timeSpent / 60)}m {session.timeSpent % 60}s
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(session._creationTime).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewSession(session._id)}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No recent quizzes</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete some quizzes to see them here for review
                  </p>
                  <Button onClick={() => window.location.href = '/quiz'}>
                    Start First Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Bookmarked Questions Tab */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            {bookmarkedQuestions && bookmarkedQuestions.length > 0 ? (
              <div className="grid gap-4">
                {bookmarkedQuestions.map((question) => (
                  <Card key={question._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {question.difficulty}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {question.category} • {question.usmleCategory}
                              </span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                              {question.question.length > 200 
                                ? question.question.substring(0, 200) + '...'
                                : question.question
                              }
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Bookmarked on {new Date((question as any).bookmarkedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Study
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No bookmarked questions</h3>
                  <p className="text-muted-foreground mb-4">
                    Bookmark questions during quizzes to study them later
                  </p>
                  <Button onClick={() => window.location.href = '/quiz'}>
                    Take a Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Need Review Tab */}
        {activeTab === 'review' && (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Intelligent Review Coming Soon</h3>
              <p className="text-muted-foreground">
                We're working on an AI-powered system to identify questions that need your attention based on your performance patterns.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};