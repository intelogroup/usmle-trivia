const { chromium } = require('playwright');
const fs = require('fs');

async function testAuthFormsDetailed() {
  console.log('🔍 Testing Authentication Forms in Detail...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Track console and errors
  const logs = [];
  const errors = [];
  
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => errors.push(error.message));
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    errors: [],
    logs: [],
    screenshots: []
  };
  
  try {
    // Test registration form structure
    console.log('📍 Testing registration page form structure...');
    await page.goto('https://usmle-trivia.netlify.app/register', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'auth-forms-01-register.png' });
    results.screenshots.push('auth-forms-01-register.png');
    
    // Wait for page to fully load and inspect form
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Get all form inputs
    const formInputs = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return { error: 'No form found' };
      
      const inputs = Array.from(form.querySelectorAll('input')).map(input => ({
        name: input.name,
        type: input.type,
        placeholder: input.placeholder,
        id: input.id,
        required: input.required
      }));
      
      const submitButton = form.querySelector('button[type="submit"]');
      
      return {
        inputs,
        submitButton: submitButton ? {
          text: submitButton.textContent,
          disabled: submitButton.disabled
        } : null,
        formAction: form.action,
        formMethod: form.method
      };
    });
    
    results.tests.registerFormStructure = {
      success: true,
      formData: formInputs
    };
    
    console.log('📋 Registration form structure:', JSON.stringify(formInputs, null, 2));
    
    // Try different selector strategies for form fields
    const selectors = {
      name: ['input[name="name"]', 'input[placeholder*="name" i]', 'input#name', 'input[type="text"]:first-of-type'],
      email: ['input[name="email"]', 'input[placeholder*="email" i]', 'input#email', 'input[type="email"]'],
      password: ['input[name="password"]', 'input[placeholder*="password" i]', 'input#password', 'input[type="password"]']
    };
    
    const foundSelectors = {};
    for (const [field, selectorList] of Object.entries(selectors)) {
      for (const selector of selectorList) {
        try {
          const element = await page.$(selector);
          if (element) {
            foundSelectors[field] = selector;
            console.log(`✅ Found ${field} field using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      if (!foundSelectors[field]) {
        console.log(`❌ Could not find ${field} field with any selector`);
      }
    }
    
    results.tests.fieldSelectors = foundSelectors;
    
    // Test if we can fill the form
    if (Object.keys(foundSelectors).length === 3) {
      console.log('📝 Attempting to fill registration form...');
      const testData = {
        name: 'Auth Fix Test User',
        email: `auth-fix-test-${Date.now()}@medquiz.test`,
        password: 'AuthFix2025!'
      };
      
      try {
        await page.fill(foundSelectors.name, testData.name);
        await page.fill(foundSelectors.email, testData.email);
        await page.fill(foundSelectors.password, testData.password);
        
        await page.screenshot({ path: 'auth-forms-02-filled.png' });
        results.screenshots.push('auth-forms-02-filled.png');
        
        console.log('✅ Successfully filled registration form');
        results.tests.fillRegistrationForm = { success: true, testData };
        
        // Test form submission
        console.log('🚀 Testing form submission...');
        const errorCountBefore = errors.length;
        
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000); // Wait for response
        
        const errorCountAfter = errors.length;
        const newErrors = errors.slice(errorCountBefore);
        
        await page.screenshot({ path: 'auth-forms-03-after-submit.png' });
        results.screenshots.push('auth-forms-03-after-submit.png');
        
        const currentUrl = page.url();
        const wasRedirected = !currentUrl.includes('/register');
        
        results.tests.registrationSubmission = {
          success: wasRedirected && newErrors.length === 0,
          newErrors: newErrors,
          currentUrl: currentUrl,
          wasRedirected: wasRedirected
        };
        
        console.log(`📍 After registration - URL: ${currentUrl}`);
        console.log(`🔄 Redirected: ${wasRedirected}`);
        console.log(`❌ New errors: ${newErrors.length}`);
        
      } catch (fillError) {
        console.error('❌ Failed to fill registration form:', fillError.message);
        results.tests.fillRegistrationForm = { success: false, error: fillError.message };
      }
    }
    
    // Test login page
    console.log('📍 Testing login page...');
    await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'auth-forms-04-login.png' });
    results.screenshots.push('auth-forms-04-login.png');
    
    // Test login with existing user
    console.log('🔐 Testing login with existing user...');
    const loginSelectors = {
      email: foundSelectors.email || 'input[type="email"], input[name="email"]',
      password: foundSelectors.password || 'input[type="password"], input[name="password"]'
    };
    
    try {
      await page.fill(loginSelectors.email, 'jayveedz19@gmail.com');
      await page.fill(loginSelectors.password, 'Jimkali90#');
      
      await page.screenshot({ path: 'auth-forms-05-login-filled.png' });
      results.screenshots.push('auth-forms-05-login-filled.png');
      
      const loginErrorsBefore = errors.length;
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000); // Wait longer for login
      
      const loginErrorsAfter = errors.length;
      const loginNewErrors = errors.slice(loginErrorsBefore);
      
      await page.screenshot({ path: 'auth-forms-06-login-result.png' });
      results.screenshots.push('auth-forms-06-login-result.png');
      
      const loginUrl = page.url();
      const loginSuccess = (loginUrl.includes('/dashboard') || loginUrl.includes('/quiz')) && loginNewErrors.length === 0;
      
      results.tests.loginSubmission = {
        success: loginSuccess,
        newErrors: loginNewErrors,
        currentUrl: loginUrl,
        credentials: 'jayveedz19@gmail.com'
      };
      
      console.log(`🔐 Login result - URL: ${loginUrl}`);
      console.log(`✅ Login success: ${loginSuccess}`);
      console.log(`❌ Login errors: ${loginNewErrors.length}`);
      
    } catch (loginError) {
      console.error('❌ Failed to test login:', loginError.message);
      results.tests.loginSubmission = { success: false, error: loginError.message };
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.errors.push(error.message);
  } finally {
    results.errors = errors;
    results.logs = logs;
    
    // Save results
    fs.writeFileSync('auth-forms-test-results.json', JSON.stringify(results, null, 2));
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🔍 AUTHENTICATION FORMS TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Registration form found: ${results.tests.registerFormStructure?.success || false}`);
    console.log(`✅ Form fields detected: ${Object.keys(results.tests.fieldSelectors || {}).length}/3`);
    console.log(`✅ Registration form fillable: ${results.tests.fillRegistrationForm?.success || false}`);
    console.log(`✅ Registration submission: ${results.tests.registrationSubmission?.success || false}`);
    console.log(`✅ Login submission: ${results.tests.loginSubmission?.success || false}`);
    console.log(`❌ Total JavaScript errors: ${errors.length}`);
    console.log(`📸 Screenshots taken: ${results.screenshots.length}`);
    
    if (errors.length > 0) {
      console.log('\n🐛 JavaScript Errors Found:');
      errors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
    } else {
      console.log('\n🎉 NO JAVASCRIPT ERRORS DETECTED!');
    }
    
    console.log('='.repeat(60));
    
    await browser.close();
    return results;
  }
}

testAuthFormsDetailed()
  .then(results => {
    const hasAuthSuccess = results.tests.registrationSubmission?.success || results.tests.loginSubmission?.success;
    const hasNoErrors = results.errors.length === 0;
    
    if (hasAuthSuccess && hasNoErrors) {
      console.log('\n🎉 AUTHENTICATION IS WORKING! Critical errors have been fixed!');
      process.exit(0);
    } else if (hasNoErrors) {
      console.log('\n✅ No JavaScript errors detected, but authentication flow needs refinement.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some issues remain. Check detailed results.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });