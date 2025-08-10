// OFFICIAL CONVEX AUTH SERVICE - Pure Implementation
// Uses official Convex Auth with medical education profile management
// No custom auth code - fully compliant with Convex Auth patterns

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { IUser } from "../types";

// Main auth hook using official Convex Auth
export function useAuth() {
  // Official Convex Auth hooks
  const { signIn, signOut, signUp } = useAuthActions();
  const { isLoading, isAuthenticated } = useConvexAuth();
  
  // Get medical profile for current user (only if authenticated)
  const profile = useQuery(
    api.userProfiles.getCurrentUserProfile,
    isAuthenticated ? {} : "skip"
  );
  
  // Enhanced loading states
  const isInitializing = isLoading;
  const isAuthenticating = !isLoading && !isAuthenticated;
  
  return {
    // Auth state using official Convex Auth
    user: isAuthenticated && profile ? convertConvexProfileToIUser(profile) : null,
    profile,
    isAuthenticated,
    isLoading: isInitializing,
    isInitializing,
    isAuthenticating,
    
    // Auth actions using official Convex Auth
    async login(email: string, password: string) {
      console.log('🔐 Official Convex Auth: Signing in user:', email);
      try {
        await signIn("password", { email, password, flow: "signIn" });
        console.log('✅ Official Convex Auth: Sign in successful');
      } catch (error: any) {
        console.error('❌ Official Convex Auth: Sign in failed:', error);
        
        // Enhanced error handling with medical-specific messages
        if (error?.message?.includes('Invalid email or password')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else {
          throw new Error(error?.message || 'Login failed. Please try again.');
        }
      }
    },
    
    async register(
      email: string, 
      password: string, 
      name: string,
      medicalLevel?: string,
      studyGoals?: string
    ) {
      console.log('🔑 Official Convex Auth: Registering user:', email);
      try {
        // Step 1: Register with official Convex Auth
        await signUp("password", { 
          email, 
          password, 
          name,
          flow: "signUp" 
        });
        console.log('✅ Official Convex Auth: Registration successful');
        
        // Step 2: Profile creation will be handled after auth completes
        // We'll use a separate hook/effect to create the medical profile
        
      } catch (error: any) {
        console.error('❌ Official Convex Auth: Registration failed:', error);
        
        // Enhanced error handling for registration
        if (error?.message?.includes('User already exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error?.message?.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error?.message?.includes('Password')) {
          throw new Error('Password must be at least 8 characters long.');
        } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else {
          throw new Error(error?.message || 'Registration failed. Please try again.');
        }
      }
    },
    
    async logout() {
      console.log('🚪 Official Convex Auth: Signing out user');
      try {
        await signOut();
        console.log('✅ Official Convex Auth: Sign out successful');
      } catch (error: any) {
        console.error('❌ Official Convex Auth: Sign out failed:', error);
        
        // Enhanced logout error handling
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          console.warn('Network error during logout - continuing anyway');
          // Continue with logout even if network fails
        } else {
          throw new Error(error?.message || 'Logout failed. Please try again.');
        }
      }
    },
  };
}

// Convert profile to our IUser interface
function convertConvexProfileToIUser(profile: any): IUser {
  return {
    id: profile?.userId || 'unknown',
    email: 'user@example.com', // Will be populated from Convex Auth when available
    name: 'User', // Will be populated from Convex Auth when available
    avatar: undefined,
    // Profile data from userProfiles table
    points: profile?.points || 0,
    level: profile?.level || 1,
    streak: profile?.currentStreak || 0,
    totalQuizzes: profile?.totalQuizzes || 0,
    accuracy: profile?.accuracy || 0,
    createdAt: new Date(profile?.createdAt || Date.now()),
    updatedAt: new Date(profile?.updatedAt || Date.now()),
    medicalLevel: profile?.medicalLevel,
    studyGoals: profile?.studyGoals,
    currentStreak: profile?.currentStreak || 0,
    longestStreak: profile?.longestStreak || 0,
  };
}

// Hook for medical profile management
export const useUserProfile = () => {
  const profile = useQuery(api.userProfiles.getCurrentUserProfile);
  const initializeProfile = useMutation(api.userProfiles.initializeUserProfileFromAuth);
  const updateProfile = useMutation(api.userProfiles.updateUserProfile);
  
  return {
    profile,
    initializeProfile,
    updateProfile,
    isLoading: profile === undefined,
    hasProfile: !!profile,
  };
};

// Hook for updating user stats after quiz
export const useUpdateUserStats = () => {
  return useMutation(api.userProfiles.updateUserStats);
};

// Hook for leaderboard data
export const useLeaderboard = (limit?: number) => {
  return useQuery(api.userProfiles.getLeaderboard, { limit: limit || 10 });
};

// Hook for searching users
export const useSearchUsers = (searchTerm: string, limit?: number) => {
  return useQuery(
    api.userProfiles.searchUserProfiles, 
    searchTerm ? { searchTerm, limit } : "skip"
  );
};

// Quiz-related hooks (these will reference the updated quiz functions)
// Note: These will need to be updated once we update the quiz functions to use string user IDs
export const useCreateQuizSession = () => useMutation(api.quiz.createQuizSession);
export const useCompleteQuizSession = () => useMutation(api.quiz.completeQuizSession);
export const useGetQuizSession = (sessionId: string) => 
  useQuery(api.quiz.getQuizSession, sessionId ? { sessionId } : "skip");
export const useGetRandomQuestions = (count: number, difficulty?: string) => 
  useQuery(api.quiz.getRandomQuestions, { count, difficulty });

// User quiz history hook
export const useGetUserQuizHistory = (userId: string, limit?: number) => 
  useQuery(api.quiz.getUserQuizHistory, userId ? { userId, limit } : "skip");

// Leaderboard hook
export const useGetLeaderboard = (limit?: number) => 
  useQuery(api.userProfiles.getLeaderboard, { limit: limit || 10 });

// User profile hooks
export const useGetUserProfile = (userId: string) => 
  useQuery(api.userProfiles.getUserProfile, userId ? { userId } : "skip");

export const useUpdateUserProfile = () => 
  useMutation(api.userProfiles.updateUserProfile);