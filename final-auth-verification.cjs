const { chromium } = require('playwright');

async function runFinalAuthVerification() {
  let browser;
  let context;
  let page;
  
  try {
    console.log('🚀 Starting Final Authentication System Verification');
    console.log('=' .repeat(60));
    
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // Slow down for visibility
    });
    context = await browser.newContext({ 
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: './test-videos/' }
    });
    page = await context.newPage();

    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Monitor network failures
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Network Error: ${response.status()} - ${response.url()}`);
      }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testEmail = `final-test-${timestamp}@medquiz.test`;
    const testName = 'Final Test User';
    const testPassword = 'FinalTest123!';
    
    console.log(`\n📧 Test Credentials:`);
    console.log(`Email: ${testEmail}`);
    console.log(`Name: ${testName}`);
    console.log(`Password: ${testPassword}`);
    console.log('=' .repeat(60));

    // Step 1: Navigate to production site
    console.log('\n1️⃣ Navigating to production site...');
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `final-test-01-homepage-${timestamp}.png` });
    console.log('✅ Homepage loaded successfully');

    // Step 2: Navigate to registration page
    console.log('\n2️⃣ Navigating to registration page...');
    await page.click('a[href="/register"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `final-test-02-register-page-${timestamp}.png` });
    console.log('✅ Registration page loaded');

    // Step 3: Fill registration form
    console.log('\n3️⃣ Filling registration form...');
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.screenshot({ path: `final-test-03-register-filled-${timestamp}.png` });
    console.log('✅ Registration form filled');

    // Step 4: Submit registration
    console.log('\n4️⃣ Submitting registration...');
    await page.click('button[type="submit"]');
    
    // Wait for either success redirect or error message
    const result = await Promise.race([
      page.waitForURL('**/dashboard', { timeout: 10000 }).then(() => 'dashboard'),
      page.waitForSelector('.error-message', { timeout: 10000 }).then(() => 'error'),
      page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 }).then(() => 'error'),
      new Promise(resolve => setTimeout(() => resolve('timeout'), 12000))
    ]);

    await page.screenshot({ path: `final-test-04-after-register-${timestamp}.png` });

    if (result === 'dashboard') {
      console.log('✅ Registration successful - redirected to dashboard');
      
      // Step 5: Test logout
      console.log('\n5️⃣ Testing logout functionality...');
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `final-test-05-after-logout-${timestamp}.png` });
        console.log('✅ Logout successful');
        
        // Step 6: Test login with registered credentials
        console.log('\n6️⃣ Testing login with registered credentials...');
        await page.click('a[href="/login"]');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="password"]', testPassword);
        await page.screenshot({ path: `final-test-06-login-filled-${timestamp}.png` });
        
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `final-test-07-after-login-${timestamp}.png` });
        
        if (page.url().includes('/dashboard')) {
          console.log('✅ Login successful - redirected to dashboard');
          
          // Step 7: Test authentication persistence
          console.log('\n7️⃣ Testing authentication state persistence...');
          await page.reload();
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: `final-test-08-after-refresh-${timestamp}.png` });
          
          if (page.url().includes('/dashboard')) {
            console.log('✅ Authentication state persists after page refresh');
          } else {
            console.log('❌ Authentication state lost after page refresh');
          }
          
        } else {
          console.log('❌ Login failed - not redirected to dashboard');
        }
      } else {
        console.log('⚠️ Logout button not found');
      }
      
    } else if (result === 'error') {
      console.log('❌ Registration failed with error message');
      const errorText = await page.textContent('.error-message, [data-testid="error-message"]').catch(() => 'Unknown error');
      console.log(`Error: ${errorText}`);
    } else {
      console.log('⏰ Registration timed out or unclear result');
    }

    // Step 8: Test with existing credentials if available
    console.log('\n8️⃣ Testing with existing known credentials...');
    await page.goto('https://usmle-trivia.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    // Try known working credentials
    await page.fill('input[name="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[name="password"]', 'Jimkali90#');
    await page.screenshot({ path: `final-test-09-existing-creds-${timestamp}.png` });
    
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `final-test-10-existing-login-result-${timestamp}.png` });
    
    if (page.url().includes('/dashboard')) {
      console.log('✅ Existing credentials login successful');
    } else {
      console.log('❌ Existing credentials login failed');
    }

    // Final summary
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 FINAL AUTHENTICATION VERIFICATION RESULTS');
    console.log('=' .repeat(60));
    console.log(`📧 Test Email: ${testEmail}`);
    console.log(`🌐 Production URL: https://usmle-trivia.netlify.app`);
    console.log(`📊 Console Errors: ${consoleErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('Console Errors Found:');
      consoleErrors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    }

    console.log('\n✅ VERIFICATION COMPLETE');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (page) {
      await page.screenshot({ path: `final-test-error-${timestamp}.png` });
    }
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

runFinalAuthVerification().catch(console.error);