import { chromium } from 'playwright';

async function testLoginNavigation() {
  console.log('🔍 Testing login and navigation...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for all navigation events
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('🧭 Navigation to:', frame.url());
    }
  });
  
  // Listen for console messages
  page.on('console', msg => {
    if (msg.text().includes('Login') || msg.text().includes('Dashboard') || msg.text().includes('navigation') || msg.text().includes('Store:')) {
      console.log(`CONSOLE (${msg.type()}):`, msg.text());
    }
  });
  
  try {
    await page.goto('http://localhost:5177', { waitUntil: 'networkidle' });
    console.log('✅ Initial page loaded');
    
    // Navigate to login page
    const loginLink = page.locator('a[href*="login"], button:has-text("Login"), button:has-text("Sign In")').first();
    if (await loginLink.count() > 0) {
      console.log('🔗 Clicking login link');
      await loginLink.click();
      await page.waitForLoadState('networkidle');
      console.log('Current URL after login click:', page.url());
      
      // Fill and submit login form
      await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      
      console.log('📝 Submitting login form');
      await page.click('button[type="submit"]');
      
      // Wait for potential navigation and check URL changes
      const urlBefore = page.url();
      console.log('URL before waiting:', urlBefore);
      
      // Wait for navigation to complete - either to dashboard or back to home
      await page.waitForTimeout(5000);
      
      const urlAfter = page.url();
      console.log('URL after waiting:', urlAfter);
      
      if (urlBefore !== urlAfter) {
        console.log('✅ Navigation occurred!');
      } else {
        console.log('❌ No navigation occurred');
      }
      
      // Check what's on the page now
      const pageContent = await page.textContent('body');
      const hasDashboard = pageContent.includes('Dashboard') || pageContent.includes('Start Quiz') || page.url().includes('dashboard');
      const hasAuth = pageContent.includes('Login') || pageContent.includes('Sign In');
      
      console.log('Page has Dashboard content:', hasDashboard);
      console.log('Page has Auth content:', hasAuth);
      
      // Take screenshot
      await page.screenshot({ path: 'debug-post-login-navigation.png' });
      
      // If we're not on dashboard, manually navigate there
      if (!hasDashboard && !hasAuth) {
        console.log('🎯 Manually navigating to dashboard');
        await page.goto('http://localhost:5177/dashboard');
        await page.waitForTimeout(3000);
        
        const dashboardContent = await page.textContent('body');
        const hasQuizElements = dashboardContent.includes('Start Quiz') || dashboardContent.includes('Quick Quiz');
        console.log('Dashboard has quiz elements:', hasQuizElements);
        
        await page.screenshot({ path: 'debug-manual-dashboard.png' });
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLoginNavigation();