const { chromium } = require('playwright');
const fs = require('fs');

async function comprehensiveAuthTest() {
  console.log('🚀 Starting Comprehensive Authentication System Test');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      total: 0
    }
  };
  
  async function test(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    testResults.summary.total++;
    
    try {
      await testFn();
      console.log(`✅ PASSED: ${name}`);
      testResults.tests.push({ name, status: 'PASSED', error: null });
      testResults.summary.passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${name} - ${error.message}`);
      testResults.tests.push({ name, status: 'FAILED', error: error.message });
      testResults.summary.failed++;
    }
  }
  
  async function screenshot(name) {
    const filename = `auth-test-${name}.png`;
    await page.screenshot({ 
      path: filename, 
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }
  
  try {
    // Test 1: Initial page load
    await test('Initial Application Load', async () => {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await screenshot('01-homepage');
      
      const title = await page.title();
      if (!title || title === '') {
        throw new Error('Page title is empty');
      }
      
      // Check if page has loaded properly
      const body = await page.locator('body').textContent();
      if (!body || body.length < 100) {
        throw new Error('Page content appears to be empty or minimal');
      }
    });
    
    // Test 2: Navigation to Registration
    await test('Navigate to Registration', async () => {
      // Look for registration/signup links or buttons
      const signupSelectors = [
        'text="Sign Up"',
        'text="Register"',
        'text="Create Account"',
        'text="Get Started"',
        'a[href*="register"]',
        'button[data-testid*="signup"]',
        'button[data-testid*="register"]'
      ];
      
      let found = false;
      for (const selector of signupSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click();
            found = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!found) {
        // Try to navigate directly to registration page
        await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
      }
      
      await page.waitForTimeout(2000);
      await screenshot('02-registration-page');
      
      // Verify we're on a registration-like page
      const pageText = await page.locator('body').textContent();
      const hasRegistrationContent = pageText.toLowerCase().includes('sign up') || 
                                   pageText.toLowerCase().includes('register') ||
                                   pageText.toLowerCase().includes('create account');
      
      if (!hasRegistrationContent) {
        throw new Error('Registration page not found or not accessible');
      }
    });
    
    // Test 3: User Registration Process
    await test('User Registration Process', async () => {
      // Generate unique test user data
      const timestamp = Date.now();
      const testUser = {
        email: `testuser${timestamp}@medquiz.test`,
        password: 'TestPassword123!',
        name: `Test User ${timestamp}`,
        confirmPassword: 'TestPassword123!'
      };
      
      // Find and fill registration form fields
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email" i]',
        '#email'
      ];
      
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="password" i]',
        '#password'
      ];
      
      const nameSelectors = [
        'input[name="name"]',
        'input[name="fullName"]',
        'input[placeholder*="name" i]',
        '#name',
        '#fullName'
      ];
      
      // Fill email
      let emailFilled = false;
      for (const selector of emailSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.fill(testUser.email);
            emailFilled = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (!emailFilled) {
        throw new Error('Could not find email input field');
      }
      
      // Fill name
      let nameFilled = false;
      for (const selector of nameSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.fill(testUser.name);
            nameFilled = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Fill password (there might be multiple password fields)
      const passwordFields = await page.locator('input[type="password"]').all();
      if (passwordFields.length > 0) {
        await passwordFields[0].fill(testUser.password);
        if (passwordFields.length > 1) {
          // Confirm password field
          await passwordFields[1].fill(testUser.confirmPassword);
        }
      } else {
        throw new Error('Could not find password input field');
      }
      
      await screenshot('03-registration-filled');
      
      // Submit the form
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Sign Up")',
        'button:has-text("Register")',
        'button:has-text("Create Account")',
        '.submit-btn',
        '#submit'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click();
            submitted = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (!submitted) {
        throw new Error('Could not find or click submit button');
      }
      
      // Wait for response and check result
      await page.waitForTimeout(3000);
      await screenshot('04-after-registration');
      
      // Check if registration was successful
      const currentUrl = page.url();
      const pageContent = await page.locator('body').textContent();
      
      // Success indicators
      const successIndicators = [
        currentUrl.includes('/dashboard'),
        currentUrl.includes('/login'),
        pageContent.toLowerCase().includes('success'),
        pageContent.toLowerCase().includes('welcome'),
        pageContent.toLowerCase().includes('account created')
      ];
      
      const hasSuccess = successIndicators.some(indicator => indicator);
      
      if (!hasSuccess) {
        // Check for error messages
        const hasError = pageContent.toLowerCase().includes('error') ||
                        pageContent.toLowerCase().includes('failed') ||
                        pageContent.toLowerCase().includes('invalid');
        
        if (hasError) {
          throw new Error('Registration failed with error message');
        }
      }
      
      // Store test user data for login test
      testResults.testUser = testUser;
    });
    
    // Test 4: Navigation to Login
    await test('Navigate to Login Page', async () => {
      // Try to navigate to login page
      const loginSelectors = [
        'text="Login"',
        'text="Sign In"',
        'a[href*="login"]',
        'button[data-testid*="login"]'
      ];
      
      let found = false;
      for (const selector of loginSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click();
            found = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (!found) {
        // Try direct navigation
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
      }
      
      await page.waitForTimeout(2000);
      await screenshot('05-login-page');
      
      // Verify login page loaded
      const pageText = await page.locator('body').textContent();
      const hasLoginContent = pageText.toLowerCase().includes('login') || 
                             pageText.toLowerCase().includes('sign in');
      
      if (!hasLoginContent) {
        throw new Error('Login page not accessible');
      }
    });
    
    // Test 5: User Login Process
    await test('User Login Process', async () => {
      const testUser = testResults.testUser;
      if (!testUser) {
        // Use default test user if registration didn't work
        testUser = {
          email: 'testuser@medquiz.test',
          password: 'TestPassword123!'
        };
      }
      
      // Fill login form
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.isVisible({ timeout: 2000 })) {
        await emailInput.fill(testUser.email);
      } else {
        throw new Error('Email input not found on login page');
      }
      
      if (await passwordInput.isVisible({ timeout: 2000 })) {
        await passwordInput.fill(testUser.password);
      } else {
        throw new Error('Password input not found on login page');
      }
      
      await screenshot('06-login-filled');
      
      // Submit login form
      const loginButton = page.locator('button[type="submit"]').first();
      if (await loginButton.isVisible({ timeout: 2000 })) {
        await loginButton.click();
      } else {
        // Try other submit button selectors
        const submitSelectors = [
          'button:has-text("Login")',
          'button:has-text("Sign In")',
          'input[type="submit"]'
        ];
        
        let clicked = false;
        for (const selector of submitSelectors) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              await element.click();
              clicked = true;
              break;
            }
          } catch (e) {
            // Continue
          }
        }
        
        if (!clicked) {
          throw new Error('Could not find login submit button');
        }
      }
      
      // Wait for login response
      await page.waitForTimeout(3000);
      await screenshot('07-after-login');
      
      // Check if login was successful
      const currentUrl = page.url();
      const pageContent = await page.locator('body').textContent();
      
      const successIndicators = [
        currentUrl.includes('/dashboard'),
        pageContent.toLowerCase().includes('dashboard'),
        pageContent.toLowerCase().includes('welcome'),
        !pageContent.toLowerCase().includes('login'),
        !pageContent.toLowerCase().includes('sign in')
      ];
      
      const loginSuccessful = successIndicators.some(indicator => indicator);
      
      if (!loginSuccessful) {
        const hasError = pageContent.toLowerCase().includes('error') ||
                        pageContent.toLowerCase().includes('invalid') ||
                        pageContent.toLowerCase().includes('failed');
        
        if (hasError) {
          throw new Error('Login failed with error message');
        } else {
          throw new Error('Login did not redirect to expected page');
        }
      }
    });
    
    // Test 6: Authenticated User Dashboard
    await test('Access Authenticated Dashboard', async () => {
      // Check if we can access dashboard features
      const pageContent = await page.locator('body').textContent();
      
      // Look for dashboard-specific content
      const dashboardIndicators = [
        pageContent.toLowerCase().includes('dashboard'),
        pageContent.toLowerCase().includes('quiz'),
        pageContent.toLowerCase().includes('progress'),
        pageContent.toLowerCase().includes('profile'),
        pageContent.toLowerCase().includes('statistics')
      ];
      
      const hasDashboardContent = dashboardIndicators.some(indicator => indicator);
      
      if (!hasDashboardContent) {
        throw new Error('Dashboard content not found after login');
      }
      
      await screenshot('08-dashboard');
    });
    
    // Test 7: Logout Functionality
    await test('User Logout Process', async () => {
      // Look for logout button/link
      const logoutSelectors = [
        'text="Logout"',
        'text="Sign Out"',
        'text="Log Out"',
        'button[data-testid*="logout"]',
        'a[href*="logout"]',
        '.logout-btn'
      ];
      
      let loggedOut = false;
      for (const selector of logoutSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click();
            loggedOut = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (!loggedOut) {
        // Look for user menu that might contain logout
        const menuSelectors = [
          '.user-menu',
          '.profile-menu',
          '.dropdown-menu',
          '[data-testid*="user-menu"]'
        ];
        
        for (const menuSelector of menuSelectors) {
          try {
            const menu = page.locator(menuSelector).first();
            if (await menu.isVisible({ timeout: 1000 })) {
              await menu.click();
              await page.waitForTimeout(500);
              
              // Now look for logout in the opened menu
              for (const selector of logoutSelectors) {
                try {
                  const element = page.locator(selector).first();
                  if (await element.isVisible({ timeout: 1000 })) {
                    await element.click();
                    loggedOut = true;
                    break;
                  }
                } catch (e) {
                  // Continue
                }
              }
              
              if (loggedOut) break;
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      if (!loggedOut) {
        throw new Error('Could not find logout functionality');
      }
      
      // Wait for logout to complete
      await page.waitForTimeout(2000);
      await screenshot('09-after-logout');
      
      // Verify logout was successful
      const currentUrl = page.url();
      const pageContent = await page.locator('body').textContent();
      
      const logoutIndicators = [
        currentUrl.includes('/login'),
        currentUrl === 'http://localhost:5173/',
        pageContent.toLowerCase().includes('login'),
        pageContent.toLowerCase().includes('sign in'),
        !pageContent.toLowerCase().includes('dashboard')
      ];
      
      const logoutSuccessful = logoutIndicators.some(indicator => indicator);
      
      if (!logoutSuccessful) {
        throw new Error('Logout did not redirect to expected page');
      }
    });
    
    // Test 8: Session Persistence Check
    await test('Session Persistence and Protected Routes', async () => {
      // Try to access a protected route after logout
      await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const pageContent = await page.locator('body').textContent();
      
      // Should redirect to login or show login page
      const protectionWorking = currentUrl.includes('/login') ||
                               pageContent.toLowerCase().includes('login') ||
                               pageContent.toLowerCase().includes('sign in') ||
                               pageContent.toLowerCase().includes('unauthorized');
      
      if (!protectionWorking) {
        throw new Error('Protected routes are not properly secured');
      }
      
      await screenshot('10-protected-route-test');
    });
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`📊 Total: ${testResults.summary.total}`);
    console.log(`📈 Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
    
    // Save detailed results
    fs.writeFileSync('auth-test-results.json', JSON.stringify(testResults, null, 2));
    console.log('\n💾 Detailed results saved to: auth-test-results.json');
    
  } catch (error) {
    console.error('❌ Critical test error:', error);
    await screenshot('ERROR');
    testResults.criticalError = error.message;
  } finally {
    await browser.close();
  }
  
  return testResults;
}

// Run the test
comprehensiveAuthTest()
  .then(results => {
    console.log('\n🎉 Authentication testing completed!');
    process.exit(results.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });