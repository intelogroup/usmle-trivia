import { convexQuizService, type ConvexQuizSession, type ConvexQuestion } from './convexQuiz';
import type { QuestionData } from '../data/sampleQuestions';

export interface QuizSession {
  id: string;
  userId: string;
  mode: 'quick' | 'timed' | 'custom';
  questions: string[]; // Array of question IDs
  answers: (number | null)[]; // Array of user answers (null for unanswered)
  score: number;
  timeSpent: number; // Time in seconds
  status: 'active' | 'completed' | 'abandoned';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  usmleCategory: string;
  tags: string[];
  medicalReferences?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to convert Convex session to our format
function convertConvexSession(session: ConvexQuizSession): QuizSession {
  return {
    id: session._id,
    userId: session.userId,
    mode: session.mode,
    questions: session.questions,
    answers: session.answers,
    score: session.score,
    timeSpent: session.timeSpent,
    status: session.status,
    completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
    createdAt: new Date(session._creationTime),
    updatedAt: new Date(session._creationTime),
  };
}

// Helper function to convert Convex question to our format
function convertConvexQuestion(question: ConvexQuestion): Question {
  return {
    id: question._id,
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    category: question.category,
    difficulty: question.difficulty,
    usmleCategory: question.usmleCategory,
    tags: question.tags,
    medicalReferences: question.medicalReferences,
    createdAt: new Date(question._creationTime),
    updatedAt: new Date(question._creationTime),
  };
}

export const quizService = {
  /**
   * Create a new quiz session
   */
  async createQuizSession(
    userId: string,
    mode: 'quick' | 'timed' | 'custom',
    questionIds: string[]
  ): Promise<QuizSession> {
    const convexSession = await convexQuizService.createQuizSession(userId, mode, questionIds);
    return convertConvexSession(convexSession);
  },

  /**
   * Get a quiz session by ID
   */
  async getQuizSession(sessionId: string): Promise<QuizSession | null> {
    const convexSession = await convexQuizService.getQuizSession(sessionId);
    return convexSession ? convertConvexSession(convexSession) : null;
  },

  /**
   * Update a quiz session with user answer
   */
  async submitAnswer(
    sessionId: string,
    questionIndex: number,
    answer: number,
    timeSpent: number
  ): Promise<QuizSession> {
    const convexSession = await convexQuizService.submitAnswer(sessionId, questionIndex, answer, timeSpent);
    return convertConvexSession(convexSession);
  },

  /**
   * Complete a quiz session and calculate score
   */
  async completeQuizSession(sessionId: string, finalTimeSpent: number): Promise<QuizSession> {
    const convexSession = await convexQuizService.completeQuizSession(sessionId, finalTimeSpent);
    return convertConvexSession(convexSession);
  },

  /**
   * Get user's quiz history
   */
  async getUserQuizHistory(userId: string, limit: number = 10): Promise<QuizSession[]> {
    const convexSessions = await convexQuizService.getUserQuizHistory(userId, limit);
    return convexSessions.map(convertConvexSession);
  },

  /**
   * Create a question in the database
   */
  async createQuestion(questionData: QuestionData): Promise<Question> {
    const convexQuestion = await convexQuizService.createQuestion(questionData);
    return convertConvexQuestion(convexQuestion);
  },

  /**
   * Get questions from database
   */
  async getQuestions(
    filters?: {
      category?: string;
      difficulty?: string;
      limit?: number;
    }
  ): Promise<Question[]> {
    const convexQuestions = await convexQuizService.getQuestions(filters);
    return convexQuestions.map(convertConvexQuestion);
  },

  /**
   * Get a single question by ID
   */
  async getQuestion(questionId: string): Promise<Question | null> {
    const convexQuestion = await convexQuizService.getQuestion(questionId);
    return convexQuestion ? convertConvexQuestion(convexQuestion) : null;
  },

  /**
   * Batch create questions from sample data
   */
  async seedQuestions(questionsData: QuestionData[]): Promise<Question[]> {
    const convexQuestions = await convexQuizService.seedQuestions(questionsData);
    return convexQuestions.map(convertConvexQuestion);
  },

  /**
   * Get random questions for quiz
   */
  async getRandomQuestions(
    count: number,
    difficulty?: string,
    category?: string
  ): Promise<Question[]> {
    const convexQuestions = await convexQuizService.getRandomQuestions(count, difficulty, category);
    return convexQuestions.map(convertConvexQuestion);
  }
};