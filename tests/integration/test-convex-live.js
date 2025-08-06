import { chromium } from 'playwright';

async function testConvexLive() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => console.log('🖥️ CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));

  try {
    console.log('🧪 Testing Convex Backend Authentication...');
    
    // Navigate to the live site
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForTimeout(3000);
    
    // Test 1: Try to register Terry Test User
    console.log('\n🧪 TEST 1: Registration with Terry Test User');
    const getStartedButton = await page.locator('button:has-text("Get Started")').first();
    if (await getStartedButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await getStartedButton.click();
      await page.waitForTimeout(3000);
      
      // Fill registration form with Terry Test User
      const nameField = await page.locator('input').filter({ hasText: /name/i }).or(page.locator('input[placeholder*="name" i]')).first();
      const emailField = await page.locator('input[type="email"]').first();
      const passwordField = await page.locator('input[type="password"]').first();
      const confirmPasswordField = await page.locator('input[type="password"]').nth(1);
      
      if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('📝 Found name field - filling registration...');
        await nameField.fill('Terry Test User');
        await emailField.fill('terry.test@example.com');
        await passwordField.fill('TerryTest123!');
        
        if (await confirmPasswordField.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmPasswordField.fill('TerryTest123!');
        }
        
        await page.screenshot({ path: '/root/repo/screenshots/convex-registration-filled.png', fullPage: true });
        
        // Submit registration
        const submitButton = await page.locator('button:has-text("Create account"), button[type="submit"]').first();
        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('🚀 Submitting registration...');
          await submitButton.click();
          await page.waitForTimeout(5000);
          await page.screenshot({ path: '/root/repo/screenshots/convex-registration-result.png', fullPage: true });
        }
      } else {
        console.log('⚠️ Could not find name field in registration form');
        await page.screenshot({ path: '/root/repo/screenshots/convex-registration-form.png', fullPage: true });
      }
    }
    
    // Test 2: Try to login with Terry Test User (if registration succeeded)
    console.log('\n🧪 TEST 2: Login with Terry Test User');
    // Navigate to sign in if not already there
    const signInLink = await page.locator('a:has-text("Sign in"), button:has-text("Sign in")').first();
    if (await signInLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signInLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Fill login form
    const emailLogin = await page.locator('input[type="email"]').first();
    const passwordLogin = await page.locator('input[type="password"]').first();
    
    if (await emailLogin.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('📝 Filling login form with Terry Test User...');
      await emailLogin.fill('terry.test@example.com');
      await passwordLogin.fill('TerryTest123!');
      
      await page.screenshot({ path: '/root/repo/screenshots/convex-login-terry-filled.png', fullPage: true });
      
      const loginButton = await page.locator('button:has-text("Sign in"), button[type="submit"]').first();
      if (await loginButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('🚀 Attempting login with Terry Test User...');
        await loginButton.click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: '/root/repo/screenshots/convex-login-terry-result.png', fullPage: true });
      }
    }
    
    // Test 3: Check if we need to go back and test with a different user
    console.log('\n🧪 TEST 3: Final state verification');
    console.log('📍 Final URL:', page.url());
    console.log('📄 Final page title:', await page.title());
    
    // Check for any success indicators
    const successIndicators = await page.locator('.success, .dashboard, .welcome, [class*="success"]').count();
    const errorIndicators = await page.locator('.error, .alert-error, [class*="error"]').count();
    
    console.log(`✅ Success indicators found: ${successIndicators}`);
    console.log(`❌ Error indicators found: ${errorIndicators}`);
    
    await page.screenshot({ path: '/root/repo/screenshots/convex-final-state.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Convex live test failed:', error.message);
    await page.screenshot({ path: '/root/repo/screenshots/convex-test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Convex live test completed');
  }
}

testConvexLive().catch(console.error);