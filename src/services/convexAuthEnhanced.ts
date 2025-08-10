/**
 * Enhanced Convex Auth Service with Network Retry Logic
 * Modern JWT-based authentication with comprehensive error handling
 * For MedQuiz Pro - Medical Education Platform
 */

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { IUser } from "../types";
import { profileNetworkUtils, classifyError, NetworkError } from "../utils/networkUtils";
import { profileToasts } from "../utils/toast";

// Enhanced auth hook with network error handling
export function useAuthEnhanced() {
  const { signIn, signOut, signUp } = useAuthActions();
  const token = useAuthToken();
  
  // Use the token to get current user from our database
  const user = useQuery(api.auth.getCurrentUserFromToken, token ? {} : "skip");
  
  return {
    // User state
    user: user ? convertConvexUserToIUser(user) : null,
    isAuthenticated: !!user,
    isLoading: user === undefined,
    
    // Enhanced auth actions with retry logic
    async login(email: string, password: string) {
      console.log('🔐 Enhanced Convex Auth: Signing in user:', email);
      
      return profileNetworkUtils.updateProfileWithRetry(async () => {
        try {
          await signIn("password", { email, password, flow: "signIn" });
          console.log('✅ Enhanced Convex Auth: Sign in successful');
        } catch (error: any) {
          console.error('❌ Enhanced Convex Auth: Sign in failed:', error);
          
          const errorClassification = classifyError(error);
          
          if (errorClassification.type === 'authorization') {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (errorClassification.type === 'network') {
            throw new Error('Unable to connect to our servers. Please check your internet connection.');
          } else if (errorClassification.type === 'timeout') {
            throw new Error('Login request timed out. Please try again.');
          }
          
          throw error;
        }
      });
    },
    
    async register(email: string, password: string, name: string, medicalLevel?: string, studyGoals?: string) {
      console.log('🔑 Enhanced Convex Auth: Registering user:', email);
      
      return profileNetworkUtils.updateProfileWithRetry(async () => {
        try {
          await signUp("password", { 
            email, 
            password, 
            name,
            medicalLevel,
            studyGoals,
            flow: "signUp" 
          });
          console.log('✅ Enhanced Convex Auth: Registration successful');
        } catch (error: any) {
          console.error('❌ Enhanced Convex Auth: Registration failed:', error);
          
          const errorClassification = classifyError(error);
          
          if (errorClassification.type === 'validation') {
            if (error.message?.includes('email')) {
              throw new Error('This email is already registered. Please use a different email or try logging in.');
            }
            throw new Error('Please check your information and try again.');
          } else if (errorClassification.type === 'network') {
            throw new Error('Unable to connect to our servers. Please check your internet connection.');
          }
          
          throw error;
        }
      });
    },
    
    async logout() {
      console.log('🚪 Enhanced Convex Auth: Signing out user');
      try {
        await signOut();
        console.log('✅ Enhanced Convex Auth: Sign out successful');
      } catch (error: any) {
        console.error('❌ Enhanced Convex Auth: Sign out failed:', error);
        // Don't retry logout failures, just complete the process
      }
    },
  };
}

// Convert Convex user format to our IUser interface
function convertConvexUserToIUser(convexUser: any): IUser {
  return {
    id: convexUser._id,
    email: convexUser.email || '',
    name: convexUser.name || '',
    avatar: convexUser.avatar,
    points: convexUser.points || 0,
    level: convexUser.level || 1,
    streak: convexUser.currentStreak || 0,
    totalQuizzes: convexUser.totalQuizzes || 0,
    accuracy: convexUser.accuracy || 0,
    createdAt: new Date(convexUser._creationTime),
    updatedAt: new Date(convexUser.updatedAt || convexUser._creationTime),
    medicalLevel: convexUser.medicalLevel,
    studyGoals: convexUser.studyGoals,
    currentStreak: convexUser.currentStreak || 0,
    longestStreak: convexUser.longestStreak || 0,
  };
}

/**
 * Enhanced mutation hook with automatic retry and error handling
 */
function useEnhancedMutation<T extends any[], U>(
  mutation: any,
  options: {
    maxRetries?: number;
    showErrorToasts?: boolean;
    successMessage?: string;
  } = {}
) {
  const baseMutation = useMutation(mutation);
  
  return async (...args: T): Promise<U> => {
    const { maxRetries = 3, showErrorToasts = true, successMessage } = options;
    
    return profileNetworkUtils.updateProfileWithRetry(async () => {
      try {
        const result = await baseMutation(...args);
        
        if (successMessage) {
          profileToasts.success(successMessage);
        }
        
        return result;
      } catch (error: any) {
        console.error('Enhanced mutation failed:', error);
        
        if (showErrorToasts) {
          const errorClassification = classifyError(error);
          
          switch (errorClassification.type) {
            case 'network':
              profileToasts.networkError();
              break;
            case 'timeout':
              profileToasts.timeout();
              break;
            case 'authorization':
              profileToasts.unauthorized();
              break;
            case 'server':
              profileToasts.serverError();
              break;
            case 'validation':
              profileToasts.saveError(errorClassification.userMessage);
              break;
            default:
              profileToasts.saveError(error.message || 'An unexpected error occurred');
          }
        }
        
        throw error;
      }
    }, maxRetries);
  };
}

/**
 * Enhanced query hook with automatic retry and error handling
 */
function useEnhancedQuery<T>(
  query: any,
  args: any,
  options: {
    maxRetries?: number;
    showErrorToasts?: boolean;
  } = {}
) {
  // For now, we'll use the standard query but could enhance with retry logic
  // Convex handles query retries internally, but we could add additional error handling
  return useQuery(query, args);
}

// Enhanced Convex hooks with automatic retry logic
export const useUpdateUserStatsEnhanced = () => 
  useEnhancedMutation(api.auth.updateUserStats, {
    successMessage: 'Stats updated successfully!',
    showErrorToasts: false // Handle in quiz component
  });

export const useGetUserQuizHistoryEnhanced = (userId: string, limit?: number) => 
  useEnhancedQuery(api.quiz.getUserQuizHistory, userId ? { userId, limit } : "skip");

export const useGetLeaderboardEnhanced = (limit?: number) => 
  useEnhancedQuery(api.auth.getLeaderboard, { limit: limit || 10 });

export const useGetUserProfileEnhanced = (userId: string) => 
  useEnhancedQuery(api.auth.getUserProfile, userId ? { userId } : "skip");

export const useUpdateUserProfileEnhanced = () => 
  useEnhancedMutation(api.auth.updateUserProfile, {
    maxRetries: 3,
    showErrorToasts: false // Handle in profile component with specific messages
  });

export const useSearchUsersEnhanced = (searchTerm: string, limit?: number) => 
  useEnhancedQuery(api.auth.searchUsers, searchTerm ? { searchTerm, limit } : "skip");

// Quiz-related hooks with enhanced error handling
export const useCreateQuizSessionEnhanced = () => 
  useEnhancedMutation(api.quiz.createQuizSession, {
    successMessage: 'Quiz session created!',
    maxRetries: 2
  });

export const useCompleteQuizSessionEnhanced = () => 
  useEnhancedMutation(api.quiz.completeQuizSession, {
    successMessage: 'Quiz completed successfully!',
    maxRetries: 3
  });

export const useGetQuizSessionEnhanced = (sessionId: string) => 
  useEnhancedQuery(api.quiz.getQuizSession, sessionId ? { sessionId } : "skip");

export const useGetRandomQuestionsEnhanced = (count: number, difficulty?: string) => 
  useEnhancedQuery(api.quiz.getRandomQuestions, { count, difficulty });

/**
 * Network-aware operation wrapper
 * Automatically queues operations when offline and executes when online
 */
export class OfflineOperationQueue {
  private queue: Array<{
    id: string;
    operation: () => Promise<any>;
    retries: number;
    maxRetries: number;
  }> = [];
  
  private isProcessing = false;
  
  constructor() {
    // Process queue when coming back online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.processQueue);
    }
  }
  
  async addOperation(
    operation: () => Promise<any>, 
    options: { maxRetries?: number; id?: string } = {}
  ): Promise<any> {
    const { maxRetries = 3, id = Date.now().toString() } = options;
    
    // If online, try to execute immediately
    if (navigator.onLine) {
      try {
        return await operation();
      } catch (error) {
        // If it fails due to network, add to queue
        const errorClassification = classifyError(error);
        if (errorClassification.isRetryable) {
          this.queue.push({ id, operation, retries: 0, maxRetries });
          profileToasts.warning('Operation queued', 'Your request will be processed when connection is restored.');
          return null;
        }
        throw error;
      }
    } else {
      // If offline, add to queue
      this.queue.push({ id, operation, retries: 0, maxRetries });
      profileToasts.warning('Offline', 'Your request will be processed when connection is restored.');
      return null;
    }
  }
  
  private processQueue = async () => {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    const failedOperations: typeof this.queue = [];
    
    for (const item of this.queue) {
      try {
        await item.operation();
      } catch (error) {
        item.retries++;
        if (item.retries < item.maxRetries) {
          failedOperations.push(item);
        } else {
          console.error(`Operation ${item.id} failed after ${item.maxRetries} retries:`, error);
        }
      }
    }
    
    this.queue = failedOperations;
    this.isProcessing = false;
    
    if (failedOperations.length === 0) {
      profileToasts.success('Sync complete', 'All pending operations have been processed.');
    }
  };
  
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.processQueue);
    }
  }
}

// Global offline operation queue
export const offlineQueue = new OfflineOperationQueue();