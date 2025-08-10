// NEW CONVEX AUTH SERVICE - Replaces all legacy authentication
// Modern JWT-based authentication with automatic token propagation
// Medical-grade security for USMLE preparation platform

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { IUser } from "../types";

// Main auth hook - replaces all legacy auth functionality
export function useAuth() {
  const { signIn, signOut, signUp } = useAuthActions();
  const token = useAuthToken();
  
  // Use the token to get current user from our database
  const user = useQuery(api.auth.getCurrentUserFromToken, token ? {} : "skip");
  
  // Enhanced loading states
  const isInitializing = user === undefined && !token;
  const isAuthenticating = user === undefined && !!token;
  const isFullyLoaded = user !== undefined || (!token && user === null);
  
  return {
    // Enhanced user state with granular loading states
    user: user ? convertConvexUserToIUser(user) : null,
    isAuthenticated: !!user,
    isLoading: user === undefined,
    isInitializing,
    isAuthenticating,
    isFullyLoaded,
    
    // Connection state
    hasConnection: !!token,
    
    // Auth actions with medical platform specifics
    async login(email: string, password: string) {
      console.log('🔐 Convex Auth: Signing in user:', email);
      try {
        await signIn("password", { email, password, flow: "signIn" });
        console.log('✅ Convex Auth: Sign in successful');
      } catch (error: any) {
        console.error('❌ Convex Auth: Sign in failed:', error);
        
        // Enhanced error handling with user-friendly messages
        if (error?.message?.includes('Invalid email or password')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (error?.message?.includes('Account is deactivated')) {
          throw new Error('Your account has been deactivated. Please contact support.');
        } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else {
          throw new Error(error?.message || 'Login failed. Please try again.');
        }
      }
    },
    
    async register(email: string, password: string, name: string, medicalLevel?: string, studyGoals?: string) {
      console.log('🔑 Convex Auth: Registering user:', email);
      try {
        await signUp("password", { 
          email, 
          password, 
          name,
          medicalLevel,
          studyGoals,
          flow: "signUp" 
        });
        console.log('✅ Convex Auth: Registration successful');
      } catch (error: any) {
        console.error('❌ Convex Auth: Registration failed:', error);
        
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
      console.log('🚪 Convex Auth: Signing out user');
      try {
        await signOut();
        console.log('✅ Convex Auth: Sign out successful');
      } catch (error: any) {
        console.error('❌ Convex Auth: Sign out failed:', error);
        
        // Enhanced logout error handling
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          console.warn('Network error during logout - clearing local session');
          // Continue with logout even if network fails
        } else {
          throw new Error(error?.message || 'Logout failed. Please try again.');
        }
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

// Convex queries and mutations with automatic auth token propagation
export const useUpdateUserStats = () => useMutation(api.auth.updateUserStats);
export const useGetUserQuizHistory = (userId: string, limit?: number) => 
  useQuery(api.quiz.getUserQuizHistory, userId ? { userId, limit } : "skip");
export const useGetLeaderboard = (limit?: number) => 
  useQuery(api.auth.getLeaderboard, { limit: limit || 10 });
export const useGetUserProfile = (userId: string) => 
  useQuery(api.auth.getUserProfile, userId ? { userId } : "skip");
export const useUpdateUserProfile = () => useMutation(api.auth.updateUserProfile);
export const useSearchUsers = (searchTerm: string, limit?: number) => 
  useQuery(api.auth.searchUsers, searchTerm ? { searchTerm, limit } : "skip");

// Quiz-related hooks with auth
export const useCreateQuizSession = () => useMutation(api.quiz.createQuizSession);
export const useCompleteQuizSession = () => useMutation(api.quiz.completeQuizSession);
export const useGetQuizSession = (sessionId: string) => 
  useQuery(api.quiz.getQuizSession, sessionId ? { sessionId } : "skip");
export const useGetRandomQuestions = (count: number, difficulty?: string) => 
  useQuery(api.quiz.getRandomQuestions, { count, difficulty });