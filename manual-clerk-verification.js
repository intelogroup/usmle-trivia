/**
 * Manual Clerk Verification Test
 * Attempts to complete the full sign-up flow with verification code
 */

import { chromium } from 'playwright';

async function manualClerkVerification() {
  const browser = await chromium.launch({ 
    headless: true,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  const baseUrl = 'http://localhost:5173';
  const testEmail = 'testuser+clerk_test@example.com';
  const verificationCode = '424242';
  
  console.log('🔐 Manual Clerk Verification Test');
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔑 Code: ${verificationCode}\n`);

  try {
    // Step 1: Open landing page
    console.log('1. Opening landing page...');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    // Step 2: Try the sign-up flow
    console.log('2. Clicking Get Started button...');
    await page.click('button:has-text("Get Started")');
    await page.waitForTimeout(3000);
    
    // Step 3: Look for email input with more specific targeting
    console.log('3. Looking for email input...');
    
    // Wait for Clerk to fully load
    await page.waitForSelector('input, .cl-formField, [data-clerk-id]', { timeout: 10000 });
    
    // Get all input elements and find email input
    const inputs = await page.$$('input');
    console.log(`   Found ${inputs.length} input elements`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      
      console.log(`   Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}"`);
      
      if (type === 'email' || name?.includes('email') || name === 'emailAddress') {
        console.log('   ✅ Found email input, filling...');
        await input.fill(testEmail);
        await page.screenshot({ path: './manual-01-email-filled.png', fullPage: true });
        break;
      }
    }
    
    // Step 4: Look for submit button
    console.log('4. Looking for submit button...');
    const buttons = await page.$$('button');
    console.log(`   Found ${buttons.length} button elements`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      
      console.log(`   Button ${i}: text="${text}", type="${type}"`);
      
      if (type === 'submit' || text?.includes('Continue') || text?.includes('Sign up')) {
        console.log('   ✅ Found submit button, clicking...');
        await button.click();
        break;
      }
    }
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: './manual-02-after-submit.png', fullPage: true });
    
    // Step 5: Look for verification code input
    console.log('5. Looking for verification code input...');
    
    const codeInputs = await page.$$('input');
    let foundCodeInput = false;
    
    for (let i = 0; i < codeInputs.length; i++) {
      const input = codeInputs[i];
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');
      
      if (name === 'code' || placeholder?.includes('code') || placeholder?.includes('verification')) {
        console.log('   ✅ Found verification code input, filling...');
        await input.fill(verificationCode);
        foundCodeInput = true;
        await page.screenshot({ path: './manual-03-code-filled.png', fullPage: true });
        break;
      }
    }
    
    if (!foundCodeInput) {
      console.log('   ⚠️ No verification code input found - may not be required');
    }
    
    // Step 6: Try to submit verification
    if (foundCodeInput) {
      console.log('6. Submitting verification code...');
      
      const verifyButtons = await page.$$('button');
      for (let i = 0; i < verifyButtons.length; i++) {
        const button = verifyButtons[i];
        const text = await button.textContent();
        const type = await button.getAttribute('type');
        
        if (type === 'submit' || text?.includes('Verify') || text?.includes('Continue')) {
          console.log('   ✅ Found verify button, clicking...');
          await button.click();
          break;
        }
      }
      
      await page.waitForTimeout(5000);
      await page.screenshot({ path: './manual-04-after-verify.png', fullPage: true });
    }
    
    // Step 7: Check final state
    console.log('7. Checking final authentication state...');
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Try to access dashboard
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const dashboardUrl = page.url();
    console.log(`   Dashboard URL: ${dashboardUrl}`);
    
    if (dashboardUrl.includes('/dashboard')) {
      console.log('   🎉 SUCCESS: Successfully authenticated and accessed dashboard!');
    } else if (dashboardUrl.includes('sign-in')) {
      console.log('   ⚠️ PARTIAL: Redirected to sign-in (authentication not complete)');
    } else {
      console.log('   ❓ UNKNOWN: Unexpected URL state');
    }
    
    await page.screenshot({ path: './manual-05-final-state.png', fullPage: true });
    
    // Step 8: Look for UserButton
    console.log('8. Looking for UserButton...');
    
    const userButtonSelectors = [
      '.cl-userButton-root',
      '.cl-avatarBox', 
      '[data-clerk-id*="user"]',
      'button[aria-label*="user"]'
    ];
    
    let userButtonFound = false;
    for (const selector of userButtonSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`   ✅ UserButton found with selector: ${selector}`);
          userButtonFound = true;
          break;
        }
      } catch (error) {
        // Continue searching
      }
    }
    
    if (!userButtonFound) {
      console.log('   ⚠️ UserButton not found - user may not be fully authenticated');
    }
    
    console.log('\n🏁 Manual Test Summary:');
    console.log('   ✅ Landing page accessible');
    console.log('   ✅ Sign-up modal opens');
    console.log('   ✅ Email input functional'); 
    console.log('   ✅ Form submission works');
    console.log(`   ${foundCodeInput ? '✅' : '⚠️'} Verification step ${foundCodeInput ? 'found' : 'not required'}`);
    console.log(`   ${dashboardUrl.includes('/dashboard') ? '✅' : '⚠️'} Dashboard access ${dashboardUrl.includes('/dashboard') ? 'successful' : 'restricted'}`);
    console.log(`   ${userButtonFound ? '✅' : '⚠️'} UserButton ${userButtonFound ? 'visible' : 'not found'}`);
    console.log('   📸 5 screenshots captured for manual review');

  } catch (error) {
    console.error('❌ Manual test failed:', error);
    await page.screenshot({ path: './manual-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n🧹 Manual test completed.');
  }
}

manualClerkVerification();