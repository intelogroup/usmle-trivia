import { chromium } from 'playwright';

async function captureRegistration() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Loading main application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of main dashboard
    await page.screenshot({ 
      path: '/root/repo/screenshot-dashboard.png', 
      fullPage: true 
    });
    console.log('📸 Dashboard screenshot saved: screenshot-dashboard.png');
    
    // Try to find and click login/registration links
    console.log('🔍 Looking for login/registration links...');
    
    // Look for login link first
    const loginLink = page.locator('a:has-text("Login"), button:has-text("Login")').first();
    if (await loginLink.isVisible()) {
      console.log('✅ Found login link, clicking...');
      await loginLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Take screenshot of login page
      await page.screenshot({ 
        path: '/root/repo/screenshot-login-page.png', 
        fullPage: true 
      });
      console.log('📸 Login page screenshot saved: screenshot-login-page.png');
      
      // Look for registration link on login page
      const registerSelectors = [
        'a:has-text("Register")',
        'a:has-text("Sign up")',
        'a:has-text("Create account")',
        'button:has-text("Register")',
        'button:has-text("Sign up")',
        '[href="/register"]',
        '.register-link',
        '.signup-link'
      ];
      
      let foundRegister = false;
      for (const selector of registerSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            console.log(`✅ Found registration link: ${selector}`);
            await element.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);
            
            // Take screenshot of registration page
            await page.screenshot({ 
              path: '/root/repo/screenshot-registration-page.png', 
              fullPage: true 
            });
            console.log('📸 Registration page screenshot saved: screenshot-registration-page.png');
            
            // Get registration page details
            const title = await page.title();
            const url = page.url();
            const forms = await page.locator('form').count();
            const inputs = await page.locator('input').count();
            
            console.log(`📋 Registration page details:`);
            console.log(`   Title: ${title}`);
            console.log(`   URL: ${url}`);
            console.log(`   Forms: ${forms}, Inputs: ${inputs}`);
            
            foundRegister = true;
            break;
          }
        } catch (err) {
          // Continue to next selector
        }
      }
      
      if (!foundRegister) {
        console.log('⚠️  No registration link found on login page');
        
        // Try direct navigation to registration
        console.log('🔍 Trying direct navigation to /register...');
        await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: '/root/repo/screenshot-direct-register.png', 
          fullPage: true 
        });
        console.log('📸 Direct register page screenshot saved: screenshot-direct-register.png');
      }
      
    } else {
      console.log('⚠️  No login link found, trying direct navigation to login...');
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: '/root/repo/screenshot-direct-login.png', 
        fullPage: true 
      });
      console.log('📸 Direct login page screenshot saved: screenshot-direct-login.png');
    }
    
  } catch (error) {
    console.error('❌ Error during navigation:', error.message);
  } finally {
    await browser.close();
  }
}

captureRegistration();