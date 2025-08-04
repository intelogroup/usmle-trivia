// import { useMutation, useQuery } from "convex/react";
// import { api } from "../../convex/_generated/api";
import { ErrorHandler } from "../utils/errorHandler";
import type { QuestionData } from "../data/sampleQuestions";

export interface ConvexQuizSession {
  _id: string;
  userId: string;
  mode: 'quick' | 'timed' | 'custom';
  questions: string[]; // Array of question IDs
  answers: (number | null)[]; // Array of user answers
  score: number;
  timeSpent: number;
  status: 'active' | 'completed' | 'abandoned';
  completedAt?: number;
  _creationTime: number;
}

export interface ConvexQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  usmleCategory: string;
  tags: string[];
  medicalReferences?: string[];
  imageUrl?: string;
  lastReviewed?: number;
  _creationTime: number;
}

export const convexQuizService = {
  /**
   * Create a new quiz session
   */
  async createQuizSession(
    userId: string,
    mode: 'quick' | 'timed' | 'custom',
    questionIds: string[]
  ): Promise<ConvexQuizSession> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/createQuizSession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, mode, questionIds })
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz session');
      }

      const sessionId = await response.text();
      const session = await this.getQuizSession(sessionId);
      
      if (!session) {
        throw new Error('Failed to retrieve created session');
      }

      return session;
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Create Quiz Session',
        { userId, mode, questionCount: questionIds.length }
      );
    }
  },

  /**
   * Get a quiz session by ID
   */
  async getQuizSession(sessionId: string): Promise<ConvexQuizSession | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/getQuizSession?sessionId=${sessionId}`);
      
      if (!response.ok) {
        return null;
      }

      const session = await response.json();
      return session;
    } catch (error) {
      await ErrorHandler.handleError(
        error,
        'Get Quiz Session',
        { sessionId }
      );
      return null;
    }
  },

  /**
   * Submit an answer to a quiz question
   */
  async submitAnswer(
    sessionId: string,
    questionIndex: number,
    answer: number,
    timeSpent: number
  ): Promise<ConvexQuizSession> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/submitAnswer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, questionIndex, answer, timeSpent })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const updatedSession = await response.json();
      return updatedSession;
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Submit Quiz Answer',
        { sessionId, questionIndex, answer }
      );
    }
  },

  /**
   * Complete a quiz session
   */
  async completeQuizSession(sessionId: string, finalTimeSpent: number): Promise<ConvexQuizSession> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/completeQuizSession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, finalTimeSpent })
      });

      if (!response.ok) {
        throw new Error('Failed to complete quiz session');
      }

      const completedSession = await response.json();
      return completedSession;
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Complete Quiz Session',
        { sessionId }
      );
    }
  },

  /**
   * Get user's quiz history
   */
  async getUserQuizHistory(userId: string, limit: number = 10): Promise<ConvexQuizSession[]> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/getUserQuizHistory?userId=${userId}&limit=${limit}`);

      if (!response.ok) {
        return [];
      }

      const sessions = await response.json();
      return sessions || [];
    } catch (error) {
      await ErrorHandler.handleError(
        error,
        'Get User Quiz History',
        { userId, limit }
      );
      return [];
    }
  },

  /**
   * Get questions with filters
   */
  async getQuestions(
    filters?: {
      category?: string;
      difficulty?: string;
      usmleCategory?: string;
      limit?: number;
    }
  ): Promise<ConvexQuestion[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.usmleCategory) params.append('usmleCategory', filters.usmleCategory);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/getQuestions?${params.toString()}`);

      if (!response.ok) {
        return [];
      }

      const questions = await response.json();
      return questions || [];
    } catch (error) {
      await ErrorHandler.handleError(
        error,
        'Get Questions',
        { filters }
      );
      return [];
    }
  },

  /**
   * Get random questions for quiz
   */
  async getRandomQuestions(
    count: number,
    difficulty?: string,
    category?: string
  ): Promise<ConvexQuestion[]> {
    try {
      const params = new URLSearchParams();
      params.append('count', count.toString());
      if (difficulty) params.append('difficulty', difficulty);
      if (category) params.append('category', category);

      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/getRandomQuestions?${params.toString()}`);

      if (!response.ok) {
        return [];
      }

      const questions = await response.json();
      return questions || [];
    } catch (error) {
      await ErrorHandler.handleError(
        error,
        'Get Random Questions',
        { count, difficulty, category }
      );
      return [];
    }
  },

  /**
   * Get a single question by ID
   */
  async getQuestion(questionId: string): Promise<ConvexQuestion | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/getQuestion?questionId=${questionId}`);

      if (!response.ok) {
        return null;
      }

      const question = await response.json();
      return question;
    } catch (error) {
      await ErrorHandler.handleError(
        error,
        'Get Question',
        { questionId }
      );
      return null;
    }
  },

  /**
   * Create a question
   */
  async createQuestion(questionData: QuestionData): Promise<ConvexQuestion> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/createQuestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });

      if (!response.ok) {
        throw new Error('Failed to create question');
      }

      const question = await response.json();
      return question;
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Create Question',
        { category: questionData.category, difficulty: questionData.difficulty }
      );
    }
  },

  /**
   * Batch create questions from sample data
   */
  async seedQuestions(questionsData: QuestionData[]): Promise<ConvexQuestion[]> {
    try {
      const response = await fetch(`${import.meta.env.VITE_CONVEX_URL}/batchCreateQuestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsData })
      });

      if (!response.ok) {
        throw new Error('Failed to seed questions');
      }

      const questionIds = await response.json();
      
      // Get the created questions
      const questions = await Promise.all(
        questionIds.map((id: string) => this.getQuestion(id))
      );
      
      return questions.filter(Boolean) as ConvexQuestion[];
    } catch (error) {
      await ErrorHandler.handleError(
        error,
        'Seed Questions',
        { count: questionsData.length }
      );
      return [];
    }
  }
};

// React hooks for Convex quiz operations - Production Ready (uncomment after function deployment)
// export const useCreateQuestion = () => useMutation(api.quiz.createQuestion);
// export const useGetQuestions = (filters?: { category?: string; difficulty?: string; limit?: number }) => 
//   useQuery(api.quiz.getQuestions, filters);
// export const useGetQuestion = (questionId: string) => 
//   useQuery(api.quiz.getQuestion, { questionId });
// export const useGetRandomQuestions = (count: number, difficulty?: string, category?: string) => 
//   useQuery(api.quiz.getRandomQuestions, { count, difficulty, category });
// export const useCreateQuizSession = () => useMutation(api.quiz.createQuizSession);
// export const useGetQuizSession = (sessionId: string) => 
//   useQuery(api.quiz.getQuizSession, { sessionId });
// export const useSubmitAnswer = () => useMutation(api.quiz.submitAnswer);
// export const useCompleteQuizSession = () => useMutation(api.quiz.completeQuizSession);
// export const useGetUserQuizHistory = (userId: string, limit?: number) => 
//   useQuery(api.quiz.getUserQuizHistory, { userId, limit });
// export const useBatchCreateQuestions = () => useMutation(api.quiz.batchCreateQuestions);