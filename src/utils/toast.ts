/**
 * Toast Notification System
 * Provides user feedback for profile operations
 * For MedQuiz Pro - Medical Education Platform
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Simple in-memory toast state (could be replaced with proper state management)
let toastListeners: ((toast: ToastMessage) => void)[] = [];

/**
 * Subscribe to toast messages
 */
export const subscribeToToasts = (listener: (toast: ToastMessage) => void): (() => void) => {
  toastListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    toastListeners = toastListeners.filter(l => l !== listener);
  };
};

/**
 * Show a toast message
 */
const showToast = (type: ToastType, title: string, message?: string, duration = 5000): void => {
  const toast: ToastMessage = {
    id: Date.now().toString(),
    type,
    title,
    message,
    duration
  };

  toastListeners.forEach(listener => listener(toast));
};

/**
 * Toast API
 */
export const toast = {
  success: (title: string, message?: string, duration?: number) => 
    showToast('success', title, message, duration),
  
  error: (title: string, message?: string, duration?: number) => 
    showToast('error', title, message, duration || 8000), // Longer duration for errors
  
  warning: (title: string, message?: string, duration?: number) => 
    showToast('warning', title, message, duration),
  
  info: (title: string, message?: string, duration?: number) => 
    showToast('info', title, message, duration)
};

/**
 * Profile-specific toast messages
 */
export const profileToasts = {
  saveSuccess: () => toast.success(
    'Profile Updated', 
    'Your profile has been successfully updated.'
  ),
  
  saveError: (error?: string) => toast.error(
    'Update Failed', 
    error || 'Failed to update profile. Please try again.'
  ),
  
  networkError: () => toast.error(
    'Connection Error',
    'Please check your internet connection and try again.',
    8000
  ),
  
  validationError: () => toast.error(
    'Validation Error',
    'Please fix the errors in the form before saving.',
    6000
  ),
  
  timeout: () => toast.error(
    'Request Timeout',
    'The request took too long. Please try again.',
    8000
  ),
  
  unauthorized: () => toast.error(
    'Session Expired',
    'Please log in again to continue.',
    8000
  ),
  
  serverError: () => toast.error(
    'Server Error',
    'Something went wrong on our end. Please try again later.',
    8000
  ),
  
  avatarChangeSuccess: () => toast.success(
    'Avatar Updated',
    'Your avatar has been changed successfully.'
  ),
  
  specialtiesUpdated: (count: number) => toast.success(
    'Specialties Updated',
    `Selected ${count} medical ${count === 1 ? 'specialty' : 'specialties'}.`
  )
};