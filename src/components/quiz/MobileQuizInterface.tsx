import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  XCircle,
  Brain,
  Star,
  Lightbulb,
  Vibrate,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Question } from '../../services/quiz';

interface MobileQuizInterfaceProps {
  questions: Question[];
  currentQuestionIndex: number;
  currentAnswer: number | null;
  hasAnswered: boolean;
  showExplanation: boolean;
  timeRemaining?: number | null;
  onAnswerSelect: (index: number) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onBookmarkToggle?: (questionId: string) => void;
  onConfidenceRating?: (questionId: string, rating: number) => void;
  isBookmarked?: boolean;
  confidenceRating?: number;
  onBack: () => void;
  mode: 'quick' | 'timed' | 'custom';
}

interface SwipeState {
  startX: number;
  currentX: number;
  isActive: boolean;
  direction: 'left' | 'right' | null;
}

export const MobileQuizInterface: React.FC<MobileQuizInterfaceProps> = ({
  questions,
  currentQuestionIndex,
  currentAnswer,
  hasAnswered,
  showExplanation,
  timeRemaining,
  onAnswerSelect,
  onNextQuestion,
  onPreviousQuestion,
  onBookmarkToggle,
  onConfidenceRating,
  isBookmarked = false,
  confidenceRating = 0,
  onBack,
  mode
}) => {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    currentX: 0,
    isActive: false,
    direction: null
  });
  const [showActions, setShowActions] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [localConfidence, setLocalConfidence] = useState(confidenceRating);
  const [readingMode, setReadingMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Haptic feedback
  const hapticFeedback = useCallback((pattern: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!vibrationEnabled || !navigator.vibrate) return;
    
    const patterns = {
      light: 10,
      medium: 50,
      heavy: 100
    };
    
    navigator.vibrate(patterns[pattern]);
  }, [vibrationEnabled]);

  // Sound feedback
  const soundFeedback = useCallback((type: 'correct' | 'incorrect' | 'navigation' = 'navigation') => {
    if (!soundEnabled) return;
    
    // Using Web Audio API for better mobile support
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      correct: 800,
      incorrect: 300,
      navigation: 600
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEnabled]);

  // Swipe gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeState({
      startX: touch.clientX,
      currentX: touch.clientX,
      isActive: true,
      direction: null
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeState.isActive) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const direction = deltaX > 0 ? 'right' : 'left';
    
    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      direction: Math.abs(deltaX) > 50 ? direction : null
    }));
  }, [swipeState.isActive, swipeState.startX]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeState.isActive) return;
    
    const deltaX = swipeState.currentX - swipeState.startX;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
      hapticFeedback('light');
      soundFeedback('navigation');
      
      if (deltaX > 0 && !isFirstQuestion) {
        // Swipe right - previous question
        onPreviousQuestion();
      } else if (deltaX < 0 && hasAnswered && !isLastQuestion) {
        // Swipe left - next question (only if answered)
        onNextQuestion();
      }
    }
    
    setSwipeState({
      startX: 0,
      currentX: 0,
      isActive: false,
      direction: null
    });
  }, [swipeState, hapticFeedback, soundFeedback, isFirstQuestion, isLastQuestion, hasAnswered, onPreviousQuestion, onNextQuestion]);

  // Handle answer selection with feedback
  const handleAnswerSelectWithFeedback = useCallback((index: number) => {
    const isCorrect = index === currentQuestion.correctAnswer;
    hapticFeedback(isCorrect ? 'light' : 'medium');
    soundFeedback(isCorrect ? 'correct' : 'incorrect');
    onAnswerSelect(index);
  }, [currentQuestion.correctAnswer, hapticFeedback, soundFeedback, onAnswerSelect]);

  // Handle confidence rating
  const handleConfidenceSelect = useCallback((rating: number) => {
    setLocalConfidence(rating);
    onConfidenceRating?.(currentQuestion.id, rating);
    hapticFeedback('light');
  }, [currentQuestion.id, onConfidenceRating, hapticFeedback]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Font size classes
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  // Reading mode - text-to-speech (simplified implementation)
  const toggleReadingMode = useCallback(() => {
    if (readingMode) {
      speechSynthesis.cancel();
      setReadingMode(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
      setReadingMode(true);
      
      utterance.onend = () => setReadingMode(false);
    }
  }, [readingMode, currentQuestion.question]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-background to-muted/10 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="text-sm font-semibold">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div className="text-xs text-muted-foreground capitalize">{mode} Quiz</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {timeRemaining !== null && timeRemaining !== undefined && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium',
                timeRemaining < 60 
                  ? 'bg-red-100 text-red-700 animate-pulse' 
                  : 'bg-muted'
              )}>
                <Clock className="h-3 w-3" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowActions(!showActions)}
              className="h-9 w-9"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentQuestionIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions Panel */}
      {showActions && (
        <div className="absolute top-20 right-4 z-40 bg-background border rounded-xl shadow-lg p-4 space-y-3 min-w-48">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Settings</span>
            <Button variant="ghost" size="sm" onClick={() => setShowActions(false)}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Vibration</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
              >
                <Vibrate className={cn("h-4 w-4", vibrationEnabled ? "text-primary" : "text-muted-foreground")} />
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Sound</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Reading</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleReadingMode}
              >
                {readingMode ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <span className="text-sm font-medium">Font Size</span>
            <div className="flex gap-1 mt-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={fontSize === size ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFontSize(size)}
                  className="flex-1 text-xs"
                >
                  {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question Content */}
      <div ref={questionRef} className="px-4 py-6 space-y-6">
        {/* Question Metadata */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 bg-primary text-white rounded-full text-xs font-medium">
              {currentQuestion.category}
            </span>
            <span className="px-2 py-1 bg-muted rounded-full text-xs font-medium capitalize">
              {currentQuestion.difficulty}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBookmarkToggle?.(currentQuestion.id)}
            className={cn(
              "h-8 w-8 p-0",
              isBookmarked ? "text-yellow-600" : "text-muted-foreground"
            )}
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>

        {/* Confidence Rating (Pre-Answer) */}
        {!hasAnswered && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">How confident are you?</span>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleConfidenceSelect(rating)}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200 touch-manipulation",
                      localConfidence >= rating 
                        ? "text-yellow-500 bg-yellow-100" 
                        : "text-gray-300 bg-gray-50"
                    )}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Text */}
        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Clinical Scenario</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleReadingMode}
                className="h-8 w-8 p-0"
              >
                {readingMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "leading-relaxed font-medium",
              fontSizeClasses[fontSize]
            )}>
              {currentQuestion.question}
            </p>
          </CardContent>
        </Card>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = currentAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = showExplanation;
            const optionLabel = String.fromCharCode(65 + index);
            
            let buttonClass = "w-full p-4 text-left border-2 rounded-xl transition-all duration-200 touch-manipulation active:scale-95 ";
            
            if (showResult) {
              if (isCorrect) {
                buttonClass += "border-green-500 bg-green-50 text-green-900";
              } else if (isSelected && !isCorrect) {
                buttonClass += "border-red-500 bg-red-50 text-red-900";
              } else {
                buttonClass += "border-muted bg-muted/30 text-muted-foreground";
              }
            } else if (isSelected) {
              buttonClass += "border-primary bg-primary/10 text-primary";
            } else {
              buttonClass += "border-muted bg-background hover:bg-muted/50 active:bg-muted";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelectWithFeedback(index)}
                disabled={hasAnswered}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200",
                    showResult && isCorrect 
                      ? 'bg-green-500 text-white' 
                      : showResult && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                  )}>
                    {optionLabel}
                  </div>
                  <span className={cn("flex-1 font-medium", fontSizeClasses[fontSize])}>
                    {option}
                  </span>
                  {showResult && (
                    <div className="flex-shrink-0">
                      {isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Explanation</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={cn("leading-relaxed text-blue-900/80", fontSizeClasses[fontSize])}>
                {currentQuestion.explanation}
              </p>
              
              {currentQuestion.medicalReferences && currentQuestion.medicalReferences.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">References:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {currentQuestion.medicalReferences.map((ref, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{ref}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 safe-area-pb">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onPreviousQuestion}
            disabled={isFirstQuestion}
            className="flex items-center gap-2 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Swipe Indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>← Swipe →</span>
          </div>

          <Button
            onClick={onNextQuestion}
            disabled={!hasAnswered}
            className="flex items-center gap-2 touch-manipulation"
            variant={hasAnswered ? "default" : "ghost"}
          >
            <span className="hidden sm:inline">
              {isLastQuestion ? 'Finish' : 'Next'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Swipe Direction Indicator */}
      {swipeState.isActive && swipeState.direction && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className={cn(
            "p-4 rounded-full bg-background/90 border-2 transition-all duration-200",
            swipeState.direction === 'left' ? "border-primary bg-primary/10" : "border-muted bg-muted/10"
          )}>
            {swipeState.direction === 'left' ? (
              <ArrowLeft className="h-8 w-8 text-primary" />
            ) : (
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};