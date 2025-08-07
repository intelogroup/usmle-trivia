/**
 * Analytics Service - Event Tracking Implementation
 * Based on analytics-spec.md requirements
 * 
 * Tracks user interactions while maintaining privacy compliance (GDPR/HIPAA)
 */

// Analytics Event Types based on specs
export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string; // Anonymous/hashed user ID only
}

// Core Events from analytics-spec.md
export interface QuizStartEvent {
  eventName: 'quiz_start';
  properties: {
    mode: 'quick' | 'timed' | 'custom';
    topic?: string;
    numQuestions: number;
  };
}

export interface QuestionViewEvent {
  eventName: 'question_view';
  properties: {
    questionId: string;
    index: number;
  };
}

export interface AnswerSelectedEvent {
  eventName: 'answer_selected';
  properties: {
    questionId: string;
    selectedOption: number;
    correct: boolean;
  };
}

export interface QuizCompleteEvent {
  eventName: 'quiz_complete';
  properties: {
    totalCorrect: number;
    totalQuestions: number;
    duration: number; // in seconds
  };
}

export interface QuestionBookmarkEvent {
  eventName: 'question_bookmark';
  properties: {
    questionId: string;
  };
}

export interface ReviewStartEvent {
  eventName: 'review_start';
  properties: {
    numBookmarked: number;
    numIncorrect: number;
  };
}

export interface SearchPerformedEvent {
  eventName: 'search_performed';
  properties: {
    query: string;
    resultCount: number;
  };
}

export interface ErrorEncounteredEvent {
  eventName: 'error_encountered';
  properties: {
    errorCode: string;
    errorMessage: string;
    context: string;
  };
}

type SupportedEvent = 
  | QuizStartEvent 
  | QuestionViewEvent 
  | AnswerSelectedEvent 
  | QuizCompleteEvent 
  | QuestionBookmarkEvent 
  | ReviewStartEvent 
  | SearchPerformedEvent 
  | ErrorEncounteredEvent;

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private userId: string | null = null;

  /**
   * Initialize analytics with anonymous user identifier
   * @param userId - Hashed/anonymous user identifier (no PII)
   */
  public initialize(userId?: string): void {
    this.userId = userId ? this.hashUserId(userId) : null;
    console.log('📊 Analytics service initialized');
  }

  /**
   * Track an analytics event
   * @param event - The event to track
   */
  public track<T extends SupportedEvent>(event: T): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      eventName: event.eventName,
      properties: event.properties,
      timestamp: new Date(),
      userId: this.userId || undefined,
    };

    // Store event locally (in production, send to analytics service)
    this.events.push(analyticsEvent);
    
    // Log for development (remove in production)
    console.log(`📊 Analytics: ${event.eventName}`, analyticsEvent);
    
    // In production, send to analytics service like Google Analytics, Mixpanel, etc.
    this.sendToAnalyticsService(analyticsEvent);
  }

  /**
   * Track quiz start event
   */
  public trackQuizStart(mode: 'quick' | 'timed' | 'custom', numQuestions: number, topic?: string): void {
    this.track({
      eventName: 'quiz_start',
      properties: {
        mode,
        numQuestions,
        topic,
      },
    });
  }

  /**
   * Track question view event
   */
  public trackQuestionView(questionId: string, index: number): void {
    this.track({
      eventName: 'question_view',
      properties: {
        questionId,
        index,
      },
    });
  }

  /**
   * Track answer selection event
   */
  public trackAnswerSelected(questionId: string, selectedOption: number, correct: boolean): void {
    this.track({
      eventName: 'answer_selected',
      properties: {
        questionId,
        selectedOption,
        correct,
      },
    });
  }

  /**
   * Track quiz completion event
   */
  public trackQuizComplete(totalCorrect: number, totalQuestions: number, duration: number): void {
    this.track({
      eventName: 'quiz_complete',
      properties: {
        totalCorrect,
        totalQuestions,
        duration,
      },
    });
  }

  /**
   * Track question bookmark event
   */
  public trackQuestionBookmark(questionId: string): void {
    this.track({
      eventName: 'question_bookmark',
      properties: {
        questionId,
      },
    });
  }

  /**
   * Track review start event
   */
  public trackReviewStart(numBookmarked: number, numIncorrect: number): void {
    this.track({
      eventName: 'review_start',
      properties: {
        numBookmarked,
        numIncorrect,
      },
    });
  }

  /**
   * Track search performed event
   */
  public trackSearchPerformed(query: string, resultCount: number): void {
    this.track({
      eventName: 'search_performed',
      properties: {
        query,
        resultCount,
      },
    });
  }

  /**
   * Track error encountered event
   */
  public trackErrorEncountered(errorCode: string, errorMessage: string, context: string): void {
    this.track({
      eventName: 'error_encountered',
      properties: {
        errorCode,
        errorMessage: this.sanitizeErrorMessage(errorMessage),
        context,
      },
    });
  }

  /**
   * Get all tracked events (for debugging)
   */
  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear all tracked events
   */
  public clearEvents(): void {
    this.events = [];
  }

  /**
   * Enable/disable analytics tracking
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Hash user ID to ensure privacy compliance
   * @param userId - Raw user ID
   * @returns Hashed user ID
   */
  private hashUserId(userId: string): string {
    // Simple hash function for privacy (in production, use proper hashing)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `user_${Math.abs(hash)}`;
  }

  /**
   * Sanitize error messages to remove PII
   * @param errorMessage - Raw error message
   * @returns Sanitized error message
   */
  private sanitizeErrorMessage(errorMessage: string): string {
    // Remove potential PII from error messages
    return errorMessage
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]')
      .substring(0, 200); // Limit message length
  }

  /**
   * Send event to analytics service (placeholder for production implementation)
   * @param event - The event to send
   */
  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    // In production, implement actual analytics service integration
    // Examples: Google Analytics, Mixpanel, Amplitude, etc.
    
    try {
      // Placeholder for analytics service call
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
      
      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 [Analytics Service] Event tracked:', event);
      }
    } catch (error) {
      console.error('❌ Failed to send analytics event:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Helper function to get data-analytics attributes for DOM elements
export const getAnalyticsAttributes = (eventName: string, additionalData?: Record<string, string>) => {
  return {
    'data-analytics': eventName,
    ...Object.entries(additionalData || {}).reduce((acc, [key, value]) => {
      acc[`data-analytics-${key}`] = value;
      return acc;
    }, {} as Record<string, string>),
  };
};

// Export types for use in other components
export type {
  AnalyticsEvent,
  QuizStartEvent,
  QuestionViewEvent,
  AnswerSelectedEvent,
  QuizCompleteEvent,
  QuestionBookmarkEvent,
  ReviewStartEvent,
  SearchPerformedEvent,
  ErrorEncounteredEvent,
};