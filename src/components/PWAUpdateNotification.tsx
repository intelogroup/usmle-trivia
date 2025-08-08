import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/Button';
import { AlertTriangle, Download, X } from 'lucide-react';

export function PWAUpdateNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 30 minutes
      if (r) {
        setInterval(() => {
          r.update();
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
    onNeedRefresh() {
      setShowNotification(true);
    },
  });

  // Auto-hide notification after 30 seconds
  useEffect(() => {
    if (showNotification && needRefresh) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [showNotification, needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowNotification(false);
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setNeedRefresh(false);
  };

  if (!showNotification || !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Download className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              App Update Available
            </h4>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="mt-1 text-xs text-gray-600">
            A new version with improvements and bug fixes is ready to install.
          </p>
          
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="text-xs"
            >
              Update Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="text-xs"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Offline status indicator
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 text-sm z-50">
      <div className="flex items-center justify-center space-x-2">
        <AlertTriangle className="w-4 h-4" />
        <span>You're currently offline. Some features may be limited.</span>
      </div>
    </div>
  );
}