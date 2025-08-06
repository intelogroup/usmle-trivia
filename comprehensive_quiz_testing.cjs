#!/usr/bin/env node

/**
 * COMPREHENSIVE QUIZ FLOW TESTING SCRIPT
 * 
 * Mission: Test all quiz modes from start to finish, identify every roadblock,
 * add detailed error logging, and document exactly what's blocking the user journey.
 * 
 * Test Scenarios:
 * 1. Quick Quiz End-to-End Flow
 * 2. Timed Quiz End-to-End Flow  
 * 3. Custom Quiz End-to-End Flow
 * 4. Error State Testing
 * 5. Database Connectivity Testing
 * 6. Authentication Flow Testing
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5178',
  testUser: {
    email: 'jayveedz19@gmail.com',
    password: 'Jimkali90#',
    name: 'Jay veedz'
  },
  screenshotDir: './screenshots/quiz-testing/',
  timeout: 30000
};

// Ensure screenshot directory exists
if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
  fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
}

// Testing Report Storage
let testReport = {
  timestamp: new Date().toISOString(),
  testResults: [],
  roadblocks: [],
  errorLogs: [],
  recommendations: []
};

// Utility Functions
const screenshot = async (page, name) => {
  const timestamp = Date.now();
  const filename = `${timestamp}-${name}.png`;
  const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filename;
};

const logError = (stage, error, details = {}) => {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    stage,
    error: error.message || error.toString(),
    details,
    stack: error.stack
  };
  testReport.errorLogs.push(errorEntry);
  console.error(`🚨 ERROR in ${stage}:`, error.message || error);
  return errorEntry;
};

const logRoadblock = (stage, description, screenshot, recommendation) => {
  const roadblock = {
    timestamp: new Date().toISOString(),
    stage,
    description,
    screenshot,
    recommendation,
    severity: 'HIGH'
  };
  testReport.roadblocks.push(roadblock);
  console.warn(`🚧 ROADBLOCK in ${stage}: ${description}`);
  return roadblock;
};

// Authentication Helper
const authenticateUser = async (page) => {
  try {
    console.log('🔐 Starting authentication flow...');
    
    // Navigate to login page
    await page.goto(`${TEST_CONFIG.baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    await screenshot(page, '01-login-page');
    
    // Check if already logged in by looking for dashboard elements
    const isDashboard = await page.locator('[data-testid="dashboard"]').isVisible().catch(() => false);
    if (isDashboard) {
      console.log('✅ Already authenticated, on dashboard');
      return true;
    }
    
    // Fill login form
    console.log('📝 Filling login credentials...');
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email);
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password);
    
    // Submit login
    await page.click('button[type="submit"]');
    console.log('🚀 Login form submitted');
    
    // Wait for authentication result
    try {
      // Wait for either dashboard or error message
      await Promise.race([
        page.waitForURL('**/dashboard', { timeout: 10000 }),
        page.waitForURL('**/', { timeout: 10000 }),
        page.waitForSelector('.error', { timeout: 5000 })
      ]);
      
      // Check current URL and page state
      const currentUrl = page.url();
      console.log('🌐 Current URL after login:', currentUrl);
      
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/?')) {
        console.log('✅ Authentication successful');
        await screenshot(page, '02-dashboard-after-login');
        return true;
      } else {
        throw new Error(`Unexpected URL after login: ${currentUrl}`);
      }
    } catch (authError) {
      await screenshot(page, 'error-login-failed');
      logError('Authentication', authError, { url: page.url() });
      logRoadblock(
        'Authentication', 
        `Login failed - ${authError.message}`, 
        'error-login-failed.png',
        'Check authentication service connection and user credentials in database'
      );
      return false;
    }
  } catch (error) {
    await screenshot(page, 'error-auth-failure');
    logError('Authentication Setup', error);
    return false;
  }
};

