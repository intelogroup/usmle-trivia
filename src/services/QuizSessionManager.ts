/**
 * QuizSessionManager - Centralized session management for MedQuiz Pro
 * 
 * Handles the complete lifecycle of quiz sessions with proper isolation,
 * abandonment detection, and state management.
 */

export type QuizSessionState = 
  | 'idle' 
  | 'starting' 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'abandoned';

export type QuizMode = 'quick' | 'timed' | 'custom';

export interface QuizSessionData {
  sessionId: string;
  userId: string;
  mode: QuizMode;
  state: QuizSessionState;
  questions: string[]; // Question IDs
  currentQuestionIndex: number;
  answers: (number | null)[];
  startTime: Date;
  endTime?: Date;
  timeSpent: number;
  score: number;
  isTimeLimited: boolean;
  timeLimit?: number; // seconds
  timeRemaining?: number; // seconds
  metadata: {
    totalQuestions: number;
    correctAnswers: number;
    questionsAttempted: number;
    averageTimePerQuestion: number;
    abandoned: boolean;
    abandonReason?: string;
    navigationCount: number; // track question navigation
    lastActivityTime: Date;
  };
}

export interface SessionEventData {
  sessionId: string;
  previousState?: QuizSessionState;
  currentState: QuizSessionState;
  timestamp: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

export type SessionEventHandler = (event: SessionEventData) => void;

class QuizSessionManager {
  private static instance: QuizSessionManager;
  private currentSession: QuizSessionData | null = null;
  private eventHandlers: Map<string, SessionEventHandler[]> = new Map();
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private abandonmentTimeoutMs = 30 * 60 * 1000; // 30 minutes
  private autoSaveIntervalMs = 10 * 1000; // 10 seconds

  private constructor() {
    this.setupAbandonmentDetection();
    this.startSessionMonitoring();
  }

  public static getInstance(): QuizSessionManager {
    if (!QuizSessionManager.instance) {
      QuizSessionManager.instance = new QuizSessionManager();
    }
    return QuizSessionManager.instance;
  }

  /**
   * Create a new quiz session
   */
  public async createSession(
    userId: string,
    mode: QuizMode,
    questionIds: string[],
    config?: { timeLimit?: number }
  ): Promise<string> {
    // Ensure no overlapping sessions
    if (this.currentSession && this.currentSession.state === 'active') {
      throw new Error('Cannot start new session: another session is already active');
    }

    // Abandon any existing session
    if (this.currentSession) {
      await this.abandonSession('new_session_started');
    }

    const sessionId = this.generateSessionId();
    const now = new Date();

    const sessionData: QuizSessionData = {
      sessionId,
      userId,
      mode,
      state: 'starting',
      questions: questionIds,
      currentQuestionIndex: 0,
      answers: new Array(questionIds.length).fill(null),
      startTime: now,
      timeSpent: 0,
      score: 0,
      isTimeLimited: !!config?.timeLimit,
      timeLimit: config?.timeLimit,
      timeRemaining: config?.timeLimit,
      metadata: {
        totalQuestions: questionIds.length,
        correctAnswers: 0,
        questionsAttempted: 0,
        averageTimePerQuestion: 0,
        abandoned: false,
        navigationCount: 0,
        lastActivityTime: now,
      },
    };

    this.currentSession = sessionData;
    this.saveSessionToStorage();

    console.log(`🎯 Quiz session created: ${sessionId} (${mode})`);
    this.emitEvent('session_created', { 
      sessionId, 
      currentState: 'starting',
      timestamp: now 
    });

    return sessionId;
  }

  /**
   * Start an active quiz session
   */
  public async startSession(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No session to start');
    }

    if (this.currentSession.state !== 'starting') {
      throw new Error(`Cannot start session in state: ${this.currentSession.state}`);
    }

    const previousState = this.currentSession.state;
    this.currentSession.state = 'active';
    this.currentSession.startTime = new Date();
    this.currentSession.metadata.lastActivityTime = new Date();

    this.saveSessionToStorage();

    console.log(`▶️ Quiz session started: ${this.currentSession.sessionId}`);
    this.emitEvent('session_started', {
      sessionId: this.currentSession.sessionId,
      previousState,
      currentState: 'active',
      timestamp: new Date(),
    });
  }

