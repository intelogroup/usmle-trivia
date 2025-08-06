import { chromium } from '@playwright/test';

async function completeQuizTest() {
  console.log('🎯 Starting complete quiz test...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Login and navigate to quiz
    await page.goto('http://localhost:5174/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
    await page.fill('input[type="password"]', 'Jimkali90#');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to quick quiz
    await page.goto('http://localhost:5174/quiz/quick');
    await page.waitForLoadState('networkidle');
    
    // Start the quiz
    await page.click('button:has-text("Start Quiz")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('🚀 Quiz started!');
    await page.screenshot({ path: './quiz-question-1.png', fullPage: true });
    
    // Try to answer questions
    for (let questionNum = 1; questionNum <= 3; questionNum++) {
      console.log(`📝 Answering question ${questionNum}...`);
      
      // Look for answer options
      const radioButtons = await page.locator('input[type="radio"]').count();
      const answerOptions = await page.locator('.answer-option, [data-testid="answer"]').count();
      
      console.log(`   Radio buttons: ${radioButtons}, Answer options: ${answerOptions}`);
      
      if (radioButtons > 0) {
        // Click first answer option
        await page.locator('input[type="radio"]').first().click();
        await page.waitForTimeout(1000);
        console.log('   ✅ Answer selected');
        
        // Look for submit/next button
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Next"), button[type="submit"]').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          console.log('   ✅ Answer submitted');
          
          await page.screenshot({ path: `./quiz-after-question-${questionNum}.png`, fullPage: true });
          
          // Check if explanation is shown
          const hasExplanation = await page.locator('text=/explanation|correct|incorrect/i').count() > 0;
          console.log(`   📖 Explanation visible: ${hasExplanation}`);
          
        } else {
          console.log('   ⚠️ No submit button found');
          break;
        }
      } else if (answerOptions > 0) {
        // Try clicking answer option directly
        await page.locator('.answer-option, [data-testid="answer"]').first().click();
        await page.waitForTimeout(1000);
        console.log('   ✅ Answer option clicked');
      } else {
        console.log('   ❌ No answer options found');
        break;
      }
      
      // Check if quiz is complete
      const isComplete = await page.locator('text=/quiz complete|results|score/i').count() > 0;
      if (isComplete) {
        console.log('🎉 Quiz completed!');
        break;
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: './quiz-final-state.png', fullPage: true });
    console.log('📸 Final quiz state captured');
    
    // Check current URL and page content
    console.log(`🌐 Final URL: ${page.url()}`);
    const pageText = await page.textContent('body');
    const hasResults = pageText.includes('results') || pageText.includes('score') || pageText.includes('correct');
    console.log(`📊 Results page visible: ${hasResults}`);
    
  } catch (error) {
    console.error('❌ Quiz test error:', error.message);
  } finally {
    await browser.close();
  }
}

completeQuizTest();