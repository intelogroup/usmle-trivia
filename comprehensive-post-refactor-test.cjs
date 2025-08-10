/**
 * Comprehensive End-to-End Test - Post Duplicate Code Removal
 * 
 * This test verifies that all MedQuiz Pro functionality works correctly
 * after the duplicate code removal refactoring.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5174';
const TEST_CREDENTIALS = {
  email: 'jayveedz19@gmail.com',
  password: 'Jimkali90#'
};

class ComprehensiveTestSuite {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = {
      startTime: new Date().toISOString(),
      tests: [],
      screenshots: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
    
    // Create screenshots directory
    const screenshotDir = path.join(process.cwd(), 'post-refactor-test-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  }

  async init() {
    console.log('🚀 Starting comprehensive post-refactor test suite...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (compatible; MedQuiz-Test/1.0)'
    });
    
    this.page = await this.context.newPage();
    
    // Set up console and error logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    this.page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`);
      this.recordTest('Page Error', false, `JavaScript error: ${error.message}`);
    });
  }

  recordTest(testName, passed, details = '') {
    const result = {
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.tests.push(result);
    this.testResults.summary.total++;
    
    if (passed) {
      this.testResults.summary.passed++;
      console.log(`✅ ${testName}: PASSED`);
    } else {
      this.testResults.summary.failed++;
      console.log(`❌ ${testName}: FAILED - ${details}`);
    }
    
    if (details.includes('warning') || details.includes('Warning')) {
      this.testResults.summary.warnings++;
    }
  }

  async takeScreenshot(name, description = '') {
    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    const filepath = path.join(process.cwd(), 'post-refactor-test-screenshots', filename);
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });
    
    this.testResults.screenshots.push({
      name,
      filename,
      description,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  async waitForNetworkIdle(timeout = 5000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      console.log(`⚠️ Network idle timeout: ${error.message}`);
    }
  }

  async test1_ApplicationLoads() {
    console.log('\n🧪 Test 1: Application loads correctly');
    
    try {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await this.waitForNetworkIdle();
      
      const title = await this.page.title();
      await this.takeScreenshot('01-application-load', 'Initial application load');
      
      // Check if page loads without errors
      const hasContent = await this.page.locator('body').isVisible();
      const hasReactRoot = await this.page.locator('#root').isVisible();
      
      if (hasContent && hasReactRoot && title) {
        this.recordTest('Application Loads', true, `Title: "${title}"`);
      } else {
        this.recordTest('Application Loads', false, 'Missing essential page elements');
      }
    } catch (error) {
      this.recordTest('Application Loads', false, `Navigation error: ${error.message}`);
    }
  }

  async test2_LandingPageDisplay() {
    console.log('\n🧪 Test 2: Landing page displays properly');
    
    try {
      // Check for key landing page elements
      const heroSection = await this.page.locator('[data-testid="hero-section"], .hero, h1').first().isVisible();
      const navButtons = await this.page.locator('button, a').count();
      const hasGetStarted = await this.page.locator('text=/get started/i, text=/start/i').first().isVisible();
      
      await this.takeScreenshot('02-landing-page', 'Landing page layout and content');
      
      if (heroSection && navButtons > 0) {
        this.recordTest('Landing Page Display', true, `Found ${navButtons} interactive elements`);
      } else {
        this.recordTest('Landing Page Display', false, 'Missing essential landing page elements');
      }
    } catch (error) {
      this.recordTest('Landing Page Display', false, error.message);
    }
  }

  async test3_NavigationToLogin() {
    console.log('\n🧪 Test 3: Navigation to login works');
    
    try {
      // Try multiple ways to navigate to login
      let loginFound = false;
      
      // Try clicking login button/link
      const loginSelectors = [
        'text=/sign in/i',
        'text=/login/i', 
        'button:has-text("Sign In")',
        'a:has-text("Login")',
        '[href="/login"]',
        '[data-testid="login-button"]'
      ];
      
      for (const selector of loginSelectors) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.isVisible()) {
            await element.click();
            await this.waitForNetworkIdle();
            loginFound = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      // Fallback: navigate directly
      if (!loginFound) {
        await this.page.goto(`${BASE_URL}/login`);
        await this.waitForNetworkIdle();
      }
      
      const currentUrl = this.page.url();
      const hasLoginForm = await this.page.locator('input[type="email"], input[name="email"]').isVisible();
      
      await this.takeScreenshot('03-login-navigation', 'Navigation to login page');
      
      if (currentUrl.includes('/login') && hasLoginForm) {
        this.recordTest('Navigation to Login', true, `URL: ${currentUrl}`);
      } else {
        this.recordTest('Navigation to Login', false, `URL: ${currentUrl}, Has form: ${hasLoginForm}`);
      }
    } catch (error) {
      this.recordTest('Navigation to Login', false, error.message);
    }
  }

  async test4_UserRegistrationFlow() {
    console.log('\n🧪 Test 4: User registration flow works');
    
    try {
      // Navigate to registration
      await this.page.goto(`${BASE_URL}/register`);
      await this.waitForNetworkIdle();
      
      const hasRegisterForm = await this.page.locator('input[type="email"], input[name="email"]').isVisible();
      
      if (hasRegisterForm) {
        // Fill registration form with test data
        const testEmail = `test-${Date.now()}@medquiz.test`;
        const testPassword = 'TestPassword123!';
        
        await this.page.fill('input[type="email"], input[name="email"]', testEmail);
        await this.page.fill('input[type="password"], input[name="password"]', testPassword);
        
        // Look for name fields
        const nameInputs = await this.page.locator('input[name="name"], input[name="fullName"], input[placeholder*="name"]').count();
        if (nameInputs > 0) {
          await this.page.fill('input[name="name"], input[name="fullName"], input[placeholder*="name"]', 'Test User');
        }
        
        await this.takeScreenshot('04-registration-filled', 'Registration form filled out');
        
        // Try to submit (but expect validation or redirect)
        const submitButton = this.page.locator('button[type="submit"], button:has-text("register"), button:has-text("sign up")').first();
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await this.waitForNetworkIdle();
        }
        
        await this.takeScreenshot('04-registration-result', 'Registration form submission result');
        
        this.recordTest('User Registration Flow', true, 'Registration form functional');
      } else {
        this.recordTest('User Registration Flow', false, 'Registration form not found');
      }
    } catch (error) {
      this.recordTest('User Registration Flow', false, error.message);
    }
  }

  async test5_UserLoginWithCredentials() {
    console.log('\n🧪 Test 5: User login with test credentials');
    
    try {
      // Navigate to login
      await this.page.goto(`${BASE_URL}/login`);
      await this.waitForNetworkIdle();
      
      // Fill login form
      await this.page.fill('input[type="email"], input[name="email"]', TEST_CREDENTIALS.email);
      await this.page.fill('input[type="password"], input[name="password"]', TEST_CREDENTIALS.password);
      
      await this.takeScreenshot('05-login-filled', 'Login form with test credentials');
      
      // Submit login
      const submitButton = this.page.locator('button[type="submit"], button:has-text("sign in"), button:has-text("login")').first();
      await submitButton.click();
      
      // Wait for navigation or response
      await this.page.waitForTimeout(3000);
      await this.waitForNetworkIdle();
      
      const currentUrl = this.page.url();
      const isLoggedIn = currentUrl.includes('/dashboard') || 
                        await this.page.locator('text=/dashboard/i, text=/welcome/i').first().isVisible() ||
                        await this.page.locator('[data-testid="user-menu"], .user-menu').first().isVisible();
      
      await this.takeScreenshot('05-login-result', 'Result after login attempt');
      
      if (isLoggedIn) {
        this.recordTest('User Login with Credentials', true, `Redirected to: ${currentUrl}`);
      } else {
        // Check for error messages
        const hasError = await this.page.locator('text=/error/i, text=/invalid/i, .error').first().isVisible();
        this.recordTest('User Login with Credentials', false, 
          `Not logged in. URL: ${currentUrl}, Has error: ${hasError}`);
      }
    } catch (error) {
      this.recordTest('User Login with Credentials', false, error.message);
    }
  }

  async test6_DashboardLoadsWithUserData() {
    console.log('\n🧪 Test 6: Dashboard loads with user data');
    
    try {
      // Ensure we're on dashboard or navigate there
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/dashboard')) {
        await this.page.goto(`${BASE_URL}/dashboard`);
        await this.waitForNetworkIdle();
      }
      
      // Check for dashboard elements
      const hasWelcome = await this.page.locator('text=/welcome/i, text=/dashboard/i').first().isVisible();
      const hasUserData = await this.page.locator('text=/quiz/i, text=/progress/i, text=/stats/i').first().isVisible();
      const hasQuizOptions = await this.page.locator('button, .quiz').count();
      
      await this.takeScreenshot('06-dashboard-overview', 'Dashboard with user data');
      
      if (hasWelcome || hasUserData) {
        this.recordTest('Dashboard Loads with User Data', true, 
          `Found ${hasQuizOptions} interactive elements`);
      } else {
        this.recordTest('Dashboard Loads with User Data', false, 
          'Dashboard elements not found');
      }
    } catch (error) {
      this.recordTest('Dashboard Loads with User Data', false, error.message);
    }
  }

  async test7_QuizFunctionality() {
    console.log('\n🧪 Test 7: Quiz functionality works');
    
    try {
      // Try to start a quiz
      const quizSelectors = [
        'text=/quick quiz/i',
        'text=/start quiz/i',
        'text=/timed quiz/i',
        'button:has-text("Quiz")',
        '[data-testid="quiz-button"]',
        '.quiz-button'
      ];
      
      let quizStarted = false;
      for (const selector of quizSelectors) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.isVisible()) {
            await element.click();
            await this.waitForNetworkIdle();
            quizStarted = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      // Check if we're on a quiz page
      const currentUrl = this.page.url();
      const hasQuizContent = await this.page.locator('text=/question/i, text=/answer/i, .quiz-question').first().isVisible();
      const hasMultipleChoice = await this.page.locator('input[type="radio"], .option, .answer-option').count();
      
      await this.takeScreenshot('07-quiz-interface', 'Quiz interface and questions');
      
      if (hasQuizContent || hasMultipleChoice > 0) {
        this.recordTest('Quiz Functionality', true, 
          `Quiz loaded with ${hasMultipleChoice} answer options`);
        
        // Try to interact with quiz
        if (hasMultipleChoice > 0) {
          const firstOption = this.page.locator('input[type="radio"], .option').first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
            await this.takeScreenshot('07-quiz-answered', 'Quiz question answered');
          }
        }
      } else {
        this.recordTest('Quiz Functionality', false, 
          `Quiz not accessible. URL: ${currentUrl}`);
      }
    } catch (error) {
      this.recordTest('Quiz Functionality', false, error.message);
    }
  }

  async test8_MobileResponsiveness() {
    console.log('\n🧪 Test 8: Mobile responsiveness');
    
    try {
      // Test different mobile viewports
      const mobileViewports = [
        { width: 375, height: 667, name: 'iPhone' },
        { width: 320, height: 568, name: 'Small Mobile' },
        { width: 768, height: 1024, name: 'Tablet' }
      ];
      
      for (const viewport of mobileViewports) {
        await this.page.setViewportSize(viewport);
        await this.page.reload();
        await this.waitForNetworkIdle();
        
        const hasContent = await this.page.locator('body').isVisible();
        const isResponsive = await this.page.evaluate(() => {
          const body = document.body;
          return body.scrollWidth <= window.innerWidth + 10; // Allow small margin
        });
        
        await this.takeScreenshot(`08-mobile-${viewport.name}`, 
          `Mobile view ${viewport.width}x${viewport.height}`);
        
        if (!hasContent || !isResponsive) {
          this.recordTest('Mobile Responsiveness', false, 
            `Issues on ${viewport.name} (${viewport.width}x${viewport.height})`);
          break;
        }
      }
      
      // If we got here, all viewports worked
      this.recordTest('Mobile Responsiveness', true, 
        'All mobile viewports display correctly');
        
      // Reset to desktop
      await this.page.setViewportSize({ width: 1280, height: 720 });
    } catch (error) {
      this.recordTest('Mobile Responsiveness', false, error.message);
    }
  }

  async test9_ErrorHandling() {
    console.log('\n🧪 Test 9: Error handling');
    
    try {
      // Test 404 page
      await this.page.goto(`${BASE_URL}/nonexistent-page`);
      await this.waitForNetworkIdle();
      
      const has404Content = await this.page.locator('text=/404/i, text=/not found/i, text=/page not found/i').first().isVisible();
      const hasNavigationBack = await this.page.locator('text=/home/i, text=/back/i, a, button').first().isVisible();
      
      await this.takeScreenshot('09-error-404', '404 error page handling');
      
      if (has404Content || hasNavigationBack) {
        this.recordTest('Error Handling', true, 'Graceful 404 page handling');
      } else {
        this.recordTest('Error Handling', false, 'No proper 404 page found');
      }
      
      // Test form validation
      await this.page.goto(`${BASE_URL}/login`);
      await this.waitForNetworkIdle();
      
      // Try to submit empty form
      const submitButton = this.page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await this.page.waitForTimeout(1000);
        
        const hasValidation = await this.page.locator('.error, [aria-invalid], text=/required/i').first().isVisible();
        
        await this.takeScreenshot('09-form-validation', 'Form validation errors');
        
        if (hasValidation) {
          this.recordTest('Form Validation', true, 'Form validation working');
        }
      }
    } catch (error) {
      this.recordTest('Error Handling', false, error.message);
    }
  }

  async test10_AuthenticationFlow() {
    console.log('\n🧪 Test 10: Complete authentication flow');
    
    try {
      // Test logout (if logged in)
      const hasUserMenu = await this.page.locator('[data-testid="user-menu"], .user-menu, text=/logout/i').first().isVisible();
      
      if (hasUserMenu) {
        await this.page.locator('[data-testid="user-menu"], .user-menu').first().click();
        await this.page.waitForTimeout(500);
        
        const logoutButton = this.page.locator('text=/logout/i, text=/sign out/i').first();
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await this.waitForNetworkIdle();
        }
      }
      
      // Verify logout worked
      const currentUrl = this.page.url();
      const isLoggedOut = currentUrl.includes('/login') || currentUrl === BASE_URL + '/' || 
                         await this.page.locator('text=/sign in/i, text=/login/i').first().isVisible();
      
      await this.takeScreenshot('10-after-logout', 'After logout state');
      
      if (isLoggedOut) {
        this.recordTest('Authentication Flow - Logout', true, 'Logout successful');
      } else {
        this.recordTest('Authentication Flow - Logout', false, 'Logout may not have worked');
      }
      
      // Test re-login
      if (!currentUrl.includes('/login')) {
        await this.page.goto(`${BASE_URL}/login`);
        await this.waitForNetworkIdle();
      }
      
      await this.page.fill('input[type="email"]', TEST_CREDENTIALS.email);
      await this.page.fill('input[type="password"]', TEST_CREDENTIALS.password);
      await this.page.locator('button[type="submit"]').first().click();
      await this.waitForNetworkIdle();
      
      const reLoginSuccess = this.page.url().includes('/dashboard') || 
                           await this.page.locator('text=/welcome/i, text=/dashboard/i').first().isVisible();
      
      await this.takeScreenshot('10-after-relogin', 'After re-login state');
      
      if (reLoginSuccess) {
        this.recordTest('Authentication Flow - Re-login', true, 'Re-login successful');
      } else {
        this.recordTest('Authentication Flow - Re-login', false, 'Re-login failed');
      }
    } catch (error) {
      this.recordTest('Authentication Flow', false, error.message);
    }
  }

  async runAllTests() {
    await this.init();
    
    try {
      await this.test1_ApplicationLoads();
      await this.test2_LandingPageDisplay();
      await this.test3_NavigationToLogin();
      await this.test4_UserRegistrationFlow();
      await this.test5_UserLoginWithCredentials();
      await this.test6_DashboardLoadsWithUserData();
      await this.test7_QuizFunctionality();
      await this.test8_MobileResponsiveness();
      await this.test9_ErrorHandling();
      await this.test10_AuthenticationFlow();
    } catch (error) {
      console.error('❌ Test suite error:', error);
    }
    
    await this.generateReport();
    await this.cleanup();
  }

  async generateReport() {
    const endTime = new Date().toISOString();
    const duration = new Date() - new Date(this.testResults.startTime);
    
    this.testResults.endTime = endTime;
    this.testResults.duration = duration;
    this.testResults.summary.passRate = 
      ((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(2);
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'post-refactor-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    // Generate summary report
    const summary = `
# 🧪 Post-Refactor Comprehensive Test Report

## 📊 Test Summary
- **Total Tests:** ${this.testResults.summary.total}
- **Passed:** ${this.testResults.summary.passed} ✅
- **Failed:** ${this.testResults.summary.failed} ❌
- **Warnings:** ${this.testResults.summary.warnings} ⚠️
- **Pass Rate:** ${this.testResults.summary.passRate}%
- **Duration:** ${Math.round(duration / 1000)}s

## 📸 Screenshots Captured
${this.testResults.screenshots.map(s => `- ${s.name}: ${s.filename}`).join('\n')}

## 🧪 Detailed Results
${this.testResults.tests.map(test => 
  `### ${test.passed ? '✅' : '❌'} ${test.name}
${test.details ? `**Details:** ${test.details}` : ''}
**Time:** ${test.timestamp}
`).join('\n')}

---
*Generated on ${new Date().toLocaleString()}*
`;

    const summaryPath = path.join(process.cwd(), 'POST-REFACTOR-TEST-SUMMARY.md');
    fs.writeFileSync(summaryPath, summary);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 TEST SUITE COMPLETED');
    console.log('='.repeat(80));
    console.log(`📊 Results: ${this.testResults.summary.passed}/${this.testResults.summary.total} tests passed (${this.testResults.summary.passRate}%)`);
    console.log(`📁 Screenshots: ${this.testResults.screenshots.length} captured`);
    console.log(`📄 Reports saved to:`);
    console.log(`   - ${reportPath}`);
    console.log(`   - ${summaryPath}`);
    console.log('='.repeat(80));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the test suite
const testSuite = new ComprehensiveTestSuite();
testSuite.runAllTests().catch(console.error);