// Quiz Mode Testing Functions
const testQuickQuiz = async (page) => {
  try {
    console.log('🎯 Testing Quick Quiz Mode...');
    
    // Navigate to dashboard
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await screenshot(page, 'quick-01-dashboard');
    
    // Click Quick Quiz
    const quickQuizSelector = '[data-testid="quick-quiz"], button:has-text("Quick Quiz"), a[href*="quick"]';
    await page.click(quickQuizSelector);
    console.log('📱 Quick Quiz clicked');
    
    // Wait for quiz setup page
    await page.waitForLoadState('networkidle');
    await screenshot(page, 'quick-02-quiz-setup');
    
    // Check if we're on quiz page
    const currentUrl = page.url();
    if (!currentUrl.includes('/quiz')) {
      logRoadblock(
        'Quick Quiz Navigation',
        'Failed to navigate to quiz setup page',
        'quick-02-quiz-setup.png',
        'Check routing configuration and quiz navigation links'
      );
      return false;
    }
    
    // Click Start Quiz button
    try {
      const startButton = page.locator('button:has-text("Start Quiz")');
      await startButton.click();
      console.log('🚀 Start Quiz clicked');
      
      // Wait for quiz engine to load
      await page.waitForTimeout(3000);
      await screenshot(page, 'quick-03-quiz-engine');
      
      // Check for quiz questions
      const hasQuestions = await page.locator('.quiz-question, [data-testid="question"]').isVisible().catch(() => false);
      if (!hasQuestions) {
        throw new Error('Quiz questions did not load');
      }
      
      console.log('✅ Quick Quiz loaded successfully');
      return true;
      
    } catch (startError) {
      await screenshot(page, 'quick-error-failed');
      logError('Quick Quiz Start', startError);
      logRoadblock(
        'Quick Quiz Execution',
        `Failed to start quiz - ${startError.message}`,
        'quick-error-failed.png',
        'Check QuizEngine component and question loading from Convex database'
      );
      return false;
    }
    
  } catch (error) {
    await screenshot(page, 'quick-error-navigation');
    logError('Quick Quiz', error);
    return false;
  }
};

const testTimedQuiz = async (page) => {
  try {
    console.log('⏱️ Testing Timed Quiz Mode...');
    
    // Navigate to dashboard
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await screenshot(page, 'timed-01-dashboard');
    
    // Click Timed Quiz
    const timedQuizSelector = '[data-testid="timed-quiz"], button:has-text("Timed Quiz"), a[href*="timed"]';
    await page.click(timedQuizSelector);
    console.log('⏰ Timed Quiz clicked');
    
    // Wait for quiz setup page
    await page.waitForLoadState('networkidle');
    await screenshot(page, 'timed-02-quiz-setup');
    
    // Check if we're on quiz page
    const currentUrl = page.url();
    if (!currentUrl.includes('/quiz')) {
      logRoadblock(
        'Timed Quiz Navigation',
        'Failed to navigate to timed quiz setup page',
        'timed-02-quiz-setup.png',
        'Check routing configuration for timed quiz mode'
      );
      return false;
    }
    
    // Click Start Quiz button
    try {
      const startButton = page.locator('button:has-text("Start Quiz")');
      await startButton.click();
      console.log('🚀 Timed Quiz started');
      
      // Wait for quiz engine to load
      await page.waitForTimeout(3000);
      await screenshot(page, 'timed-03-quiz-engine');
      
      // Check for timer element
      const hasTimer = await page.locator('.timer, [data-testid="timer"]').isVisible().catch(() => false);
      const hasQuestions = await page.locator('.quiz-question, [data-testid="question"]').isVisible().catch(() => false);
      
      if (!hasQuestions) {
        throw new Error('Timed quiz questions did not load');
      }
      
      if (!hasTimer) {
        console.warn('⚠️ Timer not visible, but questions loaded');
      }
      
      console.log('✅ Timed Quiz loaded successfully');
      return true;
      
    } catch (startError) {
      await screenshot(page, 'timed-error-failed');
      logError('Timed Quiz Start', startError);
      logRoadblock(
        'Timed Quiz Execution',
        `Failed to start timed quiz - ${startError.message}`,
        'timed-error-failed.png',
        'Check timer functionality and question loading for timed quiz mode'
      );
      return false;
    }
    
  } catch (error) {
    await screenshot(page, 'timed-error-navigation');
    logError('Timed Quiz', error);
    return false;
  }
};

