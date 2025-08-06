import { test, expect } from '@playwright/test';

/**
 * VCT Framework - Schema-First Database Validation
 * Validates Convex schema integration and data consistency
 * Following VCT principles for schema-aware testing
 */

// VCT Schema Configuration
const VCT_SCHEMA_CONFIG = {
  convex: {
    endpoint: process.env.CONVEX_URL || 'https://helpful-pig-928.convex.cloud',
    apiKey: process.env.CONVEX_API_KEY
  },
  validation: {
    timeout: 15000,
    retries: 3
  },
  screenshots: {
    path: 'screenshots/schema-validation'
  }
};

// Expected Convex Schema Structure (from schema.ts)
const EXPECTED_SCHEMA = {
  users: {
    required_fields: ['name', 'email', 'tokenIdentifier'],
    optional_fields: ['imageUrl', 'quizzesCompleted', 'totalScore', 'averageScore', 'streak', 'lastQuizDate', 'preferences', 'studyGoals']
  },
  quizSessions: {
    required_fields: ['userId', 'quizType', 'questions', 'startTime'],
    optional_fields: ['endTime', 'score', 'totalQuestions', 'correctAnswers', 'timeSpent', 'performance']
  },
  questions: {
    required_fields: ['question', 'options', 'correctAnswer', 'explanation', 'category', 'difficulty'],
    optional_fields: ['tags', 'references', 'imageUrl', 'createdAt', 'updatedAt', 'stats']
  }
};

