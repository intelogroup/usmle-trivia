import { chromium } from 'playwright';

async function testSessionManagement() {
  console.log('🔍 Testing enhanced quiz session management...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for all console messages
  page.on('console', msg => {
    if (msg.text().includes('🎯') || msg.text().includes('Session') || msg.text().includes('Quiz') || msg.text().includes('ERROR')) {
      console.log(`BROWSER: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log('🚨 PAGE ERROR:', error.message);
  });
  
  try {
    console.log('📝 Step 1: Login and navigate to dashboard');
    await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Successfully logged in');
    
    console.log('🎯 Step 2: Start Quick Quiz session');
    const quickQuizButton = page.locator('button:has-text("Start Quiz")').first();
    await quickQuizButton.click();
    await page.waitForURL('**/quiz/quick');
    
    await page.screenshot({ path: 'session-test-01-quiz-setup.png' });
    
    console.log('🚀 Step 3: Start the quiz session');
    const startQuizButton = page.locator('button:has-text("Start Quiz")');
    await startQuizButton.click();
    await page.waitForTimeout(3000);
    
    console.log('Current URL after starting:', page.url());
    await page.screenshot({ path: 'session-test-02-quiz-active.png' });
    
    // Check if session is active
    const sessionIndicator = await page.locator('*:has-text("Quiz Active"), .session-indicator').count();
    console.log('Session status indicators found:', sessionIndicator);
    
    // Look for navigation controls
    const navigationControls = await page.locator('button:has-text("Previous"), button:has-text("Next"), .question-navigation').count();
    console.log('Navigation controls found:', navigationControls);
    
    // Check for question content
    const questionContent = await page.locator('h1:has-text("Question"), *:has-text("patient"), *:has-text("Which")').count();
    console.log('Question content elements:', questionContent);
    
    // Try to answer a question if possible
    const answerOptions = await page.locator('button[class*="option"], div[class*="option"]').count();
    console.log('Answer options found:', answerOptions);
    
    if (answerOptions > 0) {
      console.log('📝 Step 4: Attempting to answer question');
      const firstOption = page.locator('button[class*="option"], div[class*="option"]').first();
      await firstOption.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'session-test-03-question-answered.png' });
      
      // Check for navigation to next question
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.count() > 0) {
        console.log('➡️ Step 5: Navigating to next question');
        await nextButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'session-test-04-next-question.png' });
      }
    }
    
    // Test session abandonment by trying to navigate away
    console.log('🚪 Step 6: Testing session abandonment protection');
    
    // Click browser back button or try to navigate to dashboard
    page.on('dialog', dialog => {
      console.log('⚠️ Dialog appeared:', dialog.message());
      dialog.dismiss(); // Don't abandon the session
    });
    
    // Try to go back using navigation
    await page.goBack();
    await page.waitForTimeout(2000);
    
    console.log('Final URL after back navigation:', page.url());
    await page.screenshot({ path: 'session-test-05-final-state.png' });
    
    console.log('🎉 Session management test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'session-test-error.png' });
  } finally {
    await browser.close();
  }
}

testSessionManagement();