const testCustomQuiz = async (page) => {
  try {
    console.log('🎨 Testing Custom Quiz Mode...');
    
    // Navigate to dashboard
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await screenshot(page, 'custom-01-dashboard');
    
    // Click Custom Quiz
    const customQuizSelector = '[data-testid="custom-quiz"], button:has-text("Custom Quiz"), a[href*="custom"]';
    await page.click(customQuizSelector);
    console.log('🎛️ Custom Quiz clicked');
    
    // Wait for quiz setup page
    await page.waitForLoadState('networkidle');
    await screenshot(page, 'custom-02-quiz-setup');
    
    // Check if we're on quiz page
    const currentUrl = page.url();
    if (!currentUrl.includes('/quiz')) {
      logRoadblock(
        'Custom Quiz Navigation',
        'Failed to navigate to custom quiz setup page',
        'custom-02-quiz-setup.png',
        'Check routing configuration for custom quiz mode'
      );
      return false;
    }
    
    // Click Start Quiz button
    try {
      const startButton = page.locator('button:has-text("Start Quiz")');
      await startButton.click();
      console.log('🚀 Custom Quiz started');
      
      // Wait for quiz engine to load
      await page.waitForTimeout(3000);
      await screenshot(page, 'custom-03-quiz-engine');
      
      // Check for quiz questions
      const hasQuestions = await page.locator('.quiz-question, [data-testid="question"]').isVisible().catch(() => false);
      if (!hasQuestions) {
        throw new Error('Custom quiz questions did not load');
      }
      
      console.log('✅ Custom Quiz loaded successfully');
      return true;
      
    } catch (startError) {
      await screenshot(page, 'custom-error-failed');
      logError('Custom Quiz Start', startError);
      logRoadblock(
        'Custom Quiz Execution',
        `Failed to start custom quiz - ${startError.message}`,
        'custom-error-failed.png',
        'Check custom quiz configuration and question loading'
      );
      return false;
    }
    
  } catch (error) {
    await screenshot(page, 'custom-error-navigation');
    logError('Custom Quiz', error);
    return false;
  }
};

// Cross-Mode Access Testing
const testCrossModeAccess = async (page) => {
  try {
    console.log('🔄 Testing cross-mode quiz access...');
    
    // Test direct URL access to each mode
    const modes = ['quick', 'timed', 'custom'];
    const results = {};
    
    for (const mode of modes) {
      try {
        console.log(`🔗 Testing direct access to ${mode} quiz...`);
        await page.goto(`${TEST_CONFIG.baseUrl}/quiz/${mode}`);
        await page.waitForLoadState('networkidle');
        await screenshot(page, `cross-mode-${mode}-access`);
        
        // Check if page loads correctly
        const hasSetup = await page.locator('button:has-text("Start Quiz")').isVisible().catch(() => false);
        const hasError = await page.locator('.error, [role="alert"]').isVisible().catch(() => false);
        
        results[mode] = {
          accessible: hasSetup && !hasError,
          hasError: hasError,
          url: page.url()
        };
        
        console.log(`${hasSetup ? '✅' : '❌'} Direct ${mode} quiz access: ${hasSetup ? 'Success' : 'Failed'}`);
        
      } catch (error) {
        results[mode] = { accessible: false, error: error.message };
        logError(`Cross-Mode ${mode}`, error);
      }
    }
    
    return results;
    
  } catch (error) {
    logError('Cross-Mode Access', error);
    return {};
  }
};

