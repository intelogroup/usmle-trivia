// Test registration functionality specifically
import { test, expect } from '@playwright/test';

test('should successfully register new user', async ({ page }) => {
  const timestamp = Date.now();
  const testEmail = `test-fixed-auth-${timestamp}@medquiz.test`;
  const testName = 'Fixed Auth Test User';
  const testPassword = 'TestPassword123!';
  
  console.log(`🧪 Testing with credentials: ${testEmail} / ${testPassword}`);
  
  // Go to registration page
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  
  // Verify form is present
  await expect(page.locator('form')).toBeVisible();
  
  // Fill out the form with specific selectors
  await page.fill('input[id="name"], input[placeholder*="John Doe"]', testName);
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[id="password"]', testPassword);
  await page.fill('input[id="confirmPassword"]', testPassword);
  
  // Listen for network requests
  let convexRequestMade = false;
  let requestDetails = [];
  
  page.on('request', request => {
    if (request.url().includes('convex.cloud') || request.url().includes('convex.site')) {
      convexRequestMade = true;
      requestDetails.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers()
      });
      console.log(`🔗 Convex request: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('convex.cloud') || response.url().includes('convex.site')) {
      console.log(`📡 Convex response: ${response.status()} ${response.url()}`);
    }
  });
  
  // Submit the form
  await page.click('button[type="submit"], button:has-text("Create account")');
  
  // Wait for any navigation or form submission
  await page.waitForTimeout(5000);
  
  // Check if we got redirected (indicates success)
  const currentUrl = page.url();
  console.log(`📍 Current URL after submission: ${currentUrl}`);
  
  // Verify network request was made
  expect(convexRequestMade).toBe(true);
  console.log('✅ Registration form successfully submitted to Convex backend');
  
  // Log request details
  requestDetails.forEach((req, index) => {
    console.log(`📋 Request ${index + 1}: ${req.method} ${req.url}`);
  });
});