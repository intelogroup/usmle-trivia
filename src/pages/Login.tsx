import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { useAuth } from '../services/convexAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('🔐 Login form submitted for:', formData.email);
    
    try {
      console.log('🚀 Calling login function via authService...');
      // Store's login function internally uses authService.login
      await login(formData.email, formData.password);
      
      console.log('✅ authService.login successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ authService.login exception:', error);
      // Parse specific error messages from Convex Auth
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMessage.includes('User not found')) {
        setError('No account found with this email address. Please check your email or create a new account.');
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
        setError('Please enter a valid email address.');
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4">
      <div className="w-full max-w-md">
        {/* Enhanced Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-custom-md" role="img" aria-label="MedQuiz Pro medical education logo">
              <Stethoscope className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-2">
            MedQuiz Pro
          </h1>
          <p className="text-muted-foreground text-lg">
            USMLE Preparation Platform
          </p>
        </div>

        {/* Enhanced Form Card */}
        <div className="bg-card border shadow-custom-lg rounded-2xl p-8 animate-slide-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div 
                id="login-error"
                role="alert"
                aria-live="assertive"
                className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in"
              >
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                aria-describedby={error ? "login-error" : undefined}
                className="w-full px-4 py-3 border-2 border-muted rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                aria-describedby={error ? "login-error" : undefined}
                className="w-full px-4 py-3 border-2 border-muted rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl font-semibold text-base shadow-custom-md hover:shadow-custom-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};