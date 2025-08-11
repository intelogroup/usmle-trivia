import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { validateEnvironment, logEnvironmentInfo, isDevelopment } from './utils/envValidation';

// Lazy load components to enable code splitting
const AppLayout = lazy(() => import('./components/layout/AppLayout').then(module => ({ default: module.AppLayout })));
const Landing = lazy(() => import('./pages/Landing').then(module => ({ default: module.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Quiz = lazy(() => import('./pages/Quiz').then(module => ({ default: module.Quiz })));
const Progress = lazy(() => import('./pages/Progress').then(module => ({ default: module.Progress })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Social = lazy(() => import('./pages/Social').then(module => ({ default: module.Social })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(module => ({ default: module.Leaderboard })));
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

function App() {

  useEffect(() => {
    // Validate environment configuration on app startup
    try {
      validateEnvironment();
      if (isDevelopment()) {
        logEnvironmentInfo();
        console.log('🚀 Running MedQuiz Pro without authentication');
      }
    } catch (error) {
      console.error('❌ Environment configuration error:', error);
      // In production, this would prevent the app from starting
      // In development, we allow it to continue with warnings
    }
  }, []);

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* Landing page - now redirect directly to dashboard */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        {/* Public routes - no authentication required */}
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </Suspense>
          }
        />
        <Route
          path="/quiz"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <Quiz />
              </AppLayout>
            </Suspense>
          }
        />
        <Route
          path="/quiz/:mode"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <Quiz />
              </AppLayout>
            </Suspense>
          }
        />
        <Route
          path="/progress"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <Progress />
              </AppLayout>
            </Suspense>
          }
        />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </Suspense>
          }
        />
        <Route
          path="/social/*"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <Social />
              </AppLayout>
            </Suspense>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <Leaderboard />
              </AppLayout>
            </Suspense>
          }
        />
        <Route
          path="/review"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <div>Review Page</div>
              </AppLayout>
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <AppLayout>
                <UserProfile />
              </AppLayout>
            </Suspense>
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