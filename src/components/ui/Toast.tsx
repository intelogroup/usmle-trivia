/**
 * Toast Component
 * Displays user feedback messages
 * For MedQuiz Pro - Medical Education Platform
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { subscribeToToasts, ToastMessage, ToastType } from '../../utils/toast';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const Icon = toastIcons[toast.type];
  
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`
        flex items-start p-4 mb-3 border rounded-lg shadow-md transition-all duration-300 ease-in-out
        ${toastStyles[toast.type]}
      `}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm opacity-90">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-3 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts(prev => [...prev, toast]);
    });

    return unsubscribe;
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-50 max-w-sm w-full space-y-2"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onDismiss={dismissToast} 
        />
      ))}
    </div>
  );
};

export default Toast;