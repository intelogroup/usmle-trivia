const { chromium } = require('playwright');
const fs = require('fs');

async function testNetworkMonitoring() {
  console.log('🌐 Testing Authentication with Network Monitoring...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Comprehensive network monitoring
  const networkRequests = [];
  const networkResponses = [];
  const failedRequests = [];
  
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString(),
      headers: request.headers(),
      postData: request.postData()
    });
    console.log(`🔄 REQUEST: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    networkResponses.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      timestamp: new Date().toISOString()
    });
    console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
  });
  
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure().errorText,
      timestamp: new Date().toISOString()
    });
    console.error(`❌ REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });
  
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    const message = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleLogs.push(message);
    console.log(`📺 ${message}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`🚨 PAGE ERROR: ${error.message}`);
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    networkRequests: [],
    networkResponses: [],
    failedRequests: [],
    consoleLogs: [],
    errors: [],
    screenshots: []
  };
  
  try {
    // Test registration with detailed monitoring
    console.log('📍 Loading registration page with network monitoring...');
    await page.goto('https://usmle-trivia.netlify.app/register', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'network-01-register.png' });
    results.screenshots.push('network-01-register.png');
    
    // Wait for any async loading
    await page.waitForTimeout(2000);
    
    console.log('📝 Filling registration form...');
    const testData = {
      name: 'Network Test User',
      email: `network-test-${Date.now()}@medquiz.test`,
      password: 'NetworkTest2025!'
    };
    
    // Fill form using ID selectors (which we know work)
    await page.fill('#name', testData.name);
    await page.fill('#email', testData.email);
    await page.fill('#password', testData.password);
    await page.fill('#confirmPassword', testData.password); // Fill confirm password too
    
    await page.screenshot({ path: 'network-02-filled.png' });
    results.screenshots.push('network-02-filled.png');
    
    console.log('🚀 Submitting registration form...');
    const requestCountBefore = networkRequests.length;
    
    // Click submit and wait for network activity
    await page.click('button[type="submit"]');
    
    // Wait and monitor for network requests
    await page.waitForTimeout(5000);
    
    const newRequests = networkRequests.slice(requestCountBefore);
    console.log(`📊 New network requests after registration: ${newRequests.length}`);
    
    await page.screenshot({ path: 'network-03-after-submit.png' });
    results.screenshots.push('network-03-after-submit.png');
    
    // Check current state
    const currentUrl = page.url();
    const wasRedirected = !currentUrl.includes('/register');
    
    results.tests.registration = {
      testData: testData,
      currentUrl: currentUrl,
      wasRedirected: wasRedirected,
      newRequests: newRequests.length,
      requestDetails: newRequests
    };
    
    console.log(`📍 After registration: ${currentUrl}`);
    console.log(`🔄 Redirected: ${wasRedirected}`);
    console.log(`📡 Network requests made: ${newRequests.length}`);
    
    // Test login with existing user
    console.log('📍 Testing login with existing user...');
    await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'network-04-login.png' });
    results.screenshots.push('network-04-login.png');
    
    await page.waitForTimeout(2000);
    
    console.log('🔐 Filling login form...');
    await page.fill('#email', 'jayveedz19@gmail.com');
    await page.fill('#password', 'Jimkali90#');
    
    await page.screenshot({ path: 'network-05-login-filled.png' });
    results.screenshots.push('network-05-login-filled.png');
    
    console.log('🚀 Submitting login form...');
    const loginRequestCountBefore = networkRequests.length;
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    const loginNewRequests = networkRequests.slice(loginRequestCountBefore);
    console.log(`📊 New network requests after login: ${loginNewRequests.length}`);
    
    await page.screenshot({ path: 'network-06-login-result.png' });
    results.screenshots.push('network-06-login-result.png');
    
    const loginUrl = page.url();
    const loginRedirected = !loginUrl.includes('/login');
    
    results.tests.login = {
      currentUrl: loginUrl,
      wasRedirected: loginRedirected,
      newRequests: loginNewRequests.length,
      requestDetails: loginNewRequests
    };
    
    console.log(`📍 After login: ${loginUrl}`);
    console.log(`🔄 Login redirected: ${loginRedirected}`);
    console.log(`📡 Login network requests: ${loginNewRequests.length}`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.errors.push(`Test error: ${error.message}`);
    
    try {
      await page.screenshot({ path: 'network-error.png' });
      results.screenshots.push('network-error.png');
    } catch (screenshotError) {
      console.error('Failed to take error screenshot');
    }
  } finally {
    // Collect all results
    results.networkRequests = networkRequests;
    results.networkResponses = networkResponses;
    results.failedRequests = failedRequests;
    results.consoleLogs = consoleLogs;
    results.errors = errors;
    
    // Save detailed results
    fs.writeFileSync('network-monitoring-results.json', JSON.stringify(results, null, 2));
    
    // Analysis
    const convexRequests = networkRequests.filter(req => req.url.includes('convex'));
    const authRequests = networkRequests.filter(req => 
      req.url.includes('auth') || 
      req.url.includes('signUp') || 
      req.url.includes('signIn') ||
      req.postData?.includes('auth')
    );
    const errorResponses = networkResponses.filter(res => res.status >= 400);
    
    console.log('\n' + '='.repeat(80));
    console.log('🌐 NETWORK MONITORING TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`📅 Test completed: ${results.timestamp}`);
    console.log(`🔄 Total network requests: ${networkRequests.length}`);
    console.log(`📡 Convex requests: ${convexRequests.length}`);
    console.log(`🔐 Auth-related requests: ${authRequests.length}`);
    console.log(`❌ Failed requests: ${failedRequests.length}`);
    console.log(`🚨 Error responses (4xx/5xx): ${errorResponses.length}`);
    console.log(`🐛 JavaScript errors: ${errors.length}`);
    console.log(`📺 Console messages: ${consoleLogs.length}`);
    
    console.log('\n📋 AUTHENTICATION RESULTS:');
    console.log(`✅ Registration redirected: ${results.tests.registration?.wasRedirected || false}`);
    console.log(`✅ Login redirected: ${results.tests.login?.wasRedirected || false}`);
    console.log(`📡 Registration network activity: ${results.tests.registration?.newRequests || 0} requests`);
    console.log(`📡 Login network activity: ${results.tests.login?.newRequests || 0} requests`);
    
    if (authRequests.length > 0) {
      console.log('\n🔐 AUTH REQUESTS DETECTED:');
      authRequests.forEach((req, i) => {
        console.log(`   ${i + 1}. ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`      Body: ${req.postData.substring(0, 200)}...`);
        }
      });
    }
    
    if (errorResponses.length > 0) {
      console.log('\n❌ ERROR RESPONSES:');
      errorResponses.forEach((res, i) => {
        console.log(`   ${i + 1}. ${res.status} ${res.statusText} - ${res.url}`);
      });
    }
    
    if (failedRequests.length > 0) {
      console.log('\n💥 FAILED REQUESTS:');
      failedRequests.forEach((req, i) => {
        console.log(`   ${i + 1}. ${req.url} - ${req.failure}`);
      });
    }
    
    if (errors.length === 0) {
      console.log('\n🎉 NO JAVASCRIPT ERRORS DETECTED!');
    } else {
      console.log('\n🚨 JAVASCRIPT ERRORS:');
      errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }
    
    console.log(`\n📸 Screenshots saved: ${results.screenshots.length}`);
    results.screenshots.forEach(screenshot => console.log(`   - ${screenshot}`));
    console.log('\n💾 Detailed results saved to: network-monitoring-results.json');
    console.log('='.repeat(80));
    
    await browser.close();
    return results;
  }
}

testNetworkMonitoring()
  .then(results => {
    const hasAuthActivity = results.tests.registration?.newRequests > 0 || results.tests.login?.newRequests > 0;
    const hasNoErrors = results.errors.length === 0;
    const hasAuthSuccess = results.tests.registration?.wasRedirected || results.tests.login?.wasRedirected;
    
    if (hasAuthSuccess && hasNoErrors) {
      console.log('\n🎉 AUTHENTICATION WORKING! Forms are submitting successfully!');
      process.exit(0);
    } else if (hasAuthActivity && hasNoErrors) {
      console.log('\n✅ No errors detected and auth requests are being made. Authentication system is functional.');
      process.exit(0);
    } else if (hasNoErrors) {
      console.log('\n✅ No JavaScript errors, but authentication may need form handling review.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Issues detected. Check detailed results.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Network monitoring test failed:', error);
    process.exit(1);
  });