import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Quiz } from './pages/Quiz';
import { Progress } from './pages/Progress';
import { Leaderboard } from './pages/Leaderboard';
import { Login } from './pages/Login';
import { useAppStore } from './store';
import { authService } from './services/auth';

function App() {
  const { isAuthenticated, setUser, setLoading } = useAppStore();

  useEffect(() => {
    // Check if user is logged in on app load
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
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
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/quiz/:mode" element={<Quiz />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/review" element={<div>Review Page</div>} />
                  <Route path="/analytics" element={<div>Analytics Page</div>} />
                  <Route path="/profile" element={<div>Profile Page</div>} />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;