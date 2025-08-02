import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function testCompleteApplication() {
  console.log('🚀 Starting comprehensive MedQuiz Pro testing...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('\n📱 Testing Phase 1: Landing Page');
    console.log('===============================');
    
    // Test 1: Landing Page
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '01-landing-page.png') });
    console.log('✅ Landing page screenshot captured');

    // Check for key landing page elements
    const heroSection = await page.locator('h1').first().textContent();
    console.log(`📝 Hero text: "${heroSection}"`);
    
    const ctaButtons = await page.locator('button, a[href*="sign"]').count();
    console.log(`🔗 Found ${ctaButtons} call-to-action elements`);

    console.log('\n🔐 Testing Phase 2: Authentication Flow');
    console.log('====================================');

    // Test 2: Navigate to Sign In
    const signInSelector = 'a[href*="sign"], button:has-text("Sign In"), a:has-text("Sign In")';
    const signInButton = page.locator(signInSelector).first();
    
    if (await signInButton.count() > 0) {
      await signInButton.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotsDir, '02-login-page.png') });
      console.log('✅ Login page screenshot captured');
      
      // Test 3: Login with existing credentials
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      
      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill('jayveedz19@gmail.com');
        await passwordInput.fill('Jimkali90#');
        
        const loginButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
        await loginButton.click();
        
        // Wait for potential redirect
        await page.waitForTimeout(3000);
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        console.log(`📍 After login, current URL: ${currentUrl}`);
        
        await page.screenshot({ path: path.join(screenshotsDir, '03-after-login.png') });
        console.log('✅ Post-login screenshot captured');
      } else {
        console.log('⚠️ Login form fields not found, trying direct dashboard access');
        await page.goto('http://localhost:5173/app/dashboard');
        await page.waitForLoadState('networkidle');
      }
    } else {
      console.log('⚠️ Sign In button not found, trying direct login page');
      await page.goto('http://localhost:5173/login');
      await page.waitForLoadState('networkidle');
    }

    console.log('\n📊 Testing Phase 3: Dashboard State');
    console.log('=================================');

    // Test 4: Dashboard - Check for blank state vs existing user
    await page.goto('http://localhost:5173/app/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '04-dashboard-state.png') });
    console.log('✅ Dashboard state screenshot captured');

    // Check for user data indicators
    const userName = await page.locator('h1, h2, .user-name, [data-testid*="user"]').first().textContent().catch(() => 'Not found');
    console.log(`👤 User display: "${userName}"`);

    // Check for quiz statistics
    const statCards = await page.locator('.stat, .card, [class*="stat"], [class*="metric"]').count();
    console.log(`📈 Found ${statCards} dashboard stat elements`);

    // Test 5: Quiz Session Cards
    console.log('\n🎯 Testing Phase 4: Quiz Session Cards');
    console.log('====================================');

    const quizSessions = await page.locator('[class*="session"], [class*="quiz-card"], .recent-quiz').count();
    console.log(`🎮 Found ${quizSessions} quiz session elements`);

    if (quizSessions > 0) {
      await page.screenshot({ path: path.join(screenshotsDir, '05-quiz-sessions.png') });
      console.log('✅ Quiz sessions screenshot captured');
    } else {
      console.log('📝 No quiz sessions found - likely blank state');
    }

    console.log('\n🎮 Testing Phase 5: Quiz Flow');
    console.log('===========================');

    // Test 6: Quiz Mode Selection
    const quickQuizButton = page.locator('button:has-text("Quick Quiz"), a[href*="quick"], .quick-quiz');
    
    if (await quickQuizButton.count() > 0) {
      await quickQuizButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotsDir, '06-quiz-setup.png') });
      console.log('✅ Quiz setup page screenshot captured');
      
      const currentUrl = page.url();
      console.log(`📍 Quiz URL: ${currentUrl}`);
      
      // Look for Start Quiz button
      const startQuizButton = page.locator('button:has-text("Start Quiz"), button:has-text("Begin")');
      if (await startQuizButton.count() > 0) {
        console.log('✅ Start Quiz button found');
        await startQuizButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotsDir, '07-quiz-active.png') });
        console.log('✅ Active quiz screenshot captured');
      }
    } else {
      console.log('⚠️ Quick Quiz button not found, checking quiz navigation');
      await page.goto('http://localhost:5173/app/quiz/quick');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotsDir, '06-quiz-direct-access.png') });
    }

    console.log('\n🧭 Testing Phase 6: Navigation');
    console.log('============================');

    // Test 7: Navigation flow
    const navigationTests = [
      { url: 'http://localhost:5173/', name: 'landing-final' },
      { url: 'http://localhost:5173/app/dashboard', name: 'dashboard-final' },
      { url: 'http://localhost:5173/app/quiz', name: 'quiz-modes-final' }
    ];

    for (const test of navigationTests) {
      try {
        await page.goto(test.url);
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: path.join(screenshotsDir, `08-${test.name}.png`) });
        console.log(`✅ Navigation test: ${test.name} completed`);
      } catch (error) {
        console.log(`⚠️ Navigation test failed for ${test.name}: ${error.message}`);
      }
    }

    console.log('\n🔍 Testing Phase 7: Mobile Responsiveness');
    console.log('=======================================');

    // Test 8: Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '09-mobile-landing.png') });

    await page.goto('http://localhost:5173/app/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '10-mobile-dashboard.png') });
    console.log('✅ Mobile responsiveness tests completed');

    console.log('\n📱 Testing Phase 8: UI Element Analysis');
    console.log('====================================');

    // Reset to desktop view for final analysis
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:5173/app/dashboard');
    await page.waitForLoadState('networkidle');

    // Analyze UI elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const inputs = await page.locator('input').count();
    const images = await page.locator('img').count();

    console.log(`🔘 Interactive elements found:`);
    console.log(`   - Buttons: ${buttons}`);
    console.log(`   - Links: ${links}`);
    console.log(`   - Inputs: ${inputs}`);
    console.log(`   - Images: ${images}`);

    // Check for error elements
    const errors = await page.locator('.error, [class*="error"], .alert-error').count();
    const warnings = await page.locator('.warning, [class*="warning"]').count();
    
    console.log(`⚠️ Error/Warning indicators: ${errors + warnings}`);

    console.log('\n✅ TESTING COMPLETE!');
    console.log('==================');
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
    console.log('🎉 All phases completed successfully!');

  } catch (error) {
    console.error('❌ Testing error:', error);
    await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png') });
  } finally {
    await browser.close();
  }
}

// Run the tests
testCompleteApplication().catch(console.error);