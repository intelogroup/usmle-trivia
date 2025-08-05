const { chromium } = require('playwright');

async function testLogout() {
  console.log('🚀 Testing Logout Functionality');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // First, get to the authenticated dashboard state
    console.log('📡 Navigating to application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Navigate to registration and create a user
    console.log('📝 Creating test user...');
    await page.click('text="Get Started"');
    await page.waitForSelector('input[type="email"]');
    
    const timestamp = Date.now();
    const testUser = {
      email: `testlogout${timestamp}@medquiz.test`,
      password: 'TestPassword123!',
      name: `Logout Test User ${timestamp}`
    };
    
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'logout-test-01-after-register.png' });
    
    // Check if we're on dashboard
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (!currentUrl.includes('/dashboard')) {
      // If not redirected to dashboard, try manual navigation
      console.log('🔄 Navigating to dashboard manually...');
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'logout-test-02-dashboard.png' });
    
    // Look for user menu trigger - could be avatar, name, or user icon
    console.log('🔍 Looking for user menu...');
    
    const userMenuSelectors = [
      '[class*="user"]', // Generic user-related elements
      'button:has([data-testid="user-avatar"])',
      'button:has(svg):has-text("Test")', // Button with SVG containing test user name
      'button:has(.w-8.h-8)', // Button with avatar-sized element
      '.relative button:has(.rounded-full)', // Button with rounded element (avatar)
    ];
    
    let userMenuFound = false;
    for (const selector of userMenuSelectors) {
      try {
        const elements = await page.locator(selector).all();
        console.log(`🔍 Found ${elements.length} elements matching "${selector}"`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const text = await element.textContent();
          console.log(`  Element ${i}: visible=${isVisible}, text="${text}"`);
          
          if (isVisible && (text?.includes('Test') || text?.includes('User') || text?.includes('@'))) {
            console.log(`✅ Clicking user menu element: "${text}"`);
            await element.click();
            userMenuFound = true;
            break;
          }
        }
        
        if (userMenuFound) break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!userMenuFound) {
      // Try clicking on any clickable element in the top right area
      console.log('🔍 Trying top-right area elements...');
      const topRightElements = await page.locator('header button, .flex button, [class*="user"], [class*="avatar"]').all();
      
      for (let i = 0; i < topRightElements.length; i++) {
        const element = topRightElements[i];
        try {
          const isVisible = await element.isVisible();
          const text = await element.textContent();
          const boundingBox = await element.boundingBox();
          
          // Check if element is in the top-right area
          if (isVisible && boundingBox && boundingBox.x > 800) {
            console.log(`🎯 Trying top-right element: "${text}" at x=${boundingBox.x}`);
            await element.click();
            await page.waitForTimeout(500);
            
            // Check if dropdown appeared
            const logoutButton = page.locator('text="Logout"');
            if (await logoutButton.isVisible({ timeout: 1000 })) {
              console.log('✅ Found logout button after clicking element');
              userMenuFound = true;
              break;
            }
          }
        } catch (e) {
          // Continue
        }
      }
    }
    
    await page.screenshot({ path: 'logout-test-03-user-menu-attempt.png' });
    
    // Wait a moment for dropdown to appear
    await page.waitForTimeout(1000);
    
    // Look for logout button
    console.log('🔍 Looking for logout button...');
    const logoutSelectors = [
      'text="Logout"',
      'text="Log out"',
      'text="Sign out"',
      'button:has-text("Logout")',
      'button:has-text("Log out")',
      '[role="menuitem"]:has-text("Logout")',
      'button:has(svg):has-text("Logout")'
    ];
    
    let loggedOut = false;
    for (const selector of logoutSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found logout button with selector: ${selector}`);
          await element.click();
          loggedOut = true;
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!loggedOut) {
      console.log('❌ Could not find logout button, taking debug screenshot...');
      await page.screenshot({ path: 'logout-test-debug.png' });
      
      // Get page content for debugging
      const bodyText = await page.locator('body').textContent();
      console.log('📝 Page contains logout-related text:', 
        bodyText.toLowerCase().includes('logout') || 
        bodyText.toLowerCase().includes('log out') ||
        bodyText.toLowerCase().includes('sign out')
      );
    }
    
    // Wait for logout to complete
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'logout-test-04-after-logout.png' });
    
    // Check if redirected to login page
    const finalUrl = page.url();
    console.log('📍 Final URL:', finalUrl);
    
    const logoutSuccessful = finalUrl.includes('/login') || 
                           finalUrl === 'http://localhost:5173/' ||
                           !(await page.locator('text="Dashboard"').isVisible());
    
    console.log(logoutSuccessful ? '✅ Logout test PASSED' : '❌ Logout test FAILED');
    
    return {
      success: loggedOut && logoutSuccessful,
      userMenuFound,
      loggedOut,
      finalUrl
    };
    
  } catch (error) {
    console.error('💥 Logout test error:', error);
    await page.screenshot({ path: 'logout-test-error.png' });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testLogout().then(result => {
  console.log('🎯 Test Result:', result);
});