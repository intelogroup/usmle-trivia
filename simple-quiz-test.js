import { chromium } from 'playwright';

async function testQuizFlow() {
  console.log('🔍 Testing quiz flow (headless)...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages and errors
  page.on('console', msg => {
    console.log(`CONSOLE (${msg.type()}):`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    await page.goto('http://localhost:5177', { waitUntil: 'networkidle' });
    console.log('✅ Page loaded successfully');
    
    // Take screenshot
    await page.screenshot({ path: 'quiz-test-current-page.png' });
    
    // Check what's currently on the page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Look for auth elements
    const authElements = await page.locator('button:has-text("Login"), button:has-text("Sign In"), a[href*="login"]').count();
    console.log('Auth elements found:', authElements);
    
    // Look for dashboard elements  
    const dashboardElements = await page.locator('h1:has-text("Dashboard"), .dashboard').count();
    console.log('Dashboard elements found:', dashboardElements);
    
    // Look for quiz elements
    const quizElements = await page.locator('button:has-text("Start Quiz"), .quiz-mode-selector').count();
    console.log('Quiz elements found:', quizElements);
    
    // Get page URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we need to login
    if (authElements > 0) {
      console.log('🔐 Need to authenticate first');
      
      // Find login button and click
      const loginBtn = page.locator('button:has-text("Login"), button:has-text("Sign In"), a[href*="login"]').first();
      if (await loginBtn.count() > 0) {
        await loginBtn.click();
        await page.waitForLoadState('networkidle');
        
        // Fill login form  
        await page.fill('input[type="email"], input[name="email"]', 'jayveedz19@gmail.com');
        await page.fill('input[type="password"], input[name="password"]', 'Jimkali90#');
        
        // Submit
        await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Login submitted, checking result');
        await page.screenshot({ path: 'quiz-test-after-login.png' });
        
        // Recheck for quiz elements
        const quizElementsAfterLogin = await page.locator('button:has-text("Start Quiz"), .quiz-mode-selector').count();
        console.log('Quiz elements after login:', quizElementsAfterLogin);
      }
    }
    
    // Try to click a quiz button if available
    const quizButton = page.locator('button:has-text("Start Quiz")').first();
    if (await quizButton.count() > 0) {
      console.log('🎯 Found Start Quiz button, clicking...');
      await quizButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'quiz-test-after-click.png' });
      
      // Check if quiz engine appeared
      const quizEngineElements = await page.locator('.quiz-engine, [data-testid="quiz-engine"], h1:has-text("Question")').count();
      console.log('Quiz engine elements:', quizEngineElements);
      
      // Check for errors
      const errorElements = await page.locator('.error, [role="alert"], .text-red').count();
      console.log('Error elements:', errorElements);
      
      if (errorElements > 0) {
        const errorText = await page.locator('.error, [role="alert"], .text-red').first().textContent();
        console.log('Error text:', errorText);
      }
    } else {
      console.log('❌ No Start Quiz button found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testQuizFlow();