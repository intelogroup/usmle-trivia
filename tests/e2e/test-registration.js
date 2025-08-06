import { chromium } from 'playwright';

async function testRegistration() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => console.log('🖥️ CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));

  try {
    console.log('🧪 Testing registration with Terry Test User...');
    
    // Navigate to the live site
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForTimeout(3000);
    
    // Click Get Started to go to registration
    const getStartedButton = await page.locator('button:has-text("Get Started")').first();
    if (await getStartedButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Clicking Get Started button...');
      await getStartedButton.click();
      await page.waitForTimeout(3000);
    }
    
    // Fill registration form
    console.log('📝 Filling registration form...');
    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Terry Test User');
    await page.fill('input[type="email"]', 'terry.test@example.com');
    await page.fill('input[type="password"]', 'TerryTest123!');
    
    // Check if there's a confirm password field
    const confirmPasswordField = await page.locator('input[name="confirmPassword"], input[name="confirm-password"]').nth(1);
    if (await confirmPasswordField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmPasswordField.fill('TerryTest123!');
    }
    
    await page.screenshot({ path: '/root/repo/screenshots/live-registration-filled.png', fullPage: true });
    console.log('📸 Registration form filled screenshot saved');
    
    // Submit registration
    const createAccountButton = await page.locator('button:has-text("Create account"), button[type="submit"]').first();
    if (await createAccountButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('🚀 Submitting registration...');
      await createAccountButton.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: '/root/repo/screenshots/live-registration-result.png', fullPage: true });
      console.log('📸 Registration result screenshot saved');
    }
    
    // Check final state
    console.log('📍 Final URL:', page.url());
    console.log('📄 Final page title:', await page.title());
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
    await page.screenshot({ path: '/root/repo/screenshots/live-registration-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Registration test completed');
  }
}

testRegistration().catch(console.error);