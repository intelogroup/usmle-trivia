const { chromium } = require('playwright');
const fs = require('fs');

async function testProductionAuthFix() {
  console.log('🚀 Starting Production Authentication Fix Test...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // Track network requests to monitor API calls
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('convex') || request.url().includes('auth')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Track console logs and errors
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    const message = `${msg.type()}: ${msg.text()}`;
    consoleLogs.push(message);
    console.log(`[CONSOLE] ${message}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`[ERROR] ${error.message}`);
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    testResults: {},
    networkRequests: [],
    consoleLogs: [],
    errors: [],
    screenshots: []
  };
  
  try {
    // Test 1: Navigate to homepage
    console.log('📍 Test 1: Navigating to production homepage...');
    await page.goto('https://usmle-trivia.netlify.app', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'auth-fix-01-homepage.png' });
    results.screenshots.push('auth-fix-01-homepage.png');
    
    // Check if the page loads without JavaScript errors
    const pageTitle = await page.title();
    console.log(`✅ Homepage loaded: ${pageTitle}`);
    results.testResults.homepageLoad = {
      success: true,
      title: pageTitle,
      errors: errors.length === 0 ? [] : [...errors]
    };
    
    // Test 2: Navigate to registration page
    console.log('📍 Test 2: Navigating to registration page...');
    await page.click('a[href="/register"]', { timeout: 10000 });
    await page.waitForURL('**/register', { timeout: 10000 });
    await page.screenshot({ path: 'auth-fix-02-register-page.png' });
    results.screenshots.push('auth-fix-02-register-page.png');
    
    console.log('✅ Registration page loaded successfully');
    results.testResults.registerPageLoad = { success: true };
    
    // Test 3: Fill registration form with new credentials
    console.log('📍 Test 3: Testing registration with new credentials...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testEmail = `fixed-auth-${timestamp}@medquiz.test`;
    const testName = 'Fixed Auth Test User';
    const testPassword = 'FixedAuth2025!';
    
    console.log(`Using test credentials: ${testEmail}`);
    
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.screenshot({ path: 'auth-fix-03-form-filled.png' });
    results.screenshots.push('auth-fix-03-form-filled.png');
    
    // Test 4: Submit registration form
    console.log('📍 Test 4: Submitting registration form...');
    const initialErrorCount = errors.length;
    
    // Monitor for the specific "n is not a function" error
    let hasNFunctionError = false;
    page.on('pageerror', error => {
      if (error.message.includes('n is not a function')) {
        hasNFunctionError = true;
        console.error('❌ DETECTED: "n is not a function" error still present!');
      }
    });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000); // Wait for potential errors or success
    
    await page.screenshot({ path: 'auth-fix-04-after-registration.png' });
    results.screenshots.push('auth-fix-04-after-registration.png');
    
    const newErrors = errors.slice(initialErrorCount);
    results.testResults.registration = {
      email: testEmail,
      hasNFunctionError: hasNFunctionError,
      newErrors: newErrors,
      networkRequests: networkRequests.filter(req => 
        req.timestamp > results.timestamp && 
        (req.url.includes('signUp') || req.url.includes('auth'))
      )
    };
    
    console.log(`📊 Registration attempt completed. New errors: ${newErrors.length}`);
    console.log(`🔍 "n is not a function" error detected: ${hasNFunctionError}`);
    
    // Test 5: Check if redirected to dashboard (success) or still on register page (error)
    const currentUrl = page.url();
    const isOnDashboard = currentUrl.includes('/dashboard') || currentUrl.includes('/quiz');
    const registrationSuccess = isOnDashboard && !hasNFunctionError && newErrors.length === 0;
    
    console.log(`📍 Current URL after registration: ${currentUrl}`);
    console.log(`✅ Registration success: ${registrationSuccess}`);
    
    results.testResults.registrationSuccess = {
      success: registrationSuccess,
      currentUrl: currentUrl,
      redirectedToDashboard: isOnDashboard
    };
    
    let loginTestCredentials = null;
    
    if (registrationSuccess) {
      console.log('🎉 Registration successful! Testing logout and login...');
      loginTestCredentials = { email: testEmail, password: testPassword };
      
      // Test logout if available
      try {
        await page.click('button:has-text("Logout")', { timeout: 5000 });
        await page.waitForURL('**/login', { timeout: 5000 });
        console.log('✅ Logout successful');
        results.testResults.logout = { success: true };
      } catch (error) {
        console.log('⚠️  Logout button not found or failed, continuing to login test...');
        await page.goto('https://usmle-trivia.netlify.app/login');
      }
    } else {
      console.log('⚠️  Registration failed, testing with existing credentials...');
      await page.goto('https://usmle-trivia.netlify.app/login');
      loginTestCredentials = { email: 'jayveedz19@gmail.com', password: 'Jimkali90#' };
    }
    
    // Test 6: Login test
    console.log('📍 Test 6: Testing login functionality...');
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.screenshot({ path: 'auth-fix-05-login-page.png' });
    results.screenshots.push('auth-fix-05-login-page.png');
    
    const loginInitialErrorCount = errors.length;
    let hasConvexServerError = false;
    
    page.on('pageerror', error => {
      if (error.message.includes('[CONVEX A(auth:signIn)] Server Error')) {
        hasConvexServerError = true;
        console.error('❌ DETECTED: "[CONVEX A(auth:signIn)] Server Error" still present!');
      }
    });
    
    await page.fill('input[name="email"]', loginTestCredentials.email);
    await page.fill('input[name="password"]', loginTestCredentials.password);
    await page.screenshot({ path: 'auth-fix-06-login-filled.png' });
    results.screenshots.push('auth-fix-06-login-filled.png');
    
    console.log(`🔐 Attempting login with: ${loginTestCredentials.email}`);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'auth-fix-07-after-login.png' });
    results.screenshots.push('auth-fix-07-after-login.png');
    
    const loginNewErrors = errors.slice(loginInitialErrorCount);
    const loginCurrentUrl = page.url();
    const loginSuccess = (loginCurrentUrl.includes('/dashboard') || loginCurrentUrl.includes('/quiz')) 
                        && !hasConvexServerError && loginNewErrors.length === 0;
    
    results.testResults.login = {
      email: loginTestCredentials.email,
      success: loginSuccess,
      hasConvexServerError: hasConvexServerError,
      newErrors: loginNewErrors,
      currentUrl: loginCurrentUrl,
      networkRequests: networkRequests.filter(req => 
        req.url.includes('signIn') || req.url.includes('auth')
      ).slice(-5) // Last 5 auth requests
    };
    
    console.log(`🔐 Login attempt completed. Success: ${loginSuccess}`);
    console.log(`🔍 Convex server error detected: ${hasConvexServerError}`);
    console.log(`📍 Final URL: ${loginCurrentUrl}`);
    
    // Test 7: Verify user is logged in (check for user menu or profile)
    if (loginSuccess) {
      console.log('📍 Test 7: Verifying user session...');
      try {
        // Look for user menu or welcome message
        await page.waitForSelector('[data-testid="user-menu"], .user-menu, button:has-text("Jay"), div:has-text("Welcome")', { timeout: 10000 });
        console.log('✅ User session verified - user menu or welcome message found');
        results.testResults.sessionVerification = { success: true };
      } catch (error) {
        console.log('⚠️  User session verification inconclusive');
        results.testResults.sessionVerification = { success: false, error: error.message };
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'auth-fix-08-final-state.png' });
    results.screenshots.push('auth-fix-08-final-state.png');
    
  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    results.errors.push(`Test execution error: ${error.message}`);
    
    // Emergency screenshot
    try {
      await page.screenshot({ path: 'auth-fix-error.png' });
      results.screenshots.push('auth-fix-error.png');
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError.message);
    }
  } finally {
    // Collect final results
    results.networkRequests = networkRequests;
    results.consoleLogs = consoleLogs;
    results.errors = errors;
    
    // Generate summary
    const summary = {
      testTimestamp: results.timestamp,
      overallSuccess: {
        homepageLoaded: results.testResults.homepageLoad?.success || false,
        registrationPageLoaded: results.testResults.registerPageLoad?.success || false,
        registrationWorking: results.testResults.registrationSuccess?.success || false,
        loginWorking: results.testResults.login?.success || false,
        sessionVerified: results.testResults.sessionVerification?.success || false
      },
      criticalErrorsFixed: {
        nFunctionErrorResolved: !results.testResults.registration?.hasNFunctionError,
        convexServerErrorResolved: !results.testResults.login?.hasConvexServerError
      },
      totalErrors: errors.length,
      totalNetworkRequests: networkRequests.length,
      screenshotsTaken: results.screenshots.length
    };
    
    results.summary = summary;
    
    // Save detailed results
    fs.writeFileSync('auth-fix-test-results.json', JSON.stringify(results, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('🔍 PRODUCTION AUTHENTICATION FIX TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`📅 Test completed at: ${results.timestamp}`);
    console.log(`🏠 Homepage loaded: ${summary.overallSuccess.homepageLoaded ? '✅ YES' : '❌ NO'}`);
    console.log(`📝 Registration page loaded: ${summary.overallSuccess.registrationPageLoaded ? '✅ YES' : '❌ NO'}`);
    console.log(`👤 Registration working: ${summary.overallSuccess.registrationWorking ? '✅ YES' : '❌ NO'}`);
    console.log(`🔐 Login working: ${summary.overallSuccess.loginWorking ? '✅ YES' : '❌ NO'}`);
    console.log(`✅ Session verified: ${summary.overallSuccess.sessionVerified ? '✅ YES' : '❌ NO'}`);
    console.log('\n🐛 CRITICAL ERRORS STATUS:');
    console.log(`   "n is not a function" resolved: ${summary.criticalErrorsFixed.nFunctionErrorResolved ? '✅ FIXED' : '❌ STILL PRESENT'}`);
    console.log(`   "[CONVEX A(auth:signIn)] Server Error" resolved: ${summary.criticalErrorsFixed.convexServerErrorResolved ? '✅ FIXED' : '❌ STILL PRESENT'}`);
    console.log(`\n📊 STATISTICS:`);
    console.log(`   Total errors detected: ${summary.totalErrors}`);
    console.log(`   Network requests monitored: ${summary.totalNetworkRequests}`);
    console.log(`   Screenshots captured: ${summary.screenshotsTaken}`);
    console.log('\n📸 Screenshots saved:');
    results.screenshots.forEach(screenshot => console.log(`   - ${screenshot}`));
    console.log('\n💾 Detailed results saved to: auth-fix-test-results.json');
    console.log('='.repeat(80));
    
    await browser.close();
    return results;
  }
}

// Run the test
testProductionAuthFix()
  .then(results => {
    const overallSuccess = Object.values(results.summary.overallSuccess).every(success => success);
    const criticalErrorsFixed = Object.values(results.summary.criticalErrorsFixed).every(fixed => fixed);
    
    if (overallSuccess && criticalErrorsFixed) {
      console.log('\n🎉 ALL TESTS PASSED! Authentication fixes are working correctly!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed or critical errors persist. Check results above.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });