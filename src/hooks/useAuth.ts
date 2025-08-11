import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { useEffect } from 'react';
import { api } from '../../convex/_generated/api';

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  
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
    // Clerk user data
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      username: user.username || user.firstName || 'User',
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      avatar: user.imageUrl,
      createdAt: user.createdAt,
    } : null,
    
    // Convex user profile data (contains medical app specific data)
    userProfile,
    
    // Auth state
    isAuthenticated: isSignedIn || false,
    isLoading: !isLoaded || (isSignedIn && userProfile === undefined),
    
    // Auth actions
    signIn: () => openSignIn(),
    signUp: () => openSignUp(),
    signOut: () => signOut(),
  };
}