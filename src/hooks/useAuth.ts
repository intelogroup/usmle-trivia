import { useUser, useClerk } from '@clerk/clerk-react';

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();

  return {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      username: user.username || user.firstName || 'User',
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      avatar: user.imageUrl,
      createdAt: user.createdAt,
    } : null,
    isAuthenticated: isSignedIn || false,
    isLoading: !isLoaded,
    signIn: () => openSignIn(),
    signUp: () => openSignUp(),
    signOut: () => signOut(),
  };
}