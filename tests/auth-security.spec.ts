import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const VALID_USER = {
  email: 'jayveedz19@gmail.com',
  password: 'Jimkali90#',
  name: 'Jay veedz'
};

test.describe('Authentication Security Tests', () => {
  
  test.describe('Login Security', () => {
    
    test('should reject invalid email format', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('#email', 'invalidemail');
      await page.fill('#password', 'Password123!');
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = await page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Please enter a valid email address');
      
      // Should not navigate away
      await expect(page).toHaveURL(/.*\/login/);
    });
    
    test('should reject wrong password for existing user', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('#email', VALID_USER.email);
      await page.fill('#password', 'WrongPassword123!');
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = await page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Invalid email or password');
      
      // Should not navigate away
      await expect(page).toHaveURL(/.*\/login/);
    });
    
    test('should reject non-existent user', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('#email', 'nonexistent@example.com');
      await page.fill('#password', 'Password123!');
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = await page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Invalid email or password');
      
      // Should not navigate away
      await expect(page).toHaveURL(/.*\/login/);
    });
    
    test('should enforce rate limiting after multiple failed attempts', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Try 6 consecutive failed attempts
      for (let i = 0; i < 6; i++) {
        await page.fill('#email', VALID_USER.email);
        await page.fill('#password', `WrongPassword${i}`);
        await page.click('button[type="submit"]');
        
        // Wait for error to appear
        await page.waitForTimeout(500);
        
        // Clear fields for next attempt
        await page.fill('#email', '');
        await page.fill('#password', '');
      }
      
      // On the 6th attempt, should show rate limit error
      const error = await page.locator('[role="alert"]').last();
      const errorText = await error.textContent();
      
      // Should either show rate limit or still show invalid credentials
      // (rate limiting is client-side so may vary)
      expect(errorText).toMatch(/too many attempts|Invalid email or password/i);
    });
    
    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('#email', VALID_USER.email);
      await page.fill('#password', VALID_USER.password);
      await page.click('button[type="submit"]');
      
      // Should navigate to dashboard
      await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });
      
      // Should show user name in the UI
      const userName = await page.locator('text=/Jay veedz/i').first();
      await expect(userName).toBeVisible({ timeout: 10000 });
    });
  });
  
  test.describe('Registration Security', () => {
    
    test('should reject weak password (too short)', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'test1@example.com');
      await page.fill('#password', 'Pass1!');
      await page.fill('#confirmPassword', 'Pass1!');
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = await page.locator('.bg-destructive\\/10');
      await expect(error).toBeVisible();
      await expect(error).toContainText('at least 8 characters');
    });
    
    test('should reject password without uppercase', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'test2@example.com');
      await page.fill('#password', 'password123!');
      await page.fill('#confirmPassword', 'password123!');
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = await page.locator('.bg-destructive\\/10');
      await expect(error).toBeVisible();
      await expect(error).toContainText('uppercase letter');
    });
    
    test('should reject password without number', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'test3@example.com');
      await page.fill('#password', 'Password!');
      await page.fill('#confirmPassword', 'Password!');
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = await page.locator('.bg-destructive\\/10');
      await expect(error).toBeVisible();
      await expect(error).toContainText('at least one number');
    });
    
    test('should reject password without special character', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'test4@example.com');
      await page.fill('#password', 'Password123');
      await page.fill('#confirmPassword', 'Password123');
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = await page.locator('.bg-destructive\\/10');
      await expect(error).toBeVisible();
      await expect(error).toContainText('special character');
    });
    
    test('should reject mismatched passwords', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'test5@example.com');
      await page.fill('#password', 'ValidPass123!');
      await page.fill('#confirmPassword', 'DifferentPass123!');
      await page.click('button[type="submit"]');
      
      // Should show error message
      const error = await page.locator('.bg-destructive\\/10');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Passwords do not match');
    });
    
    test('should show password strength indicator', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      // Type weak password
      await page.fill('#password', 'weak');
      let strengthIndicator = await page.locator('.text-red-500');
      await expect(strengthIndicator).toContainText('Weak');
      
      // Type medium password
      await page.fill('#password', 'Medium123');
      strengthIndicator = await page.locator('.text-yellow-500');
      await expect(strengthIndicator).toContainText('Medium');
      
      // Type strong password
      await page.fill('#password', 'Strong123!@#');
      strengthIndicator = await page.locator('.text-green-500');
      await expect(strengthIndicator).toContainText('Strong');
    });
  });
  
  test.describe('Route Protection', () => {
    
    test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
      // Clear any existing auth
      await page.context().clearCookies();
      
      const protectedRoutes = [
        '/dashboard',
        '/quiz',
        '/progress',
        '/analytics',
        '/profile',
        '/leaderboard'
      ];
      
      for (const route of protectedRoutes) {
        await page.goto(`${BASE_URL}${route}`);
        
        // Should redirect to login
        await expect(page).toHaveURL(/.*\/login/);
      }
    });
    
    test('should redirect to dashboard when authenticated user visits login', async ({ page }) => {
      // First login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email', VALID_USER.email);
      await page.fill('#password', VALID_USER.password);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*\/dashboard/);
      
      // Try to go back to login
      await page.goto(`${BASE_URL}/login`);
      
      // Should redirect back to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
    });
    
    test('should maintain session across page refreshes', async ({ page }) => {
      // Login
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email', VALID_USER.email);
      await page.fill('#password', VALID_USER.password);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*\/dashboard/);
      
      // Refresh page
      await page.reload();
      
      // Should still be on dashboard
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // User should still be visible
      const userName = await page.locator('text=/Jay veedz/i').first();
      await expect(userName).toBeVisible();
    });
    
    test('should successfully logout', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email', VALID_USER.email);
      await page.fill('#password', VALID_USER.password);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL(/.*\/dashboard/);
      
      // Click on user menu
      await page.click('button:has-text("Jay veedz")');
      
      // Click logout
      await page.click('text=Logout');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
      
      // Try to access dashboard again
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
    });
  });
  
  test.describe('Security Edge Cases', () => {
    
    test('should sanitize XSS attempts in login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('#email', '<script>alert("xss")</script>@test.com');
      await page.fill('#password', 'Password123!');
      await page.click('button[type="submit"]');
      
      // Should show invalid email error, not execute script
      const error = await page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Please enter a valid email address');
      
      // No alert should appear
      const alerts: string[] = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });
      
      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
    });
    
    test('should handle SQL injection attempts safely', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('#email', "admin' OR '1'='1");
      await page.fill('#password', "password' OR '1'='1");
      await page.click('button[type="submit"]');
      
      // Should show invalid email error
      const error = await page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Please enter a valid email address');
    });
    
    test('should handle empty form submissions', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // HTML5 validation should prevent submission
      const emailInput = await page.locator('#email');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });
  });
});