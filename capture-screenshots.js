import { chromium } from 'playwright';

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the main page
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Wait for page to load completely
    await page.waitForTimeout(2000);
    
    // Capture main page screenshot
    await page.screenshot({ 
      path: '/root/repo/screenshot-main-page.png', 
      fullPage: true 
    });
    console.log('Main page screenshot saved: screenshot-main-page.png');

    // Try to find and click registration/signup elements
    try {
      // Look for common registration elements
      const signupSelectors = [
        'button:has-text("Sign Up")',
        'a:has-text("Sign Up")',
        'button:has-text("Register")',
        'a:has-text("Register")',
        '[data-testid="signup-button"]',
        '[data-testid="register-button"]',
        '.signup-button',
        '.register-button'
      ];

      let signupFound = false;
      for (const selector of signupSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            console.log(`Found signup element: ${selector}`);
            await element.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot of registration page
            await page.screenshot({ 
              path: '/root/repo/screenshot-registration-page.png', 
              fullPage: true 
            });
            console.log('Registration page screenshot saved: screenshot-registration-page.png');
            signupFound = true;
            break;
          }
        } catch (err) {
          // Continue to next selector
        }
      }

      if (!signupFound) {
        console.log('No visible signup/register button found. Checking page content...');
        
        // Check if there are any forms or input fields
        const forms = await page.locator('form').count();
        const inputs = await page.locator('input').count();
        const buttons = await page.locator('button').count();
        
        console.log(`Page elements found: ${forms} forms, ${inputs} inputs, ${buttons} buttons`);
        
        // Get page title and URL
        const title = await page.title();
        const url = page.url();
        console.log(`Page title: ${title}`);
        console.log(`Current URL: ${url}`);
        
        // Get text content to understand the page
        const bodyText = await page.locator('body').textContent();
        console.log(`Page text content (first 500 chars): ${bodyText.substring(0, 500)}...`);
      }

    } catch (error) {
      console.log('Error while looking for registration elements:', error.message);
    }

  } catch (error) {
    console.error('Error during screenshot capture:', error.message);
  } finally {
    await browser.close();
  }
}

captureScreenshots();