  /**
   * Navigate to a specific question
   */
  public navigateToQuestion(questionIndex: number): boolean {
    if (!this.currentSession || this.currentSession.state !== 'active') {
      console.warn('Cannot navigate: no active session');
      return false;
    }

    if (questionIndex < 0 || questionIndex >= this.currentSession.questions.length) {
      console.warn(`Invalid question index: ${questionIndex}`);
      return false;
    }

    const previousIndex = this.currentSession.currentQuestionIndex;
    this.currentSession.currentQuestionIndex = questionIndex;
    this.currentSession.metadata.navigationCount++;
    this.currentSession.metadata.lastActivityTime = new Date();

    this.saveSessionToStorage();

    console.log(`🧭 Navigated from Q${previousIndex + 1} to Q${questionIndex + 1}`);
    this.emitEvent('question_changed', {
      sessionId: this.currentSession.sessionId,
      currentState: 'active',
      timestamp: new Date(),
      metadata: { 
        fromIndex: previousIndex, 
        toIndex: questionIndex,
        navigationCount: this.currentSession.metadata.navigationCount
      },
    });

    return true;
  }

  /**
   * Submit answer for current question
   */
  public submitAnswer(answerIndex: number): boolean {
    if (!this.currentSession || this.currentSession.state !== 'active') {
      console.warn('Cannot submit answer: no active session');
      return false;
    }

    const currentIndex = this.currentSession.currentQuestionIndex;
    this.currentSession.answers[currentIndex] = answerIndex;
    this.currentSession.metadata.questionsAttempted++;
    this.currentSession.metadata.lastActivityTime = new Date();

    // Calculate time spent (simplified)
    const now = new Date();
    const sessionTimeMs = now.getTime() - this.currentSession.startTime.getTime();
    this.currentSession.timeSpent = Math.floor(sessionTimeMs / 1000);

    this.saveSessionToStorage();

    console.log(`✅ Answer submitted for Q${currentIndex + 1}: ${answerIndex}`);
    this.emitEvent('answer_submitted', {
      sessionId: this.currentSession.sessionId,
      currentState: 'active',
      timestamp: new Date(),
      metadata: { 
        questionIndex: currentIndex, 
        answerIndex,
        questionsAttempted: this.currentSession.metadata.questionsAttempted
      },
    });

    return true;
  }

