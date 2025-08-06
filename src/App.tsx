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
import { useAppStore } from './store';
import { authService } from './services/auth';
import { UserProfile } from './components/profile/UserProfile';
import { PerformanceChart } from './components/analytics/PerformanceChart';
import { Social } from './pages/Social';
import { MedicalErrorBoundary } from './components/ErrorBoundary';
import { SessionErrorIntegration } from './utils/sessionErrorIntegration';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAppStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { setUser, setLoading, isAuthenticated } = useAppStore();

  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuth = async () => {
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

  return (
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
                  <div>Review Page</div>
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
    </MedicalErrorBoundary>
  );
}

export default App;