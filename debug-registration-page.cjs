const { chromium } = require('playwright');

async function debugRegistration() {
  console.log('🔍 Debugging Registration Page');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📡 Going to registration page...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
    
    await page.screenshot({ path: 'debug-registration-01-loaded.png' });
    
    // Check what form fields are available
    const inputs = await page.locator('input').all();
    console.log(`📝 Found ${inputs.length} input fields:`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const isVisible = await input.isVisible();
      
      console.log(`  Input ${i}: type="${type}", name="${name}", id="${id}", placeholder="${placeholder}", visible=${isVisible}`);
    }
    
    // Check for form element
    const forms = await page.locator('form').count();
    console.log(`📋 Found ${forms} form elements`);
    
    // Check page content
    const pageText = await page.textContent('body');
    console.log('📄 Page contains registration keywords:', {
      'Create account': pageText.includes('Create account'),
      'Full Name': pageText.includes('Full Name'),
      'Email': pageText.includes('Email'),
      'Password': pageText.includes('Password')
    });
    
    // Try to find any input field and interact with it
    console.log('🔍 Trying to find any name input...');
    
    const possibleNameInputs = [
      'input[name="name"]',
      'input[name="fullName"]',
      'input[placeholder*="name" i]',
      'input[id="name"]',
      'input[id="fullName"]',
      'input:first-of-type'
    ];
    
    for (const selector of possibleNameInputs) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found name input with selector: ${selector}`);
          await element.fill('Test Name');
          console.log('✅ Successfully filled name input');
          break;
        }
      } catch (e) {
        console.log(`❌ Selector failed: ${selector}`);
      }
    }
    
    await page.screenshot({ path: 'debug-registration-02-after-interaction.png' });
    
  } catch (error) {
    console.error('💥 Debug error:', error);
    await page.screenshot({ path: 'debug-registration-error.png' });
  } finally {
    await browser.close();
  }
}

debugRegistration();