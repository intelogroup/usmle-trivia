// Test script to verify MedQuiz Pro production functionality
import { test, expect } from '@playwright/test';

test.describe('MedQuiz Pro Production Testing', () => {
  const PRODUCTION_URL = 'https://usmle-trivia.netlify.app';
  
  test('should load main page without JavaScript 404 errors', async ({ page }) => {
    // Listen for 404 errors
    const errors404 = [];
    page.on('response', response => {
      if (response.status() === 404 && response.url().includes('.js')) {
        errors404.push(response.url());
      }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for 404 JavaScript errors
    expect(errors404).toHaveLength(0);
    
    // Verify page title
    await expect(page).toHaveTitle(/USMLE Trivia/);
    
    console.log('✅ Main page loads without JavaScript 404 errors');
  });

  test('should render React application and interactive elements', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if React root is populated (indicates React mounted)
    const reactRoot = await page.locator('#root').innerHTML();
    expect(reactRoot.length).toBeGreaterThan(100); // Should have substantial content
    
    // Look for navigation elements
    await expect(page.locator('nav, header, [role="navigation"]')).toBeVisible();
    
    // Look for interactive buttons
    await expect(page.locator('button, [role="button"]')).toBeVisible();
    
    console.log('✅ React application renders with interactive elements');
  });

  test('should load registration page and form', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/register`);
    await page.waitForLoadState('networkidle');
    
    // Check for registration form
    await expect(page.locator('form')).toBeVisible();
    
    // Check for form fields
    await expect(page.locator('input[type="email"], input[name*="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name*="password"]')).toBeVisible();
    await expect(page.locator('input[name*="name"], input[placeholder*="name"]')).toBeVisible();
    
    // Check for submit button
    await expect(page.locator('button[type="submit"], input[type="submit"]')).toBeVisible();
    
    console.log('✅ Registration form loads with all required fields');
  });

  test('should attempt registration with test credentials', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-fixed-auth-${timestamp}@medquiz.test`;
    const testName = 'Fixed Auth Test User';
    const testPassword = 'TestPassword123!';
    
    await page.goto(`${PRODUCTION_URL}/register`);
    await page.waitForLoadState('networkidle');
    
    // Fill out registration form
    await page.fill('input[type="email"], input[name*="email"]', testEmail);
    await page.fill('input[name*="name"], input[placeholder*="name"]', testName);
    await page.fill('input[type="password"], input[name*="password"]', testPassword);
    
    // Listen for network requests to Convex
    let convexRequestMade = false;
    page.on('request', request => {
      if (request.url().includes('convex.cloud') || request.url().includes('convex.site')) {
        convexRequestMade = true;
        console.log(`🔗 Convex request: ${request.method()} ${request.url()}`);
      }
    });
    
    // Submit form
    await page.click('button[type="submit"], input[type="submit"]');
    
    // Wait for network activity
    await page.waitForTimeout(3000);
    
    // Verify network request was made
    expect(convexRequestMade).toBe(true);
    
    console.log('✅ Registration form submits and makes Convex requests');
    console.log(`📧 Test credentials: ${testEmail} / ${testPassword}`);
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Check if login page loads
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"], input[name*="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name*="password"]')).toBeVisible();
    
    console.log('✅ Login page loads with authentication form');
  });
});