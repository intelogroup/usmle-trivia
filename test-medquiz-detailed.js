import { chromium } from 'playwright';
import fs from 'fs';

async function testMedQuizAppDetailed() {
  console.log('Starting detailed MedQuiz Pro testing...');
  
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
    ui_analysis: {},
    page_content: {},
    errors: []
  };

  try {
    console.log('1. Loading landing page and analyzing...');
    const startTime = Date.now();
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    results.performance.landingPageLoad = loadTime;

    // Take screenshot of landing page
    await page.screenshot({ path: `${screenshotsDir}/01-landing-page-desktop.png`, fullPage: true });
    results.screenshots.push('01-landing-page-desktop.png');
    console.log(`✓ Landing page loaded in ${loadTime}ms`);

    // Analyze page content and structure
    const pageAnalysis = await page.evaluate(() => {
      return {
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          tag: h.tagName,
          text: h.textContent.trim()
        })),
        buttons: Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a[role="button"]')).map(b => ({
          tag: b.tagName,
          text: b.textContent.trim(),
          classes: b.className,
          href: b.href || null
        })),
        links: Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.textContent.trim(),
          href: a.href,
          classes: a.className
        })),
        forms: Array.from(document.querySelectorAll('form')).length,
        images: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height
        })),
        hasNavigation: !!document.querySelector('nav, [role="navigation"]'),
        bodyClasses: document.body.className,
        colorScheme: window.getComputedStyle(document.body).colorScheme || 'normal'
      };
    });
    results.page_content.landing = pageAnalysis;
    console.log('✓ Page structure analyzed');

    // Test mobile responsiveness
    console.log('2. Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: `${screenshotsDir}/02-landing-mobile.png`, fullPage: true });
    results.screenshots.push('02-landing-mobile.png');

    // Test tablet responsiveness
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: `${screenshotsDir}/03-landing-tablet.png`, fullPage: true });
    results.screenshots.push('03-landing-tablet.png');

    // Return to desktop view
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('3. Attempting to find and navigate to login...');
    // Try multiple selectors for login
    const loginSelectors = [
      'a[href*="login"]',
      'button:has-text("Login")',
      'a:has-text("Login")',
      'button:has-text("Sign in")',
      'a:has-text("Sign in")',
      '[data-testid="login"]',
      '.login-btn',
      '#login'
    ];

    let loginFound = false;
    for (const selector of loginSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✓ Found login element with selector: ${selector}`);
          await element.click();
          await page.waitForLoadState('networkidle');
          loginFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!loginFound) {
      console.log('⚠ No login button found, checking URL structure...');
      // Try direct navigation to login page
      await page.goto('https://usmle-trivia.netlify.app/login');
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: `${screenshotsDir}/04-login-page.png`, fullPage: true });
    results.screenshots.push('04-login-page.png');

    // Analyze login page
    const loginPageAnalysis = await page.evaluate(() => {
      return {
        hasLoginForm: !!document.querySelector('form'),
        emailInputs: document.querySelectorAll('input[type="email"], input[name*="email"], input[id*="email"]').length,
        passwordInputs: document.querySelectorAll('input[type="password"]').length,
        submitButtons: document.querySelectorAll('button[type="submit"], input[type="submit"]').length,
        formFields: Array.from(document.querySelectorAll('input, textarea, select')).map(field => ({
          type: field.type,
          name: field.name,
          id: field.id,
          placeholder: field.placeholder
        }))
      };
    });
    results.page_content.login = loginPageAnalysis;

    if (loginPageAnalysis.hasLoginForm) {
      console.log('4. Testing login functionality...');
      
      // Fill login form
      await page.fill('input[type="email"], input[name*="email"], input[id*="email"]', 'jimkalinov@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      await page.screenshot({ path: `${screenshotsDir}/05-login-filled.png`, fullPage: true });
      results.screenshots.push('05-login-filled.png');

      // Submit login
      const loginStartTime = Date.now();
      await page.click('button[type="submit"], input[type="submit"]');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      const loginTime = Date.now() - loginStartTime;
      results.performance.loginTime = loginTime;
      console.log(`✓ Login attempt completed in ${loginTime}ms`);

      await page.screenshot({ path: `${screenshotsDir}/06-post-login.png`, fullPage: true });
      results.screenshots.push('06-post-login.png');

      // Analyze post-login page
      const postLoginAnalysis = await page.evaluate(() => {
        return {
          currentUrl: window.location.href,
          title: document.title,
          hasUserInfo: !!(document.querySelector('[data-testid="user"], .user-info, .profile') || 
                          document.textContent.includes('Welcome') ||
                          document.textContent.includes('Dashboard')),
          navigationElements: Array.from(document.querySelectorAll('nav a, .nav-link, .menu-item')).map(el => ({
            text: el.textContent.trim(),
            href: el.href
          }))
        };
      });
      results.page_content.postLogin = postLoginAnalysis;

      // Test mobile post-login
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ path: `${screenshotsDir}/07-post-login-mobile.png`, fullPage: true });
      results.screenshots.push('07-post-login-mobile.png');

      // Return to desktop
      await page.setViewportSize({ width: 1280, height: 720 });

      console.log('5. Looking for quiz functionality...');
      // Look for quiz-related elements
      const quizSelectors = [
        'a[href*="quiz"]',
        'button:has-text("Quiz")',
        'button:has-text("Start")',
        'button:has-text("Practice")',
        'a:has-text("Quiz")',
        '[data-testid="quiz"]',
        '.quiz-btn'
      ];

      let quizFound = false;
      for (const selector of quizSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✓ Found quiz element with selector: ${selector}`);
            await element.click();
            await page.waitForLoadState('networkidle');
            quizFound = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      if (quizFound) {
        await page.screenshot({ path: `${screenshotsDir}/08-quiz-interface.png`, fullPage: true });
        results.screenshots.push('08-quiz-interface.png');

        // Test mobile quiz
        await page.setViewportSize({ width: 375, height: 667 });
        await page.screenshot({ path: `${screenshotsDir}/09-quiz-mobile.png`, fullPage: true });
        results.screenshots.push('09-quiz-mobile.png');

        // Return to desktop
        await page.setViewportSize({ width: 1280, height: 720 });
      }
    }

    console.log('6. Running performance and accessibility analysis...');
    
    // Performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        resourceCount: performance.getEntriesByType('resource').length,
        memoryUsed: performance.memory?.usedJSHeapSize || 0,
        memoryTotal: performance.memory?.totalJSHeapSize || 0
      };
    });
    results.performance.detailed = performanceMetrics;

    // Accessibility analysis
    const accessibilityAnalysis = await page.evaluate(() => {
      const issues = [];
      
      // Check images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      issues.push(`Images without alt text: ${imagesWithoutAlt.length}`);

      // Check form inputs without labels
      const inputs = document.querySelectorAll('input:not([type="hidden"])');
      let unlabeledInputs = 0;
      inputs.forEach(input => {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                        input.hasAttribute('aria-label') || 
                        input.hasAttribute('aria-labelledby');
        if (!hasLabel) unlabeledInputs++;
      });
      issues.push(`Form inputs without labels: ${unlabeledInputs}`);

      // Check color contrast (basic)
      const elements = document.querySelectorAll('*');
      let lowContrastElements = 0;
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        if (color && backgroundColor && 
            color !== 'rgba(0, 0, 0, 0)' && 
            backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // Simple contrast check (this is very basic)
          if (color === backgroundColor) {
            lowContrastElements++;
          }
        }
      });
      issues.push(`Potential low contrast elements: ${lowContrastElements}`);

      return issues;
    });
    results.accessibility = accessibilityAnalysis;

    // UI/UX Analysis
    const uiAnalysis = await page.evaluate(() => {
      const analysis = {
        colorPalette: new Set(),
        typography: new Set(),
        buttonCount: 0,
        linkCount: 0,
        formCount: 0,
        layoutStructure: {
          hasHeader: !!document.querySelector('header, .header'),
          hasFooter: !!document.querySelector('footer, .footer'),
          hasNavigation: !!document.querySelector('nav, .nav, .navigation'),
          hasSidebar: !!document.querySelector('.sidebar, .side-nav, aside'),
          hasMainContent: !!document.querySelector('main, .main, .content')
        }
      };

      // Collect colors and fonts
      document.querySelectorAll('*').forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
          analysis.colorPalette.add(styles.color);
        }
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          analysis.colorPalette.add(styles.backgroundColor);
        }
        if (styles.fontFamily) {
          analysis.typography.add(styles.fontFamily);
        }
      });

      analysis.buttonCount = document.querySelectorAll('button, input[type="submit"], input[type="button"]').length;
      analysis.linkCount = document.querySelectorAll('a[href]').length;
      analysis.formCount = document.querySelectorAll('form').length;

      // Convert Sets to Arrays for JSON serialization
      analysis.colorPalette = Array.from(analysis.colorPalette).slice(0, 20); // Limit to first 20
      analysis.typography = Array.from(analysis.typography);

      return analysis;
    });
    results.ui_analysis = uiAnalysis;

    console.log('✓ Testing completed successfully');

  } catch (error) {
    console.error('Error during testing:', error.message);
    results.errors.push(error.message);
  } finally {
    await browser.close();
  }

  return results;
}

// Run the detailed test
testMedQuizAppDetailed().then(results => {
  console.log('\n=== COMPREHENSIVE TEST RESULTS ===');
  console.log(`Screenshots captured: ${results.screenshots.length}`);
  console.log(`Performance - Landing page: ${results.performance.landingPageLoad}ms`);
  console.log(`Performance - Login: ${results.performance.loginTime || 'Not tested'}ms`);
  console.log(`Accessibility issues found: ${results.accessibility.length}`);
  console.log(`UI elements analyzed: ${results.ui_analysis.buttonCount} buttons, ${results.ui_analysis.linkCount} links`);
  console.log(`Errors encountered: ${results.errors.length}`);
  
  // Save comprehensive results
  fs.writeFileSync('/root/repo/detailed-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n✓ Detailed results saved to detailed-test-results.json');
  console.log('✓ All screenshots saved to screenshots/ directory');
}).catch(error => {
  console.error('Test execution failed:', error);
});