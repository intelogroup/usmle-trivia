/**
 * Advanced Performance Monitoring and Optimization Service
 * Comprehensive performance tracking for medical education platform
 * Includes Web Vitals, component performance, memory usage, and medical content optimization
 */

import React from 'react';
import { analyticsService } from './analytics';

// Performance metric types
export interface WebVitalMetrics {
  // Core Web Vitals
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  
  // Additional Web Vitals
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
  TTI: number; // Time to Interactive
  TBT: number; // Total Blocking Time
  
  // Custom metrics
  firstQuestionLoad: number;
  explanationRenderTime: number;
  medicalContentParseTime: number;
}

export interface ComponentPerformance {
  componentName: string;
  mountTime: number;
  renderTime: number;
  updateCount: number;
  memoryUsage: number;
  lastRenderTimestamp: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
}

export interface NetworkPerformance {
  connectionType: string;
  effectiveType: string;
  downloadThroughput: number;
  rtt: number;
  questionsLoadTime: number;
  imagesLoadTime: number;
  totalResourceSize: number;
}

export interface PerformanceReport {
  timestamp: number;
  webVitals: Partial<WebVitalMetrics>;
  components: ComponentPerformance[];
  memory: MemoryMetrics;
  network: NetworkPerformance;
  recommendations: PerformanceRecommendation[];
  score: number; // Overall performance score 0-100
}

export interface PerformanceRecommendation {
  type: 'critical' | 'important' | 'suggestion';
  category: 'loading' | 'rendering' | 'memory' | 'network' | 'user-experience';
  issue: string;
  solution: string;
  impact: 'high' | 'medium' | 'low';
  estimatedImprovement: string;
}

// Medical content specific performance
export interface MedicalContentPerformance {
  questionParseTime: number;
  explanationRenderTime: number;
  medicalTermLookupTime: number;
  abbreviationExpansionTime: number;
  validationTime: number;
  totalContentProcessingTime: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observer: PerformanceObserver | null = null;
  private componentMetrics = new Map<string, ComponentPerformance>();
  private webVitals: Partial<WebVitalMetrics> = {};
  private isMonitoring = false;
  private reportInterval: number | null = null;

