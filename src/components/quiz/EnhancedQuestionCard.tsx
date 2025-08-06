import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Clock,
  Brain,
  Star,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Question } from '../../services/quiz';

interface EnhancedQuestionCardProps {
  question: Question;
  currentAnswer: number | null;
  hasAnswered: boolean;
  showExplanation: boolean;
  onAnswerSelect: (index: number) => void;
  onBookmarkToggle?: (questionId: string) => void;
  onConfidenceRating?: (questionId: string, rating: number) => void;
  isBookmarked?: boolean;
  confidenceRating?: number;
  timeSpent?: number;
}

export const EnhancedQuestionCard: React.FC<EnhancedQuestionCardProps> = ({
  question,
  currentAnswer,
  hasAnswered,
  showExplanation,
  onAnswerSelect,
  onBookmarkToggle,
  onConfidenceRating,
  isBookmarked = false,
  confidenceRating = 0,
  timeSpent = 0,
}) => {
  const [showReferences, setShowReferences] = useState(false);
  const [localConfidence, setLocalConfidence] = useState(confidenceRating);

  const handleConfidenceSelect = (rating: number) => {
    setLocalConfidence(rating);
    onConfidenceRating?.(question.id, rating);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-0 shadow-custom-lg bg-gradient-to-br from-background to-muted/10 animate-fade-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Question Metadata */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full text-xs font-semibold shadow-sm">
              {question.category}
            </div>
            <div className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border',
              getDifficultyColor(question.difficulty)
            )}>
              {question.difficulty.toUpperCase()}
            </div>
            {question.usmleCategory && (
              <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                {question.usmleCategory}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {timeSpent > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTime(timeSpent)}</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBookmarkToggle?.(question.id)}
              className={cn(
                "p-2 hover:bg-yellow-100 transition-colors duration-200",
                isBookmarked && "text-yellow-600 bg-yellow-50"
              )}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center gap-1 text-primary">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-medium">USMLE</span>
            </div>
          </div>
        </div>

        {/* Confidence Rating (Pre-Answer) */}
        {!hasAnswered && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">How confident are you?</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleConfidenceSelect(rating)}
                    className={cn(
                      "p-1 rounded transition-colors duration-200",
                      localConfidence >= rating 
                        ? "text-yellow-500 hover:text-yellow-600" 
                        : "text-gray-300 hover:text-yellow-400"
                    )}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Rate your confidence before answering to track your learning progress
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Enhanced Question Text */}
        <div className="prose prose-sm max-w-none">
          <div className="p-6 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border-l-4 border-primary relative">
            <div className="absolute top-4 right-4">
              <AlertCircle className="h-5 w-5 text-primary opacity-70" />
            </div>
            <p className="text-base leading-relaxed font-medium text-foreground m-0 pr-8">
              {question.question}
            </p>
          </div>
        </div>

        {/* Enhanced Answer Options */}
        <div className="space-y-4">
          {question.options.map((option, index) => {
            const isSelected = currentAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const showResult = showExplanation;
            const optionLabel = String.fromCharCode(65 + index);
            
            let buttonClass = "group w-full p-5 text-left border-2 rounded-xl transition-all duration-300 relative overflow-hidden ";
            
            if (showResult) {
              if (isCorrect) {
                buttonClass += "border-green-500 bg-gradient-to-r from-green-50 to-green-100/50 text-green-900 shadow-green-200/50 shadow-lg";
              } else if (isSelected && !isCorrect) {
                buttonClass += "border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 text-red-900 shadow-red-200/50 shadow-lg";
              } else {
                buttonClass += "border-muted bg-muted/30 text-muted-foreground";
              }
            } else if (isSelected) {
              buttonClass += "border-primary bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-primary/20 shadow-lg transform scale-[1.02]";
            } else {
              buttonClass += "border-muted hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/2 hover:shadow-md hover:scale-[1.01]";
            }

            return (
              <button
                key={index}
                onClick={() => onAnswerSelect(index)}
                disabled={hasAnswered}
                className={buttonClass}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200",
                    showResult && isCorrect 
                      ? 'bg-green-500 text-white' 
                      : showResult && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                  )}>
                    {optionLabel}
                  </div>
                  <span className="flex-1 font-medium">{option}</span>
                  <div className="flex-shrink-0 transition-all duration-200">
                    {showResult && isCorrect && <CheckCircle className="h-6 w-6 text-green-600" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-600" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Enhanced Explanation Section */}
        {showExplanation && (
          <div className="border-t pt-6 space-y-4">
            {/* Performance Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Brain className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Confidence</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={cn(
                        "h-3 w-3 fill-current",
                        localConfidence >= star ? "text-yellow-500" : "text-gray-300"
                      )} />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-green-900">Accuracy</div>
                  <div className="text-xs text-green-700">
                    {currentAnswer === question.correctAnswer ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-purple-900">Time</div>
                  <div className="text-xs text-purple-700">{formatTime(timeSpent)}</div>
                </div>
              </div>
            </div>

            {/* Detailed Explanation */}
            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Medical Explanation</h3>
              </div>
              <p className="text-sm leading-relaxed text-blue-900/80 mb-4">
                {question.explanation}
              </p>
              
              {/* Key Learning Points */}
              {question.tags && question.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Key Concepts:</h4>
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Medical References */}
            {question.medicalReferences && question.medicalReferences.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border">
                <button
                  onClick={() => setShowReferences(!showReferences)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Medical References ({question.medicalReferences.length})
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </button>
                
                {showReferences && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <ul className="text-sm text-gray-700 space-y-2">
                      {question.medicalReferences.map((ref, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-500 mt-1">•</span>
                          <span>{ref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};