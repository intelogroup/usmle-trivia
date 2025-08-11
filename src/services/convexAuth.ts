// OFFICIAL CONVEX AUTH SERVICE - Based on @convex-dev/auth v0.0.88
// Following official Convex Auth documentation and best practices 2025

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { IUser } from "../types";

/**
 * Main authentication hook using official Convex Auth
 * Provides complete auth state and actions for the medical quiz app
 */
export function useAuth() {
  // Official Convex Auth hooks
  const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  
  // Get current user data from our userProfiles table
  const user = useQuery(api.userProfiles.getCurrentUser) as IUser | null;
  
  // Loading state: true if Convex Auth is loading OR if authenticated but user data not yet loaded
  const isLoading = convexLoading || (isAuthenticated && user === undefined);

  /**
   * Register a new user with email and password
   * Note: Convex Auth uses signIn for both registration and login
   * The Password provider will create a new user if one doesn't exist
   */
  const register = async (email: string, password: string, name: string, medicalLevel?: string, studyGoals?: string) => {
    try {
      // For registration, we use signIn with flow: "signUp"
      // The Password provider will create the user if they don't exist
      await signIn("password", { 
        email, 
        password, 
        name,
        flow: "signUp", // This tells Convex Auth to create a new user
        // Additional medical fields will be handled by userProfiles creation
        medicalLevel,
        studyGoals
      });
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string) => {
    try {
      // Use official Convex Auth signIn with flow: "signIn"
      await signIn("password", { 
        email, 
        password,
        flow: "signIn" // This tells Convex Auth to sign in existing user
      });
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Invalid email or password. Please try again.' 
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Use official Convex Auth signOut
      await signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.message || 'Logout failed. Please try again.' 
      };
    }
  };

  return {
    // Auth state
    user,
    isAuthenticated,
    isLoading,
    
    // Auth actions
    login,
    logout,
    register,
    
    // Additional utilities for direct use
    signIn,
    signOut,
  };
}

/**
 * Hook to update user statistics after quiz completion
 */
export function useUpdateUserStats() {
  const updateUserStats = useMutation(api.userProfiles.updateUserStats);
  
  return async (quizScore: number, questionsCount: number, pointsEarned: number, timeSpent?: number) => {
    try {
      const result = await updateUserStats({
        quizScore,
        questionsCount,
        pointsEarned,
        timeSpent,
      });
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error updating user stats:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update statistics. Please try again.' 
      };
    }
  };
}

/**
 * Hook to get user's quiz history
 */
export function useGetUserQuizHistory() {
  return useQuery(api.quizSessions.getUserQuizHistory);
}

/**
 * Hook to get leaderboard data
 */
export function useGetLeaderboard(limit?: number) {
  return useQuery(api.userProfiles.getLeaderboard, { limit });
}

/**
 * Hook to get current user's profile
 */
export function useGetUserProfile() {
  return useQuery(api.userProfiles.getCurrentUserProfile);
}

/**
 * Hook to update user profile
 */
export function useUpdateUserProfile() {
  const updateProfile = useMutation(api.userProfiles.updateUserProfile);
  
  return async (updates: { name?: string; medicalLevel?: string; studyGoals?: string; avatar?: string }) => {
    try {
      const result = await updateProfile({ updates });
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile. Please try again.' 
      };
    }
  };
}

// Export auth utilities for advanced use cases
export { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";