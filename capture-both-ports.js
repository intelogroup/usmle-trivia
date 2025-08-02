import { chromium } from 'playwright';

async function captureFromBothPorts() {
  const browser = await chromium.launch();

  // Try port 5173
  console.log('=== Testing port 5173 ===');
  let page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    const bodyText = await page.locator('body').textContent();
    console.log(`Port 5173 - Title: ${title}`);
    console.log(`Port 5173 - Body length: ${bodyText.length}`);
    console.log(`Port 5173 - First 200 chars: ${bodyText.substring(0, 200)}`);
    
    await page.screenshot({ 
      path: '/root/repo/screenshot-port-5173.png', 
      fullPage: true 
    });
    console.log('Port 5173 screenshot saved');
    
  } catch (error) {
    console.log(`Port 5173 error: ${error.message}`);
  }
  await page.close();

  // Try port 5174
  console.log('\n=== Testing port 5174 ===');
  page = await browser.newPage();
  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    const bodyText = await page.locator('body').textContent();
    console.log(`Port 5174 - Title: ${title}`);
    console.log(`Port 5174 - Body length: ${bodyText.length}`);
    console.log(`Port 5174 - First 200 chars: ${bodyText.substring(0, 200)}`);
    
    await page.screenshot({ 
      path: '/root/repo/screenshot-port-5174.png', 
      fullPage: true 
    });
    console.log('Port 5174 screenshot saved');
    
    // Look for UI elements on this port
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    
    console.log(`Port 5174 elements: ${forms} forms, ${inputs} inputs, ${buttons} buttons, ${links} links`);
    
    // Try to find authentication-related elements
    const authElements = await page.locator('button, a, div').getByText(/login|sign|register|auth/i).count();
    console.log(`Port 5174 auth-related elements: ${authElements}`);
    
    if (buttons > 0) {
      const buttonTexts = await page.locator('button').allTextContents();
      console.log(`Button texts: ${JSON.stringify(buttonTexts)}`);
    }
    
  } catch (error) {
    console.log(`Port 5174 error: ${error.message}`);
  }
  await page.close();

  await browser.close();
}

captureFromBothPorts();