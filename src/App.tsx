import React, { useEffect, Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { validateEnvironment, logEnvironmentInfo, isDevelopment } from './utils/envValidation';

// Enhanced lazy loading with error handling
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => {
    console.log(`🔄 Loading ${componentName} component...`)
    return importFn()
      .then(module => {
        console.log(`✅ ${componentName} loaded successfully`)
        console.log(`📦 ${componentName} module keys:`, Object.keys(module))
        return module  // Return the full module, React will find the default export
      })
      .catch(error => {
        console.error(`🚨 Failed to load ${componentName}:`, error)
        throw error
      })
  })
}

// Lazy load components to enable code splitting
const AppLayout = createLazyComponent(() => import('./components/layout/AppLayout'), 'AppLayout');
const Landing = createLazyComponent(() => import('./pages/Landing'), 'Landing');
const Dashboard = createLazyComponent(() => import('./pages/Dashboard'), 'Dashboard');
const Quiz = createLazyComponent(() => import('./pages/Quiz'), 'Quiz');
const Progress = createLazyComponent(() => import('./pages/Progress'), 'Progress');
const Analytics = createLazyComponent(() => import('./pages/Analytics'), 'Analytics');
const Social = createLazyComponent(() => import('./pages/Social'), 'Social');
const Leaderboard = createLazyComponent(() => import('./pages/Leaderboard'), 'Leaderboard');
const UserProfile = createLazyComponent(() => import('./components/profile/UserProfile'), 'UserProfile');
const NotFound = createLazyComponent(() => import('./pages/NotFound'), 'NotFound');

// Enhanced loading spinner component for Suspense fallback
const LoadingSpinner = ({ message = "Loading..." }) => {
  console.log('🔄 Showing loading spinner:', message)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  )
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 Error Boundary caught error:', error)
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary details:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md mx-4">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              The application encountered an unexpected error.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
            {isDevelopment() && this.state.error && (
              <details className="mt-4 text-left text-xs">
                <summary className="cursor-pointer text-gray-500">Technical Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-red-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  console.log('🎯 App component rendering...')

  useEffect(() => {
    console.log('🔄 App useEffect running - validating environment...')
    
    // Validate environment configuration on app startup
    try {
      validateEnvironment();
      if (isDevelopment()) {
        logEnvironmentInfo();
        console.log('🚀 Running Usmle Trivia with Clerk Authentication');
      }
      console.log('✅ App environment validation complete')
    } catch (error) {
      console.error('❌ Environment configuration error:', error);
      console.error('📋 Environment error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      })
      
      // In production, this would prevent the app from starting
      // In development, we allow it to continue with warnings
      if (!isDevelopment()) {
        throw error; // Re-throw in production to prevent app startup
      }
    }
  }, []);

  console.log('🎨 App rendering Router and Routes...')
  
  return (
    <ErrorBoundaryClass>
      <Router>
        <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
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
    </ErrorBoundaryClass>
  );
}

export default App;