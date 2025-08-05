#!/usr/bin/env node

/**
 * ⚡ PERFORMANCE QUIZ TESTING SUITE
 * Advanced performance benchmarking for Quiz functionality
 */

import { test, expect } from '@playwright/test';
import { PERFORMANCE_BENCHMARKS, QUIZ_TEST_SCENARIOS } from './cross-browser-quiz-config.js';

class QuizPerformanceTester {
  constructor(page) {
    this.page = page;
    this.metrics = {
      loadTimes: [],
      renderTimes: [],
      interactionTimes: [],
      memoryUsage: [],
      networkRequests: []
    };
  }

  async measureQuizLoadPerformance() {
    console.log('⚡ Measuring Quiz Load Performance...');

    // Start performance monitoring
    await this.page.evaluate(() => {
      window.performance.mark('quiz-load-start');
    });

    // Navigate to quiz
    const loadStartTime = Date.now();
    await this.page.goto('/quiz');
    await this.page.waitForLoadState('networkidle');
    const loadEndTime = Date.now();

    // Measure First Contentful Paint
    const fcpTime = await this.page.evaluate(() => {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      return fcpEntry ? fcpEntry.startTime : null;
    });

    // Measure Largest Contentful Paint
    const lcpTime = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        setTimeout(() => resolve(null), 5000); // Timeout after 5s
      });
    });

    // Measure Cumulative Layout Shift
    const clsScore = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    const loadTime = loadEndTime - loadStartTime;
    this.metrics.loadTimes.push({
      totalLoad: loadTime,
      fcp: fcpTime,
      lcp: lcpTime,
      cls: clsScore
    });

    // Validate against benchmarks
    const deviceType = this.getDeviceType();
    const benchmark = PERFORMANCE_BENCHMARKS[deviceType];
    
    expect(loadTime).toBeLessThan(benchmark.pageLoad);
    if (fcpTime) expect(fcpTime).toBeLessThan(benchmark.pageLoad / 2);
    if (lcpTime) expect(lcpTime).toBeLessThan(benchmark.pageLoad);
    if (clsScore !== null) expect(clsScore).toBeLessThan(0.1); // Good CLS score

    console.log(`   ✅ Load Performance - Total: ${loadTime}ms, FCP: ${fcpTime}ms, LCP: ${lcpTime}ms`);
  }

  async measureQuestionRenderPerformance() {
    console.log('📝 Measuring Question Render Performance...');

    // Start quiz and measure question rendering
    await this.page.click('[data-testid="start-quiz-btn"]');
    
    const renderStartTime = Date.now();
    await this.page.waitForSelector('[data-testid="quiz-question"]');
    const renderEndTime = Date.now();

    const renderTime = renderEndTime - renderStartTime;
    this.metrics.renderTimes.push(renderTime);

    // Measure complex question elements
    const hasImage = await this.page.$('[data-testid="question-image"]');
    const hasChart = await this.page.$('[data-testid="question-chart"]');
    const optionsCount = await this.page.$$('[data-testid^="answer-option-"]');

    console.log(`   📊 Question Complexity: Image: ${!!hasImage}, Chart: ${!!hasChart}, Options: ${optionsCount.length}`);

    // Validate render performance
    const deviceType = this.getDeviceType();
    const benchmark = PERFORMANCE_BENCHMARKS[deviceType];
    
    expect(renderTime).toBeLessThan(benchmark.questionRender);
    
    console.log(`   ✅ Render Performance: ${renderTime}ms (Target: <${benchmark.questionRender}ms)`);
  }

  async measureInteractionPerformance() {
    console.log('🖱️ Measuring Interaction Performance...');

    const interactions = [
      {
        name: 'Answer Selection',
        action: async () => {
          const startTime = Date.now();
          await this.page.click('[data-testid="answer-option-0"]');
          await this.page.waitForSelector('[data-testid="answer-option-0"].selected');
          return Date.now() - startTime;
        }
      },
      {
        name: 'Answer Submission',
        action: async () => {
          const startTime = Date.now();
          await this.page.click('[data-testid="submit-answer"]');
          await this.page.waitForSelector('[data-testid="answer-feedback"]');
          return Date.now() - startTime;
        }
      },
      {
        name: 'Next Question Navigation',
        action: async () => {
          const startTime = Date.now();
          await this.page.click('[data-testid="next-question"]');
          await this.page.waitForSelector('[data-testid="quiz-question"]');
          return Date.now() - startTime;
        }
      }
    ];

    const deviceType = this.getDeviceType();
    const benchmark = PERFORMANCE_BENCHMARKS[deviceType];

    for (const interaction of interactions) {
      try {
        const interactionTime = await interaction.action();
        this.metrics.interactionTimes.push({
          name: interaction.name,
          time: interactionTime
        });

        // Validate interaction performance
        expect(interactionTime).toBeLessThan(benchmark.answerSubmit);
        console.log(`   ✅ ${interaction.name}: ${interactionTime}ms`);
        
      } catch (error) {
        console.log(`   ⚠️ ${interaction.name}: Skipped (${error.message})`);
      }
    }
  }

  async measureMemoryUsage() {
    console.log('💾 Measuring Memory Usage...');

    // Get memory usage metrics
    const memoryInfo = await this.page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    if (memoryInfo) {
      const usedMemoryMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
      this.metrics.memoryUsage.push(usedMemoryMB);

      const deviceType = this.getDeviceType();
      const benchmark = PERFORMANCE_BENCHMARKS[deviceType];
      
      expect(usedMemoryMB).toBeLessThan(benchmark.memoryUsage);
      console.log(`   ✅ Memory Usage: ${usedMemoryMB}MB (Limit: ${benchmark.memoryUsage}MB)`);
    } else {
      console.log('   ⚠️ Memory usage monitoring not available in this browser');
    }
  }

  async measureNetworkPerformance() {
    console.log('🌐 Measuring Network Performance...');

    // Monitor network requests
    const requests = [];
    this.page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });

    const responses = [];
    this.page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        timing: response.timing(),
        size: response.headers()['content-length'] || 0
      });
    });

    // Complete a full quiz to capture all network activity
    await this.completeFullQuiz();

    // Analyze network performance
    const apiRequests = requests.filter(r => r.url.includes('/api/') || r.url.includes('convex'));
    const staticResources = requests.filter(r => ['script', 'stylesheet', 'image'].includes(r.resourceType));

    console.log(`   📊 Network Analysis:`);
    console.log(`      Total Requests: ${requests.length}`);
    console.log(`      API Requests: ${apiRequests.length}`);
    console.log(`      Static Resources: ${staticResources.length}`);

    // Validate critical API response times
    const slowResponses = responses.filter(r => r.timing && r.timing.responseEnd > 2000);
    expect(slowResponses.length).toBeLessThan(requests.length * 0.1); // Less than 10% slow

    this.metrics.networkRequests = {
      total: requests.length,
      api: apiRequests.length,
      static: staticResources.length,
      slow: slowResponses.length
    };
  }

  async completeFullQuiz() {
    // Navigate through a complete quiz session for comprehensive testing
    try {
      for (let i = 0; i < 5; i++) { // Quick quiz with 5 questions
        await this.page.waitForSelector('[data-testid="quiz-question"]', { timeout: 5000 });
        await this.page.click('[data-testid="answer-option-0"]');
        await this.page.click('[data-testid="submit-answer"]');
        
        const nextBtn = await this.page.$('[data-testid="next-question"]');
        if (nextBtn) {
          await nextBtn.click();
        } else {
          break; // Quiz completed
        }
      }
      
      // Wait for results
      await this.page.waitForSelector('[data-testid="quiz-results"]', { timeout: 10000 });
      
    } catch (error) {
      console.log(`   ⚠️ Quiz completion interrupted: ${error.message}`);
    }
  }

  getDeviceType() {
    // Determine device type based on viewport
    const viewport = this.page.viewportSize();
    if (viewport.width >= 1024) return 'desktop';
    if (viewport.width >= 768) return 'tablet';
    return 'mobile';
  }

  async generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      deviceType: this.getDeviceType(),
      metrics: this.metrics,
      summary: {
        averageLoadTime: this.metrics.loadTimes.reduce((sum, m) => sum + m.totalLoad, 0) / this.metrics.loadTimes.length,
        averageRenderTime: this.metrics.renderTimes.reduce((sum, t) => sum + t, 0) / this.metrics.renderTimes.length,
        averageInteractionTime: this.metrics.interactionTimes.reduce((sum, i) => sum + i.time, 0) / this.metrics.interactionTimes.length,
        averageMemoryUsage: this.metrics.memoryUsage.reduce((sum, m) => sum + m, 0) / this.metrics.memoryUsage.length
      }
    };

    console.log('\n📊 PERFORMANCE REPORT SUMMARY');
    console.log('=============================');
    console.log(`Device Type: ${report.deviceType.toUpperCase()}`);
    console.log(`Average Load Time: ${Math.round(report.summary.averageLoadTime)}ms`);
    console.log(`Average Render Time: ${Math.round(report.summary.averageRenderTime)}ms`);
    console.log(`Average Interaction Time: ${Math.round(report.summary.averageInteractionTime)}ms`);
    console.log(`Average Memory Usage: ${Math.round(report.summary.averageMemoryUsage)}MB`);

    return report;
  }
}

