#!/usr/bin/env node

/**
 * Test Live Authentication Flow for MedQuiz Pro
 * Tests the deployed application at usmle-trivia.netlify.app
 */

const puppeteer = require('puppeteer');

async function testLiveAuthFlow() {
  let browser;
  let results = {
    timestamp: new Date().toISOString(),
    url: 'https://usmle-trivia.netlify.app',
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    }
  };

  function addTest(name, status, details = '') {
    const test = { name, status, details, timestamp: new Date().toISOString() };
    results.tests.push(test);
    results.summary.total++;
    
    if (status === 'PASS') {
      results.summary.passed++;
      console.log(`✅ ${name} ${details ? '- ' + details : ''}`);
    } else {
      results.summary.failed++;
      results.summary.errors.push(`${name}: ${details}`);
      console.log(`❌ ${name}: ${details}`);
    }
  }

  try {
    console.log('\n🏥 MedQuiz Pro - LIVE Authentication Testing');
    console.log('============================================\n');
    console.log('Testing URL: https://usmle-trivia.netlify.app\n');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Capture JavaScript errors
    const jsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    // Test 1: Application loads
    try {
      await page.goto('https://usmle-trivia.netlify.app', { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      const title = await page.title();
      addTest('Application Loads', 'PASS', `Title: "${title}"`);
      
      await page.screenshot({ path: 'live-test-homepage.png' });
      
    } catch (error) {
      addTest('Application Loads', 'FAIL', error.message);
    }

    // Test 2: Check current URL and page content
    try {
      await page.waitForSelector('body', { timeout: 10000 });
      const currentUrl = page.url();
      const bodyText = await page.evaluate(() => document.body.innerText);
      
      addTest('Page Content Check', 'PASS', `URL: ${currentUrl}, Content length: ${bodyText.length} chars`);
      
    } catch (error) {
      addTest('Page Content Check', 'FAIL', error.message);
    }

    // Test 3: Navigate to login page
    try {
      await page.goto('https://usmle-trivia.netlify.app/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for the page to stabilize
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'live-test-login.png' });
      
      // Check for form elements
      const formElements = await page.evaluate(() => {
        const email = document.querySelector('#email') || document.querySelector('input[type="email"]');
        const password = document.querySelector('#password') || document.querySelector('input[type="password"]');
        const submit = document.querySelector('button[type="submit"]') || document.querySelector('button');
        
        return {
          hasEmail: !!email,
          hasPassword: !!password,
          hasSubmit: !!submit,
          emailPlaceholder: email?.placeholder || 'none',
          submitText: submit?.textContent || 'none'
        };
      });
      
      if (formElements.hasEmail && formElements.hasPassword && formElements.hasSubmit) {
        addTest('Login Form Elements', 'PASS', 
          `Email: ${formElements.hasEmail}, Password: ${formElements.hasPassword}, Submit: "${formElements.submitText}"`);
      } else {
        addTest('Login Form Elements', 'FAIL', `Missing elements: ${JSON.stringify(formElements)}`);
      }
      
    } catch (error) {
      addTest('Login Form Elements', 'FAIL', error.message);
    }

    // Test 4: Test login attempt with known credentials
    try {
      // Clear any existing values
      await page.evaluate(() => {
        const email = document.querySelector('#email') || document.querySelector('input[type="email"]');
        const password = document.querySelector('#password') || document.querySelector('input[type="password"]');
        if (email) email.value = '';
        if (password) password.value = '';
      });

      // Enter test credentials
      const emailSelector = '#email';
      const passwordSelector = '#password';
      
      await page.type(emailSelector, 'jayveedz19@gmail.com');
      await page.type(passwordSelector, 'Jimkali90#');
      
      // Take screenshot before submit
      await page.screenshot({ path: 'live-test-before-login.png' });
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for navigation or response
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      await page.screenshot({ path: 'live-test-after-login.png' });
      
      // Check for success (dashboard) or error messages
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/quiz')) {
        addTest('Login with Test Credentials', 'PASS', `Redirected to: ${currentUrl}`);
      } else if (currentUrl.includes('/login')) {
        // Look for error messages
        const errorText = await page.evaluate(() => {
          const errorEl = document.querySelector('[role="alert"]') || 
                          document.querySelector('.error') ||
                          document.querySelector('[class*="error"]');
          return errorEl ? errorEl.textContent : 'No error message found';
        });
        addTest('Login with Test Credentials', 'FAIL', `Remained on login page. Error: ${errorText}`);
      } else {
        addTest('Login with Test Credentials', 'PARTIAL', `Unexpected redirect: ${currentUrl}`);
      }
      
    } catch (error) {
      addTest('Login with Test Credentials', 'FAIL', error.message);
    }

    // Test 5: Check for backend errors
    if (jsErrors.length > 0) {
      const relevantErrors = jsErrors.filter(error => 
        error.includes('n is not a function') || 
        error.includes('convex') ||
        error.includes('auth')
      );
      
      if (relevantErrors.length > 0) {
        addTest('Backend Error Check', 'FAIL', `JS Errors found: ${relevantErrors.join(', ')}`);
      } else {
        addTest('Backend Error Check', 'PASS', `${jsErrors.length} JS errors found but none backend-related`);
      }
    } else {
      addTest('Backend Error Check', 'PASS', 'No JavaScript errors detected');
    }

    // Test 6: Test registration page
    try {
      await page.goto('https://usmle-trivia.netlify.app/register', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'live-test-register.png' });
      
      const regFormElements = await page.evaluate(() => {
        const name = document.querySelector('#name') || document.querySelector('input[name="name"]');
        const email = document.querySelector('#email') || document.querySelector('input[type="email"]');
        const password = document.querySelector('#password') || document.querySelector('input[type="password"]');
        const confirmPassword = document.querySelector('#confirmPassword') || document.querySelector('input[name="confirmPassword"]');
        
        return {
          hasName: !!name,
          hasEmail: !!email,
          hasPassword: !!password,
          hasConfirmPassword: !!confirmPassword
        };
      });
      
      const hasRequiredFields = regFormElements.hasEmail && regFormElements.hasPassword;
      if (hasRequiredFields) {
        addTest('Registration Form', 'PASS', `Required fields present: ${JSON.stringify(regFormElements)}`);
      } else {
        addTest('Registration Form', 'FAIL', `Missing required fields: ${JSON.stringify(regFormElements)}`);
      }
      
    } catch (error) {
      addTest('Registration Form', 'FAIL', error.message);
    }

    // Test 7: Check Convex connectivity
    try {
      const networkRequests = [];
      page.on('request', request => {
        if (request.url().includes('convex.cloud')) {
          networkRequests.push({
            url: request.url(),
            method: request.method()
          });
        }
      });
      
      // Reload login page to trigger network requests
      await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);
      
      if (networkRequests.length > 0) {
        addTest('Convex Backend Connectivity', 'PASS', `${networkRequests.length} requests to Convex backend`);
      } else {
        addTest('Convex Backend Connectivity', 'PARTIAL', 'No Convex requests observed (may be cached)');
      }
      
    } catch (error) {
      addTest('Convex Backend Connectivity', 'FAIL', error.message);
    }

  } catch (error) {
    console.error('❌ Critical test failure:', error.message);
    results.summary.errors.push(`Critical failure: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print summary
  console.log('\n📊 LIVE TEST SUMMARY');
  console.log('====================');
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${Math.round((results.summary.passed / results.summary.total) * 100)}%`);

  if (results.summary.errors.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    results.summary.errors.forEach(error => {
      console.log(`   • ${error}`);
    });
  }

  if (jsErrors.length > 0) {
    console.log('\n🐛 JAVASCRIPT ERRORS DETECTED:');
    jsErrors.forEach(error => {
      console.log(`   • ${error}`);
    });
  }

  // Save results
  const fs = require('fs');
  fs.writeFileSync('live-auth-test-results.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('live-auth-js-errors.json', JSON.stringify(jsErrors, null, 2));
  
  console.log('\n📄 Results saved to:');
  console.log('   - live-auth-test-results.json');
  console.log('   - live-auth-js-errors.json');
  console.log('\n📸 Screenshots captured:');
  console.log('   - live-test-homepage.png');
  console.log('   - live-test-login.png');
  console.log('   - live-test-before-login.png');
  console.log('   - live-test-after-login.png');
  console.log('   - live-test-register.png');

  return results;
}

// Run the tests
testLiveAuthFlow().catch(error => {
  console.error('❌ Live test suite failed:', error);
  process.exit(1);
});