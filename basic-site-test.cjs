const { test, expect } = require('@playwright/test');

test('verify site is accessible and working', async ({ page }) => {
  console.log('🌐 Testing site accessibility...');
  
  await page.goto('https://usmle-trivia.netlify.app');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check if page loaded successfully
  const title = await page.title();
  console.log(`📄 Page title: ${title}`);
  
  // Check for main content
  const body = await page.locator('body').textContent();
  console.log(`📝 Page content length: ${body.length} characters`);
  
  // Take a screenshot
  await page.screenshot({ path: 'site-verification.png', fullPage: true });
  console.log('📸 Screenshot saved as site-verification.png');
  
  // Basic assertions
  expect(title).toBeTruthy();
  expect(body.length).toBeGreaterThan(100);
  
  console.log('✅ Site is accessible and working');
});