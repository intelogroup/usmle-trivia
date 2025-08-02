import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Take initial screenshot
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(2000); // Wait for app to load
    await page.screenshot({ path: '/tmp/01-initial-state.png', fullPage: true });
    console.log('✅ Initial state screenshot captured');
    
    // Try to register a user
    console.log('🧪 Testing user registration...');
    
    // Look for auth/register elements
    await page.screenshot({ path: '/tmp/02-before-registration.png', fullPage: true });
    
    // Check if we need to navigate to register
    const registerButton = await page.locator('text="Register"').first();
    if (await registerButton.isVisible()) {
      await registerButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/03-registration-form.png', fullPage: true });
    }
    
    console.log('✅ Registration flow screenshots captured');
    console.log('📸 Screenshots saved to /tmp/ directory');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    await page.screenshot({ path: '/tmp/error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();