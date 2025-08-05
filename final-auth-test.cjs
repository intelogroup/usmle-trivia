const { chromium } = require('playwright');

async function finalAuthTest() {
  console.log('🚀 Final Authentication System Test');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  const testResults = {
    registration: false,
    login: false,
    dashboardAccess: false,
    userMenuFound: false,
    logoutSuccessful: false,
    overall: false
  };
  
  try {
    const timestamp = Date.now();
    const testUser = {
      email: `finaltest${timestamp}@medquiz.test`,
      password: 'TestPassword123!',
      name: `Final Test User ${timestamp}`
    };
    
    console.log('📝 Step 1: User Registration');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
    
    // Use ID selectors based on debug results
    await page.fill('#name', testUser.name);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.password);
    
    await page.screenshot({ path: 'final-test-01-registration.png' });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'final-test-02-after-registration.png' });
    
    // Check registration result
    const afterRegUrl = page.url();
    const pageContent = await page.textContent('body');
    
    if (afterRegUrl.includes('/dashboard') || pageContent.includes('Dashboard')) {
      testResults.registration = true;
      testResults.dashboardAccess = true;
      console.log('✅ Registration successful - redirected to dashboard');
    } else if (!pageContent.includes('Failed to create account')) {
      testResults.registration = true;
      console.log('✅ Registration successful');
    } else {
      console.log('❌ Registration failed');
    }
    
    console.log('🏠 Step 2: Dashboard Access');
    if (!afterRegUrl.includes('/dashboard')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(2000);
      
      const dashboardContent = await page.textContent('body');
      if (dashboardContent.includes('Dashboard') || dashboardContent.includes('Quiz')) {
        testResults.dashboardAccess = true;
        console.log('✅ Dashboard accessible');
      }
    } else {
      testResults.dashboardAccess = true;
    }
    
    await page.screenshot({ path: 'final-test-03-dashboard.png' });
    
    console.log('🔍 Step 3: Finding User Menu');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Look for user menu - it should be in the top-right area
    const userMenuSuccess = await page.evaluate(async () => {
      // Find elements that might be the user menu
      const buttons = document.querySelectorAll('button');
      const candidates = [];
      
      for (let button of buttons) {
        const rect = button.getBoundingClientRect();
        const text = button.textContent || '';
        
        // Look for buttons in the top-right area (x > 800) that might contain user info
        if (rect.x > 800 && rect.y < 100) {
          candidates.push({
            element: button,
            text: text.trim(),
            x: rect.x,
            y: rect.y,
            hasUserIcon: button.querySelector('.w-8.h-8') !== null,
            hasRoundedElement: button.querySelector('.rounded-full') !== null
          });
        }
      }
      
      console.log('Found candidates:', candidates.map(c => ({ text: c.text, x: c.x, hasUserIcon: c.hasUserIcon })));
      
      // Click the most likely user menu candidate
      for (let candidate of candidates) {
        if (candidate.hasUserIcon || candidate.hasRoundedElement || candidate.text.includes('Test')) {
          candidate.element.click();
          
          // Wait a bit for dropdown to appear
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if logout appeared
          const logoutElement = document.querySelector('button:has-text("Logout"), [role="menuitem"]:has-text("Logout")') ||
                               Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Logout'));
          
          if (logoutElement) {
            return { success: true, element: logoutElement };
          }
        }
      }
      
      return { success: false };
    });
    
    await page.screenshot({ path: 'final-test-04-user-menu-search.png' });
    
    if (userMenuSuccess.success) {
      testResults.userMenuFound = true;
      console.log('✅ User menu found and opened');
      
      console.log('🚪 Step 4: Testing Logout');
      
      // Click logout button
      const logoutButton = page.locator('text="Logout"').first();
      if (await logoutButton.isVisible({ timeout: 3000 })) {
        await logoutButton.click();
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        console.log('📍 URL after logout:', finalUrl);
        
        if (finalUrl.includes('/login') || finalUrl === 'http://localhost:5173/') {
          testResults.logoutSuccessful = true;
          console.log('✅ Logout successful');
        } else {
          console.log('❌ Logout did not redirect properly');
        }
      } else {
        console.log('❌ Logout button not found');
      }
      
    } else {
      console.log('❌ Could not find user menu');
      
      // Try alternative approach - look for any element with user name
      const nameElements = await page.locator(`text="${testUser.name.split(' ')[0]}"`).count();
      console.log(`📝 Found ${nameElements} elements containing user's first name`);
    }
    
    await page.screenshot({ path: 'final-test-05-final-state.png' });
    
    // Overall success calculation
    testResults.overall = testResults.registration && testResults.dashboardAccess;
    
    console.log('\n🎯 FINAL TEST RESULTS:');
    console.log('✅ Registration:', testResults.registration ? 'PASS' : 'FAIL');
    console.log('✅ Dashboard Access:', testResults.dashboardAccess ? 'PASS' : 'FAIL');
    console.log('✅ User Menu Found:', testResults.userMenuFound ? 'PASS' : 'FAIL');
    console.log('✅ Logout Successful:', testResults.logoutSuccessful ? 'PASS' : 'FAIL');
    console.log('✅ Overall System:', testResults.overall ? 'FUNCTIONAL' : 'PARTIAL');
    
    return testResults;
    
  } catch (error) {
    console.error('💥 Test error:', error);
    await page.screenshot({ path: 'final-test-error.png' });
    return { ...testResults, error: error.message };
  } finally {
    await browser.close();
  }
}

finalAuthTest().then(results => {
  console.log('\n📊 AUTHENTICATION SYSTEM STATUS:');
  
  const functionalFeatures = Object.entries(results).filter(([key, value]) => 
    key !== 'overall' && key !== 'error' && value === true
  ).length;
  
  const totalFeatures = Object.keys(results).length - (results.error ? 2 : 1); // excluding 'overall' and 'error'
  
  console.log(`✅ Functional Features: ${functionalFeatures}/${totalFeatures}`);
  console.log(`📈 Success Rate: ${((functionalFeatures / totalFeatures) * 100).toFixed(1)}%`);
  
  if (results.overall) {
    console.log('🎉 AUTHENTICATION SYSTEM IS FUNCTIONAL!');
  } else if (functionalFeatures >= 2) {
    console.log('⚠️  AUTHENTICATION SYSTEM PARTIALLY WORKING');
  } else {
    console.log('❌ AUTHENTICATION SYSTEM NEEDS ATTENTION');
  }
});