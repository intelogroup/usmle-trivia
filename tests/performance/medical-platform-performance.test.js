import { test, expect } from '@playwright/test';

/**
 * Medical Education Platform Performance Testing Suite
 * 
 * This test suite focuses on performance metrics critical for medical education:
 * - Fast quiz loading for time-sensitive learning
 * - Smooth navigation between medical content
 * - Efficient handling of medical imagery and content
 * - Responsive performance under medical professional usage patterns
 */

test.describe('MedQuiz Pro - Medical Education Performance Tests', () => {
  const performanceThresholds = {
    // Medical education requires fast access to information
    pageLoadTime: 5000, // 5 seconds maximum
    quizLoadTime: 3000,  // 3 seconds for quiz startup
    navigationTime: 1000, // 1 second for navigation
    imageLoadTime: 2000,  // 2 seconds for medical images
    apiResponseTime: 2000, // 2 seconds for API calls
    
    // Core Web Vitals for medical professionals
    firstContentfulPaint: 2000,
    largestContentfulPaint: 4000,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100
  };

  const medicalUser = {
    email: 'jayveedz19@gmail.com',
    password: 'Jimkali90#'
  };

  test.beforeEach(async ({ page }) => {
    // Set up performance monitoring
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Core Page Performance', () => {
    test('should load landing page within medical education standards', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForSelector('h1, [data-testid="main-heading"]');
      
      const loadTime = Date.now() - startTime;
      
      // Landing page should load quickly for medical students
      expect(loadTime).toBeLessThan(performanceThresholds.pageLoadTime);
      
      // Measure Core Web Vitals
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals = {};
            
            entries.forEach(entry => {
              if (entry.name === 'first-contentful-paint') {
                vitals.fcp = entry.startTime;
              } else if (entry.name === 'largest-contentful-paint') {
                vitals.lcp = entry.startTime;
              }
            });
            
            resolve(vitals);
          }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
          
          // Timeout after 10 seconds
          setTimeout(() => resolve({}), 10000);
        });
      });
      
      if (vitals.fcp) {
        expect(vitals.fcp).toBeLessThan(performanceThresholds.firstContentfulPaint);
      }
      
      if (vitals.lcp) {
        expect(vitals.lcp).toBeLessThan(performanceThresholds.largestContentfulPaint);
      }
      
      console.log(`Landing page performance - Load time: ${loadTime}ms, FCP: ${vitals.fcp}ms, LCP: ${vitals.lcp}ms`);
    });

    test('should authenticate users quickly for medical urgency', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to login
      await page.click('text="Sign In"');
      
      // Fill credentials and submit
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      
      const submitTime = Date.now();
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      const authTime = Date.now() - submitTime;
      const totalTime = Date.now() - startTime;
      
      // Authentication should be fast for medical professionals
      expect(authTime).toBeLessThan(performanceThresholds.apiResponseTime);
      expect(totalTime).toBeLessThan(performanceThresholds.pageLoadTime);
      
      console.log(`Authentication performance - Auth time: ${authTime}ms, Total: ${totalTime}ms`);
    });
  });

  test.describe('Quiz Performance - Critical for Medical Learning', () => {
    test('should load quiz questions rapidly for time-sensitive learning', async ({ page }) => {
      // Login first
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      // Measure quiz startup performance
      const quizStartTime = Date.now();
      
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"', { timeout: 10000 });
      
      const quizLoadTime = Date.now() - quizStartTime;
      
      // Quiz should start quickly for medical students
      expect(quizLoadTime).toBeLessThan(performanceThresholds.quizLoadTime);
      
      // Verify question content loads completely
      const questionVisible = await page.waitForSelector('.prose p, [data-testid="question-text"]');
      expect(questionVisible).toBeTruthy();
      
      // Verify options load
      const optionsCount = await page.locator('button:has-text("A"), button:has-text("B"), button:has-text("C"), button:has-text("D")').count();
      expect(optionsCount).toBe(4);
      
      console.log(`Quiz startup performance - ${quizLoadTime}ms`);
    });

    test('should handle question transitions smoothly', async ({ page }) => {
      // Login and start quiz
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Measure question transition performance
      const transitionTimes = [];
      
      for (let i = 0; i < 3; i++) { // Test first 3 transitions
        // Answer current question
        await page.click('button:has-text("A")');
        await page.waitForSelector('text="Explanation"');
        
        // Measure next question transition
        const transitionStart = Date.now();
        
        const isLastQuestion = await page.isVisible('text="Finish Quiz"');
        if (isLastQuestion) break;
        
        await page.click('text="Next Question"');
        await page.waitForSelector(`text="Question ${i + 2} of"`);
        
        const transitionTime = Date.now() - transitionStart;
        transitionTimes.push(transitionTime);
        
        // Each transition should be fast for smooth learning experience
        expect(transitionTime).toBeLessThan(performanceThresholds.navigationTime);
      }
      
      const avgTransitionTime = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length;
      console.log(`Average question transition time: ${avgTransitionTime}ms`);
    });

    test('should handle timed quiz performance under pressure', async ({ page }) => {
      // Login and start timed quiz
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      const timedQuizStart = Date.now();
      
      await page.click('text="Timed Practice"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Verify timer is present and functional
      const timerElement = await page.locator('text=/\\d{1,2}:\\d{2}/');
      expect(await timerElement.isVisible()).toBeTruthy();
      
      const loadTime = Date.now() - timedQuizStart;
      expect(loadTime).toBeLessThan(performanceThresholds.quizLoadTime);
      
      // Test timer accuracy over short period
      const initialTimerText = await timerElement.textContent();
      await page.waitForTimeout(2000); // Wait 2 seconds
      const updatedTimerText = await timerElement.textContent();
      
      // Timer should update (different text after 2 seconds)
      expect(initialTimerText).not.toBe(updatedTimerText);
      
      console.log(`Timed quiz performance - Load: ${loadTime}ms, Timer functional: true`);
    });
  });

  test.describe('Mobile Performance - Critical for Medical Professionals', () => {
    test('should perform well on mobile devices used by medical students', async ({ page }) => {
      // Set mobile viewport for medical student scenario
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileLoadStart = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const mobileLoadTime = Date.now() - mobileLoadStart;
      
      // Mobile should load within reasonable time for clinical use
      expect(mobileLoadTime).toBeLessThan(performanceThresholds.pageLoadTime * 1.5); // Allow 50% more time for mobile
      
      // Test mobile quiz performance
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      const mobileQuizStart = Date.now();
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      const mobileQuizTime = Date.now() - mobileQuizStart;
      expect(mobileQuizTime).toBeLessThan(performanceThresholds.quizLoadTime * 1.5);
      
      console.log(`Mobile performance - Load: ${mobileLoadTime}ms, Quiz: ${mobileQuizTime}ms`);
    });

    test('should handle touch interactions smoothly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Login and start quiz
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Test touch interaction performance
      const touchStart = Date.now();
      
      // Tap option A
      await page.tap('button:has-text("A")');
      await page.waitForSelector('text="Explanation"');
      
      const touchResponseTime = Date.now() - touchStart;
      
      // Touch response should be immediate for medical professionals
      expect(touchResponseTime).toBeLessThan(performanceThresholds.firstInputDelay * 5); // Allow more time for full interaction
      
      console.log(`Touch interaction performance: ${touchResponseTime}ms`);
    });
  });

  test.describe('Content Loading Performance', () => {
    test('should load medical images efficiently', async ({ page }) => {
      // Login first
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      // Check for any images in the application
      const images = await page.locator('img').count();
      
      if (images > 0) {
        const imageLoadStart = Date.now();
        
        // Wait for all images to load
        await page.waitForLoadState('networkidle');
        
        // Check if images loaded successfully
        const loadedImages = await page.evaluate(() => {
          const imgs = document.querySelectorAll('img');
          return Array.from(imgs).every(img => img.complete && img.naturalHeight !== 0);
        });
        
        const imageLoadTime = Date.now() - imageLoadStart;
        
        if (loadedImages) {
          expect(imageLoadTime).toBeLessThan(performanceThresholds.imageLoadTime);
          console.log(`Image loading performance: ${imageLoadTime}ms for ${images} images`);
        }
      }
    });

    test('should handle large medical content efficiently', async ({ page }) => {
      // Login and start quiz to test content loading
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Measure content rendering performance
      const contentStart = Date.now();
      
      // Answer question to load explanation (large medical content)
      await page.click('button:has-text("A")');
      await page.waitForSelector('text="Explanation"');
      
      const contentLoadTime = Date.now() - contentStart;
      
      // Large medical explanations should load quickly
      expect(contentLoadTime).toBeLessThan(performanceThresholds.navigationTime * 2);
      
      // Verify content is complete
      const explanationText = await page.locator('text="Explanation"').textContent();
      expect(explanationText).toBeTruthy();
      
      console.log(`Medical content loading: ${contentLoadTime}ms`);
    });
  });

  test.describe('Memory and Resource Management', () => {
    test('should not cause memory leaks during extended quiz sessions', async ({ page }) => {
      // Enable memory monitoring
      const client = await page.context().newCDPSession(page);
      await client.send('Runtime.enable');
      
      // Login
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      // Start quiz and simulate extended session
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Get initial memory usage
      const initialMemory = await client.send('Runtime.getHeapUsage');
      
      // Answer multiple questions
      for (let i = 0; i < 3; i++) {
        await page.click('button:has-text("A")');
        await page.waitForSelector('text="Explanation"');
        
        const isLastQuestion = await page.isVisible('text="Finish Quiz"');
        if (isLastQuestion) break;
        
        await page.click('text="Next Question"');
        await page.waitForSelector(`text="Question ${i + 2} of"`);
      }
      
      // Get final memory usage
      const finalMemory = await client.send('Runtime.getHeapUsage');
      
      // Memory usage should not grow excessively
      const memoryGrowth = (finalMemory.usedSize - initialMemory.usedSize) / 1024 / 1024; // MB
      
      // Should not use more than 50MB additional memory for quiz session
      expect(memoryGrowth).toBeLessThan(50);
      
      console.log(`Memory usage - Initial: ${(initialMemory.usedSize / 1024 / 1024).toFixed(2)}MB, Final: ${(finalMemory.usedSize / 1024 / 1024).toFixed(2)}MB, Growth: ${memoryGrowth.toFixed(2)}MB`);
    });

    test('should efficiently handle multiple quiz attempts', async ({ page }) => {
      // Login
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      // Simulate multiple quiz attempts (common for medical students)
      const attemptTimes = [];
      
      for (let attempt = 0; attempt < 2; attempt++) {
        const attemptStart = Date.now();
        
        await page.click('text="Quick Quiz"');
        await page.waitForSelector('text="Question 1 of"');
        
        const attemptTime = Date.now() - attemptStart;
        attemptTimes.push(attemptTime);
        
        // Each subsequent attempt should not be significantly slower
        if (attempt > 0) {
          const performanceDegradation = (attemptTime - attemptTimes[0]) / attemptTimes[0];
          expect(performanceDegradation).toBeLessThan(0.5); // Should not be 50% slower
        }
        
        // Answer one question and return to dashboard
        await page.click('button:has-text("A")');
        await page.waitForSelector('text="Explanation"');
        await page.click('text="Next Question", text="Finish Quiz"');
        
        // Wait to return to dashboard or results
        await page.waitForTimeout(2000);
        
        // Navigate back to dashboard if on results page
        const onResults = await page.isVisible('text="Quiz Complete", text="Results"');
        if (onResults) {
          await page.click('text="Back to Dashboard", text="Dashboard", .back-button');
        }
        
        await page.waitForSelector('text="Welcome back"');
      }
      
      const avgAttemptTime = attemptTimes.reduce((a, b) => a + b, 0) / attemptTimes.length;
      console.log(`Multiple quiz attempts - Average: ${avgAttemptTime}ms, Times: ${attemptTimes.join(', ')}ms`);
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow connections gracefully', async ({ page }) => {
      // Simulate slow 3G connection (common in hospitals/clinical settings)
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      const slowConnectionStart = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const slowLoadTime = Date.now() - slowConnectionStart;
      
      // Should still be usable on slow connections
      expect(slowLoadTime).toBeLessThan(performanceThresholds.pageLoadTime * 2);
      
      // Test critical functionality works
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('text="Welcome back", text="Sign In"', { timeout: 20000 });
      
      console.log(`Slow connection performance: ${slowLoadTime}ms`);
    });

    test('should minimize API calls for efficient medical platform usage', async ({ page }) => {
      const apiCalls = [];
      
      // Monitor network requests
      page.on('request', request => {
        if (request.url().includes('/api/') || request.url().includes('appwrite.io')) {
          apiCalls.push({
            url: request.url(),
            method: request.method(),
            timestamp: Date.now()
          });
        }
      });
      
      // Login and use quiz
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', medicalUser.email);
      await page.fill('input[type="password"]', medicalUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"');
      
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Should make reasonable number of API calls
      const authCalls = apiCalls.filter(call => call.url().includes('auth') || call.url().includes('login'));
      const dataCalls = apiCalls.filter(call => call.url().includes('questions') || call.url().includes('quiz'));
      
      // Medical platform should be efficient with API usage
      expect(authCalls.length).toBeLessThan(5);
      expect(dataCalls.length).toBeLessThan(10);
      
      console.log(`API efficiency - Auth calls: ${authCalls.length}, Data calls: ${dataCalls.length}, Total: ${apiCalls.length}`);
    });
  });

  // Performance reporting
  test.afterEach(async ({ page }, testInfo) => {
    // Capture performance metrics for reporting
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      };
    });
    
    // Log performance data
    console.log(`Performance metrics for ${testInfo.title}:`, performanceMetrics);
    
    // Attach performance data to test results
    if (performanceMetrics.domContentLoaded) {
      await testInfo.attach('performance-metrics', {
        body: JSON.stringify(performanceMetrics, null, 2),
        contentType: 'application/json'
      });
    }
  });
});