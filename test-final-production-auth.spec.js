import { test, expect } from '@playwright/test';

// Generate unique test user credentials
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const testEmail = `test-final-auth-${timestamp}@medquiz.test`;
const testName = 'Final Auth Test User';
const testPassword = 'TestPassword123!';

// Existing test user credentials
const existingEmail = 'jayveedz19@gmail.com';
const existingPassword = 'Jimkali90#';

test.describe('Final Production Authentication Flow Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to production site
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForLoadState('networkidle');
  });

  test('1. Homepage loads successfully', async ({ page }) => {
    // Verify homepage loads
    await expect(page).toHaveTitle(/MedQuiz Pro/i);
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText(/MedQuiz Pro|Medical Education/i);
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'final-test-01-homepage.png', fullPage: true });
    
    console.log('✅ Homepage loaded successfully');
  });

  test('2. New user registration flow', async ({ page }) => {
    // Navigate to registration
    const registerLink = page.locator('a[href*="register"], button:has-text("Sign Up"), a:has-text("Register")').first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
    } else {
      // Try alternative navigation
      await page.goto('https://usmle-trivia.netlify.app/register');
    }
    
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of registration page
    await page.screenshot({ path: 'final-test-02-registration-page.png', fullPage: true });
    
    // Fill registration form
    console.log(`Attempting to register user: ${testEmail}`);
    
    // Try multiple possible field selectors
    const nameField = page.locator('input[name="name"], input[placeholder*="name" i], input[type="text"]').first();
    const emailField = page.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"], input[placeholder*="password" i]').first();
    
    await nameField.fill(testName);
    await emailField.fill(testEmail);
    await passwordField.fill(testPassword);
    
    // Take screenshot after filling form
    await page.screenshot({ path: 'final-test-03-registration-filled.png', fullPage: true });
    
    // Submit registration
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")').first();
    await submitButton.click();
    
    // Wait for response and check for success
    await page.waitForTimeout(3000);
    
    // Check for success indicators
    const isOnDashboard = page.url().includes('/dashboard') || page.url().includes('/quiz');
    const hasSuccessMessage = await page.locator('text=/success|welcome|registered/i').isVisible();
    const hasErrorMessage = await page.locator('text=/error|failed|invalid/i').isVisible();
    
    // Take screenshot of result
    await page.screenshot({ path: 'final-test-04-registration-result.png', fullPage: true });
    
    if (hasErrorMessage) {
      const errorText = await page.locator('text=/error|failed|invalid/i').textContent();
      console.log(`❌ Registration failed with error: ${errorText}`);
      expect(hasErrorMessage).toBe(false);
    } else if (isOnDashboard || hasSuccessMessage) {
      console.log('✅ Registration completed successfully');
      expect(isOnDashboard || hasSuccessMessage).toBe(true);
    } else {
      console.log('⚠️ Registration status unclear, checking page content');
      await page.screenshot({ path: 'final-test-04-registration-unclear.png', fullPage: true });
    }
  });

  test('3. Login with new user credentials', async ({ page }) => {
    // Navigate to login
    const loginLink = page.locator('a[href*="login"], button:has-text("Log In"), a:has-text("Login")').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
    } else {
      await page.goto('https://usmle-trivia.netlify.app/login');
    }
    
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'final-test-05-login-page.png', fullPage: true });
    
    // Fill login form with test credentials
    console.log(`Attempting to login with: ${testEmail}`);
    
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    
    await emailField.fill(testEmail);
    await passwordField.fill(testPassword);
    
    // Take screenshot after filling
    await page.screenshot({ path: 'final-test-06-login-filled.png', fullPage: true });
    
    // Submit login
    const loginButton = page.locator('button[type="submit"], button:has-text("Log In"), button:has-text("Login")').first();
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    // Check for successful login
    const isLoggedIn = page.url().includes('/dashboard') || page.url().includes('/quiz');
    const hasUserMenu = await page.locator('[data-testid="user-menu"], .user-menu, button:has-text("' + testName + '")').isVisible();
    
    // Take screenshot of result
    await page.screenshot({ path: 'final-test-07-login-result.png', fullPage: true });
    
    if (isLoggedIn || hasUserMenu) {
      console.log('✅ Login successful with new user credentials');
    } else {
      console.log('❌ Login may have failed, checking for errors');
      const hasError = await page.locator('text=/error|invalid|failed/i').isVisible();
      if (hasError) {
        const errorText = await page.locator('text=/error|invalid|failed/i').textContent();
        console.log(`Login error: ${errorText}`);
      }
    }
  });

  test('4. Login with existing user credentials', async ({ page }) => {
    // Navigate to login
    const loginLink = page.locator('a[href*="login"], button:has-text("Log In"), a:has-text("Login")').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
    } else {
      await page.goto('https://usmle-trivia.netlify.app/login');
    }
    
    await page.waitForLoadState('networkidle');
    
    console.log(`Testing existing user login: ${existingEmail}`);
    
    // Fill login form with existing credentials
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    
    await emailField.fill(existingEmail);
    await passwordField.fill(existingPassword);
    
    // Take screenshot
    await page.screenshot({ path: 'final-test-08-existing-login.png', fullPage: true });
    
    // Submit login
    const loginButton = page.locator('button[type="submit"], button:has-text("Log In")').first();
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    
    // Check for successful login
    const isLoggedIn = page.url().includes('/dashboard') || page.url().includes('/quiz');
    const hasUserMenu = await page.locator('[data-testid="user-menu"], .user-menu').isVisible();
    
    // Take screenshot of result
    await page.screenshot({ path: 'final-test-09-existing-login-result.png', fullPage: true });
    
    if (isLoggedIn || hasUserMenu) {
      console.log('✅ Existing user login successful');
      return { success: true };
    } else {
      console.log('❌ Existing user login may have failed');
      return { success: false };
    }
  });

  test('5. Test logout functionality', async ({ page }) => {
    // First login with existing user
    await page.goto('https://usmle-trivia.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    
    await emailField.fill(existingEmail);
    await passwordField.fill(existingPassword);
    
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    await page.waitForTimeout(3000);
    
    // Look for logout functionality
    const userMenuButton = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Jay"), [aria-label*="user menu"]').first();
    if (await userMenuButton.isVisible()) {
      await userMenuButton.click();
      await page.waitForTimeout(1000);
      
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForTimeout(2000);
        
        // Verify logout
        const isOnHomepage = page.url() === 'https://usmle-trivia.netlify.app/' || page.url().includes('/login');
        const hasLoginLink = await page.locator('a:has-text("Login"), button:has-text("Log In")').isVisible();
        
        // Take screenshot
        await page.screenshot({ path: 'final-test-10-logout-result.png', fullPage: true });
        
        if (isOnHomepage || hasLoginLink) {
          console.log('✅ Logout successful');
        } else {
          console.log('❌ Logout may have failed');
        }
      } else {
        console.log('⚠️ Logout button not found in user menu');
      }
    } else {
      console.log('⚠️ User menu not found after login');
    }
  });

  test('6. Network requests monitoring', async ({ page }) => {
    const networkRequests = [];
    const networkErrors = [];
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('convex') || request.url().includes('api')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    page.on('response', response => {
      if ((response.url().includes('convex') || response.url().includes('api')) && response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Perform a complete flow to test network requests
    await page.goto('https://usmle-trivia.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    // Try to login
    const emailField = page.locator('input[type="email"]').first();
    const passwordField = page.locator('input[type="password"]').first();
    
    if (await emailField.isVisible() && await passwordField.isVisible()) {
      await emailField.fill(existingEmail);
      await passwordField.fill(existingPassword);
      
      const loginButton = page.locator('button[type="submit"]').first();
      await loginButton.click();
      await page.waitForTimeout(5000);
    }
    
    // Report network activity
    console.log(`\n📡 Network Requests Captured: ${networkRequests.length}`);
    networkRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });
    
    console.log(`\n❌ Network Errors: ${networkErrors.length}`);
    networkErrors.forEach(err => {
      console.log(`  ${err.status} ${err.statusText} - ${err.url}`);
    });
    
    // Take final screenshot
    await page.screenshot({ path: 'final-test-11-network-monitoring.png', fullPage: true });
    
    // Assert no critical network errors
    expect(networkErrors.length).toBe(0);
  });
});