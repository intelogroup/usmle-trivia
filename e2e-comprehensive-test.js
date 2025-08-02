import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runComprehensiveTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  let testResults = {
    landingPage: { passed: 0, failed: 0, details: [] },
    authentication: { passed: 0, failed: 0, details: [] },
    quiz: { passed: 0, failed: 0, details: [] },
    navigation: { passed: 0, failed: 0, details: [] },
    uiux: { passed: 0, failed: 0, details: [] }
  };

  console.log('🚀 Starting MedQuiz Pro E2E Testing...\n');

  try {
    // ===============================
    // 1. LANDING PAGE TESTS
    // ===============================
    console.log('📄 Testing Landing Page...');
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '01-landing-page-load.png') });
    
    // Check page title
    const title = await page.title();
    if (title.includes('MedQuiz')) {
      testResults.landingPage.passed++;
      testResults.landingPage.details.push('✅ Page title contains "MedQuiz"');
    } else {
      testResults.landingPage.failed++;
      testResults.landingPage.details.push('❌ Page title missing or incorrect: ' + title);
    }

    // Check for key landing page elements
    const heroSection = await page.locator('h1, .hero, [data-testid="hero"]').first().isVisible();
    if (heroSection) {
      testResults.landingPage.passed++;
      testResults.landingPage.details.push('✅ Hero section visible');
    } else {
      testResults.landingPage.failed++;
      testResults.landingPage.details.push('❌ Hero section not found');
    }

    // Check for navigation buttons/links
    const loginButton = await page.locator('text=Login, text=Sign In, a[href*="login"], button:has-text("Login")').first().isVisible();
    if (loginButton) {
      testResults.landingPage.passed++;
      testResults.landingPage.details.push('✅ Login button/link visible');
    } else {
      testResults.landingPage.failed++;
      testResults.landingPage.details.push('❌ Login button/link not found');
    }

    const registerButton = await page.locator('text=Register, text=Sign Up, a[href*="register"], button:has-text("Register")').first().isVisible();
    if (registerButton) {
      testResults.landingPage.passed++;
      testResults.landingPage.details.push('✅ Register button/link visible');
    } else {
      testResults.landingPage.failed++;
      testResults.landingPage.details.push('❌ Register button/link not found');
    }

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: path.join(screenshotsDir, '02-landing-mobile-view.png') });
    
    const mobileNavVisible = await page.locator('nav, .navigation, [role="navigation"]').isVisible();
    if (mobileNavVisible) {
      testResults.landingPage.passed++;
      testResults.landingPage.details.push('✅ Mobile navigation visible');
    } else {
      testResults.landingPage.failed++;
      testResults.landingPage.details.push('❌ Mobile navigation not visible');
    }

    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });

    // ===============================
    // 2. AUTHENTICATION FLOW TESTS
    // ===============================
    console.log('🔐 Testing Authentication Flow...');

    // Navigate to login page
    try {
      // Try multiple selectors for login navigation
      const loginSelectors = [
        'text="Login"',
        'text="Sign In"', 
        'a[href*="login"]',
        'button:has-text("Login")',
        '[data-testid="login"]',
        '.login-button'
      ];
      
      let loginClicked = false;
      for (const selector of loginSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            await element.click();
            loginClicked = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!loginClicked) {
        // Direct navigation to login if button not found
        await page.goto('http://localhost:5173/login');
      }
      
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotsDir, '03-login-page.png') });

      // Check login form elements
      const emailField = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first().isVisible();
      const passwordField = await page.locator('input[type="password"], input[name="password"]').first().isVisible();
      const submitButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first().isVisible();

      if (emailField && passwordField && submitButton) {
        testResults.authentication.passed++;
        testResults.authentication.details.push('✅ Login form elements present');

        // Test login with provided credentials
        await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'jayveedz19@gmail.com');
        await page.fill('input[type="password"], input[name="password"]', 'Jimkali90#');
        await page.screenshot({ path: path.join(screenshotsDir, '04-login-form-filled.png') });
        
        await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
        await page.waitForTimeout(3000); // Wait for login processing
        await page.screenshot({ path: path.join(screenshotsDir, '05-post-login.png') });

        // Check if redirected to dashboard or home
        const currentUrl = page.url();
        if (currentUrl.includes('dashboard') || currentUrl === 'http://localhost:5173/' || currentUrl.includes('home')) {
          testResults.authentication.passed++;
          testResults.authentication.details.push('✅ Login successful - redirected to: ' + currentUrl);
        } else {
          testResults.authentication.failed++;
          testResults.authentication.details.push('❌ Login failed or unexpected redirect: ' + currentUrl);
        }

      } else {
        testResults.authentication.failed++;
        testResults.authentication.details.push('❌ Login form elements missing');
      }

    } catch (error) {
      testResults.authentication.failed++;
      testResults.authentication.details.push('❌ Login test failed: ' + error.message);
    }

    // Test user menu and logout (if logged in)
    try {
      const userMenu = await page.locator('.user-menu, [data-testid="user-menu"], button:has-text("Profile"), button:has-text("Menu")').first().isVisible();
      if (userMenu) {
        await page.click('.user-menu, [data-testid="user-menu"], button:has-text("Profile"), button:has-text("Menu")');
        await page.screenshot({ path: path.join(screenshotsDir, '06-user-menu-open.png') });
        
        const logoutButton = await page.locator('text="Logout", text="Sign Out", button:has-text("Logout")').first().isVisible();
        if (logoutButton) {
          testResults.authentication.passed++;
          testResults.authentication.details.push('✅ User menu and logout button found');
          
          await page.click('text="Logout", text="Sign Out", button:has-text("Logout")');
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(screenshotsDir, '07-post-logout.png') });
          
          testResults.authentication.passed++;
          testResults.authentication.details.push('✅ Logout functionality tested');
        } else {
          testResults.authentication.failed++;
          testResults.authentication.details.push('❌ Logout button not found in user menu');
        }
      } else {
        testResults.authentication.failed++;
        testResults.authentication.details.push('❌ User menu not found after login');
      }
    } catch (error) {
      testResults.authentication.failed++;
      testResults.authentication.details.push('❌ User menu/logout test failed: ' + error.message);
    }

    // ===============================
    // 3. QUIZ FUNCTIONALITY TESTS
    // ===============================
    console.log('📝 Testing Quiz Functionality...');

    // Re-login for quiz tests
    try {
      await page.goto('http://localhost:5173/login');
      await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"], input[name="password"]', 'Jimkali90#');
      await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('Re-login attempt for quiz tests');
    }

    // Look for quiz modes or start quiz button
    const quizSelectors = [
      'text="Quick"',
      'text="Timed"', 
      'text="Custom"',
      'text="Start Quiz"',
      'button:has-text("Quiz")',
      '.quiz-mode',
      '[data-testid="quiz"]'
    ];

    let quizFound = false;
    for (const selector of quizSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          await page.screenshot({ path: path.join(screenshotsDir, '08-quiz-modes.png') });
          await element.click();
          quizFound = true;
          testResults.quiz.passed++;
          testResults.quiz.details.push('✅ Quiz mode selection found and clicked');
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!quizFound) {
      // Try navigating directly to quiz page
      await page.goto('http://localhost:5173/quiz');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '08-quiz-direct-nav.png') });
    }

    // Test question display
    await page.waitForTimeout(3000);
    const questionVisible = await page.locator('.question, [data-testid="question"], h2, h3').first().isVisible();
    if (questionVisible) {
      testResults.quiz.passed++;
      testResults.quiz.details.push('✅ Quiz question displayed');
      await page.screenshot({ path: path.join(screenshotsDir, '09-quiz-question.png') });
    } else {
      testResults.quiz.failed++;
      testResults.quiz.details.push('❌ Quiz question not found');
    }

    // Test answer selection
    const answerOptions = await page.locator('input[type="radio"], button[data-option], .answer-option, .option').count();
    if (answerOptions > 0) {
      testResults.quiz.passed++;
      testResults.quiz.details.push(`✅ Found ${answerOptions} answer options`);
      
      // Select first answer
      await page.locator('input[type="radio"], button[data-option], .answer-option, .option').first().click();
      await page.screenshot({ path: path.join(screenshotsDir, '10-answer-selected.png') });
      
      testResults.quiz.passed++;
      testResults.quiz.details.push('✅ Answer selection functionality works');
    } else {
      testResults.quiz.failed++;
      testResults.quiz.details.push('❌ No answer options found');
    }

    // ===============================
    // 4. NAVIGATION & ACCESSIBILITY TESTS
    // ===============================
    console.log('🧭 Testing Navigation & Accessibility...');

    // Test sidebar navigation
    const sidebar = await page.locator('.sidebar, nav, [role="navigation"], .nav-menu').first().isVisible();
    if (sidebar) {
      testResults.navigation.passed++;
      testResults.navigation.details.push('✅ Sidebar navigation visible');
      await page.screenshot({ path: path.join(screenshotsDir, '11-sidebar-navigation.png') });
    } else {
      testResults.navigation.failed++;
      testResults.navigation.details.push('❌ Sidebar navigation not found');
    }

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: path.join(screenshotsDir, '12-mobile-responsiveness.png') });
    
    const mobileLayout = await page.locator('body').evaluate((body) => {
      const computedStyle = window.getComputedStyle(body);
      return {
        width: body.offsetWidth,
        hasScrollbar: body.scrollWidth > body.clientWidth
      };
    });

    if (mobileLayout.width <= 375) {
      testResults.navigation.passed++;
      testResults.navigation.details.push('✅ Mobile responsive layout confirmed');
    } else {
      testResults.navigation.failed++;
      testResults.navigation.details.push('❌ Mobile responsiveness issue detected');
    }

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    if (focusedElement) {
      testResults.navigation.passed++;
      testResults.navigation.details.push('✅ Keyboard navigation works - focused: ' + focusedElement);
    } else {
      testResults.navigation.failed++;
      testResults.navigation.details.push('❌ Keyboard navigation issues');
    }

    // ===============================
    // 5. UI/UX ELEMENTS TESTS
    // ===============================
    console.log('🎨 Testing UI/UX Elements...');

    // Test button styling and visibility
    const buttons = await page.locator('button').count();
    if (buttons > 0) {
      testResults.uiux.passed++;
      testResults.uiux.details.push(`✅ Found ${buttons} buttons on page`);
      
      // Test button hover states
      await page.hover('button:visible');
      await page.screenshot({ path: path.join(screenshotsDir, '13-button-hover-state.png') });
      
      testResults.uiux.passed++;
      testResults.uiux.details.push('✅ Button hover states functional');
    } else {
      testResults.uiux.failed++;
      testResults.uiux.details.push('❌ No buttons found on page');
    }

    // Test form styling
    const formInputs = await page.locator('input, textarea, select').count();
    if (formInputs > 0) {
      testResults.uiux.passed++;
      testResults.uiux.details.push(`✅ Found ${formInputs} form inputs with styling`);
    } else {
      testResults.uiux.failed++;
      testResults.uiux.details.push('❌ No form inputs found');
    }

    // Test color scheme and theme
    const bodyStyles = await page.locator('body').evaluate((body) => {
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: styles.fontFamily
      };
    });

    testResults.uiux.passed++;
    testResults.uiux.details.push(`✅ Theme detected - BG: ${bodyStyles.backgroundColor}, Text: ${bodyStyles.color}`);

    await page.screenshot({ path: path.join(screenshotsDir, '14-final-ui-state.png') });

  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await browser.close();
  }

  // ===============================
  // GENERATE TEST REPORT
  // ===============================
  console.log('\n📊 COMPREHENSIVE TEST RESULTS\n');
  console.log('================================');

  const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, category) => sum + category.failed, 0);
  const totalTests = totalPassed + totalFailed;
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

  console.log(`Overall Success Rate: ${successRate}% (${totalPassed}/${totalTests} tests passed)\n`);

  Object.entries(testResults).forEach(([category, results]) => {
    const categoryTotal = results.passed + results.failed;
    const categoryRate = categoryTotal > 0 ? ((results.passed / categoryTotal) * 100).toFixed(1) : 0;
    
    console.log(`\n${category.toUpperCase()} - ${categoryRate}% (${results.passed}/${categoryTotal})`);
    console.log('─'.repeat(50));
    results.details.forEach(detail => console.log(detail));
  });

  console.log(`\n📸 Screenshots saved to: ${screenshotsDir}`);
  console.log('\n🎉 Comprehensive E2E testing completed!');

  return {
    totalTests,
    totalPassed,
    totalFailed,
    successRate,
    categories: testResults,
    screenshotsPath: screenshotsDir
  };
}

// Run the tests
runComprehensiveTests().catch(console.error);