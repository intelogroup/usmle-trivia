const { chromium } = require('playwright');

async function debugApp() {
  console.log('🔍 Starting Debug Test');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📡 Navigating to localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      } else if (msg.type() === 'warning') {
        console.log('⚠️  Console Warning:', msg.text());
      } else if (msg.type() === 'log') {
        console.log('ℹ️  Console Log:', msg.text());
      }
    });
    
    // Get page title and basic content
    const title = await page.title();
    console.log('📄 Page Title:', title);
    
    const bodyText = await page.locator('body').textContent();
    console.log('📝 Page Content Length:', bodyText ? bodyText.length : 0);
    console.log('📝 First 200 chars:', bodyText ? bodyText.substring(0, 200) : 'No content');
    
    // Check for React root
    const reactRoot = await page.locator('#root').innerHTML();
    console.log('⚛️  React Root Content Length:', reactRoot ? reactRoot.length : 0);
    
    // Check for any error elements
    const errorElements = await page.locator('[class*="error"], [class*="Error"]').count();
    console.log('🚨 Error elements found:', errorElements);
    
    // Check for loading indicators
    const loadingElements = await page.locator('[class*="loading"], [class*="Loading"], [class*="spinner"]').count();
    console.log('⏳ Loading elements found:', loadingElements);
    
    // Get network status
    const responses = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        responses.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    // Wait a bit more to capture any async loading
    await page.waitForTimeout(3000);
    
    if (responses.length > 0) {
      console.log('🌐 Failed Network Requests:');
      responses.forEach(r => console.log('  ', r));
    } else {
      console.log('✅ No failed network requests detected');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-app-state.png', fullPage: true });
    console.log('📸 Screenshot saved: debug-app-state.png');
    
  } catch (error) {
    console.error('💥 Debug test error:', error);
  } finally {
    await browser.close();
  }
}

debugApp();