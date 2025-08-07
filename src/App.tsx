import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { authService } from './services/auth';
import { validateEnvironment, logEnvironmentInfo, isDevelopment } from './utils/envValidation';
import { quizSessionManager } from './services/QuizSessionManager';
import { PWAUpdateNotification, OfflineIndicator } from './components/PWAUpdateNotification';

// Lazy load components to enable code splitting
const AppLayout = lazy(() => import('./components/layout/AppLayout').then(module => ({ default: module.AppLayout })));
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Quiz = lazy(() => import('./pages/Quiz').then(module => ({ default: module.Quiz })));
const Progress = lazy(() => import('./pages/Progress').then(module => ({ default: module.Progress })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(module => ({ default: module.Leaderboard })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const UserProfile = lazy(() => import('./components/profile/UserProfile').then(module => ({ default: module.UserProfile })));
const PerformanceChart = lazy(() => import('./components/analytics/PerformanceChart').then(module => ({ default: module.PerformanceChart })));
const Social = lazy(() => import('./pages/Social').then(module => ({ default: module.Social })));
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

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAppStore();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

function App() {
  const { setUser, setLoading, isAuthenticated } = useAppStore();

  useEffect(() => {
    // Validate environment configuration on app startup
    try {
      validateEnvironment();
      if (isDevelopment()) {
        logEnvironmentInfo();
      }
    } catch (error) {
      console.error('❌ Environment configuration error:', error);
      // In production, this would prevent the app from starting
      // In development, we allow it to continue with warnings
    }

    // Check if user is logged in on app load
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setLoading]);

  // Cleanup session manager on app unmount
  useEffect(() => {
    return () => {
      quizSessionManager.cleanup();
    };
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
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
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PerformanceChart />
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
        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Social />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
          {/* Catch-all route for 404 errors */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      {/* PWA Features */}
      <OfflineIndicator />
      <PWAUpdateNotification />
    </Router>
  );
}

export default App;