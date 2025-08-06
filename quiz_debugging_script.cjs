#!/usr/bin/env node

/**
 * DETAILED QUIZ ENGINE DEBUGGING SCRIPT
 * 
 * This script will:
 * 1. Navigate to a quiz 
 * 2. Examine the exact state when questions fail to load
 * 3. Capture detailed console logs and network requests
 * 4. Identify the specific point of failure
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5178',
  testUser: {
    email: 'jayveedz19@gmail.com',
    password: 'Jimkali90#'
  },
  screenshotDir: './screenshots/quiz-debugging/',
  timeout: 30000
};

// Ensure screenshot directory exists
if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
  fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
}

// Debugging report
let debugReport = {
  timestamp: new Date().toISOString(),
  pageUrl: '',
  consoleMessages: [],
  networkRequests: [],
  pageContent: '',
  errors: [],
  recommendations: []
};

const screenshot = async (page, name) => {
  const timestamp = Date.now();
  const filename = `${timestamp}-${name}.png`;
  const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filename;
};

const authenticateUser = async (page) => {
  try {
    console.log('🔐 Logging in...');
    await page.goto(`${TEST_CONFIG.baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', TEST_CONFIG.testUser.email);
    await page.fill('input[type="password"]', TEST_CONFIG.testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for authentication
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    return false;
  }
};

const debugQuizEngine = async (page) => {
  try {
    console.log('🔍 Starting detailed QuizEngine debugging...');
    
    // Navigate to quick quiz
    await page.goto(`${TEST_CONFIG.baseUrl}/quiz/quick`);
    await page.waitForLoadState('networkidle');
    debugReport.pageUrl = page.url();
    
    await screenshot(page, 'debug-01-quiz-setup');
    
    // Click start quiz
    const startButton = page.locator('button:has-text("Start Quiz")');
    await startButton.click();
    console.log('🚀 Start Quiz clicked');
    
    // Wait a moment for React to render
    await page.waitForTimeout(2000);
    await screenshot(page, 'debug-02-after-start-click');
    
    // Wait for either questions to load or error state
    await page.waitForTimeout(5000);
    
    // Capture page content
    debugReport.pageContent = await page.content();
    
    // Check for various elements
    const elementChecks = {
      hasQuestions: await page.locator('h1:has-text("Question")').isVisible().catch(() => false),
      hasLoading: await page.locator('text="Loading quiz questions"').isVisible().catch(() => false),
      hasErrorMessage: await page.locator('.error, [role="alert"]').isVisible().catch(() => false),
      hasQuizHeader: await page.locator('text="Quiz"').isVisible().catch(() => false),
      hasTimer: await page.locator('[data-testid="timer"], .timer').isVisible().catch(() => false),
      hasProgressBar: await page.locator('[role="progressbar"], .progress').isVisible().catch(() => false),
      hasQuestionText: await page.locator('text="A 45-year-old"').isVisible().catch(() => false),
      hasAnswerOptions: await page.locator('button:has-text("A)"), button:has-text("B)")').isVisible().catch(() => false)
    };
    
    console.log('🔍 Element visibility check:');
    Object.entries(elementChecks).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    // Get all text content visible on page
    const visibleText = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
          textNodes.push(node.textContent.trim());
        }
      }
      return textNodes;
    });
    
    console.log('👁️ All visible text on page:');
    visibleText.forEach((text, index) => {
      if (text.includes('Question') || text.includes('Quiz') || text.includes('Loading') || text.includes('Error')) {
        console.log(`   [${index}] "${text}"`);
      }
    });
    
    // Check React component state via browser console
    const reactState = await page.evaluate(() => {
      // Try to access React state if available
      const reactRoot = document.querySelector('#root');
      if (reactRoot && reactRoot._reactInternalFiber) {
        return 'React detected but state not accessible';
      }
      return 'React state check not available';
    });
    
    console.log('⚛️ React state:', reactState);
    
    // Check if Convex client is connected
    const convexState = await page.evaluate(() => {
      return {
        convexUrl: window.location.origin,
        hasConvexClient: typeof window.convex !== 'undefined',
        userAgent: navigator.userAgent
      };
    });
    
    console.log('🌐 Convex state:', convexState);
    
    await screenshot(page, 'debug-03-detailed-state');
    
    // Try to find any error elements with more specific selectors
    const errorElements = await page.locator('div, span, p').filter({ hasText: /error|fail|not found|invalid/i }).allTextContents();
    if (errorElements.length > 0) {
      console.log('🚨 Found potential error text:');
      errorElements.forEach(text => console.log(`   "${text}"`));
    }
    
    // Check if we're actually on the quiz engine page
    const currentPath = await page.evaluate(() => window.location.pathname);
    console.log('🌐 Current path:', currentPath);
    
    // Check for any Convex-related errors in console
    const convexErrors = debugReport.consoleMessages.filter(msg => 
      msg.toLowerCase().includes('convex') || 
      msg.toLowerCase().includes('query') || 
      msg.toLowerCase().includes('mutation')
    );
    
    if (convexErrors.length > 0) {
      console.log('🔗 Convex-related console messages:');
      convexErrors.forEach(msg => console.log(`   ${msg}`));
    }
    
    return {
      success: elementChecks.hasQuestions,
      elementChecks,
      visibleText: visibleText.slice(0, 20), // First 20 text nodes
      currentPath,
      convexErrors
    };
    
  } catch (error) {
    console.error('🚨 Debugging error:', error);
    return { success: false, error: error.message };
  }
};

// Main debugging function
const runDetailedDebugging = async () => {
  let browser, page;
  
  try {
    console.log('🔍 Starting detailed QuizEngine debugging...');
    
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    page.setDefaultTimeout(TEST_CONFIG.timeout);
    
    // Capture all console messages
    page.on('console', msg => {
      const message = `${msg.type()}: ${msg.text()}`;
      debugReport.consoleMessages.push(message);
      console.log(`🌐 CONSOLE: ${message}`);
    });
    
    // Capture network requests
    page.on('request', request => {
      const url = request.url();
      debugReport.networkRequests.push({
        url,
        method: request.method(),
        timestamp: new Date().toISOString()
      });
      if (url.includes('convex') || url.includes('quiz') || url.includes('questions')) {
        console.log(`🌐 REQUEST: ${request.method()} ${url}`);
      }
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      debugReport.errors.push(error.message);
      console.error(`🚨 PAGE ERROR: ${error.message}`);
    });
    
    // Authenticate
    const authSuccess = await authenticateUser(page);
    if (!authSuccess) {
      throw new Error('Authentication failed');
    }
    
    // Debug the quiz engine
    const debugResult = await debugQuizEngine(page);
    
    // Generate report
    const reportPath = path.join(TEST_CONFIG.screenshotDir, 'debug-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      ...debugReport,
      debugResult
    }, null, 2));
    
    console.log('\n🔍 DEBUGGING SUMMARY');
    console.log('===================');
    console.log(`Questions loaded: ${debugResult.success ? '✅' : '❌'}`);
    console.log(`Console messages: ${debugReport.consoleMessages.length}`);
    console.log(`Network requests: ${debugReport.networkRequests.length}`);
    console.log(`Page errors: ${debugReport.errors.length}`);
    console.log(`Current path: ${debugResult.currentPath}`);
    
    if (debugResult.elementChecks) {
      console.log('\nElement checks:');
      Object.entries(debugResult.elementChecks).forEach(([key, value]) => {
        console.log(`  ${value ? '✅' : '❌'} ${key}`);
      });
    }
    
    console.log(`\n📁 Full report saved to: ${reportPath}`);
    
    return debugResult.success;
    
  } catch (error) {
    console.error('🚨 Fatal debugging error:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Execute debugging
(async () => {
  try {
    const success = await runDetailedDebugging();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();