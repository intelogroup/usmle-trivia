import { chromium } from 'playwright';

async function debugApplication() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console messages and errors
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.toString());
    console.log(`PAGE ERROR: ${error.toString()}`);
  });
  
  page.on('requestfailed', request => {
    console.log(`FAILED REQUEST: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('=== Navigating to http://localhost:5173 ===');
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    // Wait longer for JavaScript to execute
    await page.waitForTimeout(5000);
    
    // Check if React has mounted
    const reactRoot = await page.locator('#root').count();
    console.log(`React root elements found: ${reactRoot}`);
    
    if (reactRoot > 0) {
      const rootContent = await page.locator('#root').textContent();
      console.log(`Root content length: ${rootContent.length}`);
      console.log(`Root content: "${rootContent}"`);
    }
    
    // Check for any React components
    const reactElements = await page.locator('[data-reactroot], [data-reactid]').count();
    console.log(`React elements found: ${reactElements}`);
    
    // Get the actual HTML content
    const htmlContent = await page.content();
    console.log(`HTML content length: ${htmlContent.length}`);
    
    // Check if main.tsx or any JS files are loaded
    const scripts = await page.locator('script').count();
    console.log(`Script tags found: ${scripts}`);
    
    if (scripts > 0) {
      const scriptSrcs = await page.locator('script[src]').allInnerHTMLs();
      console.log(`Script sources: ${JSON.stringify(scriptSrcs)}`);
    }
    
    // Final screenshot with debugging info
    await page.screenshot({ 
      path: '/root/repo/debug-screenshot.png', 
      fullPage: true 
    });
    
    console.log('\n=== DEBUGGING SUMMARY ===');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total errors: ${errors.length}`);
    console.log(`Errors:`, errors);
    
  } catch (error) {
    console.error('Navigation error:', error.message);
  } finally {
    await browser.close();
  }
}

debugApplication();