/**
 * Convex integration service for quiz results
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface QuizResults {
  sessionId: string;
  userId: string;
  mode: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  completionRate: number;
  performanceMetrics: {
    accuracy: number;
    speed: number;
    consistency: number;
    strengthAreas: string[];
    improvementAreas: string[];
  };
  questionBreakdown: Array<{
    questionId: string;
    category: string;
    difficulty: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    timeSpent?: number;
  }>;
  timestamp: Date;
  autoAdvanceCount?: number;
}

/**
 * Hook to save quiz results to Convex backend
 */
export const useSaveQuizResults = () => {
  const saveResults = useMutation(api.quiz.saveQuizResults);
  
  const save = async (results: QuizResults): Promise<boolean> => {
    try {
      const convexData = {
        sessionId: results.sessionId,
        userId: results.userId,
        mode: results.mode,
        score: results.score,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        incorrectAnswers: results.incorrectAnswers,
        timeSpent: results.timeSpent,
        averageTimePerQuestion: results.averageTimePerQuestion,
        completionRate: results.completionRate,
        performanceMetrics: results.performanceMetrics,
        questionBreakdown: results.questionBreakdown,
        timestamp: results.timestamp.getTime(),
        autoAdvanceCount: results.autoAdvanceCount,
      };

      const resultId = await saveResults(convexData);
      console.log('✅ Quiz results saved to Convex:', resultId);
      return true;
    } catch (error) {
      console.error('❌ Failed to save quiz results:', error);
      return false;
    }
  };

  return { save };
};

/**
 * Hook to get user's quiz results from Convex
 */
export const useGetUserQuizResults = (
  userId: string, 
  options?: { 
    limit?: number;
    mode?: string;
  }
) => {
  const results = useQuery(api.quiz.getUserQuizResults, {
    userId,
    limit: options?.limit,
    mode: options?.mode,
  });

  return {
    results: results || [],
    isLoading: results === undefined,
  };
};

/**
 * Hook to get user's quiz analytics from Convex
 */
export const useGetUserQuizAnalytics = (
  userId: string,
  timeframe?: "week" | "month" | "all"
) => {
  const analytics = useQuery(api.quiz.getUserQuizAnalytics, {
    userId,
    timeframe,
  });

  return {
    analytics: analytics || {
      totalQuizzes: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      strengthAreas: [],
      improvementAreas: [],
      progressTrend: "stable" as const,
    },
    isLoading: analytics === undefined,
  };
};