import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('=== MEDQUIZ PRO AUTHENTICATION SECURITY TESTING ===');
  console.log('Starting comprehensive authentication testing...');
  
  try {
    // Navigate to the application
    console.log('1. Navigating to MedQuiz Pro application...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'auth_test_01_initial_landing.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot: Initial landing page captured');
    
    // Check if user is already logged in
    const isLoggedIn = await page.locator('[data-testid="user-menu"], .user-menu, [data-cy="user-menu"]').count() > 0;
    
    if (isLoggedIn) {
      console.log('User appears to be logged in, logging out first...');
      // Try to find and click logout
      const logoutButtons = [
        '[data-testid="logout"]',
        'button:has-text("Logout")',
        'button:has-text("Log out")',
        'button:has-text("Sign out")',
        '.logout',
        '[data-cy="logout"]'
      ];
      
      for (const selector of logoutButtons) {
        try {
          if (await page.locator(selector).count() > 0) {
            await page.click(selector);
            await page.waitForLoadState('networkidle');
            break;
          }
        } catch (e) {}
      }
    }
    
    // Look for login/register buttons or forms
    await page.screenshot({ 
      path: 'auth_test_02_pre_login_state.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot: Pre-login state captured');
    
    // Find login button or form
    const loginSelectors = [
      'button:has-text("Login")',
      'button:has-text("Log in")',
      'button:has-text("Sign in")',
      'a:has-text("Login")',
      'a:has-text("Log in")',
      'a:has-text("Sign in")',
      '[data-testid="login"]',
      '.login-button',
      '#login'
    ];
    
    let loginFound = false;
    for (const selector of loginSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Found login element: ${selector}`);
        await page.click(selector);
        await page.waitForLoadState('networkidle');
        loginFound = true;
        break;
      }
    }
    
    if (!loginFound) {
      // Check if we're already on a login page
      const emailInputs = await page.locator('input[type="email"], input[name="email"], #email').count();
      const passwordInputs = await page.locator('input[type="password"], input[name="password"], #password').count();
      
      if (emailInputs > 0 && passwordInputs > 0) {
        console.log('Already on login page');
        loginFound = true;
      }
    }
    
    if (!loginFound) {
      console.log('Login form not found, checking page content...');
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
      
      // Take screenshot of current state
      await page.screenshot({ 
        path: 'auth_test_03_login_search_failed.png', 
        fullPage: true 
      });
    }
    
    await page.screenshot({ 
      path: 'auth_test_04_login_page_reached.png', 
      fullPage: true 
    });
    console.log('✓ Screenshot: Login page state captured');
    
  } catch (error) {
    console.error('Error during initial navigation:', error);
    await page.screenshot({ 
      path: 'auth_test_error_initial.png', 
      fullPage: true 
    });
  }
  
  await browser.close();
  console.log('Initial navigation test completed');
})();