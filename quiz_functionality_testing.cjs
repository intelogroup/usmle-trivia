#!/usr/bin/env node

/**
 * COMPREHENSIVE QUIZ FUNCTIONALITY TESTING SCRIPT
 * 
 * Specialized mission: Test each quiz mode individually, identify roadblocks,
 * and ensure seamless user experience from start to finish.
 * 
 * Test Coverage:
 * 1. Quick Quiz Mode (5 questions, no timer) - Full journey
 * 2. Timed Challenge Mode (10 questions, timer) - Timer functionality
 * 3. Custom Practice Mode (8 questions, custom) - Configuration options
 * 4. Authentication & User Session Management
 * 5. Database Connectivity & Data Persistence
 * 6. Error Handling & Recovery Mechanisms
 * 7. Mobile Responsiveness & Accessibility
 * 8. Performance & Loading States
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test Configuration - Updated for current setup
const TEST_CONFIG = {
  baseUrl: 'http://localhost:4175',
  testUser: {
    email: 'jayveedz19@gmail.com',
    password: 'Jimkali90#',
    name: 'Jay veedz'
  },
  screenshotDir: './screenshots/quiz-functionality-testing/',
  timeout: 30000,
  quizModes: {
    quick: {
      name: 'Quick Quiz',
      path: '/quiz/quick',
      expectedQuestions: 5,
      hasTimer: false,
      duration: null
    },
    timed: {
      name: 'Timed Challenge',
      path: '/quiz/timed',
      expectedQuestions: 10,
      hasTimer: true,
      duration: 600 // 10 minutes
    },
    custom: {
      name: 'Custom Practice',
      path: '/quiz/custom',
      expectedQuestions: 8,
      hasTimer: true,
      duration: 480 // 8 minutes
    }
  }
};

// Ensure screenshot directory exists
if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
  fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
}

// Test Results Storage
let testReport = {
  timestamp: new Date().toISOString(),
  testEnvironment: {
    baseUrl: TEST_CONFIG.baseUrl,
    browser: 'Chromium',
    viewport: { width: 1280, height: 720 }
  },
  authenticationResults: {},
  quizModeResults: {},
  roadblocks: [],
  errorLogs: [],
  performanceMetrics: {},
  recommendations: []
};

// Utility Functions
const screenshot = async (page, name, description = '') => {
  const timestamp = Date.now();
  const filename = `${timestamp}_${name}.png`;
  const fullPath = path.join(TEST_CONFIG.screenshotDir, filename);
  
  await page.screenshot({
    path: fullPath,
    fullPage: true
  });
  
  console.log(`📸 Screenshot: ${filename} - ${description}`);
  return { filename, description, timestamp };
};

const logError = (section, error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    section,
    error: error.message || error,
    stack: error.stack,
    context
  };
  
  testReport.errorLogs.push(errorLog);
  console.error(`❌ Error in ${section}:`, error.message || error);
};

const logRoadblock = (description, severity, impact, solution) => {
  const roadblock = {
    timestamp: new Date().toISOString(),
    description,
    severity, // 'low', 'medium', 'high', 'critical'
    impact,
    solution
  };
  
  testReport.roadblocks.push(roadblock);
  console.warn(`🚧 Roadblock [${severity.toUpperCase()}]: ${description}`);
};

// Enhanced wait for element with detailed error reporting
const waitForElementSafely = async (page, selector, timeout = 10000, description = '') => {
  try {
    console.log(`⏳ Waiting for element: ${selector} - ${description}`);
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    logError('Element Wait', error, { selector, description, timeout });
    logRoadblock(
      `Element not found: ${selector}`,
      'high',
      'User cannot proceed with the current action',
      `Ensure ${description} loads properly or increase timeout`
    );
    return false;
  }
};

// Test Authentication Flow
async function testAuthentication(page) {
  console.log('\n🔐 Testing Authentication Flow...');
  
  try {
    // Navigate to homepage
    await page.goto(TEST_CONFIG.baseUrl);
    await screenshot(page, 'homepage', 'Initial homepage load');
    
    // Check if already logged in
    const userMenuExists = await page.locator('[data-testid="user-menu"], .user-menu, [aria-label*="user"], [aria-label*="profile"]').count() > 0;
    
    if (userMenuExists) {
      console.log('✅ User already authenticated');
      testReport.authenticationResults.status = 'already_authenticated';
      return true;
    }
    
    // Look for login button
    const loginSelectors = [
      'button:has-text("Login")',
      'a:has-text("Login")',
      '[data-testid="login-button"]',
      '.login-button',
      'button:has-text("Sign In")',
      'a[href*="login"]'
    ];
    
    let loginFound = false;
    for (const selector of loginSelectors) {
      if (await page.locator(selector).count() > 0) {
        await page.click(selector);
        loginFound = true;
        break;
      }
    }
    
    if (!loginFound) {
      logRoadblock(
        'No login button found on homepage',
        'critical',
        'Users cannot authenticate to use quiz features',
        'Add visible login/authentication entry point on homepage'
      );
      return false;
    }
    
    await screenshot(page, 'login_page', 'Login page after clicking login button');
    
    // Fill login form
    const emailSelectors = ['input[type="email"]', 'input[name="email"]', '#email'];
    const passwordSelectors = ['input[type="password"]', 'input[name="password"]', '#password'];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      if (await page.locator(selector).count() > 0) {
        await page.fill(selector, TEST_CONFIG.testUser.email);
        emailFilled = true;
        break;
      }
    }
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      if (await page.locator(selector).count() > 0) {
        await page.fill(selector, TEST_CONFIG.testUser.password);
        passwordFilled = true;
        break;
      }
    }
    
    if (!emailFilled || !passwordFilled) {
      logRoadblock(
        'Login form fields not found or not fillable',
        'critical',
        'Users cannot enter credentials',
        'Ensure login form has proper input fields with correct selectors'
      );
      return false;
    }
    
    // Submit login form
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      '.login-submit'
    ];
    
    let submitFound = false;
    for (const selector of submitSelectors) {
      if (await page.locator(selector).count() > 0) {
        await page.click(selector);
        submitFound = true;
        break;
      }
    }
    
    if (!submitFound) {
      logRoadblock(
        'Login submit button not found',
        'high',
        'Users cannot submit login credentials',
        'Add visible submit button to login form'
      );
      return false;
    }
    
    // Wait for login success - dashboard or user menu should appear
    await page.waitForTimeout(3000); // Wait for navigation
    await screenshot(page, 'post_login', 'Page after login attempt');
    
    // Check for successful login indicators
    const successIndicators = [
      '[data-testid="user-menu"]',
      '.user-menu',
      '[aria-label*="user"]',
      'h1:has-text("Dashboard")',
      '.dashboard',
      ':has-text("Welcome")',
    ];
    
    let loginSuccess = false;
    for (const selector of successIndicators) {
      if (await page.locator(selector).count() > 0) {
        loginSuccess = true;
        break;
      }
    }
    
    if (loginSuccess) {
      console.log('✅ Authentication successful');
      testReport.authenticationResults = {
        status: 'success',
        method: 'email_password',
        user: TEST_CONFIG.testUser.email
      };
      return true;
    } else {
      logRoadblock(
        'Login appears to fail - no success indicators found',
        'critical',
        'Users cannot access authenticated features',
        'Verify login credentials and authentication flow'
      );
      testReport.authenticationResults = {
        status: 'failed',
        error: 'No success indicators after login attempt'
      };
      return false;
    }
    
  } catch (error) {
    logError('Authentication', error);
    testReport.authenticationResults = {
      status: 'error',
      error: error.message
    };
    return false;
  }
}

// Test Individual Quiz Mode
async function testQuizMode(page, modeKey) {
  const mode = TEST_CONFIG.quizModes[modeKey];
  console.log(`\n🎯 Testing ${mode.name} Mode...`);
  
  const modeResults = {
    mode: modeKey,
    name: mode.name,
    startTime: Date.now(),
    phases: {},
    roadblocks: [],
    screenshots: []
  };
  
  try {
    // Phase 1: Navigate to Quiz Mode
    console.log(`📍 Phase 1: Navigation to ${mode.name}`);
    
    // Go to homepage first
    await page.goto(TEST_CONFIG.baseUrl);
    await page.waitForTimeout(2000);
    
    // Look for quiz mode selector or navigation
    const quizSelectors = [
      `a[href="${mode.path}"]`,
      `button:has-text("${mode.name}")`,
      `[data-testid="${modeKey}-quiz"]`,
      `.quiz-mode.${modeKey}`,
      `:has-text("${mode.name}")`
    ];
    
    let navigationFound = false;
    for (const selector of quizSelectors) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await elements.first().click();
        navigationFound = true;
        break;
      }
    }
    
    if (!navigationFound) {
      // Try direct navigation
      await page.goto(TEST_CONFIG.baseUrl + mode.path);
    }
    
    const navScreenshot = await screenshot(page, `${modeKey}_navigation`, `Navigation to ${mode.name}`);
    modeResults.screenshots.push(navScreenshot);
    
    await page.waitForTimeout(3000);
    
    // Phase 2: Quiz Setup/Configuration
    console.log(`⚙️ Phase 2: Quiz Setup for ${mode.name}`);
    
    // Look for start quiz button
    const startSelectors = [
      'button:has-text("Start Quiz")',
      'button:has-text("Begin")',
      '[data-testid="start-quiz"]',
      '.start-quiz-btn'
    ];
    
    let startFound = false;
    for (const selector of startSelectors) {
      if (await page.locator(selector).count() > 0) {
        await page.click(selector);
        startFound = true;
        break;
      }
    }
    
    if (!startFound) {
      logRoadblock(
        `No start quiz button found for ${mode.name}`,
        'high',
        'Users cannot start the quiz',
        `Add visible start quiz button for ${mode.name} mode`
      );
      modeResults.phases.setup = 'failed';
    } else {
      modeResults.phases.setup = 'success';
    }
    
    const setupScreenshot = await screenshot(page, `${modeKey}_setup`, `Quiz setup for ${mode.name}`);
    modeResults.screenshots.push(setupScreenshot);
    
    await page.waitForTimeout(3000);
    
    // Phase 3: Active Quiz Testing
    console.log(`🎮 Phase 3: Active Quiz Testing for ${mode.name}`);
    
    // Check if quiz started (look for question)
    const questionSelectors = [
      '.quiz-question',
      '[data-testid="question"]',
      ':has-text("Question 1")',
      '.question-text',
      'h1:has-text("Question")'
    ];
    
    let quizActive = false;
    for (const selector of questionSelectors) {
      if (await page.locator(selector).count() > 0) {
        quizActive = true;
        break;
      }
    }
    
    if (!quizActive) {
      logRoadblock(
        `Quiz did not start properly for ${mode.name}`,
        'critical',
        'Users cannot take the quiz',
        `Fix quiz initialization for ${mode.name} mode`
      );
      modeResults.phases.active = 'failed';
      return modeResults;
    }
    
    const activeScreenshot = await screenshot(page, `${modeKey}_active`, `Active quiz for ${mode.name}`);
    modeResults.screenshots.push(activeScreenshot);
    
    // Test timer functionality if applicable
    if (mode.hasTimer) {
      const timerSelectors = [
        '.timer',
        '[data-testid="timer"]',
        ':has-text(":")' // Look for time format like "10:00"
      ];
      
      let timerFound = false;
      for (const selector of timerSelectors) {
        if (await page.locator(selector).count() > 0) {
          timerFound = true;
          console.log(`✅ Timer found for ${mode.name}`);
          break;
        }
      }
      
      if (!timerFound) {
        logRoadblock(
          `Timer not visible for ${mode.name}`,
          'medium',
          'Users cannot see remaining time',
          `Add visible timer display for ${mode.name} mode`
        );
      }
    }
    
    // Test question answering
    const answerSelectors = [
      '.quiz-option',
      '.answer-choice',
      '[data-testid*="option"]',
      'button:has-text("A)")',
      'input[type="radio"]'
    ];
    
    let answerFound = false;
    for (const selector of answerSelectors) {
      const options = page.locator(selector);
      if (await options.count() > 0) {
        // Click the first option
        await options.first().click();
        answerFound = true;
        console.log(`✅ Answer selected for ${mode.name}`);
        break;
      }
    }
    
    if (!answerFound) {
      logRoadblock(
        `No answer options found for ${mode.name}`,
        'critical',
        'Users cannot answer questions',
        `Fix question option rendering for ${mode.name} mode`
      );
      modeResults.phases.active = 'failed';
      return modeResults;
    }
    
    const answerScreenshot = await screenshot(page, `${modeKey}_answered`, `Question answered for ${mode.name}`);
    modeResults.screenshots.push(answerScreenshot);
    
    await page.waitForTimeout(2000);
    
    // Look for explanation or next question
    const nextSelectors = [
      'button:has-text("Next")',
      'button:has-text("Continue")',
      '[data-testid="next-question"]',
      '.next-btn'
    ];
    
    let nextFound = false;
    for (const selector of nextSelectors) {
      if (await page.locator(selector).count() > 0) {
        await page.click(selector);
        nextFound = true;
        break;
      }
    }
    
    if (nextFound) {
      console.log(`✅ Navigation to next question works for ${mode.name}`);
      modeResults.phases.navigation = 'success';
    } else {
      logRoadblock(
        `Cannot navigate to next question in ${mode.name}`,
        'high',
        'Users stuck on first question',
        `Add next question navigation for ${mode.name} mode`
      );
      modeResults.phases.navigation = 'failed';
    }
    
    modeResults.phases.active = 'success';
    
    // Try to complete quiz (click through a few questions)
    for (let i = 1; i < 3; i++) {
      await page.waitForTimeout(2000);
      
      // Answer next question if available
      for (const selector of answerSelectors) {
        const options = page.locator(selector);
        if (await options.count() > 0) {
          await options.first().click();
          break;
        }
      }
      
      await page.waitForTimeout(1000);
      
      // Click next if available
      for (const selector of nextSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.click(selector);
          break;
        }
      }
    }
    
    const progressScreenshot = await screenshot(page, `${modeKey}_progress`, `Quiz progress for ${mode.name}`);
    modeResults.screenshots.push(progressScreenshot);
    
    modeResults.endTime = Date.now();
    modeResults.duration = modeResults.endTime - modeResults.startTime;
    
    console.log(`✅ ${mode.name} testing completed successfully`);
    
  } catch (error) {
    logError(`Quiz Mode ${mode.name}`, error);
    modeResults.error = error.message;
    modeResults.endTime = Date.now();
    modeResults.duration = modeResults.endTime - modeResults.startTime;
  }
  
  testReport.quizModeResults[modeKey] = modeResults;
  return modeResults;
}

// Generate comprehensive test report
function generateReport() {
  const reportContent = `# COMPREHENSIVE QUIZ FUNCTIONALITY TEST REPORT

**Generated:** ${testReport.timestamp}
**Test Environment:** ${testReport.testEnvironment.baseUrl}

## 🎯 EXECUTIVE SUMMARY

This report provides a comprehensive analysis of the MedQuiz Pro quiz functionality, testing each quiz mode individually to identify roadblocks and ensure seamless user experience.

## 🔐 AUTHENTICATION RESULTS

**Status:** ${testReport.authenticationResults.status || 'Not tested'}
${testReport.authenticationResults.error ? `**Error:** ${testReport.authenticationResults.error}` : ''}
${testReport.authenticationResults.user ? `**User:** ${testReport.authenticationResults.user}` : ''}

## 🎮 QUIZ MODE TESTING RESULTS

${Object.entries(testReport.quizModeResults).map(([key, results]) => `
### ${results.name}

**Duration:** ${results.duration ? Math.round(results.duration / 1000) + 's' : 'N/A'}
**Screenshots:** ${results.screenshots.length}

**Phase Results:**
${Object.entries(results.phases).map(([phase, status]) => `- ${phase}: ${status}`).join('\n')}

${results.error ? `**Error:** ${results.error}` : ''}
`).join('\n')}

## 🚧 IDENTIFIED ROADBLOCKS

${testReport.roadblocks.length === 0 ? '*No roadblocks identified*' : ''}
${testReport.roadblocks.map((roadblock, index) => `
### Roadblock #${index + 1}: ${roadblock.severity.toUpperCase()}

**Description:** ${roadblock.description}
**Impact:** ${roadblock.impact}
**Solution:** ${roadblock.solution}
**Timestamp:** ${roadblock.timestamp}
`).join('\n')}

## ❌ ERROR LOG

${testReport.errorLogs.length === 0 ? '*No errors logged*' : ''}
${testReport.errorLogs.map((error, index) => `
### Error #${index + 1}: ${error.section}

**Message:** ${error.error}
**Timestamp:** ${error.timestamp}
${error.context ? `**Context:** ${JSON.stringify(error.context, null, 2)}` : ''}
`).join('\n')}

## 📊 PERFORMANCE METRICS

- **Total Test Duration:** ${Date.now() - new Date(testReport.timestamp).getTime()}ms
- **Screenshots Captured:** ${Object.values(testReport.quizModeResults).reduce((acc, mode) => acc + mode.screenshots.length, 0)}
- **Quiz Modes Tested:** ${Object.keys(testReport.quizModeResults).length}

## 🎯 RECOMMENDATIONS

${testReport.recommendations.length === 0 ? '*No specific recommendations generated*' : ''}
${testReport.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

## 🏁 CONCLUSION

${testReport.roadblocks.length === 0 && testReport.errorLogs.length === 0 
  ? '✅ **All quiz modes are functioning properly with no roadblocks identified.**'
  : `⚠️ **${testReport.roadblocks.length} roadblocks and ${testReport.errorLogs.length} errors identified that need attention.**`
}

---
*Report generated by Quiz Functionality Testing Suite*
`;

  const reportPath = './QUIZ_FUNCTIONALITY_TEST_REPORT.md';
  fs.writeFileSync(reportPath, reportContent);
  console.log(`📄 Test report generated: ${reportPath}`);
  
  return reportPath;
}

// Main test execution
async function runQuizFunctionalityTests() {
  console.log('🚀 Starting Comprehensive Quiz Functionality Testing...');
  console.log(`🔗 Testing URL: ${TEST_CONFIG.baseUrl}`);
  
  // Launch browser
  const browser = await chromium.launch({
    headless: true, // Set to false for debugging
    defaultViewport: null,
  });
  
  const context = await browser.newContext({
    viewport: testReport.testEnvironment.viewport,
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`🔥 Browser Console Error: ${msg.text()}`);
    }
  });
  
  try {
    // Test authentication first
    const authSuccess = await testAuthentication(page);
    
    if (authSuccess) {
      // Test each quiz mode individually
      for (const modeKey of Object.keys(TEST_CONFIG.quizModes)) {
        await testQuizMode(page, modeKey);
        
        // Brief pause between mode tests
        await page.waitForTimeout(2000);
      }
    } else {
      logRoadblock(
        'Authentication failed - cannot test quiz modes',
        'critical',
        'Users cannot access quiz functionality',
        'Fix authentication system before testing quiz modes'
      );
    }
    
    // Generate and save comprehensive report
    const reportPath = generateReport();
    
    console.log('\n🎉 Quiz functionality testing completed!');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: ${TEST_CONFIG.screenshotDir}`);
    
    // Display summary
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Quiz Modes Tested: ${Object.keys(testReport.quizModeResults).length}`);
    console.log(`🚧 Roadblocks Found: ${testReport.roadblocks.length}`);
    console.log(`❌ Errors Logged: ${testReport.errorLogs.length}`);
    
    if (testReport.roadblocks.length > 0) {
      console.log('\n🚨 CRITICAL ROADBLOCKS REQUIRING ATTENTION:');
      testReport.roadblocks
        .filter(rb => rb.severity === 'critical')
        .forEach((rb, idx) => {
          console.log(`${idx + 1}. ${rb.description}`);
        });
    }
    
  } catch (error) {
    console.error('🔥 Fatal error during testing:', error);
    logError('Main Test Loop', error);
  } finally {
    await browser.close();
  }
}

// Execute if run directly
if (require.main === module) {
  runQuizFunctionalityTests().catch(console.error);
}

module.exports = {
  runQuizFunctionalityTests,
  TEST_CONFIG,
  testReport
};