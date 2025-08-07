/**
 * Enhanced Quiz Completion Usage Examples
 * 
 * This file demonstrates how to use the new completeQuizWithStats mutation
 * and related helper queries in a React application.
 */

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

// Example 1: Basic Quiz Completion Component
export const QuizCompletionExample = ({ sessionId, totalTimeSpent, autoAdvanceCount }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  
  const completeQuizWithStats = useMutation(api.quiz.completeQuizWithStats);

  const handleCompleteQuiz = async () => {
    setIsCompleting(true);
    
    try {
      const result = await completeQuizWithStats({
        sessionId,
        finalTimeSpent: totalTimeSpent,
        autoAdvanceCount: autoAdvanceCount || 0
      });
      
      setCompletionResult(result);
      
      // Show success message with earned points
      console.log(`Quiz completed! You earned ${result.results.pointsEarned} points!`);
      console.log(`Your score: ${result.results.score}%`);
      
      // Navigate to results page or update UI
      // router.push('/quiz-results', { state: { results: result.results } });
      
    } catch (error) {
      console.error('Quiz completion failed:', error);
      // Handle error - show user-friendly message
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="quiz-completion">
      <button 
        onClick={handleCompleteQuiz} 
        disabled={isCompleting}
        className="complete-quiz-btn"
      >
        {isCompleting ? 'Completing Quiz...' : 'Complete Quiz'}
      </button>
      
      {completionResult && (
        <div className="completion-results">
          <h3>Quiz Completed!</h3>
          <div className="score">Score: {completionResult.results.score}%</div>
          <div className="points">Points Earned: +{completionResult.results.pointsEarned}</div>
          {completionResult.userStats && (
            <div className="user-stats">
              <p>New Level: {completionResult.userStats.level}</p>
              <p>Total Points: {completionResult.userStats.points}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Example 2: Quiz Potential Points Display
export const QuizPotentialPointsDisplay = ({ sessionId }) => {
  const potentialPoints = useQuery(api.quiz.calculateQuizPotentialPoints, { sessionId });
  
  if (!potentialPoints) return <div>Loading...</div>;

  return (
    <div className="potential-points">
      <h4>Quiz Overview</h4>
      <div className="total-points">
        <strong>Total Potential Points: {potentialPoints.totalPoints}</strong>
      </div>
      
      <div className="difficulty-breakdown">
        <div className="difficulty-item">
          <span className="difficulty easy">Easy</span>
          <span className="count">{potentialPoints.difficultyBreakdown.easy} questions</span>
          <span className="points">(2 pts each)</span>
        </div>
        <div className="difficulty-item">
          <span className="difficulty medium">Medium</span>
          <span className="count">{potentialPoints.difficultyBreakdown.medium} questions</span>
          <span className="points">(5 pts each)</span>
        </div>
        <div className="difficulty-item">
          <span className="difficulty hard">Hard</span>
          <span className="count">{potentialPoints.difficultyBreakdown.hard} questions</span>
          <span className="points">(10 pts each)</span>
        </div>
      </div>
      
      <div className="category-breakdown">
        <h5>Categories:</h5>
        {potentialPoints.breakdown.reduce((categories, item) => {
          categories[item.category] = (categories[item.category] || 0) + item.pointValue;
          return categories;
        }, {})}
      </div>
    </div>
  );
};

// Example 3: Comprehensive Results Display
export const QuizResultsDisplay = ({ results }) => {
  if (!results) return null;

  const { score, pointsEarned, correctAnswers, totalQuestions, performanceMetrics } = results;

  return (
    <div className="quiz-results-comprehensive">
      {/* Main Score Display */}
      <div className="score-section">
        <div className="score-circle">
          <span className="score-number">{score}%</span>
        </div>
        <div className="score-details">
          <p>{correctAnswers} out of {totalQuestions} correct</p>
          <p className="points-earned">+{pointsEarned} points earned</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-section">
        <h3>Performance Analysis</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Accuracy</span>
            <span className="value">{performanceMetrics.accuracy}%</span>
          </div>
          <div className="metric">
            <span className="label">Speed</span>
            <span className="value">{performanceMetrics.speed}/5</span>
          </div>
          <div className="metric">
            <span className="label">Consistency</span>
            <span className="value">{performanceMetrics.consistency}/5</span>
          </div>
        </div>
      </div>

      {/* Strength Areas */}
      {performanceMetrics.strengthAreas.length > 0 && (
        <div className="strength-section">
          <h4 className="section-title positive">🎯 Strength Areas</h4>
          <div className="areas-list">
            {performanceMetrics.strengthAreas.map((area, index) => (
              <span key={index} className="area-tag strength">{area}</span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Areas */}
      {performanceMetrics.improvementAreas.length > 0 && (
        <div className="improvement-section">
          <h4 className="section-title attention">📚 Areas for Improvement</h4>
          <div className="areas-list">
            {performanceMetrics.improvementAreas.map((area, index) => (
              <span key={index} className="area-tag improvement">{area}</span>
            ))}
          </div>
        </div>
      )}

      {/* Time Analysis */}
      <div className="time-section">
        <h4>Time Analysis</h4>
        <p>Total time: {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}</p>
        <p>Average per question: {Math.round((results.timeSpent / totalQuestions) * 10) / 10}s</p>
      </div>
    </div>
  );
};

// Example 4: Question Point Values Display
export const QuestionPointValues = ({ questionIds }) => {
  const pointValues = useQuery(api.quiz.getQuestionPointValues, { questionIds });
  
  if (!pointValues) return <div>Loading point values...</div>;

  return (
    <div className="question-points">
      <h5>Question Values</h5>
      {pointValues.map((item, index) => (
        <div key={index} className="question-value">
          <span className="question-number">Q{index + 1}</span>
          <span className={`difficulty ${item.difficulty}`}>{item.difficulty}</span>
          <span className="points">{item.pointValue} pts</span>
        </div>
      ))}
    </div>
  );
};

// Example 5: Custom Hook for Quiz Completion
export const useEnhancedQuizCompletion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const completeQuizWithStats = useMutation(api.quiz.completeQuizWithStats);
  
  const completeQuiz = async (sessionId, finalTimeSpent, autoAdvanceCount = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const completionResult = await completeQuizWithStats({
        sessionId,
        finalTimeSpent,
        autoAdvanceCount
      });
      
      setResult(completionResult);
      
      // Trigger success analytics or notifications
      console.log('Quiz completion successful:', {
        score: completionResult.results.score,
        pointsEarned: completionResult.results.pointsEarned,
        newLevel: completionResult.userStats?.level
      });
      
      return completionResult;
    } catch (err) {
      setError(err);
      console.error('Quiz completion error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  };
  
  return {
    completeQuiz,
    result,
    error,
    isLoading,
    reset
  };
};

// Example 6: Integration with Existing Quiz Components
export const EnhancedQuizPage = () => {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [autoAdvances, setAutoAdvances] = useState(0);
  
  const { completeQuiz, result, isLoading, error } = useEnhancedQuizCompletion();
  
  const handleQuizCompletion = async () => {
    try {
      await completeQuiz(currentSessionId, timeSpent, autoAdvances);
      // Quiz completed - result will be available in the result state
    } catch (error) {
      // Handle completion error
      console.error('Failed to complete quiz:', error);
    }
  };

  return (
    <div className="enhanced-quiz-page">
      {/* Quiz questions and interaction components */}
      
      {/* Potential points display */}
      {currentSessionId && (
        <QuizPotentialPointsDisplay sessionId={currentSessionId} />
      )}
      
      {/* Completion button */}
      <button 
        onClick={handleQuizCompletion}
        disabled={isLoading}
        className="complete-quiz-button"
      >
        {isLoading ? 'Completing...' : 'Complete Quiz'}
      </button>
      
      {/* Error handling */}
      {error && (
        <div className="error-message">
          Failed to complete quiz. Please try again.
        </div>
      )}
      
      {/* Results display */}
      {result && (
        <QuizResultsDisplay results={result.results} />
      )}
    </div>
  );
};

// CSS Classes for styling (optional)
export const quizCompletionStyles = `
.quiz-completion {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.complete-quiz-btn {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.complete-quiz-btn:hover {
  background: #2563eb;
}

.complete-quiz-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.completion-results {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.potential-points {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.difficulty-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.difficulty.easy { color: #10b981; }
.difficulty.medium { color: #f59e0b; }
.difficulty.hard { color: #ef4444; }

.quiz-results-comprehensive {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.score-number {
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.points-earned {
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.metric {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.areas-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.area-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.area-tag.strength {
  background: #d1fae5;
  color: #065f46;
}

.area-tag.improvement {
  background: #fef3c7;
  color: #92400e;
}

.section-title.positive {
  color: #10b981;
}

.section-title.attention {
  color: #f59e0b;
}
`;