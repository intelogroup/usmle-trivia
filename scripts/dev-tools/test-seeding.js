import { chromium } from 'playwright';
import fs from 'fs';

async function testSeeding() {
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
    
    // Look for the dev tools button
    console.log('🛠️ Looking for dev tools button...');
    await page.waitForSelector('button:has-text("🛠️ Dev Tools")', { timeout: 10000 });
    
    // Click the dev tools button
    await page.click('button:has-text("🛠️ Dev Tools")');
    
    console.log('📸 Taking screenshot of dev tools opened...');
    await page.screenshot({ path: 'screenshots/02-dev-tools.png', fullPage: true });
    
    // Wait for the seeding button and click it
    console.log('🌱 Starting database seeding...');
    await page.waitForSelector('button:has-text("🌱 Seed Sample Questions")');
    await page.click('button:has-text("🌱 Seed Sample Questions")');
    
    // Wait for seeding to complete (look for success messages)
    console.log('⏳ Waiting for seeding to complete...');
    await page.waitForSelector('text=✅ Successfully seeded', { timeout: 30000 });
    
    // Wait a bit more to see final results
    await page.waitForTimeout(2000);
    
    console.log('📸 Taking screenshot of seeding results...');
    await page.screenshot({ path: 'screenshots/03-seeding-results.png', fullPage: true });
    
    // Extract the results text
    const results = await page.textContent('.bg-gray-50');
    console.log('\n🎯 Seeding Results:');
    console.log(results);
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding test:', error.message);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

testSeeding().catch(console.error);