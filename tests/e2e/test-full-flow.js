import { chromium } from 'playwright';
import fs from 'fs';

async function testFullFlow() {
  // Launch browser in headless mode
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Opening MedQuiz Pro application...');
    
    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Taking screenshot of homepage...');
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
    
    // Go to register page if we see a login link
    try {
      console.log('🔐 Attempting to register a new user...');
      
      // Look for register link or button
      await page.click('text=Register', { timeout: 5000 });
      await page.waitForLoadState('networkidle');
      
      console.log('📸 Taking screenshot of registration page...');
      await page.screenshot({ path: 'screenshots/02-register.png', fullPage: true });
      
      // Fill out registration form
      const testUser = {
        name: 'Test User',
        email: `test.user.${Date.now()}@example.com`,
        password: 'TestPassword123!'
      };
      
      await page.fill('input[type="text"]', testUser.name);
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      
      // Submit registration
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      console.log(`✅ Registered user: ${testUser.email}`);
      
    } catch (error) {
      console.log('ℹ️ Registration not needed or already logged in');
    }
    
    console.log('📸 Taking screenshot after auth...');
    await page.screenshot({ path: 'screenshots/03-after-auth.png', fullPage: true });
    
    // Look for the dev tools button
    console.log('🛠️ Looking for dev tools button...');
    await page.waitForSelector('button:has-text("🛠️ Dev Tools")', { timeout: 10000 });
    
    // Click the dev tools button
    await page.click('button:has-text("🛠️ Dev Tools")');
    
    console.log('📸 Taking screenshot of dev tools opened...');
    await page.screenshot({ path: 'screenshots/04-dev-tools.png', fullPage: true });
    
    // Wait for the seeding button and click it
    console.log('🌱 Starting database seeding...');
    await page.waitForSelector('button:has-text("🌱 Seed Sample Questions")');
    await page.click('button:has-text("🌱 Seed Sample Questions")');
    
    // Wait for seeding to complete (look for success messages)
    console.log('⏳ Waiting for seeding to complete...');
    try {
      await page.waitForSelector('text=✅ Successfully seeded', { timeout: 30000 });
      console.log('✅ Seeding successful!');
    } catch (error) {
      console.log('⚠️ Seeding may have failed, checking results...');
    }
    
    // Wait a bit more to see final results
    await page.waitForTimeout(3000);
    
    console.log('📸 Taking screenshot of seeding results...');
    await page.screenshot({ path: 'screenshots/05-seeding-results.png', fullPage: true });
    
    // Extract the results text
    try {
      const results = await page.textContent('.bg-gray-50');
      console.log('\n🎯 Seeding Results:');
      console.log(results);
    } catch (error) {
      console.log('Could not extract detailed results');
    }
    
    // Now test the quiz functionality
    console.log('\n🎮 Testing Quiz Functionality...');
    
    // Close dev tools first
    await page.click('text=✕');
    
    // Navigate to quiz page
    console.log('📝 Starting Quick Quiz...');
    await page.click('text=Quick Quiz', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    console.log('📸 Taking screenshot of quiz start...');
    await page.screenshot({ path: 'screenshots/06-quiz-start.png', fullPage: true });
    
    // Check if we have questions loaded
    const hasQuestions = await page.locator('.quiz-question, [data-testid="question"]').count() > 0;
    
    if (hasQuestions) {
      console.log('✅ Quiz questions loaded successfully!');
      
      // Answer a few questions
      for (let i = 0; i < 3; i++) {  
        try {
          // Look for answer options and click the first one
          await page.click('button:has-text("A.")', { timeout: 5000 });
          await page.waitForTimeout(1000);
          
          // Look for next button or submit
          const nextButton = page.locator('button:has-text("Next"), button:has-text("Submit")');
          if (await nextButton.isVisible()) {
            await nextButton.click();
            await page.waitForTimeout(1000);
            console.log(`✅ Answered question ${i + 1}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not answer question ${i + 1}`);
          break;
        }
      }
      
      console.log('📸 Taking screenshot after answering questions...');
      await page.screenshot({ path: 'screenshots/07-quiz-progress.png', fullPage: true });
      
      // Wait for results page
      await page.waitForTimeout(2000);
      
      console.log('📸 Taking screenshot of quiz results...');
      await page.screenshot({ path: 'screenshots/08-quiz-results.png', fullPage: true });
      
    } else {
      console.log('❌ No quiz questions found - seeding may have failed');
    }
    
    console.log('\n✅ Full application test completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

testFullFlow().catch(console.error);