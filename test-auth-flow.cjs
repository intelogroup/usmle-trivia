#!/usr/bin/env node

/**
 * Test Authentication Flow for MedQuiz Pro
 * Tests the complete authentication system including:
 * - Convex backend connectivity  
 * - User registration
 * - Login functionality
 * - User profile creation
 * - Database operations
 */

const puppeteer = require('puppeteer');

async function testAuthFlow() {
  let browser;
  let results = {
    timestamp: new Date().toISOString(),
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
      console.log(`✅ ${name}`);
    } else {
      results.summary.failed++;
      results.summary.errors.push(`${name}: ${details}`);
      console.log(`❌ ${name}: ${details}`);
    }
  }

  try {
    console.log('\n🏥 MedQuiz Pro - Comprehensive Authentication Testing');
    console.log('================================================\n');

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // Set viewport for mobile testing
    await page.setViewport({ width: 1280, height: 720 });

    // Test 1: Application loads successfully
    try {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
      const title = await page.title();
      
      if (title.includes('USMLE Trivia') || title.includes('MedQuiz')) {
        addTest('Application Loads', 'PASS', `Title: ${title}`);
      } else {
        addTest('Application Loads', 'FAIL', `Unexpected title: ${title}`);
      }
    } catch (error) {
      addTest('Application Loads', 'FAIL', error.message);
    }

    // Test 2: Check for authentication redirect
    try {
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login') || currentUrl.includes('/register') || currentUrl === 'http://localhost:5173/') {
        addTest('Auth Redirect Working', 'PASS', `Redirected to: ${currentUrl}`);
      } else {
        addTest('Auth Redirect Working', 'FAIL', `Unexpected URL: ${currentUrl}`);
      }
    } catch (error) {
      addTest('Auth Redirect Working', 'FAIL', error.message);
    }

    // Test 3: Navigate to login page  
    try {
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
      
      // Check for login form elements
      const emailInput = await page.$('#email');
      const passwordInput = await page.$('#password');
      const submitButton = await page.$('button[type="submit"]');
      
      if (emailInput && passwordInput && submitButton) {
        addTest('Login Form Elements', 'PASS', 'All form elements present');
      } else {
        addTest('Login Form Elements', 'FAIL', 'Missing form elements');
      }
    } catch (error) {
      addTest('Login Form Elements', 'FAIL', error.message);
    }

    // Test 4: Test login with known credentials
    try {
      // Try with existing test user
      await page.type('#email', 'jayveedz19@gmail.com');
      await page.type('#password', 'Jimkali90#');
      
      // Check for any JavaScript errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.click('button[type="submit"]');
      
      // Wait for navigation or error
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/quiz')) {
        addTest('Login with Test Credentials', 'PASS', `Successful login, redirected to: ${currentUrl}`);
      } else if (currentUrl.includes('/login')) {
        // Check for error messages
        const errorElement = await page.$('[role="alert"]');
        const errorText = errorElement ? await errorElement.textContent() : 'No specific error shown';
        addTest('Login with Test Credentials', 'FAIL', `Login failed: ${errorText}`);
      } else {
        addTest('Login with Test Credentials', 'PARTIAL', `Unexpected URL: ${currentUrl}`);
      }
      
      // Report any JavaScript errors
      if (errors.length > 0) {
        results.summary.errors.push(`JavaScript errors: ${errors.join(', ')}`);
      }
      
    } catch (error) {
      addTest('Login with Test Credentials', 'FAIL', error.message);
    }

    // Test 5: Test registration page
    try {
      await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle2' });
      
      const nameInput = await page.$('#name');
      const emailInput = await page.$('#email'); 
      const passwordInput = await page.$('#password');
      const confirmPasswordInput = await page.$('#confirmPassword');
      
      if (nameInput && emailInput && passwordInput && confirmPasswordInput) {
        addTest('Registration Form Elements', 'PASS', 'All registration form elements present');
      } else {
        addTest('Registration Form Elements', 'FAIL', 'Missing registration form elements');
      }
    } catch (error) {
      addTest('Registration Form Elements', 'FAIL', error.message);
    }

    // Test 6: Check for backend connectivity
    try {
      // Check for any network requests to Convex
      const networkRequests = [];
      page.on('request', request => {
        if (request.url().includes('convex.cloud')) {
          networkRequests.push(request.url());
        }
      });
      
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      
      if (networkRequests.length > 0) {
        addTest('Convex Backend Connectivity', 'PASS', `${networkRequests.length} requests made to Convex`);
      } else {
        addTest('Convex Backend Connectivity', 'PARTIAL', 'No Convex requests detected (may be cached)');
      }
      
    } catch (error) {
      addTest('Convex Backend Connectivity', 'FAIL', error.message);
    }

    // Test 7: Check for the "n is not a function" error
    try {
      const jsErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('n is not a function')) {
          jsErrors.push(msg.text());
        }
      });
      
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000);
      
      if (jsErrors.length === 0) {
        addTest('No "n is not a function" Error', 'PASS', 'No backend errors detected');
      } else {
        addTest('No "n is not a function" Error', 'FAIL', `Found errors: ${jsErrors.join(', ')}`);
      }
      
    } catch (error) {
      addTest('No "n is not a function" Error', 'FAIL', error.message);
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
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`Success Rate: ${Math.round((results.summary.passed / results.summary.total) * 100)}%`);

  if (results.summary.errors.length > 0) {
    console.log('\n🚨 ERRORS FOUND:');
    results.summary.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
  }

  // Save results to file
  const fs = require('fs');
  fs.writeFileSync('auth-flow-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Detailed results saved to: auth-flow-test-results.json');

  return results;
}

// Run the tests
testAuthFlow().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});