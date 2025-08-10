import { test, expect } from '@playwright/test';

const LIVE_URL = 'https://usmle-trivia.netlify.app';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const testEmail = `test-auth-focused-${timestamp}@medquiz.test`;

const TEST_USER = {
  name: 'Focused Test User',
  email: testEmail,
  password: 'TestPassword123!',
};

console.log('Focused Test with credentials:', {
  email: TEST_USER.email,
  name: TEST_USER.name
});

test.describe('Focused Sign Up Testing', () => {
  
  test('should analyze registration form and submission behavior', async ({ page }) => {
    // Monitor all network requests
    const requests: any[] = [];
    const responses: any[] = [];
    const consoleMessages: any[] = [];
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
    });
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers()
      });
    });
    
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    // Navigate to registration page
    console.log('1. Navigating to registration page...');
    await page.goto(`${LIVE_URL}/register`);
    await page.waitForTimeout(3000);
    
    // Take screenshot of initial page
    await page.screenshot({ 
      path: `/tmp/focused-initial-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log('2. Analyzing form structure...');
    
    // Analyze form elements
    const formElements = await page.evaluate(() => {
      const form = document.querySelector('form');
      const inputs = Array.from(document.querySelectorAll('input'));
      const buttons = Array.from(document.querySelectorAll('button'));
      
      return {
        hasForm: !!form,
        formAction: form?.action || 'none',
        formMethod: form?.method || 'none',
        inputs: inputs.map(input => ({
          id: input.id,
          name: input.name,
          type: input.type,
          required: input.required,
          placeholder: input.placeholder
        })),
        buttons: buttons.map(button => ({
          id: button.id,
          type: button.type,
          textContent: button.textContent?.trim(),
          disabled: button.disabled
        }))
      };
    });
    
    console.log('Form Analysis:', formElements);
    
    // Check if all required fields exist
    const nameField = page.locator('#name');
    const emailField = page.locator('#email');
    const passwordField = page.locator('#password');
    const confirmPasswordField = page.locator('#confirmPassword');
    const submitButton = page.locator('button[type="submit"]');
    
    console.log('3. Checking field visibility...');
    const fieldsVisible = {
      name: await nameField.isVisible().catch(() => false),
      email: await emailField.isVisible().catch(() => false),
      password: await passwordField.isVisible().catch(() => false),
      confirmPassword: await confirmPasswordField.isVisible().catch(() => false),
      submitButton: await submitButton.isVisible().catch(() => false)
    };
    
    console.log('Fields Visible:', fieldsVisible);
    
    console.log('4. Filling out the form...');
    
    if (fieldsVisible.name) await nameField.fill(TEST_USER.name);
    if (fieldsVisible.email) await emailField.fill(TEST_USER.email);
    if (fieldsVisible.password) await passwordField.fill(TEST_USER.password);
    if (fieldsVisible.confirmPassword) await confirmPasswordField.fill(TEST_USER.password);
    
    // Take screenshot after filling
    await page.screenshot({ 
      path: `/tmp/focused-filled-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log('5. Network requests so far:', requests.length);
    console.log('6. Console messages so far:', consoleMessages.length);
    
    // Clear existing requests to focus on submission
    requests.length = 0;
    responses.length = 0;
    
    console.log('7. Submitting the form...');
    
    if (fieldsVisible.submitButton) {
      await submitButton.click();
    } else {
      console.log('Submit button not found!');
      return;
    }
    
    // Wait longer for any async operations
    await page.waitForTimeout(8000);
    
    // Take screenshot after submission
    await page.screenshot({ 
      path: `/tmp/focused-after-submit-${timestamp}.png`,
      fullPage: true 
    });
    
    console.log('8. Post-submission analysis...');
    console.log('Current URL:', page.url());
    console.log('Network requests during submission:', requests.length);
    console.log('Network responses during submission:', responses.length);
    
    // Log all requests made during submission
    if (requests.length > 0) {
      console.log('Submission Requests:');
      requests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url}`);
        if (req.url.includes('convex')) {
          console.log(`     ✅ CONVEX REQUEST FOUND`);
        }
      });
    } else {
      console.log('⚠️ NO NETWORK REQUESTS during submission');
    }
    
    // Log responses
    if (responses.length > 0) {
      console.log('Submission Responses:');
      responses.forEach((res, index) => {
        console.log(`  ${index + 1}. ${res.status} ${res.url}`);
      });
    }
    
    // Check for error messages
    const errorElements = await page.locator('.bg-destructive, .text-red-500, .error, [role="alert"]').all();
    if (errorElements.length > 0) {
      console.log('Error messages found:');
      for (const errorElement of errorElements) {
        const text = await errorElement.textContent();
        if (text?.trim()) {
          console.log(`  - ${text.trim()}`);
        }
      }
    }
    
    // Check console messages for errors
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    if (errorMessages.length > 0) {
      console.log('JavaScript console errors:');
      errorMessages.forEach(msg => {
        console.log(`  - ${msg.text}`);
      });
    }
    
    // Summary
    const finalUrl = page.url();
    const registrationSuccessful = finalUrl.includes('/dashboard');
    const stayedOnRegistrationPage = finalUrl.includes('/register');
    
    console.log('=== REGISTRATION TEST SUMMARY ===');
    console.log(`Final URL: ${finalUrl}`);
    console.log(`Registration successful: ${registrationSuccessful ? '✅ YES' : '❌ NO'}`);
    console.log(`Stayed on registration page: ${stayedOnRegistrationPage ? '⚠️ YES' : '✅ NO'}`);
    console.log(`Network requests made: ${requests.length}`);
    console.log(`Console errors: ${errorMessages.length}`);
    console.log(`Convex requests: ${requests.filter(r => r.url.includes('convex')).length}`);
    
    // Test should pass if we gathered the necessary information
    expect(fieldsVisible.submitButton).toBe(true);
    expect(fieldsVisible.email).toBe(true);
    expect(fieldsVisible.password).toBe(true);
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({ 
      path: `/tmp/focused-failure-${timestamp}.png`,
      fullPage: true 
    });
  }
});