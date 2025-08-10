import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/convexAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard component that protects routes and handles authentication flow
 * This ensures no unauthorized access to protected parts of the application
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log authentication state changes in development
    if (import.meta.env.DEV) {
      console.log('🔐 Auth State:', { 
        isAuthenticated, 
        isLoading, 
        hasUser: !!user,
        currentPath: location.pathname 
      });
    }
  }, [isAuthenticated, isLoading, user, location.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    const from = location.pathname + location.search;
    return <Navigate to={redirectTo} state={{ from }} replace />;
  }

  // If user is authenticated but trying to access auth pages, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

/**
 * Higher-order component for protecting routes
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requireAuth = true
): React.FC<P> => {
  return (props: P) => (
    <AuthGuard requireAuth={requireAuth}>
      <Component {...props} />
    </AuthGuard>
  );
};

/**
 * Hook to check if user has required permissions
 */
export const useAuthPermissions = () => {
  const { user } = useAuth();
  
  return {
    canAccessQuiz: !!user,
    canAccessDashboard: !!user,
    canAccessAnalytics: !!user,
    canAccessSocial: !!user,
    canAccessLeaderboard: !!user,
    canAccessProfile: !!user,
    isAdmin: user?.role === 'admin',
  };
};