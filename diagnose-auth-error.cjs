const { chromium } = require('playwright');
const fs = require('fs');

/**
 * Focused Authentication Error Diagnosis
 * Investigate the specific Convex auth error and test registration flow
 */
async function diagnoseAuthError() {
  const browser = await chromium.launch({ headless: true, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Capture console and network activity
  const logs = [];
  page.on('console', msg => {
    logs.push({
      type: 'console',
      level: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  const networkActivity = [];
  page.on('request', request => {
    networkActivity.push({
      type: 'request',
      method: request.method(),
      url: request.url(),
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('response', response => {
    networkActivity.push({
      type: 'response',
      status: response.status(),
      url: response.url(),
      timestamp: new Date().toISOString()
    });
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    logs: [],
    networkActivity: [],
    convexErrors: []
  };
  
  try {
    console.log('\n🔍 DIAGNOSING AUTHENTICATION ERRORS');
    console.log('='.repeat(50));
    
    // Test 1: Registration Process with Unique Email
    console.log('\n📝 TEST: New User Registration');
    const timestamp = Date.now();
    const testEmail = `auth-test-${timestamp}@medquiz.test`;
    const testName = `Test User ${timestamp}`;
    const testPassword = 'TestPass123!@#';
    
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    
    // Go to registration page
    await page.goto('https://usmle-trivia.netlify.app/register', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'auth-diagnosis-01-register-page.png', fullPage: true });
    
    // Find and fill form fields
    const nameField = await page.$('input[placeholder*="name" i], input[name*="name" i], input[id*="name" i]');
    const emailField = await page.$('input[type="email"], input[placeholder*="email" i]');
    const passwordField = await page.$('input[type="password"]:nth-of-type(1)');
    const confirmPasswordField = await page.$('input[type="password"]:nth-of-type(2)');
    
    if (nameField) {
      await nameField.fill(testName);
      console.log('   ✅ Name field filled');
    } else {
      console.log('   ❌ Name field not found');
    }
    
    if (emailField) {
      await emailField.fill(testEmail);
      console.log('   ✅ Email field filled');
    } else {
      console.log('   ❌ Email field not found');
    }
    
    if (passwordField) {
      await passwordField.fill(testPassword);
      console.log('   ✅ Password field filled');
    } else {
      console.log('   ❌ Password field not found');
    }
    
    if (confirmPasswordField) {
      await confirmPasswordField.fill(testPassword);
      console.log('   ✅ Confirm password field filled');
    } else {
      console.log('   ❌ Confirm password field not found');
    }
    
    await page.screenshot({ path: 'auth-diagnosis-02-form-filled.png', fullPage: true });
    
    // Clear logs before submission
    logs.length = 0;
    networkActivity.length = 0;
    
    // Submit registration
    const submitButton = await page.$('button[type="submit"], button:has-text("Create"), button:has-text("Register")');
    if (submitButton) {
      await submitButton.click();
      console.log('   ✅ Registration submitted');
    } else {
      console.log('   ❌ Submit button not found');
    }
    
    // Wait for response
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'auth-diagnosis-03-registration-result.png', fullPage: true });
    
    const regUrl = page.url();
    const regContent = await page.textContent('body').catch(() => '');
    
    // Look for success or error indicators
    const hasRegError = regContent.toLowerCase().includes('error') || 
                       regContent.toLowerCase().includes('failed');
    const hasRegSuccess = regUrl.includes('dashboard') || 
                         regContent.toLowerCase().includes('welcome');
    
    results.tests.push({
      name: 'Registration Test',
      status: hasRegError ? 'FAILED' : (hasRegSuccess ? 'SUCCESS' : 'UNCLEAR'),
      details: {
        testEmail,
        currentUrl: regUrl,
        hasError: hasRegError,
        hasSuccess: hasRegSuccess,
        formFieldsFound: {
          name: !!nameField,
          email: !!emailField,
          password: !!passwordField,
          confirmPassword: !!confirmPasswordField,
          submit: !!submitButton
        }
      }
    });
    
    console.log(`   Result: ${hasRegError ? 'FAILED' : (hasRegSuccess ? 'SUCCESS' : 'UNCLEAR')}`);
    console.log(`   Current URL: ${regUrl}`);
    
    // Test 2: Login with Known Credentials and Error Analysis
    console.log('\n🔐 TEST: Login Error Analysis');
    
    await page.goto('https://usmle-trivia.netlify.app/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'auth-diagnosis-04-login-page.png', fullPage: true });
    
    // Fill login form
    await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    
    await page.screenshot({ path: 'auth-diagnosis-05-login-filled.png', fullPage: true });
    
    // Clear logs before submission
    logs.length = 0;
    networkActivity.length = 0;
    
    // Submit login
    await page.click('button[type="submit"], button:has-text("Sign")');
    
    // Wait and capture the error
    await page.waitForTimeout(8000); // Wait longer for error to appear
    await page.screenshot({ path: 'auth-diagnosis-06-login-error.png', fullPage: true });
    
    const loginUrl = page.url();
    const loginContent = await page.textContent('body').catch(() => '');
    
    // Look for specific Convex error
    const convexErrorMatch = loginContent.match(/\\[CONVEX.*?\\]/g) || [];
    const hasAuthError = loginContent.includes('Server Error') || 
                        loginContent.includes('CONVEX') ||
                        loginContent.includes('signin');
    
    results.tests.push({
      name: 'Login Error Analysis',
      status: hasAuthError ? 'ERROR_DETECTED' : 'NO_ERROR',
      details: {
        currentUrl: loginUrl,
        convexErrors: convexErrorMatch,
        hasAuthError,
        credentials: 'jayveedz19@gmail.com / Jimkali90#'
      }
    });
    
    console.log(`   Convex errors detected: ${convexErrorMatch.length}`);
    convexErrorMatch.forEach(error => {
      console.log(`   Error: ${error}`);
      results.convexErrors.push(error);
    });
    
    // Test 3: Network Request Analysis
    console.log('\n🌐 TEST: Network Request Analysis');
    
    const convexRequests = networkActivity.filter(activity => 
      activity.url.includes('convex') || 
      activity.url.includes('auth')
    );
    
    const failedRequests = networkActivity.filter(activity => 
      activity.type === 'response' && activity.status >= 400
    );
    
    results.tests.push({
      name: 'Network Analysis',
      status: failedRequests.length > 0 ? 'NETWORK_ERRORS' : 'NETWORK_OK',
      details: {
        totalRequests: networkActivity.filter(a => a.type === 'request').length,
        convexRequests: convexRequests.length,
        failedRequests: failedRequests.length,
        failedUrls: failedRequests.map(r => r.url)
      }
    });
    
    console.log(`   Total network requests: ${networkActivity.filter(a => a.type === 'request').length}`);
    console.log(`   Convex requests: ${convexRequests.length}`);
    console.log(`   Failed requests: ${failedRequests.length}`);
    
    // Test 4: Console Error Analysis  
    console.log('\n📝 TEST: Console Log Analysis');
    
    const jsErrors = logs.filter(log => log.level === 'error');
    const authRelatedLogs = logs.filter(log => 
      log.text.toLowerCase().includes('auth') ||
      log.text.toLowerCase().includes('convex') ||
      log.text.toLowerCase().includes('signin')
    );
    
    results.tests.push({
      name: 'Console Analysis',
      status: jsErrors.length > 0 ? 'JS_ERRORS' : 'CONSOLE_CLEAN',
      details: {
        totalLogs: logs.length,
        jsErrors: jsErrors.length,
        authRelatedLogs: authRelatedLogs.length,
        errorMessages: jsErrors.map(e => e.text),
        authMessages: authRelatedLogs.map(a => a.text)
      }
    });
    
    console.log(`   JavaScript errors: ${jsErrors.length}`);
    console.log(`   Auth-related logs: ${authRelatedLogs.length}`);
    
    jsErrors.forEach(error => {
      console.log(`   JS Error: ${error.text}`);
    });
    
    authRelatedLogs.forEach(log => {
      console.log(`   Auth Log: ${log.text}`);
    });
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    results.tests.push({
      name: 'Test Execution',
      status: 'FAILED',
      error: error.message
    });
  } finally {
    await browser.close();
  }
  
  // Store all captured data
  results.logs = logs;
  results.networkActivity = networkActivity;
  
  // Save detailed results
  fs.writeFileSync('auth-diagnosis-detailed-report.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n📊 AUTHENTICATION DIAGNOSIS SUMMARY');
  console.log('='.repeat(60));
  
  const testResults = results.tests;
  const errorCount = results.convexErrors.length;
  const networkErrors = results.networkActivity.filter(a => 
    a.type === 'response' && a.status >= 400
  ).length;
  const jsErrors = results.logs.filter(l => l.level === 'error').length;
  
  console.log(`🔍 Tests Completed: ${testResults.length}`);
  console.log(`❌ Convex Errors: ${errorCount}`);
  console.log(`🌐 Network Errors: ${networkErrors}`);
  console.log(`📝 JavaScript Errors: ${jsErrors}`);
  
  testResults.forEach(test => {
    const icon = test.status.includes('SUCCESS') ? '✅' :
                 test.status.includes('ERROR') ? '❌' :
                 test.status.includes('FAILED') ? '❌' : '⚠️';
    console.log(`${icon} ${test.name}: ${test.status}`);
  });
  
  if (results.convexErrors.length > 0) {
    console.log('\n🚨 CONVEX ERRORS DETECTED:');
    results.convexErrors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }
  
  console.log(`\n📄 Detailed report saved: auth-diagnosis-detailed-report.json`);
  console.log(`📷 Screenshots saved: auth-diagnosis-*.png`);
  
  return results;
}

// Run the diagnosis
diagnoseAuthError().catch(console.error);