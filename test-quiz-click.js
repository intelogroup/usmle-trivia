import { chromium } from 'playwright';

async function testQuizClick() {
  console.log('🔍 Testing quiz button click...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`CONSOLE (${msg.type()}):`, msg.text());
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.log('🚨 PAGE ERROR:', error.message);
  });
  
  try {
    // Login first
    await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard navigation
    await page.waitForURL('**/dashboard');
    console.log('✅ Successfully navigated to dashboard');
    
    // Take screenshot of dashboard
    await page.screenshot({ path: 'quiz-click-01-dashboard.png' });
    
    // Look for quiz elements in different ways
    const quizButtons = await page.locator('button:has-text("Start Quiz")').count();
    console.log('Buttons with "Start Quiz" text:', quizButtons);
    
    const quickQuizElements = await page.locator('*:has-text("Quick Quiz")').count();
    console.log('Elements with "Quick Quiz" text:', quickQuizElements);
    
    const timedChallengeElements = await page.locator('*:has-text("Timed Challenge")').count();
    console.log('Elements with "Timed Challenge" text:', timedChallengeElements);
    
    const customPracticeElements = await page.locator('*:has-text("Custom Practice")').count();
    console.log('Elements with "Custom Practice" text:', customPracticeElements);
    
    // Look for clickable quiz cards
    const clickableQuizCards = await page.locator('[class*="quiz"], [class*="card"], .group').count();
    console.log('Potential clickable cards:', clickableQuizCards);
    
    // Try to click on Quick Quiz card/area
    const quickQuizCard = page.locator('*:has-text("Quick Quiz")').first();
    if (await quickQuizCard.count() > 0) {
      console.log('🎯 Found Quick Quiz element, attempting to click');
      
      // Check if it's clickable
      const isClickable = await quickQuizCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.cursor === 'pointer' || styles.pointerEvents !== 'none';
      });
      
      console.log('Quick Quiz element is clickable:', isClickable);
      
      await quickQuizCard.click();
      await page.waitForTimeout(3000);
      
      console.log('Current URL after click:', page.url());
      await page.screenshot({ path: 'quiz-click-02-after-click.png' });
      
      // Check for quiz engine or setup page
      const quizEngineElements = await page.locator('h1:has-text("Question"), .quiz-engine, h1:has-text("Quiz Setup")').count();
      console.log('Quiz engine elements after click:', quizEngineElements);
      
      // Check for any "Start Quiz" buttons on the quiz page
      const startQuizButtons = await page.locator('button:has-text("Start Quiz")').count();
      console.log('Start Quiz buttons on quiz page:', startQuizButtons);
      
      if (startQuizButtons > 0) {
        console.log('🚀 Found Start Quiz button, clicking it');
        await page.click('button:has-text("Start Quiz")');
        await page.waitForTimeout(3000);
        
        console.log('URL after Start Quiz button:', page.url());
        await page.screenshot({ path: 'quiz-click-03-quiz-started.png' });
        
        const questionElements = await page.locator('h1:has-text("Question"), .quiz-question').count();
        console.log('Question elements after starting quiz:', questionElements);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testQuizClick();