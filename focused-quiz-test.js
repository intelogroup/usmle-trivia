import { chromium } from '@playwright/test';

async function testQuizFunctionality() {
  console.log('🎯 Starting focused quiz functionality test...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. Go to main page and login
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    
    // Check if already logged in
    const isLoggedIn = await page.locator('text=Jay veedz').count() > 0;
    
    if (!isLoggedIn) {
      // Navigate to login
      await page.goto('http://localhost:5174/login');
      await page.waitForLoadState('networkidle');
      
      // Login
      await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    }
    
    // 2. Take screenshot of current page
    await page.screenshot({ path: './quiz-test-current-page.png', fullPage: true });
    console.log('📸 Current page screenshot saved');
    
    // 3. Try to find and click quiz buttons
    const quizButtons = [
      'text="Quick Quiz"',
      'text="Timed Challenge"', 
      'text="Custom Practice"',
      '[data-testid="quick-quiz"]',
      'button:has-text("Start")',
      'button:has-text("Quick")',
      'a[href*="quiz"]'
    ];
    
    console.log('🔍 Looking for quiz buttons...');
    
    for (const selector of quizButtons) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`✅ Found quiz button: ${selector} (count: ${count})`);
          
          // Click the button
          await page.locator(selector).first().click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          
          // Check what happened
          const currentUrl = page.url();
          console.log(`🌐 Current URL after click: ${currentUrl}`);
          
          // Take screenshot
          await page.screenshot({ path: './quiz-test-after-click.png', fullPage: true });
          console.log('📸 After quiz button click screenshot saved');
          
          // Look for quiz content
          const hasQuestion = await page.locator('text=/question/i').count() > 0;
          const hasAnswers = await page.locator('input[type="radio"]').count() > 0;
          const hasQuizContent = await page.locator('text=/quiz/i').count() > 0;
          
          console.log(`🎯 Quiz content check: Question=${hasQuestion}, Answers=${hasAnswers}, QuizContent=${hasQuizContent}`);
          
          break;
        }
      } catch (error) {
        console.log(`❌ Error with selector ${selector}: ${error.message}`);
      }
    }
    
    // 4. Check page content
    const pageContent = await page.content();
    const hasQuizMentions = (pageContent.match(/quiz/gi) || []).length;
    console.log(`📄 Page mentions "quiz" ${hasQuizMentions} times`);
    
    // 5. Look for navigation to quiz pages
    const links = await page.locator('a').all();
    console.log(`🔗 Found ${links.length} links on page`);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      try {
        const href = await links[i].getAttribute('href');
        const text = await links[i].textContent();
        if (href && (href.includes('quiz') || text?.toLowerCase().includes('quiz'))) {
          console.log(`🎯 Quiz-related link: ${text} -> ${href}`);
        }
      } catch (error) {
        // Skip links that can't be accessed
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testQuizFunctionality();