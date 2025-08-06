const { chromium } = require('playwright');

async function manualLoginVerification() {
  console.log('🔐 Manual Login Verification: jayveedz19@gmail.com');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📱 Step 1: Navigate to login page');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'manual-login-01-page-loaded.png', fullPage: true });
    
    console.log('🔍 Step 2: Check page content');
    const pageTitle = await page.textContent('h1');
    console.log(`Page title: ${pageTitle}`);
    
    const pageText = await page.textContent('body');
    console.log(`Page contains "Welcome back": ${pageText.includes('Welcome back')}`);
    console.log(`Page contains "Sign in": ${pageText.includes('Sign in')}`);
    
    console.log('🔑 Step 3: Look for form elements with specific selectors');
    
    // Check for email input with ID
    const emailInput = await page.locator('#email');
    const emailExists = await emailInput.count() > 0;
    console.log(`Email input (#email) exists: ${emailExists}`);
    
    // Check for password input with ID
    const passwordInput = await page.locator('#password');
    const passwordExists = await passwordInput.count() > 0;
    console.log(`Password input (#password) exists: ${passwordExists}`);
    
    // Check for submit button
    const submitButton = await page.locator('button[type="submit"]');
    const submitExists = await submitButton.count() > 0;
    console.log(`Submit button exists: ${submitExists}`);
    
    if (emailExists && passwordExists && submitExists) {
      console.log('✅ All form elements found! Proceeding with login test...');
      
      console.log('📝 Step 4: Fill in credentials');
      await emailInput.fill('jayveedz19@gmail.com');
      await passwordInput.fill('Jimkali90#');
      
      // Verify values were entered
      const emailValue = await emailInput.inputValue();
      const passwordValue = await passwordInput.inputValue();
      
      console.log(`Email filled: ${emailValue === 'jayveedz19@gmail.com'}`);
      console.log(`Password filled: ${passwordValue === 'Jimkali90#'}`);
      
      await page.screenshot({ path: 'manual-login-02-credentials-filled.png', fullPage: true });
      
      console.log('🚀 Step 5: Submit form');
      await submitButton.click();
      
      console.log('⏳ Step 6: Wait for response (15 seconds)');
      await page.waitForTimeout(15000);
      
      const currentURL = page.url();
      console.log(`Current URL after submission: ${currentURL}`);
      
      await page.screenshot({ path: 'manual-login-03-after-submit.png', fullPage: true });
      
      if (currentURL.includes('/dashboard')) {
        console.log('🎉 SUCCESS! Redirected to dashboard');
        
        // Check for user-specific content
        const dashboardContent = await page.textContent('body');
        console.log(`Dashboard contains "Jay": ${dashboardContent.includes('Jay')}`);
        console.log(`Dashboard contains "Quiz": ${dashboardContent.includes('Quiz')}`);
        
        await page.screenshot({ path: 'manual-login-04-dashboard-success.png', fullPage: true });
        
        console.log('\n🏆 LOGIN VERIFICATION: SUCCESS ✅');
        console.log('🔐 User authentication is working correctly');
        console.log('🏠 Dashboard access is functional');
        console.log('👤 Real user credentials are valid');
        
      } else {
        console.log('❌ Login may have failed - not redirected to dashboard');
        
        // Check for error messages
        const bodyText = await page.textContent('body');
        if (bodyText.includes('Invalid') || bodyText.includes('error') || bodyText.includes('failed')) {
          console.log('🚨 Error message detected on page');
        }
        
        console.log('\n⚠️  LOGIN VERIFICATION: NEEDS INVESTIGATION');
      }
      
    } else {
      console.log('❌ Form elements not found');
      console.log(`Email input: ${emailExists}`);
      console.log(`Password input: ${passwordExists}`);
      console.log(`Submit button: ${submitExists}`);
      
      // Debug: print all input elements
      const allInputs = await page.locator('input').count();
      console.log(`Total input elements found: ${allInputs}`);
      
      const allButtons = await page.locator('button').count();
      console.log(`Total button elements found: ${allButtons}`);
      
      console.log('\n❌ LOGIN VERIFICATION: FORM ELEMENTS NOT FOUND');
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error);
    await page.screenshot({ path: 'manual-login-error.png', fullPage: true });
    console.log('\n💥 LOGIN VERIFICATION: CRITICAL ERROR');
  }

  await browser.close();
}

manualLoginVerification().catch(console.error);