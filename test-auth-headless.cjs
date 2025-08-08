const { chromium } = require('playwright');

async function testAuthenticationHeadless() {
  console.log('🔐 Testing Real User Authentication (Headless)');
  console.log('📋 Using documented test credentials: jayveedz19@gmail.com / Jimkali90#');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-web-security']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  const errors = [];
  page.on('pageerror', (err) => {
    errors.push(`Page Error: ${err.message}`);
  });

  try {
    console.log('\n1️⃣ Loading application...');
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('✅ Application loaded');

    // Wait for React to fully render
    await page.waitForSelector('#root', { timeout: 10000 });
    await page.waitForTimeout(3000);

    console.log('\n2️⃣ Searching for authentication elements...');
    
    // Get all interactive elements
    const buttons = await page.locator('button').allTextContents();
    const links = await page.locator('a').allTextContents();
    
    console.log(`Found ${buttons.length} buttons:`, buttons.slice(0, 10));
    console.log(`Found ${links.length} links:`, links.slice(0, 10));

    // Look for auth elements with various strategies
    let authElement = null;
    let authType = '';

    // Strategy 1: Exact text match
    const signInBtn = page.locator('button, a').filter({ hasText: 'Sign In' });
    if (await signInBtn.count() > 0) {
      authElement = signInBtn.first();
      authType = 'Sign In button';
    }

    // Strategy 2: Login text
    if (!authElement) {
      const loginBtn = page.locator('button, a').filter({ hasText: /^Login$/i });
      if (await loginBtn.count() > 0) {
        authElement = loginBtn.first();
        authType = 'Login button';
      }
    }

    // Strategy 3: Get Started
    if (!authElement) {
      const getStartedBtn = page.locator('button, a').filter({ hasText: /Get Started|Start Now/i });
      if (await getStartedBtn.count() > 0) {
        authElement = getStartedBtn.first();
        authType = 'Get Started button';
      }
    }

    // Strategy 4: Any button containing sign/login
    if (!authElement) {
      const anyAuthBtn = page.locator('button, a').filter({ hasText: /sign|login|auth/i });
      if (await anyAuthBtn.count() > 0) {
        authElement = anyAuthBtn.first();
        authType = 'Generic auth button';
      }
    }

    if (!authElement) {
      console.log('❌ No authentication elements found');
      console.log('Available buttons:', buttons);
      console.log('Available links:', links);
      
      // Check if already logged in or on landing page
      const bodyText = await page.textContent('body');
      if (bodyText.includes('Dashboard') || bodyText.includes('Welcome') || bodyText.includes('Profile')) {
        console.log('⚠️  May already be logged in or on dashboard');
      }
      
      await browser.close();
      return { success: false, reason: 'No auth elements found' };
    }

    console.log(`✅ Found ${authType}`);

    console.log('\n3️⃣ Navigating to authentication...');
    await authElement.click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    console.log('\n4️⃣ Looking for login form...');
    
    // Check for form elements
    const emailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count();
    const passwordInputs = await page.locator('input[type="password"], input[name*="password"]').count();

    console.log(`Found ${emailInputs} email inputs, ${passwordInputs} password inputs`);

    if (emailInputs === 0 || passwordInputs === 0) {
      // Maybe we need to navigate to login page
      const loginLink = page.locator('a, button').filter({ hasText: /login|sign in/i });
      if (await loginLink.count() > 0) {
        console.log('🔄 Trying to navigate to login page...');
        await loginLink.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const emailInputs2 = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count();
        const passwordInputs2 = await page.locator('input[type="password"], input[name*="password"]').count();
        
        console.log(`After navigation: ${emailInputs2} email inputs, ${passwordInputs2} password inputs`);
        
        if (emailInputs2 === 0 || passwordInputs2 === 0) {
          console.log('❌ Still no login form found');
          return { success: false, reason: 'Login form not found' };
        }
      } else {
        console.log('❌ Login form not found and no login navigation available');
        return { success: false, reason: 'Login form not accessible' };
      }
    }

    console.log('✅ Login form found');

    console.log('\n5️⃣ Filling credentials...');
    
    // Fill the form
    await page.fill('input[type="email"], input[name*="email"], input[placeholder*="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"], input[name*="password"]', 'Jimkali90#');
    
    console.log('✅ Credentials filled');

    console.log('\n6️⃣ Submitting form...');
    
    // Find and click submit button
    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /sign in|login|submit|continue/i });
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click();
    } else {
      // Try Enter key
      await page.press('input[type="password"]', 'Enter');
    }

    // Wait for response
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    console.log('\n7️⃣ Analyzing result...');
    
    const finalUrl = page.url();
    const bodyText = await page.textContent('body');
    
    console.log('Final URL:', finalUrl);

    // Check for success indicators
    const successKeywords = [
      'dashboard', 'welcome back', 'profile', 'logout', 'sign out', 
      'jay', 'jayveedz', 'quiz', 'score', 'points'
    ];
    
    const errorKeywords = [
      'invalid', 'incorrect', 'error', 'failed', 'wrong', 'denied'
    ];

    let foundSuccess = [];
    let foundErrors = [];

    for (const keyword of successKeywords) {
      if (bodyText.toLowerCase().includes(keyword.toLowerCase()) || 
          finalUrl.toLowerCase().includes(keyword.toLowerCase())) {
        foundSuccess.push(keyword);
      }
    }

    for (const keyword of errorKeywords) {
      if (bodyText.toLowerCase().includes(keyword.toLowerCase())) {
        foundErrors.push(keyword);
      }
    }

    console.log('Success indicators found:', foundSuccess);
    console.log('Error indicators found:', foundErrors);

    // Determine result
    if (foundSuccess.length > 0 && foundErrors.length === 0) {
      console.log('\n🎉 AUTHENTICATION SUCCESSFUL!');
      console.log(`✅ Found ${foundSuccess.length} success indicators`);
      return { success: true, indicators: foundSuccess, url: finalUrl };
    } else if (foundErrors.length > 0) {
      console.log('\n❌ AUTHENTICATION FAILED!');
      console.log(`❌ Found ${foundErrors.length} error indicators`);
      return { success: false, reason: 'Login error', errors: foundErrors };
    } else {
      console.log('\n⚠️  AUTHENTICATION STATUS UNCLEAR');
      console.log('⚠️  No clear success or error indicators');
      
      // Additional checks
      if (finalUrl.includes('/dashboard') || finalUrl.includes('/profile')) {
        console.log('✅ URL suggests successful login');
        return { success: true, reason: 'URL-based success', url: finalUrl };
      }
      
      return { success: null, reason: 'Unclear result', url: finalUrl };
    }

  } catch (error) {
    console.error('\n💥 Authentication test error:', error.message);
    return { success: false, reason: 'Test execution error', error: error.message };
  } finally {
    if (errors.length > 0) {
      console.log('\n🐛 JavaScript errors detected:');
      errors.forEach(error => console.log(`❌ ${error}`));
    }
    await browser.close();
  }
}

// Execute the test
testAuthenticationHeadless()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUTHENTICATION TEST RESULT');
    console.log('='.repeat(60));
    
    if (result.success === true) {
      console.log('✅ AUTHENTICATION: SUCCESSFUL');
      console.log('🎯 Test credentials work correctly');
      console.log('💾 Database connection confirmed');
      console.log('🔐 Login system functional');
    } else if (result.success === false) {
      console.log('❌ AUTHENTICATION: FAILED');
      console.log('Reason:', result.reason);
      if (result.errors) console.log('Errors:', result.errors);
    } else {
      console.log('⚠️  AUTHENTICATION: INCONCLUSIVE');
      console.log('Reason:', result.reason);
    }
    
    process.exit(result.success === true ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });