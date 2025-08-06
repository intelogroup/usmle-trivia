#!/usr/bin/env node

/**
 * CORRECTED COMPREHENSIVE QUIZ FLOW TESTING SCRIPT
 * 
 * Fixed with proper selectors for the QuizEngine component
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
  screenshotDir: './screenshots/quiz-corrected/',
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

const logSuccess = (stage, description) => {
  console.log(`✅ SUCCESS in ${stage}: ${description}`);
  return { stage, description, success: true };
};

// Authentication Helper
const authenticateUser = async (page) => {
  try {
    console.log('🔐 Starting authentication flow...');
    
    // Navigate to login page
    await page.goto(`${TEST_CONFIG.baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    await screenshot(page, '01-login-page');
    
    // Fill login form
    console.log('📝 Filling login credentials...');
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email);
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password);
    
    // Submit login
    await page.click('button[type="submit"]');
    console.log('🚀 Login form submitted');
    
    // Wait for authentication result
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Authentication successful');
    await screenshot(page, '02-dashboard-after-login');
    return true;
    
  } catch (error) {
    await screenshot(page, 'error-auth-failure');
    logError('Authentication Setup', error);
    return false;
  }
};

// Enhanced Quiz Testing with Proper Selectors
const testQuizMode = async (page, mode) => {
  try {
    console.log(`🎯 Testing ${mode} Quiz Mode...`);
    
    // Navigate to dashboard
    await page.goto(`${TEST_CONFIG.baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await screenshot(page, `${mode}-01-dashboard`);
    
    // Click the specific quiz mode
    const quizSelector = `button:has-text("${mode.charAt(0).toUpperCase() + mode.slice(1)} Quiz"), a[href*="${mode}"]`;
    await page.click(quizSelector);
    console.log(`📱 ${mode} Quiz clicked`);
    
    // Wait for quiz setup page
    await page.waitForLoadState('networkidle');
    await screenshot(page, `${mode}-02-quiz-setup`);
    
    // Check if we're on quiz page
    const currentUrl = page.url();
    if (!currentUrl.includes('/quiz')) {
      throw new Error(`Failed to navigate to ${mode} quiz setup page`);
    }
    
    // Click Start Quiz button
    const startButton = page.locator('button:has-text("Start Quiz")');
    await startButton.click();
    console.log('🚀 Start Quiz clicked');
    
    // Wait for quiz engine to load and render
    await page.waitForTimeout(5000); // Give time for Convex queries and React rendering
    await screenshot(page, `${mode}-03-quiz-engine-loaded`);
    
    // Check for proper quiz elements with correct selectors
    const hasQuestionHeader = await page.locator('h1:has-text("Question")').isVisible().catch(() => false);
    const hasAnswerOptions = await page.locator('[data-testid="answer-option-0"]').isVisible().catch(() => false);
    const hasQuestionText = await page.locator('div.prose p').isVisible().catch(() => false);
    const hasProgressBar = await page.locator('div.bg-gradient-to-r').isVisible().catch(() => false);
    const hasLoading = await page.locator('text="Loading quiz questions"').isVisible().catch(() => false);
    
    console.log(`🔍 ${mode} Quiz state:`);
    console.log(`   Question header: ${hasQuestionHeader ? '✅' : '❌'}`);
    console.log(`   Answer options: ${hasAnswerOptions ? '✅' : '❌'}`);
    console.log(`   Question text: ${hasQuestionText ? '✅' : '❌'}`);
    console.log(`   Progress bar: ${hasProgressBar ? '✅' : '❌'}`);
    console.log(`   Still loading: ${hasLoading ? '⏳' : '✅'}`);
    
    if (hasLoading) {
      console.log('⏳ Still loading, waiting longer...');
      await page.waitForTimeout(5000);
      const hasAnswerOptionsAfterWait = await page.locator('[data-testid="answer-option-0"]').isVisible().catch(() => false);
      if (!hasAnswerOptionsAfterWait) {
        throw new Error(`${mode} quiz questions did not load after extended wait`);
      }
    }
    
    if (!hasAnswerOptions || !hasQuestionText) {
      throw new Error(`${mode} quiz questions are not properly displayed`);
    }
    
    // Test answer selection
    console.log(`🎯 Testing answer selection in ${mode} quiz...`);
    await page.locator('[data-testid="answer-option-0"]').click();
    await page.waitForTimeout(2000);
    await screenshot(page, `${mode}-04-answer-selected`);
    
    // Check if explanation appears
    const hasExplanation = await page.locator('h3:has-text("Explanation")').isVisible().catch(() => false);
    const hasNextButton = await page.locator('[data-testid="next-question-btn"]').isVisible().catch(() => false);
    
    console.log(`   Explanation shown: ${hasExplanation ? '✅' : '❌'}`);
    console.log(`   Next button visible: ${hasNextButton ? '✅' : '❌'}`);
    
    if (!hasExplanation || !hasNextButton) {
      throw new Error(`${mode} quiz explanation or navigation not working`);
    }
    
    logSuccess(`${mode} Quiz Complete Flow`, 'Quiz loaded, answer selected, explanation shown');
    console.log(`✅ ${mode} Quiz complete flow successful`);
    return true;
    
  } catch (error) {
    await screenshot(page, `${mode}-error-failed`);
    logError(`${mode} Quiz`, error);
    console.error(`❌ ${mode} Quiz failed:`, error.message);
    return false;
  }
};

// Main Testing Function
const runCorrectedTest = async () => {
  let browser, page;
  
  try {
    console.log('🚀 Starting CORRECTED Comprehensive Quiz Flow Testing...');
    console.log(`📍 Base URL: ${TEST_CONFIG.baseUrl}`);
    console.log(`👤 Test User: ${TEST_CONFIG.testUser.email}`);
    
    // Launch browser
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    page.setDefaultTimeout(TEST_CONFIG.timeout);
    
    // Enable console logging from the page for debugging
    page.on('console', msg => {
      if (msg.text().includes('Quiz') || msg.text().includes('Question') || msg.text().includes('Error')) {
        console.log(`🌐 PAGE: ${msg.text()}`);
      }
    });
    
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
    
    // Test Quiz Modes with corrected selectors
    console.log('\n🎯 Phase 2: Quiz Mode Testing (CORRECTED)');
    
    const quickResult = await testQuizMode(page, 'quick');
    testReport.testResults.push({
      phase: 'Quick Quiz',
      success: quickResult,
      timestamp: new Date().toISOString()
    });
    
    const timedResult = await testQuizMode(page, 'timed');
    testReport.testResults.push({
      phase: 'Timed Quiz',
      success: timedResult,
      timestamp: new Date().toISOString()
    });
    
    const customResult = await testQuizMode(page, 'custom');
    testReport.testResults.push({
      phase: 'Custom Quiz',
      success: customResult,
      timestamp: new Date().toISOString()
    });
    
    console.log('\n✅ CORRECTED Comprehensive testing completed');
    
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
  const reportPath = path.join(TEST_CONFIG.screenshotDir, 'corrected-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 CORRECTED TEST REPORT');
  console.log('=========================');
  
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
  
  // Errors
  if (report.errorLogs.length > 0) {
    console.log(`\n🚨 ERROR LOGS (${report.errorLogs.length}):`);
    report.errorLogs.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.stage}: ${error.error}`);
    });
  } else {
    console.log(`\n🎉 NO ERRORS FOUND!`);
  }
  
  console.log(`\n📁 Full report saved to: ${reportPath}`);
  console.log(`📸 Screenshots saved to: ${TEST_CONFIG.screenshotDir}`);
  
  return reportPath;
};

// Execute Testing
(async () => {
  try {
    const report = await runCorrectedTest();
    const reportPath = generateReport(report);
    
    // Exit with appropriate code
    const hasFailures = report.errorLogs.length > 0 || 
                       report.testResults.some(r => !r.success);
    
    if (!hasFailures) {
      console.log('\n🎉 ALL TESTS PASSED! MedQuiz Pro quiz flow is working perfectly! 🏥✨');
    }
    
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('🚨 Fatal testing error:', error);
    process.exit(1);
  }
})();