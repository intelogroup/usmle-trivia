#!/usr/bin/env node

/**
 * Test Convex Auth API directly to diagnose the "n is not a function" error
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function testConvexAuthAPI() {
  console.log('🧪 Testing Convex Auth API Directly');
  console.log('🎯 Goal: Identify the "n is not a function" backend error');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: [],
    networkRequests: [],
    convexRequests: [],
    authErrors: []
  };

  // Capture all network activity
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    const method = response.request().method();
    
    results.networkRequests.push({
      method,
      url,
      status,
      headersCount: Object.keys(response.headers()).length
    });

    // Focus on Convex API requests
    if (url.includes('convex.cloud') || url.includes('convex')) {
      results.convexRequests.push({
        method,
        url,
        status,
        timestamp: new Date().toISOString()
      });

      console.log(`📡 Convex API: ${method} ${status} ${url}`);

      // Try to capture response body for error analysis
      if (status >= 400 || url.includes('auth') || url.includes('signIn')) {
        try {
          const responseText = await response.text();
          results.convexRequests[results.convexRequests.length - 1].responseBody = responseText;
          
          if (responseText.includes('n is not a function') || responseText.includes('TypeError') || status >= 400) {
            console.log(`❌ Auth API Error Response: ${responseText.substring(0, 200)}...`);
            results.authErrors.push({
              url,
              status,
              error: responseText.substring(0, 500)
            });
          }
        } catch (e) {
          console.log('Could not read response body:', e.message);
        }
      }
    }
  });

  // Capture console messages for backend errors
  page.on('console', msg => {
    const text = msg.text();
    
    if (msg.type() === 'error' || text.includes('error') || text.includes('Error') || text.includes('n is not a function')) {
      console.log(`🔍 Console ${msg.type()}: ${text}`);
      results.errors.push({
        type: msg.type(),
        message: text,
        timestamp: new Date().toISOString()
      });
    }

    // Look for specific Convex Auth errors
    if (text.includes('CONVEX') || text.includes('auth:signIn') || text.includes('Server Error')) {
      results.authErrors.push({
        type: 'console',
        message: text,
        timestamp: new Date().toISOString()
      });
    }
  });

  try {
    // Step 1: Load the site and inspect the Convex client initialization
    console.log('\n🏠 Step 1: Loading site and checking Convex client...');
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    results.tests.push('✅ Site loaded successfully');

    // Check if Convex client is properly initialized
    await page.evaluate(() => {
      console.log('window.convex:', typeof window.convex);
      console.log('Convex auth methods available:', Object.keys(window.convex || {}));
    });

    // Step 2: Navigate to login page and inspect auth setup
    console.log('\n🔐 Step 2: Testing login page auth setup...');
    await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if auth hooks are working
    const authStatus = await page.evaluate(() => {
      // Try to access auth state through React DevTools or global
      return {
        hasAuth: typeof window.useAuth !== 'undefined',
        hasConvexAuth: typeof window.useConvexAuth !== 'undefined',
        reactVersion: typeof window.React !== 'undefined' ? 'Available' : 'Not available'
      };
    });

    console.log('Auth status check:', authStatus);
    results.tests.push(`Auth hooks available: ${JSON.stringify(authStatus)}`);

    // Step 3: Test registration form submission to trigger the error
    console.log('\n📝 Step 3: Testing registration to trigger backend error...');
    await page.goto('https://usmle-trivia.netlify.app/register', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const emailInput = await page.locator('input[type="email"]');
    const passwordInputs = await page.locator('input[type="password"]');
    const nameInput = await page.locator('input[type="text"], input[placeholder*="name" i]');
    const submitButton = await page.locator('button[type="submit"]');

    if (await emailInput.count() > 0 && await passwordInputs.count() > 0) {
      console.log('🧪 Filling registration form...');
      await emailInput.fill('test_api_debug@test.com');
      
      if (await nameInput.count() > 0) {
        await nameInput.fill('API Test User');
      }
      
      await passwordInputs.first().fill('TestPassword123!');
      
      if (await passwordInputs.count() > 1) {
        await passwordInputs.nth(1).fill('TestPassword123!');
      }

      console.log('🚀 Submitting registration form...');
      await submitButton.click();
      
      // Wait for the response and any errors
      await page.waitForTimeout(5000);
      
      results.tests.push('✅ Registration form submitted');
    } else {
      results.tests.push('❌ Could not find registration form elements');
    }

    // Step 4: Test login form to trigger signin error
    console.log('\n🔑 Step 4: Testing login to trigger signin error...');
    await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const loginEmail = await page.locator('input[type="email"]');
    const loginPassword = await page.locator('input[type="password"]');
    const loginSubmit = await page.locator('button[type="submit"]');

    if (await loginEmail.count() > 0 && await loginPassword.count() > 0) {
      console.log('🧪 Filling login form...');
      await loginEmail.fill('jayveedz19@gmail.com');
      await loginPassword.fill('Jimkali90#');

      console.log('🚀 Submitting login form...');
      await loginSubmit.click();
      
      // Wait for the response and capture the specific error
      await page.waitForTimeout(5000);
      
      results.tests.push('✅ Login form submitted');
    } else {
      results.tests.push('❌ Could not find login form elements');
    }

    // Step 5: Check browser console for detailed error information
    console.log('\n🔍 Step 5: Checking for detailed error information...');
    
    const finalLogs = await page.evaluate(() => {
      // Try to get any stored errors or debug information
      return {
        userAgent: navigator.userAgent,
        url: window.location.href,
        lastError: window.lastError || null
      };
    });

    console.log('Final page state:', finalLogs);

  } catch (error) {
    console.error('❌ Test failed:', error);
    results.errors.push({
      type: 'test_exception',
      message: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();
  }

  // Save detailed results
  fs.writeFileSync('convex-auth-api-test-results.json', JSON.stringify(results, null, 2));

  // Analysis and reporting
  console.log('\n' + '='.repeat(60));
  console.log('🧪 CONVEX AUTH API TEST RESULTS');
  console.log('='.repeat(60));

  console.log('\n✅ Tests Completed:');
  results.tests.forEach(test => console.log(`  ${test}`));

  console.log('\n📡 Convex API Requests:');
  results.convexRequests.forEach(req => {
    console.log(`  ${req.method} ${req.status} ${req.url}`);
    if (req.responseBody) {
      console.log(`    Response: ${req.responseBody.substring(0, 100)}...`);
    }
  });

  console.log('\n🚨 Auth-Specific Errors:');
  results.authErrors.forEach(error => {
    console.log(`  ${error.type}: ${error.message || error.error}`);
  });

  console.log('\n🔍 General Errors:');
  results.errors.forEach(error => {
    console.log(`  ${error.type}: ${error.message}`);
  });

  console.log(`\n📁 Detailed results saved to: convex-auth-api-test-results.json`);

  // Provide specific recommendations based on errors found
  if (results.authErrors.length > 0) {
    console.log('\n💡 DIAGNOSIS:');
    console.log('🔍 Found auth-related errors. Likely causes:');
    
    const hasServerError = results.authErrors.some(e => e.message.includes('Server Error'));
    const hasTypeError = results.authErrors.some(e => e.message.includes('n is not a function'));
    
    if (hasServerError) {
      console.log('  1. Convex Auth backend deployment issue');
      console.log('  2. Auth configuration mismatch');
      console.log('  3. Database schema incompatibility');
    }
    
    if (hasTypeError) {
      console.log('  4. JavaScript dependency version conflict');
      console.log('  5. Missing or incorrect auth provider configuration');
      console.log('  6. Client-side auth library version mismatch');
    }
  }
}

if (require.main === module) {
  testConvexAuthAPI().catch(console.error);
}

module.exports = { testConvexAuthAPI };