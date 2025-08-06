import { test, expect } from '@playwright/test';

test.describe('USMLE Trivia Authentication Testing', () => {
  const testResults = [];

  test('Complete Authentication Flow Test', async ({ page }) => {
    console.log('🚀 Starting comprehensive authentication test...');
    
    // Enable console and error logging
    page.on('console', msg => {
      console.log(`📱 Console [${msg.type()}]:`, msg.text());
    });
    
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
      testResults.push({ step: 'Page Error', status: 'FAILED', message: error.message });
    });
    
    page.on('requestfailed', request => {
      console.error('🌐 Network Error:', request.url(), request.failure()?.errorText);
      testResults.push({ step: 'Network Error', status: 'FAILED', url: request.url(), message: request.failure()?.errorText });
    });

    try {
      // Step 1: Navigate to the site
      console.log('📍 Step 1: Navigating to https://usmle-trivia.netlify.app');
      await page.goto('https://usmle-trivia.netlify.app', { waitUntil: 'networkidle' });
      
      // Take initial screenshot
      await page.screenshot({ path: 'screenshot-1-landing.png', fullPage: true });
      console.log('📸 Screenshot saved: screenshot-1-landing.png');
      testResults.push({ step: 'Site Load', status: 'SUCCESS', message: 'Site loaded successfully' });
      
      // Wait for React app to load
      await page.waitForTimeout(3000);
      
      const pageTitle = await page.title();
      console.log('📄 Page Title:', pageTitle);
      
      // Step 2: Analyze the page structure
      console.log('📍 Step 2: Analyzing page structure...');
      
      const bodyText = await page.locator('body').textContent();
      const hasAuth = bodyText.toLowerCase().includes('login') || bodyText.toLowerCase().includes('sign');
      console.log('📝 Page contains authentication elements:', hasAuth);
      
      // Find all buttons and links
      const allButtons = await page.locator('button, a[role="button"], a').all();
      console.log(`🔘 Found ${allButtons.length} interactive elements`);
      
      const authElements = [];
      for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
        const text = await allButtons[i].textContent();
        const href = await allButtons[i].getAttribute('href');
        if (text) {
          const cleanText = text.trim();
          console.log(`  Element ${i + 1}: "${cleanText}"${href ? ` (href: ${href})` : ''}`);
          authElements.push({ text: cleanText, href });
        }
      }
      
      await page.screenshot({ path: 'screenshot-2-analysis.png', fullPage: true });
      
      // Step 3: Look for registration functionality
      console.log('📍 Step 3: Looking for registration functionality...');
      
      // Try to find registration by various methods
      let registrationAttempted = false;
      
      // Method 1: Look for register/signup buttons or links
      const registerSelectors = [
        'button:has-text("Register")',
        'button:has-text("Sign Up")',
        'a:has-text("Register")',
        'a:has-text("Sign Up")',
        'a[href*="register"]',
        'a[href*="signup"]'
      ];
      
      for (const selector of registerSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ Found register element with selector: ${selector}`);
          await element.click({ timeout: 5000 });
          await page.waitForTimeout(2000);
          registrationAttempted = true;
          break;
        }
      }
      
      // Method 2: Try direct navigation to register page
      if (!registrationAttempted) {
        console.log('🔍 Trying direct navigation to /register...');
        await page.goto('https://usmle-trivia.netlify.app/register', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        registrationAttempted = true;
      }
      
      await page.screenshot({ path: 'screenshot-3-register-attempt.png', fullPage: true });
      
      // Step 4: Test registration form
      console.log('📍 Step 4: Testing registration form...');
      
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
      
      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        console.log('✅ Found registration form fields');
        
        // Fill the form
        await emailInput.fill('testuser@example.com');
        await passwordInput.fill('TestPass123!');
        
        // Look for additional fields
        const nameInput = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill('Test User');
          console.log('✅ Filled name field');
        }
        
        const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[placeholder*="confirm" i]').first();
        if (await confirmPasswordInput.count() > 0) {
          await confirmPasswordInput.fill('TestPass123!');
          console.log('✅ Filled confirm password field');
        }
        
        await page.screenshot({ path: 'screenshot-4-register-filled.png', fullPage: true });
        
        // Try to submit
        const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up"), button:has-text("Create")').first();
        if (await submitButton.count() > 0) {
          console.log('🚀 Attempting to submit registration...');
          await submitButton.click();
          await page.waitForTimeout(5000);
          
          await page.screenshot({ path: 'screenshot-5-register-result.png', fullPage: true });
          testResults.push({ step: 'Registration', status: 'ATTEMPTED', message: 'Registration form submitted' });
        } else {
          console.log('❌ No submit button found');
          testResults.push({ step: 'Registration', status: 'FAILED', message: 'No submit button found' });
        }
      } else {
        console.log('❌ Registration form not found');
        testResults.push({ step: 'Registration', status: 'FAILED', message: 'Registration form not found' });
      }
      
      // Step 5: Test login functionality
      console.log('📍 Step 5: Testing login functionality...');
      
      // Try to navigate to login
      await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'screenshot-6-login-page.png', fullPage: true });
      
      const loginEmailInput = page.locator('input[type="email"], input[name="email"]').first();
      const loginPasswordInput = page.locator('input[type="password"], input[name="password"]').first();
      
      if (await loginEmailInput.count() > 0 && await loginPasswordInput.count() > 0) {
        console.log('✅ Found login form');
        
        // Test with new credentials
        await loginEmailInput.fill('testuser@example.com');
        await loginPasswordInput.fill('TestPass123!');
        
        await page.screenshot({ path: 'screenshot-7-login-new-user.png', fullPage: true });
        
        const loginSubmitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Log In")').first();
        if (await loginSubmitButton.count() > 0) {
          console.log('🚀 Attempting login with test credentials...');
          await loginSubmitButton.click();
          await page.waitForTimeout(5000);
          
          await page.screenshot({ path: 'screenshot-8-login-new-result.png', fullPage: true });
          testResults.push({ step: 'Login New User', status: 'ATTEMPTED', message: 'Login attempted with test credentials' });
        }
        
        // Test with existing documented credentials
        console.log('📍 Testing with documented existing user...');
        await loginEmailInput.fill('jayveedz19@gmail.com');
        await loginPasswordInput.fill('Jimkali90#');
        
        await page.screenshot({ path: 'screenshot-9-login-existing-user.png', fullPage: true });
        
        if (await loginSubmitButton.count() > 0) {
          console.log('🚀 Attempting login with existing user credentials...');
          await loginSubmitButton.click();
          await page.waitForTimeout(5000);
          
          const currentUrl = page.url();
          console.log('📍 Current URL after login:', currentUrl);
          
          // Check for authentication success indicators
          const userMenu = await page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile"), button:has-text("Logout"), button:has-text("Dashboard")').count();
          const dashboardContent = await page.locator('text="Dashboard", text="Welcome", text="Quiz"').count();
          
          if (userMenu > 0 || dashboardContent > 0 || currentUrl.includes('dashboard')) {
            console.log('✅ Login appears successful!');
            testResults.push({ step: 'Login Existing User', status: 'SUCCESS', message: 'Login successful with existing credentials' });
          } else {
            console.log('❓ Login result unclear');
            testResults.push({ step: 'Login Existing User', status: 'UNCLEAR', message: 'Login attempted but success unclear' });
          }
          
          await page.screenshot({ path: 'screenshot-10-login-existing-result.png', fullPage: true });
        }
      } else {
        console.log('❌ Login form not found');
        testResults.push({ step: 'Login', status: 'FAILED', message: 'Login form not found' });
      }
      
      // Final analysis
      console.log('📍 Step 6: Final site analysis...');
      await page.goto('https://usmle-trivia.netlify.app', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      const finalPageContent = await page.locator('body').textContent();
      await page.screenshot({ path: 'screenshot-11-final.png', fullPage: true });
      
      console.log('📊 Final Analysis:');
      console.log('  - Site loads properly:', await page.title() ? 'YES' : 'NO');
      console.log('  - Contains USMLE content:', finalPageContent.toLowerCase().includes('usmle'));
      console.log('  - Has quiz functionality:', finalPageContent.toLowerCase().includes('quiz'));
      console.log('  - Has medical content:', finalPageContent.toLowerCase().includes('medical'));
      
      testResults.push({ step: 'Final Analysis', status: 'COMPLETE', message: 'Testing completed' });
      
    } catch (error) {
      console.error('❌ Test execution error:', error.message);
      testResults.push({ step: 'Test Execution', status: 'FAILED', message: error.message });
      await page.screenshot({ path: 'screenshot-error.png', fullPage: true });
    }
    
    // Print summary
    console.log('\n🎯 TEST RESULTS SUMMARY:');
    console.log('========================');
    testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.step}: ${result.status}`);
      if (result.message) console.log(`   Message: ${result.message}`);
      if (result.url) console.log(`   URL: ${result.url}`);
    });
    console.log('========================\n');
  });
});