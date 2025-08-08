const { chromium } = require('playwright');

async function testRealAuthentication() {
  console.log('🔐 Testing Real User Authentication');
  console.log('📋 Using documented test credentials from DEVELOPER_HANDOFF.md');
  console.log('👤 Email: jayveedz19@gmail.com');
  console.log('🔑 Password: Jimkali90#');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000, // Slow down for observation
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // Step 1: Navigate to the application
    console.log('\n1️⃣ Navigating to application...');
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
    console.log('✅ Application loaded');

    // Take initial screenshot
    await page.screenshot({ path: '/root/repo/test-auth-01-homepage.png' });

    // Step 2: Look for authentication elements
    console.log('\n2️⃣ Looking for authentication elements...');
    await page.waitForTimeout(3000);
    
    // Check current page content
    const pageContent = await page.textContent('body');
    console.log(`Page contains ${pageContent.length} characters of content`);

    // Look for login/signin elements
    const authElements = await page.locator('button, a, div').filter({ 
      hasText: /sign in|login|log in|get started|sign up/i 
    }).count();
    
    console.log(`Found ${authElements} authentication-related elements`);

    // Try multiple strategies to find login
    let loginFound = false;
    let loginElement = null;

    // Strategy 1: Direct login button
    const loginBtn1 = page.locator('button').filter({ hasText: /sign in|login|log in/i });
    if (await loginBtn1.count() > 0) {
      loginElement = loginBtn1.first();
      loginFound = true;
      console.log('✅ Found login button');
    }

    // Strategy 2: Login link
    if (!loginFound) {
      const loginLink = page.locator('a').filter({ hasText: /sign in|login|log in/i });
      if (await loginLink.count() > 0) {
        loginElement = loginLink.first();
        loginFound = true;
        console.log('✅ Found login link');
      }
    }

    // Strategy 3: Get started button (may lead to auth)
    if (!loginFound) {
      const getStartedBtn = page.locator('button, a').filter({ hasText: /get started|start|begin/i });
      if (await getStartedBtn.count() > 0) {
        loginElement = getStartedBtn.first();
        loginFound = true;
        console.log('✅ Found get started button');
      }
    }

    if (!loginFound) {
      console.log('❌ No authentication elements found');
      
      // Debug: Show all buttons and links
      const allButtons = await page.locator('button').allTextContents();
      const allLinks = await page.locator('a').allTextContents();
      
      console.log('🔍 All buttons found:', allButtons);
      console.log('🔍 All links found:', allLinks);
      
      await browser.close();
      return false;
    }

    // Step 3: Click on authentication element
    console.log('\n3️⃣ Clicking on authentication element...');
    await loginElement.click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Take screenshot after click
    await page.screenshot({ path: '/root/repo/test-auth-02-after-click.png' });

    // Step 4: Look for login form
    console.log('\n4️⃣ Looking for login form...');
    await page.waitForTimeout(2000);

    const emailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count();
    const passwordInputs = await page.locator('input[type="password"], input[name*="password"]').count();

    console.log(`Found ${emailInputs} email inputs and ${passwordInputs} password inputs`);

    if (emailInputs === 0 || passwordInputs === 0) {
      console.log('❌ Login form not found');
      
      // Check current URL and content
      console.log('Current URL:', page.url());
      const currentContent = await page.textContent('body');
      console.log('Page content preview:', currentContent.substring(0, 200) + '...');
      
      await browser.close();
      return false;
    }

    console.log('✅ Login form found');

    // Step 5: Fill login form
    console.log('\n5️⃣ Filling login form with test credentials...');
    
    await page.fill('input[type="email"], input[name*="email"], input[placeholder*="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"], input[name*="password"]', 'Jimkali90#');
    
    console.log('✅ Credentials filled');
    
    // Take screenshot with filled form
    await page.screenshot({ path: '/root/repo/test-auth-03-form-filled.png' });

    // Step 6: Submit form
    console.log('\n6️⃣ Submitting login form...');
    
    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /sign in|login|submit/i });
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click();
      console.log('✅ Form submitted');
    } else {
      // Try pressing Enter
      await page.press('input[type="password"]', 'Enter');
      console.log('✅ Form submitted via Enter key');
    }

    // Wait for response
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Step 7: Check result
    console.log('\n7️⃣ Checking authentication result...');
    
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    const finalContent = await page.textContent('body');
    
    console.log('Final URL:', finalUrl);
    
    // Take final screenshot
    await page.screenshot({ path: '/root/repo/test-auth-04-final-result.png' });

    // Check for success indicators
    const successIndicators = [
      'dashboard', 'welcome', 'profile', 'logout', 'quiz', 'jayveedz', 'jay'
    ];
    
    let loginSuccess = false;
    for (const indicator of successIndicators) {
      if (finalContent.toLowerCase().includes(indicator) || finalUrl.toLowerCase().includes(indicator)) {
        console.log(`✅ Success indicator found: "${indicator}"`);
        loginSuccess = true;
        break;
      }
    }

    // Check for error indicators
    const errorIndicators = [
      'error', 'invalid', 'incorrect', 'failed', 'wrong'
    ];
    
    let hasError = false;
    for (const indicator of errorIndicators) {
      if (finalContent.toLowerCase().includes(indicator)) {
        console.log(`❌ Error indicator found: "${indicator}"`);
        hasError = true;
        break;
      }
    }

    if (loginSuccess && !hasError) {
      console.log('\n🎉 AUTHENTICATION SUCCESSFUL!');
      console.log('✅ User successfully logged in with test credentials');
      return true;
    } else if (hasError) {
      console.log('\n❌ AUTHENTICATION FAILED!');
      console.log('❌ Login form returned error');
      return false;
    } else {
      console.log('\n⚠️  AUTHENTICATION STATUS UNCLEAR');
      console.log('⚠️  No clear success or error indicators found');
      return null;
    }

  } catch (error) {
    console.error('\n💥 Authentication test failed:', error.message);
    await page.screenshot({ path: '/root/repo/test-auth-error.png' });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the authentication test
testRealAuthentication()
  .then(result => {
    if (result === true) {
      console.log('\n✅ Authentication test PASSED');
      process.exit(0);
    } else if (result === false) {
      console.log('\n❌ Authentication test FAILED');
      process.exit(1);
    } else {
      console.log('\n⚠️  Authentication test INCONCLUSIVE');
      process.exit(2);
    }
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });