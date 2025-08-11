// Manual registration test with extended waiting
import { test, expect } from '@playwright/test';

test('manual registration with backend verification', async ({ page }) => {
  const timestamp = Date.now();
  const testEmail = `manual-test-${timestamp}@medquiz.test`;
  const testName = 'Manual Test User';
  const testPassword = 'TestPassword123!';
  
  console.log(`🧪 Manual test credentials: ${testEmail} / ${testPassword}`);
  
  // Listen for all network traffic
  page.on('request', request => {
    console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    console.log(`📡 RESPONSE: ${response.status()} ${response.url()}`);
  });
  
  // Navigate to registration page
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Registration page loaded');
  
  // Take initial screenshot
  await page.screenshot({ path: 'manual-test-before-fill.png', fullPage: true });
  
  // Fill the form carefully
  await page.fill('#name', testName);
  await page.fill('input[type="email"]', testEmail);
  await page.fill('#password', testPassword);
  await page.fill('#confirmPassword', testPassword);
  
  console.log('✅ Form filled with test data');
  
  // Take screenshot after filling
  await page.screenshot({ path: 'manual-test-after-fill.png', fullPage: true });
  
  // Submit and wait for response
  await page.click('button[type="submit"]');
  
  console.log('✅ Form submitted, waiting for response...');
  
  // Wait longer for any network activity or page changes
  await page.waitForTimeout(10000); // 10 seconds
  
  // Take final screenshot
  await page.screenshot({ path: 'manual-test-after-submit.png', fullPage: true });
  
  const currentUrl = page.url();
  console.log(`📍 Final URL: ${currentUrl}`);
  
  // Check if we're still on registration (might indicate an error) or redirected (success)
  if (currentUrl.includes('/register')) {
    console.log('⚠️ Still on registration page - checking for error messages');
    
    // Look for error messages
    const errorElements = await page.locator('[role="alert"], .error, .text-red-500, [class*="error"]').all();
    for (const error of errorElements) {
      const text = await error.textContent();
      console.log(`❌ Error found: ${text}`);
    }
  } else {
    console.log('🎉 Page redirected - registration may have succeeded!');
  }
});