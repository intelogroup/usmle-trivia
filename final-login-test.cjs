const { chromium } = require('playwright');
const fs = require('fs');

async function testExistingLogin() {
  console.log('\n🔐 TESTING LOGIN WITH EXISTING CREDENTIALS');
  console.log('🌐 Production URL: https://usmle-trivia.netlify.app');
  
  let browser, context, page;
  let testResults = {
    timestamp: new Date().toISOString(),
    loginCredentials: { email: 'jayveedz19@gmail.com' },
    results: {},
    consoleErrors: [],
    screenshots: [],
    overallSuccess: false
  };
  
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();
    
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = `Console Error: ${msg.text()}`;
        testResults.consoleErrors.push(error);
        console.log(`❌ ${error}`);
      }
    });
    
    // Navigate to login page
    console.log('\n🌐 Step 1: Navigating to login page...');
    await page.goto('https://usmle-trivia.netlify.app/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const loginPageScreenshot = `/root/repo/final-login-01-page.png`;
    await page.screenshot({ path: loginPageScreenshot, fullPage: true });
    testResults.screenshots.push(loginPageScreenshot);
    console.log('✅ Login page loaded');
    
    // Fill login form with known working credentials
    console.log('\n✍️ Step 2: Filling login form...');
    await page.fill('input[type="email"], #email', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"], #password', 'Jimkali90#');
    
    const filledScreenshot = `/root/repo/final-login-02-filled.png`;
    await page.screenshot({ path: filledScreenshot, fullPage: true });
    testResults.screenshots.push(filledScreenshot);
    console.log('✅ Login form filled with known credentials');
    
    // Submit login
    console.log('\n🚀 Step 3: Submitting login...');
    await page.click('button[type="submit"], button:has-text("Sign in")');
    await page.waitForTimeout(5000);
    
    const afterLoginUrl = page.url();
    console.log(`📍 URL after login: ${afterLoginUrl}`);
    
    const loginResultScreenshot = `/root/repo/final-login-03-result.png`;
    await page.screenshot({ path: loginResultScreenshot, fullPage: true });
    testResults.screenshots.push(loginResultScreenshot);
    
    testResults.results.loginSuccess = afterLoginUrl.includes('/dashboard');
    
    if (testResults.results.loginSuccess) {
      console.log('✅ Login successful - Redirected to dashboard!');
      
      // Test dashboard content
      console.log('\n📊 Step 4: Testing dashboard...');
      const dashboardElements = await page.$$eval(
        'h1, h2, .welcome, [data-testid*="user"], .user-name',
        elements => elements.map(el => el.textContent?.trim()).filter(text => text)
      );
      
      console.log(`✅ Dashboard loaded with ${dashboardElements.length} elements`);
      if (dashboardElements.length > 0) {
        console.log('   Sample content:', dashboardElements.slice(0, 3));
      }
      
      testResults.results.dashboardAccess = true;
      
      // Test logout
      const logoutButton = await page.$('button:has-text("Logout"), button:has-text("Sign Out")');
      if (logoutButton) {
        console.log('\n🚪 Step 5: Testing logout...');
        await logoutButton.click();
        await page.waitForTimeout(3000);
        
        const logoutUrl = page.url();
        testResults.results.logoutSuccess = !logoutUrl.includes('/dashboard');
        console.log(`✅ Logout: ${testResults.results.logoutSuccess ? 'SUCCESS' : 'FAILED'}`);
        
        const logoutScreenshot = `/root/repo/final-login-04-logout.png`;
        await page.screenshot({ path: logoutScreenshot, fullPage: true });
        testResults.screenshots.push(logoutScreenshot);
      }
    } else {
      console.log('❌ Login failed - No dashboard redirect');
      
      // Check for error messages
      const errorMessages = await page.$$eval(
        '.error, [data-testid="error"], .text-red-500, .alert-error',
        elements => elements.map(el => el.textContent?.trim()).filter(text => text)
      );
      
      if (errorMessages.length > 0) {
        console.log('❌ Error messages found:', errorMessages);
      }
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    testResults.consoleErrors.push(`Test error: ${error.message}`);
  } finally {
    testResults.overallSuccess = testResults.results.loginSuccess && testResults.consoleErrors.length === 0;
    
    console.log('\n📊 FINAL LOGIN TEST SUMMARY:');
    console.log(`✅ Login Success: ${testResults.results.loginSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Dashboard Access: ${testResults.results.dashboardAccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Logout: ${testResults.results.logoutSuccess ? 'SUCCESS' : 'NOT TESTED'}`);
    console.log(`✅ Console Errors: ${testResults.consoleErrors.length}`);
    console.log(`\n🎯 RESULT: ${testResults.overallSuccess ? '🏆 SUCCESS' : '⚠️ ISSUES DETECTED'}`);
    
    fs.writeFileSync(
      '/root/repo/final-login-test-results.json', 
      JSON.stringify(testResults, null, 2)
    );
    
    if (browser) {
      await browser.close();
    }
  }
  
  return testResults;
}

testExistingLogin()
  .then(results => {
    console.log('\n🎉 Login test completed!');
    process.exit(results.overallSuccess ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });