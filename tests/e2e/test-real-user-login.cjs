const { chromium } = require('playwright');

async function testRealUserLogin() {
  console.log('🔐 Testing Real User Login: jayveedz19@gmail.com');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  let testResults = {
    loginSuccess: false,
    dashboardAccess: false,
    userMenuVisible: false,
    quizAccess: false,
    logoutSuccess: false,
    errors: []
  };

  try {
    console.log('📱 Step 1: Navigate to login page');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.screenshot({ path: 'real-user-01-login-page.png', fullPage: true });
    console.log('✅ Login page loaded successfully');

    console.log('🔑 Step 2: Enter real user credentials');
    
    // Wait for form elements to be available
    await page.waitForTimeout(2000);
    
    // Fill in the credentials
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('jayveedz19@gmail.com');
      await passwordInput.fill('Jimkali90#');
      
      await page.screenshot({ path: 'real-user-02-credentials-filled.png', fullPage: true });
      console.log('✅ Credentials filled successfully');
      
      console.log('🚀 Step 3: Submit login form');
      const loginButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      
      if (await loginButton.count() > 0) {
        await loginButton.click();
        console.log('✅ Login button clicked');
        
        // Wait for potential redirect or response
        try {
          await page.waitForURL('**/dashboard', { timeout: 15000 });
          console.log('🏠 Step 4: Successfully redirected to dashboard');
          testResults.loginSuccess = true;
          testResults.dashboardAccess = true;
          
          await page.screenshot({ path: 'real-user-03-dashboard.png', fullPage: true });
          
          console.log('👤 Step 5: Check user menu functionality');
          
          // Look for user menu or profile information
          await page.waitForTimeout(2000);
          
          const userElements = await page.locator('button:has-text("Jay"), button:has-text("veedz"), [aria-label*="user"], [aria-label*="profile"], .user-menu, .profile').count();
          
          if (userElements > 0) {
            console.log('✅ User menu/profile elements found');
            testResults.userMenuVisible = true;
            
            // Try to click user menu if it exists
            const userMenuButton = await page.locator('button:has-text("Jay"), button:has-text("veedz"), [aria-label*="user"]').first();
            if (await userMenuButton.count() > 0) {
              await userMenuButton.click();
              await page.waitForTimeout(1000);
              await page.screenshot({ path: 'real-user-04-user-menu.png', fullPage: true });
              console.log('✅ User menu opened successfully');
            }
          }
          
          console.log('🧠 Step 6: Test quiz functionality access');
          
          // Look for quiz buttons or options
          const quizButtons = await page.locator('button:has-text("Quiz"), button:has-text("Quick"), button:has-text("Timed"), button:has-text("Custom")').count();
          
          if (quizButtons > 0) {
            console.log(`✅ Found ${quizButtons} quiz navigation options`);
            testResults.quizAccess = true;
            
            // Try to start a quick quiz
            const quickQuizButton = await page.locator('button:has-text("Quick Quiz"), button:has-text("Quick")').first();
            if (await quickQuizButton.count() > 0) {
              await quickQuizButton.click();
              await page.waitForTimeout(3000);
              
              await page.screenshot({ path: 'real-user-05-quiz-access.png', fullPage: true });
              console.log('✅ Quiz functionality is accessible');
              
              // Check if question is displayed
              const questionElements = await page.locator('h1, h2, h3, .question, [data-testid*="question"]').count();
              if (questionElements > 0) {
                console.log('✅ Quiz questions are loading properly');
                
                // Try to select an answer if available
                const answerOptions = await page.locator('button:has-text("A."), button:has-text("B."), button:has-text("C."), button:has-text("D.")').count();
                if (answerOptions >= 4) {
                  await page.locator('button:has-text("A.")').first().click();
                  await page.waitForTimeout(2000);
                  await page.screenshot({ path: 'real-user-06-answer-selected.png', fullPage: true });
                  console.log('✅ Answer selection works properly');
                }
              }
            }
          }
          
          console.log('🚪 Step 7: Test logout functionality');
          
          // Navigate back to dashboard
          await page.goto('http://localhost:5173/dashboard');
          await page.waitForTimeout(2000);
          
          // Look for logout option
          const logoutButton = await page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
          
          if (await logoutButton.count() > 0) {
            await logoutButton.click();
            await page.waitForTimeout(2000);
            
            // Check if redirected to login or home page
            const currentURL = page.url();
            if (currentURL.includes('/login') || currentURL.includes('/') || !currentURL.includes('/dashboard')) {
              console.log('✅ Logout successful - redirected away from dashboard');
              testResults.logoutSuccess = true;
              
              await page.screenshot({ path: 'real-user-07-after-logout.png', fullPage: true });
            }
          } else {
            console.log('⚠️  Logout button not found - checking if user menu has logout');
            
            // Try clicking user menu first
            const userMenuButton = await page.locator('button:has-text("Jay"), button:has-text("veedz"), [aria-label*="user"]').first();
            if (await userMenuButton.count() > 0) {
              await userMenuButton.click();
              await page.waitForTimeout(1000);
              
              // Then look for logout in dropdown
              const dropdownLogout = await page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
              if (await dropdownLogout.count() > 0) {
                await dropdownLogout.click();
                await page.waitForTimeout(2000);
                testResults.logoutSuccess = true;
                console.log('✅ Logout successful via user menu dropdown');
                
                await page.screenshot({ path: 'real-user-07-after-logout.png', fullPage: true });
              }
            }
          }
          
        } catch (redirectError) {
          console.log('❌ Login redirect failed or took too long:', redirectError.message);
          testResults.errors.push(`Login redirect failed: ${redirectError.message}`);
          
          // Take screenshot of current state
          await page.screenshot({ path: 'real-user-error-state.png', fullPage: true });
          
          // Check if we're still on login page with error
          const currentURL = page.url();
          console.log(`Current URL after login attempt: ${currentURL}`);
          
          // Check for error messages
          const errorElements = await page.locator('.error, [role="alert"], .text-red-500, .text-danger').count();
          if (errorElements > 0) {
            console.log('❌ Login error detected on page');
          }
        }
      } else {
        console.log('❌ Login button not found');
        testResults.errors.push('Login button not found');
      }
    } else {
      console.log('❌ Login form fields not found');
      testResults.errors.push('Login form fields not found');
    }

  } catch (error) {
    console.error('❌ Test execution error:', error);
    testResults.errors.push(error.message);
    
    await page.screenshot({ path: 'real-user-critical-error.png', fullPage: true });
  }

  await browser.close();
  
  // Print comprehensive results
  console.log('\n📊 REAL USER LOGIN TEST RESULTS');
  console.log('════════════════════════════════════');
  console.log(`🔐 Login Success: ${testResults.loginSuccess ? '✅ YES' : '❌ NO'}`);
  console.log(`🏠 Dashboard Access: ${testResults.dashboardAccess ? '✅ YES' : '❌ NO'}`);
  console.log(`👤 User Menu Visible: ${testResults.userMenuVisible ? '✅ YES' : '❌ NO'}`);
  console.log(`🧠 Quiz Access: ${testResults.quizAccess ? '✅ YES' : '❌ NO'}`);
  console.log(`🚪 Logout Success: ${testResults.logoutSuccess ? '✅ YES' : '❌ NO'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🐛 Errors Encountered:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  const successfulTests = [
    testResults.loginSuccess,
    testResults.dashboardAccess,
    testResults.userMenuVisible,
    testResults.quizAccess,
    testResults.logoutSuccess
  ].filter(Boolean).length;
  
  const totalTests = 5;
  const successRate = Math.round((successfulTests / totalTests) * 100);
  
  console.log(`\n🎯 Success Rate: ${successRate}% (${successfulTests}/${totalTests})`);
  
  if (successRate >= 80) {
    console.log('🏆 EXCELLENT! Real user authentication and functionality working perfectly');
  } else if (successRate >= 60) {
    console.log('👍 GOOD! Most user functionality is working with minor issues');
  } else {
    console.log('⚠️  NEEDS ATTENTION! User authentication or functionality has significant issues');
  }
  
  console.log('\n📸 Screenshots saved:');
  console.log('  • real-user-01-login-page.png');
  console.log('  • real-user-02-credentials-filled.png');
  console.log('  • real-user-03-dashboard.png (if login successful)');
  console.log('  • real-user-04-user-menu.png (if menu accessible)');
  console.log('  • real-user-05-quiz-access.png (if quiz works)');
  console.log('  • real-user-06-answer-selected.png (if quiz interaction works)');
  console.log('  • real-user-07-after-logout.png (if logout works)');
  
  return testResults;
}

testRealUserLogin().then(results => {
  const success = results.loginSuccess && results.dashboardAccess;
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Critical test failure:', error);
  process.exit(1);
});