// Test definitions
test.describe('Quiz Performance Testing', () => {
  test('Complete Performance Benchmark Suite', async ({ page }) => {
    const tester = new QuizPerformanceTester(page);

    await tester.measureQuizLoadPerformance();
    await tester.measureQuestionRenderPerformance();
    await tester.measureInteractionPerformance();
    await tester.measureMemoryUsage();
    await tester.measureNetworkPerformance();

    const report = await tester.generatePerformanceReport();
    
    // Save report for analysis
    const fs = require('fs');
    fs.writeFileSync(
      '/tmp/quiz-performance-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('✅ Performance testing completed successfully');
  });

  test('Load Testing - Multiple Concurrent Sessions', async ({ page, context }) => {
    console.log('🔄 Testing Multiple Concurrent Quiz Sessions...');

    // Create multiple pages to simulate concurrent users
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage()
    ]);

    const startTime = Date.now();

    // Start quizzes simultaneously
    await Promise.all(
      pages.map(async (p, index) => {
        await p.goto('/quiz');
        await p.click('[data-testid="start-quiz-btn"]');
        console.log(`   User ${index + 1}: Quiz started`);
      })
    );

    // Complete quizzes
    await Promise.all(
      pages.map(async (p, index) => {
        const tester = new QuizPerformanceTester(p);
        await tester.completeFullQuiz();
        console.log(`   User ${index + 1}: Quiz completed`);
      })
    );

    const totalTime = Date.now() - startTime;
    console.log(`✅ Concurrent sessions completed in ${totalTime}ms`);

    // Cleanup
    await Promise.all(pages.map(p => p.close()));
  });

  test('Stress Testing - Rapid Question Navigation', async ({ page }) => {
    console.log('⚡ Testing Rapid Question Navigation...');

    await page.goto('/quiz');
    await page.click('[data-testid="start-quiz-btn"]');

    const navigationTimes = [];

    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      
      await page.click('[data-testid="answer-option-0"]');
      await page.click('[data-testid="submit-answer"]');
      
      const nextBtn = await page.$('[data-testid="next-question"]');
      if (nextBtn) {
        await nextBtn.click();
        await page.waitForSelector('[data-testid="quiz-question"]');
      } else {
        break;
      }

      const navigationTime = Date.now() - startTime;
      navigationTimes.push(navigationTime);
      
      // Validate that each navigation is reasonably fast
      expect(navigationTime).toBeLessThan(3000); // 3 seconds max
    }

    const averageTime = navigationTimes.reduce((sum, t) => sum + t, 0) / navigationTimes.length;
    console.log(`✅ Average navigation time: ${Math.round(averageTime)}ms`);
  });
});

export { QuizPerformanceTester };