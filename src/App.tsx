import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Quiz } from './pages/Quiz';
import { Progress } from './pages/Progress';
import { Leaderboard } from './pages/Leaderboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Review } from './pages/Review';
import { useAppStore } from './store';
import { authService } from './services/auth';
import { UserProfile } from './components/profile/UserProfile';
import { PerformanceChart } from './components/analytics/PerformanceChart';
import { Social } from './pages/Social';
import { MedicalErrorBoundary } from './components/ErrorBoundary';
import { SessionErrorIntegration } from './utils/sessionErrorIntegration';
import ConvexErrorBoundary from './components/error/ConvexErrorBoundary';
import ConvexDebugDashboard from './components/dev/ConvexDebugDashboard';
import { convexLogger } from './utils/convexDebugLogger';
import { useState } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAppStore();
  
  console.log('🛡️ ProtectedRoute check:', { 
    isAuthenticated, 
    isLoading, 
    hasUser: !!user,
    userName: user?.name 
  });
  
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ ProtectedRoute: Authenticated, allowing access');
  return <>{children}</>;
};

function App() {
  const { setUser, setLoading, isAuthenticated } = useAppStore();
  const [debugDashboardVisible, setDebugDashboardVisible] = useState(false);
  
  // Initialize Convex logger on app start
  useEffect(() => {
    convexLogger.logConvexOperation('Application Started', {
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }, []);

  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuth = async () => {
      console.log('🚀 App: Starting authentication check...');
      try {
        // Enhanced session error logging for app initialization
        const user = await SessionErrorIntegration.wrapAuthOperation(
          () => authService.getCurrentUser(),
          'app_initialization',
          {
            sessionType: 'authentication',
            authMethod: 'token',
            deviceInfo: {
              userAgent: navigator.userAgent,
              screenResolution: `${window.screen.width}x${window.screen.height}`,
              touchSupport: 'ontouchstart' in window,
              orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
            }
          }
        );
        
        console.log('🚀 App: Authentication check result:', user ? `✅ User: ${user.name}` : '❌ No user');
        setUser(user);
      } catch (error) {
        console.error('🚨 App: Auth check failed:', error);
        setUser(null);
      } finally {
        console.log('🚀 App: Authentication check completed, setting loading to false');
        setLoading(false);
      }
    };

    checkAuth();
  }, [setUser, setLoading]);

  return (
    <ConvexErrorBoundary category="UI" context={{ component: 'App', route: window.location.pathname }}>
      <MedicalErrorBoundary>
        <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MedicalErrorBoundary><Landing /></MedicalErrorBoundary>} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <MedicalErrorBoundary><Login /></MedicalErrorBoundary>} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <MedicalErrorBoundary><Register /></MedicalErrorBoundary>} 
          />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <Quiz />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:mode"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <Quiz />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <Progress />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <Leaderboard />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <Review />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <PerformanceChart />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <UserProfile />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/social"
          element={
            <ProtectedRoute>
              <MedicalErrorBoundary>
                <AppLayout>
                  <Social />
                </AppLayout>
              </MedicalErrorBoundary>
            </ProtectedRoute>
          }
        />
        </Routes>
        </Router>
        
        {/* Development Debug Dashboard */}
        {import.meta.env.DEV && (
          <ConvexDebugDashboard 
            isVisible={debugDashboardVisible}
            onToggle={() => setDebugDashboardVisible(!debugDashboardVisible)}
          />
        )}
      </MedicalErrorBoundary>
    </ConvexErrorBoundary>
  );
}

export default App;