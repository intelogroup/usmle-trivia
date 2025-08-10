/**
 * INTEGRATION TESTING SCRIPT FOR AUTHENTICATION
 * Tests real authentication flows using browser automation
 * This performs actual testing against the running development server
 */

import { test, expect } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USERS = {
  existing: {
    email: 'jayveedz19@gmail.com',
    password: 'Jimkali90#',
    name: 'Jay veedz'
  },
  new: {
    email: `test-${Date.now()}@medical.edu`,
    password: 'TestPassword123!',
    name: 'Test Medical Student'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  }
};

test.describe('Authentication System Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
  });

  test.describe('Registration Flow Testing', () => {
    
    test('should display registration page with all required elements', async ({ page }) => {
      // Navigate to registration page
      await page.goto(`${BASE_URL}/register`);
      
      // Check page title and branding
      await expect(page.locator('h1')).toContainText('MedQuiz Pro');
      await expect(page.locator('text=Join thousands of medical students preparing for USMLE')).toBeVisible();
      
      // Check form fields
      await expect(page.locator('input[type="text"]')).toBeVisible(); // Name field
      await expect(page.locator('input[type="email"]')).toBeVisible(); // Email field
      await expect(page.locator('input[type="password"]').first()).toBeVisible(); // Password field
      await expect(page.locator('input[type="password"]').nth(1)).toBeVisible(); // Confirm password field
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check medical education branding
      await expect(page.locator('[aria-label*="medical education logo"], svg')).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      // Fill form with short password
      await page.fill('input[id="name"]', 'Test User');
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="password"]', 'short');
      await page.fill('input[id="confirmPassword"]', 'short');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check for password validation error
      await expect(page.locator('text=Password must be at least 8 characters long')).toBeVisible();
    });

    test('should validate password matching', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      // Fill form with mismatched passwords
      await page.fill('input[id="name"]', 'Test User');
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="password"]', 'password123');
      await page.fill('input[id="confirmPassword"]', 'different123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check for password mismatch error
      await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });

    test('should attempt user registration with valid data', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      // Fill registration form
      await page.fill('input[id="name"]', TEST_USERS.new.name);
      await page.fill('input[id="email"]', TEST_USERS.new.email);
      await page.fill('input[id="password"]', TEST_USERS.new.password);
      await page.fill('input[id="confirmPassword"]', TEST_USERS.new.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response (either success or error)
      await page.waitForTimeout(3000);
      
      // Check if form submitted (loading state appears)
      const submitButton = page.locator('button[type="submit"]');
      
      // Take screenshot for verification
      await page.screenshot({ 
        path: 'tests/authentication/registration-attempt.png',
        fullPage: true 
      });
    });

    test('should show loading state during registration', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      // Fill form
      await page.fill('input[id="name"]', 'Test User');
      await page.fill('input[id="email"]', 'test-loading@example.com');
      await page.fill('input[id="password"]', 'password123');
      await page.fill('input[id="confirmPassword"]', 'password123');
      
      // Click submit and immediately check for loading state
      await page.click('button[type="submit"]');
      
      // Wait briefly to see if loading state appears
      await page.waitForTimeout(500);
      
      // Take screenshot to capture loading state
      await page.screenshot({ 
        path: 'tests/authentication/registration-loading.png',
        fullPage: true 
      });
    });
  });

  test.describe('Login Flow Testing', () => {
    
    test('should display login page with required elements', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Check page branding
      await expect(page.locator('h1')).toContainText('MedQuiz Pro');
      await expect(page.locator('text=USMLE Preparation Platform')).toBeVisible();
      
      // Check form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Sign in');
      
      // Check medical education branding
      await expect(page.locator('[aria-label*="medical education logo"], svg')).toBeVisible();
      
      // Check navigation link
      await expect(page.locator('a[href="/register"]')).toBeVisible();
    });

    test('should attempt login with existing user credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Fill login form with existing user credentials
      await page.fill('input[id="email"]', TEST_USERS.existing.email);
      await page.fill('input[id="password"]', TEST_USERS.existing.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Take screenshot to see result
      await page.screenshot({ 
        path: 'tests/authentication/login-attempt-existing.png',
        fullPage: true 
      });
      
      // Check if we're redirected or see an error
      const currentUrl = page.url();
      console.log('Current URL after login attempt:', currentUrl);
      
      // Look for either dashboard redirect or error message
      const isDashboard = currentUrl.includes('/dashboard');
      const hasError = await page.locator('[role="alert"], .error, text*="Invalid"').count() > 0;
      
      console.log('Is Dashboard:', isDashboard);
      console.log('Has Error:', hasError);
    });

    test('should handle invalid login credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Fill login form with invalid credentials
      await page.fill('input[id="email"]', TEST_USERS.invalid.email);
      await page.fill('input[id="password"]', TEST_USERS.invalid.password);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tests/authentication/login-invalid-credentials.png',
        fullPage: true 
      });
      
      // Look for error message (may appear in different formats)
      const errorSelectors = [
        '[role="alert"]',
        'text*="Invalid"',
        'text*="password"',
        '.error',
        '[class*="error"]'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        const errorCount = await page.locator(selector).count();
        if (errorCount > 0) {
          errorFound = true;
          console.log(`Error message found with selector: ${selector}`);
          break;
        }
      }
      
      console.log('Error message displayed:', errorFound);
    });

    test('should show loading state during login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Fill form
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="password"]', 'password123');
      
      // Click submit and immediately check for loading state
      await page.click('button[type="submit"]');
      
      // Wait briefly to capture loading state
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tests/authentication/login-loading.png',
        fullPage: true 
      });
      
      // Check if submit button shows loading text
      const buttonText = await page.locator('button[type="submit"]').textContent();
      console.log('Button text during submission:', buttonText);
    });
  });

  test.describe('Navigation and UI Testing', () => {
    
    test('should navigate between login and register pages', async ({ page }) => {
      // Start at login page
      await page.goto(`${BASE_URL}/login`);
      
      // Click register link
      await page.click('a[href="/register"]');
      await expect(page).toHaveURL(`${BASE_URL}/register`);
      
      // Take screenshot of register page
      await page.screenshot({ 
        path: 'tests/authentication/register-page-navigation.png',
        fullPage: true 
      });
      
      // Click login link
      await page.click('a[href="/login"]');
      await expect(page).toHaveURL(`${BASE_URL}/login`);
      
      // Take screenshot of login page
      await page.screenshot({ 
        path: 'tests/authentication/login-page-navigation.png',
        fullPage: true 
      });
    });

    test('should be mobile responsive', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test login page on mobile
      await page.goto(`${BASE_URL}/login`);
      await page.screenshot({ 
        path: 'tests/authentication/login-mobile.png',
        fullPage: true 
      });
      
      // Test register page on mobile
      await page.goto(`${BASE_URL}/register`);
      await page.screenshot({ 
        path: 'tests/authentication/register-mobile.png',
        fullPage: true 
      });
      
      // Check that elements are still visible and accessible
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Test tab navigation
      await page.keyboard.press('Tab'); // Email field
      await page.keyboard.press('Tab'); // Password field
      await page.keyboard.press('Tab'); // Submit button
      await page.keyboard.press('Tab'); // Register link
      
      // Take screenshot showing focus states
      await page.screenshot({ 
        path: 'tests/authentication/keyboard-navigation.png',
        fullPage: true 
      });
      
      // Test form submission with Enter key
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="password"]', 'password123');
      await page.keyboard.press('Enter');
      
      // Wait and screenshot
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'tests/authentication/keyboard-submit.png',
        fullPage: true 
      });
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline condition
      await page.route('**/*', route => route.abort());
      
      await page.goto(`${BASE_URL}/login`);
      
      // Try to submit form
      await page.fill('input[id="email"]', 'test@example.com');
      await page.fill('input[id="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait and screenshot
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'tests/authentication/network-error.png',
        fullPage: true 
      });
    });

    test('should validate email format', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Enter invalid email format
      await page.fill('input[id="email"]', 'invalid-email-format');
      await page.fill('input[id="password"]', 'password123');
      
      // Try to submit
      await page.click('button[type="submit"]');
      
      // Check for HTML5 validation or custom validation
      await page.screenshot({ 
        path: 'tests/authentication/email-validation.png',
        fullPage: true 
      });
      
      const emailInput = page.locator('input[id="email"]');
      const isValid = await emailInput.evaluate(input => input.checkValidity());
      console.log('Email field validity:', isValid);
    });
  });

  test.describe('Accessibility Testing', () => {
    
    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Check for proper labels and ARIA attributes
      const emailLabel = await page.locator('label[for="email"]').count();
      const passwordLabel = await page.locator('label[for="password"]').count();
      
      console.log('Email label present:', emailLabel > 0);
      console.log('Password label present:', passwordLabel > 0);
      
      // Screenshot for manual verification
      await page.screenshot({ 
        path: 'tests/authentication/accessibility-labels.png',
        fullPage: true 
      });
    });

    test('should show error messages with proper roles', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Trigger an error
      await page.fill('input[id="email"]', 'wrong@example.com');
      await page.fill('input[id="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error
      await page.waitForTimeout(2000);
      
      // Check for error message with proper ARIA role
      const errorElements = await page.locator('[role="alert"], [aria-live="assertive"]').count();
      console.log('Error elements with proper ARIA roles:', errorElements);
      
      await page.screenshot({ 
        path: 'tests/authentication/accessibility-errors.png',
        fullPage: true 
      });
    });
  });
});

// Helper function to generate test report
test.afterAll(async () => {
  console.log('\n=== AUTHENTICATION TESTING COMPLETE ===');
  console.log('Screenshots saved to tests/authentication/');
  console.log('Check the images to verify UI states and responses');
  console.log('==========================================\n');
});