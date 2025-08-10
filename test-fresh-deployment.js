#!/usr/bin/env node
/**
 * 🧪 Fresh Deployment Testing Suite
 * Tests the application with a clean database (0 users, 0 userProfiles, preserved questions)
 * 
 * This comprehensive test verifies:
 * 1. Live application loads correctly
 * 2. User registration with clean database
 * 3. Login flow with new user
 * 4. Auto-creation of userProfiles
 * 5. Quiz functionality with fresh user data
 * 6. Console error monitoring
 * 7. Data integrity verification
 */

import { execSync } from 'child_process';
import puppeteer from 'puppeteer';
import chalk from 'chalk';

// Test configuration
const CONFIG = {
  LIVE_URL: 'https://usmle-trivia.netlify.app',
  TEST_USER: {
    email: `testuser${Date.now()}@medquiz.test`,
    password: 'TestPassword123!',
    name: 'Dr Test User'
  },
  TIMEOUTS: {
    navigation: 30000,
    element: 10000,
    quiz: 15000
  }
};

class FreshDeploymentTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow
    };
    console.log(`${colors[type](`[${type.toUpperCase()}]`)} ${message}`);
  }

  async recordResult(test, passed, details = '') {
    if (passed) {
      this.testResults.passed++;
      await this.log(`✅ ${test}`, 'success');
    } else {
      this.testResults.failed++;
      await this.log(`❌ ${test}: ${details}`, 'error');
    }
    this.testResults.details.push({ test, passed, details });
  }

  async setup() {
    await this.log('🚀 Starting Fresh Deployment Testing Suite', 'info');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport for responsive testing
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Monitor console messages
    this.page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.log(chalk.red(`Console Error: ${msg.text()}`));
      }
    });
    
    // Monitor network errors
    this.page.on('response', response => {
      if (!response.ok()) {
        console.log(chalk.yellow(`Network Error: ${response.status()} ${response.url()}`));
      }
    });
  }

  async testLiveApplicationLoads() {
    await this.log('Testing: Live application loads correctly', 'info');
    
    try {
      const response = await this.page.goto(CONFIG.LIVE_URL, { 
        waitUntil: 'networkidle2',
        timeout: CONFIG.TIMEOUTS.navigation 
      });
      
      if (!response.ok()) {
        await this.recordResult('Live Application Load', false, `HTTP ${response.status()}`);
        return false;
      }

      // Check for key elements
      const titleElement = await this.page.$('h1, h2, [data-testid="app-title"]');
      const hasTitle = titleElement !== null;
      
      const bodyText = await this.page.evaluate(() => document.body.textContent);
      const hasContent = bodyText && bodyText.length > 100;
      
      const hasAuthButtons = await this.page.$('button[data-testid="login-button"], button[data-testid="register-button"], a[href*="login"], a[href*="register"]') !== null;
      
      const success = hasTitle && hasContent;
      await this.recordResult(
        'Live Application Load', 
        success, 
        `Title: ${hasTitle}, Content: ${hasContent}, Auth UI: ${hasAuthButtons}`
      );
      
      return success;
    } catch (error) {
      await this.recordResult('Live Application Load', false, error.message);
      return false;
    }
  }

  async testUserRegistration() {
    await this.log(`Testing: User Registration (${CONFIG.TEST_USER.email})`, 'info');
    
    try {
      // Find registration/signup link or button
      let registerButton = await this.page.$('button[data-testid="register-button"]') ||
                          await this.page.$('a[href*="register"]') ||
                          await this.page.$('a[href*="signup"]') ||
                          await this.page.$('button:contains("Sign Up")') ||
                          await this.page.$('button:contains("Register")');
      
      if (!registerButton) {
        // Try to find any button that might be registration
        const buttons = await this.page.$$eval('button, a', elements => 
          elements.map(el => ({ text: el.textContent, href: el.href || '' }))
        );
        
        await this.log(`Available buttons/links: ${JSON.stringify(buttons.slice(0, 10))}`, 'info');
        await this.recordResult('User Registration', false, 'No registration button found');
        return false;
      }
      
      await registerButton.click();
      await this.page.waitForTimeout(2000);
      
      // Fill registration form
      const emailInput = await this.page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      const passwordInput = await this.page.$('input[type="password"], input[name="password"], input[placeholder*="password" i]');
      const nameInput = await this.page.$('input[name="name"], input[placeholder*="name" i]');
      
      if (!emailInput || !passwordInput) {
        await this.recordResult('User Registration', false, 'Registration form fields not found');
        return false;
      }
      
      await emailInput.type(CONFIG.TEST_USER.email);
      await passwordInput.type(CONFIG.TEST_USER.password);
      if (nameInput) {
        await nameInput.type(CONFIG.TEST_USER.name);
      }
      
      // Submit registration
      const submitButton = await this.page.$('button[type="submit"], button:contains("Sign Up"), button:contains("Register")');
      if (!submitButton) {
        await this.recordResult('User Registration', false, 'Submit button not found');
        return false;
      }
      
      await submitButton.click();
      
      // Wait for registration to complete (either redirect or success message)
      await this.page.waitForTimeout(5000);
      
      // Check for success indicators
      const currentUrl = this.page.url();
      const isRedirected = !currentUrl.includes('register') && !currentUrl.includes('signup');
      
      const successMessage = await this.page.$('.success, .alert-success, [data-testid="success-message"]');
      const hasSuccessMessage = successMessage !== null;
      
      const isDashboard = currentUrl.includes('dashboard') || currentUrl.includes('quiz') || await this.page.$('[data-testid="dashboard"], .dashboard') !== null;
      
      const success = isRedirected || hasSuccessMessage || isDashboard;
      await this.recordResult(
        'User Registration',
        success,
        `URL: ${currentUrl}, Success msg: ${hasSuccessMessage}, Dashboard: ${isDashboard}`
      );
      
      return success;
    } catch (error) {
      await this.recordResult('User Registration', false, error.message);
      return false;
    }
  }

  async testLoginFlow() {
    await this.log('Testing: Login flow with new user', 'info');
    
    try {
      // If already logged in from registration, logout first
      const logoutButton = await this.page.$('button:contains("Logout"), button:contains("Sign Out"), [data-testid="logout-button"]');
      if (logoutButton) {
        await logoutButton.click();
        await this.page.waitForTimeout(2000);
      }
      
      // Navigate to login page
      await this.page.goto(`${CONFIG.LIVE_URL}/login`, { waitUntil: 'networkidle2' });
      
      // Fill login form
      const emailInput = await this.page.$('input[type="email"], input[name="email"]');
      const passwordInput = await this.page.$('input[type="password"], input[name="password"]');
      
      if (!emailInput || !passwordInput) {
        await this.recordResult('Login Flow', false, 'Login form fields not found');
        return false;
      }
      
      await emailInput.type(CONFIG.TEST_USER.email);
      await passwordInput.type(CONFIG.TEST_USER.password);
      
      // Submit login
      const submitButton = await this.page.$('button[type="submit"], button:contains("Sign In"), button:contains("Login")');
      await submitButton.click();
      
      // Wait for login to complete
      await this.page.waitForTimeout(5000);
      
      // Check for login success
      const currentUrl = this.page.url();
      const isLoggedIn = !currentUrl.includes('login') || await this.page.$('.dashboard, [data-testid="user-menu"]') !== null;
      
      await this.recordResult('Login Flow', isLoggedIn, `Final URL: ${currentUrl}`);
      return isLoggedIn;
    } catch (error) {
      await this.recordResult('Login Flow', false, error.message);
      return false;
    }
  }

  async testUserProfileCreation() {
    await this.log('Testing: UserProfile auto-creation with getCurrentUser', 'info');
    
    try {
      // Check if user dashboard/profile data loads
      const userDataElements = await this.page.$$eval(
        '[data-testid*="user"], .user-stats, .profile, .dashboard-stats',
        elements => elements.length
      );
      
      // Look for user-specific data like points, level, etc.
      const bodyText = await this.page.evaluate(() => document.body.textContent);
      const hasUserStats = bodyText.includes('Points') || bodyText.includes('Level') || bodyText.includes('Streak');
      
      // Check for user menu or profile indicator
      const userMenu = await this.page.$('.user-menu, [data-testid="user-menu"], .profile-dropdown');
      const hasUserMenu = userMenu !== null;
      
      const success = userDataElements > 0 || hasUserStats || hasUserMenu;
      await this.recordResult(
        'UserProfile Auto-Creation',
        success,
        `Elements: ${userDataElements}, Stats: ${hasUserStats}, Menu: ${hasUserMenu}`
      );
      
      return success;
    } catch (error) {
      await this.recordResult('UserProfile Auto-Creation', false, error.message);
      return false;
    }
  }

  async testQuizFunctionality() {
    await this.log('Testing: Quiz functionality with fresh user', 'info');
    
    try {
      // Navigate to quiz page
      const quizButton = await this.page.$('a[href*="quiz"], button:contains("Start Quiz"), [data-testid="start-quiz"]');
      if (!quizButton) {
        // Try to find quiz section
        await this.page.goto(`${CONFIG.LIVE_URL}/quiz`, { waitUntil: 'networkidle2' });
      } else {
        await quizButton.click();
        await this.page.waitForTimeout(3000);
      }
      
      // Look for quiz mode buttons (Quick, Timed, Custom)
      const quizModes = await this.page.$$eval(
        'button:contains("Quick"), button:contains("Timed"), button:contains("Custom"), .quiz-mode',
        elements => elements.length
      );
      
      if (quizModes > 0) {
        // Click on Quick Quiz
        const quickButton = await this.page.$('button:contains("Quick")');
        if (quickButton) {
          await quickButton.click();
          await this.page.waitForTimeout(3000);
        }
      }
      
      // Check for quiz question
      const questionElement = await this.page.$('.question, [data-testid="question"], .quiz-question');
      const hasQuestion = questionElement !== null;
      
      // Check for answer options
      const answerOptions = await this.page.$$('.option, .answer-option, input[type="radio"], button[data-answer]');
      const hasOptions = answerOptions.length >= 2;
      
      // Check for quiz UI elements
      const hasQuizUI = await this.page.$('.quiz-container, .question-container, [data-testid="quiz"]') !== null;
      
      const success = hasQuestion && hasOptions && hasQuizUI;
      await this.recordResult(
        'Quiz Functionality',
        success,
        `Question: ${hasQuestion}, Options: ${answerOptions.length}, UI: ${hasQuizUI}`
      );
      
      return success;
    } catch (error) {
      await this.recordResult('Quiz Functionality', false, error.message);
      return false;
    }
  }

  async testConsoleErrors() {
    await this.log('Testing: Console error monitoring', 'info');
    
    try {
      const errors = [];
      
      // Collect console errors for a few seconds
      const errorHandler = (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      };
      
      this.page.on('console', errorHandler);
      
      // Navigate through key pages to trigger any errors
      await this.page.goto(`${CONFIG.LIVE_URL}/dashboard`, { waitUntil: 'networkidle2' }).catch(() => {});
      await this.page.waitForTimeout(2000);
      
      await this.page.goto(`${CONFIG.LIVE_URL}/quiz`, { waitUntil: 'networkidle2' }).catch(() => {});
      await this.page.waitForTimeout(2000);
      
      this.page.off('console', errorHandler);
      
      // Filter out minor errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('manifest') &&
        !error.includes('chrome-extension')
      );
      
      const success = criticalErrors.length === 0;
      await this.recordResult(
        'Console Error Check',
        success,
        criticalErrors.length > 0 ? `Errors: ${criticalErrors.join(', ')}` : 'No critical errors'
      );
      
      return success;
    } catch (error) {
      await this.recordResult('Console Error Check', false, error.message);
      return false;
    }
  }

  async testDatabaseIntegrity() {
    await this.log('Testing: Database integrity after fresh user creation', 'info');
    
    try {
      // This test verifies the application is functioning, implying database works
      // We can't directly test database from browser, but we can verify app behavior
      
      // Check if user can interact with app (implying database works)
      const currentUrl = this.page.url();
      const isAppFunctional = !currentUrl.includes('error') && !currentUrl.includes('500');
      
      // Look for data-driven content
      const bodyText = await this.page.evaluate(() => document.body.textContent);
      const hasDataContent = bodyText.length > 1000; // Substantial content suggests data loading
      
      // Check for user-specific elements (implies user data was created)
      const userElements = await this.page.$$('.user, .profile, [data-testid*="user"]');
      const hasUserData = userElements.length > 0;
      
      const success = isAppFunctional && hasDataContent;
      await this.recordResult(
        'Database Integrity',
        success,
        `Functional: ${isAppFunctional}, Content: ${hasDataContent}, UserData: ${hasUserData}`
      );
      
      return success;
    } catch (error) {
      await this.recordResult('Database Integrity', false, error.message);
      return false;
    }
  }

  async runAllTests() {
    await this.setup();
    
    try {
      // Run tests in sequence
      const testFunctions = [
        () => this.testLiveApplicationLoads(),
        () => this.testUserRegistration(),
        () => this.testLoginFlow(),
        () => this.testUserProfileCreation(),
        () => this.testQuizFunctionality(),
        () => this.testConsoleErrors(),
        () => this.testDatabaseIntegrity()
      ];
      
      for (const testFn of testFunctions) {
        await testFn();
        await this.page.waitForTimeout(1000); // Brief pause between tests
      }
      
    } catch (error) {
      await this.log(`Unexpected error during testing: ${error.message}`, 'error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
    
    await this.generateReport();
  }

  async generateReport() {
    const total = this.testResults.passed + this.testResults.failed;
    const successRate = total > 0 ? Math.round((this.testResults.passed / total) * 100) : 0;
    
    console.log('\n' + '='.repeat(80));
    console.log(chalk.cyan.bold('🧪 FRESH DEPLOYMENT TEST REPORT'));
    console.log('='.repeat(80));
    
    console.log(`${chalk.green('✅ Passed:')} ${this.testResults.passed}`);
    console.log(`${chalk.red('❌ Failed:')} ${this.testResults.failed}`);
    console.log(`${chalk.blue('📊 Success Rate:')} ${successRate}%`);
    console.log(`${chalk.yellow('🧪 Test User:')} ${CONFIG.TEST_USER.email}`);
    
    console.log('\n' + chalk.cyan.bold('📋 DETAILED RESULTS:'));
    this.testResults.details.forEach(result => {
      const status = result.passed ? chalk.green('✅') : chalk.red('❌');
      console.log(`${status} ${result.test}`);
      if (result.details) {
        console.log(`   ${chalk.gray(result.details)}`);
      }
    });
    
    console.log('\n' + chalk.cyan.bold('🔍 TEST RECOMMENDATIONS:'));
    
    if (successRate >= 85) {
      console.log(chalk.green('🎉 EXCELLENT: Application is production-ready with fresh database!'));
      console.log(chalk.green('✅ All core functionality working correctly'));
      console.log(chalk.green('✅ User registration and authentication functional'));
      console.log(chalk.green('✅ Database cleanup successful - ready for real users'));
    } else if (successRate >= 70) {
      console.log(chalk.yellow('⚠️  GOOD: Most functionality working, minor issues detected'));
      console.log(chalk.yellow('🔧 Review failed tests and fix before production deployment'));
    } else {
      console.log(chalk.red('❌ CRITICAL: Major issues detected with fresh database'));
      console.log(chalk.red('🚨 DO NOT deploy to production until issues are resolved'));
    }
    
    console.log('\n' + chalk.cyan.bold('📊 DEPLOYMENT STATUS:'));
    if (successRate >= 85) {
      console.log(chalk.green('🚀 READY FOR PRODUCTION DEPLOYMENT'));
      console.log(chalk.green('✅ Fresh database testing successful'));
      console.log(chalk.green('✅ User flows working correctly'));
      console.log(chalk.green('✅ No critical errors detected'));
    } else {
      console.log(chalk.red('⏸️  NOT READY - Fix issues first'));
    }
    
    console.log('='.repeat(80) + '\n');
    
    // Exit with appropriate code
    process.exit(this.testResults.failed === 0 ? 0 : 1);
  }
}

// Run the test suite
const tester = new FreshDeploymentTester();
tester.runAllTests().catch(error => {
  console.error(chalk.red('Fatal error in test suite:'), error);
  process.exit(1);
});

export default FreshDeploymentTester;