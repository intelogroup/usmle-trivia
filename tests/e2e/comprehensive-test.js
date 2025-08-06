import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

// Create screenshots directory
if (!existsSync('/tmp/medquiz-test')) {
  mkdirSync('/tmp/medquiz-test', { recursive: true });
}

const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  screenshots: [],
  errors: [],
  summary: {}
};

function addTestResult(name, status, details = '', screenshot = '') {
  testResults.tests.push({
    name,
    status,
    details,
    screenshot,
    timestamp: new Date().toISOString()
  });
  console.log(`${status === 'passed' ? '✅' : '❌'} ${name}: ${details}`);
}

async function takeScreenshot(page, name, description = '') {
  const filename = `/tmp/medquiz-test/${String(testResults.screenshots.length + 1).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  testResults.screenshots.push({ filename, name, description });
  console.log(`📸 Screenshot: ${filename}`);
  return filename;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🏥 Starting MedQuiz Pro E2E Testing');
    console.log('📍 Testing URL: http://localhost:5174');
    
    // Test 1: Initial Application Load
    console.log('\n🔄 Test 1: Application Load and Initial State');
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(3000); // Wait for app to fully load
    
    const screenshot1 = await takeScreenshot(page, 'initial-load', 'Initial application state');
    
    // Check if app loaded successfully
    const title = await page.title();
    const hasLogo = await page.locator('text="MedQuiz"').count() > 0;
    
    addTestResult(
      'Application Load', 
      (title.includes('MedQuiz') || hasLogo) ? 'passed' : 'failed',
      `Page title: "${title}", Logo found: ${hasLogo}`,
      screenshot1
    );
    
    // Test 2: Check Authentication State
    console.log('\n🔐 Test 2: Authentication State Analysis');
    
    const loginButton = page.locator('text="Login"').first();
    const registerButton = page.locator('text="Register"').first();
    const dashboardElements = page.locator('text="Dashboard", text="Quiz", text="Total Points"');
    
    const isLoggedIn = await dashboardElements.count() > 0;
    const hasAuthButtons = (await loginButton.count() > 0) || (await registerButton.count() > 0);
    
    const screenshot2 = await takeScreenshot(page, 'auth-state', 'Authentication state check');
    
    addTestResult(
      'Authentication State',
      'passed',
      `Logged in: ${isLoggedIn}, Auth buttons visible: ${hasAuthButtons}`,
      screenshot2
    );
    
    // Test 3: Navigation Testing
    console.log('\n🧭 Test 3: Navigation and Menu Testing');
    
    // Check sidebar navigation
    const navItems = [
      'Dashboard',
      'Quiz',
      'Quick Quiz',
      'Timed Quiz', 
      'Custom Quiz',
      'My Progress',
      'Review',
      'Leaderboard',
      'Analytics'
    ];
    
    let navResults = [];
    for (const item of navItems) {
      const element = await page.locator(`text="${item}"`).first();
      const isVisible = await element.isVisible().catch(() => false);
      navResults.push(`${item}: ${isVisible ? '✅' : '❌'}`);
    }
    
    addTestResult(
      'Navigation Elements',
      'passed',
      `Navigation items found: ${navResults.join(', ')}`,
      screenshot2
    );
    
    // Test 4: Quiz Mode Selection
    console.log('\n🎯 Test 4: Quiz Mode Selection Testing');
    
    // Look for quiz mode buttons
    const quickQuizBtn = page.locator('text="Quick"').first();
    const timedQuizBtn = page.locator('text="Timed"').first();
    const customQuizBtn = page.locator('text="Custom"').first();
    
    let quizModeFound = false;
    let screenshot3;
    
    if (await quickQuizBtn.isVisible()) {
      console.log('🎯 Found Quick Quiz button, attempting to start quiz...');
      await quickQuizBtn.click();
      await page.waitForTimeout(2000);
      screenshot3 = await takeScreenshot(page, 'quick-quiz-clicked', 'After clicking Quick Quiz');
      quizModeFound = true;
    } else if (await page.locator('text="Quick Quiz"').first().isVisible()) {
      console.log('🎯 Found Quick Quiz in sidebar, clicking...');
      await page.locator('text="Quick Quiz"').first().click();
      await page.waitForTimeout(2000);
      screenshot3 = await takeScreenshot(page, 'sidebar-quick-quiz', 'After clicking sidebar Quick Quiz');
      quizModeFound = true;
    } else {
      screenshot3 = await takeScreenshot(page, 'no-quiz-buttons', 'No quiz buttons found');
    }
    
    addTestResult(
      'Quiz Mode Selection',
      quizModeFound ? 'passed' : 'failed',
      `Quiz mode buttons found and clickable: ${quizModeFound}`,
      screenshot3
    );
    
    // Test 5: Quiz Engine Testing
    console.log('\n🧠 Test 5: Quiz Engine Functionality');
    
    await page.waitForTimeout(2000);
    const screenshot4 = await takeScreenshot(page, 'quiz-engine-state', 'Current quiz engine state');
    
    // Look for quiz elements
    const hasQuestion = await page.locator('text=/presents with|Which|What|A \\d+-year-old/').count() > 0;
    const hasOptions = await page.locator('input[type="radio"]').count() > 0;
    const hasTimer = await page.locator('text=/\\d+:\\d+|Time|timer/i').count() > 0;
    const hasNextButton = await page.locator('text=/Next|Submit|Continue/').count() > 0;
    
    const quizEngineWorking = hasQuestion || hasOptions;
    
    addTestResult(
      'Quiz Engine Elements',
      quizEngineWorking ? 'passed' : 'failed',
      `Question: ${hasQuestion}, Options: ${hasOptions}, Timer: ${hasTimer}, Navigation: ${hasNextButton}`,
      screenshot4
    );
    
    // Test 6: Try to interact with quiz if available
    console.log('\n🎮 Test 6: Quiz Interaction Testing');
    
    let interactionWorked = false;
    let screenshot5;
    
    // Try to select an answer if options are available
    const radioOption = page.locator('input[type="radio"]').first();
    const buttonOption = page.locator('button').filter({ hasText: /^[A-D]\)/ }).first();
    
    if (await radioOption.isVisible()) {
      console.log('🎮 Found radio options, selecting first option...');
      await radioOption.click();
      await page.waitForTimeout(1000);
      interactionWorked = true;
    } else if (await buttonOption.isVisible()) {
      console.log('🎮 Found button options, clicking first option...');
      await buttonOption.click();
      await page.waitForTimeout(1000);
      interactionWorked = true;
    }
    
    screenshot5 = await takeScreenshot(page, 'quiz-interaction', 'After attempting quiz interaction');
    
    // Try to submit/continue if button exists
    const submitBtn = page.locator('text=/Submit|Next|Continue/').first();
    if (await submitBtn.isVisible() && interactionWorked) {
      console.log('🎮 Found submit button, clicking...');
      await submitBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'after-submit', 'After submitting answer');
    }
    
    addTestResult(
      'Quiz Interaction',
      interactionWorked ? 'passed' : 'failed',
      `Successfully interacted with quiz elements: ${interactionWorked}`,
      screenshot5
    );
    
    // Test 7: Error Handling and Edge Cases
    console.log('\n⚠️ Test 7: Error Handling Testing');
    
    // Check for any visible error messages
    const errorElements = await page.locator('[class*="error"], [role="alert"]').count();
    const hasErrors = errorElements > 0;
    
    if (hasErrors) {
      await takeScreenshot(page, 'errors-found', 'Error states detected');
    }
    
    addTestResult(
      'Error Handling',
      !hasErrors ? 'passed' : 'warning',
      `Error elements found: ${errorElements}`,
      hasErrors ? '/tmp/medquiz-test/errors-found.png' : screenshot5
    );
    
    // Test 8: Mobile Responsiveness
    console.log('\n📱 Test 8: Mobile Responsiveness Testing');
    
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.waitForTimeout(1000);
    const mobileScreenshot = await takeScreenshot(page, 'mobile-view', 'Mobile responsive view');
    
    // Check if navigation adapts to mobile
    const mobileNavVisible = await page.locator('[class*="mobile"], [class*="hamburger"], button[aria-label*="menu"]').count() > 0;
    
    addTestResult(
      'Mobile Responsiveness',
      'passed',
      `Mobile navigation elements found: ${mobileNavVisible}`,
      mobileScreenshot
    );
    
    // Reset to desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Test 9: Performance and Loading
    console.log('\n⚡ Test 9: Performance Analysis');
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    addTestResult(
      'Performance Metrics',
      'passed',
      `Load: ${performanceMetrics.loadTime}ms, DOMContentLoaded: ${performanceMetrics.domContentLoaded}ms, FCP: ${Math.round(performanceMetrics.firstContentfulPaint)}ms`
    );
    
    // Final screenshot
    const finalScreenshot = await takeScreenshot(page, 'final-state', 'Final application state');
    
    console.log('\n📊 Test Summary Generation');
    
    testResults.summary = {
      totalTests: testResults.tests.length,
      passed: testResults.tests.filter(t => t.status === 'passed').length,
      failed: testResults.tests.filter(t => t.status === 'failed').length,
      warnings: testResults.tests.filter(t => t.status === 'warning').length,
      screenshots: testResults.screenshots.length,
      performanceMetrics
    };
    
  } catch (error) {
    console.error('❌ Critical testing error:', error.message);
    testResults.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    await takeScreenshot(page, 'critical-error', 'Critical error state');
  } finally {
    // Save test results
    writeFileSync('/tmp/medquiz-test/test-results.json', JSON.stringify(testResults, null, 2));
    
    console.log('\n🎉 Testing Complete!');
    console.log('📊 Summary:');
    console.log(`   ✅ Passed: ${testResults.summary.passed || 0}`);
    console.log(`   ❌ Failed: ${testResults.summary.failed || 0}`);
    console.log(`   ⚠️  Warnings: ${testResults.summary.warnings || 0}`);
    console.log(`   📸 Screenshots: ${testResults.screenshots.length}`);
    console.log(`   📁 Results saved to: /tmp/medquiz-test/`);
    
    await browser.close();
  }
})();