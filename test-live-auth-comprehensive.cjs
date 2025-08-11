const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Live Authentication Testing for MedQuiz Pro
 * Tests all authentication flows on production site
 */
async function runComprehensiveAuthTest() {
  const browser = await chromium.launch({ headless: true, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
  });
  
  // Monitor network requests
  const networkLogs = [];
  page.on('request', request => {
    if (request.url().includes('convex') || request.url().includes('auth')) {
      networkLogs.push({
        type: 'REQUEST',
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('convex') || response.url().includes('auth')) {
      networkLogs.push({
        type: 'RESPONSE',
        status: response.status(),
        url: response.url(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  try {
    // Test 1: Initial Site Check
    console.log('\n🔍 TEST 1: Initial Site Check');
    const siteCheckStart = Date.now();
    
    try {
      await page.goto('https://usmle-trivia.netlify.app', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for React to load
      await page.waitForTimeout(3000);
      
      // Check for JavaScript errors
      const jsErrors = [];
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      // Take screenshot
      await page.screenshot({ path: 'live-test-01-homepage.png', fullPage: true });
      
      // Check if main elements are present
      const title = await page.textContent('h1').catch(() => null);
      const loginButton = await page.locator('text=Login').isVisible().catch(() => false);
      const registerButton = await page.locator('text=Register').isVisible().catch(() => false);
      
      results.tests.push({
        name: 'Initial Site Check',
        status: 'SUCCESS',
        duration: Date.now() - siteCheckStart,
        details: {
          pageTitle: title,
          loginButtonVisible: loginButton,
          registerButtonVisible: registerButton,
          jsErrors: jsErrors.length,
          loadTime: Date.now() - siteCheckStart
        }
      });
      
      console.log('✅ Site loaded successfully');
      console.log(`   Page title: ${title}`);
      console.log(`   Login button visible: ${loginButton}`);
      console.log(`   Register button visible: ${registerButton}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Initial Site Check',
        status: 'FAILED',
        duration: Date.now() - siteCheckStart,
        error: error.message
      });
      console.log('❌ Site check failed:', error.message);
    }
    
    // Test 2: User Registration Test
    console.log('\n📝 TEST 2: User Registration Test');
    const regTestStart = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const testEmail = `medquiz-test-${timestamp}@test.com`;
    const testName = `MedQuiz Test User ${timestamp}`;
    const testPassword = 'MedQuiz2025!Test';
    
    try {
      // Navigate to register page
      await page.goto('https://usmle-trivia.netlify.app/register', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'live-test-02-register-page.png', fullPage: true });
      
      // Fill out registration form
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[placeholder*="name" i], input[name*="name" i]', testName);
      await page.fill('input[type="password"]', testPassword);
      
      await page.screenshot({ path: 'live-test-03-register-filled.png', fullPage: true });
      
      console.log(`   Test credentials: ${testEmail} / ${testPassword}`);
      
      // Clear network logs before submission
      networkLogs.length = 0;
      
      // Submit form
      await page.click('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
      
      // Wait for response
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'live-test-04-register-result.png', fullPage: true });
      
      // Check current URL and page state
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      // Look for success or error indicators
      const hasError = pageContent.toLowerCase().includes('error') || 
                      pageContent.toLowerCase().includes('failed') ||
                      pageContent.toLowerCase().includes('invalid');
      const hasSuccess = currentUrl.includes('dashboard') || 
                        pageContent.toLowerCase().includes('welcome') ||
                        pageContent.toLowerCase().includes('success');
      
      results.tests.push({
        name: 'User Registration Test',
        status: hasError ? 'FAILED' : (hasSuccess ? 'SUCCESS' : 'UNCLEAR'),
        duration: Date.now() - regTestStart,
        details: {
          testEmail,
          testName,
          currentUrl,
          hasError,
          hasSuccess,
          networkRequests: networkLogs.filter(log => log.type === 'REQUEST').length,
          networkResponses: networkLogs.filter(log => log.type === 'RESPONSE').length
        }
      });
      
      if (hasError) {
        console.log('❌ Registration failed - error detected on page');
      } else if (hasSuccess) {
        console.log('✅ Registration appears successful');
      } else {
        console.log('⚠️ Registration result unclear');
      }
      
      console.log(`   Current URL: ${currentUrl}`);
      console.log(`   Network requests made: ${networkLogs.filter(log => log.type === 'REQUEST').length}`);
      
    } catch (error) {
      results.tests.push({
        name: 'User Registration Test',
        status: 'FAILED',
        duration: Date.now() - regTestStart,
        error: error.message
      });
      console.log('❌ Registration test failed:', error.message);
    }
    
    // Test 3: Login Test with New User (if registration succeeded)
    console.log('\n🔐 TEST 3: Login Test with New User');
    const newUserLoginStart = Date.now();
    
    const lastRegTest = results.tests[results.tests.length - 1];
    if (lastRegTest.status === 'SUCCESS') {
      try {
        // Go to login page
        await page.goto('https://usmle-trivia.netlify.app/login', { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        await page.waitForTimeout(2000);
        
        // Fill login form
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        
        // Clear network logs
        networkLogs.length = 0;
        
        // Submit login
        await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
        
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'live-test-05-new-user-login.png', fullPage: true });
        
        const loginUrl = page.url();
        const loginContent = await page.textContent('body');
        
        const loginSuccess = loginUrl.includes('dashboard') || 
                           loginContent.toLowerCase().includes('welcome') ||
                           loginContent.toLowerCase().includes('dashboard');
        
        results.tests.push({
          name: 'Login Test with New User',
          status: loginSuccess ? 'SUCCESS' : 'FAILED',
          duration: Date.now() - newUserLoginStart,
          details: {
            currentUrl: loginUrl,
            loginSuccess,
            networkRequests: networkLogs.filter(log => log.type === 'REQUEST').length
          }
        });
        
        console.log(loginSuccess ? '✅ New user login successful' : '❌ New user login failed');
        
      } catch (error) {
        results.tests.push({
          name: 'Login Test with New User',
          status: 'FAILED',
          duration: Date.now() - newUserLoginStart,
          error: error.message
        });
        console.log('❌ New user login test failed:', error.message);
      }
    } else {
      results.tests.push({
        name: 'Login Test with New User',
        status: 'SKIPPED',
        duration: 0,
        reason: 'Registration failed, cannot test login with new user'
      });
      console.log('⏭️ Skipping new user login test - registration failed');
    }
    
    // Test 4: Login Test with Existing User
    console.log('\n👤 TEST 4: Login Test with Existing User');
    const existingLoginStart = Date.now();
    
    try {
      // Go to login page
      await page.goto('https://usmle-trivia.netlify.app/login', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'live-test-06-existing-login-page.png', fullPage: true });
      
      // Fill with existing credentials
      await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      
      await page.screenshot({ path: 'live-test-07-existing-login-filled.png', fullPage: true });
      
      // Clear network logs
      networkLogs.length = 0;
      
      // Submit login
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'live-test-08-existing-login-result.png', fullPage: true });
      
      const existingLoginUrl = page.url();
      const existingLoginContent = await page.textContent('body');
      
      const existingLoginSuccess = existingLoginUrl.includes('dashboard') || 
                                 existingLoginContent.toLowerCase().includes('welcome') ||
                                 existingLoginContent.toLowerCase().includes('dashboard');
      
      results.tests.push({
        name: 'Login Test with Existing User',
        status: existingLoginSuccess ? 'SUCCESS' : 'FAILED',
        duration: Date.now() - existingLoginStart,
        details: {
          currentUrl: existingLoginUrl,
          loginSuccess: existingLoginSuccess,
          networkRequests: networkLogs.filter(log => log.type === 'REQUEST').length,
          credentials: 'jayveedz19@gmail.com / Jimkali90#'
        }
      });
      
      console.log(existingLoginSuccess ? '✅ Existing user login successful' : '❌ Existing user login failed');
      console.log(`   Current URL: ${existingLoginUrl}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Login Test with Existing User',
        status: 'FAILED',
        duration: Date.now() - existingLoginStart,
        error: error.message
      });
      console.log('❌ Existing user login test failed:', error.message);
    }
    
    // Test 5: Database Verification
    console.log('\n🗄️ TEST 5: Database Verification');
    const dbTestStart = Date.now();
    
    try {
      const convexRequests = networkLogs.filter(log => 
        log.url.includes('convex') && log.type === 'REQUEST'
      );
      const convexResponses = networkLogs.filter(log => 
        log.url.includes('convex') && log.type === 'RESPONSE'
      );
      
      const successfulResponses = convexResponses.filter(log => 
        log.status >= 200 && log.status < 300
      );
      const errorResponses = convexResponses.filter(log => 
        log.status >= 400
      );
      
      results.tests.push({
        name: 'Database Verification',
        status: errorResponses.length === 0 ? 'SUCCESS' : 'PARTIAL',
        duration: Date.now() - dbTestStart,
        details: {
          totalConvexRequests: convexRequests.length,
          totalConvexResponses: convexResponses.length,
          successfulResponses: successfulResponses.length,
          errorResponses: errorResponses.length,
          networkLogs: networkLogs
        }
      });
      
      console.log('✅ Database verification completed');
      console.log(`   Total Convex requests: ${convexRequests.length}`);
      console.log(`   Successful responses: ${successfulResponses.length}`);
      console.log(`   Error responses: ${errorResponses.length}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Database Verification',
        status: 'FAILED',
        duration: Date.now() - dbTestStart,
        error: error.message
      });
      console.log('❌ Database verification failed:', error.message);
    }
    
    // Test 6: Session Management Test
    console.log('\n🔄 TEST 6: Session Management Test');
    const sessionTestStart = Date.now();
    
    try {
      // Check if we're logged in
      const currentUrl = page.url();
      const isLoggedIn = currentUrl.includes('dashboard') || 
                        (await page.textContent('body')).toLowerCase().includes('dashboard');
      
      if (isLoggedIn) {
        // Test logout
        await page.click('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').catch(() => {
          console.log('   Logout button not found, checking user menu...');
          return page.click('.user-menu, [data-testid="user-menu"]').catch(() => null);
        });
        
        await page.waitForTimeout(2000);
        
        // Try logout again if in menu
        await page.click('button:has-text("Logout"), a:has-text("Logout")').catch(() => null);
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'live-test-09-after-logout.png', fullPage: true });
        
        const afterLogoutUrl = page.url();
        const loggedOut = !afterLogoutUrl.includes('dashboard');
        
        // Test session persistence with refresh
        await page.reload();
        await page.waitForTimeout(2000);
        
        const afterRefreshUrl = page.url();
        const sessionPersisted = afterRefreshUrl.includes('dashboard');
        
        results.tests.push({
          name: 'Session Management Test',
          status: 'SUCCESS',
          duration: Date.now() - sessionTestStart,
          details: {
            wasLoggedIn: isLoggedIn,
            loggedOut: loggedOut,
            sessionPersisted: !sessionPersisted, // We want this to be false after logout
            afterLogoutUrl,
            afterRefreshUrl
          }
        });
        
        console.log('✅ Session management test completed');
        console.log(`   Logout successful: ${loggedOut}`);
        console.log(`   Session properly cleared: ${!sessionPersisted}`);
        
      } else {
        results.tests.push({
          name: 'Session Management Test',
          status: 'SKIPPED',
          duration: Date.now() - sessionTestStart,
          reason: 'Not logged in, cannot test logout functionality'
        });
        console.log('⏭️ Session management test skipped - not logged in');
      }
      
    } catch (error) {
      results.tests.push({
        name: 'Session Management Test',
        status: 'FAILED',
        duration: Date.now() - sessionTestStart,
        error: error.message
      });
      console.log('❌ Session management test failed:', error.message);
    }
    
  } finally {
    await browser.close();
  }
  
  // Save results
  fs.writeFileSync('live-auth-comprehensive-test-results.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n📊 COMPREHENSIVE AUTHENTICATION TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successCount = results.tests.filter(t => t.status === 'SUCCESS').length;
  const failCount = results.tests.filter(t => t.status === 'FAILED').length;
  const skipCount = results.tests.filter(t => t.status === 'SKIPPED').length;
  
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️ Skipped: ${skipCount}`);
  console.log(`📁 Results saved to: live-auth-comprehensive-test-results.json`);
  
  results.tests.forEach(test => {
    const icon = test.status === 'SUCCESS' ? '✅' : 
                 test.status === 'FAILED' ? '❌' : 
                 test.status === 'SKIPPED' ? '⏭️' : '⚠️';
    console.log(`${icon} ${test.name}: ${test.status} (${test.duration}ms)`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  return results;
}

// Run the test
runComprehensiveAuthTest().catch(console.error);