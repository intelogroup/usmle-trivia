const { chromium } = require('playwright');
const fs = require('fs');

async function runFinalAuthenticationTest() {
  console.log('\n🚀 FINAL COMPREHENSIVE AUTHENTICATION TEST');
  console.log('🌐 Production URL: https://usmle-trivia.netlify.app');
  
  const timestamp = Date.now();
  const testEmail = `success-test-${timestamp}@medquiz.test`;
  const testName = 'Success Test User';
  const testPassword = 'Success123!';
  
  console.log(`📧 Test Email: ${testEmail}`);
  console.log(`👤 Test Name: ${testName}`);
  console.log(`🔐 Test Password: ${testPassword}`);
  
  let browser, context, page;
  let testResults = {
    timestamp: new Date().toISOString(),
    testCredentials: { email: testEmail, name: testName },
    results: {},
    errors: [],
    screenshots: [],
    overallSuccess: false
  };
  
  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    page = await context.newPage();
    
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`Console Error: ${msg.text()}`);
        console.log(`❌ ${msg.text()}`);
      }
    });
    
    // Step 1: Navigate to production site
    console.log('\n🌐 Step 1: Navigating to production site...');
    await page.goto('https://usmle-trivia.netlify.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const homepageScreenshot = `/root/repo/final-simple-auth-01-homepage.png`;
    await page.screenshot({ path: homepageScreenshot, fullPage: true });
    testResults.screenshots.push(homepageScreenshot);
    console.log('✅ Homepage loaded successfully');
    testResults.results.homepageLoad = true;
    
    // Step 2: Try to find and click register link
    console.log('\n📝 Step 2: Looking for registration option...');
    
    // Look for register/sign up links
    const signUpLink = await page.$('text=Sign up');
    if (signUpLink) {
      console.log('✅ Found "Sign up" link, clicking...');
      await signUpLink.click();
      await page.waitForTimeout(2000);
    } else {
      // Try to navigate directly to register page
      console.log('ℹ️ No "Sign up" link found, trying direct navigation to /register');
      await page.goto('https://usmle-trivia.netlify.app/register');
      await page.waitForTimeout(2000);
    }
    
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    const registerScreenshot = `/root/repo/final-simple-auth-02-register-page.png`;
    await page.screenshot({ path: registerScreenshot, fullPage: true });
    testResults.screenshots.push(registerScreenshot);
    
    // Step 3: Check what form fields are available
    console.log('\n🔍 Step 3: Analyzing form structure...');
    
    const inputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        id: input.id
      }))
    );
    
    console.log('📋 Found form inputs:', JSON.stringify(inputs, null, 2));
    
    // Check if we have name field (registration) or just email/password (login)
    const hasNameField = inputs.some(input => 
      input.name === 'name' || 
      input.placeholder?.toLowerCase().includes('name') ||
      input.id?.toLowerCase().includes('name')
    );
    
    const hasEmailField = inputs.some(input => 
      input.type === 'email' || 
      input.name === 'email' ||
      input.placeholder?.toLowerCase().includes('email')
    );
    
    const hasPasswordField = inputs.some(input => 
      input.type === 'password' || 
      input.name === 'password' ||
      input.placeholder?.toLowerCase().includes('password')
    );
    
    console.log(`📊 Form analysis: Name=${hasNameField}, Email=${hasEmailField}, Password=${hasPasswordField}`);
    
    // Step 4: Test form filling based on available fields
    if (hasNameField && hasEmailField && hasPasswordField) {
      console.log('\n✍️ Step 4a: Testing REGISTRATION flow...');
      
      // Fill registration form
      try {
        await page.fill('input[name="name"], input[placeholder*="name"], input[id*="name"]', testName);
        console.log('✅ Name field filled');
      } catch (e) {
        console.log('⚠️ Could not fill name field:', e.message);
      }
      
      try {
        await page.fill('input[type="email"], input[name="email"], input[placeholder*="email"]', testEmail);
        console.log('✅ Email field filled');
      } catch (e) {
        console.log('⚠️ Could not fill email field:', e.message);
      }
      
      try {
        await page.fill('input[type="password"], input[name="password"], input[placeholder*="password"]', testPassword);
        console.log('✅ Password field filled');
      } catch (e) {
        console.log('⚠️ Could not fill password field:', e.message);
      }
      
      const filledScreenshot = `/root/repo/final-simple-auth-03-filled-form.png`;
      await page.screenshot({ path: filledScreenshot, fullPage: true });
      testResults.screenshots.push(filledScreenshot);
      
      // Submit registration
      console.log('\n🚀 Submitting registration form...');
      try {
        await page.click('button[type="submit"], input[type="submit"], button:has-text("Sign up"), button:has-text("Register")');
        await page.waitForTimeout(3000); // Wait for response
        
        const afterSubmitUrl = page.url();
        console.log(`📍 URL after registration: ${afterSubmitUrl}`);
        
        const resultScreenshot = `/root/repo/final-simple-auth-04-registration-result.png`;
        await page.screenshot({ path: resultScreenshot, fullPage: true });
        testResults.screenshots.push(resultScreenshot);
        
        testResults.results.registrationAttempt = true;
        testResults.results.registrationSuccess = afterSubmitUrl.includes('/dashboard') || afterSubmitUrl.includes('/login');
        
      } catch (e) {
        console.log('❌ Registration submission failed:', e.message);
        testResults.errors.push(`Registration submission error: ${e.message}`);
      }
      
    } else if (hasEmailField && hasPasswordField) {
      console.log('\n🔐 Step 4b: This appears to be LOGIN page, testing with known credentials...');
      
      // Try with existing test user credentials
      const knownEmail = 'jayveedz19@gmail.com';
      const knownPassword = 'Jimkali90#';
      
      console.log(`🔑 Using known credentials: ${knownEmail}`);
      
      try {
        await page.fill('input[type="email"], input[name="email"], input[placeholder*="email"]', knownEmail);
        console.log('✅ Email field filled with known credentials');
      } catch (e) {
        console.log('⚠️ Could not fill email field:', e.message);
      }
      
      try {
        await page.fill('input[type="password"], input[name="password"], input[placeholder*="password"]', knownPassword);
        console.log('✅ Password field filled with known credentials');
      } catch (e) {
        console.log('⚠️ Could not fill password field:', e.message);
      }
      
      const filledScreenshot = `/root/repo/final-simple-auth-03-login-filled.png`;
      await page.screenshot({ path: filledScreenshot, fullPage: true });
      testResults.screenshots.push(filledScreenshot);
      
      // Submit login
      console.log('\n🚀 Submitting login form...');
      try {
        await page.click('button[type="submit"], input[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
        await page.waitForTimeout(5000); // Wait for response
        
        const afterLoginUrl = page.url();
        console.log(`📍 URL after login: ${afterLoginUrl}`);
        
        const resultScreenshot = `/root/repo/final-simple-auth-04-login-result.png`;
        await page.screenshot({ path: resultScreenshot, fullPage: true });
        testResults.screenshots.push(resultScreenshot);
        
        testResults.results.loginAttempt = true;
        testResults.results.loginSuccess = afterLoginUrl.includes('/dashboard');
        
        if (afterLoginUrl.includes('/dashboard')) {
          console.log('✅ Login successful - Redirected to dashboard!');
          
          // Step 5: Test dashboard functionality
          console.log('\n📊 Step 5: Testing dashboard functionality...');
          
          // Check for user information
          const userElements = await page.$$('[data-testid*="user"], .user-name, .profile, h1');
          console.log(`✅ Found ${userElements.length} potential user elements on dashboard`);
          
          // Test logout if possible
          const logoutButton = await page.$('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout"]');
          if (logoutButton) {
            console.log('\n🚪 Step 6: Testing logout functionality...');
            await logoutButton.click();
            await page.waitForTimeout(2000);
            
            const logoutUrl = page.url();
            console.log(`📍 URL after logout: ${logoutUrl}`);
            testResults.results.logoutSuccess = !logoutUrl.includes('/dashboard');
            
            const logoutScreenshot = `/root/repo/final-simple-auth-05-after-logout.png`;
            await page.screenshot({ path: logoutScreenshot, fullPage: true });
            testResults.screenshots.push(logoutScreenshot);
          } else {
            console.log('⚠️ Logout button not found');
          }
          
          testResults.results.dashboardAccess = true;
        } else {
          console.log('❌ Login failed - No redirect to dashboard');
        }
        
      } catch (e) {
        console.log('❌ Login submission failed:', e.message);
        testResults.errors.push(`Login submission error: ${e.message}`);
      }
    } else {
      console.log('❌ Could not identify form structure');
      testResults.errors.push('Form structure not recognized');
    }
    
    // Collect all console errors
    testResults.errors.push(...consoleErrors);
    
    // Final assessment
    const totalErrors = testResults.errors.length;
    const hasSuccessfulAuth = testResults.results.loginSuccess || testResults.results.registrationSuccess;
    testResults.overallSuccess = totalErrors === 0 && hasSuccessfulAuth;
    
    console.log('\n📊 FINAL AUTHENTICATION TEST SUMMARY:');
    console.log(`✅ Homepage Load: ${testResults.results.homepageLoad ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Form Analysis: ${inputs.length > 0 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Authentication: ${hasSuccessfulAuth ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Dashboard Access: ${testResults.results.dashboardAccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Console Errors: ${consoleErrors.length} detected`);
    console.log(`✅ Total Errors: ${totalErrors}`);
    console.log(`\n🎯 FINAL RESULT: ${testResults.overallSuccess ? '🏆 COMPLETE SUCCESS' : `⚠️ ${totalErrors} ISSUES DETECTED`}`);
    
    if (totalErrors > 0) {
      console.log('\n❌ Errors detected:');
      testResults.errors.forEach(error => console.log(`   ${error}`));
    }
    
  } catch (error) {
    console.log(`❌ Test failed with error: ${error.message}`);
    testResults.errors.push(`Test execution error: ${error.message}`);
    testResults.overallSuccess = false;
    
    if (page) {
      const errorScreenshot = `/root/repo/final-simple-auth-error.png`;
      await page.screenshot({ path: errorScreenshot, fullPage: true });
      testResults.screenshots.push(errorScreenshot);
    }
  } finally {
    // Save test results
    fs.writeFileSync(
      '/root/repo/final-simple-auth-test-results.json', 
      JSON.stringify(testResults, null, 2)
    );
    console.log('\n💾 Test results saved to: final-simple-auth-test-results.json');
    
    // Cleanup
    if (browser) {
      await browser.close();
    }
  }
  
  return testResults;
}

// Run the test
runFinalAuthenticationTest()
  .then(results => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(results.overallSuccess ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });