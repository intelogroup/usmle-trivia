const { chromium } = require('playwright');

async function testManualBrowserAuth() {
  console.log('🌐 Manual Browser Authentication Test');
  console.log('=====================================\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to production site
    console.log('📍 Navigating to production site...');
    await page.goto('https://usmle-trivia.netlify.app');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: 'manual-browser-01-homepage.png', fullPage: true });
    console.log('✅ Homepage loaded successfully');

    // Navigate to registration
    console.log('\n📝 Testing registration flow...');
    
    // Try multiple ways to find the registration link
    const registrationSelectors = [
      'a[href*="register"]',
      'a[href*="signup"]', 
      'button:has-text("Sign Up")',
      'a:has-text("Sign Up")',
      'a:has-text("Register")',
      'a:has-text("Create Account")',
      'text=Sign up'
    ];

    let registrationFound = false;
    for (const selector of registrationSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ Found registration element: ${selector}`);
        await element.click();
        registrationFound = true;
        break;
      }
    }

    if (!registrationFound) {
      console.log('⚠️  No registration link found, trying direct navigation');
      await page.goto('https://usmle-trivia.netlify.app/register');
    }

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'manual-browser-02-registration.png', fullPage: true });

    // Wait for user interaction
    console.log('\n⏳ MANUAL TEST PHASE');
    console.log('   The browser window is now open for manual testing.');
    console.log('   Please manually:');
    console.log('   1. Try to register a new user');
    console.log('   2. Try to login with existing credentials');
    console.log('   3. Observe any error messages in the browser console');
    console.log('   4. Check Network tab for failed requests');
    console.log('');
    console.log('   Press Ctrl+C in this terminal when finished testing.');

    // Keep the browser open for manual testing
    await new Promise(() => {}); // Wait indefinitely

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'manual-browser-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Check if we need to install browsers
async function checkBrowsers() {
  try {
    await chromium.launch({ headless: true });
    return true;
  } catch (error) {
    if (error.message.includes('chromium')) {
      console.log('📦 Installing browser...');
      const { execSync } = require('child_process');
      execSync('npx playwright install chromium', { stdio: 'inherit' });
      return true;
    }
    throw error;
  }
}

// Run the test
async function main() {
  try {
    await checkBrowsers();
    await testManualBrowserAuth();
  } catch (error) {
    console.error('❌ Failed to run manual browser test:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}