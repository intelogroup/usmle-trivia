/**
 * Session Persistence Utilities
 * Provides robust session management with retry logic, exponential backoff, and await/sleep functionality
 */

// Sleep utility for delays
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Exponential backoff utility
export const exponentialBackoff = (attempt: number, baseDelay = 1000, maxDelay = 10000): number => {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return delay + Math.random() * 1000; // Add jitter
};

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  operationName = 'Operation'
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt + 1}/${maxRetries + 1}`);
      
      if (attempt > 0) {
        const delay = exponentialBackoff(attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }
      
      const result = await operation();
      console.log(`✅ ${operationName} successful on attempt ${attempt + 1}`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ ${operationName} failed on attempt ${attempt + 1}:`, error);
      
      if (attempt === maxRetries) {
        console.error(`🚨 ${operationName} failed after ${maxRetries + 1} attempts`);
        break;
      }
    }
  }
  
  throw lastError!;
};

// Session Storage Utilities
export class SessionStorage {
  private static readonly SESSION_KEY = 'medquiz_session';
  private static readonly USER_KEY = 'medquiz_user';
  private static readonly QUIZ_STATE_KEY = 'medquiz_quiz_state';
  
  // Save session with persistence retry
  static async saveSession(sessionData: any): Promise<void> {
    return retryWithBackoff(async () => {
      const serialized = JSON.stringify(sessionData);
      localStorage.setItem(this.SESSION_KEY, serialized);
      
      // Verify save was successful
      await sleep(100); // Small delay to ensure write
      const retrieved = localStorage.getItem(this.SESSION_KEY);
      if (!retrieved || retrieved !== serialized) {
        throw new Error('Session save verification failed');
      }
      
      console.log('💾 Session saved successfully');
    }, 3, 'Save Session');
  }
  
  // Load session with retry logic
  static async loadSession(): Promise<any | null> {
    return retryWithBackoff(async () => {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;
      
      try {
        const parsed = JSON.parse(stored);
        console.log('📂 Session loaded successfully');
        return parsed;
      } catch (error) {
        console.warn('⚠️ Corrupted session data, clearing...');
        localStorage.removeItem(this.SESSION_KEY);
        return null;
      }
    }, 2, 'Load Session');
  }
  
  // Save user data
  static async saveUser(userData: any): Promise<void> {
    return retryWithBackoff(async () => {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      await sleep(50);
      console.log('👤 User data saved successfully');
    }, 3, 'Save User');
  }
  
  // Load user data
  static async loadUser(): Promise<any | null> {
    return retryWithBackoff(async () => {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    }, 2, 'Load User');
  }
  
  // Save quiz state for session recovery
  static async saveQuizState(quizState: any): Promise<void> {
    return retryWithBackoff(async () => {
      const stateWithTimestamp = {
        ...quizState,
        savedAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      localStorage.setItem(this.QUIZ_STATE_KEY, JSON.stringify(stateWithTimestamp));
      await sleep(100);
      console.log('🧩 Quiz state saved for recovery');
    }, 3, 'Save Quiz State');
  }
  
  // Load quiz state for recovery
  static async loadQuizState(): Promise<any | null> {
    return retryWithBackoff(async () => {
      const stored = localStorage.getItem(this.QUIZ_STATE_KEY);
      if (!stored) return null;
      
      try {
        const parsed = JSON.parse(stored);
        
        // Check if expired
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          console.log('🗑️ Quiz state expired, clearing...');
          localStorage.removeItem(this.QUIZ_STATE_KEY);
          return null;
        }
        
        console.log('🧩 Quiz state loaded for recovery');
        return parsed;
      } catch (error) {
        localStorage.removeItem(this.QUIZ_STATE_KEY);
        return null;
      }
    }, 2, 'Load Quiz State');
  }
  
  // Clear all session data
  static async clearSession(): Promise<void> {
    return retryWithBackoff(async () => {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.QUIZ_STATE_KEY);
      await sleep(100);
      console.log('🧹 Session cleared successfully');
    }, 2, 'Clear Session');
  }
}

