import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages and errors
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    console.log(`🖥️ Console [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  page.on('requestfailed', request => {
    console.log(`🚫 Failed Request: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });
  
  try {
    console.log('🔍 MedQuiz Pro Error Detection & Authentication Test');
    
    // Navigate to the app
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(3000);
    
    console.log('\n📊 Initial Load Analysis');
    await page.screenshot({ path: '/tmp/error-test-01-initial.png', fullPage: true });
    
    // Check authentication state
    const hasLogin = await page.locator('text="Login"').count() > 0;
    const hasRegister = await page.locator('text="Register"').count() > 0;
    const hasDashboard = await page.locator('text="Dashboard"').count() > 0;
    
    console.log(`🔐 Auth State: Login=${hasLogin}, Register=${hasRegister}, Dashboard=${hasDashboard}`);
    
    if (hasLogin) {
      console.log('\n🔐 Testing Login Flow');
      await page.locator('text="Login"').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/error-test-02-login-form.png', fullPage: true });
      
      // Try to fill login form
      const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
      const passwordField = page.locator('input[type="password"], input[name="password"]').first();
      
      if (await emailField.isVisible()) {
        console.log('✅ Found email field, filling with test credentials');
        await emailField.fill('test@example.com');
        await passwordField.fill('password123');
        
        const loginBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
        if (await loginBtn.isVisible()) {
          console.log('🚀 Attempting login...');
          await loginBtn.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: '/tmp/error-test-03-after-login.png', fullPage: true });
        }
      }
    }
    
    if (hasRegister && !hasLogin) {
      console.log('\n📝 Testing Registration Flow');
      await page.locator('text="Register"').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/error-test-04-register-form.png', fullPage: true });
    }
    
    // Try to access quiz regardless of auth state
    console.log('\n🎯 Testing Quiz Access');
    
    // Go back to dashboard/home
    const dashboardLink = page.locator('text="Dashboard"').first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Try Quick Quiz again
    const quickQuiz = page.locator('text="Quick Quiz"').first();
    if (await quickQuiz.isVisible()) {
      console.log('🎯 Accessing Quick Quiz...');
      await quickQuiz.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/error-test-05-quiz-setup.png', fullPage: true });
      
      // Try to start quiz
      const startBtn = page.locator('text="Start Quiz"').first();
      if (await startBtn.isVisible()) {
        console.log('🚀 Starting quiz...');
        await startBtn.click();
        await page.waitForTimeout(5000); // Wait longer for quiz to load
        await page.screenshot({ path: '/tmp/error-test-06-quiz-engine.png', fullPage: true });
        
        // Check for error states
        const errorMessage = await page.locator('[role="alert"], .error, [class*="error"]').count();
        const loadingSpinner = await page.locator('[class*="loading"], [class*="spinner"]').count();
        
        console.log(`⚠️ Error elements: ${errorMessage}, Loading elements: ${loadingSpinner}`);
      }
    }
    
    // Network and console summary
    console.log('\n📋 Test Summary');
    console.log(`💬 Console messages: ${consoleMessages.length}`);
    console.log(`❌ JavaScript errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 JavaScript Errors Found:');
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.message}`);
      });
    }
    
    if (consoleMessages.filter(m => m.type === 'error').length > 0) {
      console.log('\n🚨 Console Errors:');
      consoleMessages.filter(m => m.type === 'error').forEach((msg, i) => {
        console.log(`${i + 1}. ${msg.text}`);
      });
    }
    
    await page.screenshot({ path: '/tmp/error-test-07-final.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: '/tmp/error-test-crash.png', fullPage: true });
  } finally {
    console.log('\n📁 Screenshots saved to /tmp/error-test-*.png');
    await browser.close();
  }
})();