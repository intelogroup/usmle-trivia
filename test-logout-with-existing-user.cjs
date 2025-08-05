const { chromium } = require('playwright');

async function testLogoutWithExistingUser() {
  console.log('🚀 Testing Logout with Existing User');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Go to login page
    console.log('📡 Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    
    // Use a known test user that should exist from previous tests
    const testUser = {
      email: 'testuser@medquiz.test',
      password: 'TestPassword123!'
    };
    
    console.log('🔑 Logging in with test user...');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'logout-existing-01-after-login.png' });
    
    const currentUrl = page.url();
    console.log('📍 After login URL:', currentUrl);
    
    // If not on dashboard, navigate there
    if (!currentUrl.includes('/dashboard')) {
      console.log('🔄 Navigating to dashboard...');
      await page.goto('http://localhost:5173/dashboard');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'logout-existing-02-dashboard.png' });
    
    // Look for the user menu - based on the TopBar component, it should be a button with user info
    console.log('🔍 Looking for user menu button...');
    
    // The TopBar shows user avatar and name, so look for that pattern
    const userButton = page.locator('button:has(.w-8.h-8.bg-primary.rounded-full)');
    
    if (await userButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found user menu button');
      await userButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'logout-existing-03-menu-opened.png' });
      
      // Look for logout button in the dropdown
      const logoutButton = page.locator('button:has-text("Logout")');
      
      if (await logoutButton.isVisible({ timeout: 3000 })) {
        console.log('✅ Found logout button in dropdown');
        await logoutButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'logout-existing-04-after-logout.png' });
        
        // Check if redirected properly
        const finalUrl = page.url();
        console.log('📍 Final URL after logout:', finalUrl);
        
        const logoutSuccessful = finalUrl.includes('/login') || finalUrl === 'http://localhost:5173/';
        console.log(logoutSuccessful ? '✅ Logout SUCCESSFUL' : '❌ Logout FAILED');
        
        return { success: logoutSuccessful, finalUrl };
        
      } else {
        console.log('❌ Logout button not found in dropdown');
        
        // Debug: show what's in the dropdown
        const dropdownContent = await page.locator('.absolute.right-0.mt-2').textContent();
        console.log('📝 Dropdown content:', dropdownContent);
        
        return { success: false, error: 'Logout button not found' };
      }
      
    } else {
      console.log('❌ User menu button not found');
      
      // Debug: show all clickable elements in the header
      const headerButtons = await page.locator('header button').all();
      console.log(`📝 Found ${headerButtons.length} buttons in header`);
      
      for (let i = 0; i < headerButtons.length; i++) {
        const btn = headerButtons[i];
        const text = await btn.textContent();
        const isVisible = await btn.isVisible();
        console.log(`  Button ${i}: "${text}" (visible: ${isVisible})`);
      }
      
      return { success: false, error: 'User menu button not found' };
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
    await page.screenshot({ path: 'logout-existing-error.png' });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

testLogoutWithExistingUser().then(result => {
  console.log('🎯 Final Test Result:', result);
});