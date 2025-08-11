import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { useEffect } from 'react';
import { api } from '../../convex/_generated/api';

/**
 * Custom hook that integrates Clerk authentication with Convex
 * This hook ensures user profiles are synchronized between Clerk and Convex
 */
export const useAuth = () => {
  const { isSignedIn, userId, isLoaded } = useClerkAuth();
  const { user } = useUser();
  
  // Get or create user profile in Convex
  const getOrCreateProfile = useMutation(api.users.getOrCreateUserProfile);
  const userProfile = useQuery(api.users.getCurrentUserProfile);

  // Synchronize user data when user signs in
  useEffect(() => {
    if (isSignedIn && user && isLoaded) {
      getOrCreateProfile({
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || user.username,
      }).catch(error => {
        console.error('Failed to sync user profile:', error);
      });
    }
  }, [isSignedIn, user, isLoaded, getOrCreateProfile]);

  return {
    isAuthenticated: isSignedIn,
    userId,
    user,
    userProfile,
    isLoading: !isLoaded || (isSignedIn && !userProfile),
    isLoaded,
  };
};

/**
 * Helper hook for components that require authentication
 */
export const useRequireAuth = () => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated && auth.isLoaded) {
    throw new Error('Authentication required');
  }
  
  return auth;
};