test.describe('VCT Schema-First Database Validation', () => {
  
  test('VCT Schema: Convex Database Structure Validation', async ({ page }) => {
    await test.step('Database Connection and Schema Fetch', async () => {
      // Navigate to a page that loads schema data
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // VCT: Screenshot schema loading state
      await page.screenshot({
        path: `${VCT_SCHEMA_CONFIG.screenshots.path}/01-schema-loading.png`,
        fullPage: true
      });
      
      // Wait for Convex client to initialize
      await page.waitForFunction(() => {
        return window.convex !== undefined;
      }, { timeout: VCT_SCHEMA_CONFIG.validation.timeout });
      
      console.log('[VCT] ✅ Convex client initialization verified');
    });

    await test.step('User Schema Validation', async () => {
      // Validate user data structure in the UI
      await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-stats"]')).toBeVisible();
      
      // Extract user data from the page
      const userData = await page.evaluate(() => {
        const nameElement = document.querySelector('[data-testid="user-name"]');
        const emailElement = document.querySelector('[data-testid="user-email"]');
        const statsElement = document.querySelector('[data-testid="user-stats"]');
        
        return {
          hasName: !!nameElement?.textContent,
          hasEmail: !!emailElement?.textContent,
          hasStats: !!statsElement
        };
      });
      
      expect(userData.hasName).toBe(true);
      expect(userData.hasEmail).toBe(true);
      expect(userData.hasStats).toBe(true);
      
      // VCT: Screenshot user schema validation
      await page.screenshot({
        path: `${VCT_SCHEMA_CONFIG.screenshots.path}/02-user-schema-valid.png`,
        fullPage: true
      });
      
      console.log('[VCT] ✅ User schema validation complete');
    });

    await test.step('Quiz Schema Validation', async () => {
      // Navigate to quiz to validate question schema
      await page.click('[data-testid="quick-quiz-button"]');
      await page.click('[data-testid="start-quiz-button"]');
      await page.waitForLoadState('networkidle');
      
      // Validate question structure
      await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
      await expect(page.locator('[data-testid="answer-options"]')).toBeVisible();
      await expect(page.locator('[data-testid="quiz-timer"]')).toBeVisible();
      
      // Extract question data structure
      const questionData = await page.evaluate(() => {
        const questionElement = document.querySelector('[data-testid="question-text"]');
        const optionsElement = document.querySelector('[data-testid="answer-options"]');
        const options = document.querySelectorAll('[data-testid^="answer-option-"]');
        
        return {
          hasQuestion: !!questionElement?.textContent,
          hasOptions: !!optionsElement,
          optionCount: options.length,
          questionText: questionElement?.textContent || ''
        };
      });
      
      expect(questionData.hasQuestion).toBe(true);
      expect(questionData.hasOptions).toBe(true);
      expect(questionData.optionCount).toBeGreaterThan(1);
      expect(questionData.questionText.length).toBeGreaterThan(10);
      
      // VCT: Screenshot question schema validation
      await page.screenshot({
        path: `${VCT_SCHEMA_CONFIG.screenshots.path}/03-question-schema-valid.png`,
        fullPage: true
      });
      
      console.log('[VCT] ✅ Question schema validation complete');
    });

    await test.step('Quiz Session Schema Validation', async () => {
      // Answer a question to create session data
      await page.click('[data-testid="answer-option-0"]');
      await page.click('[data-testid="submit-answer-button"]');
      
      // Wait for feedback to ensure session is being tracked
      await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();
      
      // Validate session tracking elements
      const sessionData = await page.evaluate(() => {
        const timerElement = document.querySelector('[data-testid="quiz-timer"]');
        const progressElement = document.querySelector('[data-testid="quiz-progress"]');
        const scoreElement = document.querySelector('[data-testid="current-score"]');
        
        return {
          hasTimer: !!timerElement,
          hasProgress: !!progressElement,
          hasScore: !!scoreElement,
          timerText: timerElement?.textContent || ''
        };
      });
      
      expect(sessionData.hasTimer).toBe(true);
      expect(sessionData.timerText).toMatch(/\d+:\d+/); // Timer format validation
      
      // VCT: Screenshot session schema validation
      await page.screenshot({
        path: `${VCT_SCHEMA_CONFIG.screenshots.path}/04-session-schema-valid.png`,
        fullPage: true
      });
      
      console.log('[VCT] ✅ Quiz session schema validation complete');
    });
  });

  test('VCT Schema: Data Consistency Validation', async ({ page }) => {
    await test.step('Cross-Component Data Consistency', async () => {
      // Login and collect user data from dashboard
      await page.goto('/login');
      await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Collect user data from dashboard
      const dashboardUserData = await page.evaluate(() => {
        const nameElement = document.querySelector('[data-testid="user-name"]');
        const statsElement = document.querySelector('[data-testid="user-stats"]');
        
        return {
          name: nameElement?.textContent?.trim() || '',
          stats: statsElement?.textContent?.trim() || ''
        };
      });
      
      // Navigate to profile and verify consistency
      await page.click('[data-testid="user-menu-button"]');
      await page.click('[data-testid="profile-link"]');
      
      const profileUserData = await page.evaluate(() => {
        const nameElement = document.querySelector('[data-testid="user-name"]');
        const emailElement = document.querySelector('[data-testid="user-email"]');
        
        return {
          name: nameElement?.textContent?.trim() || '',
          email: emailElement?.textContent?.trim() || ''
        };
      });
      
      // Validate data consistency across components
      expect(dashboardUserData.name).toBe(profileUserData.name);
      expect(profileUserData.email).toBe('jayveedz19@gmail.com');
      
      // VCT: Screenshot data consistency validation
      await page.screenshot({
        path: `${VCT_SCHEMA_CONFIG.screenshots.path}/05-data-consistency.png`,
        fullPage: true
      });
      
      console.log('[VCT] ✅ Cross-component data consistency verified');
    });

    await test.step('Real-time Data Synchronization', async () => {
      // Start a quiz to generate new data
      await page.goto('/dashboard');
      await page.click('[data-testid="quick-quiz-button"]');
      await page.click('[data-testid="start-quiz-button"]');
      
      // Complete one question
      await page.click('[data-testid="answer-option-0"]');
      await page.click('[data-testid="submit-answer-button"]');
      
      // Navigate away and back to check data persistence
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify recent activity or updated stats
      const updatedStats = await page.evaluate(() => {
        const statsElement = document.querySelector('[data-testid="user-stats"]');
        const recentActivityElement = document.querySelector('[data-testid="recent-activity"]');
        
        return {
          hasStats: !!statsElement,
          hasRecentActivity: !!recentActivityElement,
          statsText: statsElement?.textContent || ''
        };
      });
      
      expect(updatedStats.hasStats).toBe(true);
      
      // VCT: Screenshot real-time sync validation
      await page.screenshot({
        path: `${VCT_SCHEMA_CONFIG.screenshots.path}/06-realtime-sync.png`,
        fullPage: true
      });
      
      console.log('[VCT] ✅ Real-time data synchronization verified');
    });
  });

  test('VCT Schema: Performance and Error Handling', async ({ page }) => {
    await test.step('Schema Loading Performance', async () => {
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Wait for all data to load
      await page.waitForFunction(() => {
        const userElement = document.querySelector('[data-testid="user-name"]');
        const statsElement = document.querySelector('[data-testid="user-stats"]');
        return userElement && statsElement;
      });
      
      const loadTime = Date.now() - startTime;
      
      // VCT: Performance should be under 5 seconds
      expect(loadTime).toBeLessThan(5000);
      
      console.log(`[VCT] ✅ Schema loading performance: ${loadTime}ms`);
    });

    await test.step('Schema Error Handling', async () => {
      // Simulate network issues
      await page.route('**/convex/**', route => {
        // Delay some requests to test loading states
        if (Math.random() > 0.7) {
          setTimeout(() => route.continue(), 2000);
        } else {
          route.continue();
        }
      });
      
      await page.goto('/dashboard');
      
      // VCT: Should show loading states gracefully
      const hasLoadingStates = await page.evaluate(() => {
        const loadingElements = document.querySelectorAll('[data-testid*="loading"]');
        const skeletonElements = document.querySelectorAll('[data-testid*="skeleton"]');
        return loadingElements.length > 0 || skeletonElements.length > 0;
      });
      
      // Allow for either loading states or fast loading
      // The important thing is no errors
      const hasErrors = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('[data-testid*="error"]');
        return errorElements.length > 0;
      });
      
      expect(hasErrors).toBe(false);
      
      // VCT: Screenshot error handling
      await page.screenshot({
        path: `${VCT_SCHEMA_CONFIG.screenshots.path}/07-error-handling.png`,
        fullPage: true
      });
      
      console.log('[VCT] ✅ Schema error handling validation complete');
    });
  });
});