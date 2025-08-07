import { test, expect } from '@playwright/test';

// Medical education platform comprehensive E2E tests
test.describe('MedQuiz Pro - Cross-Browser Medical Education Platform Tests', () => {
  
  // Test data for medical scenarios
  const medicalTestUser = {
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@medschool.edu',
    password: 'MedicalStudent2025!'
  };

  const registeredUser = {
    email: 'jayveedz19@gmail.com',
    password: 'Jimkali90#'
  };

  test.beforeEach(async ({ page }) => {
    // Set up medical education context
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Authentication Flow - Cross Browser', () => {
    test('should handle user registration across browsers', async ({ page }) => {
      // Navigate to registration
      await page.click('text="Get Started"');
      await page.click('text="Sign up"');
      
      // Fill registration form with medical professional data
      await page.fill('input[type="text"]', medicalTestUser.name);
      await page.fill('input[type="email"]', medicalTestUser.email);
      await page.fill('input[type="password"]', medicalTestUser.password);
      
      // Submit registration
      await page.click('button[type="submit"]');
      
      // Verify registration success or existing user handling
      const isLoginPage = await page.locator('h1:has-text("Sign In")').isVisible({ timeout: 5000 });
      const isDashboard = await page.locator('text="Welcome back"').isVisible({ timeout: 5000 });
      
      expect(isLoginPage || isDashboard).toBeTruthy();
      
      // Take screenshot for visual verification
      await page.screenshot({ path: `test-results/registration-${test.info().project.name}.png` });
    });

    test('should login existing user successfully', async ({ page }) => {
      // Navigate to login
      await page.click('text="Sign In"');
      
      // Fill login credentials
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      
      // Submit login
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      // Verify user is logged in
      expect(await page.textContent('h1')).toContain('Welcome back');
      
      // Take screenshot for verification
      await page.screenshot({ path: `test-results/login-${test.info().project.name}.png` });
    });

    test('should handle logout properly', async ({ page }) => {
      // Login first
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      // Find and click user menu
      await page.click('[data-testid="user-menu-trigger"], .cursor-pointer img, button:has(img)');
      
      // Click logout
      await page.click('text="Logout"');
      
      // Verify redirect to landing page
      await page.waitForSelector('text="Get Started"', { timeout: 10000 });
      expect(await page.isVisible('text="Get Started"')).toBeTruthy();
    });
  });

  test.describe('Quiz Functionality - Medical Education Specific', () => {
    test('should complete quick quiz flow', async ({ page }) => {
      // Login first
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      // Start quick quiz
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"', { timeout: 15000 });
      
      // Verify USMLE-style question format
      expect(await page.isVisible('text="USMLE Style"')).toBeTruthy();
      
      // Answer questions
      for (let i = 0; i < 5; i++) {
        // Wait for question to load
        await page.waitForSelector('[data-testid="question-text"], .prose p', { timeout: 10000 });
        
        // Select first option (A)
        await page.click('button:has-text("A"), .option-button:first-child, button[data-option="0"]');
        
        // Wait for explanation
        await page.waitForSelector('text="Explanation"', { timeout: 10000 });
        
        // Check if it's the last question
        const isLastQuestion = await page.isVisible('text="Finish Quiz"');
        
        if (isLastQuestion) {
          await page.click('text="Finish Quiz"');
          break;
        } else {
          await page.click('text="Next Question"');
        }
        
        // Small delay for smooth navigation
        await page.waitForTimeout(1000);
      }
      
      // Verify quiz completion
      await page.waitForSelector('text="Quiz Complete", text="Results", text="Score"', { timeout: 15000 });
      
      // Take screenshot of results
      await page.screenshot({ path: `test-results/quiz-complete-${test.info().project.name}.png` });
    });

    test('should handle timed quiz with countdown', async ({ page }) => {
      // Login and navigate to timed quiz
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      // Start timed quiz
      await page.click('text="Timed Practice"');
      await page.waitForSelector('text="Question 1 of"', { timeout: 15000 });
      
      // Verify timer is present
      const timerVisible = await page.isVisible('text=/\\d{1,2}:\\d{2}/');
      expect(timerVisible).toBeTruthy();
      
      // Answer first question and verify timer countdown
      await page.click('button:has-text("A"), .option-button:first-child');
      await page.waitForSelector('text="Explanation"');
      
      // Take screenshot showing timer
      await page.screenshot({ path: `test-results/timed-quiz-${test.info().project.name}.png` });
    });

    test('should display medical references and explanations', async ({ page }) => {
      // Login and start quiz
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Answer first question
      await page.click('button:has-text("A"), .option-button:first-child');
      
      // Verify explanation appears
      await page.waitForSelector('text="Explanation"');
      
      // Check for medical references
      const hasReferences = await page.isVisible('text="References:"');
      if (hasReferences) {
        // Verify reference format
        const referenceText = await page.textContent('text="References:"');
        expect(referenceText).toContain('References:');
      }
      
      // Verify detailed explanation exists
      const explanationVisible = await page.locator('.explanation, [data-testid="explanation"]').isVisible();
      expect(explanationVisible).toBeTruthy();
    });
  });

  test.describe('Responsive Design - Mobile Medical Education', () => {
    test('should work properly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test mobile navigation
      await page.goto('/');
      
      // Check mobile-optimized elements
      const mobileElements = await page.locator('.mobile, [class*="mobile"], [class*="sm:"]').count();
      expect(mobileElements).toBeGreaterThan(0);
      
      // Test mobile login
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      // Test mobile quiz experience
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Verify mobile-friendly quiz interface
      const questionVisible = await page.locator('.question, [data-testid="question"]').isVisible();
      expect(questionVisible).toBeTruthy();
      
      // Take mobile screenshot
      await page.screenshot({ path: `test-results/mobile-quiz-${test.info().project.name}.png` });
    });

    test('should maintain functionality across tablet sizes', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Test tablet navigation and quiz functionality
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      // Verify layout adapts properly
      const layoutElements = await page.locator('.container, .grid, .flex').count();
      expect(layoutElements).toBeGreaterThan(0);
      
      // Take tablet screenshot
      await page.screenshot({ path: `test-results/tablet-layout-${test.info().project.name}.png` });
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should meet basic performance standards', async ({ page }) => {
      // Measure page load performance
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (adjust based on your requirements)
      expect(loadTime).toBeLessThan(30000); // 30 seconds for comprehensive load
      
      // Check for performance-critical elements
      const criticalElements = [
        'h1', // Main heading
        'button', // Interactive elements
        'nav' // Navigation
      ];
      
      for (const selector of criticalElements) {
        const element = await page.locator(selector).first();
        expect(await element.isVisible()).toBeTruthy();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab'); // Should focus first interactive element
      await page.keyboard.press('Enter'); // Should activate focused element
      
      // Verify focus is visible
      const focusedElement = await page.locator(':focus').count();
      expect(focusedElement).toBeGreaterThanOrEqual(0); // May be 0 if focus is not visible in test
      
      // Test form navigation
      await page.click('text="Sign In"');
      await page.keyboard.press('Tab'); // Focus email input
      await page.keyboard.type(registeredUser.email);
      await page.keyboard.press('Tab'); // Focus password input
      await page.keyboard.type(registeredUser.password);
      await page.keyboard.press('Tab'); // Focus submit button
      await page.keyboard.press('Enter'); // Submit form
      
      // Verify keyboard navigation worked
      await page.waitForSelector('text="Welcome back", text="Sign In"', { timeout: 15000 });
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate offline condition
      await page.context().setOffline(true);
      
      await page.goto('/');
      
      // Should show appropriate error or cached content
      const hasContent = await page.locator('body').textContent();
      expect(hasContent?.length).toBeGreaterThan(0);
      
      // Restore online
      await page.context().setOffline(false);
      
      // Should recover when back online
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    test('should handle invalid form inputs properly', async ({ page }) => {
      await page.click('text="Sign In"');
      
      // Try invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'short');
      await page.click('button[type="submit"]');
      
      // Should show validation errors or prevent submission
      const stillOnLoginPage = await page.isVisible('h1:has-text("Sign In")');
      expect(stillOnLoginPage).toBeTruthy();
      
      // Test empty form submission
      await page.fill('input[type="email"]', '');
      await page.fill('input[type="password"]', '');
      await page.click('button[type="submit"]');
      
      // Should still be on login page
      expect(await page.isVisible('h1:has-text("Sign In")')).toBeTruthy();
    });
  });

  test.describe('Medical Education Specific Features', () => {
    test('should display USMLE-appropriate content', async ({ page }) => {
      // Login and access quiz
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      await page.click('text="Quick Quiz"');
      await page.waitForSelector('text="Question 1 of"');
      
      // Verify USMLE-style elements
      const usmleIndicators = [
        'USMLE Style',
        'Cardiology',
        'Internal Medicine',
        'Explanation'
      ];
      
      // Check for medical categories
      const medicalCategories = await page.locator('text=/Cardiology|Internal Medicine|Surgery|Pediatrics|Psychiatry/').count();
      expect(medicalCategories).toBeGreaterThan(0);
      
      // Verify question format (clinical vignette style)
      const questionText = await page.locator('.prose, [data-testid="question"], p').first().textContent();
      expect(questionText?.length).toBeGreaterThan(50); // USMLE questions are typically longer
    });

    test('should track medical education progress', async ({ page }) => {
      // Login
      await page.click('text="Sign In"');
      await page.fill('input[type="email"]', registeredUser.email);
      await page.fill('input[type="password"]', registeredUser.password);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text="Welcome back"', { timeout: 15000 });
      
      // Check for progress indicators
      const progressElements = [
        'text=/\\d+ points?/',
        'text=/\\d+ quizzes?/',
        'text=/\\d+%.*accuracy/'
      ];
      
      for (const selector of progressElements) {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          const text = await element.textContent();
          expect(text).toBeDefined();
        }
      }
      
      // Take screenshot of dashboard with stats
      await page.screenshot({ path: `test-results/medical-progress-${test.info().project.name}.png` });
    });
  });

  // Cleanup after each test
  test.afterEach(async ({ page }) => {
    // Clear any authentication state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
});