// Main Testing Function
const runComprehensiveTest = async () => {
  let browser, page;
  
  try {
    console.log('🚀 Starting Comprehensive Quiz Flow Testing...');
    console.log(`📍 Base URL: ${TEST_CONFIG.baseUrl}`);
    console.log(`👤 Test User: ${TEST_CONFIG.testUser.email}`);
    
    // Launch browser
    browser = await chromium.launch({ 
      headless: true,   // Run in headless mode for server environment
      slowMo: 500       // Slow down operations for stability
    });
    
    page = await browser.newPage();
    page.setDefaultTimeout(TEST_CONFIG.timeout);
    
    // Enable console logging from the page
    page.on('console', msg => console.log(`🌐 PAGE: ${msg.text()}`));
    page.on('pageerror', error => logError('Page Error', error));
    
    // Test Authentication
    console.log('\n🔐 Phase 1: Authentication Testing');
    const authSuccess = await authenticateUser(page);
    testReport.testResults.push({
      phase: 'Authentication',
      success: authSuccess,
      timestamp: new Date().toISOString()
    });
    
    if (!authSuccess) {
      console.log('❌ Authentication failed - skipping quiz tests');
      return testReport;
    }
    
    // Test Quiz Modes
    console.log('\n🎯 Phase 2: Quiz Mode Testing');
    
    const quickResult = await testQuickQuiz(page);
    testReport.testResults.push({
      phase: 'Quick Quiz',
      success: quickResult,
      timestamp: new Date().toISOString()
    });
    
    const timedResult = await testTimedQuiz(page);
    testReport.testResults.push({
      phase: 'Timed Quiz',
      success: timedResult,
      timestamp: new Date().toISOString()
    });
    
    const customResult = await testCustomQuiz(page);
    testReport.testResults.push({
      phase: 'Custom Quiz',
      success: customResult,
      timestamp: new Date().toISOString()
    });
    
    // Test Cross-Mode Access
    console.log('\n🔄 Phase 3: Cross-Mode Access Testing');
    const crossModeResults = await testCrossModeAccess(page);
    testReport.testResults.push({
      phase: 'Cross-Mode Access',
      success: Object.values(crossModeResults).every(r => r.accessible),
      details: crossModeResults,
      timestamp: new Date().toISOString()
    });
    
    console.log('\n✅ Comprehensive testing completed');
    
  } catch (error) {
    console.error('🚨 Critical testing error:', error);
    logError('Testing Framework', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  return testReport;
};

// Generate Test Report
const generateReport = (report) => {
  const reportPath = path.join(TEST_CONFIG.screenshotDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 COMPREHENSIVE TEST REPORT');
  console.log('================================');
  
  // Summary
  const totalTests = report.testResults.length;
  const passedTests = report.testResults.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests} ✅`);
  console.log(`   Failed: ${failedTests} ❌`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Test Results
  console.log(`\n🧪 TEST RESULTS:`);
  report.testResults.forEach(result => {
    console.log(`   ${result.success ? '✅' : '❌'} ${result.phase}`);
  });
  
  // Roadblocks
  if (report.roadblocks.length > 0) {
    console.log(`\n🚧 ROADBLOCKS IDENTIFIED (${report.roadblocks.length}):`);
    report.roadblocks.forEach((roadblock, index) => {
      console.log(`   ${index + 1}. ${roadblock.stage}: ${roadblock.description}`);
      console.log(`      💡 Recommendation: ${roadblock.recommendation}`);
      console.log(`      📸 Screenshot: ${roadblock.screenshot}`);
    });
  }
  
  // Errors
  if (report.errorLogs.length > 0) {
    console.log(`\n🚨 ERROR LOGS (${report.errorLogs.length}):`);
    report.errorLogs.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.stage}: ${error.error}`);
    });
  }
  
  console.log(`\n📁 Full report saved to: ${reportPath}`);
  console.log(`📸 Screenshots saved to: ${TEST_CONFIG.screenshotDir}`);
  
  return reportPath;
};

// Execute Testing
(async () => {
  try {
    const report = await runComprehensiveTest();
    const reportPath = generateReport(report);
    
    // Exit with appropriate code
    const hasFailures = report.roadblocks.length > 0 || report.errorLogs.length > 0 || 
                       report.testResults.some(r => !r.success);
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('🚨 Fatal testing error:', error);
    process.exit(1);
  }
})();