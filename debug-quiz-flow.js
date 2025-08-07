import { chromium } from 'playwright';

async function debugQuizFlow() {
  console.log('🔍 Starting quiz flow debugging...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 1000 
  });
  
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`🗨️ CONSOLE (${msg.type()}):`, msg.text());
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.log('🚨 PAGE ERROR:', error.message);
  });
  
  // Listen for network responses
  page.on('response', response => {
    if (response.url().includes('convex') || response.url().includes('api')) {
      console.log(`🌐 ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('📱 Navigating to localhost:5177');
    await page.goto('http://localhost:5177');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    console.log('📸 Taking initial screenshot');
    await page.screenshot({ path: 'debug-01-initial-page.png' });
    
    // Look for login/register buttons or dashboard content
    const hasAuthButtons = await page.locator('button:has-text("Login"), button:has-text("Sign In")').count() > 0;
    const hasDashboard = await page.locator('[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard")').count() > 0;
    
    if (hasAuthButtons) {
      console.log('🔐 Auth page detected, need to login first');
      
      // Try to find and click login button
      const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), a[href*="login"]').first();
      if (await loginButton.count() > 0) {
        await loginButton.click();
        await page.waitForTimeout(2000);
        
        // Fill login form with test credentials
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        
        if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
          console.log('📝 Filling login form');
          await emailInput.fill('jayveedz19@gmail.com');
          await passwordInput.fill('Jimkali90#');
          
          // Submit form
          const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
          await submitButton.click();
          
          // Wait for redirect
          await page.waitForTimeout(5000);
          console.log('📸 Taking post-login screenshot');
          await page.screenshot({ path: 'debug-02-after-login.png' });
        }
      }
    }
    
    // Look for quiz start buttons
    console.log('🔍 Looking for quiz start buttons');
    const quizButtons = await page.locator('button:has-text("Start Quiz"), .quiz-mode-selector, [data-testid*="quiz"]').count();
    console.log(`Found ${quizButtons} quiz-related elements`);
    
    if (quizButtons > 0) {
      console.log('🎯 Found quiz buttons, trying to click one');
      const firstQuizButton = page.locator('button:has-text("Start Quiz")').first();
      await firstQuizButton.click();
      
      console.log('⏳ Waiting for quiz to load');
      await page.waitForTimeout(5000);
      
      console.log('📸 Taking quiz-started screenshot');
      await page.screenshot({ path: 'debug-03-quiz-started.png' });
      
      // Check if we see quiz content
      const hasQuizEngine = await page.locator('.quiz-engine, [data-testid="quiz-engine"], .quiz-question').count() > 0;
      const hasError = await page.locator('.error, [role="alert"]').count() > 0;
      
      console.log(`Quiz engine visible: ${hasQuizEngine}`);
      console.log(`Errors visible: ${hasError}`);
      
      if (hasError) {
        const errorText = await page.locator('.error, [role="alert"]').first().textContent();
        console.log('🚨 Error found:', errorText);
      }
    }
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for manual inspection');
    console.log('Press Ctrl+C to close when done');
    
    // Wait indefinitely
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugQuizFlow();