import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { type Question } from '../../services/quiz';
import { getAnalyticsAttributes } from '../../services/analytics';

interface QuizQuestionProps {
  question: Question;
  selectedAnswer: number | null;
  showExplanation: boolean;
  hasAnswered: boolean;
  onAnswerSelect: (answerIndex: number) => void;
  questionNumber: number;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedAnswer,
  showExplanation,
  hasAnswered,
  onAnswerSelect,
  questionNumber,
}) => {
  const showResult = showExplanation && hasAnswered;

  return (
    <Card className="border-0 shadow-custom-lg bg-gradient-to-br from-background to-muted/20 animate-fade-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full text-xs font-semibold shadow-sm">
              {question.category}
            </div>
            <div className="px-3 py-1.5 bg-muted/70 text-muted-foreground rounded-full text-xs font-medium capitalize border">
              {question.difficulty}
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">USMLE</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Text */}
        <div>
          <h2 className="text-lg font-semibold leading-relaxed mb-4 text-foreground">
            {question.question}
          </h2>
        </div>

        {/* Answer Options */}
        <fieldset 
          className="space-y-3"
          role="radiogroup"
          aria-labelledby="question-title"
          aria-describedby={showExplanation ? "explanation" : undefined}
        >
          <legend className="sr-only">Select your answer</legend>
          
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
            
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
                role="radio"
                aria-checked={isSelected}
                aria-label={`Option ${optionLabel}: ${option}${showResult && isCorrect ? ' (Correct answer)' : ''}${showResult && isSelected && !isCorrect ? ' (Your incorrect answer)' : ''}`}
                {...getAnalyticsAttributes('answer_option_click', {
                  questionId: question.id,
                  optionIndex: index.toString(),
                  questionNumber: questionNumber.toString()
                })}
                {...getAnalyticsAttributes('answer_selected', { 
                  questionId: question.id, 
                  optionIndex: index.toString(),
                  questionNumber: questionNumber.toString()
                })}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    showResult && isCorrect 
                      ? 'bg-green-500 text-white' 
                      : showResult && isSelected && !isCorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                  }`}>
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
        </fieldset>

        {/* Explanation */}
        {showExplanation && (
          <div className="border-t pt-6" id="explanation">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Explanation</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              {question.explanation}
            </p>
            
            {question.medicalReferences && question.medicalReferences.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">References:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {question.medicalReferences.map((ref, index) => (
                    <li key={index}>• {ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};