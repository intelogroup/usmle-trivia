/**
 * Production Analytics Providers
 * Comprehensive analytics integration for medical education platform
 * Supports Google Analytics 4, Mixpanel, and PostHog with offline queuing
 */

import { AnalyticsEvent } from './analytics';

// Analytics Provider Interface
interface AnalyticsProvider {
  initialize(config: AnalyticsConfig): Promise<void>;
  track(event: AnalyticsEvent): Promise<boolean>;
  identify(userId: string, properties?: Record<string, any>): Promise<void>;
  flush(): Promise<void>;
  isReady(): boolean;
}

// Configuration for analytics providers
interface AnalyticsConfig {
  projectId?: string;
  apiKey?: string;
  endpoint?: string;
  debug?: boolean;
  enableInDevelopment?: boolean;
}

// Google Analytics 4 Provider
class GoogleAnalyticsProvider implements AnalyticsProvider {
  private gtag?: (...args: any[]) => void;
  private measurementId: string;
  private ready = false;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  async initialize(config: AnalyticsConfig): Promise<void> {
    try {
      // Load Google Analytics 4 script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script1);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      this.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(args);
      };

      this.gtag('js', new Date());
      this.gtag('config', this.measurementId, {
        // Privacy-focused configuration for medical platform
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        restricted_data_processing: true,
      });

      this.ready = true;
      console.log('✅ Google Analytics 4 initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Analytics:', error);
    }
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (!this.ready || !this.gtag) return false;

    try {
      // Convert medical education events to GA4 format
      const gaEvent = this.convertToGA4Event(event);
      this.gtag('event', gaEvent.action, gaEvent.parameters);
      return true;
    } catch (error) {
      console.error('❌ GA4 tracking failed:', error);
      return false;
    }
  }

  async identify(userId: string): Promise<void> {
    if (!this.gtag) return;
    
    this.gtag('config', this.measurementId, {
      user_id: userId
    });
  }

  async flush(): Promise<void> {
    // GA4 handles this automatically
  }

  isReady(): boolean {
    return this.ready;
  }

  private convertToGA4Event(event: AnalyticsEvent) {
    const baseParams = {
      timestamp: event.timestamp.toISOString(),
      user_id: event.userId,
    };

    switch (event.eventName) {
      case 'quiz_start':
        return {
          action: 'quiz_start',
          parameters: {
            ...baseParams,
            quiz_mode: event.properties.mode,
            question_count: event.properties.numQuestions,
            topic: event.properties.topic || 'general'
          }
        };
      
      case 'quiz_complete':
        return {
          action: 'quiz_complete',
          parameters: {
            ...baseParams,
            score: event.properties.totalCorrect / event.properties.totalQuestions,
            correct_answers: event.properties.totalCorrect,
            total_questions: event.properties.totalQuestions,
            duration_seconds: event.properties.duration
          }
        };
        
      case 'question_view':
        return {
          action: 'question_view',
          parameters: {
            ...baseParams,
            question_id: event.properties.questionId,
            question_index: event.properties.index
          }
        };
        
      case 'answer_selected':
        return {
          action: 'answer_selected',
          parameters: {
            ...baseParams,
            question_id: event.properties.questionId,
            selected_option: event.properties.selectedOption,
            is_correct: event.properties.correct
          }
        };
        
      default:
        return {
          action: event.eventName,
          parameters: {
            ...baseParams,
            ...event.properties
          }
        };
    }
  }
}

// Mixpanel Provider for detailed user analytics
class MixpanelProvider implements AnalyticsProvider {
  private mixpanel: any;
  private token: string;
  private ready = false;

  constructor(token: string) {
    this.token = token;
  }

