const { chromium } = require('playwright');
const fs = require('fs');

/**
 * Test Convex Backend Health and API Connectivity
 * Check if the backend is accessible and responding properly
 */
async function testConvexBackendHealth() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    convexUrl: 'https://formal-sardine-916.convex.cloud',
    tests: []
  };
  
  console.log('\n🔍 TESTING CONVEX BACKEND HEALTH');
  console.log('='.repeat(50));
  console.log(`Backend URL: ${results.convexUrl}`);
  
  try {
    // Test 1: Direct Backend Connectivity
    console.log('\n🌐 TEST: Direct Backend Connectivity');
    
    try {
      const response = await page.evaluate(async (convexUrl) => {
        try {
          const response = await fetch(convexUrl);
          return {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          };
        } catch (error) {
          return {
            error: error.message
          };
        }
      }, results.convexUrl);
      
      results.tests.push({
        name: 'Direct Backend Connectivity',
        status: response.ok ? 'SUCCESS' : 'FAILED',
        details: response
      });
      
      console.log(`   Status: ${response.status || 'ERROR'}`);
      console.log(`   OK: ${response.ok || false}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Direct Backend Connectivity',
        status: 'FAILED',
        error: error.message
      });
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 2: Check if site loads JavaScript properly
    console.log('\n📝 TEST: JavaScript Loading');
    
    let jsLoaded = false;
    let jsErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    try {
      await page.goto('https://usmle-trivia.netlify.app', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Check if React has loaded
      const reactLoaded = await page.evaluate(() => {
        return typeof window.React !== 'undefined' || 
               document.querySelector('[data-reactroot]') !== null ||
               document.querySelector('#root') !== null;
      });
      
      // Check if Convex client is loaded
      const convexLoaded = await page.evaluate(() => {
        return typeof window.convex !== 'undefined' || 
               window.ConvexReactClient !== 'undefined';
      });
      
      jsLoaded = true;
      
      results.tests.push({
        name: 'JavaScript Loading',
        status: 'SUCCESS',
        details: {
          reactLoaded,
          convexLoaded,
          jsErrors: jsErrors.length
        }
      });
      
      console.log(`   React loaded: ${reactLoaded}`);
      console.log(`   Convex loaded: ${convexLoaded}`);
      console.log(`   JS errors: ${jsErrors.length}`);
      
    } catch (error) {
      results.tests.push({
        name: 'JavaScript Loading',
        status: 'FAILED',
        error: error.message,
        details: { jsErrors: jsErrors.length }
      });
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 3: Network Request Monitoring
    console.log('\n🔍 TEST: Authentication Network Monitoring');
    
    const networkRequests = [];
    const networkResponses = [];
    
    page.on('request', request => {
      if (request.url().includes('convex') || request.url().includes('auth')) {
        networkRequests.push({
          method: request.method(),
          url: request.url(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('convex') || response.url().includes('auth')) {
        networkResponses.push({
          status: response.status(),
          url: response.url(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    try {
      // Navigate to login page
      await page.goto('https://usmle-trivia.netlify.app/login');
      await page.waitForTimeout(3000);
      
      // Fill and submit login form
      await page.fill('input[type="email"]', 'test@test.com');
      await page.fill('input[type="password"]', 'testpass');
      
      // Clear previous requests
      networkRequests.length = 0;
      networkResponses.length = 0;
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      const convexRequests = networkRequests.filter(req => req.url.includes('convex'));
      const convexResponses = networkResponses.filter(res => res.url.includes('convex'));
      const failedResponses = networkResponses.filter(res => res.status >= 400);
      
      results.tests.push({
        name: 'Authentication Network Monitoring',
        status: convexRequests.length > 0 ? 'REQUESTS_MADE' : 'NO_REQUESTS',
        details: {
          totalRequests: networkRequests.length,
          convexRequests: convexRequests.length,
          convexResponses: convexResponses.length,
          failedResponses: failedResponses.length,
          requests: convexRequests,
          responses: convexResponses
        }
      });
      
      console.log(`   Total auth requests: ${networkRequests.length}`);
      console.log(`   Convex requests: ${convexRequests.length}`);
      console.log(`   Convex responses: ${convexResponses.length}`);
      console.log(`   Failed responses: ${failedResponses.length}`);
      
      convexRequests.forEach(req => {
        console.log(`   Request: ${req.method} ${req.url}`);
      });
      
      convexResponses.forEach(res => {
        console.log(`   Response: ${res.status} ${res.url}`);
      });
      
    } catch (error) {
      results.tests.push({
        name: 'Authentication Network Monitoring',
        status: 'FAILED',
        error: error.message
      });
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 4: Manual Registration Attempt
    console.log('\n📝 TEST: Complete Registration Flow');
    
    try {
      await page.goto('https://usmle-trivia.netlify.app/register');
      await page.waitForTimeout(2000);
      
      const timestamp = Date.now();
      const testEmail = `health-test-${timestamp}@test.com`;
      const testName = `Health Test User`;
      const testPassword = 'HealthTest123!';
      
      // Fill registration form
      await page.fill('input[placeholder*="name" i], input[name*="name" i]', testName);
      await page.fill('input[type="email"]', testEmail);
      
      const passwordFields = await page.$$('input[type="password"]');
      if (passwordFields.length >= 1) {
        await passwordFields[0].fill(testPassword);
      }
      if (passwordFields.length >= 2) {
        await passwordFields[1].fill(testPassword);
      }
      
      await page.screenshot({ path: 'backend-health-registration.png', fullPage: true });
      
      // Clear network logs
      networkRequests.length = 0;
      networkResponses.length = 0;
      
      // Submit registration
      await page.click('button[type="submit"]');
      await page.waitForTimeout(8000);
      
      await page.screenshot({ path: 'backend-health-registration-result.png', fullPage: true });
      
      const regUrl = page.url();
      const regContent = await page.textContent('body');
      const hasSuccess = regUrl.includes('dashboard') || regContent.includes('welcome');
      const hasError = regContent.toLowerCase().includes('error');
      
      const regConvexRequests = networkRequests.filter(req => req.url.includes('convex'));
      const regConvexResponses = networkResponses.filter(res => res.url.includes('convex'));
      
      results.tests.push({
        name: 'Complete Registration Flow',
        status: hasSuccess ? 'SUCCESS' : (hasError ? 'FAILED' : 'UNCLEAR'),
        details: {
          testEmail,
          currentUrl: regUrl,
          hasSuccess,
          hasError,
          convexRequests: regConvexRequests.length,
          convexResponses: regConvexResponses.length,
          networkActivity: {
            requests: regConvexRequests,
            responses: regConvexResponses
          }
        }
      });
      
      console.log(`   Test email: ${testEmail}`);
      console.log(`   Result: ${hasSuccess ? 'SUCCESS' : (hasError ? 'FAILED' : 'UNCLEAR')}`);
      console.log(`   Current URL: ${regUrl}`);
      console.log(`   Convex requests made: ${regConvexRequests.length}`);
      
    } catch (error) {
      results.tests.push({
        name: 'Complete Registration Flow',
        status: 'FAILED',
        error: error.message
      });
      console.log(`   Error: ${error.message}`);
    }
    
  } finally {
    await browser.close();
  }
  
  // Save results
  fs.writeFileSync('convex-backend-health-report.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n📊 CONVEX BACKEND HEALTH SUMMARY');
  console.log('='.repeat(60));
  
  const successCount = results.tests.filter(t => t.status === 'SUCCESS').length;
  const failCount = results.tests.filter(t => t.status === 'FAILED').length;
  
  console.log(`✅ Successful tests: ${successCount}`);
  console.log(`❌ Failed tests: ${failCount}`);
  console.log(`📊 Total tests: ${results.tests.length}`);
  
  results.tests.forEach(test => {
    const icon = test.status === 'SUCCESS' ? '✅' :
                 test.status === 'FAILED' ? '❌' :
                 test.status.includes('REQUESTS') ? '🔍' : '⚠️';
    console.log(`${icon} ${test.name}: ${test.status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log(`\n📄 Report saved: convex-backend-health-report.json`);
  console.log(`📷 Screenshots saved: backend-health-*.png`);
  
  return results;
}

testConvexBackendHealth().catch(console.error);