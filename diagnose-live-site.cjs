const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Diagnosing MedQuiz Pro live site issues...');
  console.log('🌐 URL: https://usmle-trivia.netlify.app/');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    console.log(`[${type.toUpperCase()}] ${text}`);
  });
  
  // Capture all network responses
  const networkResponses = [];
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    networkResponses.push({ status, url });
    console.log(`[${status}] ${url}`);
  });
  
  // Capture failed requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    const url = request.url();
    const failure = request.failure();
    failedRequests.push({ url, failure });
    console.log(`[FAILED] ${url} - ${failure?.errorText || 'Unknown error'}`);
  });
  
  try {
    console.log('\n📡 Navigating to site...');
    await page.goto('https://usmle-trivia.netlify.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('\n📄 Page Information:');
    const title = await page.title();
    const url = page.url();
    console.log(`Title: "${title}"`);
    console.log(`Final URL: ${url}`);
    
    // Get page HTML
    const htmlContent = await page.content();
    console.log(`HTML Content Length: ${htmlContent.length} characters`);
    
    // Extract visible text
    const bodyText = await page.locator('body').textContent().catch(() => '');
    console.log(`Visible Text: "${bodyText.substring(0, 200)}..."`);
    
    // Check for basic HTML elements
    const hasHtml = await page.locator('html').count();
    const hasHead = await page.locator('head').count();
    const hasBody = await page.locator('body').count();
    const hasScript = await page.locator('script').count();
    const hasDiv = await page.locator('div').count();
    
    console.log(`\nHTML Structure:`);
    console.log(`  <html> elements: ${hasHtml}`);
    console.log(`  <head> elements: ${hasHead}`);
    console.log(`  <body> elements: ${hasBody}`);
    console.log(`  <script> elements: ${hasScript}`);
    console.log(`  <div> elements: ${hasDiv}`);
    
    // Check meta tags
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content').catch(() => 'Not found');
    const description = await page.locator('meta[name="description"]').getAttribute('content').catch(() => 'Not found');
    
    console.log(`\nMeta Information:`);
    console.log(`  Viewport: ${viewport}`);
    console.log(`  Description: ${description}`);
    
    // Screenshot for diagnosis
    await page.screenshot({ 
      path: 'test-screenshots/diagnosis-full-page.png', 
      fullPage: true 
    });
    console.log('\n📸 Diagnostic screenshot saved');
    
    // Try to get more specific elements
    const h1Count = await page.locator('h1').count();
    const buttonCount = await page.locator('button').count();
    const linkCount = await page.locator('a').count();
    const inputCount = await page.locator('input').count();
    
    console.log(`\nElement Counts:`);
    console.log(`  <h1>: ${h1Count}`);
    console.log(`  <button>: ${buttonCount}`);
    console.log(`  <a>: ${linkCount}`);
    console.log(`  <input>: ${inputCount}`);
    
  } catch (error) {
    console.error('❌ Navigation failed:', error.message);
  }
  
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('========================');
  console.log(`Console Messages: ${consoleMessages.length}`);
  console.log(`Network Responses: ${networkResponses.length}`);
  console.log(`Failed Requests: ${failedRequests.length}`);
  
  if (consoleMessages.length > 0) {
    console.log('\nConsole Messages:');
    consoleMessages.forEach((msg, i) => {
      console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
    });
  }
  
  if (failedRequests.length > 0) {
    console.log('\nFailed Requests:');
    failedRequests.forEach((req, i) => {
      console.log(`  ${i + 1}. ${req.url} - ${req.failure?.errorText || 'Unknown'}`);
    });
  }
  
  // Show network responses summary
  const statusCounts = {};
  networkResponses.forEach(resp => {
    statusCounts[resp.status] = (statusCounts[resp.status] || 0) + 1;
  });
  
  console.log('\nNetwork Status Summary:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} requests`);
  });
  
  await browser.close();
  console.log('\n✅ Diagnosis completed!');
})();