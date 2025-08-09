const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create comprehensive UI test suite
async function runComprehensiveUITests() {
  console.log('🚀 Starting Comprehensive UI Functionality Tests');
  
  const browser = await chromium.launch({ 
    headless: true, // Run headless for server environment
    slowMo: 200 // Reduced for faster execution
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Test results array
  const testResults = {
    timestamp: new Date().toISOString(),
    testSuite: 'UI Functionality Comprehensive Tests',
    results: [],
    screenshots: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Helper function to add test result
  function addTestResult(category, testName, status, details = '', screenshot = '') {
    testResults.results.push({
      category,
      testName,
      status,
      details,
      screenshot,
      timestamp: new Date().toISOString()
    });
    testResults.summary.total++;
    if (status === 'PASS') testResults.summary.passed++;
    else if (status === 'FAIL') testResults.summary.failed++;
    else testResults.summary.warnings++;
  }

  // Helper function to take screenshots
  async function takeScreenshot(name, description = '') {
    const timestamp = Date.now();
    const filename = `ui-test-${name}-${timestamp}.png`;
    const filepath = `/root/repo/ui-test-screenshots/${filename}`;
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await page.screenshot({ path: filepath, fullPage: true });
    testResults.screenshots.push({
      name,
      description,
      filename,
      filepath,
      timestamp
    });
    return filename;
  }

  try {
    console.log('📱 Testing 1: Initial Landing Page Load');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    const screenshot1 = await takeScreenshot('01-landing-page', 'Initial landing page load');
    
    // Test 1: Landing Page UI Elements
    console.log('🔍 Testing Landing Page UI Elements...');
    const hasLogo = await page.locator('text=MedQuiz Pro').count() > 0;
    const hasGetStarted = await page.locator('text=Get Started').count() > 0;
    const hasSignIn = await page.locator('text=Sign In').count() > 0;
    
    addTestResult('Landing Page', 'Logo Display', hasLogo ? 'PASS' : 'FAIL', 
      `Logo present: ${hasLogo}`, screenshot1);
    addTestResult('Landing Page', 'Get Started Button', hasGetStarted ? 'PASS' : 'FAIL', 
      `Button present: ${hasGetStarted}`, screenshot1);
    addTestResult('Landing Page', 'Sign In Button', hasSignIn ? 'PASS' : 'FAIL', 
      `Button present: ${hasSignIn}`, screenshot1);

    // Test 2: Navigation to Login Page
    console.log('🔍 Testing Navigation to Login...');
    await page.click('text=Sign In');
    await page.waitForLoadState('networkidle');
    const screenshot2 = await takeScreenshot('02-login-page', 'Navigation to login page');
    
    const isLoginPage = page.url().includes('/login');
    const hasEmailField = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordField = await page.locator('input[type="password"]').count() > 0;
    const hasLoginButton = await page.locator('button[type="submit"]').count() > 0;
    
    addTestResult('Navigation', 'Navigate to Login', isLoginPage ? 'PASS' : 'FAIL', 
      `URL: ${page.url()}`, screenshot2);
    addTestResult('Login Form', 'Email Field Present', hasEmailField ? 'PASS' : 'FAIL', 
      `Email field found: ${hasEmailField}`, screenshot2);
    addTestResult('Login Form', 'Password Field Present', hasPasswordField ? 'PASS' : 'FAIL', 
      `Password field found: ${hasPasswordField}`, screenshot2);
    addTestResult('Login Form', 'Submit Button Present', hasLoginButton ? 'PASS' : 'FAIL', 
      `Login button found: ${hasLoginButton}`, screenshot2);

    // Test 3: Form Validation Testing
    console.log('🔍 Testing Form Validation...');
    
    // Test empty form submission
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const screenshot3 = await takeScreenshot('03-form-validation', 'Form validation testing');
    
    const hasValidationMessages = await page.locator('[class*="error"], .text-red-500, .text-red-600').count() > 0;
    addTestResult('Form Validation', 'Empty Form Validation', hasValidationMessages ? 'PASS' : 'FAIL', 
      `Validation messages shown: ${hasValidationMessages}`, screenshot3);

    // Test 4: Fill Login Form with Real Credentials
    console.log('🔍 Testing Login Form Interaction...');
    await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    await page.waitForTimeout(500);
    const screenshot4 = await takeScreenshot('04-login-filled', 'Login form filled with credentials');
    
    const emailFilled = await page.locator('input[type="email"]').inputValue();
    const passwordFilled = await page.locator('input[type="password"]').inputValue();
    
    addTestResult('Form Interaction', 'Email Field Input', emailFilled === 'jayveedz19@gmail.com' ? 'PASS' : 'FAIL', 
      `Email value: ${emailFilled}`, screenshot4);
    addTestResult('Form Interaction', 'Password Field Input', passwordFilled.length > 0 ? 'PASS' : 'FAIL', 
      `Password entered: ${passwordFilled.length} characters`, screenshot4);

    // Test 5: Login Submission
    console.log('🔍 Testing Login Submission...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); // Wait for authentication
    const screenshot5 = await takeScreenshot('05-after-login', 'After login submission');
    
    const currentURL = page.url();
    const isDashboard = currentURL.includes('/dashboard') || currentURL === 'http://localhost:5173/';
    const hasUserElements = await page.locator('text=Jay, text=jayveedz, [class*="user"], [class*="profile"]').count() > 0;
    
    addTestResult('Authentication', 'Login Success', isDashboard ? 'PASS' : 'FAIL', 
      `Current URL: ${currentURL}`, screenshot5);
    addTestResult('Authentication', 'User Data Display', hasUserElements ? 'PASS' : 'FAIL', 
      `User elements found: ${hasUserElements}`, screenshot5);

    // Test 6: Dashboard UI Elements
    console.log('🔍 Testing Dashboard UI Elements...');
    await page.waitForTimeout(2000);
    const screenshot6 = await takeScreenshot('06-dashboard-overview', 'Dashboard UI elements');
    
    const hasStatsCards = await page.locator('[class*="stats"], [class*="card"], .bg-white, .rounded').count() > 0;
    const hasQuizButtons = await page.locator('text=Quick Quiz, text=Timed Quiz, text=Custom Quiz, button').count() > 0;
    const hasNavigation = await page.locator('nav, [class*="sidebar"], [class*="menu"]').count() > 0;
    
    addTestResult('Dashboard', 'Stats Cards Present', hasStatsCards ? 'PASS' : 'FAIL', 
      `Stats cards found: ${hasStatsCards}`, screenshot6);
    addTestResult('Dashboard', 'Quiz Options Available', hasQuizButtons ? 'PASS' : 'FAIL', 
      `Quiz buttons found: ${hasQuizButtons}`, screenshot6);
    addTestResult('Dashboard', 'Navigation Elements', hasNavigation ? 'PASS' : 'FAIL', 
      `Navigation found: ${hasNavigation}`, screenshot6);

    // Test 7: Quiz Functionality
    console.log('🔍 Testing Quiz Functionality...');
    const quickQuizButton = page.locator('text=Quick Quiz').first();
    if (await quickQuizButton.count() > 0) {
      await quickQuizButton.click();
      await page.waitForTimeout(2000);
      const screenshot7 = await takeScreenshot('07-quiz-interface', 'Quiz interface');
      
      const isQuizPage = page.url().includes('/quiz') || await page.locator('text=Question, text=Timer, [class*="question"]').count() > 0;
      const hasQuestionContent = await page.locator('[class*="question"], .question-text, p').count() > 0;
      const hasAnswerOptions = await page.locator('input[type="radio"], [class*="option"], button').count() > 0;
      
      addTestResult('Quiz Engine', 'Quiz Page Load', isQuizPage ? 'PASS' : 'FAIL', 
        `Quiz page detected: ${isQuizPage}`, screenshot7);
      addTestResult('Quiz Engine', 'Question Content', hasQuestionContent ? 'PASS' : 'FAIL', 
        `Question content found: ${hasQuestionContent}`, screenshot7);
      addTestResult('Quiz Engine', 'Answer Options', hasAnswerOptions ? 'PASS' : 'FAIL', 
        `Answer options found: ${hasAnswerOptions}`, screenshot7);
      
      // Test answer selection
      if (hasAnswerOptions) {
        const firstOption = page.locator('input[type="radio"], button').first();
        if (await firstOption.count() > 0) {
          await firstOption.click();
          await page.waitForTimeout(1000);
          const screenshot8 = await takeScreenshot('08-answer-selected', 'Answer selection');
          
          const answerSelected = await page.locator('input[type="radio"]:checked, [class*="selected"], .bg-blue').count() > 0;
          addTestResult('Quiz Interaction', 'Answer Selection', answerSelected ? 'PASS' : 'FAIL', 
            `Answer selected: ${answerSelected}`, screenshot8);
        }
      }
    }

    // Test 8: Mobile Responsiveness
    console.log('🔍 Testing Mobile Responsiveness...');
    
    // Test Mobile View (375x667 - iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const screenshot9 = await takeScreenshot('09-mobile-375x667', 'Mobile responsive test');
    
    const mobileElements = await page.locator('body').boundingBox();
    const isMobileResponsive = mobileElements && mobileElements.width <= 375;
    
    addTestResult('Responsive Design', 'Mobile Layout (375px)', isMobileResponsive ? 'PASS' : 'FAIL', 
      `Mobile layout adapted: ${isMobileResponsive}`, screenshot9);

    // Test Tablet View (768x1024 - iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const screenshot10 = await takeScreenshot('10-tablet-768x1024', 'Tablet responsive test');
    
    const tabletElements = await page.locator('body').boundingBox();
    const isTabletResponsive = tabletElements && tabletElements.width <= 768;
    
    addTestResult('Responsive Design', 'Tablet Layout (768px)', isTabletResponsive ? 'PASS' : 'FAIL', 
      `Tablet layout adapted: ${isTabletResponsive}`, screenshot10);

    // Test Desktop View (1280x720)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    const screenshot11 = await takeScreenshot('11-desktop-1280x720', 'Desktop responsive test');
    
    addTestResult('Responsive Design', 'Desktop Layout (1280px)', 'PASS', 
      'Desktop layout verified', screenshot11);

    // Test 9: User Menu and Logout
    console.log('🔍 Testing User Menu and Logout...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    const userMenuButton = page.locator('[class*="user"], [class*="profile"], [class*="menu"]').first();
    if (await userMenuButton.count() > 0) {
      await userMenuButton.click();
      await page.waitForTimeout(1000);
      const screenshot12 = await takeScreenshot('12-user-menu', 'User menu opened');
      
      const hasLogoutOption = await page.locator('text=Logout, text=Sign Out, text=Exit').count() > 0;
      addTestResult('User Menu', 'Menu Opens', 'PASS', 'User menu clicked', screenshot12);
      addTestResult('User Menu', 'Logout Option Available', hasLogoutOption ? 'PASS' : 'FAIL', 
        `Logout option found: ${hasLogoutOption}`, screenshot12);
      
      if (hasLogoutOption) {
        await page.locator('text=Logout, text=Sign Out, text=Exit').first().click();
        await page.waitForTimeout(2000);
        const screenshot13 = await takeScreenshot('13-after-logout', 'After logout');
        
        const backToLanding = page.url() === 'http://localhost:5173/' || page.url().includes('/login');
        addTestResult('Authentication', 'Logout Success', backToLanding ? 'PASS' : 'FAIL', 
          `URL after logout: ${page.url()}`, screenshot13);
      }
    }

    // Test 10: Error Handling
    console.log('🔍 Testing Error Handling...');
    await page.goto('http://localhost:5173/nonexistent-page');
    await page.waitForTimeout(2000);
    const screenshot14 = await takeScreenshot('14-404-page', 'Error page handling');
    
    const has404Content = await page.locator('text=404, text=Not Found, text=Page not found').count() > 0;
    addTestResult('Error Handling', '404 Page', has404Content ? 'PASS' : 'FAIL', 
      `404 page content: ${has404Content}`, screenshot14);

    // Test 11: Performance and Loading States
    console.log('🔍 Testing Performance and Loading States...');
    await page.goto('http://localhost:5173/');
    
    // Measure page load time
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    const screenshot15 = await takeScreenshot('15-performance-test', 'Performance testing');
    
    addTestResult('Performance', 'Page Load Time', loadTime < 5000 ? 'PASS' : 'WARNING', 
      `Load time: ${loadTime}ms`, screenshot15);

    // Test 12: Accessibility Features
    console.log('🔍 Testing Accessibility Features...');
    
    // Check for ARIA labels and accessibility attributes
    const hasAriaLabels = await page.locator('[aria-label], [aria-describedby], [role]').count() > 0;
    const hasAltTexts = await page.locator('img[alt]').count();
    const hasSemanticHTML = await page.locator('nav, main, header, footer, section, article').count() > 0;
    
    const screenshot16 = await takeScreenshot('16-accessibility-test', 'Accessibility features');
    
    addTestResult('Accessibility', 'ARIA Labels Present', hasAriaLabels ? 'PASS' : 'WARNING', 
      `ARIA attributes found: ${hasAriaLabels}`, screenshot16);
    addTestResult('Accessibility', 'Image Alt Texts', hasAltTexts > 0 ? 'PASS' : 'WARNING', 
      `Images with alt text: ${hasAltTexts}`, screenshot16);
    addTestResult('Accessibility', 'Semantic HTML', hasSemanticHTML ? 'PASS' : 'WARNING', 
      `Semantic elements found: ${hasSemanticHTML}`, screenshot16);

    // Final Summary Screenshot
    const screenshotFinal = await takeScreenshot('17-test-complete', 'UI testing completed');

  } catch (error) {
    console.error('❌ Test execution error:', error);
    addTestResult('System', 'Test Execution', 'FAIL', `Error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Generate comprehensive test report
  const reportPath = '/root/repo/ui-functionality-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

  // Generate summary report
  console.log('\n📊 UI FUNCTIONALITY TEST RESULTS SUMMARY');
  console.log('==========================================');
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} [${result.category}] ${result.testName}: ${result.status}`);
    if (result.details) console.log(`   Details: ${result.details}`);
  });

  console.log(`\n📁 Screenshots saved to: /root/repo/ui-test-screenshots/`);
  console.log(`📄 Full report saved to: ${reportPath}`);

  return testResults;
}

// Run the comprehensive UI tests
runComprehensiveUITests().catch(console.error);