  /**
   * Complete the current session
   */
  public async completeSession(finalScore?: number): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No session to complete');
    }

    if (this.currentSession.state !== 'active') {
      throw new Error(`Cannot complete session in state: ${this.currentSession.state}`);
    }

    const previousState = this.currentSession.state;
    this.currentSession.state = 'completed';
    this.currentSession.endTime = new Date();
    
    // Update final metrics
    if (finalScore !== undefined) {
      this.currentSession.score = finalScore;
    }
    
    const sessionTimeMs = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
    this.currentSession.timeSpent = Math.floor(sessionTimeMs / 1000);
    
    if (this.currentSession.metadata.questionsAttempted > 0) {
      this.currentSession.metadata.averageTimePerQuestion = 
        this.currentSession.timeSpent / this.currentSession.metadata.questionsAttempted;
    }

    this.saveSessionToStorage();

    console.log(`🏁 Quiz session completed: ${this.currentSession.sessionId} (Score: ${finalScore})`);
    this.emitEvent('session_completed', {
      sessionId: this.currentSession.sessionId,
      previousState,
      currentState: 'completed',
      timestamp: new Date(),
      metadata: {
        score: finalScore,
        timeSpent: this.currentSession.timeSpent,
        questionsAttempted: this.currentSession.metadata.questionsAttempted,
      },
    });

    // Clear session after completion
    setTimeout(() => this.clearSession(), 1000);
  }

  /**
   * Abandon the current session
   */
  public async abandonSession(reason: string = 'user_action'): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    const previousState = this.currentSession.state;
    this.currentSession.state = 'abandoned';
    this.currentSession.endTime = new Date();
    this.currentSession.metadata.abandoned = true;
    this.currentSession.metadata.abandonReason = reason;

    this.saveSessionToStorage();

    console.log(`❌ Quiz session abandoned: ${this.currentSession.sessionId} (${reason})`);
    this.emitEvent('session_abandoned', {
      sessionId: this.currentSession.sessionId,
      previousState,
      currentState: 'abandoned',
      timestamp: new Date(),
      reason,
    });

    // Clear session after short delay
    setTimeout(() => this.clearSession(), 2000);
  }

  /**
   * Get current session data
   */
  public getCurrentSession(): QuizSessionData | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Check if there's an active session
   */
  public hasActiveSession(): boolean {
    return this.currentSession?.state === 'active';
  }

  /**
   * Get current question index
   */
  public getCurrentQuestionIndex(): number {
    return this.currentSession?.currentQuestionIndex ?? -1;
  }

  /**
   * Check if user can navigate to next question
   */
  public canNavigateNext(): boolean {
    if (!this.currentSession || this.currentSession.state !== 'active') {
      return false;
    }
    return this.currentSession.currentQuestionIndex < this.currentSession.questions.length - 1;
  }

  /**
   * Check if user can navigate to previous question
   */
  public canNavigatePrevious(): boolean {
    if (!this.currentSession || this.currentSession.state !== 'active') {
      return false;
    }
    return this.currentSession.currentQuestionIndex > 0;
  }

  /**
   * Event system
   */
  public addEventListener(event: string, handler: SessionEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public removeEventListener(event: string, handler: SessionEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: SessionEventData): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in session event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Setup abandonment detection
   */
  private setupAbandonmentDetection(): void {
    // Tab/window close detection
    window.addEventListener('beforeunload', (event) => {
      if (this.hasActiveSession()) {
        this.abandonSession('page_unload');
        // Note: Modern browsers ignore custom messages, but we still return one
        const message = 'You have an active quiz session. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    });

    // Visibility change detection (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.hasActiveSession()) {
        console.log('👁️ Tab hidden during active session');
        this.emitEvent('session_visibility_changed', {
          sessionId: this.currentSession!.sessionId,
          currentState: this.currentSession!.state,
          timestamp: new Date(),
          metadata: { hidden: true },
        });
      }
    });
  }

  /**
   * Start session monitoring for abandonment
   */
  private startSessionMonitoring(): void {
    this.sessionCheckInterval = setInterval(() => {
      if (!this.currentSession || this.currentSession.state !== 'active') {
        return;
      }

      const now = new Date();
      const lastActivity = this.currentSession.metadata.lastActivityTime;
      const inactiveTimeMs = now.getTime() - lastActivity.getTime();

      // Auto-abandon after prolonged inactivity
      if (inactiveTimeMs > this.abandonmentTimeoutMs) {
        this.abandonSession('inactivity_timeout');
      }

      // Update time remaining for timed quizzes
      if (this.currentSession.isTimeLimited && this.currentSession.timeLimit) {
        const elapsedSeconds = Math.floor((now.getTime() - this.currentSession.startTime.getTime()) / 1000);
        const remaining = Math.max(0, this.currentSession.timeLimit - elapsedSeconds);
        
        this.currentSession.timeRemaining = remaining;
        
        if (remaining === 0) {
          console.log('⏰ Time limit reached - auto-completing session');
          this.completeSession();
        }
      }

    }, 5000); // Check every 5 seconds
  }

  /**
   * Session persistence
   */
  private saveSessionToStorage(): void {
    if (this.currentSession) {
      try {
        const serialized = JSON.stringify({
          ...this.currentSession,
          startTime: this.currentSession.startTime.toISOString(),
          endTime: this.currentSession.endTime?.toISOString(),
          metadata: {
            ...this.currentSession.metadata,
            lastActivityTime: this.currentSession.metadata.lastActivityTime.toISOString(),
          },
        });
        localStorage.setItem('medquiz_active_session', serialized);
      } catch (error) {
        console.error('Failed to save session to localStorage:', error);
      }
    }
  }

  private loadSessionFromStorage(): QuizSessionData | null {
    try {
      const stored = localStorage.getItem('medquiz_active_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          startTime: new Date(parsed.startTime),
          endTime: parsed.endTime ? new Date(parsed.endTime) : undefined,
          metadata: {
            ...parsed.metadata,
            lastActivityTime: new Date(parsed.metadata.lastActivityTime),
          },
        };
      }
    } catch (error) {
      console.error('Failed to load session from localStorage:', error);
    }
    return null;
  }

  private clearSession(): void {
    this.currentSession = null;
    try {
      localStorage.removeItem('medquiz_active_session');
    } catch (error) {
      console.error('Failed to clear session from localStorage:', error);
    }
  }

  private generateSessionId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize session recovery on app start
   */
  public initializeFromStorage(): void {
    const storedSession = this.loadSessionFromStorage();
    if (storedSession) {
      // Check if session should be recovered or abandoned
      const now = new Date();
      const lastActivity = storedSession.metadata.lastActivityTime;
      const inactiveTimeMs = now.getTime() - lastActivity.getTime();
      
      if (inactiveTimeMs < this.abandonmentTimeoutMs && storedSession.state === 'active') {
        console.log('🔄 Recovering session from localStorage:', storedSession.sessionId);
        this.currentSession = storedSession;
        this.emitEvent('session_recovered', {
          sessionId: storedSession.sessionId,
          currentState: storedSession.state,
          timestamp: now,
          metadata: { inactiveTimeMs },
        });
      } else {
        console.log('🗑️ Clearing expired session from localStorage');
        this.clearSession();
      }
    }
  }

  /**
   * Cleanup on app shutdown
   */
  public cleanup(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    if (this.hasActiveSession()) {
      this.abandonSession('app_shutdown');
    }
  }
}

// Export singleton instance
export const quizSessionManager = QuizSessionManager.getInstance();

// Auto-initialize on module load
quizSessionManager.initializeFromStorage();