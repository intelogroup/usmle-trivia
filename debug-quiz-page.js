import { chromium } from '@playwright/test';

async function debugQuizPage() {
  console.log('🔍 Debugging quiz page...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Login first
    await page.goto('http://localhost:5174/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in successfully');
    
    // Navigate to quick quiz
    await page.goto('http://localhost:5174/quiz/quick');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`🌐 Current URL: ${page.url()}`);
    
    // Take screenshot
    await page.screenshot({ path: './debug-quiz-page.png', fullPage: true });
    console.log('📸 Debug screenshot saved');
    
    // Check what buttons are actually on the page
    const allButtons = await page.locator('button').count();
    console.log(`🔘 Total buttons found: ${allButtons}`);
    
    for (let i = 0; i < allButtons; i++) {
      try {
        const buttonText = await page.locator('button').nth(i).textContent();
        const buttonVisible = await page.locator('button').nth(i).isVisible();
        console.log(`   Button ${i}: "${buttonText}" (visible: ${buttonVisible})`);
      } catch (error) {
        console.log(`   Button ${i}: Error reading - ${error.message}`);
      }
    }
    
    // Try different start button selectors
    const startSelectors = [
      'button:has-text("Start Quiz")',
      'button:has-text("Start")',
      '[data-testid="start-quiz"]',
      'button[type="submit"]',
      '.start-quiz',
      '.btn-primary'
    ];
    
    console.log('🔍 Checking start button selectors:');
    for (const selector of startSelectors) {
      const count = await page.locator(selector).count();
      const visible = count > 0 ? await page.locator(selector).first().isVisible() : false;
      console.log(`   ${selector}: count=${count}, visible=${visible}`);
      
      if (count > 0 && visible) {
        try {
          await page.locator(selector).first().click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          console.log(`✅ Successfully clicked: ${selector}`);
          
          // Check what happened
          const newUrl = page.url();
          console.log(`🌐 New URL after click: ${newUrl}`);
          
          await page.screenshot({ path: './after-start-click.png', fullPage: true });
          console.log('📸 After start click screenshot saved');
          
          break;
        } catch (error) {
          console.log(`❌ Failed to click ${selector}: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
  }
}

debugQuizPage();