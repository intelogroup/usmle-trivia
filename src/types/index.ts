// User types
export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  streak: number;
  totalQuizzes: number;
  accuracy: number;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz types
export interface IQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

export interface IQuizConfig {
  mode: 'quick' | 'timed' | 'custom';
  questionCount: number;
  timeLimit?: number; // in seconds
  topics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface IQuizSession {
  id: string;
  userId: string;
  config: IQuizConfig;
  questions: IQuestion[];
  answers: IAnswer[];
  startedAt: Date;
  endedAt?: Date;
  score: number;
  status: 'active' | 'completed' | 'abandoned';
}

export interface IAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

// Progress types
export interface ITopicProgress {
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  lastPracticed: Date;
}

export interface IPerformanceData {
  date: string;
  score: number;
  questionsAttempted: number;
}

// Leaderboard types
export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  level: number;
  accuracy: number;
  totalQuizzes: number;
}

// Notification types
export interface INotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}