import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🎯 Testing MedQuiz Pro Quiz Engine');
    
    // Navigate to the app
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(3000);
    
    console.log('📊 Step 1: Navigate to Quick Quiz');
    await page.screenshot({ path: '/tmp/quiz-test-01-initial.png', fullPage: true });
    
    // Click on Quick Quiz in sidebar
    const quickQuizSidebar = page.locator('text="Quick Quiz"').first();
    if (await quickQuizSidebar.isVisible()) {
      await quickQuizSidebar.click();
      await page.waitForTimeout(2000);
      console.log('✅ Clicked Quick Quiz in sidebar');
    }
    
    await page.screenshot({ path: '/tmp/quiz-test-02-setup-page.png', fullPage: true });
    console.log('📸 Setup page screenshot taken');
    
    console.log('🚀 Step 2: Start the Quiz');
    
    // Look for and click the Start Quiz button
    const startQuizBtn = page.locator('text="Start Quiz"').first();
    
    if (await startQuizBtn.isVisible()) {
      console.log('✅ Found Start Quiz button, clicking...');
      await startQuizBtn.click();
      await page.waitForTimeout(3000); // Wait for quiz to load
      
      await page.screenshot({ path: '/tmp/quiz-test-03-after-start.png', fullPage: true });
      console.log('📸 After Start Quiz click screenshot taken');
      
      // Check if we're now in the quiz engine
      console.log('🔍 Step 3: Analyze Quiz Engine State');
      
      // Look for quiz engine elements
      const questionText = await page.locator('div, p, span').filter({ hasText: /A \d+-year-old|presents with|Which|What is/ }).count();
      const radioButtons = await page.locator('input[type="radio"]').count();
      const answerButtons = await page.locator('button').filter({ hasText: /^[A-D]\)/ }).count();
      const nextButton = await page.locator('text=/Next|Submit|Continue/').count();
      const backButton = await page.locator('text=/Back|Previous/').count();
      const timerElement = await page.locator('text=/\\d+:\\d+|Time|Timer/').count();
      const progressElement = await page.locator('text=/Question \\d+ of \\d+|Progress/').count();
      
      console.log('📊 Quiz Engine Analysis:');
      console.log(`   Questions: ${questionText > 0 ? '✅' : '❌'} (${questionText} found)`);
      console.log(`   Radio buttons: ${radioButtons > 0 ? '✅' : '❌'} (${radioButtons} found)`);
      console.log(`   Answer buttons: ${answerButtons > 0 ? '✅' : '❌'} (${answerButtons} found)`);
      console.log(`   Navigation: ${nextButton > 0 ? '✅' : '❌'} (${nextButton} next buttons)`);
      console.log(`   Back button: ${backButton > 0 ? '✅' : '❌'} (${backButton} found)`);
      console.log(`   Timer: ${timerElement > 0 ? '✅' : '❌'} (${timerElement} found)`);
      console.log(`   Progress: ${progressElement > 0 ? '✅' : '❌'} (${progressElement} found)`);
      
      // If we have interactive elements, try to interact
      if (radioButtons > 0 || answerButtons > 0) {
        console.log('🎮 Step 4: Test Quiz Interaction');
        
        let interacted = false;
        
        // Try radio buttons first
        if (radioButtons > 0) {
          console.log('🔘 Trying to select radio button...');
          const firstRadio = page.locator('input[type="radio"]').first();
          await firstRadio.click();
          await page.waitForTimeout(1000);
          interacted = true;
          console.log('✅ Selected radio button');
        } else if (answerButtons > 0) {
          console.log('🔘 Trying to click answer button...');
          const firstAnswer = page.locator('button').filter({ hasText: /^[A-D]\)/ }).first();
          await firstAnswer.click();
          await page.waitForTimeout(1000);
          interacted = true;
          console.log('✅ Clicked answer button');
        }
        
        await page.screenshot({ path: '/tmp/quiz-test-04-after-selection.png', fullPage: true });
        
        // Try to submit/continue
        if (interacted && nextButton > 0) {
          console.log('⏭️ Trying to continue to next question...');
          const continueBtn = page.locator('text=/Next|Submit|Continue/').first();
          await continueBtn.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: '/tmp/quiz-test-05-next-question.png', fullPage: true });
          console.log('✅ Attempted to go to next question');
          
          // Check if we moved to next question or results
          const newQuestionCount = await page.locator('div, p, span').filter({ hasText: /A \d+-year-old|presents with|Which|What is/ }).count();
          const resultsPage = await page.locator('text=/Results|Score|Completed|Congratulations/').count();
          
          if (resultsPage > 0) {
            console.log('🎉 Reached quiz results page!');
            await page.screenshot({ path: '/tmp/quiz-test-06-results.png', fullPage: true });
          } else if (newQuestionCount > 0) {
            console.log('➡️ Successfully moved to next question');
          } else {
            console.log('⚠️ Unclear state after clicking next');
          }
        }
      } else {
        console.log('❌ No interactive quiz elements found');
      }
      
    } else {
      console.log('❌ Start Quiz button not found');
      
      // Let's see what's actually on the page
      const pageContent = await page.textContent('body');
      console.log('📄 Page content preview:', pageContent.substring(0, 500) + '...');
    }
    
    // Final analysis
    await page.screenshot({ path: '/tmp/quiz-test-07-final-state.png', fullPage: true });
    
    console.log('\n🏆 Quiz Engine Test Complete!');
    console.log('📁 Screenshots saved to /tmp/quiz-test-*.png');
    
  } catch (error) {
    console.error('❌ Quiz test error:', error.message);
    await page.screenshot({ path: '/tmp/quiz-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();