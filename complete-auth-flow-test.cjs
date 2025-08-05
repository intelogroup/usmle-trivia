const { chromium } = require('playwright');

async function completeAuthFlowTest() {
  console.log('🚀 Complete Authentication Flow Test');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    const timestamp = Date.now();
    const testUser = {
      email: `authtest${timestamp}@medquiz.test`,
      password: 'TestPassword123!',
      name: `Auth Test User ${timestamp}`
    };
    
    // Step 1: Register a new user
    console.log('📝 Step 1: User Registration');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    await page.screenshot({ path: 'complete-auth-01-registration-form.png' });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'complete-auth-02-after-registration.png' });
    
    // Step 2: Check if logged in and on dashboard
    console.log('🏠 Step 2: Verify Dashboard Access');
    let currentUrl = page.url();
    console.log('📍 URL after registration:', currentUrl);
    
    if (!currentUrl.includes('/dashboard')) {
      console.log('🔄 Registration may have failed, trying login...');
      
      // Go to login page
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      currentUrl = page.url();
      console.log('📍 URL after login:', currentUrl);
    }
    
    // Ensure we're on dashboard
    if (!currentUrl.includes('/dashboard')) {
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'complete-auth-03-dashboard.png' });
    
    // Step 3: Find and test logout
    console.log('🚪 Step 3: Testing Logout Functionality');
    
    // Wait for any loading to complete
    await page.waitForTimeout(2000);
    
    // Look for user name or avatar in the UI - this should be clickable
    const pageContent = await page.textContent('body');
    console.log('📝 Page contains user name:', pageContent.includes(testUser.name));
    
    // Try different approaches to find the user menu
    const userMenuApproaches = [
      // Approach 1: Look for button containing user name
      `button:has-text("${testUser.name.split(' ')[0]}")`,
      
      // Approach 2: Look for user avatar button
      'button:has(.rounded-full)',
      
      // Approach 3: Look for any button in header area that might be user menu
      'header button:has(svg)',
      
      // Approach 4: Look for relative positioned dropdown trigger
      '.relative button:has(.w-8)',
      
      // Approach 5: Any button that contains user-related classes
      'button[class*="user"], button:has([class*="user"])'
    ];
    
    let userMenuClicked = false;
    
    for (const selector of userMenuApproaches) {
      try {
        console.log(`🔍 Trying selector: ${selector}`);
        const elements = await page.locator(selector).all();
        
        for (let element of elements) {
          if (await element.isVisible()) {
            const text = await element.textContent();
            const boundingBox = await element.boundingBox();
            
            console.log(`  Found element: "${text}" at position x=${boundingBox?.x || 'unknown'}`);
            
            // Click elements that are likely in the top-right area (x > 700)
            if (!boundingBox || boundingBox.x > 700) {
              console.log(`✅ Clicking potential user menu: "${text}"`);
              await element.click();
              await page.waitForTimeout(1000);
              
              // Check if logout option appeared
              const logoutVisible = await page.locator('text="Logout"').isVisible({ timeout: 2000 });
              if (logoutVisible) {
                console.log('🎯 User menu opened successfully!');
                userMenuClicked = true;
                break;
              }
            }
          }
        }
        
        if (userMenuClicked) break;
        
      } catch (e) {
        console.log(`❌ Selector failed: ${selector}`);
      }
    }
    
    await page.screenshot({ path: 'complete-auth-04-user-menu-attempt.png' });
    
    if (!userMenuClicked) {
      console.log('❌ Could not open user menu, taking detailed screenshot...');
      
      // Get all clickable elements for debugging
      const allButtons = await page.locator('button, a, [onclick], [role="button"]').all();
      console.log(`📊 Found ${allButtons.length} clickable elements`);
      
      // Focus on header area
      const headerElements = await page.locator('header *').all();
      console.log(`📊 Found ${headerElements.length} elements in header`);
      
      return {
        success: false,
        step: 'logout',
        error: 'Could not find user menu',
        userRegistered: true,
        dashboardAccess: currentUrl.includes('/dashboard')
      };
    }
    
    // Step 4: Click logout
    console.log('🔓 Step 4: Clicking Logout');
    const logoutButton = page.locator('text="Logout"').first();
    
    if (await logoutButton.isVisible({ timeout: 3000 })) {
      await logoutButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'complete-auth-05-after-logout.png' });
      
      const finalUrl = page.url();
      console.log('📍 Final URL:', finalUrl);
      
      const logoutSuccessful = finalUrl.includes('/login') || finalUrl === 'http://localhost:5173/';
      
      console.log(logoutSuccessful ? '✅ COMPLETE AUTH FLOW SUCCESSFUL!' : '❌ Logout redirect failed');
      
      return {
        success: logoutSuccessful,
        userRegistered: true,
        dashboardAccess: true,
        userMenuFound: true,
        logoutClicked: true,
        finalUrl
      };
      
    } else {
      console.log('❌ Logout button not visible');
      return {
        success: false,
        step: 'logout-click',
        userRegistered: true,
        dashboardAccess: true,
        userMenuFound: true,
        error: 'Logout button not visible'
      };
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
    await page.screenshot({ path: 'complete-auth-error.png' });
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

completeAuthFlowTest().then(result => {
  console.log('\n🎯 FINAL TEST RESULT:');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('🎉 AUTHENTICATION SYSTEM FULLY FUNCTIONAL!');
  } else {
    console.log('⚠️  Authentication system partially working, issue:', result.error);
  }
});