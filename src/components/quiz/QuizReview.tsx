import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  Bookmark,
  Flag,
  Home
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { QuizSession } from '../../services/quiz';

interface QuizReviewProps {
  session: QuizSession;
  onHome: () => void;
}

export const QuizReview: React.FC<QuizReviewProps> = ({ session, onHome }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // Fetch question details for review
  const questions = useQuery(api.quiz.getQuestionsByIds, { 
    questionIds: session.questions 
  });

  // Mutations for bookmarking and flagging
  const bookmarkQuestion = useMutation(api.quiz.bookmarkQuestion);
  const flagQuestion = useMutation(api.quiz.flagQuestion);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p>Loading review...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = session.answers[currentQuestionIndex];
  const isCorrect = userAnswer === currentQuestion.correctAnswer;

  const handleBookmark = async () => {
    const questionId = currentQuestion._id;
    const isBookmarked = bookmarkedQuestions.has(questionId);
    
    if (isBookmarked) {
      bookmarkedQuestions.delete(questionId);
    } else {
      bookmarkedQuestions.add(questionId);
    }
    
    setBookmarkedQuestions(new Set(bookmarkedQuestions));
    
    // Save to database
    await bookmarkQuestion({
      userId: session.userId,
      questionId,
      bookmarked: !isBookmarked
    });
  };

  const handleFlag = async () => {
    const questionId = currentQuestion._id;
    const isFlagged = flaggedQuestions.has(questionId);
    
    if (isFlagged) {
      flaggedQuestions.delete(questionId);
    } else {
      flaggedQuestions.add(questionId);
    }
    
    setFlaggedQuestions(new Set(flaggedQuestions));
    
    // Save to database
    await flagQuestion({
      userId: session.userId,
      questionId,
      flagged: !isFlagged,
      reason: 'Review needed'
    });
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quiz Review</h1>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <Button onClick={onHome} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex gap-1">
        {questions.map((_, index) => {
          const answered = session.answers[index];
          const correct = answered === questions[index].correctAnswer;
          
          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`h-2 flex-1 rounded-full transition-all ${
                index === currentQuestionIndex
                  ? 'h-3 bg-primary'
                  : correct
                  ? 'bg-green-500'
                  : answered !== null
                  ? 'bg-red-500'
                  : 'bg-muted'
              }`}
            />
          );
        })}
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                {currentQuestion.category}
              </div>
              <div className="px-2 py-1 bg-muted rounded text-xs font-medium capitalize">
                {currentQuestion.difficulty}
              </div>
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                className={bookmarkedQuestions.has(currentQuestion._id) ? 'text-yellow-500' : ''}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFlag}
                className={flaggedQuestions.has(currentQuestion._id) ? 'text-red-500' : ''}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div>
            <p className="text-base leading-relaxed">{currentQuestion.question}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isUserAnswer = userAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correctAnswer;
              
              let className = "w-full p-4 text-left border-2 rounded-lg ";
              
              if (isCorrectAnswer) {
                className += "border-green-500 bg-green-50";
              } else if (isUserAnswer && !isCorrectAnswer) {
                className += "border-red-500 bg-red-50";
              } else {
                className += "border-muted bg-muted/50 opacity-60";
              }
              
              return (
                <div key={index} className={className}>
                  <div className="flex items-center justify-between">
                    <span className={isCorrectAnswer ? 'text-green-900' : isUserAnswer ? 'text-red-900' : ''}>
                      {option}
                    </span>
                    {isCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {isUserAnswer && !isCorrectAnswer && <XCircle className="h-5 w-5 text-red-600" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Explanation</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              {currentQuestion.explanation}
            </p>
            
            {currentQuestion.medicalReferences && currentQuestion.medicalReferences.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">References:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {currentQuestion.medicalReferences.map((ref, index) => (
                    <li key={index}>• {ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Your Answer Summary */}
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm font-medium">
              {isCorrect ? '✅ You answered correctly!' : '❌ You answered incorrectly'}
            </p>
            {!isCorrect && userAnswer !== null && (
              <p className="text-xs mt-1">
                Your answer: {currentQuestion.options[userAnswer]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigateQuestion('prev')}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
        
        <Button
          variant="outline"
          onClick={() => navigateQuestion('next')}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Review Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {session.answers.filter((a, i) => a === questions[i].correctAnswer).length}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {session.answers.filter((a, i) => a !== null && a !== questions[i].correctAnswer).length}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {bookmarkedQuestions.size}
              </div>
              <div className="text-xs text-muted-foreground">Bookmarked</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {flaggedQuestions.size}
              </div>
              <div className="text-xs text-muted-foreground">Flagged</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};