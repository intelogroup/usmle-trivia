import { chromium } from 'playwright';

async function testCompleteQuizSession() {
  console.log('🔍 Testing complete quiz session flow...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    if (msg.text().includes('Quiz') || msg.text().includes('Session') || msg.text().includes('Question') || msg.text().includes('ERROR') || msg.text().includes('Failed')) {
      console.log(`CONSOLE (${msg.type()}):`, msg.text());
    }
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.log('🚨 PAGE ERROR:', error.message);
  });
  
  try {
    // 1. Login
    console.log('🔐 Step 1: Logging in...');
    await page.goto('http://localhost:5177/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Successfully logged in and navigated to dashboard');
    
    // 2. Click quiz mode
    console.log('🎯 Step 2: Clicking Quick Quiz...');
    const quickQuizButton = page.locator('button:has-text("Start Quiz")').first();
    await quickQuizButton.click();
    await page.waitForURL('**/quiz/quick');
    console.log('✅ Successfully navigated to quiz setup page');
    
    await page.screenshot({ path: 'complete-quiz-01-setup.png' });
    
    // 3. Start the actual quiz
    console.log('🚀 Step 3: Starting the quiz session...');
    const startQuizButton = page.locator('button:has-text("Start Quiz")');
    if (await startQuizButton.count() > 0) {
      await startQuizButton.click();
      await page.waitForTimeout(5000); // Wait for quiz to load
      
      console.log('Current URL after starting quiz:', page.url());
      await page.screenshot({ path: 'complete-quiz-02-started.png' });
      
      // Check for quiz session elements
      const questionElements = await page.locator('h1:has-text("Question"), .quiz-question').count();
      const answerOptions = await page.locator('[role="button"]:has-text("A)"), [role="button"]:has-text("B)"), button:has-text("A)"), button:has-text("B)")').count();
      const progressElements = await page.locator('.progress, [class*="progress"]').count();
      
      console.log('Question elements found:', questionElements);
      console.log('Answer option elements found:', answerOptions);
      console.log('Progress elements found:', progressElements);
      
      // Look for any quiz content
      const pageText = await page.textContent('body');
      const hasQuestionText = pageText.includes('Question') || pageText.includes('patient') || pageText.includes('presents');
      const hasAnswerChoices = pageText.includes('A)') || pageText.includes('B)') || pageText.includes('C)');
      
      console.log('Page has question text:', hasQuestionText);
      console.log('Page has answer choices:', hasAnswerChoices);
      
      if (hasQuestionText && hasAnswerChoices) {
        console.log('🎉 SUCCESS: Quiz session is active with questions and answers!');
        
        // Try to answer a question if possible
        const answerButton = page.locator('button:has-text("A)"), button:has-text("B)"), [class*="option"]:has-text("A)"), [class*="option"]:has-text("B)")').first();
        if (await answerButton.count() > 0) {
          console.log('📝 Attempting to answer first question...');
          await answerButton.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'complete-quiz-03-answered.png' });
          
          // Check for explanation or next button
          const explanationText = await page.locator('*:has-text("Explanation"), *:has-text("explanation")').count();
          const nextButton = await page.locator('button:has-text("Next"), button:has-text("Continue")').count();
          
          console.log('Explanation elements:', explanationText);
          console.log('Next/Continue buttons:', nextButton);
          
          if (explanationText > 0 || nextButton > 0) {
            console.log('🎉 EXCELLENT: Answer feedback system is working!');
          }
        }
      } else {
        console.log('❌ Quiz session did not start properly - no question content found');
        
        // Check for error messages
        const errorElements = await page.locator('.error, [role="alert"], .text-red, *:has-text("error"), *:has-text("failed")').count();
        if (errorElements > 0) {
          const errorText = await page.locator('.error, [role="alert"], .text-red, *:has-text("error"), *:has-text("failed")').first().textContent();
          console.log('Error found on page:', errorText);
        }
      }
    } else {
      console.log('❌ No "Start Quiz" button found on quiz setup page');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCompleteQuizSession();