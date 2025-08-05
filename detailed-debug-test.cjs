const { chromium } = require('playwright');

async function detailedDebug() {
  console.log('🔍 Starting Detailed Debug Test');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  const consoleMessages = [];
  const networkErrors = [];
  
  // Capture all console messages
  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleMessages.push(message);
    
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    } else if (msg.type() === 'warning') {
      console.log('⚠️  Console Warning:', msg.text());
    }
  });
  
  // Capture network failures
  page.on('response', response => {
    if (response.status() >= 400) {
      const error = `${response.status()} - ${response.url()}`;
      networkErrors.push(error);
      console.log('🌐 Network Error:', error);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('💥 Page Error:', error.message);
    consoleMessages.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    console.log('📡 Navigating to localhost:5173...');
    
    // Try to load the page with a longer timeout
    await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log('✅ Page loaded, waiting for content...');
    
    // Wait for potential React app to load
    try {
      await page.waitForSelector('#root > *', { timeout: 5000 });
      console.log('✅ React content found');
    } catch (e) {
      console.log('❌ No React content found within 5 seconds');
    }
    
    // Check the HTML source
    const htmlContent = await page.content();
    console.log('📝 HTML Content Length:', htmlContent.length);
    console.log('📝 Head section includes:', 
      htmlContent.includes('script') ? '✅ Scripts' : '❌ No Scripts',
      htmlContent.includes('vite') ? '✅ Vite' : '❌ No Vite',
      htmlContent.includes('convex') ? '✅ Convex' : '❌ No Convex'
    );
    
    // Check for specific React elements
    const reactRoot = await page.locator('#root').innerHTML();
    console.log('⚛️  React Root HTML:', reactRoot || 'EMPTY');
    
    // Look for script errors in the page source
    const scripts = await page.locator('script').count();
    console.log('📜 Script tags found:', scripts);
    
    // Wait longer to see if anything loads async
    console.log('⏳ Waiting 8 seconds for async content...');
    await page.waitForTimeout(8000);
    
    // Check again after waiting
    const finalContent = await page.locator('body').textContent();
    console.log('📝 Final content length:', finalContent ? finalContent.length : 0);
    
    if (finalContent && finalContent.length > 50) {
      console.log('📝 Content preview:', finalContent.substring(0, 200));
    }
    
    // Take screenshot
    await page.screenshot({ path: 'detailed-debug-final.png', fullPage: true });
    console.log('📸 Screenshot saved: detailed-debug-final.png');
    
  } catch (error) {
    console.error('💥 Navigation error:', error.message);
  }
  
  // Summary
  console.log('\n📊 Debug Summary:');
  console.log('Console Messages:', consoleMessages.length);
  console.log('Network Errors:', networkErrors.length);
  
  if (consoleMessages.length > 0) {
    console.log('\n📝 All Console Messages:');
    consoleMessages.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.type}] ${msg.text}`);
    });
  }
  
  if (networkErrors.length > 0) {
    console.log('\n🌐 Network Errors:');
    networkErrors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });
  }
  
  await browser.close();
}

detailedDebug();