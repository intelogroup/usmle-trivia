import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
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
        console.log('🚀 Running Usmle Trivia with Clerk Authentication');
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
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />
          
          {/* Protected routes - require authentication */}
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/quiz"
            element={
              <>
                <SignedIn>
                  <AppLayout>
                    <Quiz />
                  </AppLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/quiz/:mode"
            element={
              <>
                <SignedIn>
                  <AppLayout>
                    <Quiz />
                  </AppLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/progress"
            element={
              <>
                <SignedIn>
                  <AppLayout>
                    <Progress />
                  </AppLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/analytics"
            element={
              <>
                <SignedIn>
                  <AppLayout>
                    <Analytics />
                  </AppLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/social"
            element={
              <>
                <SignedIn>
                  <AppLayout>
                    <Social />
                  </AppLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <>
                <SignedIn>
                  <AppLayout>
                    <Leaderboard />
                  </AppLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <SignedIn>
                  <AppLayout>
                    <UserProfile />
                  </AppLayout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;