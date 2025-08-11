#!/usr/bin/env node

/**
 * Simple Authentication Test for MedQuiz Pro
 * Direct test of authentication flow and backend connectivity
 */

const puppeteer = require('puppeteer');

async function testAuthentication() {
  console.log('🏥 MedQuiz Pro - Authentication Flow Test');
  console.log('==========================================\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // Track JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ JS Error: ${msg.text()}`);
      }
    });
    
    // Track network requests
    const convexRequests = [];
    page.on('request', request => {
      if (request.url().includes('convex.cloud')) {
        convexRequests.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`🔗 Convex Request: ${request.method()} ${request.url()}`);
      }
    });

    console.log('1. Loading application...');
    await page.goto('https://usmle-trivia.netlify.app', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    const title = await page.title();
    console.log(`✅ Application loaded: "${title}"`);
    console.log(`   Current URL: ${page.url()}`);

    // Take screenshot of initial state
    await page.screenshot({ path: 'simple-auth-01-initial.png' });

    console.log('\n2. Checking login form...');
    
    // Check for form elements
    const formCheck = await page.evaluate(() => {
      const email = document.querySelector('#email') || document.querySelector('input[type="email"]');
      const password = document.querySelector('#password') || document.querySelector('input[type="password"]');
      const submit = document.querySelector('button[type="submit"]');
      
      return {
        hasEmailField: !!email,
        hasPasswordField: !!password,
        hasSubmitButton: !!submit,
        emailValue: email?.value || '',
        passwordValue: password?.value || '',
        submitText: submit?.textContent?.trim() || '',
        pageContent: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log(`   Email field: ${formCheck.hasEmailField ? '✅' : '❌'}`);
    console.log(`   Password field: ${formCheck.hasPasswordField ? '✅' : '❌'}`);
    console.log(`   Submit button: ${formCheck.hasSubmitButton ? '✅' : '❌'} "${formCheck.submitText}"`);

    if (formCheck.hasEmailField && formCheck.hasPasswordField) {
      console.log('\n3. Testing login with known credentials...');
      
      // Enter test credentials
      await page.type('#email', 'jayveedz19@gmail.com');
      await page.type('#password', 'Jimkali90#');
      
      await page.screenshot({ path: 'simple-auth-02-filled.png' });
      console.log('   ✅ Credentials entered');
      
      // Submit form
      console.log('   Submitting login form...');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const afterLogin = await page.evaluate(() => ({
        url: window.location.href,
        title: document.title,
        hasErrorMessage: !!document.querySelector('[role="alert"]'),
        errorText: document.querySelector('[role="alert"]')?.textContent || 'No error',
        pageContent: document.body.innerText.substring(0, 300)
      }));
      
      await page.screenshot({ path: 'simple-auth-03-after-submit.png' });
      
      console.log(`   After submit URL: ${afterLogin.url}`);
      console.log(`   Page title: ${afterLogin.title}`);
      console.log(`   Has error: ${afterLogin.hasErrorMessage ? '❌' : '✅'}`);
      if (afterLogin.hasErrorMessage) {
        console.log(`   Error message: ${afterLogin.errorText}`);
      }
      
      // Check if successfully logged in
      if (afterLogin.url.includes('/dashboard') || afterLogin.url.includes('/quiz')) {
        console.log('✅ LOGIN SUCCESS - Redirected to authenticated page');
      } else if (afterLogin.url.includes('/login')) {
        console.log('❌ LOGIN FAILED - Remained on login page');
      } else {
        console.log(`⚠️  UNKNOWN STATE - Redirected to: ${afterLogin.url}`);
      }
    } else {
      console.log('❌ Cannot test login - form elements missing');
    }

    console.log('\n4. Backend connectivity check...');
    console.log(`   Convex requests made: ${convexRequests.length}`);
    
    if (convexRequests.length > 0) {
      console.log('✅ Backend connectivity confirmed');
      convexRequests.forEach(req => {
        console.log(`     - ${req.method} ${req.url.split('/').pop()}`);
      });
    } else {
      console.log('⚠️  No Convex requests detected (may be cached or using different endpoint)');
    }

    console.log('\n5. Error analysis...');
    const relevantErrors = errors.filter(error => 
      error.includes('n is not a function') || 
      error.toLowerCase().includes('convex') ||
      error.toLowerCase().includes('auth') ||
      error.toLowerCase().includes('undefined') ||
      error.toLowerCase().includes('cannot read')
    );
    
    if (relevantErrors.length === 0) {
      console.log('✅ No critical JavaScript errors detected');
    } else {
      console.log(`❌ ${relevantErrors.length} relevant errors found:`);
      relevantErrors.forEach(error => {
        console.log(`     - ${error}`);
      });
    }

    console.log('\n📊 SUMMARY');
    console.log('===========');
    console.log(`Application Load: ✅`);
    console.log(`Form Elements: ${formCheck.hasEmailField && formCheck.hasPasswordField ? '✅' : '❌'}`);
    console.log(`Backend Requests: ${convexRequests.length > 0 ? '✅' : '⚠️ '}`);
    console.log(`Critical Errors: ${relevantErrors.length === 0 ? '✅' : '❌'}`);

    return {
      success: true,
      convexRequests: convexRequests.length,
      errors: relevantErrors,
      formWorking: formCheck.hasEmailField && formCheck.hasPasswordField
    };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testAuthentication().then(result => {
  console.log('\n🎯 Test completed');
  if (!result.success) {
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});