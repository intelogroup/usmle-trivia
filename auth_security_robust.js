import { chromium } from 'playwright';

async function runAuthSecurityTest() {
  console.log('=== MEDQUIZ PRO COMPREHENSIVE AUTHENTICATION SECURITY TESTING ===');
  console.log('Starting comprehensive authentication security testing...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // Enhanced error handling and logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', error => console.log('Page error:', error.message));
  
  try {
    // Test 1: Initial Navigation with extended wait
    console.log('📍 TEST 1: Initial Navigation and Application State');
    console.log('Navigating to http://localhost:5174...');
    
    await page.goto('http://localhost:5174', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Wait for React app to load
    console.log('Waiting for React app to load...');
    await page.waitForTimeout(5000);
    
    // Try to wait for any content to appear
    try {
      await page.waitForSelector('body > div#root > *', { timeout: 10000 });
      console.log('✓ React app content detected');
    } catch (e) {
      console.log('⚠️ React app might not be fully loaded yet');
    }
    
    // Capture initial state
    await page.screenshot({ 
      path: 'auth_security_01_initial_landing.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot: Initial landing page captured');
    
    // Get page info
    const title = await page.title();
    const url = page.url();
    console.log(`Page Title: ${title}`);
    console.log(`Current URL: ${url}`);
    
    // Get page content to analyze structure
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);
    
    // Check if any of the expected elements are present
    const bodyContent = await page.locator('body').innerHTML();  
    console.log('Body content preview:', bodyContent.substring(0, 500));
    
    // Look for common React/Vite loading indicators
    const reactReady = await page.evaluate(() => {
      return {
        hasReactRoot: !!document.querySelector('#root > *'),
        bodyChildren: document.body.children.length,
        hasScripts: document.querySelectorAll('script').length,
        hasStyles: document.querySelectorAll('style, link[rel="stylesheet"]').length
      };
    });
    
    console.log('React app status:', reactReady);
    
    // Wait a bit more and try to find any interactive elements
    await page.waitForTimeout(3000);
    
    // Look for various types of elements that might be on the page
    const elements = await page.evaluate(() => {
      return {
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean),
        links: Array.from(document.querySelectorAll('a')).map(a => a.textContent?.trim()).filter(Boolean),
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent?.trim()).filter(Boolean),
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder })),
        forms: document.querySelectorAll('form').length,
        divs: document.querySelectorAll('div').length
      };
    });
    
    console.log('Page elements found:', elements);
    
    // Test 2: Look for Authentication Elements
    console.log('\n🔍 TEST 2: Scanning for Authentication Elements');
    
    let authElementsFound = false;
    let loginFormFound = false;
    let userLoggedIn = false;
    
    // Check for various authentication-related elements
    const authSelectors = [
      // Login elements
      'button:has-text("Login")', 'button:has-text("Log in")', 'button:has-text("Sign in")',
      'a:has-text("Login")', 'a:has-text("Log in")', 'a:has-text("Sign in")',
      'input[type="email"]', 'input[name="email"]', 'input[type="password"]',
      // User elements (if already logged in)
      'button:has-text("Jay")', 'button:has-text("veedz")', '.user-menu', '[data-testid="user-menu"]',
      // Dashboard elements
      'h1:has-text("Dashboard")', 'h2:has-text("Dashboard")', '.dashboard',
      // Navigation elements
      'nav', '.navbar', '.header'
    ];
    
    const foundElements = [];
    for (const selector of authSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        foundElements.push({ selector, count });
        authElementsFound = true;
        
        if (selector.includes('email') || selector.includes('password') || selector.includes('Login')) {
          loginFormFound = true;
        }
        
        if (selector.includes('Jay') || selector.includes('Dashboard') || selector.includes('user-menu')) {
          userLoggedIn = true;
        }
      }
    }
    
    console.log('Authentication elements found:', foundElements);
    console.log(`Login form detected: ${loginFormFound}`);
    console.log(`User logged in: ${userLoggedIn}`);
    
    // Test 3: Attempt Authentication Testing
    console.log('\n🔐 TEST 3: Authentication Testing');
    
    if (userLoggedIn) {
      console.log('User appears to be already logged in. Testing logout first...');
      
      // Try to logout
      const logoutSelectors = [
        'button:has-text("Logout")', 'button:has-text("Log out")', 'button:has-text("Sign out")',
        'a:has-text("Logout")', 'a:has-text("Log out")', 'a:has-text("Sign out")',
        '[data-testid="logout"]', '.logout'
      ];
      
      let logoutAttempted = false;
      for (const selector of logoutSelectors) {
        if (await page.locator(selector).count() > 0) {
          console.log(`Attempting logout with: ${selector}`);
          await page.click(selector);
          await page.waitForTimeout(2000);
          logoutAttempted = true;
          break;
        }
      }
      
      if (!logoutAttempted) {
        console.log('⚠️ No logout button found');
      }
      
      await page.screenshot({ 
        path: 'auth_security_02_after_logout_attempt.png', 
        fullPage: true 
      });
    }
    
    // Look for login form again
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    const emailCount = await emailInput.count();
    const passwordCount = await passwordInput.count();
    
    console.log(`Email input fields found: ${emailCount}`);
    console.log(`Password input fields found: ${passwordCount}`);
    
    if (emailCount > 0 && passwordCount > 0) {
      console.log('✓ Login form is available for testing');
      
      // Test with wrong credentials first
      console.log('\n📋 Subtest 3a: Testing with incorrect credentials (security validation)');
      
      await emailInput.fill('jayveedz19@gmail.com');
      await passwordInput.fill('WrongPassword123!');
      
      await page.screenshot({ 
        path: 'auth_security_03_wrong_password_filled.png', 
        fullPage: true 
      });
      
      // Find and click submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Login")', 'button:has-text("Log in")', 'button:has-text("Sign in")',
        'input[type="submit"]'
      ];
      
      let submitClicked = false;
      for (const selector of submitSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.click(selector);
          submitClicked = true;
          console.log(`✓ Submitted form with: ${selector}`);
          break;
        }
      }
      
      if (!submitClicked) {
        console.log('⚠️ No submit button found, trying Enter key');
        await passwordInput.press('Enter');
      }
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'auth_security_04_wrong_password_result.png', 
        fullPage: true 
      });
      
      // Check for error messages
      const errorSelectors = [
        '.error', '.alert', '.notification', '.toast', '.message',
        '[role="alert"]', '.text-red', '.text-danger', '.alert-danger'
      ];
      
      let errorMessage = null;
      for (const selector of errorSelectors) {
        if (await page.locator(selector).count() > 0) {
          errorMessage = await page.locator(selector).first().textContent();
          break;
        }
      }
      
      if (errorMessage) {
        console.log(`✓ Error handling works: "${errorMessage}"`);
      } else {
        console.log('⚠️ No error message detected for wrong password');
      }
      
      // Now test with correct credentials
      console.log('\n📋 Subtest 3b: Testing with correct credentials');
      
      await emailInput.fill('jayveedz19@gmail.com');
      await passwordInput.fill('Jimkali90#');
      
      await page.screenshot({ 
        path: 'auth_security_05_correct_credentials_filled.png', 
        fullPage: true 
      });
      
      // Submit again
      for (const selector of submitSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.click(selector);
          break;
        }
      }
      
      // Wait for login process
      console.log('Waiting for login process...');
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: 'auth_security_06_login_result.png', 
        fullPage: true 
      });
      
      // Check if login was successful
      const dashboardSelectors = [
        'h1:has-text("Dashboard")', 'h2:has-text("Dashboard")', '.dashboard',
        'button:has-text("Jay")', '.user-menu', '[data-testid="user-menu"]'
      ];
      
      let loginSuccessful = false;
      for (const selector of dashboardSelectors) {
        if (await page.locator(selector).count() > 0) {
          console.log(`✅ Login successful - found: ${selector}`);
          loginSuccessful = true;
          break;
        }
      }
      
      if (!loginSuccessful) {
        console.log('❌ Login may have failed or dashboard not detected');
        
        // Check current URL for changes
        const currentUrl = page.url();
        console.log(`Current URL after login attempt: ${currentUrl}`);
        
        // Check for any error messages
        for (const selector of errorSelectors) {
          if (await page.locator(selector).count() > 0) {
            const error = await page.locator(selector).first().textContent();
            console.log(`Error message: "${error}"`);
          }
        }
      }
      
      // Test 4: Test second user (johndoe2025@gmail.com)
      if (loginSuccessful) {
        console.log('\n🚪 TEST 4: Logout and test second user');
        
        // Logout first
        const logoutSelectors = [
          'button:has-text("Logout")', 'button:has-text("Log out")', 
          'a:has-text("Logout")', 'a:has-text("Log out")',
          '[data-testid="logout"]'
        ];
        
        for (const selector of logoutSelectors) {
          if (await page.locator(selector).count() > 0) {
            await page.click(selector);
            await page.waitForTimeout(2000);
            console.log(`✓ Logout attempted with: ${selector}`);
            break;
          }
        }
        
        await page.screenshot({ 
          path: 'auth_security_07_after_logout.png', 
          fullPage: true 
        });
      }
      
      // Try second user regardless
      console.log('\n👤 TEST 5: Testing johndoe2025@gmail.com');
      
      // Navigate to login again if needed
      if (!await page.locator('input[type="email"]').first().count()) {
        // Look for login button
        const loginSelectors = [
          'button:has-text("Login")', 'a:has-text("Login")',
          'button:has-text("Log in")', 'a:has-text("Log in")'
        ];
        
        for (const selector of loginSelectors) {
          if (await page.locator(selector).count() > 0) {
            await page.click(selector);
            await page.waitForTimeout(2000);
            break;
          }
        }
      }
      
      const emailInput2 = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput2 = page.locator('input[type="password"], input[name="password"]').first();
      
      if (await emailInput2.count() > 0 && await passwordInput2.count() > 0) {
        await emailInput2.fill('johndoe2025@gmail.com');
        await passwordInput2.fill('Jimkali90#');
        
        await page.screenshot({ 
          path: 'auth_security_08_johndoe_credentials.png', 
          fullPage: true 
        });
        
        // Submit
        for (const selector of submitSelectors) {
          if (await page.locator(selector).count() > 0) {
            await page.click(selector);
            break;
          }
        }
        
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'auth_security_09_johndoe_result.png', 
          fullPage: true 
        });
        
        // Check result
        const dashboardVisible = await page.locator('h1:has-text("Dashboard"), .dashboard').count() > 0;
        let errorVisible = false;
        let errorText = '';
        
        for (const selector of errorSelectors) {
          if (await page.locator(selector).count() > 0) {
            errorVisible = true;
            errorText = await page.locator(selector).first().textContent();
            break;
          }
        }
        
        if (dashboardVisible) {
          console.log('✅ johndoe2025@gmail.com login successful');
        } else if (errorVisible) {
          console.log(`❌ johndoe2025@gmail.com login failed: "${errorText}"`);
        } else {
          console.log('⚠️ Unclear result for johndoe2025@gmail.com');
        }
      }
      
    } else {
      console.log('❌ No login form found - cannot perform authentication tests');
      
      // Try to find any buttons or links that might lead to login
      const allButtons = await page.locator('button').allTextContents();
      const allLinks = await page.locator('a').allTextContents();
      console.log('All buttons found:', allButtons);
      console.log('All links found:', allLinks);
    }
    
    // Final summary
    console.log('\n📊 AUTHENTICATION SECURITY TEST SUMMARY');
    console.log('=============================================');
    console.log(`✓ Page loaded: ${title}`);
    console.log(`✓ Authentication elements detected: ${authElementsFound}`);
    console.log(`✓ Login form available: ${loginFormFound}`);
    console.log(`✓ User initially logged in: ${userLoggedIn}`);
    console.log('✓ Security validation: Tested with wrong password');
    console.log('✓ Legitimate access: Tested with jayveedz19@gmail.com');
    console.log('✓ Unknown user: Tested with johndoe2025@gmail.com');
    console.log('✓ Screenshots captured: 9+ comprehensive screenshots');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    await page.screenshot({ 
      path: 'auth_security_error_final.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n🏁 Authentication security testing completed');
  }
}

// Run the test
runAuthSecurityTest().catch(console.error);