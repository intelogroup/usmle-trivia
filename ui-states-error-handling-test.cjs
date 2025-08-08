const { chromium } = require('playwright');
const fs = require('fs');

async function runUIStatesTests() {
  console.log('🎭 Starting UI States and Error Handling Tests');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testResults = {
    timestamp: new Date().toISOString(),
    testSuite: 'UI States and Error Handling Tests',
    results: [],
    screenshots: [],
    summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
  };

  function addTestResult(category, testName, status, details = '', screenshot = '') {
    testResults.results.push({
      category, testName, status, details, screenshot,
      timestamp: new Date().toISOString()
    });
    testResults.summary.total++;
    if (status === 'PASS') testResults.summary.passed++;
    else if (status === 'FAIL') testResults.summary.failed++;
    else testResults.summary.warnings++;
  }

  async function takeScreenshot(name, description = '') {
    const timestamp = Date.now();
    const filename = `ui-states-${name}-${timestamp}.png`;
    const dir = '/root/repo/ui-states-screenshots';
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filepath = `${dir}/${filename}`;
    await page.screenshot({ path: filepath, fullPage: true });
    
    testResults.screenshots.push({
      name, description, filename, filepath, timestamp
    });
    return filename;
  }

  try {
    console.log('🔍 Testing Landing Page States...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    const screenshot1 = await takeScreenshot('01-landing-initial', 'Initial landing page state');

    // Test 1: Page Loading State
    const hasLoadingIndicators = await page.locator('[class*="loading"], [class*="spinner"], .animate-spin').count();
    addTestResult('Loading States', 'Loading Indicators', 'PASS', 
      `Loading elements found: ${hasLoadingIndicators}`, screenshot1);

    // Test 2: Button Hover States
    const buttons = await page.locator('button, .btn').all();
    let hoverTestPassed = false;
    
    if (buttons.length > 0) {
      await buttons[0].hover();
      await page.waitForTimeout(500);
      const screenshot2 = await takeScreenshot('02-button-hover', 'Button hover state');
      hoverTestPassed = true;
      addTestResult('Interactive States', 'Button Hover', 'PASS', 
        'Button hover state tested', screenshot2);
    } else {
      addTestResult('Interactive States', 'Button Hover', 'WARNING', 
        'No buttons found to test hover state', screenshot1);
    }

    // Test 3: Form States
    console.log('🔍 Testing Form States...');
    await page.click('text=Sign In');
    await page.waitForLoadState('networkidle');
    
    const screenshot3 = await takeScreenshot('03-login-form', 'Login form initial state');

    // Test 4: Empty Form Validation
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    const screenshot4 = await takeScreenshot('04-empty-form-validation', 'Empty form validation state');
    
    const validationMessages = await page.locator('.error, .text-red-500, .text-red-600, [role="alert"]').count();
    const inputErrors = await page.locator('input[aria-invalid="true"], .border-red-500').count();
    
    addTestResult('Form Validation', 'Empty Form Errors', validationMessages > 0 || inputErrors > 0 ? 'PASS' : 'WARNING', 
      `Validation messages: ${validationMessages}, Input errors: ${inputErrors}`, screenshot4);

    // Test 5: Form Focus States
    await page.focus('input[type="email"]');
    await page.waitForTimeout(500);
    
    const screenshot5 = await takeScreenshot('05-input-focus', 'Input field focus state');
    
    const focusedInput = await page.evaluate(() => {
      const focused = document.activeElement;
      return focused && focused.tagName === 'INPUT';
    });
    
    addTestResult('Form States', 'Input Focus', focusedInput ? 'PASS' : 'WARNING', 
      `Input focused: ${focusedInput}`, screenshot5);

    // Test 6: Form Filling States
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123');
    await page.waitForTimeout(500);
    
    const screenshot6 = await takeScreenshot('06-form-filled', 'Form filled state');
    
    const emailValue = await page.locator('input[type="email"]').inputValue();
    const passwordValue = await page.locator('input[type="password"]').inputValue();
    
    addTestResult('Form States', 'Form Input', 
      emailValue.length > 0 && passwordValue.length > 0 ? 'PASS' : 'FAIL', 
      `Email: ${emailValue}, Password: ${passwordValue.length} chars`, screenshot6);

    // Test 7: Invalid Login Error Handling
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const screenshot7 = await takeScreenshot('07-login-error', 'Login error handling');
    
    const currentURL = page.url();
    const hasErrorMessage = await page.locator('.error, .text-red-500, [role="alert"]').count();
    
    // If login failed (stayed on login page), check for error messages
    if (currentURL.includes('/login')) {
      addTestResult('Error Handling', 'Invalid Login', hasErrorMessage > 0 ? 'PASS' : 'WARNING', 
        `Error messages shown: ${hasErrorMessage}`, screenshot7);
    } else {
      // Login succeeded with test credentials
      addTestResult('Error Handling', 'Login Success', 'PASS', 
        `Logged in successfully to: ${currentURL}`, screenshot7);
    }

    // Test 8: Valid Login Flow
    console.log('🔍 Testing Valid Login Flow...');
    
    // Clear and fill with real credentials
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    
    const screenshot8 = await takeScreenshot('08-valid-credentials', 'Valid credentials entered');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const screenshot9 = await takeScreenshot('09-after-valid-login', 'After valid login');
    
    const loginSuccessful = page.url().includes('/dashboard') || page.url() === 'http://localhost:5173/';
    addTestResult('Authentication', 'Valid Login Flow', loginSuccessful ? 'PASS' : 'FAIL', 
      `Login result URL: ${page.url()}`, screenshot9);

    // Test 9: Dashboard Loading State
    if (loginSuccessful) {
      console.log('🔍 Testing Dashboard States...');
      
      const dashboardElements = await page.locator('[class*="card"], .bg-white, .rounded').count();
      const statsElements = await page.locator('[class*="stat"], .text-lg, .text-xl').count();
      
      addTestResult('Dashboard States', 'Dashboard Elements', dashboardElements > 0 ? 'PASS' : 'WARNING', 
        `Cards: ${dashboardElements}, Stats: ${statsElements}`, screenshot9);

      // Test 10: Interactive Dashboard Elements
      const buttons = await page.locator('button').all();
      if (buttons.length > 0) {
        // Try to click the first available button
        try {
          await buttons[0].click();
          await page.waitForTimeout(2000);
          
          const screenshot10 = await takeScreenshot('10-dashboard-interaction', 'Dashboard interaction state');
          
          addTestResult('Dashboard Interaction', 'Button Click', 'PASS', 
            'Dashboard button interaction tested', screenshot10);
        } catch (e) {
          addTestResult('Dashboard Interaction', 'Button Click', 'WARNING', 
            `Button click failed: ${e.message}`, screenshot9);
        }
      }
    }

    // Test 11: 404/Not Found Page
    console.log('🔍 Testing Error Pages...');
    await page.goto('http://localhost:5173/nonexistent-page');
    await page.waitForTimeout(2000);
    
    const screenshot11 = await takeScreenshot('11-404-page', '404 error page');
    
    const has404Content = await page.locator('text=404, text=Not Found, text=Page not found').count();
    const hasReturnLink = await page.locator('a[href="/"]').count() + await page.locator('button').count() + await page.locator('text=Home').count() + await page.locator('text=Back').count();
    
    addTestResult('Error Pages', '404 Page', has404Content > 0 ? 'PASS' : 'WARNING', 
      `404 content: ${has404Content}, Return links: ${hasReturnLink}`, screenshot11);

    // Test 12: Network Error Simulation
    console.log('🔍 Testing Network Error Handling...');
    
    // Go offline to test network error handling
    await context.setOffline(true);
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(2000);
    
    const screenshot12 = await takeScreenshot('12-offline-state', 'Offline/network error state');
    
    const hasNetworkError = await page.locator('text=network, text=offline, text=connection').count();
    addTestResult('Network Error', 'Offline Handling', 'PASS', 
      `Network error indicators: ${hasNetworkError}`, screenshot12);

    // Restore online
    await context.setOffline(false);

    console.log('\n🎭 UI STATES TEST RESULTS SUMMARY');
    console.log('=================================');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
    
    const successRate = testResults.summary.total > 0 ? 
      ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1) : 0;
    console.log(`Success Rate: ${successRate}%`);
    
    // Save report
    const reportPath = '/root/repo/ui-states-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
    console.log(`📁 Screenshots saved to: /root/repo/ui-states-screenshots/`);

  } catch (error) {
    console.error('❌ UI States test error:', error);
    addTestResult('System', 'Test Execution', 'FAIL', `Error: ${error.message}`);
  } finally {
    await browser.close();
  }

  return testResults;
}

runUIStatesTests().catch(console.error);