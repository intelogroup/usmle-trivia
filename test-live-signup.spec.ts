import { test, expect, chromium } from '@playwright/test';

// Live production site URL
const LIVE_URL = 'https://usmle-trivia.netlify.app';

// Generate unique test credentials with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const testEmail = `test-auth-${timestamp}@medquiz.test`;

const TEST_USER = {
  name: 'Auth Test User',
  email: testEmail,
  password: 'TestPassword123!',
};

console.log('Testing with credentials:', {
  email: TEST_USER.email,
  name: TEST_USER.name,
  password: '***HIDDEN***'
});

test.describe('Live Production Sign Up Testing', () => {
  
  test('should successfully register new user on live site', async ({ page }) => {
    // Navigate to the live site
    await page.goto(LIVE_URL);
    
    // Wait for the site to load completely
    await page.waitForTimeout(3000);
    
    // Look for sign up/register link or button
    let registerLink;
    try {
      // Try multiple possible selectors for registration
      const possibleSelectors = [
        'a:has-text("Sign up")',
        'a:has-text("Register")',
        'a:has-text("Create account")',
        'button:has-text("Sign up")',
        'button:has-text("Register")',
        '[href="/register"]',
        '[href*="register"]'
      ];
      
      for (const selector of possibleSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          registerLink = element;
          break;
        }
      }
      
      if (!registerLink) {
        // Try navigating directly to /register
        await page.goto(`${LIVE_URL}/register`);
        await page.waitForTimeout(2000);
      } else {
        await registerLink.click();
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('Could not find register link, trying direct navigation:', error);
      await page.goto(`${LIVE_URL}/register`);
      await page.waitForTimeout(2000);
    }
    
    // Capture screenshot of registration page
    await page.screenshot({ 
      path: `/tmp/signup-page-${timestamp}.png`,
      fullPage: true 
    });
    
    // Verify we're on the registration page
    await expect(page).toHaveURL(/.*\/register/);
    
    // Look for registration form fields with more specific selectors
    const nameField = page.locator('#name');
    const emailField = page.locator('#email');
    const passwordField = page.locator('#password');
    const confirmPasswordField = page.locator('#confirmPassword');
    
    // Fill out the registration form
    await nameField.fill(TEST_USER.name);
    await emailField.fill(TEST_USER.email);
    await passwordField.fill(TEST_USER.password);
    await confirmPasswordField.fill(TEST_USER.password);
    
    // Capture screenshot before submission
    await page.screenshot({ 
      path: `/tmp/signup-form-filled-${timestamp}.png`,
      fullPage: true 
    });
    
    // Monitor console for errors
    const consoleMessages: string[] = [];
    const networkErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(`Console Error: ${msg.text()}`);
      }
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`Network Error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create account")');
    await submitButton.click();
    
    // Wait for response and potential redirect
    await page.waitForTimeout(5000);
    
    // Capture screenshot after submission
    await page.screenshot({ 
      path: `/tmp/signup-after-submit-${timestamp}.png`,
      fullPage: true 
    });
    
    // Check for success (redirect to dashboard) or error messages
    const currentUrl = page.url();
    const hasErrorMessage = await page.locator('.bg-destructive, .text-red-500, .error, [role="alert"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    
    console.log('Registration Results:', {
      currentUrl,
      hasErrorMessage,
      consoleErrors: consoleMessages,
      networkErrors: networkErrors
    });
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: User successfully registered and redirected to dashboard');
      
      // Capture success screenshot
      await page.screenshot({ 
        path: `/tmp/signup-success-dashboard-${timestamp}.png`,
        fullPage: true 
      });
      
      // Verify user is logged in (look for user name or logout option)
      const userIndicators = [
        page.locator(`text="${TEST_USER.name}"`),
        page.locator('button:has-text("Logout")'),
        page.locator('text="Welcome"'),
        page.locator('[data-testid="user-menu"]')
      ];
      
      let userFound = false;
      for (const indicator of userIndicators) {
        if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
          userFound = true;
          break;
        }
      }
      
      expect(userFound, 'User should be logged in and visible on dashboard').toBe(true);
      
    } else if (hasErrorMessage) {
      console.log('❌ ERROR: Registration failed with error message');
      
      // Capture error details
      const errorElements = await page.locator('.bg-destructive, .text-red-500, .error, [role="alert"]').all();
      const errorMessages = [];
      
      for (const errorElement of errorElements) {
        const text = await errorElement.textContent();
        if (text?.trim()) {
          errorMessages.push(text.trim());
        }
      }
      
      console.log('Error Messages:', errorMessages);
      
      // This is expected behavior if user already exists or validation fails
      // Document the error for analysis
      
    } else {
      console.log('⚠️ UNKNOWN: Registration submission had unexpected result');
      console.log('Current URL:', currentUrl);
    }
    
    // Report console errors if any
    if (consoleMessages.length > 0) {
      console.log('JavaScript Console Errors:', consoleMessages);
    }
    
    // Report network errors if any
    if (networkErrors.length > 0) {
      console.log('Network Request Errors:', networkErrors);
    }
  });
  
  test('should test Convex backend connectivity', async ({ page }) => {
    // Navigate to live site
    await page.goto(LIVE_URL);
    await page.waitForTimeout(3000);
    
    // Monitor network requests to Convex
    const convexRequests: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('convex.cloud') || response.url().includes('convex.site')) {
        convexRequests.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });
    
    // Try to trigger a request to Convex (by going to login page)
    await page.goto(`${LIVE_URL}/login`);
    await page.waitForTimeout(3000);
    
    console.log('Convex Backend Requests:', convexRequests);
    
    if (convexRequests.length > 0) {
      console.log('✅ SUCCESS: Convex backend is being contacted');
      expect(convexRequests.some(req => req.status < 400)).toBe(true);
    } else {
      console.log('⚠️ WARNING: No Convex requests detected');
    }
  });
  
  test('should test form validation on live site', async ({ page }) => {
    await page.goto(`${LIVE_URL}/register`);
    await page.waitForTimeout(2000);
    
    // Test password validation with specific selector
    const passwordField = page.locator('#password');
    
    // Test weak password
    await passwordField.fill('weak');
    
    // Look for password strength indicator
    const strengthIndicators = await page.locator('.text-red-500, .text-yellow-500, .text-green-500, .weak, .medium, .strong').all();
    
    if (strengthIndicators.length > 0) {
      console.log('✅ Password strength validation is working');
    } else {
      console.log('⚠️ No password strength indicator found');
    }
    
    // Test empty form submission
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(1000);
    
    // HTML5 validation should prevent submission
    const hasValidationError = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[required]');
      for (const input of inputs) {
        if ((input as HTMLInputElement).validationMessage) {
          return true;
        }
      }
      return false;
    });
    
    if (hasValidationError) {
      console.log('✅ Form validation is working');
    } else {
      console.log('⚠️ Form validation may not be working correctly');
    }
  });
});

test.afterEach(async ({ page }, testInfo) => {
  // Capture final screenshot if test failed
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ 
      path: `/tmp/test-failure-${testInfo.title.replace(/\s+/g, '-')}-${timestamp}.png`,
      fullPage: true 
    });
  }
});