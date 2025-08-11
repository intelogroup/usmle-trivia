#!/usr/bin/env node

/**
 * Test User Registration for MedQuiz Pro
 * Test if we can create a new user account
 */

const puppeteer = require('puppeteer');

async function testRegistration() {
  console.log('🏥 MedQuiz Pro - User Registration Test');
  console.log('=======================================\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // Track errors and requests
    const errors = [];
    const convexRequests = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ JS Error: ${msg.text()}`);
      }
    });
    
    page.on('request', request => {
      if (request.url().includes('convex.cloud')) {
        convexRequests.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`🔗 Convex Request: ${request.method()} ${request.url()}`);
      }
    });

    console.log('1. Navigating to registration page...');
    await page.goto('https://usmle-trivia.netlify.app/register', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await page.screenshot({ path: 'test-registration-01-page.png' });
    console.log(`✅ Registration page loaded: ${page.url()}`);

    console.log('\n2. Checking registration form...');
    const formCheck = await page.evaluate(() => {
      const name = document.querySelector('#name') || document.querySelector('input[name="name"]');
      const email = document.querySelector('#email') || document.querySelector('input[type="email"]');
      const password = document.querySelector('#password') || document.querySelector('input[type="password"]');
      const confirmPassword = document.querySelector('#confirmPassword') || document.querySelector('input[name="confirmPassword"]');
      const submit = document.querySelector('button[type="submit"]');
      
      return {
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasConfirmPassword: !!confirmPassword,
        hasSubmit: !!submit,
        submitText: submit?.textContent?.trim() || 'No button found',
        pageContent: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log(`   Name field: ${formCheck.hasName ? '✅' : '❌'}`);
    console.log(`   Email field: ${formCheck.hasEmail ? '✅' : '❌'}`);
    console.log(`   Password field: ${formCheck.hasPassword ? '✅' : '❌'}`);
    console.log(`   Confirm Password field: ${formCheck.hasConfirmPassword ? '✅' : '❌'}`);
    console.log(`   Submit button: ${formCheck.hasSubmit ? '✅' : '❌'} "${formCheck.submitText}"`);

    if (formCheck.hasEmail && formCheck.hasPassword && formCheck.hasSubmit) {
      console.log('\n3. Testing registration with new test user...');
      
      const testEmail = `test.medstudent.${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      const testName = 'Test Medical Student';
      
      // Fill out registration form
      if (formCheck.hasName) {
        await page.type('#name', testName);
        console.log(`   ✅ Name entered: ${testName}`);
      }
      
      await page.type('#email', testEmail);
      console.log(`   ✅ Email entered: ${testEmail}`);
      
      await page.type('#password', testPassword);
      console.log(`   ✅ Password entered: [hidden]`);
      
      if (formCheck.hasConfirmPassword) {
        await page.type('#confirmPassword', testPassword);
        console.log(`   ✅ Confirm password entered`);
      }
      
      await page.screenshot({ path: 'test-registration-02-filled.png' });
      
      // Submit form
      console.log('\n   Submitting registration form...');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 7000));
      
      const afterRegistration = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        hasErrorMessage: !!document.querySelector('[role="alert"]'),
        errorText: document.querySelector('[role="alert"]')?.textContent || 'No error',
        hasSuccessMessage: document.body.innerText.toLowerCase().includes('success'),
        pageContent: document.body.innerText.substring(0, 400)
      }));
      
      await page.screenshot({ path: 'test-registration-03-after-submit.png' });
      
      console.log(`   After submit URL: ${afterRegistration.url}`);
      console.log(`   Page title: ${afterRegistration.title}`);
      console.log(`   Has error: ${afterRegistration.hasErrorMessage ? '❌' : '✅'}`);
      console.log(`   Has success: ${afterRegistration.hasSuccessMessage ? '✅' : '❌'}`);
      
      if (afterRegistration.hasErrorMessage) {
        console.log(`   Error message: ${afterRegistration.errorText}`);
      }
      
      // Analyze result
      if (afterRegistration.url.includes('/dashboard') || afterRegistration.url.includes('/login')) {
        console.log('✅ REGISTRATION SUCCESS - Redirected appropriately');
        
        // If redirected to login, try logging in with the new user
        if (afterRegistration.url.includes('/login')) {
          console.log('\n4. Testing login with newly registered user...');
          
          await page.type('#email', testEmail);
          await page.type('#password', testPassword);
          await page.click('button[type="submit"]');
          
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const loginResult = await page.evaluate(() => ({
            url: window.location.href,
            hasError: !!document.querySelector('[role="alert"]'),
            errorText: document.querySelector('[role="alert"]')?.textContent || 'No error'
          }));
          
          await page.screenshot({ path: 'test-registration-04-after-login.png' });
          
          if (loginResult.url.includes('/dashboard')) {
            console.log('✅ LOGIN WITH NEW USER SUCCESS');
          } else {
            console.log(`❌ LOGIN WITH NEW USER FAILED: ${loginResult.errorText}`);
          }
        }
        
      } else if (afterRegistration.url.includes('/register')) {
        console.log('❌ REGISTRATION FAILED - Remained on registration page');
      } else {
        console.log(`⚠️  UNKNOWN STATE - Redirected to: ${afterRegistration.url}`);
      }
      
      return { testEmail, testPassword, success: !afterRegistration.hasErrorMessage };
      
    } else {
      console.log('❌ Cannot test registration - form elements missing');
      return { success: false, reason: 'Form elements missing' };
    }

  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testRegistration().then(result => {
  console.log('\n🎯 Registration test completed');
  console.log('📄 Screenshots saved:');
  console.log('   - test-registration-01-page.png');
  console.log('   - test-registration-02-filled.png');  
  console.log('   - test-registration-03-after-submit.png');
  if (result.testEmail) {
    console.log(`\n📧 Test credentials created:`);
    console.log(`   Email: ${result.testEmail}`);
    console.log(`   Password: ${result.testPassword}`);
  }
}).catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});