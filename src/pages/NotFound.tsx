import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store';

export const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Medical illustration */}
        <div className="mb-8 relative">
          <div className="mx-auto w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-16 h-16 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v6m-9-2a9 9 0 1118 0 9 9 0 01-18 0z" 
              />
            </svg>
          </div>
          {/* Decorative medical crosses */}
          <div className="absolute -top-2 -left-2 w-6 h-6 text-red-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 text-green-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            The medical knowledge you're looking for seems to have gone missing. 
            Don't worry, even the best physicians sometimes take a wrong turn in the hospital corridors!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {isAuthenticated ? 'Back to Dashboard' : 'Go Home'}
          </Button>
          
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </Button>
        </div>

        {/* Medical theme footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            🏥 <strong>MedQuiz Pro</strong> - Excellence in Medical Education
          </p>
          <p className="text-xs text-gray-400 mt-2">
            "Healing begins with understanding, understanding begins with learning"
          </p>
        </div>
      </div>
    </div>
  );
};