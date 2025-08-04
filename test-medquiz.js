import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testMedQuizApp() {
  console.log('Starting comprehensive MedQuiz Pro testing...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = '/root/repo/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const results = {
    screenshots: [],
    performance: {},
    accessibility: [],
    ui_analysis: {}
  };

  try {
    console.log('1. Testing landing page...');
    const startTime = Date.now();
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    results.performance.landingPageLoad = loadTime;

    // Take screenshot of landing page
    await page.screenshot({ path: `${screenshotsDir}/01-landing-page.png`, fullPage: true });
    results.screenshots.push('01-landing-page.png');
    console.log(`Landing page loaded in ${loadTime}ms`);

    // Test mobile responsiveness - Mobile viewport
    console.log('2. Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: `${screenshotsDir}/02-mobile-landing.png`, fullPage: true });
    results.screenshots.push('02-mobile-landing.png');

    // Test tablet responsiveness
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: `${screenshotsDir}/03-tablet-landing.png`, fullPage: true });
    results.screenshots.push('03-tablet-landing.png');

    // Return to desktop view
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('3. Testing navigation to login...');
    // Navigate to login
    await page.locator('text=Login').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${screenshotsDir}/04-login-page.png`, fullPage: true });
    results.screenshots.push('04-login-page.png');

    console.log('4. Testing login functionality...');
    // Fill login form
    await page.fill('input[type="email"]', 'jimkalinov@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    await page.screenshot({ path: `${screenshotsDir}/05-login-filled.png`, fullPage: true });
    results.screenshots.push('05-login-filled.png');

    // Submit login
    const loginStartTime = Date.now();
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    const loginTime = Date.now() - loginStartTime;
    results.performance.loginTime = loginTime;
    console.log(`Login completed in ${loginTime}ms`);

    console.log('5. Testing dashboard after login...');
    await page.waitForTimeout(2000); // Wait for dashboard to fully load
    await page.screenshot({ path: `${screenshotsDir}/06-dashboard.png`, fullPage: true });
    results.screenshots.push('06-dashboard.png');

    // Test mobile dashboard
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: `${screenshotsDir}/07-mobile-dashboard.png`, fullPage: true });
    results.screenshots.push('07-mobile-dashboard.png');

    // Return to desktop
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('6. Testing navigation sidebar...');
    // Test sidebar navigation if it exists
    const sidebarExists = await page.locator('nav, .sidebar, [role="navigation"]').first().isVisible().catch(() => false);
    if (sidebarExists) {
      await page.screenshot({ path: `${screenshotsDir}/08-navigation.png`, fullPage: true });
      results.screenshots.push('08-navigation.png');
    }

    console.log('7. Testing quiz functionality...');
    // Look for quiz-related buttons or links
    const quizButtons = await page.locator('text=/quiz|start|practice/i').all();
    if (quizButtons.length > 0) {
      await quizButtons[0].click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${screenshotsDir}/09-quiz-start.png`, fullPage: true });
      results.screenshots.push('09-quiz-start.png');

      // If there are quiz options, test them
      const quizModeButtons = await page.locator('button:has-text("Quick"), button:has-text("Timed"), button:has-text("Custom")').all();
      if (quizModeButtons.length > 0) {
        await quizModeButtons[0].click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `${screenshotsDir}/10-quiz-mode-selected.png`, fullPage: true });
        results.screenshots.push('10-quiz-mode-selected.png');

        // Try to start the quiz
        const startButtons = await page.locator('button:has-text("Start"), button:has-text("Begin")').all();
        if (startButtons.length > 0) {
          await startButtons[0].click();
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: `${screenshotsDir}/11-quiz-question.png`, fullPage: true });
          results.screenshots.push('11-quiz-question.png');

          // Test mobile quiz interface
          await page.setViewportSize({ width: 375, height: 667 });
          await page.screenshot({ path: `${screenshotsDir}/12-mobile-quiz.png`, fullPage: true });
          results.screenshots.push('12-mobile-quiz.png');

          // Return to desktop
          await page.setViewportSize({ width: 1280, height: 720 });

          // Try to answer a question if options exist
          const answerOptions = await page.locator('input[type="radio"], button[data-option], .answer-option').all();
          if (answerOptions.length > 0) {
            await answerOptions[0].click();
            await page.screenshot({ path: `${screenshotsDir}/13-quiz-answered.png`, fullPage: true });
            results.screenshots.push('13-quiz-answered.png');

            // Look for submit/next button
            const submitButtons = await page.locator('button:has-text("Submit"), button:has-text("Next"), button:has-text("Continue")').all();
            if (submitButtons.length > 0) {
              await submitButtons[0].click();
              await page.waitForLoadState('networkidle');
              await page.screenshot({ path: `${screenshotsDir}/14-quiz-feedback.png`, fullPage: true });
              results.screenshots.push('14-quiz-feedback.png');
            }
          }
        }
      }
    }

    console.log('8. Testing user menu and logout...');
    // Look for user menu or profile dropdown
    const userMenus = await page.locator('.user-menu, .profile-dropdown, button:has-text("Profile"), button:has-text("Menu")').all();
    if (userMenus.length > 0) {
      await userMenus[0].click();
      await page.screenshot({ path: `${screenshotsDir}/15-user-menu.png`, fullPage: true });
      results.screenshots.push('15-user-menu.png');

      // Try to logout
      const logoutButtons = await page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out")').all();
      if (logoutButtons.length > 0) {
        await logoutButtons[0].click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `${screenshotsDir}/16-logout.png`, fullPage: true });
        results.screenshots.push('16-logout.png');
      }
    }

    console.log('9. Performance analysis...');
    // Run Lighthouse-style performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return {
        timing: performance.timing,
        navigation: performance.navigation,
        memory: performance.memory || {}
      };
    });
    results.performance.metrics = performanceMetrics;

    console.log('10. Accessibility check...');
    // Basic accessibility checks
    const accessibilityIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for missing alt text
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        issues.push(`${images.length} images missing alt text`);
      }

      // Check for form labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const unlabeledInputs = Array.from(inputs).filter(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        return !label && input.type !== 'hidden';
      });
      if (unlabeledInputs.length > 0) {
        issues.push(`${unlabeledInputs.length} form inputs missing labels`);
      }

      // Check for heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        issues.push('No heading elements found');
      }

      return issues;
    });
    results.accessibility = accessibilityIssues;

    console.log('11. UI/UX analysis...');
    const uiAnalysis = await page.evaluate(() => {
      const analysis = {
        colors: [],
        fonts: [],
        buttons: 0,
        inputs: 0,
        images: 0
      };

      // Get computed styles for analysis
      const elements = document.querySelectorAll('*');
      const styles = new Set();
      
      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        if (computed.fontFamily) styles.add(computed.fontFamily);
        if (computed.color && computed.color !== 'rgba(0, 0, 0, 0)') styles.add(computed.color);
        if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') styles.add(computed.backgroundColor);
      });

      analysis.colors = Array.from(styles).filter(s => s.startsWith('rgb'));
      analysis.fonts = Array.from(styles).filter(s => s.includes('font') || s.includes('serif') || s.includes('sans'));
      analysis.buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]').length;
      analysis.inputs = document.querySelectorAll('input, textarea, select').length;
      analysis.images = document.querySelectorAll('img').length;

      return analysis;
    });
    results.ui_analysis = uiAnalysis;

  } catch (error) {
    console.error('Error during testing:', error);
    results.error = error.message;
  } finally {
    await browser.close();
  }

  return results;
}

// Run the test
testMedQuizApp().then(results => {
  console.log('\n=== TEST RESULTS ===');
  console.log('Screenshots taken:', results.screenshots.length);
  console.log('Performance metrics:', results.performance);
  console.log('Accessibility issues:', results.accessibility);
  console.log('UI Analysis:', results.ui_analysis);
  
  // Save results to file
  fs.writeFileSync('/root/repo/test-results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to test-results.json');
}).catch(error => {
  console.error('Test failed:', error);
});