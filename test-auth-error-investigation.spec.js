import { test, expect } from '@playwright/test';

test.describe('Authentication Error Investigation', () => {
  test('Investigate authentication error details', async ({ page }) => {
    // Capture all network requests and responses
    const networkLog = [];
    const consoleLog = [];

    // Monitor network requests
    page.on('request', request => {
      networkLog.push({
        type: 'request',
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      });
    });

    page.on('response', response => {
      networkLog.push({
        type: 'response',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        timestamp: new Date().toISOString()
      });
    });

    // Monitor console logs
    page.on('console', msg => {
      consoleLog.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });

    // Navigate to the site
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'auth-investigation-01-homepage.png', fullPage: true });

    // Navigate to login
    await page.goto('https://usmle-trivia.netlify.app/login');
    await page.waitForLoadState('networkidle');

    // Take screenshot of login page
    await page.screenshot({ path: 'auth-investigation-02-login-page.png', fullPage: true });

    // Fill in login form with known credentials
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailField.fill('jayveedz19@gmail.com');
    await passwordField.fill('Jimkali90#');

    // Take screenshot before submitting
    await page.screenshot({ path: 'auth-investigation-03-before-submit.png', fullPage: true });

    // Clear the network log before the authentication request
    networkLog.length = 0;
    consoleLog.length = 0;

    // Submit the login form
    await submitButton.click();

    // Wait a bit for the request to complete
    await page.waitForTimeout(5000);

    // Take screenshot after submitting
    await page.screenshot({ path: 'auth-investigation-04-after-submit.png', fullPage: true });

    // Log detailed network information
    console.log('\n📡 NETWORK REQUESTS DURING AUTH:');
    console.log('================================');
    
    const convexRequests = networkLog.filter(log => 
      log.url && log.url.includes('convex.cloud')
    );

    console.log(`Total network logs: ${networkLog.length}`);
    console.log(`Convex-related logs: ${convexRequests.length}`);

    convexRequests.forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.type.toUpperCase()}: ${log.url}`);
      if (log.method) console.log(`   Method: ${log.method}`);
      if (log.status) console.log(`   Status: ${log.status} ${log.statusText}`);
      if (log.postData) console.log(`   Data: ${log.postData.substring(0, 200)}...`);
    });

    // Log console messages
    console.log('\n💬 CONSOLE MESSAGES:');
    console.log('====================');
    consoleLog.forEach((log, index) => {
      console.log(`${index + 1}. [${log.type.toUpperCase()}] ${log.text}`);
    });

    // Check for specific error patterns
    const hasServerError = page.locator('text=/Server Error|CONVEX.*Server Error/i');
    const hasAuthError = page.locator('text=/auth.*error|authentication.*failed/i');
    const hasNetworkError = page.locator('text=/network.*error|connection.*failed/i');

    const serverErrorVisible = await hasServerError.isVisible();
    const authErrorVisible = await hasAuthError.isVisible();
    const networkErrorVisible = await hasNetworkError.isVisible();

    console.log('\n🔍 ERROR ANALYSIS:');
    console.log('==================');
    console.log(`Server Error Visible: ${serverErrorVisible ? '✅' : '❌'}`);
    console.log(`Auth Error Visible: ${authErrorVisible ? '✅' : '❌'}`);
    console.log(`Network Error Visible: ${networkErrorVisible ? '✅' : '❌'}`);

    // Get the exact error text if visible
    if (serverErrorVisible) {
      const errorText = await hasServerError.textContent();
      console.log(`Server Error Text: "${errorText}"`);
    }

    // Check if we're still on the login page (auth failed) or redirected (auth success)
    const currentUrl = page.url();
    console.log(`Current URL after auth: ${currentUrl}`);
    console.log(`Auth Success: ${!currentUrl.includes('/login') ? '✅' : '❌'}`);

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: 'https://usmle-trivia.netlify.app',
      credentials: 'jayveedz19@gmail.com / Jimkali90#',
      finalUrl: currentUrl,
      authSuccess: !currentUrl.includes('/login'),
      errors: {
        serverError: serverErrorVisible,
        authError: authErrorVisible, 
        networkError: networkErrorVisible
      },
      networkRequests: convexRequests,
      consoleLogs: consoleLog,
      screenshots: [
        'auth-investigation-01-homepage.png',
        'auth-investigation-02-login-page.png',
        'auth-investigation-03-before-submit.png',
        'auth-investigation-04-after-submit.png'
      ]
    };

    console.log('\n💾 Detailed report saved for analysis');
    
    // Return the report for further analysis
    return report;
  });
});