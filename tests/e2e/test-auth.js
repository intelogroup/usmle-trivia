// This script will be run with npx playwright
console.log('🚀 Starting authentication testing for USMLE Trivia...');

async function testAuthenticationWithPlaywright() {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`📱 Console [${msg.type()}]:`, msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });
  
  // Enable network failure logging
  page.on('requestfailed', request => {
    console.error('🌐 Network Error:', request.url(), request.failure().errorText);
  });
  
  try {
    console.log('📍 Step 1: Navigating to https://usmle-trivia.netlify.app');
    await page.goto('https://usmle-trivia.netlify.app', { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    await page.screenshot({ path: '/root/repo/screenshot-1-landing.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshot-1-landing.png');
    
    // Wait for React app to load
    await page.waitForTimeout(3000);
    
    console.log('📍 Step 2: Looking for authentication elements...');
    
    // Look for common authentication elements
    const loginButton = await page.locator('button:has-text("Login"), button:has-text("Log In"), a:has-text("Login"), a:has-text("Log In")').first();
    const registerButton = await page.locator('button:has-text("Register"), button:has-text("Sign Up"), a:has-text("Register"), a:has-text("Sign Up")').first();
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
    
    // Check what's visible on the page
    const pageTitle = await page.title();
    console.log('📄 Page Title:', pageTitle);
    
    const bodyText = await page.locator('body').textContent();
    console.log('📝 Page contains login-related text:', bodyText.toLowerCase().includes('login') || bodyText.toLowerCase().includes('sign'));
    
    // Try to find navigation or auth buttons
    const allButtons = await page.locator('button, a[role="button"]').all();
    console.log(`🔘 Found ${allButtons.length} buttons/links on page`);
    
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const text = await allButtons[i].textContent();
      console.log(`  Button ${i + 1}: "${text?.trim()}"`);
    }
    
    // Take screenshot after page loads
    await page.screenshot({ path: '/root/repo/screenshot-2-loaded.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshot-2-loaded.png');
    
    console.log('📍 Step 3: Attempting to find and access registration...');
    
    // Try different ways to access registration
    let registrationFound = false;
    
    // Method 1: Look for register/signup button
    if (await registerButton.count() > 0) {
      console.log('✅ Found register button, clicking...');
      await registerButton.click();
      await page.waitForTimeout(2000);
      registrationFound = true;
    }
    // Method 2: Look for navigation menu
    else {
      const navItems = await page.locator('nav a, .nav a, [role="navigation"] a').all();
      for (const navItem of navItems) {
        const text = await navItem.textContent();
        if (text && (text.toLowerCase().includes('register') || text.toLowerCase().includes('sign'))) {
          console.log('✅ Found register link in navigation, clicking...');
          await navItem.click();
          await page.waitForTimeout(2000);
          registrationFound = true;
          break;
        }
      }
    }
    
    // Method 3: Try common registration URLs
    if (!registrationFound) {
      console.log('🔍 Trying direct navigation to /register...');
      await page.goto('https://usmle-trivia.netlify.app/register', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: '/root/repo/screenshot-3-register-attempt.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshot-3-register-attempt.png');
    
    console.log('📍 Step 4: Testing registration form...');
    
    // Look for registration form fields
    const regEmailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const regPasswordInput = await page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
    const regSubmitButton = await page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up"), button:has-text("Create")').first();
    
    if (await regEmailInput.count() > 0 && await regPasswordInput.count() > 0) {
      console.log('✅ Found registration form fields');
      
      // Fill in test credentials
      await regEmailInput.fill('testuser@example.com');
      await regPasswordInput.fill('TestPass123!');
      
      // Look for additional fields (name, confirm password, etc.)
      const nameInput = await page.locator('input[name="name"], input[name="firstName"], input[name="fullName"], input[placeholder*="name" i]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test User');
        console.log('✅ Filled name field');
      }
      
      const confirmPasswordInput = await page.locator('input[name="confirmPassword"], input[name="passwordConfirm"], input[placeholder*="confirm" i]').first();
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill('TestPass123!');
        console.log('✅ Filled confirm password field');
      }
      
      await page.screenshot({ path: '/root/repo/screenshot-4-register-filled.png', fullPage: true });
      console.log('📸 Screenshot saved: screenshot-4-register-filled.png');
      
      if (await regSubmitButton.count() > 0) {
        console.log('🚀 Attempting to submit registration...');
        await regSubmitButton.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: '/root/repo/screenshot-5-register-submitted.png', fullPage: true });
        console.log('📸 Screenshot saved: screenshot-5-register-submitted.png');
      } else {
        console.log('❌ No submit button found for registration');
      }
    } else {
      console.log('❌ Registration form fields not found');
    }
    
    console.log('📍 Step 5: Testing login functionality...');
    
    // Try to access login page
    await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Or try to find login button
    const loginBtn = await page.locator('button:has-text("Login"), button:has-text("Log In"), a:has-text("Login"), a:has-text("Log In")').first();
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: '/root/repo/screenshot-6-login-page.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshot-6-login-page.png');
    
    // Look for login form
    const loginEmailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const loginPasswordInput = await page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
    const loginSubmitButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Log In"), button:has-text("Sign In")').first();
    
    if (await loginEmailInput.count() > 0 && await loginPasswordInput.count() > 0) {
      console.log('✅ Found login form fields');
      
      // Try with the test credentials we just created
      await loginEmailInput.fill('testuser@example.com');
      await loginPasswordInput.fill('TestPass123!');
      
      await page.screenshot({ path: '/root/repo/screenshot-7-login-filled.png', fullPage: true });
      console.log('📸 Screenshot saved: screenshot-7-login-filled.png');
      
      if (await loginSubmitButton.count() > 0) {
        console.log('🚀 Attempting to submit login...');
        await loginSubmitButton.click();
        await page.waitForTimeout(5000); // Wait longer for authentication
        
        await page.screenshot({ path: '/root/repo/screenshot-8-login-submitted.png', fullPage: true });
        console.log('📸 Screenshot saved: screenshot-8-login-submitted.png');
        
        // Check if we're redirected to dashboard or authenticated area
        const currentUrl = page.url();
        console.log('📍 Current URL after login attempt:', currentUrl);
        
        // Look for authenticated user indicators
        const userMenu = await page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile"), button:has-text("Logout")').first();
        if (await userMenu.count() > 0) {
          console.log('✅ Authentication appears successful - found user menu');
        }
        
      } else {
        console.log('❌ No submit button found for login');
      }
    } else {
      console.log('❌ Login form fields not found');
    }
    
    console.log('📍 Step 6: Testing with existing credentials from documentation...');
    
    // Try with the documented test user: jayveedz19@gmail.com / Jimkali90#
    if (await loginEmailInput.count() > 0) {
      await loginEmailInput.fill('jayveedz19@gmail.com');
      await loginPasswordInput.fill('Jimkali90#');
      
      await page.screenshot({ path: '/root/repo/screenshot-9-existing-user.png', fullPage: true });
      console.log('📸 Screenshot saved: screenshot-9-existing-user.png');
      
      if (await loginSubmitButton.count() > 0) {
        console.log('🚀 Attempting login with existing user credentials...');
        await loginSubmitButton.click();
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: '/root/repo/screenshot-10-existing-user-result.png', fullPage: true });
        console.log('📸 Screenshot saved: screenshot-10-existing-user-result.png');
        
        const currentUrl = page.url();
        console.log('📍 Current URL after existing user login:', currentUrl);
      }
    }
    
    console.log('📍 Step 7: Final site analysis...');
    
    // Navigate back to home and analyze the overall structure
    await page.goto('https://usmle-trivia.netlify.app', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all text content for analysis
    const allText = await page.locator('body').textContent();
    console.log('📊 Site Analysis:');
    console.log('  - Contains "quiz":', allText.toLowerCase().includes('quiz'));
    console.log('  - Contains "login":', allText.toLowerCase().includes('login'));
    console.log('  - Contains "register":', allText.toLowerCase().includes('register'));
    console.log('  - Contains "medical":', allText.toLowerCase().includes('medical'));
    console.log('  - Contains "usmle":', allText.toLowerCase().includes('usmle'));
    
    // Check network requests
    console.log('🌐 Monitoring network requests...');
    page.on('response', response => {
      if (response.url().includes('auth') || response.url().includes('login') || response.url().includes('register')) {
        console.log(`🌐 Auth-related request: ${response.status()} ${response.url()}`);
      }
    });
    
    await page.screenshot({ path: '/root/repo/screenshot-11-final-analysis.png', fullPage: true });
    console.log('📸 Screenshot saved: screenshot-11-final-analysis.png');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    await page.screenshot({ path: '/root/repo/screenshot-error.png', fullPage: true });
    console.log('📸 Error screenshot saved: screenshot-error.png');
  } finally {
    await browser.close();
    console.log('✅ Testing completed!');
  }
}

testAuthentication().catch(console.error);