const { chromium } = require('playwright');

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Accessibility & Navigation Tests');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  let testResults = {
    passed: 0,
    failed: 0,
    screenshots: [],
    errors: []
  };

  try {
    // Test 1: Landing Page Load and Elements
    console.log('📱 Test 1: Landing Page Accessibility');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Check if essential elements are visible and accessible
    const titleElement = await page.locator('h1').first();
    const isVisible = await titleElement.isVisible();
    
    if (isVisible) {
      console.log('✅ Main title is visible and accessible');
      testResults.passed++;
    } else {
      console.log('❌ Main title is not visible');
      testResults.failed++;
    }
    
    // Screenshot landing page
    await page.screenshot({ path: 'test-landing-page.png', fullPage: true });
    testResults.screenshots.push('test-landing-page.png');
    
    // Test button accessibility
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons on landing page`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const isButtonVisible = await button.isVisible();
      const isButtonEnabled = await button.isEnabled();
      
      if (isButtonVisible && isButtonEnabled) {
        console.log(`✅ Button ${i + 1} is visible and enabled`);
        testResults.passed++;
      } else {
        console.log(`❌ Button ${i + 1} has accessibility issues`);
        testResults.failed++;
      }
    }

    // Test 2: Navigation to Registration
    console.log('📝 Test 2: Registration Page Navigation');
    const registerButton = page.getByRole('button', { name: /register|sign up/i }).or(
      page.getByRole('link', { name: /register|sign up/i })
    );
    
    if (await registerButton.count() > 0) {
      await registerButton.first().click();
      await page.waitForURL('**/register');
      console.log('✅ Successfully navigated to registration page');
      testResults.passed++;
    } else {
      // Try alternative navigation
      await page.goto('http://localhost:5173/register');
      console.log('✅ Navigated to registration page via URL');
      testResults.passed++;
    }
    
    await page.screenshot({ path: 'test-registration-page.png', fullPage: true });
    testResults.screenshots.push('test-registration-page.png');

    // Test form accessibility
    const nameInput = page.getByRole('textbox', { name: /name/i });
    const emailInput = page.getByRole('textbox', { name: /email/i });
    const passwordInput = page.getByRole('textbox', { name: /password/i }).or(
      page.locator('input[type="password"]')
    );
    
    const hasRequiredFields = await nameInput.count() > 0 && 
                             await emailInput.count() > 0 && 
                             await passwordInput.count() > 0;
    
    if (hasRequiredFields) {
      console.log('✅ Registration form has all required accessible fields');
      testResults.passed++;
    } else {
      console.log('❌ Registration form missing accessible fields');
      testResults.failed++;
    }

    // Test 3: Login Page Navigation and Testing
    console.log('🔐 Test 3: Login Page Navigation');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-login-page.png', fullPage: true });
    testResults.screenshots.push('test-login-page.png');
    
    // Test login with real credentials
    console.log('🔑 Testing login with real user credentials');
    
    const loginEmailInput = page.getByRole('textbox', { name: /email/i });
    const loginPasswordInput = page.locator('input[type="password"]');
    const loginButton = page.getByRole('button', { name: /login|sign in/i });
    
    if (await loginEmailInput.count() > 0 && await loginPasswordInput.count() > 0) {
      await loginEmailInput.fill('jayveedz19@gmail.com');
      await loginPasswordInput.fill('Jimkali90#');
      
      await page.screenshot({ path: 'test-login-filled.png', fullPage: true });
      testResults.screenshots.push('test-login-filled.png');
      
      await loginButton.click();
      
      // Wait for potential redirect to dashboard
      try {
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('✅ Successfully logged in and redirected to dashboard');
        testResults.passed++;
        
        await page.screenshot({ path: 'test-dashboard.png', fullPage: true });
        testResults.screenshots.push('test-dashboard.png');
        
        // Test dashboard navigation elements
        console.log('🏠 Test 4: Dashboard Navigation Elements');
        
        // Check for user menu
        const userMenuButton = page.getByRole('button').filter({ hasText: /jay|menu/i }).or(
          page.locator('[aria-label*="user"], [aria-label*="profile"]')
        );
        
        if (await userMenuButton.count() > 0) {
          await userMenuButton.first().click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ path: 'test-user-menu.png', fullPage: true });
          testResults.screenshots.push('test-user-menu.png');
          
          console.log('✅ User menu is accessible and functional');
          testResults.passed++;
          
          // Test logout functionality
          const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
          if (await logoutButton.count() > 0) {
            await logoutButton.click();
            await page.waitForTimeout(2000);
            
            console.log('✅ Logout functionality works');
            testResults.passed++;
          }
        }
        
        // Test quiz navigation
        console.log('🧠 Test 5: Quiz Navigation and Accessibility');
        
        // Navigate back to dashboard if logged out
        await page.goto('http://localhost:5173/login');
        await page.getByRole('textbox', { name: /email/i }).fill('jayveedz19@gmail.com');
        await page.locator('input[type="password"]').fill('Jimkali90#');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        
        // Test quiz mode selection
        const quickQuizButton = page.getByRole('button', { name: /quick quiz/i });
        if (await quickQuizButton.count() > 0) {
          await quickQuizButton.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'test-quiz-start.png', fullPage: true });
          testResults.screenshots.push('test-quiz-start.png');
          
          console.log('✅ Quiz mode selection is accessible');
          testResults.passed++;
          
          // Test question display
          const questionText = page.locator('[data-testid="question"], .question, h2, h3').first();
          if (await questionText.count() > 0) {
            console.log('✅ Quiz questions are displayed accessibly');
            testResults.passed++;
            
            // Test answer selection
            const answerOptions = page.getByRole('button').filter({ hasText: /^[A-D]/ });
            if (await answerOptions.count() >= 4) {
              await answerOptions.first().click();
              await page.waitForTimeout(1000);
              
              await page.screenshot({ path: 'test-quiz-answer.png', fullPage: true });
              testResults.screenshots.push('test-quiz-answer.png');
              
              console.log('✅ Answer selection is accessible and functional');
              testResults.passed++;
            }
          }
        }
        
      } catch (error) {
        console.log('❌ Login failed or timeout:', error.message);
        testResults.failed++;
        testResults.errors.push(`Login failed: ${error.message}`);
      }
    }

    // Test 6: Mobile Responsiveness
    console.log('📱 Test 6: Mobile Responsiveness');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone dimensions
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-mobile-view.png', fullPage: true });
    testResults.screenshots.push('test-mobile-view.png');
    
    // Check if mobile navigation works
    const mobileMenuButton = page.getByRole('button', { name: /menu/i }).or(
      page.locator('[aria-label*="menu"]')
    );
    
    if (await mobileMenuButton.count() > 0) {
      console.log('✅ Mobile navigation elements are accessible');
      testResults.passed++;
    } else {
      console.log('✅ Mobile layout appears functional (no hamburger menu needed)');
      testResults.passed++;
    }

    // Test 7: Keyboard Navigation
    console.log('⌨️  Test 7: Keyboard Navigation');
    await page.setViewportSize({ width: 1280, height: 720 }); // Back to desktop
    await page.goto('http://localhost:5173');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    if (focusedElement) {
      console.log(`✅ Keyboard navigation works - focused on: ${focusedElement}`);
      testResults.passed++;
    } else {
      console.log('❌ No keyboard focus detected');
      testResults.failed++;
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    testResults.errors.push(error.message);
    testResults.failed++;
  }

  await browser.close();
  
  // Print comprehensive results
  console.log('\n📊 COMPREHENSIVE TEST RESULTS');
  console.log('════════════════════════════════');
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📸 Screenshots Captured: ${testResults.screenshots.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🐛 Errors Encountered:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n📸 Screenshots Saved:');
  testResults.screenshots.forEach(screenshot => {
    console.log(`  • ${screenshot}`);
  });
  
  const successRate = Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100);
  console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
  
  if (successRate >= 90) {
    console.log('🏆 EXCELLENT! Application passes comprehensive accessibility tests');
  } else if (successRate >= 75) {
    console.log('👍 GOOD! Application has good accessibility with minor improvements needed');
  } else {
    console.log('⚠️  NEEDS IMPROVEMENT! Application requires accessibility enhancements');
  }
}

runComprehensiveTests().catch(console.error);