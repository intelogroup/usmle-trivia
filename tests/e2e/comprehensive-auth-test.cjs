#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Comprehensive authentication testing for MedQuiz Pro
class AuthenticationTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = './screenshots/auth-comprehensive';
    this.testResults = [];
    
    // Test user credentials
    this.existingUser = {
      email: 'jayveedz19@gmail.com',
      password: 'Jimkali90#'
    };
    
    this.newUser = {
      name: 'Test User',
      email: 'testuser@example.com',  
      password: 'testpass123'
    };
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async init() {
    console.log('🚀 Starting MedQuiz Pro Authentication Testing...\n');
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ],
      defaultViewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.browser.newPage();
    
    // Set up error logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Error:', msg.text());
        this.testResults.push({
          test: 'Console Error',
          status: 'FAIL',
          message: msg.text()
        });
      }
    });
    
    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
      this.testResults.push({
        test: 'Page Error',
        status: 'FAIL', 
        message: error.message
      });
    });
  }

  async screenshot(name, description) {
    const filename = `${String(this.testResults.length + 1).padStart(2, '0')}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot: ${description} -> ${filename}`);
    return filename;
  }

  async addTestResult(testName, status, message = '', screenshot = null) {
    this.testResults.push({
      test: testName,
      status,
      message,
      screenshot,
      timestamp: new Date().toISOString()
    });
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${testName}: ${status}${message ? ` - ${message}` : ''}`);
  }

  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  async testLandingPage() {
    console.log('\n🏠 Testing Landing Page...');
    
    try {
      await this.page.goto('http://localhost:5173', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      const screenshot = await this.screenshot('landing-page', 'Landing page loaded');
      
      // Check for key elements
      const title = await this.page.$eval('h1', el => el.textContent).catch(() => null);
      const hasNavigation = await this.page.$('.nav, nav') !== null;
      const hasGetStartedButton = await this.page.$('button, a[href*="register"], a[href*="login"]') !== null;
      
      if (title && (title.includes('MedQuiz') || title.includes('Quiz'))) {
        await this.addTestResult('Landing Page Load', 'PASS', 'Page loaded with correct title', screenshot);
      } else {
        await this.addTestResult('Landing Page Load', 'FAIL', `Title missing or incorrect: ${title}`, screenshot);
      }
      
      if (hasNavigation) {
        await this.addTestResult('Navigation Present', 'PASS', 'Navigation elements found');
      } else {
        await this.addTestResult('Navigation Present', 'FAIL', 'No navigation elements found');
      }
      
      return true;
    } catch (error) {
      const screenshot = await this.screenshot('landing-page-error', 'Landing page error');
      await this.addTestResult('Landing Page Load', 'FAIL', error.message, screenshot);
      return false;
    }
  }

  async testProtectedRouteRedirect() {
    console.log('\n🔒 Testing Protected Route Redirect...');
    
    try {
      await this.page.goto('http://localhost:5173/dashboard', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });
      
      const screenshot = await this.screenshot('protected-route-test', 'Accessing dashboard without auth');
      
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('/login') || currentUrl === 'http://localhost:5173/login') {
        await this.addTestResult('Protected Route Redirect', 'PASS', 'Correctly redirected to login', screenshot);
        return true;
      } else if (currentUrl.includes('/dashboard')) {
        await this.addTestResult('Protected Route Redirect', 'FAIL', 'Dashboard accessible without authentication', screenshot);
        return false;
      } else {
        await this.addTestResult('Protected Route Redirect', 'WARN', `Redirected to unexpected URL: ${currentUrl}`, screenshot);
        return false;
      }
    } catch (error) {
      const screenshot = await this.screenshot('protected-route-error', 'Protected route error');
      await this.addTestResult('Protected Route Redirect', 'FAIL', error.message, screenshot);
      return false;
    }
  }

  async testRegistration() {
    console.log('\n📝 Testing User Registration...');
    
    try {
      await this.page.goto('http://localhost:5173/register', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });
      
      let screenshot = await this.screenshot('registration-page', 'Registration page loaded');
      
      // Wait for form elements
      const hasNameField = await this.waitForElement('input[name="name"], input[name="fullName"], input[type="text"]');
      const hasEmailField = await this.waitForElement('input[name="email"], input[type="email"]');
      const hasPasswordField = await this.waitForElement('input[name="password"], input[type="password"]');
      const hasSubmitButton = await this.waitForElement('button[type="submit"], button:contains("Register")');
      
      if (!hasNameField || !hasEmailField || !hasPasswordField) {
        await this.addTestResult('Registration Form Elements', 'FAIL', 'Missing required form fields', screenshot);
        return false;
      }
      
      await this.addTestResult('Registration Form Elements', 'PASS', 'All form fields present', screenshot);
      
      // Fill out the registration form
      await this.page.type('input[name="name"], input[name="fullName"], input[type="text"]', this.newUser.name);
      await this.page.type('input[name="email"], input[type="email"]', this.newUser.email);
      await this.page.type('input[name="password"], input[type="password"]', this.newUser.password);
      
      screenshot = await this.screenshot('registration-filled', 'Registration form filled out');
      
      // Submit the form
      await this.page.click('button[type="submit"], button:contains("Register")');
      
      // Wait for response
      await this.page.waitForTimeout(3000);
      
      screenshot = await this.screenshot('registration-result', 'After registration submission');
      
      const currentUrl = this.page.url();
      const hasErrorMessage = await this.page.$('.error, .alert-error, [data-testid="error"]') !== null;
      
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/login')) {
        await this.addTestResult('User Registration', 'PASS', 'Registration successful', screenshot);
        return true;
      } else if (hasErrorMessage) {
        const errorText = await this.page.$eval('.error, .alert-error, [data-testid="error"]', el => el.textContent).catch(() => 'Unknown error');
        await this.addTestResult('User Registration', 'FAIL', `Registration failed: ${errorText}`, screenshot);
        return false;
      } else {
        await this.addTestResult('User Registration', 'WARN', `Unexpected state after registration: ${currentUrl}`, screenshot);
        return false;
      }
      
    } catch (error) {
      const screenshot = await this.screenshot('registration-error', 'Registration error');
      await this.addTestResult('User Registration', 'FAIL', error.message, screenshot);
      return false;
    }
  }

  async testLogin() {
    console.log('\n🔑 Testing User Login...');
    
    try {
      await this.page.goto('http://localhost:5173/login', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });
      
      let screenshot = await this.screenshot('login-page', 'Login page loaded');
      
      // Check for form elements
      const hasEmailField = await this.waitForElement('input[name="email"], input[type="email"]');
      const hasPasswordField = await this.waitForElement('input[name="password"], input[type="password"]');
      const hasSubmitButton = await this.waitForElement('button[type="submit"], button:contains("Login"), button:contains("Sign In")');
      
      if (!hasEmailField || !hasPasswordField || !hasSubmitButton) {
        await this.addTestResult('Login Form Elements', 'FAIL', 'Missing required form fields', screenshot);
        return false;
      }
      
      await this.addTestResult('Login Form Elements', 'PASS', 'All form fields present', screenshot);
      
      // Clear any existing values and enter credentials
      await this.page.evaluate(() => {
        const emailInput = document.querySelector('input[name="email"], input[type="email"]');
        const passwordInput = document.querySelector('input[name="password"], input[type="password"]');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
      });
      
      await this.page.type('input[name="email"], input[type="email"]', this.existingUser.email);
      await this.page.type('input[name="password"], input[type="password"]', this.existingUser.password);
      
      screenshot = await this.screenshot('login-filled', 'Login form filled with credentials');
      
      // Submit the form
      await this.page.click('button[type="submit"], button:contains("Login"), button:contains("Sign In")');
      
      // Wait for response and navigation
      await this.page.waitForTimeout(5000);
      
      screenshot = await this.screenshot('login-result', 'After login submission');
      
      const currentUrl = this.page.url();
      const hasErrorMessage = await this.page.$('.error, .alert-error, [data-testid="error"]') !== null;
      
      if (currentUrl.includes('/dashboard')) {
        await this.addTestResult('User Login', 'PASS', 'Login successful - redirected to dashboard', screenshot);
        return true;
      } else if (hasErrorMessage) {
        const errorText = await this.page.$eval('.error, .alert-error, [data-testid="error"]', el => el.textContent).catch(() => 'Unknown error');
        await this.addTestResult('User Login', 'FAIL', `Login failed: ${errorText}`, screenshot);
        return false;
      } else {
        await this.addTestResult('User Login', 'FAIL', `Login did not redirect to dashboard: ${currentUrl}`, screenshot);
        return false;
      }
      
    } catch (error) {
      const screenshot = await this.screenshot('login-error', 'Login error');
      await this.addTestResult('User Login', 'FAIL', error.message, screenshot);
      return false;
    }
  }

  async testDashboardAccess() {
    console.log('\n📊 Testing Dashboard Access...');
    
    try {
      // If not already on dashboard, navigate there
      if (!this.page.url().includes('/dashboard')) {
        await this.page.goto('http://localhost:5173/dashboard', { 
          waitUntil: 'networkidle0',
          timeout: 15000 
        });
      }
      
      const screenshot = await this.screenshot('dashboard-access', 'Dashboard after login');
      
      // Check for dashboard elements
      const hasUserInfo = await this.page.$('.user-info, .profile, [data-testid="user"]') !== null;
      const hasQuizOptions = await this.page.$('.quiz, .mode, button:contains("Quiz")') !== null;
      const hasStats = await this.page.$('.stats, .score, .points') !== null;
      
      if (hasUserInfo || hasQuizOptions || hasStats) {
        await this.addTestResult('Dashboard Access', 'PASS', 'Dashboard loaded with user content', screenshot);
        return true;
      } else {
        await this.addTestResult('Dashboard Access', 'FAIL', 'Dashboard missing expected content', screenshot);
        return false;
      }
      
    } catch (error) {
      const screenshot = await this.screenshot('dashboard-error', 'Dashboard access error');
      await this.addTestResult('Dashboard Access', 'FAIL', error.message, screenshot);
      return false;
    }
  }

  async testLogout() {
    console.log('\n🚪 Testing Logout Functionality...');
    
    try {
      // Look for logout button/link
      const logoutSelectors = [
        'button:contains("Logout")',
        'button:contains("Sign Out")', 
        'a:contains("Logout")',
        'a:contains("Sign Out")',
        '[data-testid="logout"]',
        '.logout'
      ];
      
      let logoutElement = null;
      for (const selector of logoutSelectors) {
        try {
          logoutElement = await this.page.$(selector);
          if (logoutElement) break;
        } catch (e) {
          // Continue to next selector
        }
      }
      
      // Also check for user menu that might contain logout
      const userMenuSelectors = [
        '.user-menu',
        '.profile-menu', 
        '.dropdown',
        'button:contains("Profile")',
        '.user-info button',
        '[data-testid="user-menu"]'
      ];
      
      for (const selector of userMenuSelectors) {
        try {
          const menuElement = await this.page.$(selector);
          if (menuElement) {
            await menuElement.click();
            await this.page.waitForTimeout(1000);
            
            // Now look for logout in the opened menu
            for (const logoutSelector of logoutSelectors) {
              try {
                logoutElement = await this.page.$(logoutSelector);
                if (logoutElement) break;
              } catch (e) {
                // Continue
              }
            }
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      let screenshot = await this.screenshot('logout-before', 'Before logout attempt');
      
      if (!logoutElement) {
        await this.addTestResult('Logout Button Found', 'FAIL', 'Could not find logout button', screenshot);
        return false;
      }
      
      await this.addTestResult('Logout Button Found', 'PASS', 'Logout button located');
      
      // Click logout
      await logoutElement.click();
      await this.page.waitForTimeout(3000);
      
      screenshot = await this.screenshot('logout-after', 'After logout click');
      
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('/login') || currentUrl === 'http://localhost:5173/' || currentUrl === 'http://localhost:5173') {
        await this.addTestResult('Logout Functionality', 'PASS', 'Successfully logged out and redirected', screenshot);
        return true;
      } else {
        await this.addTestResult('Logout Functionality', 'FAIL', `Logout did not redirect properly: ${currentUrl}`, screenshot);
        return false;
      }
      
    } catch (error) {
      const screenshot = await this.screenshot('logout-error', 'Logout error');
      await this.addTestResult('Logout Functionality', 'FAIL', error.message, screenshot);
      return false;
    }
  }

  async testUnauthenticatedDashboardAccess() {
    console.log('\n🚫 Testing Unauthenticated Dashboard Access...');
    
    try {
      await this.page.goto('http://localhost:5173/dashboard', { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });
      
      const screenshot = await this.screenshot('unauth-dashboard', 'Dashboard access without auth');
      
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('/login')) {
        await this.addTestResult('Unauth Dashboard Redirect', 'PASS', 'Correctly redirected to login', screenshot);
        return true;
      } else if (currentUrl.includes('/dashboard')) {
        await this.addTestResult('Unauth Dashboard Redirect', 'FAIL', 'Dashboard accessible without authentication', screenshot);
        return false;
      } else {
        await this.addTestResult('Unauth Dashboard Redirect', 'WARN', `Unexpected redirect: ${currentUrl}`, screenshot);
        return false;
      }
      
    } catch (error) {
      const screenshot = await this.screenshot('unauth-dashboard-error', 'Unauth dashboard error');
      await this.addTestResult('Unauth Dashboard Redirect', 'FAIL', error.message, screenshot);
      return false;
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Comprehensive Test Report...\n');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnTests = this.testResults.filter(r => r.status === 'WARN').length;
    
    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        warnings: warnTests,
        successRate: `${Math.round((passedTests / totalTests) * 100)}%`,
        timestamp: new Date().toISOString()
      },
      results: this.testResults
    };
    
    // Save detailed report
    fs.writeFileSync(
      path.join(this.screenshotDir, 'test-report.json'), 
      JSON.stringify(report, null, 2)
    );
    
    // Console summary
    console.log('🎯 TEST SUMMARY:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ PASSED: ${passedTests}/${totalTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log(`❌ FAILED: ${failedTests}/${totalTests}`);
    console.log(`⚠️  WARNINGS: ${warnTests}/${totalTests}`);
    console.log(`📁 Screenshots: ${this.screenshotDir}`);
    console.log(`📊 Full Report: ${path.join(this.screenshotDir, 'test-report.json')}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Detailed results
    console.log('🔍 DETAILED RESULTS:');
    this.testResults.forEach((result, index) => {
      const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${index + 1}. ${emoji} ${result.test}: ${result.status}`);
      if (result.message) console.log(`   └─ ${result.message}`);
      if (result.screenshot) console.log(`   📸 ${result.screenshot}`);
    });
    
    return report;
  }

  async runFullTestSuite() {
    try {
      await this.init();
      
      // Test sequence
      await this.testLandingPage();
      await this.testProtectedRouteRedirect(); 
      await this.testRegistration();
      await this.testLogin();
      await this.testDashboardAccess();
      await this.testLogout();
      await this.testUnauthenticatedDashboardAccess();
      
      const report = await this.generateReport();
      return report;
      
    } catch (error) {
      console.error('❌ Test Suite Error:', error);
      await this.addTestResult('Test Suite Execution', 'FAIL', error.message);
      return null;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the tests
(async () => {
  const tester = new AuthenticationTester();
  const report = await tester.runFullTestSuite();
  
  if (report) {
    const success = report.summary.failed === 0;
    process.exit(success ? 0 : 1);
  } else {
    process.exit(1);
  }
})();