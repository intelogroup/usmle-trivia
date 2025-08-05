import { chromium } from 'playwright';

async function testCompleteAuthFlow() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => console.log('🖥️ CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));

  try {
    console.log('🧪 Testing Complete Authentication Flow on Live Site...');
    console.log('🌐 Site: https://usmle-trivia.netlify.app');
    console.log('🔗 Backend: Convex (https://formal-sardine-916.convex.cloud)');
    
    // Navigate to the live site
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/root/repo/screenshots/complete-01-homepage.png', fullPage: true });
    
    // STEP 1: Test Registration
    console.log('\n📝 STEP 1: Testing Registration');
    const getStartedButton = await page.locator('button:has-text("Get Started")').first();
    await getStartedButton.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/root/repo/screenshots/complete-02-registration-form.png', fullPage: true });
    
    // Fill registration form with correct selectors
    console.log('📝 Filling registration form...');
    
    // Wait for form to load and fill fields
    await page.waitForSelector('input', { timeout: 10000 });
    
    const fullNameInput = await page.locator('input').first(); // First input should be Full Name
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInputs = await page.locator('input[type="password"]').all();
    
    await fullNameInput.fill('Terry Test User');
    await emailInput.fill('terry.test@example.com');
    await passwordInputs[0].fill('TerryTest123!'); // Password
    if (passwordInputs.length > 1) {
      await passwordInputs[1].fill('TerryTest123!'); // Confirm Password
    }
    
    await page.screenshot({ path: '/root/repo/screenshots/complete-03-registration-filled.png', fullPage: true });
    
    // Submit registration
    const createAccountButton = await page.locator('button:has-text("Create account")').first();
    console.log('🚀 Submitting registration...');
    await createAccountButton.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/root/repo/screenshots/complete-04-registration-result.png', fullPage: true });
    
    console.log('📍 After registration URL:', page.url());
    
    // STEP 2: Check if registration succeeded or failed
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/quiz')) {
      console.log('✅ Registration succeeded! User is logged in.');
      await page.screenshot({ path: '/root/repo/screenshots/complete-05-dashboard.png', fullPage: true });
    } else {
      console.log('⚠️ Registration may have failed or needs verification. Testing login...');
      
      // Navigate to login if not already there
      if (!currentUrl.includes('/login')) {
        const signInLink = await page.locator('a:has-text("Sign in")').first();
        if (await signInLink.isVisible({ timeout: 2000 }).catch(() => false)) {
          await signInLink.click();
          await page.waitForTimeout(2000);
        }
      }
      
      // STEP 3: Test Login
      console.log('\n🔑 STEP 3: Testing Login');
      await page.screenshot({ path: '/root/repo/screenshots/complete-06-login-form.png', fullPage: true });
      
      // Fill login form
      const loginEmailInput = await page.locator('input[type="email"]').first();
      const loginPasswordInput = await page.locator('input[type="password"]').first();
      
      console.log('📝 Filling login form with Terry Test User...');
      await loginEmailInput.fill('terry.test@example.com');
      await loginPasswordInput.fill('TerryTest123!');
      
      await page.screenshot({ path: '/root/repo/screenshots/complete-07-login-filled.png', fullPage: true });
      
      const signInButton = await page.locator('button:has-text("Sign in")').first();
      console.log('🚀 Attempting login...');
      await signInButton.click();
      await page.waitForTimeout(5000);
      await page.screenshot({ path: '/root/repo/screenshots/complete-08-login-result.png', fullPage: true });
      
      console.log('📍 After login URL:', page.url());
    }
    
    // STEP 4: Final State Analysis
    console.log('\n📊 STEP 4: Final State Analysis');
    const finalUrl = page.url();
    const finalTitle = await page.title();
    
    console.log('📍 Final URL:', finalUrl);
    console.log('📄 Final Title:', finalTitle);
    
    // Check for authentication success indicators
    const dashboardIndicators = await page.locator('[class*="dashboard"], [class*="welcome"], .user-info, .quiz-setup').count();
    const errorMessages = await page.locator('.error, [class*="error"], .alert-error').count();
    
    console.log(`✅ Dashboard/Success indicators: ${dashboardIndicators}`);
    console.log(`❌ Error messages: ${errorMessages}`);
    
    // Check for specific UI elements that indicate success
    const logoutButton = await page.locator('button:has-text("Logout"), button:has-text("Sign out")').count();
    const userMenu = await page.locator('.user-menu, [class*="user"], .avatar').count();
    
    console.log(`👤 User menu/logout elements: ${logoutButton + userMenu}`);
    
    await page.screenshot({ path: '/root/repo/screenshots/complete-09-final-state.png', fullPage: true });
    
    // STEP 5: Summary
    console.log('\n📋 STEP 5: Test Summary');
    console.log('=====================================');
    
    if (finalUrl.includes('/dashboard') || finalUrl.includes('/quiz') || dashboardIndicators > 0) {
      console.log('✅ AUTHENTICATION SUCCESS: User successfully logged in');
      console.log('✅ Backend: Convex is working correctly');
      console.log('✅ Registration/Login: Flow completed successfully');
    } else if (errorMessages > 0) {
      console.log('❌ AUTHENTICATION FAILED: Errors detected');
      console.log('⚠️ Backend: May have issues with user creation/authentication');
    } else {
      console.log('⚠️ AUTHENTICATION UNCLEAR: No clear success or failure indicators');
      console.log('🔍 May need manual verification or backend investigation');
    }
    
  } catch (error) {
    console.error('❌ Complete auth flow test failed:', error.message);
    await page.screenshot({ path: '/root/repo/screenshots/complete-ERROR.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Complete authentication flow test finished');
  }
}

testCompleteAuthFlow().catch(console.error);