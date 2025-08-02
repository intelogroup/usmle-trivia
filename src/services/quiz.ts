import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { ID } from 'appwrite';
import { ErrorHandler } from '../utils/errorHandler';
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

export const quizService = {
  /**
   * Create a new quiz session
   */
  async createQuizSession(
    userId: string,
    mode: 'quick' | 'timed' | 'custom',
    questionIds: string[]
  ): Promise<QuizSession> {
    try {
      const sessionData = {
        userId,
        mode,
        questions: JSON.stringify(questionIds),
        answers: JSON.stringify(new Array(questionIds.length).fill(null)),
        score: 0,
        timeSpent: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.QUIZ_SESSIONS,
        ID.unique(),
        sessionData
      );

      return {
        id: response.$id,
        userId: response.userId,
        mode: response.mode,
        questions: JSON.parse(response.questions),
        answers: JSON.parse(response.answers),
        score: response.score,
        timeSpent: response.timeSpent,
        status: response.status,
        completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
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
  async getQuizSession(sessionId: string): Promise<QuizSession | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.QUIZ_SESSIONS,
        sessionId
      );

      return {
        id: response.$id,
        userId: response.userId,
        mode: response.mode,
        questions: JSON.parse(response.questions),
        answers: JSON.parse(response.answers),
        score: response.score,
        timeSpent: response.timeSpent,
        status: response.status,
        completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
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
   * Update a quiz session with user answer
   */
  async submitAnswer(
    sessionId: string,
    questionIndex: number,
    answer: number,
    timeSpent: number
  ): Promise<QuizSession> {
    try {
      // First get the current session
      const currentSession = await this.getQuizSession(sessionId);
      if (!currentSession) {
        throw new Error('Quiz session not found');
      }

      // Update the answers array
      const updatedAnswers = [...currentSession.answers];
      updatedAnswers[questionIndex] = answer;

      const updateData = {
        answers: JSON.stringify(updatedAnswers),
        timeSpent,
        updatedAt: new Date().toISOString(),
      };

      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.QUIZ_SESSIONS,
        sessionId,
        updateData
      );

      return {
        id: response.$id,
        userId: response.userId,
        mode: response.mode,
        questions: JSON.parse(response.questions),
        answers: JSON.parse(response.answers),
        score: response.score,
        timeSpent: response.timeSpent,
        status: response.status,
        completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Submit Quiz Answer',
        { sessionId, questionIndex, answer }
      );
    }
  },

  /**
   * Complete a quiz session and calculate score
   */
  async completeQuizSession(sessionId: string, questions: Question[]): Promise<QuizSession> {
    try {
      const currentSession = await this.getQuizSession(sessionId);
      if (!currentSession) {
        throw new Error('Quiz session not found');
      }

      // Calculate score
      let correctAnswers = 0;
      currentSession.answers.forEach((answer, index) => {
        if (answer !== null && questions[index] && answer === questions[index].correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);

      const updateData = {
        score,
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.QUIZ_SESSIONS,
        sessionId,
        updateData
      );

      return {
        id: response.$id,
        userId: response.userId,
        mode: response.mode,
        questions: JSON.parse(response.questions),
        answers: JSON.parse(response.answers),
        score: response.score,
        timeSpent: response.timeSpent,
        status: response.status,
        completedAt: response.completedAt ? new Date(response.completedAt) : undefined,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
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
  async getUserQuizHistory(userId: string, limit: number = 10): Promise<QuizSession[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.QUIZ_SESSIONS,
        [
          `userId=${userId}`,
          `status=completed`,
          `orderBy=createdAt:desc`,
          `limit=${limit}`
        ]
      );

      return response.documents.map(doc => ({
        id: doc.$id,
        userId: doc.userId,
        mode: doc.mode,
        questions: JSON.parse(doc.questions),
        answers: JSON.parse(doc.answers),
        score: doc.score,
        timeSpent: doc.timeSpent,
        status: doc.status,
        completedAt: doc.completedAt ? new Date(doc.completedAt) : undefined,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
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
   * Create a question in the database
   */
  async createQuestion(questionData: QuestionData): Promise<Question> {
    try {
      const dbQuestionData = {
        question: questionData.question,
        options: JSON.stringify(questionData.options),
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        category: questionData.category,
        difficulty: questionData.difficulty,
        usmleCategory: questionData.usmleCategory,
        tags: JSON.stringify(questionData.tags),
        medicalReferences: JSON.stringify(questionData.medicalReferences || []),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.QUESTIONS,
        ID.unique(),
        dbQuestionData
      );

      return {
        id: response.$id,
        question: response.question,
        options: JSON.parse(response.options),
        correctAnswer: response.correctAnswer,
        explanation: response.explanation,
        category: response.category,
        difficulty: response.difficulty,
        usmleCategory: response.usmleCategory,
        tags: JSON.parse(response.tags),
        medicalReferences: JSON.parse(response.medicalReferences || '[]'),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      throw await ErrorHandler.handleError(
        error,
        'Create Question',
        { category: questionData.category, difficulty: questionData.difficulty }
      );
    }
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
    try {
      const queries = [];
      
      if (filters?.category) {
        queries.push(`category=${filters.category}`);
      }
      
      if (filters?.difficulty) {
        queries.push(`difficulty=${filters.difficulty}`);
      }
      
      if (filters?.limit) {
        queries.push(`limit=${filters.limit}`);
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.QUESTIONS,
        queries
      );

      return response.documents.map(doc => ({
        id: doc.$id,
        question: doc.question,
        options: JSON.parse(doc.options),
        correctAnswer: doc.correctAnswer,
        explanation: doc.explanation,
        category: doc.category,
        difficulty: doc.difficulty,
        usmleCategory: doc.usmleCategory,
        tags: JSON.parse(doc.tags),
        medicalReferences: JSON.parse(doc.medicalReferences || '[]'),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
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
   * Get a single question by ID
   */
  async getQuestion(questionId: string): Promise<Question | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.QUESTIONS,
        questionId
      );

      return {
        id: response.$id,
        question: response.question,
        options: JSON.parse(response.options),
        correctAnswer: response.correctAnswer,
        explanation: response.explanation,
        category: response.category,
        difficulty: response.difficulty,
        usmleCategory: response.usmleCategory,
        tags: JSON.parse(response.tags),
        medicalReferences: JSON.parse(response.medicalReferences || '[]'),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
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
   * Batch create questions from sample data
   */
  async seedQuestions(questionsData: QuestionData[]): Promise<Question[]> {
    const createdQuestions: Question[] = [];
    
    for (const questionData of questionsData) {
      try {
        const question = await this.createQuestion(questionData);
        createdQuestions.push(question);
      } catch (error) {
        console.error('Failed to create question:', questionData.question.substring(0, 50) + '...');
      }
    }
    
    return createdQuestions;
  }
};