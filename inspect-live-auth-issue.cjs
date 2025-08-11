#!/usr/bin/env node

/**
 * Comprehensive inspection of live authentication issue
 * This will capture EVERYTHING happening on the site
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function inspectLiveAuthIssue() {
  console.log('🔍 Comprehensive Live Authentication Issue Inspection');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    allRequests: [],
    allResponses: [],
    consoleMessages: [],
    pageErrors: [],
    networkFailures: [],
    screenshots: []
  };

  // Capture EVERY request
  page.on('request', request => {
    const url = request.url();
    console.log(`📤 REQ: ${request.method()} ${url}`);
    
    results.allRequests.push({
      method: request.method(),
      url,
      headers: request.headers(),
      postData: request.postData(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString()
    });
  });

  // Capture EVERY response
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    console.log(`📥 RES: ${status} ${url}`);

    let responseText = null;
    try {
      if (response.status() !== 200 || url.includes('api') || url.includes('convex') || url.includes('auth')) {
        responseText = await response.text();
      }
    } catch (e) {
      responseText = `[Could not read response: ${e.message}]`;
    }

    results.allResponses.push({
      status,
      url,
      statusText: response.statusText(),
      headers: response.headers(),
      body: responseText,
      timestamp: new Date().toISOString()
    });

    if (status >= 400) {
      console.log(`❌ HTTP Error: ${status} ${url}`);
      results.networkFailures.push({
        status,
        url,
        error: responseText,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Capture ALL console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    console.log(`💬 [${type.toUpperCase()}] ${text}`);
    
    results.consoleMessages.push({
      type,
      text,
      location: msg.location(),
      timestamp: new Date().toISOString()
    });
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`💥 Page Error: ${error.message}`);
    results.pageErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  try {
    console.log('\n🏠 Step 1: Loading homepage');
    await page.goto('https://usmle-trivia.netlify.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.screenshot({ path: 'inspect-01-homepage.png' });
    results.screenshots.push('inspect-01-homepage.png');

    console.log('\n🔐 Step 2: Going to login page');
    await page.goto('https://usmle-trivia.netlify.app/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.screenshot({ path: 'inspect-02-login-page.png' });
    results.screenshots.push('inspect-02-login-page.png');

    // Wait for any dynamic content
    await page.waitForTimeout(3000);

    console.log('\n🧪 Step 3: Attempting login');
    
    // Check what's actually on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasEmailInput: document.querySelector('input[type="email"]') !== null,
        hasPasswordInput: document.querySelector('input[type="password"]') !== null,
        hasSubmitButton: document.querySelector('button[type="submit"]') !== null,
        formCount: document.querySelectorAll('form').length,
        inputCount: document.querySelectorAll('input').length,
        buttonCount: document.querySelectorAll('button').length,
        bodyText: document.body?.innerText?.substring(0, 500) || 'No body text',
        errors: Array.from(document.querySelectorAll('.error, .alert-error, [role="alert"]')).map(el => el.textContent),
        convexScript: !!Array.from(document.scripts).find(s => s.src.includes('convex'))
      };
    });

    console.log('Page analysis:', pageContent);

    if (pageContent.hasEmailInput && pageContent.hasPasswordInput) {
      console.log('📝 Filling login form...');
      
      await page.locator('input[type="email"]').fill('jayveedz19@gmail.com');
      await page.locator('input[type="password"]').fill('Jimkali90#');
      
      await page.screenshot({ path: 'inspect-03-form-filled.png' });
      results.screenshots.push('inspect-03-form-filled.png');

      console.log('🚀 Submitting form...');
      
      // Use a more specific selector and wait for the click
      await page.locator('button[type="submit"]').click();
      
      // Wait and monitor for responses
      console.log('⏳ Waiting for auth response...');
      await page.waitForTimeout(10000);
      
      await page.screenshot({ path: 'inspect-04-after-submit.png' });
      results.screenshots.push('inspect-04-after-submit.png');

      // Check the final state
      const finalState = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          hasErrorMessage: !!document.querySelector('.error, .alert-error, [role="alert"]'),
          errorMessages: Array.from(document.querySelectorAll('.error, .alert-error, [role="alert"]')).map(el => el.textContent),
          currentBodyText: document.body?.innerText?.substring(0, 300) || 'No body text'
        };
      });

      console.log('Final state after submit:', finalState);

    } else {
      console.log('❌ Could not find login form elements');
      console.log('Page content:', pageContent);
    }

    console.log('\n🔍 Step 4: Direct JavaScript error testing');
    
    // Try to trigger any JavaScript errors by accessing Convex
    const jsErrors = await page.evaluate(() => {
      const errors = [];
      try {
        // Test if window objects exist
        errors.push(`window.convex: ${typeof window.convex}`);
        errors.push(`window.React: ${typeof window.React}`);
        errors.push(`window.__CONVEX__: ${typeof window.__CONVEX__}`);
        
        // Try to access auth methods
        if (window.useAuth) {
          errors.push(`useAuth available: true`);
        } else {
          errors.push(`useAuth available: false`);
        }
        
        return errors;
      } catch (e) {
        return [`JavaScript error: ${e.message}`];
      }
    });

    console.log('JavaScript environment check:', jsErrors);

  } catch (error) {
    console.error('❌ Inspection failed:', error);
    results.pageErrors.push({
      message: `Test exception: ${error.message}`,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }

  // Save comprehensive results
  fs.writeFileSync('live-auth-issue-inspection.json', JSON.stringify(results, null, 2));

  // Detailed analysis
  console.log('\n' + '='.repeat(60));
  console.log('🔍 COMPREHENSIVE AUTHENTICATION ISSUE ANALYSIS');
  console.log('='.repeat(60));

  console.log('\n📊 Summary Statistics:');
  console.log(`  Total requests: ${results.allRequests.length}`);
  console.log(`  Total responses: ${results.allResponses.length}`);
  console.log(`  Console messages: ${results.consoleMessages.length}`);
  console.log(`  Page errors: ${results.pageErrors.length}`);
  console.log(`  Network failures: ${results.networkFailures.length}`);

  // Analyze requests for Convex
  const convexRequests = results.allRequests.filter(req => 
    req.url.includes('convex') || req.url.includes('formal-sardine-916')
  );
  console.log(`\n📡 Convex-related requests: ${convexRequests.length}`);
  convexRequests.forEach(req => {
    console.log(`  ${req.method} ${req.url}`);
    if (req.postData) {
      console.log(`    Data: ${req.postData.substring(0, 100)}...`);
    }
  });

  // Analyze responses for errors
  const errorResponses = results.allResponses.filter(res => res.status >= 400);
  console.log(`\n❌ Error responses: ${errorResponses.length}`);
  errorResponses.forEach(res => {
    console.log(`  ${res.status} ${res.url}`);
    if (res.body) {
      console.log(`    Error: ${res.body.substring(0, 200)}...`);
    }
  });

  // Analyze console messages for errors
  const errorMessages = results.consoleMessages.filter(msg => 
    msg.type === 'error' || 
    msg.text.toLowerCase().includes('error') ||
    msg.text.includes('n is not a function') ||
    msg.text.includes('Server Error')
  );
  console.log(`\n🚨 Error console messages: ${errorMessages.length}`);
  errorMessages.forEach(msg => {
    console.log(`  [${msg.type}] ${msg.text}`);
  });

  // Look for specific auth-related issues
  const authIssues = [
    ...results.consoleMessages.filter(msg => 
      msg.text.includes('CONVEX') || 
      msg.text.includes('auth:signIn') ||
      msg.text.includes('authentication')
    ),
    ...results.networkFailures.filter(fail => 
      fail.url.includes('auth') || 
      fail.url.includes('signIn')
    )
  ];

  console.log(`\n🔐 Auth-specific issues: ${authIssues.length}`);
  authIssues.forEach(issue => {
    if (issue.text) {
      console.log(`  Console: ${issue.text}`);
    } else if (issue.error) {
      console.log(`  Network: ${issue.status} ${issue.url} - ${issue.error}`);
    }
  });

  console.log(`\n📸 Screenshots saved: ${results.screenshots.length}`);
  results.screenshots.forEach(screenshot => {
    console.log(`  ${screenshot}`);
  });

  console.log('\n💡 RECOMMENDATIONS:');
  
  if (convexRequests.length === 0) {
    console.log('  🔧 No Convex API requests detected - client may not be connecting to backend');
    console.log('  🔍 Check if Convex client is properly initialized');
    console.log('  📝 Verify VITE_CONVEX_URL is correctly configured in the deployed app');
  }
  
  if (errorMessages.length > 0) {
    console.log('  🐛 JavaScript errors detected - check console for details');
    console.log('  📦 May be dependency version conflicts or missing libraries');
  }
  
  if (authIssues.length > 0) {
    console.log('  🔐 Authentication-specific issues found');
    console.log('  🔧 Check Convex Auth configuration and deployment');
  }

  console.log(`\n📁 Full inspection results saved to: live-auth-issue-inspection.json`);
}

if (require.main === module) {
  inspectLiveAuthIssue().catch(console.error);
}

module.exports = { inspectLiveAuthIssue };