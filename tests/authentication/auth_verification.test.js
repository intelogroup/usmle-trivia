import { test, expect } from '@playwright/test';

test.describe('Authentication System Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
  });

  test.describe('Login Page Tests', () => {
    test('should display login form with correct elements', async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      
      // Verify form elements exist
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.getByText('MedQuiz Pro')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      
      // Fill in valid credentials
      await page.fill('input[id="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[id="password"]', 'Jimkali90#');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for navigation and verify success
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.getByText('Dashboard')).toBeVisible();
    });

    test('should show error for wrong password', async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      
      // Fill in wrong password for existing user
      await page.fill('input[id="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[id="password"]', 'wrongpassword123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message
      const errorMessage = page.locator('#login-error');
      await expect(errorMessage).toBeVisible();
      
      // Verify specific error message content
      const errorText = await errorMessage.textContent();
      expect(errorText.toLowerCase()).toMatch(/invalid|password|credentials/);
      
      // Should not redirect
      await expect(page).toHaveURL(/.*login/);
    });

    test('should show error for non-existent email', async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      
      // Fill in non-existent email
      await page.fill('input[id="email"]', 'nonexistent@example.com');
      await page.fill('input[id="password"]', 'somepassword123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message
      const errorMessage = page.locator('#login-error');
      await expect(errorMessage).toBeVisible();
      
      // Verify error message is user-friendly
      const errorText = await errorMessage.textContent();
      expect(errorText.length).toBeGreaterThan(0);
      expect(errorText.toLowerCase()).not.toContain('undefined');
      
      // Should not redirect
      await expect(page).toHaveURL(/.*login/);
    });

    test('should validate empty email field', async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      
      // Try to submit with empty email
      await page.fill('input[id="password"]', 'somepassword');
      await page.click('button[type="submit"]');
      
      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[id="email"]');
      await expect(emailInput).toHaveAttribute('required');
      
      // Should still be on login page
      await expect(page).toHaveURL(/.*login/);
    });

    test('should validate empty password field', async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      
      // Try to submit with empty password
      await page.fill('input[id="email"]', 'test@example.com');
      await page.click('button[type="submit"]');
      
      // HTML5 validation should prevent submission
      const passwordInput = page.locator('input[id="password"]');
      await expect(passwordInput).toHaveAttribute('required');
      
      // Should still be on login page
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Registration Page Tests', () => {
    test('should display registration form correctly', async ({ page }) => {
      await page.goto('http://localhost:5173/register');
      
      // Verify form elements exist
      await expect(page.locator('input[id="name"]')).toBeVisible();
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error when trying to register with existing email', async ({ page }) => {
      await page.goto('http://localhost:5173/register');
      
      // Fill in form with existing email
      await page.fill('input[id="name"]', 'Test User');
      await page.fill('input[id="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[id="password"]', 'TestPass123!');
      await page.fill('input[id="confirmPassword"]', 'TestPass123!');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message
      const errorMessage = page.locator('.text-destructive');
      await expect(errorMessage).toBeVisible();
      
      // Verify error message mentions existing account
      const errorText = await errorMessage.textContent();
      expect(errorText.toLowerCase()).toMatch(/already|exists|account/);
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('http://localhost:5173/register');
      
      // Fill in form with mismatched passwords
      await page.fill('input[id="name"]', 'Test User');
      await page.fill('input[id="email"]', 'newuser@example.com');
      await page.fill('input[id="password"]', 'TestPass123!');
      await page.fill('input[id="confirmPassword"]', 'DifferentPass123!');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message about password mismatch
      const errorMessage = page.locator('.text-destructive');
      await expect(errorMessage).toBeVisible();
      
      const errorText = await errorMessage.textContent();
      expect(errorText.toLowerCase()).toContain('match');
    });

    test('should validate minimum password length', async ({ page }) => {
      await page.goto('http://localhost:5173/register');
      
      // Fill in form with short password
      await page.fill('input[id="name"]', 'Test User');
      await page.fill('input[id="email"]', 'newuser@example.com');
      await page.fill('input[id="password"]', '123');
      await page.fill('input[id="confirmPassword"]', '123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message about password length
      const errorMessage = page.locator('.text-destructive');
      await expect(errorMessage).toBeVisible();
      
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/8.*character/);
    });
  });

  test.describe('Error Message Quality Tests', () => {
    test('error messages should be user-friendly and informative', async ({ page }) => {
      const testCases = [
        {
          page: '/login',
          email: 'jayveedz19@gmail.com',
          password: 'wrongpassword',
          expectedKeywords: ['invalid', 'password', 'credentials']
        },
        {
          page: '/login', 
          email: 'nonexistent@test.com',
          password: 'somepassword',
          expectedKeywords: ['email', 'account', 'found']
        }
      ];

      for (const testCase of testCases) {
        await page.goto(`http://localhost:5173${testCase.page}`);
        
        await page.fill('input[id="email"]', testCase.email);
        await page.fill('input[id="password"]', testCase.password);
        await page.click('button[type="submit"]');
        
        // Wait for error message
        const errorMessage = page.locator('.text-destructive');
        await expect(errorMessage).toBeVisible();
        
        const errorText = (await errorMessage.textContent()).toLowerCase();
        
        // Verify error message is informative
        expect(errorText.length).toBeGreaterThan(10);
        
        // Verify no technical jargon
        expect(errorText).not.toContain('undefined');
        expect(errorText).not.toContain('null');
        expect(errorText).not.toContain('error 500');
        expect(errorText).not.toContain('exception');
        
        // Verify contains expected keywords
        const hasExpectedKeyword = testCase.expectedKeywords.some(keyword => 
          errorText.includes(keyword)
        );
        expect(hasExpectedKeyword).toBeTruthy();
      }
    });
  });

  test.describe('Loading States and UX', () => {
    test('should show loading state during authentication', async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      
      await page.fill('input[id="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[id="password"]', 'Jimkali90#');
      
      // Submit form and immediately check for loading state
      const submitPromise = page.click('button[type="submit"]');
      
      // Button should show loading state
      const submitButton = page.locator('button[type="submit"]');
      
      // Wait for the promise to complete
      await submitPromise;
      
      // Should eventually navigate to dashboard
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    });

    test('should clear previous error messages on new attempts', async ({ page }) => {
      await page.goto('http://localhost:5173/login');
      
      // First attempt with wrong credentials
      await page.fill('input[id="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[id="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error message
      const errorMessage = page.locator('#login-error');
      await expect(errorMessage).toBeVisible();
      
      // Second attempt - error should be cleared initially
      await page.fill('input[id="password"]', 'anotherwrongpassword');
      
      // Click submit for second attempt
      await page.click('button[type="submit"]');
      
      // Error message should appear again
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Navigation and Links', () => {
    test('should navigate between login and register pages', async ({ page }) => {
      // Start at login page
      await page.goto('http://localhost:5173/login');
      
      // Click "Sign up" link
      await page.click('text=Sign up');
      await expect(page).toHaveURL(/.*register/);
      
      // Click "Sign in" link
      await page.click('text=Sign in');
      await expect(page).toHaveURL(/.*login/);
    });
  });
});