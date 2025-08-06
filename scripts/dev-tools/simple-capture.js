import { chromium } from 'playwright';

async function captureCurrentState() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture errors
  page.on('pageerror', error => {
    console.log(`❌ JavaScript Error: ${error.toString()}`);
  });
  
  try {
    console.log('🔍 Loading application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshots
    await page.screenshot({ 
      path: '/root/repo/main-page-current.png', 
      fullPage: true 
    });
    console.log('📸 Main page screenshot saved: main-page-current.png');
    
    // Check page state
    const title = await page.title();
    const url = page.url();
    console.log(`🏷️  Page title: ${title}`);
    console.log(`🔗 Current URL: ${url}`);
    
    // Check React root
    const rootExists = await page.locator('#root').count();
    console.log(`⚛️  React root elements: ${rootExists}`);
    
    if (rootExists > 0) {
      const rootContent = await page.locator('#root').textContent();
      console.log(`📝 Root content: "${rootContent}" (length: ${rootContent.length})`);
    }
    
    // Look for any visible elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const inputs = await page.locator('input').count();
    const forms = await page.locator('form').count();
    console.log(`🎛️  Interactive elements: ${buttons} buttons, ${links} links, ${inputs} inputs, ${forms} forms`);
    
    // Try to find navigation or authentication elements
    const navElements = await page.locator('nav, [role="navigation"]').count();
    const authTexts = await page.getByText(/login|sign|register|auth/i).count();
    console.log(`🧭 Navigation elements: ${navElements}`);
    console.log(`🔐 Auth-related text: ${authTexts}`);
    
    // Check for any text content
    const bodyText = await page.locator('body').textContent();
    console.log(`📄 Total body text length: ${bodyText.length}`);
    if (bodyText.length > 0) {
      console.log(`📄 Body text preview: "${bodyText.substring(0, 200)}..."`);
    }
    
  } catch (error) {
    console.error('❌ Error during capture:', error.message);
  } finally {
    await browser.close();
  }
}

captureCurrentState();