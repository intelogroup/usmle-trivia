import { Client, Account, Databases, Storage, Teams } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

// Database constants
export const DATABASE_ID = 'medquiz';
export const COLLECTIONS = {
  USERS: 'users',
  QUESTIONS: 'questions',
  QUIZ_SESSIONS: 'quiz_sessions',
  ANSWERS: 'answers',
  LEADERBOARD: 'leaderboard',
} as const;

// Storage constants
export const BUCKETS = {
  AVATARS: 'avatars',
  QUESTION_IMAGES: 'question_images',
} as const;

export default client;