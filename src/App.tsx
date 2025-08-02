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

function App() {
  const { setUser, setLoading } = useAppStore();

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
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected app routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/:mode" element={<Quiz />} />
          <Route path="progress" element={<Progress />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="review" element={<div>Review Page</div>} />
          <Route path="analytics" element={<div>Analytics Page</div>} />
          <Route path="profile" element={<div>Profile Page</div>} />
        </Route>
        
        {/* Legacy dashboard route redirect */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;