  constructor() {
    this.initializePerformanceObserver();
    this.setupWebVitalsTracking();
    this.startMemoryMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start comprehensive performance monitoring
   */
  startMonitoring(reportIntervalMs = 30000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🚀 Performance monitoring started for medical education platform');
    
    // Start periodic reporting
    this.reportInterval = window.setInterval(() => {
      this.generatePerformanceReport().then(report => {
        this.sendReportToAnalytics(report);
        this.logPerformanceWarnings(report);
      });
    }, reportIntervalMs);
    
    // Monitor page visibility for accurate metrics
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Track component performance
   */
  trackComponent(componentName: string, operation: 'mount' | 'render' | 'update'): {
    start: () => void;
    end: () => void;
  } {
    const startTime = performance.now();
    
    return {
      start: () => {
        // Marking start time is handled in constructor
      },
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const existing = this.componentMetrics.get(componentName);
        if (existing) {
          existing.updateCount++;
          existing.renderTime = (existing.renderTime + duration) / 2; // Average
          existing.lastRenderTimestamp = endTime;
        } else {
          this.componentMetrics.set(componentName, {
            componentName,
            mountTime: operation === 'mount' ? duration : 0,
            renderTime: operation === 'render' ? duration : 0,
            updateCount: operation === 'update' ? 1 : 0,
            memoryUsage: this.getCurrentMemoryUsage(),
            lastRenderTimestamp: endTime
          });
        }
        
        // Log slow components
        if (duration > 16) { // > 1 frame at 60fps
          console.warn(`⚠️ Slow ${operation} detected: ${componentName} took ${duration.toFixed(2)}ms`);
        }
      }
    };
  }

  /**
   * Track medical content processing performance
   */
  trackMedicalContentProcessing(): {
    startQuestionParse: () => void;
    endQuestionParse: () => void;
    startExplanationRender: () => void;
    endExplanationRender: () => void;
    startTermLookup: () => void;
    endTermLookup: () => void;
    getReport: () => MedicalContentPerformance;
  } {
    const timings: any = {};
    
    return {
      startQuestionParse: () => { timings.questionParseStart = performance.now(); },
      endQuestionParse: () => { timings.questionParseTime = performance.now() - timings.questionParseStart; },
      
      startExplanationRender: () => { timings.explanationRenderStart = performance.now(); },
      endExplanationRender: () => { timings.explanationRenderTime = performance.now() - timings.explanationRenderStart; },
      
      startTermLookup: () => { timings.termLookupStart = performance.now(); },
      endTermLookup: () => { timings.medicalTermLookupTime = performance.now() - timings.termLookupStart; },
      
      getReport: () => ({
        questionParseTime: timings.questionParseTime || 0,
        explanationRenderTime: timings.explanationRenderTime || 0,
        medicalTermLookupTime: timings.medicalTermLookupTime || 0,
        abbreviationExpansionTime: 0, // Can be added similarly
        validationTime: 0, // Can be added similarly
        totalContentProcessingTime: (timings.questionParseTime || 0) + (timings.explanationRenderTime || 0) + (timings.medicalTermLookupTime || 0)
      })
    };
  }

  /**
   * Initialize Performance Observer for Web APIs
   */
  private initializePerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });
      
      // Observe different types of performance entries
      this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'long-animation-frame', 'resource', 'navigation'] });
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }
  }

  /**
   * Process individual performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.webVitals.FCP = entry.startTime;
        }
        break;
      
      case 'largest-contentful-paint':
        this.webVitals.LCP = entry.startTime;
        break;
      
      case 'first-input':
        this.webVitals.FID = (entry as any).processingStart - entry.startTime;
        break;
      
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.webVitals.CLS = (this.webVitals.CLS || 0) + (entry as any).value;
        }
        break;
      
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.webVitals.TTFB = navEntry.responseStart - navEntry.requestStart;
        break;
      
      case 'resource':
        this.trackResourcePerformance(entry as PerformanceResourceTiming);
        break;
    }
  }

  /**
   * Track resource loading performance
   */
  private trackResourcePerformance(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.requestStart;
    
    if (entry.name.includes('question') || entry.name.includes('medical')) {
      // Track medical content loading
      if (duration > 1000) { // > 1 second
        console.warn(`⚠️ Slow medical content loading: ${entry.name} took ${duration.toFixed(2)}ms`);
      }
    }
    
    if (entry.transferSize > 1000000) { // > 1MB
      console.warn(`⚠️ Large resource detected: ${entry.name} is ${(entry.transferSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * Setup Web Vitals tracking using web-vitals library concepts
   */
  private setupWebVitalsTracking(): void {
    // Track TTI (Time to Interactive)
    this.measureTTI();
    
    // Track custom medical education metrics
    this.setupCustomMetrics();
  }

  /**
   * Measure Time to Interactive
   */
  private measureTTI(): void {
    // Simplified TTI detection
    let interactivityTimer: number;
    
    const checkInteractivity = () => {
      const now = performance.now();
      
      // Check if main thread is quiet
      const recentEntries = performance.getEntriesByType('longtask').filter(
        entry => now - entry.startTime < 5000
      );
      
      if (recentEntries.length === 0) {
        this.webVitals.TTI = now;
        clearInterval(interactivityTimer);
      }
    };
    
    interactivityTimer = window.setInterval(checkInteractivity, 1000);
  }

  /**
   * Setup custom metrics for medical education platform
   */
  private setupCustomMetrics(): void {
    // Track first question load time
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const questionElement = document.querySelector('.quiz-question, [data-question]');
          if (questionElement && !this.webVitals.firstQuestionLoad) {
            this.webVitals.firstQuestionLoad = performance.now();
          }
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryPressure = this.calculateMemoryPressure(memory);
        
        if (memoryPressure === 'high' || memoryPressure === 'critical') {
          console.warn(`⚠️ High memory usage detected: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Calculate memory pressure level
   */
  private calculateMemoryPressure(memory: any): MemoryMetrics['memoryPressure'] {
    const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    if (usage > 0.9) return 'critical';
    if (usage > 0.7) return 'high';
    if (usage > 0.5) return 'medium';
    return 'low';
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(): Promise<PerformanceReport> {
    const memory = this.getMemoryMetrics();
    const network = await this.getNetworkPerformance();
    const recommendations = this.generateRecommendations();
    const score = this.calculatePerformanceScore();

    return {
      timestamp: Date.now(),
      webVitals: this.webVitals,
      components: Array.from(this.componentMetrics.values()),
      memory,
      network,
      recommendations,
      score
    };
  }

  /**
   * Get memory metrics
   */
  private getMemoryMetrics(): MemoryMetrics {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        memoryPressure: this.calculateMemoryPressure(memory)
      };
    }
    
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      memoryPressure: 'low'
    };
  }

  /**
   * Get network performance metrics
   */
  private async getNetworkPerformance(): Promise<NetworkPerformance> {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const totalResourceSize = resourceEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    
    // Calculate average load times for different content types
    const questionResources = resourceEntries.filter(entry => 
      entry.name.includes('question') || entry.name.includes('medical')
    );
    const imageResources = resourceEntries.filter(entry => 
      entry.name.includes('.jpg') || entry.name.includes('.png') || entry.name.includes('.svg')
    );
    
    const questionsLoadTime = questionResources.length > 0 
      ? questionResources.reduce((sum, entry) => sum + (entry.responseEnd - entry.requestStart), 0) / questionResources.length
      : 0;
    
    const imagesLoadTime = imageResources.length > 0
      ? imageResources.reduce((sum, entry) => sum + (entry.responseEnd - entry.requestStart), 0) / imageResources.length
      : 0;

    return {
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downloadThroughput: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      questionsLoadTime,
      imagesLoadTime,
      totalResourceSize
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // Check LCP
    if (this.webVitals.LCP && this.webVitals.LCP > 2500) {
      recommendations.push({
        type: 'critical',
        category: 'loading',
        issue: 'Slow Largest Contentful Paint (LCP)',
        solution: 'Optimize images, reduce server response time, eliminate render-blocking resources',
        impact: 'high',
        estimatedImprovement: 'Improve LCP by 1-2 seconds'
      });
    }

    // Check FID
    if (this.webVitals.FID && this.webVitals.FID > 100) {
      recommendations.push({
        type: 'important',
        category: 'user-experience',
        issue: 'High First Input Delay (FID)',
        solution: 'Reduce JavaScript execution time, split large bundles, defer non-critical JS',
        impact: 'high',
        estimatedImprovement: 'Improve responsiveness by 50-100ms'
      });
    }

    // Check CLS
    if (this.webVitals.CLS && this.webVitals.CLS > 0.1) {
      recommendations.push({
        type: 'important',
        category: 'user-experience',
        issue: 'High Cumulative Layout Shift (CLS)',
        solution: 'Add size attributes to images, reserve space for dynamic content, avoid inserting content above existing content',
        impact: 'medium',
        estimatedImprovement: 'Reduce layout shifts by 60-80%'
      });
    }

    // Check memory usage
    const memory = this.getMemoryMetrics();
    if (memory.memoryPressure === 'high' || memory.memoryPressure === 'critical') {
      recommendations.push({
        type: 'critical',
        category: 'memory',
        issue: 'High memory usage detected',
        solution: 'Clean up unused components, implement lazy loading, optimize medical content caching',
        impact: 'high',
        estimatedImprovement: 'Reduce memory usage by 20-30%'
      });
    }

    // Check slow components
    Array.from(this.componentMetrics.values()).forEach(component => {
      if (component.renderTime > 16) {
        recommendations.push({
          type: 'suggestion',
          category: 'rendering',
          issue: `Slow component: ${component.componentName}`,
          solution: 'Optimize rendering logic, implement React.memo, reduce unnecessary re-renders',
          impact: 'medium',
          estimatedImprovement: 'Improve component performance by 30-50%'
        });
      }
    });

    return recommendations;
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(): number {
    let score = 100;
    
    // Deduct points based on Web Vitals
    if (this.webVitals.LCP) {
      if (this.webVitals.LCP > 4000) score -= 30;
      else if (this.webVitals.LCP > 2500) score -= 15;
    }
    
    if (this.webVitals.FID) {
      if (this.webVitals.FID > 300) score -= 25;
      else if (this.webVitals.FID > 100) score -= 10;
    }
    
    if (this.webVitals.CLS) {
      if (this.webVitals.CLS > 0.25) score -= 20;
      else if (this.webVitals.CLS > 0.1) score -= 10;
    }

    // Deduct for memory issues
    const memory = this.getMemoryMetrics();
    if (memory.memoryPressure === 'critical') score -= 25;
    else if (memory.memoryPressure === 'high') score -= 15;

    return Math.max(0, score);
  }

  /**
   * Send performance report to analytics
   */
  private sendReportToAnalytics(report: PerformanceReport): void {
    analyticsService.trackPerformance({
      score: report.score,
      lcp: report.webVitals.LCP || 0,
      fid: report.webVitals.FID || 0,
      cls: report.webVitals.CLS || 0,
      memoryUsage: report.memory.usedJSHeapSize,
      recommendationCount: report.recommendations.length
    });
  }

  /**
   * Log performance warnings to console
   */
  private logPerformanceWarnings(report: PerformanceReport): void {
    const criticalIssues = report.recommendations.filter(r => r.type === 'critical');
    
    if (criticalIssues.length > 0) {
      console.group('🚨 Critical Performance Issues');
      criticalIssues.forEach(issue => {
        console.warn(`${issue.category}: ${issue.issue}`);
        console.log(`Solution: ${issue.solution}`);
      });
      console.groupEnd();
    }
    
    if (report.score < 70) {
      console.warn(`⚠️ Low performance score: ${report.score}/100`);
    }
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, pause monitoring
      this.stopMonitoring();
    } else {
      // Page is visible, resume monitoring  
      this.startMonitoring();
    }
  }

  /**
   * Get current performance snapshot
   */
  async getPerformanceSnapshot(): Promise<PerformanceReport> {
    return this.generatePerformanceReport();
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clearMetrics(): void {
    this.componentMetrics.clear();
    this.webVitals = {};
    console.log('📊 Performance metrics cleared');
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hooks for performance monitoring
export const usePerformanceTracking = (componentName: string) => {
  const [renderCount, setRenderCount] = React.useState(0);
  
  React.useEffect(() => {
    const tracker = performanceMonitor.trackComponent(componentName, 'mount');
    tracker.start();
    
    return () => {
      tracker.end();
    };
  }, [componentName]);
  
  React.useLayoutEffect(() => {
    setRenderCount(prev => prev + 1);
    const tracker = performanceMonitor.trackComponent(componentName, 'render');
    tracker.start();
    tracker.end();
  });
  
  return { renderCount };
};

export const useMedicalContentPerformance = () => {
  const tracker = React.useMemo(() => 
    performanceMonitor.trackMedicalContentProcessing(), []
  );
  
  return tracker;
};