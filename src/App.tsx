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
import { NotFound } from './pages/NotFound';

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

  return (
    <Router>
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
    </Router>
  );
}

export default App;