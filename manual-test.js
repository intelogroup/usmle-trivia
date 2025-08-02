import { chromium } from 'playwright';
import fs from 'fs';

async function manualTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Add console logging
  page.on('console', msg => {
    console.log(`Browser console: ${msg.text()}`);
  });

  // Add error logging
  page.on('pageerror', err => {
    console.log(`Browser error: ${err.message}`);
  });

  try {
    console.log('🔍 Manual testing - opening app...');
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Homepage screenshot...');
    await page.screenshot({ path: 'screenshots/manual-01-home.png', fullPage: true });
    
    // Get current URL and title
    const url = page.url();
    const title = await page.title();
    console.log(`URL: ${url}`);
    console.log(`Title: ${title}`);
    
    // Check if page has content
    const bodyContent = await page.textContent('body');
    console.log(`Body content length: ${bodyContent?.length || 0}`);
    
    // Look for the Quick Quiz button
    const quickButton = await page.locator('text=Quick').count();
    console.log(`Quick Quiz buttons found: ${quickButton}`);
    
    if (quickButton > 0) {
      console.log('✅ Quick Quiz button found, clicking...');
      await page.click('text=Quick');
      await page.waitForLoadState('networkidle');
      
      console.log('📸 After clicking Quick Quiz...');
      await page.screenshot({ path: 'screenshots/manual-02-quick-quiz.png', fullPage: true });
    }
    
    // Check for Start Quiz button
    const startButton = await page.locator('button:has-text("Start Quiz")').count();
    console.log(`Start Quiz buttons found: ${startButton}`);
    
    if (startButton > 0) {
      console.log('✅ Start Quiz button found, clicking...');
      await page.click('button:has-text("Start Quiz")');
      
      // Wait and check multiple times
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(2000);
        console.log(`⏳ Waiting... ${i + 1}/5`);
        
        await page.screenshot({ path: `screenshots/manual-03-loading-${i + 1}.png`, fullPage: true });
        
        // Check for any content
        const hasQuestions = await page.locator('p').filter({ hasText: /year-old|patient/i }).count();
        const hasError = await page.locator('text=Quiz Error').count();
        const hasLoading = await page.locator('text=Loading').count();
        
        console.log(`Questions found: ${hasQuestions}, Errors: ${hasError}, Loading: ${hasLoading}`);
        
        if (hasQuestions > 0) {
          console.log('🎉 Questions loaded!');
          break;
        }
        
        if (hasError > 0) {
          console.log('❌ Error detected');
          const errorText = await page.textContent('[class*="text-muted-foreground"]');
          console.log(`Error: ${errorText}`);
          break;
        }
      }
    }
    
    console.log('📸 Final screenshot...');
    await page.screenshot({ path: 'screenshots/manual-04-final.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'screenshots/manual-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

manualTest().catch(console.error);