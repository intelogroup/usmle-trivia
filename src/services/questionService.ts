/**
 * Dynamic Question Service
 * Loads questions on-demand to reduce initial bundle size
 */

import type { QuestionData } from '../data/sampleQuestions';

// Cache for loaded questions to avoid re-fetching
let questionsCache: QuestionData[] | null = null;

/**
 * Dynamically import sample questions to avoid including them in main bundle
 */
export async function loadSampleQuestions(): Promise<QuestionData[]> {
  if (questionsCache) {
    return questionsCache;
  }

  try {
    // Dynamic import to split questions into separate chunk
    const module = await import('../data/sampleQuestions');
    questionsCache = module.sampleQuestions;
    return questionsCache;
  } catch (error) {
    console.error('Failed to load sample questions:', error);
    return [];
  }
}

/**
 * Get questions by category
 */
export async function getQuestionsByCategory(category: string): Promise<QuestionData[]> {
  const questions = await loadSampleQuestions();
  return questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get questions by difficulty
 */
export async function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<QuestionData[]> {
  const questions = await loadSampleQuestions();
  return questions.filter(q => q.difficulty === difficulty);
}

/**
 * Get random questions for quiz
 */
export async function getRandomQuestions(count: number, filters?: {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  excludeIds?: string[];
}): Promise<QuestionData[]> {
  const questions = await loadSampleQuestions();
  
  let filteredQuestions = questions;
  
  if (filters?.category) {
    filteredQuestions = filteredQuestions.filter(q => 
      q.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }
  
  if (filters?.difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty);
  }
  
  if (filters?.excludeIds?.length) {
    // For this implementation, we'll generate simple IDs based on question text hash
    filteredQuestions = filteredQuestions.filter(q => {
      const id = generateQuestionId(q);
      return !filters.excludeIds!.includes(id);
    });
  }
  
  // Shuffle and return requested count
  const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generate a simple ID for a question based on its content
 */
function generateQuestionId(question: QuestionData): string {
  return question.question.substring(0, 50).replace(/\s+/g, '_').toLowerCase();
}

/**
 * Preload questions in background for better performance
 */
export function preloadQuestions(): void {
  // Fire and forget - load questions in background
  loadSampleQuestions().catch(() => {
    // Silent failure - questions will be loaded on demand
  });
}

/**
 * Clear questions cache (useful for testing or when questions are updated)
 */
export function clearQuestionsCache(): void {
  questionsCache = null;
}

/**
 * Get filtered questions based on criteria
 */
export async function getFilteredQuestions(filters: {
  subjects?: string[];
  systems?: string[];
  topics?: string[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  categories?: string[];
}): Promise<QuestionData[]> {
  const questions = await loadSampleQuestions();
  
  return questions.filter(question => {
    // Filter by subjects
    if (filters.subjects && filters.subjects.length > 0) {
      if (!filters.subjects.includes(question.subject)) {
        return false;
      }
    }
    
    // Filter by systems
    if (filters.systems && filters.systems.length > 0) {
      if (!filters.systems.includes(question.system)) {
        return false;
      }
    }
    
    // Filter by topics
    if (filters.topics && filters.topics.length > 0) {
      const hasMatchingTopic = question.topics.some(topic => 
        filters.topics!.includes(topic)
      );
      if (!hasMatchingTopic) {
        return false;
      }
    }
    
    // Filter by difficulty
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(question.difficulty)) {
        return false;
      }
    }
    
    // Filter by categories (for backward compatibility)
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(question.category)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Get unique values for filtering options
 */
export async function getQuestionMetadata(): Promise<{
  subjects: string[];
  systems: string[];
  topics: string[];
  categories: string[];
  difficulties: ('easy' | 'medium' | 'hard')[];
}> {
  const questions = await loadSampleQuestions();
  
  const subjects = [...new Set(questions.map(q => q.subject))];
  const systems = [...new Set(questions.map(q => q.system))];
  const categories = [...new Set(questions.map(q => q.category))];
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
  
  // Collect all unique topics
  const topicsSet = new Set<string>();
  questions.forEach(q => {
    q.topics.forEach(topic => topicsSet.add(topic));
  });
  const topics = Array.from(topicsSet);
  
  return {
    subjects: subjects.sort(),
    systems: systems.sort(),
    topics: topics.sort(),
    categories: categories.sort(),
    difficulties
  };
}