import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './services/convexAuth';
import { AuthGuard } from './components/auth/AuthGuard';
import { validateEnvironment, logEnvironmentInfo, isDevelopment } from './utils/envValidation';
import { analyticsService } from './services/analytics';

// Lazy load components to enable code splitting
const AppLayout = lazy(() => import('./components/layout/AppLayout').then(module => ({ default: module.AppLayout })));
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Quiz = lazy(() => import('./pages/Quiz').then(module => ({ default: module.Quiz })));
const Progress = lazy(() => import('./pages/Progress').then(module => ({ default: module.Progress })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Social = lazy(() => import('./pages/Social').then(module => ({ default: module.Social })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(module => ({ default: module.Leaderboard })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const UserProfile = lazy(() => import('./components/profile/UserProfile').then(module => ({ default: module.UserProfile })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

// Loading spinner component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="text-gray-600">Loading...</span>
    </div>
  </div>
);

// Protected Route Component using AuthGuard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard requireAuth={true}>
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </AuthGuard>
  );
};

// Public Route Component for login/register pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard requireAuth={false}>
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </AuthGuard>
  );
};

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Validate environment configuration on app startup
    try {
      validateEnvironment();
      if (isDevelopment()) {
        logEnvironmentInfo();
        console.log('🔐 Using Convex Auth for JWT-based authentication');
      }
      
      // Initialize analytics service
      if (user) {
        analyticsService.initialize(user._id);
      }
    } catch (error) {
      console.error('❌ Environment configuration error:', error);
      // In production, this would prevent the app from starting
      // In development, we allow it to continue with warnings
    }
  }, []);

  // Show loading while auth state is being determined
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* Landing page - redirect to dashboard if authenticated, otherwise to login */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        
        {/* Public routes - only accessible when NOT authenticated */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Quiz />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:mode"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Quiz />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Progress />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/social/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Social />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Leaderboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div>Review Page</div>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UserProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
          {/* Catch-all route for 404 errors */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;