  async initialize(config: AnalyticsConfig): Promise<void> {
    try {
      // Dynamically import Mixpanel
      const { default: mixpanel } = await import('mixpanel-browser');
      
      mixpanel.init(this.token, {
        // Privacy-focused configuration
        respect_dnt: true,
        opt_out_tracking_by_default: false,
        property_blacklist: ['$current_url', '$referrer'],
        api_host: 'https://api-eu.mixpanel.com', // EU endpoint for GDPR
        debug: config.debug || false
      });

      this.mixpanel = mixpanel;
      this.ready = true;
      console.log('✅ Mixpanel initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Mixpanel:', error);
    }
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (!this.ready || !this.mixpanel) return false;

    try {
      // Convert medical education events to Mixpanel format
      const mixpanelEvent = this.convertToMixpanelEvent(event);
      this.mixpanel.track(mixpanelEvent.name, mixpanelEvent.properties);
      return true;
    } catch (error) {
      console.error('❌ Mixpanel tracking failed:', error);
      return false;
    }
  }

  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    if (!this.mixpanel) return;
    
    this.mixpanel.identify(userId);
    if (properties) {
      this.mixpanel.people.set(properties);
    }
  }

  async flush(): Promise<void> {
    if (this.mixpanel) {
      await new Promise(resolve => this.mixpanel.flush(resolve));
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  private convertToMixpanelEvent(event: AnalyticsEvent) {
    const baseProperties = {
      timestamp: event.timestamp.toISOString(),
      $user_id: event.userId,
      platform: 'web',
      product: 'medquiz_pro'
    };

    return {
      name: event.eventName,
      properties: {
        ...baseProperties,
        ...event.properties
      }
    };
  }
}

// PostHog Provider for open-source analytics
class PostHogProvider implements AnalyticsProvider {
  private posthog: any;
  private apiKey: string;
  private host: string;
  private ready = false;

  constructor(apiKey: string, host = 'https://app.posthog.com') {
    this.apiKey = apiKey;
    this.host = host;
  }

  async initialize(config: AnalyticsConfig): Promise<void> {
    try {
      // Dynamically import PostHog
      const posthog = await import('posthog-js');
      
      posthog.default.init(this.apiKey, {
        api_host: this.host,
        // Privacy-focused configuration
        respect_dnt: true,
        opt_out_capturing_by_default: false,
        loaded: () => {
          this.ready = true;
          console.log('✅ PostHog initialized');
        }
      });

      this.posthog = posthog.default;
    } catch (error) {
      console.error('❌ Failed to initialize PostHog:', error);
    }
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (!this.ready || !this.posthog) return false;

    try {
      this.posthog.capture(event.eventName, {
        timestamp: event.timestamp.toISOString(),
        $user_id: event.userId,
        ...event.properties
      });
      return true;
    } catch (error) {
      console.error('❌ PostHog tracking failed:', error);
      return false;
    }
  }

  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    if (!this.posthog) return;
    
    this.posthog.identify(userId, properties);
  }

  async flush(): Promise<void> {
    // PostHog handles this automatically
  }

  isReady(): boolean {
    return this.ready;
  }
}

// Offline Event Queue Manager
class OfflineEventQueue {
  private queue: AnalyticsEvent[] = [];
  private maxQueueSize = 100;
  private storageKey = 'medquiz_analytics_queue';

  constructor() {
    this.loadFromStorage();
    this.setupOnlineListener();
  }

  addEvent(event: AnalyticsEvent): void {
    this.queue.push(event);
    
    // Limit queue size to prevent memory issues
    if (this.queue.length > this.maxQueueSize) {
      this.queue = this.queue.slice(-this.maxQueueSize);
    }
    
    this.saveToStorage();
  }

  async flushQueue(provider: AnalyticsProvider): Promise<number> {
    if (!navigator.onLine || !provider.isReady()) {
      return 0;
    }

    const events = [...this.queue];
    let successCount = 0;

    for (const event of events) {
      try {
        const success = await provider.track(event);
        if (success) {
          successCount++;
          // Remove successfully sent event
          this.queue = this.queue.filter(e => e !== event);
        }
      } catch (error) {
        console.error('Failed to flush event:', error);
        break; // Stop flushing on error
      }
    }

    this.saveToStorage();
    return successCount;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.queue = parsed.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load analytics queue from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save analytics queue to storage:', error);
    }
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored, will flush analytics queue');
    });
  }
}

// Export all providers and utilities
export {
  GoogleAnalyticsProvider,
  MixpanelProvider,
  PostHogProvider,
  OfflineEventQueue,
  type AnalyticsProvider,
  type AnalyticsConfig
};