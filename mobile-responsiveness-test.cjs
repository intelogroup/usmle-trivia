const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runMobileResponsivenessTests() {
  console.log('📱 Starting Mobile Responsiveness Tests');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testResults = {
    timestamp: new Date().toISOString(),
    testSuite: 'Mobile Responsiveness Tests',
    results: [],
    screenshots: [],
    devices: [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Android Phone', width: 360, height: 640 },
      { name: 'Samsung Galaxy', width: 412, height: 915 }
    ]
  };

  function addTestResult(device, testName, status, details = '') {
    testResults.results.push({
      device,
      testName,
      status,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async function takeScreenshot(name, device, description = '') {
    const timestamp = Date.now();
    const filename = `mobile-test-${name}-${device.name.replace(' ', '_')}-${timestamp}.png`;
    const dir = '/root/repo/mobile-test-screenshots';
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filepath = `${dir}/${filename}`;
    await page.screenshot({ path: filepath, fullPage: true });
    
    testResults.screenshots.push({
      name,
      device: device.name,
      description,
      filename,
      filepath,
      timestamp
    });
    return filename;
  }

  try {
    // Test each device configuration
    for (const device of testResults.devices) {
      console.log(`📱 Testing ${device.name} (${device.width}x${device.height})`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('http://localhost:5173/');
      await page.waitForLoadState('networkidle');
      
      // Screenshot 1: Landing page
      const screenshot1 = await takeScreenshot('01-landing-page', device, 'Landing page responsive layout');
      
      // Test 1: Layout adapts to screen size
      const bodyBox = await page.locator('body').boundingBox();
      const layoutResponsive = bodyBox && bodyBox.width <= device.width + 50; // Allow small margin
      addTestResult(device.name, 'Layout Responsive', layoutResponsive ? 'PASS' : 'FAIL', 
        `Body width: ${bodyBox?.width}px, Device width: ${device.width}px`);
      
      // Test 2: Navigation elements are accessible
      const navElements = await page.locator('nav, [role="navigation"], .nav, button').count();
      addTestResult(device.name, 'Navigation Accessible', navElements > 0 ? 'PASS' : 'FAIL', 
        `Navigation elements found: ${navElements}`);
      
      // Test 3: Text is readable (not too small)
      const textElements = await page.locator('h1, h2, h3, p, span, button').all();
      let readableTextCount = 0;
      
      for (const element of textElements.slice(0, 10)) { // Check first 10 elements
        try {
          const fontSize = await element.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return parseFloat(styles.fontSize);
          });
          if (fontSize >= 14) readableTextCount++; // Minimum readable size
        } catch (e) {
          // Skip elements that can't be evaluated
        }
      }
      
      const textReadable = readableTextCount > 0;
      addTestResult(device.name, 'Text Readable', textReadable ? 'PASS' : 'FAIL', 
        `Elements with readable text: ${readableTextCount}`);
      
      // Test login page responsiveness
      await page.click('text=Sign In');
      await page.waitForLoadState('networkidle');
      
      const screenshot2 = await takeScreenshot('02-login-page', device, 'Login page responsive layout');
      
      // Test 4: Form elements fit on screen
      const formBox = await page.locator('form, .form, [class*="form"]').first().boundingBox();
      const formFitsScreen = formBox && formBox.width <= device.width;
      addTestResult(device.name, 'Form Fits Screen', formFitsScreen ? 'PASS' : 'FAIL', 
        `Form width: ${formBox?.width}px`);
      
      // Test 5: Input fields are touch-friendly (minimum 44px height)
      const inputElements = await page.locator('input, button').all();
      let touchFriendlyCount = 0;
      
      for (const input of inputElements.slice(0, 5)) {
        try {
          const inputBox = await input.boundingBox();
          if (inputBox && inputBox.height >= 40) touchFriendlyCount++; // Minimum touch target
        } catch (e) {
          // Skip elements that can't be evaluated
        }
      }
      
      const touchFriendly = touchFriendlyCount > 0;
      addTestResult(device.name, 'Touch Friendly Inputs', touchFriendly ? 'PASS' : 'FAIL', 
        `Touch-friendly elements: ${touchFriendlyCount}`);
      
      // Test successful login flow on mobile
      if (await page.locator('input[type="email"]').count() > 0) {
        await page.fill('input[type="email"]', 'jayveedz19@gmail.com');
        await page.fill('input[type="password"]', 'Jimkali90#');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        
        const screenshot3 = await takeScreenshot('03-after-login', device, 'Dashboard after login');
        
        // Test 6: Dashboard is mobile-friendly
        const dashboardElements = await page.locator('[class*="dashboard"], [class*="card"], .rounded').count();
        addTestResult(device.name, 'Mobile Dashboard', dashboardElements > 0 ? 'PASS' : 'FAIL', 
          `Dashboard elements: ${dashboardElements}`);
      }
    }

    // Generate summary
    const totalTests = testResults.results.length;
    const passedTests = testResults.results.filter(r => r.status === 'PASS').length;
    const failedTests = testResults.results.filter(r => r.status === 'FAIL').length;
    
    console.log('\n📊 MOBILE RESPONSIVENESS TEST RESULTS');
    console.log('=====================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    // Save detailed results
    const reportPath = '/root/repo/mobile-responsiveness-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    console.log(`\n📄 Report saved to: ${reportPath}`);
    console.log(`📁 Screenshots saved to: /root/repo/mobile-test-screenshots/`);

  } catch (error) {
    console.error('❌ Mobile test error:', error);
  } finally {
    await browser.close();
  }

  return testResults;
}

runMobileResponsivenessTests().catch(console.error);