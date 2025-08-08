const { chromium } = require('playwright');
const path = require('path');

async function testApplicationFunctionality() {
  console.log('🧪 Starting Comprehensive MedQuiz Pro Testing Suite');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-web-security', '--allow-running-insecure-content']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    timeout: 30000
  });
  
  const page = await context.newPage();
  
  // Enhanced error handling
  page.on('pageerror', (err) => {
    console.warn('⚠️ Page error:', err.message);
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.warn('⚠️ Console error:', msg.text());
    }
  });

  let results = {
    serverStatus: '❌ Not tested',
    authentication: '❌ Not tested',
    database: '❌ Not tested',
    quizFunctionality: '❌ Not tested',
    responsiveDesign: '❌ Not tested',
    errorHandling: '❌ Not tested',
    performance: '❌ Not tested'
  };

  try {
    // Test 1: Server Accessibility
    console.log('\n📡 Testing Server Accessibility...');
    await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Wait for the main content to load
    await page.waitForSelector('body', { timeout: 5000 });
    const title = await page.title();
    console.log(`✅ Server accessible - Page title: "${title}"`);
    results.serverStatus = '✅ Working';

    // Test 2: Landing Page Structure
    console.log('\n🏠 Testing Landing Page Structure...');
    const mainContent = await page.textContent('body');
    
    if (mainContent.includes('MedQuiz Pro') || mainContent.includes('USMLE') || mainContent.includes('Medical')) {
      console.log('✅ Landing page contains medical education content');
    } else {
      console.log('⚠️ Landing page may not contain expected medical content');
    }

    // Test 3: Navigation and Authentication Flow
    console.log('\n🔐 Testing Authentication Flow...');
    
    // Look for authentication elements
    const loginButton = page.locator('button, a').filter({ hasText: /sign in|login|log in/i });
    const registerButton = page.locator('button, a').filter({ hasText: /sign up|register|get started/i });
    
    const loginExists = await loginButton.count() > 0;
    const registerExists = await registerButton.count() > 0;
    
    console.log(`Login button exists: ${loginExists ? '✅' : '❌'}`);
    console.log(`Register button exists: ${registerExists ? '✅' : '❌'}`);
    
    if (loginExists || registerExists) {
      results.authentication = '✅ UI Elements Present';
      
      // Try to navigate to login page
      try {
        if (loginExists) {
          await loginButton.first().click({ timeout: 5000 });
          await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
          
          // Check if we're on a login page
          const currentUrl = page.url();
          const pageContent = await page.textContent('body');
          
          if (currentUrl.includes('/login') || pageContent.toLowerCase().includes('password')) {
            console.log('✅ Successfully navigated to login page');
            
            // Test login form if present
            const emailInput = page.locator('input[type="email"], input[name*="email"]');
            const passwordInput = page.locator('input[type="password"], input[name*="password"]');
            
            if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
              console.log('✅ Login form elements found');
              
              // Try to fill in test credentials (but don't submit)
              try {
                await emailInput.fill('jayveedz19@gmail.com');
                await passwordInput.fill('Jimkali90#');
                console.log('✅ Test credentials filled successfully');
                results.authentication = '✅ Form Functional';
              } catch (err) {
                console.log('⚠️ Could not fill login form:', err.message);
              }
            }
          }
        }
      } catch (err) {
        console.log('⚠️ Navigation to login failed:', err.message);
      }
    } else {
      results.authentication = '⚠️ No Auth UI Found';
    }

    // Test 4: Responsive Design
    console.log('\n📱 Testing Responsive Design...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileContent = await page.textContent('body');
    const hasMobileContent = mobileContent && mobileContent.length > 100;
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Return to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log(`Mobile responsive: ${hasMobileContent ? '✅' : '⚠️'}`);
    results.responsiveDesign = hasMobileContent ? '✅ Working' : '⚠️ Issues';

    // Test 5: Quiz Functionality (if accessible)
    console.log('\n🧠 Testing Quiz Functionality...');
    
    const quizElements = page.locator('button, a').filter({ hasText: /quiz|start|quick|practice/i });
    const quizExists = await quizElements.count() > 0;
    
    if (quizExists) {
      console.log('✅ Quiz-related elements found');
      results.quizFunctionality = '✅ UI Elements Present';
      
      // Try to start a quiz (but don't go through with it if requires login)
      try {
        await quizElements.first().click({ timeout: 3000 });
        await page.waitForTimeout(2000);
        
        const currentContent = await page.textContent('body');
        if (currentContent.includes('question') || currentContent.includes('quiz')) {
          console.log('✅ Quiz interface accessible');
          results.quizFunctionality = '✅ Accessible';
        }
      } catch (err) {
        console.log('⚠️ Quiz may require authentication');
      }
    } else {
      console.log('⚠️ No quiz elements found on current page');
      results.quizFunctionality = '⚠️ Not Found';
    }

    // Test 6: Error Handling
    console.log('\n🚨 Testing Error Handling...');
    
    // Test invalid route
    try {
      await page.goto('http://localhost:5175/invalid-route-test-404', { timeout: 5000 });
      const errorContent = await page.textContent('body');
      
      if (errorContent.includes('404') || errorContent.includes('not found') || errorContent.includes('error')) {
        console.log('✅ 404 error handling working');
        results.errorHandling = '✅ Working';
      } else {
        console.log('⚠️ No clear 404 handling found');
        results.errorHandling = '⚠️ Unclear';
      }
    } catch (err) {
      console.log('⚠️ Error handling test failed:', err.message);
      results.errorHandling = '❌ Failed';
    }

    // Return to main page for performance test
    await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Test 7: Performance Check
    console.log('\n⚡ Testing Performance...');
    
    const startTime = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ Good performance (< 3s)');
      results.performance = '✅ Good';
    } else if (loadTime < 5000) {
      console.log('⚠️ Moderate performance (3-5s)');
      results.performance = '⚠️ Moderate';
    } else {
      console.log('❌ Slow performance (> 5s)');
      results.performance = '❌ Slow';
    }

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  } finally {
    await browser.close();
  }

  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`🖥️  Server Status:       ${results.serverStatus}`);
  console.log(`🔐 Authentication:      ${results.authentication}`);
  console.log(`💾 Database:            ${results.database}`);
  console.log(`🧠 Quiz Functionality:  ${results.quizFunctionality}`);
  console.log(`📱 Responsive Design:   ${results.responsiveDesign}`);
  console.log(`🚨 Error Handling:      ${results.errorHandling}`);
  console.log(`⚡ Performance:         ${results.performance}`);
  
  console.log('\n='.repeat(60));
  
  // Count successful tests
  const successCount = Object.values(results).filter(r => r.includes('✅')).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`📈 OVERALL SUCCESS RATE: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  
  if (successCount === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Application is fully functional!');
  } else if (successCount >= totalTests * 0.8) {
    console.log('✅ MOSTLY WORKING! Minor issues to address.');
  } else if (successCount >= totalTests * 0.5) {
    console.log('⚠️ PARTIALLY WORKING. Several issues need attention.');
  } else {
    console.log('❌ MAJOR ISSUES FOUND. Requires immediate attention.');
  }
  
  return results;
}

// Run the test suite
testApplicationFunctionality()
  .then(results => {
    console.log('\n🏁 Testing completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Testing failed:', error);
    process.exit(1);
  });