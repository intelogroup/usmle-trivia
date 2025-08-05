import { chromium } from 'playwright';

async function testLiveAuthentication() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => console.log('🖥️ CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));

  try {
    console.log('🚀 Starting authentication test on live site...');
    
    // Navigate to the live site
    console.log('📍 Navigating to https://usmle-trivia.netlify.app');
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForTimeout(3000);
    
    // Take screenshot of homepage
    await page.screenshot({ path: '/root/repo/screenshots/live-homepage.png', fullPage: true });
    console.log('📸 Homepage screenshot saved');
    
    // Look for the specific buttons we can see in the screenshots
    const getStartedButton = await page.locator('button:has-text("Get Started")').first();
    const signInButton = await page.locator('button:has-text("Sign In"), a:has-text("Sign In")').first();
    const startFreeTrialButton = await page.locator('button:has-text("Start Free Trial")').first();
    
    console.log('🔍 Looking for authentication buttons...');
    
    // Try Get Started button first
    if (await getStartedButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Found "Get Started" button - clicking...');
      await getStartedButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/root/repo/screenshots/live-after-get-started.png', fullPage: true });
      console.log('📸 After Get Started screenshot saved');
    }
    
    // Try Sign In button
    if (await signInButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Found "Sign In" button - clicking...');
      await signInButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/root/repo/screenshots/live-after-sign-in.png', fullPage: true });
      console.log('📸 After Sign In screenshot saved');
    }
    
    // Try Start Free Trial buttons
    const freeTrialButtons = await page.locator('button:has-text("Start Free Trial"), button:has-text("Start Your Free Trial")').all();
    if (freeTrialButtons.length > 0) {
      console.log(`✅ Found ${freeTrialButtons.length} "Start Free Trial" button(s) - clicking first one...`);
      await freeTrialButtons[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/root/repo/screenshots/live-after-free-trial.png', fullPage: true });
      console.log('📸 After Free Trial button screenshot saved');
    }
    
    // Test registration with new credentials
    console.log('🧪 Testing registration with Terry Test User...');
    
    // Fill registration form if available
    const nameInput = await page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    const confirmPasswordInput = await page.locator('input[name="confirmPassword"], input[name="confirm-password"]').nth(1);
    
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('📝 Filling registration form...');
      await nameInput.fill('Terry Test User');
      await emailInput.fill('terry.test@example.com');
      await passwordInput.fill('TerryTest123!');
      
      if (await confirmPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmPasswordInput.fill('TerryTest123!');
      }
      
      // Look for submit button
      const submitButton = await page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('🚀 Submitting registration...');
        await submitButton.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: '/root/repo/screenshots/live-after-register.png', fullPage: true });
        console.log('📸 After registration screenshot saved');
      }
    } else {
      console.log('⚠️ Registration form not found, trying login instead...');
      
      // Try login with existing credentials
      if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('📝 Filling login form with existing credentials...');
        await emailInput.fill('jayveedz19@gmail.com');
        await passwordInput.fill('Jimkali90#');
        
        const loginSubmitButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
        if (await loginSubmitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('🚀 Submitting login...');
          await loginSubmitButton.click();
          await page.waitForTimeout(5000);
          await page.screenshot({ path: '/root/repo/screenshots/live-after-login.png', fullPage: true });
          console.log('📸 After login screenshot saved');
        }
      }
    }
    
    // Check for any error messages
    const errorMessages = await page.locator('.error, .alert-error, [class*="error"], [role="alert"]').all();
    if (errorMessages.length > 0) {
      console.log('❌ Found error messages:');
      for (const error of errorMessages) {
        const text = await error.textContent();
        if (text && text.trim()) {
          console.log('  -', text.trim());
        }
      }
    }
    
    // Check final page state
    const currentUrl = page.url();
    console.log('📍 Final URL:', currentUrl);
    console.log('📄 Final page title:', await page.title());
    
    await page.screenshot({ path: '/root/repo/screenshots/live-final-state.png', fullPage: true });
    console.log('📸 Final state screenshot saved');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: '/root/repo/screenshots/live-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Test completed');
  }
}

testLiveAuthentication().catch(console.error);