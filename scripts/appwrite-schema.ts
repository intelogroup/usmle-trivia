/**
 * MedQuiz Pro - Appwrite Database Schema Information
 * Generated on: 2025-08-02
 * Database ID: 688cbab3000f24cafc0c
 */

export const DATABASE_CONFIG = {
  databaseId: '688cbab3000f24cafc0c',
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '688cb738000d2fbeca0a',
} as const;

export const COLLECTIONS = {
  USERS: 'users',
  QUESTIONS: 'questions',
  QUIZ_SESSIONS: 'quiz_sessions',
} as const;

// Type definitions for collections
export interface User {
  $id?: string;
  email: string;
  name: string;
  points?: number;
  level?: number;
  streak?: number;
  accuracy?: number;
  medicalLevel?: 'student' | 'resident' | 'physician';
  specialties?: string; // JSON array
  studyGoals?: string; // USMLE Step 1/2/3
  totalQuizzes?: number;
  preferences?: string; // JSON string
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  $id?: string;
  question: string;
  options: string; // JSON array of answer choices
  correctAnswer: number; // Index of correct answer
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  usmleCategory?: 'anatomy' | 'pathology' | 'pharmacology' | 'physiology' | 'biochemistry' | 'microbiology' | 'immunology' | 'behavioral-science';
  tags?: string; // JSON array
  imageUrl?: string;
  medicalReferences?: string; // JSON array
  lastReviewed?: string;
  // Note: accuracyStats attribute couldn't be added due to collection limit
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizSession {
  $id?: string;
  userId: string;
  mode: 'quick' | 'timed' | 'custom';
  questions: string; // JSON array of question IDs
  answers?: string; // JSON array of user answers
  score?: number;
  timeSpent?: number; // Time in seconds
  status?: 'active' | 'completed' | 'abandoned';
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Collection permissions
export const PERMISSIONS = {
  USERS: {
    read: ['any'],
    create: ['users'],
    update: ['users'],
    delete: ['users'],
  },
  QUESTIONS: {
    read: ['any'],
    create: ['users'],
    update: ['users'],
    delete: ['users'],
  },
  QUIZ_SESSIONS: {
    read: ['users'],
    create: ['users'],
    update: ['users'],
    delete: ['users'],
  },
} as const;

// Indexes created for performance
export const INDEXES = {
  USERS: [
    { key: 'email_index', type: 'unique', attributes: ['email'] }
  ],
  QUESTIONS: [
    { key: 'category_index', type: 'key', attributes: ['category'] },
    { key: 'difficulty_index', type: 'key', attributes: ['difficulty'] }
  ],
  QUIZ_SESSIONS: [
    { key: 'user_sessions_index', type: 'key', attributes: ['userId'] }
  ],
} as const;

// Helper functions for working with JSON fields
export const JsonHelpers = {
  parseOptions: (options: string): string[] => JSON.parse(options),
  stringifyOptions: (options: string[]): string => JSON.stringify(options),
  
  parseSpecialties: (specialties: string): string[] => JSON.parse(specialties || '[]'),
  stringifySpecialties: (specialties: string[]): string => JSON.stringify(specialties),
  
  parseTags: (tags: string): string[] => JSON.parse(tags || '[]'),
  stringifyTags: (tags: string[]): string => JSON.stringify(tags),
  
  parseReferences: (refs: string): string[] => JSON.parse(refs || '[]'),
  stringifyReferences: (refs: string[]): string => JSON.stringify(refs),
  
  parsePreferences: (prefs: string): Record<string, any> => JSON.parse(prefs || '{}'),
  stringifyPreferences: (prefs: Record<string, any>): string => JSON.stringify(prefs),
  
  parseQuestionIds: (questions: string): string[] => JSON.parse(questions),
  stringifyQuestionIds: (questions: string[]): string => JSON.stringify(questions),
  
  parseAnswers: (answers: string): number[] => JSON.parse(answers || '[]'),
  stringifyAnswers: (answers: number[]): string => JSON.stringify(answers),
};

// Sample data structures for testing
export const SAMPLE_DATA = {
  user: {
    email: 'student@example.com',
    name: 'Medical Student',
    points: 0,
    level: 1,
    streak: 0,
    accuracy: 0,
    medicalLevel: 'student' as const,
    specialties: JsonHelpers.stringifySpecialties(['internal-medicine', 'surgery']),
    studyGoals: 'USMLE Step 1',
    totalQuizzes: 0,
    preferences: JsonHelpers.stringifyPreferences({
      theme: 'light',
      notifications: true,
      difficulty: 'medium'
    }),
  } satisfies Omit<User, '$id' | 'createdAt' | 'updatedAt'>,
  
  question: {
    question: 'A 45-year-old patient presents with chest pain. Which of the following is the most likely diagnosis?',
    options: JsonHelpers.stringifyOptions([
      'Myocardial infarction',
      'Gastroesophageal reflux',
      'Pulmonary embolism',
      'Aortic dissection'
    ]),
    correctAnswer: 0,
    explanation: 'Given the patient\'s age and presentation, myocardial infarction is the most likely diagnosis and requires immediate evaluation.',
    category: 'Cardiology',
    difficulty: 'medium' as const,
    usmleCategory: 'pathology' as const,
    tags: JsonHelpers.stringifyTags(['chest-pain', 'cardiology', 'emergency']),
    medicalReferences: JsonHelpers.stringifyReferences([
      'Harrison\'s Principles of Internal Medicine, 21st Edition',
      'Braunwald\'s Heart Disease, 12th Edition'
    ]),
  } satisfies Omit<Question, '$id' | 'createdAt' | 'updatedAt' | 'imageUrl' | 'lastReviewed'>,
};