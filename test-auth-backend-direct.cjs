#!/usr/bin/env node

/**
 * Direct test of authentication backend by monitoring network requests
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function testAuthBackendDirect() {
  console.log('🔍 Direct Authentication Backend Test');
  console.log('🎯 Capturing actual Convex Auth API calls');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    apiCalls: [],
    errors: [],
    consoleMessages: []
  };

  // Capture ALL network requests, especially to convex.cloud
  page.on('request', request => {
    const url = request.url();
    if (url.includes('convex.cloud') || url.includes('api') || url.includes('auth')) {
      console.log(`🚀 Request: ${request.method()} ${url}`);
      results.apiCalls.push({
        type: 'request',
        method: request.method(),
        url,
        headers: request.headers(),
        postData: request.postData(),
        timestamp: new Date().toISOString()
      });
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('convex.cloud') || url.includes('api') || url.includes('auth')) {
      console.log(`📡 Response: ${response.status()} ${url}`);
      
      let responseBody = null;
      try {
        responseBody = await response.text();
      } catch (e) {
        responseBody = `Could not read response: ${e.message}`;
      }

      results.apiCalls.push({
        type: 'response',
        status: response.status(),
        url,
        responseBody,
        timestamp: new Date().toISOString()
      });

      // Check for errors in response
      if (response.status() >= 400 || (responseBody && responseBody.includes('error'))) {
        console.log(`❌ API Error: ${response.status()} - ${responseBody?.substring(0, 200)}`);
        results.errors.push({
          type: 'api_error',
          status: response.status(),
          url,
          error: responseBody?.substring(0, 500)
        });
      }
    }
  });

  // Capture ALL console messages
  page.on('console', msg => {
    const text = msg.text();
    console.log(`🔍 Console [${msg.type()}]: ${text}`);
    
    results.consoleMessages.push({
      type: msg.type(),
      message: text,
      timestamp: new Date().toISOString()
    });

    // Look for specific error patterns
    if (text.includes('n is not a function') || 
        text.includes('Server Error') || 
        text.includes('CONVEX') ||
        text.includes('auth:signIn') ||
        text.includes('TypeError')) {
      
      results.errors.push({
        type: 'console_error',
        message: text,
        timestamp: new Date().toISOString()
      });
    }
  });

  try {
    console.log('\n🏠 Loading homepage...');
    await page.goto('https://usmle-trivia.netlify.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('\n🔐 Navigate to login page...');
    await page.goto('https://usmle-trivia.netlify.app/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait a bit for any async loading
    await page.waitForTimeout(2000);

    console.log('\n🧪 Testing login with known credentials...');
    
    // Fill in the login form
    const emailInput = await page.locator('input[type="email"]');
    const passwordInput = await page.locator('input[type="password"]');
    const submitButton = await page.locator('button[type="submit"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill('jayveedz19@gmail.com');
      await passwordInput.fill('Jimkali90#');
      
      console.log('📝 Form filled, submitting...');
      
      // Click submit and wait for network activity
      await Promise.all([
        page.waitForTimeout(10000), // Wait up to 10 seconds
        submitButton.click()
      ]);

      console.log('⏳ Waiting for auth response...');
      await page.waitForTimeout(5000);

    } else {
      console.log('❌ Could not find login form elements');
    }

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

  // Save results
  fs.writeFileSync('auth-backend-direct-test.json', JSON.stringify(results, null, 2));

  // Analysis
  console.log('\n' + '='.repeat(60));
  console.log('🔍 AUTHENTICATION BACKEND TEST ANALYSIS');
  console.log('='.repeat(60));

  console.log('\n📡 API Calls Made:');
  results.apiCalls.forEach(call => {
    if (call.type === 'request') {
      console.log(`  → ${call.method} ${call.url}`);
      if (call.postData) {
        console.log(`    Data: ${call.postData.substring(0, 100)}...`);
      }
    } else {
      console.log(`  ← ${call.status} ${call.url}`);
      if (call.responseBody && call.responseBody.length > 0) {
        console.log(`    Response: ${call.responseBody.substring(0, 150)}...`);
      }
    }
  });

  console.log('\n🚨 Errors Found:');
  results.errors.forEach(error => {
    console.log(`  [${error.type}] ${error.message || error.error}`);
    if (error.status) {
      console.log(`    Status: ${error.status}`);
    }
  });

  console.log('\n💬 Console Messages:');
  results.consoleMessages.forEach(msg => {
    if (msg.type === 'error' || msg.message.toLowerCase().includes('error')) {
      console.log(`  [${msg.type}] ${msg.message}`);
    }
  });

  console.log('\n📊 Summary:');
  console.log(`  Total API calls: ${results.apiCalls.length}`);
  console.log(`  Total errors: ${results.errors.length}`);
  console.log(`  Console messages: ${results.consoleMessages.length}`);

  const convexApiCalls = results.apiCalls.filter(call => call.url.includes('convex.cloud'));
  console.log(`  Convex API calls: ${convexApiCalls.length}`);

  if (results.errors.length > 0) {
    console.log('\n💡 DIAGNOSIS RECOMMENDATIONS:');
    
    const hasAuthError = results.errors.some(e => 
      e.message?.includes('auth') || 
      e.message?.includes('signIn') ||
      e.error?.includes('auth')
    );
    
    const hasServerError = results.errors.some(e => 
      e.message?.includes('Server Error') ||
      e.error?.includes('Server Error')
    );
    
    const hasTypeError = results.errors.some(e => 
      e.message?.includes('n is not a function') ||
      e.message?.includes('TypeError')
    );

    if (hasAuthError) {
      console.log('  🔐 Authentication system issues detected');
    }
    
    if (hasServerError) {
      console.log('  🔧 Backend server configuration problems');
    }
    
    if (hasTypeError) {
      console.log('  🐛 JavaScript runtime/dependency issues');
    }
  }

  console.log(`\n📁 Full results saved to: auth-backend-direct-test.json`);
}

if (require.main === module) {
  testAuthBackendDirect().catch(console.error);
}

module.exports = { testAuthBackendDirect };