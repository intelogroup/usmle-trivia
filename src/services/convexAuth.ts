// Temporary compatibility wrapper for migrating from Convex Auth to Clerk
import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  return {
    user: clerkUser ? {
      id: clerkUser.id,
      name: clerkUser.firstName || clerkUser.username || 'User',
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      points: 0, // Will be fetched from database
      totalQuizzes: 0, // Will be fetched from database
      accuracy: 0, // Will be fetched from database
      streak: 0, // Will be fetched from database
    } : null,
    isAuthenticated: isSignedIn || false,
    isLoading: !isLoaded,
  };
}

// Placeholder functions for quiz history and leaderboard
// These will need to be connected to actual Convex queries
export function useGetUserQuizHistory(userId: string, limit: number) {
  // Return empty array for now - will be connected to Convex
  return [];
}

export function useGetLeaderboard(limit: number) {
  // Return empty array for now - will be connected to Convex
  return [];
}

// Additional placeholder functions for user profile management
export function useGetUserProfile(userId?: string) {
  const { user } = useUser();
  
  if (!userId && !user) return null;
  
  return {
    id: user?.id || userId || '',
    name: user?.firstName || user?.username || 'User',
    email: user?.primaryEmailAddress?.emailAddress || '',
    avatar: user?.imageUrl,
    bio: '',
    school: '',
    yearOfStudy: '',
    specialtyInterest: '',
    targetExamDate: '',
    studyGoals: '',
    preferredStudyTime: '',
    weakAreas: [],
    strongAreas: [],
  };
}

export function useUpdateUserProfile() {
  return {
    mutate: async (updates: any) => {
      console.log('Profile update:', updates);
      // Will be connected to Convex mutation
    },
    isLoading: false,
  };
}

export function useUpdateUserStats() {
  return {
    mutate: async (updates: any) => {
      console.log('Stats update:', updates);
      // Will be connected to Convex mutation
    },
    isLoading: false,
  };
}