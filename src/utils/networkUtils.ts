/**
 * Network Utilities with Retry Logic and Error Handling
 * For MedQuiz Pro - Medical Education Platform
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

export interface NetworkError extends Error {
  status?: number;
  code?: string;
  isNetworkError: boolean;
  isRetryable: boolean;
  originalError?: any;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      !error.status || // Network/connection errors
      error.status >= 500 || // Server errors
      error.status === 408 || // Request timeout
      error.status === 429 // Rate limit (with backoff)
    );
  }
};

/**
 * Create a network error with enhanced information
 */
export const createNetworkError = (
  message: string, 
  status?: number, 
  code?: string,
  originalError?: any
): NetworkError => {
  const error = new Error(message) as NetworkError;
  error.name = 'NetworkError';
  error.status = status;
  error.code = code;
  error.isNetworkError = true;
  error.isRetryable = DEFAULT_RETRY_CONFIG.retryCondition?.(error) ?? false;
  error.originalError = originalError;
  return error;
};

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate delay with exponential backoff and jitter
 */
const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  const delayWithJitter = exponentialDelay * (0.5 + Math.random() * 0.5); // Add 50-100% jitter
  return Math.min(delayWithJitter, config.maxDelay);
};

/**
 * Enhanced retry wrapper with exponential backoff
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt > retryConfig.maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (retryConfig.retryCondition && !retryConfig.retryCondition(error)) {
        break;
      }

      // Log retry attempt
      console.warn(`Operation failed (attempt ${attempt}/${retryConfig.maxRetries + 1}):`, error.message);

      // Wait before retrying
      const delay = calculateDelay(attempt, retryConfig);
      console.info(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // If we got here, all retries failed
  throw createNetworkError(
    `Operation failed after ${retryConfig.maxRetries + 1} attempts: ${lastError.message}`,
    lastError.status,
    lastError.code,
    lastError
  );
};

/**
 * Enhanced fetch wrapper with retry logic and error handling
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<Response> => {
  const operation = async (): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...options,
        // Add timeout if not specified
        signal: options.signal || AbortSignal.timeout(30000), // 30 second timeout
      });

      // Check if response is ok
      if (!response.ok) {
        throw createNetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          `HTTP_${response.status}`
        );
      }

      return response;
    } catch (error: any) {
      // Handle different types of errors
      if (error.name === 'AbortError') {
        throw createNetworkError('Request timeout', 408, 'TIMEOUT', error);
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw createNetworkError('Network connection failed', undefined, 'CONNECTION_FAILED', error);
      } else if (error.isNetworkError) {
        throw error; // Re-throw our custom network errors
      } else {
        throw createNetworkError(`Request failed: ${error.message}`, undefined, 'UNKNOWN', error);
      }
    }
  };

  return withRetry(operation, retryConfig);
};

/**
 * Network status detection
 */
export class NetworkStatusMonitor {
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private _isOnline: boolean = navigator.onLine;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this._isOnline = true;
    this.listeners.forEach(listener => listener(true));
  };

  private handleOffline = () => {
    this._isOnline = false;
    this.listeners.forEach(listener => listener(false));
  };

  get isOnline(): boolean {
    return this._isOnline;
  }

  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const networkMonitor = new NetworkStatusMonitor();

/**
 * React hook for network status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(networkMonitor.isOnline);

  React.useEffect(() => {
    return networkMonitor.subscribe(setIsOnline);
  }, []);

  return isOnline;
};

/**
 * Profile-specific network utilities
 */
export const profileNetworkUtils = {
  /**
   * Update user profile with retry logic
   */
  updateProfileWithRetry: async (updateFunction: () => Promise<any>, maxRetries = 3) => {
    return withRetry(updateFunction, {
      maxRetries,
      baseDelay: 1000,
      maxDelay: 5000,
      retryCondition: (error) => {
        // Don't retry validation errors (4xx except timeout and rate limit)
        if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
          return false;
        }
        return true;
      }
    });
  },

  /**
   * Fetch user profile with retry logic
   */
  fetchProfileWithRetry: async (fetchFunction: () => Promise<any>, maxRetries = 2) => {
    return withRetry(fetchFunction, {
      maxRetries,
      baseDelay: 500,
      maxDelay: 2000
    });
  }
};

/**
 * Error classification utilities
 */
export const classifyError = (error: any): {
  type: 'network' | 'validation' | 'authorization' | 'server' | 'timeout' | 'unknown';
  isRetryable: boolean;
  userMessage: string;
} => {
  if (error.isNetworkError || error.name === 'NetworkError') {
    if (error.code === 'TIMEOUT' || error.status === 408) {
      return {
        type: 'timeout',
        isRetryable: true,
        userMessage: 'The request timed out. Please try again.'
      };
    }
    if (error.code === 'CONNECTION_FAILED') {
      return {
        type: 'network',
        isRetryable: true,
        userMessage: 'Unable to connect. Please check your internet connection.'
      };
    }
  }

  if (error.status) {
    if (error.status === 401) {
      return {
        type: 'authorization',
        isRetryable: false,
        userMessage: 'Your session has expired. Please log in again.'
      };
    }
    if (error.status >= 400 && error.status < 500) {
      return {
        type: 'validation',
        isRetryable: false,
        userMessage: 'There was an issue with your request. Please check your information and try again.'
      };
    }
    if (error.status >= 500) {
      return {
        type: 'server',
        isRetryable: true,
        userMessage: 'We\'re experiencing technical difficulties. Please try again in a moment.'
      };
    }
  }

  return {
    type: 'unknown',
    isRetryable: false,
    userMessage: 'An unexpected error occurred. Please try again.'
  };
};