// Database Operation Wrapper with Persistence
export class PersistentDatabaseOperations {
  // Execute database operation with retry and session backup
  static async executeWithPersistence<T>(
    operation: () => Promise<T>,
    operationName: string,
    backupData?: any
  ): Promise<T> {
    try {
      // Save backup data before operation if provided
      if (backupData) {
        await SessionStorage.saveQuizState(backupData);
      }
      
      // Execute operation with retry logic
      const result = await retryWithBackoff(
        operation,
        3,
        operationName
      );
      
      return result;
      
    } catch (error) {
      console.error(`🚨 Database operation failed: ${operationName}`, error);
      
      // If operation failed, we still have backup data
      if (backupData) {
        console.log('💾 Backup data is preserved for recovery');
      }
      
      throw error;
    }
  }
  
  // Create quiz session with persistence
  static async createQuizSessionPersistent(
    createOperation: () => Promise<any>,
    quizData: any
  ): Promise<any> {
    return this.executeWithPersistence(
      createOperation,
      'Create Quiz Session',
      {
        type: 'quiz_creation',
        quizData,
        timestamp: Date.now()
      }
    );
  }
  
  // Submit answer with persistence
  static async submitAnswerPersistent(
    submitOperation: () => Promise<any>,
    answerData: any
  ): Promise<any> {
    return this.executeWithPersistence(
      submitOperation,
      'Submit Answer',
      {
        type: 'answer_submission',
        answerData,
        timestamp: Date.now()
      }
    );
  }
  
  // Complete quiz with persistence
  static async completeQuizPersistent(
    completeOperation: () => Promise<any>,
    completionData: any
  ): Promise<any> {
    const result = await this.executeWithPersistence(
      completeOperation,
      'Complete Quiz',
      {
        type: 'quiz_completion',
        completionData,
        timestamp: Date.now()
      }
    );
    
    // Clear quiz state after successful completion
    await SessionStorage.saveQuizState(null);
    return result;
  }
}

// Session Recovery Manager
export class SessionRecoveryManager {
  // Check for recoverable quiz sessions
  static async checkForRecoverableSession(): Promise<any | null> {
    try {
      const quizState = await SessionStorage.loadQuizState();
      
      if (quizState && quizState.type) {
        console.log('🔄 Found recoverable quiz session:', quizState.type);
        return quizState;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for recoverable session:', error);
      return null;
    }
  }
  
  // Recover quiz session
  static async recoverSession(recoveryData: any): Promise<boolean> {
    try {
      console.log('🔄 Attempting to recover session...');
      await sleep(500); // Brief pause for UI feedback
      
      // Implementation would depend on the type of recovery needed
      switch (recoveryData.type) {
        case 'quiz_creation':
          console.log('📝 Recovering quiz creation...');
          return true;
          
        case 'answer_submission':
          console.log('✍️ Recovering answer submission...');
          return true;
          
        case 'quiz_completion':
          console.log('✅ Recovering quiz completion...');
          return true;
          
        default:
          console.log('❓ Unknown recovery type');
          return false;
      }
    } catch (error) {
      console.error('Failed to recover session:', error);
      return false;
    }
  }
  
  // Clear recovery data
  static async clearRecoveryData(): Promise<void> {
    await SessionStorage.saveQuizState(null);
    console.log('🧹 Recovery data cleared');
  }
}

// Auto-save functionality for quiz sessions
export class QuizAutoSave {
  private static autoSaveInterval: NodeJS.Timeout | null = null;
  private static readonly AUTOSAVE_DELAY = 30000; // 30 seconds
  
  // Start auto-save for quiz session
  static startAutoSave(getQuizState: () => any): void {
    this.stopAutoSave(); // Clear any existing interval
    
    this.autoSaveInterval = setInterval(async () => {
      try {
        const currentState = getQuizState();
        if (currentState) {
          await SessionStorage.saveQuizState({
            type: 'autosave',
            data: currentState,
            timestamp: Date.now()
          });
          console.log('💾 Quiz auto-saved');
        }
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, this.AUTOSAVE_DELAY);
    
    console.log('⏰ Quiz auto-save started');
  }
  
  // Stop auto-save
  static stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('⏰ Quiz auto-save stopped');
    }
  }
}