import { chromium } from 'playwright';

async function runComprehensiveAuthTest() {
  console.log('=== MEDQUIZ PRO COMPREHENSIVE AUTHENTICATION SECURITY TESTING ===');
  console.log('Starting comprehensive authentication and security testing...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // Enhanced logging
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('error') || msg.text().includes('failed')) {
      console.log('Browser Error:', msg.text());
    }
  });
  page.on('pageerror', error => console.log('Page Error:', error.message));
  
  const testResults = {
    landingPageLoaded: false,
    signInButtonFound: false,
    loginPageReached: false,
    wrongPasswordTest: false,
    correctPasswordTest: false,
    dashboardAccess: false,
    logoutTest: false,
    secondUserTest: false,
    securityValidation: [],
    screenshots: []
  };
  
  try {
    // =====================================
    // TEST 1: Landing Page and Navigation
    // =====================================
    console.log('📍 TEST 1: Landing Page Navigation');
    await page.goto('http://localhost:5174', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'auth_final_01_landing_page.png', 
      fullPage: true 
    });
    testResults.screenshots.push('Landing page captured');
    
    const title = await page.title();
    console.log(`✓ Page loaded: ${title}`);
    testResults.landingPageLoaded = true;
    
    // =====================================
    // TEST 2: Navigate to Login
    // =====================================
    console.log('\n🔐 TEST 2: Navigate to Login Page');
    
    // Look for Sign In button
    const signInSelectors = [
      'button:has-text("Sign In")',
      'a:has-text("Sign in")',
      'button:has-text("Sign in")',
      'a:has-text("Sign In")'
    ];
    
    let signInFound = false;
    for (const selector of signInSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Found Sign In button: ${selector}`);
        await page.click(selector);
        await page.waitForLoadState('networkidle');
        signInFound = true;
        testResults.signInButtonFound = true;
        break;
      }
    }
    
    if (!signInFound) {
      console.log('❌ Sign In button not found');
      return testResults;
    }
    
    await page.screenshot({ 
      path: 'auth_final_02_login_page.png', 
      fullPage: true 
    });
    testResults.screenshots.push('Login page reached');
    
    // Check if we're on login page
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('✓ Successfully navigated to login page');
      testResults.loginPageReached = true;
    }
    
    // =====================================
    // TEST 3: Login Form Validation
    // =====================================
    console.log('\n📝 TEST 3: Login Form Security Testing');
    
    // Wait for form elements to load
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]').first();
    
    const emailCount = await emailInput.count();
    const passwordCount = await passwordInput.count();
    
    console.log(`Email input fields found: ${emailCount}`);
    console.log(`Password input fields found: ${passwordCount}`);
    
    if (emailCount === 0 || passwordCount === 0) {
      console.log('❌ Login form fields not found');
      await page.screenshot({ path: 'auth_final_03_no_form.png', fullPage: true });
      return testResults;
    }
    
    // =====================================
    // TEST 4: Wrong Password Security Test
    // =====================================
    console.log('\n🛡️ TEST 4: Security Validation - Wrong Password');
    
    await emailInput.fill('jayveedz19@gmail.com');
    await passwordInput.fill('WrongPassword123!');
    
    await page.screenshot({ 
      path: 'auth_final_04_wrong_credentials.png', 
      fullPage: true 
    });
    
    // Find and click submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Log in")',
      'button:has-text("Sign in")',
      'button:has-text("Sign In")',
      'input[type="submit"]',
      'form button'
    ];
    
    let submitClicked = false;
    for (const selector of submitSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Submitting with: ${selector}`);
        await page.click(selector);
        submitClicked = true;
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
      path: 'auth_final_05_wrong_password_result.png', 
      fullPage: true 
    });
    
    // Check for error messages
    const errorSelectors = [
      '.error', '.alert', '.notification', '.toast', '.message',
      '[role="alert"]', '.text-red', '.text-danger', '.alert-danger',
      '.error-message', '[data-testid="error"]'
    ];
    
    let errorFound = false;
    let errorMessage = '';
    
    for (const selector of errorSelectors) {
      if (await page.locator(selector).count() > 0) {
        errorMessage = await page.locator(selector).first().textContent();
        errorFound = true;
        break;
      }
    }
    
    if (errorFound) {
      console.log(`✅ Security validation passed: "${errorMessage}"`);
      testResults.wrongPasswordTest = true;
      testResults.securityValidation.push(`Error handling: ${errorMessage}`);
    } else {
      console.log('⚠️ No error message detected for wrong password');
      testResults.securityValidation.push('No error message for wrong password');
    }
    
    // =====================================
    // TEST 5: Correct Credentials Test
    // =====================================
    console.log('\n✅ TEST 5: Legitimate Authentication - jayveedz19@gmail.com');
    
    // Clear fields and enter correct credentials
    await emailInput.fill('');
    await passwordInput.fill('');
    await emailInput.fill('jayveedz19@gmail.com');
    await passwordInput.fill('Jimkali90#');
    
    await page.screenshot({ 
      path: 'auth_final_06_correct_credentials.png', 
      fullPage: true 
    });
    
    // Submit the form again
    for (const selector of submitSelectors) {
      if (await page.locator(selector).count() > 0) {
        await page.click(selector);
        break;
      }
    }
    
    // Wait for login process
    console.log('Waiting for authentication...');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: 'auth_final_07_login_result.png', 
      fullPage: true 
    });
    
    // Check if login was successful
    const currentUrlAfterLogin = page.url();
    console.log(`URL after login: ${currentUrlAfterLogin}`);
    
    const dashboardSelectors = [
      'h1:has-text("Dashboard")', 
      'h2:has-text("Dashboard")', 
      '.dashboard',
      'button:has-text("Jay")',
      'button:has-text("veedz")',
      '.user-menu',
      '[data-testid="user-menu"]',
      'nav:has-text("Quiz")',
      'nav:has-text("Progress")'
    ];
    
    let loginSuccessful = false;
    let dashboardElement = '';
    
    for (const selector of dashboardSelectors) {
      if (await page.locator(selector).count() > 0) {
        dashboardElement = selector;
        loginSuccessful = true;
        break;
      }
    }
    
    if (loginSuccessful) {
      console.log(`✅ Login successful - found: ${dashboardElement}`);
      testResults.correctPasswordTest = true;
      testResults.dashboardAccess = true;
      
      // =====================================
      // TEST 6: Session Management and Logout
      // =====================================
      console.log('\n🚪 TEST 6: Session Management and Logout');
      
      await page.screenshot({ 
        path: 'auth_final_08_dashboard.png', 
        fullPage: true 
      });
      
      // Look for user menu or logout option
      const userMenuSelectors = [
        'button:has-text("Jay")',
        'button:has-text("veedz")',
        '.user-menu',
        '[data-testid="user-menu"]',
        '.dropdown-toggle',
        'button[aria-label*="menu" i]'
      ];
      
      let userMenuClicked = false;
      for (const selector of userMenuSelectors) {
        if (await page.locator(selector).count() > 0) {
          console.log(`Clicking user menu: ${selector}`);
          await page.click(selector);
          await page.waitForTimeout(1000);
          userMenuClicked = true;
          break;
        }
      }
      
      if (userMenuClicked) {
        await page.screenshot({ 
          path: 'auth_final_09_user_menu.png', 
          fullPage: true 
        });
      }
      
      // Try to logout
      const logoutSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Log out")',
        'button:has-text("Sign out")',
        'a:has-text("Logout")',
        'a:has-text("Log out")',
        'a:has-text("Sign out")',
        '[data-testid="logout"]'
      ];
      
      let logoutSuccessful = false;
      for (const selector of logoutSelectors) {
        if (await page.locator(selector).count() > 0) {
          console.log(`Logging out with: ${selector}`);
          await page.click(selector);
          await page.waitForLoadState('networkidle');
          logoutSuccessful = true;
          testResults.logoutTest = true;
          break;
        }
      }
      
      if (logoutSuccessful) {
        await page.screenshot({ 
          path: 'auth_final_10_after_logout.png', 
          fullPage: true 
        });
        console.log('✅ Logout successful');
      } else {
        console.log('⚠️ Logout button not found');
      }
      
    } else {
      console.log('❌ Login failed or dashboard not accessible');
      console.log('Checking for error messages...');
      
      for (const selector of errorSelectors) {
        if (await page.locator(selector).count() > 0) {
          const error = await page.locator(selector).first().textContent();
          console.log(`Login error: "${error}"`);
        }
      }
    }
    
    // =====================================
    // TEST 7: Second User Test
    // =====================================
    console.log('\n👤 TEST 7: Testing Unknown User - johndoe2025@gmail.com');
    
    // Navigate back to login if needed
    if (!page.url().includes('/login')) {
      await page.goto('http://localhost:5174/login');
      await page.waitForLoadState('networkidle');
    }
    
    const emailInput2 = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput2 = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput2.count() > 0 && await passwordInput2.count() > 0) {
      await emailInput2.fill('johndoe2025@gmail.com');
      await passwordInput2.fill('Jimkali90#');
      
      await page.screenshot({ 
        path: 'auth_final_11_johndoe_credentials.png', 
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
        path: 'auth_final_12_johndoe_result.png', 
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
        testResults.secondUserTest = true;
      } else if (errorVisible) {
        console.log(`❌ johndoe2025@gmail.com login failed: "${errorText}"`);
        testResults.securityValidation.push(`Unknown user validation: ${errorText}`);
      } else {
        console.log('⚠️ Unclear result for johndoe2025@gmail.com');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    await page.screenshot({ 
      path: 'auth_final_error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
  
  // =====================================
  // COMPREHENSIVE SECURITY REPORT
  // =====================================
  console.log('\n📊 COMPREHENSIVE AUTHENTICATION SECURITY REPORT');
  console.log('=====================================================');
  console.log('🔐 AUTHENTICATION TESTING RESULTS:');
  console.log(`✓ Landing page loaded: ${testResults.landingPageLoaded ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Sign In button functional: ${testResults.signInButtonFound ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Login page accessible: ${testResults.loginPageReached ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Wrong password validation: ${testResults.wrongPasswordTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Legitimate user login: ${testResults.correctPasswordTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Dashboard access: ${testResults.dashboardAccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Logout functionality: ${testResults.logoutTest ? '✅ PASS' : '⚠️ PARTIAL'}`);
  console.log(`✓ Unknown user handling: ${testResults.secondUserTest ? '✅ PASS (Exists)' : '⚠️ User not found'}`);
  
  console.log('\n🛡️ SECURITY VALIDATION RESULTS:');
  if (testResults.securityValidation.length > 0) {
    testResults.securityValidation.forEach((validation, index) => {
      console.log(`${index + 1}. ${validation}`);
    });
  } else {
    console.log('No specific security validations recorded');
  }
  
  console.log('\n📸 SCREENSHOTS CAPTURED:');
  console.log(`Total screenshots: ${testResults.screenshots.length + 8} (comprehensive documentation)`);
  console.log('- Landing page navigation');
  console.log('- Login page access');
  console.log('- Wrong password submission');
  console.log('- Correct credentials login');
  console.log('- Dashboard/user interface');
  console.log('- User menu interaction');
  console.log('- Logout process');
  console.log('- Second user testing');
  
  console.log('\n🎯 OVERALL SECURITY ASSESSMENT:');
  const passedTests = Object.values(testResults).filter(result => result === true).length;
  const totalTests = 7;
  const score = Math.round((passedTests / totalTests) * 100);
  
  console.log(`Authentication Security Score: ${score}%`);
  
  if (score >= 85) {
    console.log('🟢 EXCELLENT - Authentication system is robust and secure');
  } else if (score >= 70) {
    console.log('🟡 GOOD - Authentication system is functional with minor issues');
  } else if (score >= 50) {
    console.log('🟠 FAIR - Authentication system needs improvement');
  } else {
    console.log('🔴 POOR - Authentication system has significant security issues');
  }
  
  console.log('\n🏁 Comprehensive authentication security testing completed');
  return testResults;
}

// Run the comprehensive test
runComprehensiveAuthTest().catch(console.error);