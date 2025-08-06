import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`🖥️ Console [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  try {
    console.log('📝 MedQuiz Pro Registration Flow Test');
    
    // Navigate to the app
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(3000);
    
    console.log('\n🎯 Step 1: Navigate to Registration');
    await page.screenshot({ path: '/tmp/reg-test-01-initial.png', fullPage: true });
    
    // Look for Sign up link or Register button
    let registrationFound = false;
    
    // Try different ways to access registration
    const signUpLink = page.locator('text="Sign up"').first();
    const registerLink = page.locator('text="Register"').first();
    const createAccountLink = page.locator('text="Create account"').first();
    
    if (await signUpLink.isVisible()) {
      console.log('✅ Found "Sign up" link');
      await signUpLink.click();
      registrationFound = true;
    } else if (await registerLink.isVisible()) {
      console.log('✅ Found "Register" link');
      await registerLink.click();
      registrationFound = true;
    } else if (await createAccountLink.isVisible()) {
      console.log('✅ Found "Create account" link');
      await createAccountLink.click();
      registrationFound = true;
    } else {
      // Try to access login first and then look for registration link
      const loginBtn = page.locator('text="Login"').first();
      if (await loginBtn.isVisible()) {
        console.log('🔑 Going to login page first...');
        await loginBtn.click();
        await page.waitForTimeout(2000);
        
        // Look for registration link on login page
        const signUpOnLogin = page.locator('text="Sign up"').first();
        if (await signUpOnLogin.isVisible()) {
          console.log('✅ Found "Sign up" on login page');
          await signUpOnLogin.click();
          registrationFound = true;
        }
      }
    }
    
    if (!registrationFound) {
      console.log('❌ Could not find registration link');
      await page.screenshot({ path: '/tmp/reg-test-no-register.png', fullPage: true });
      return;
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/reg-test-02-register-form.png', fullPage: true });
    
    console.log('\n📝 Step 2: Fill Registration Form');
    
    // Look for registration form fields
    const nameField = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]').first();
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirmation"]').first();
    
    // Generate unique test user data
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!'
    };
    
    console.log(`🧪 Test user: ${testUser.email}`);
    
    // Fill the form
    let formFilled = false;
    
    if (await nameField.isVisible()) {
      console.log('✅ Filling name field');
      await nameField.fill(testUser.name);
      formFilled = true;
    }
    
    if (await emailField.isVisible()) {
      console.log('✅ Filling email field');
      await emailField.fill(testUser.email);
      formFilled = true;
    }
    
    if (await passwordField.isVisible()) {
      console.log('✅ Filling password field');
      await passwordField.fill(testUser.password);
      formFilled = true;
    }
    
    if (await confirmPasswordField.isVisible()) {
      console.log('✅ Filling confirm password field');
      await confirmPasswordField.fill(testUser.password);
    }
    
    if (!formFilled) {
      console.log('❌ No registration form fields found');
      await page.screenshot({ path: '/tmp/reg-test-no-form.png', fullPage: true });
      return;
    }
    
    await page.screenshot({ path: '/tmp/reg-test-03-form-filled.png', fullPage: true });
    
    console.log('\n🚀 Step 3: Submit Registration');
    
    // Look for submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create")').first();
    
    if (await submitBtn.isVisible()) {
      console.log('🚀 Submitting registration...');
      await submitBtn.click();
      await page.waitForTimeout(5000); // Wait for registration to complete
      
      await page.screenshot({ path: '/tmp/reg-test-04-after-submit.png', fullPage: true });
      
      // Check if registration was successful
      const successIndicators = [
        page.locator('text="Welcome"'),
        page.locator('text="Dashboard"'),
        page.locator('text="Success"'),
        page.locator('text="Account created"'),
        page.locator('[role="alert"]:has-text("success")')
      ];
      
      let registrationSuccess = false;
      for (const indicator of successIndicators) {
        if (await indicator.count() > 0) {
          registrationSuccess = true;
          break;
        }
      }
      
      if (registrationSuccess) {
        console.log('🎉 Registration appears successful!');
        
        // Check if we're now logged in and can access the dashboard
        const dashboardAccess = await page.locator('text="Dashboard"').count() > 0;
        const quizAccess = await page.locator('text="Quiz"').count() > 0;
        
        console.log(`📊 Dashboard access: ${dashboardAccess ? '✅' : '❌'}`);
        console.log(`🎯 Quiz access: ${quizAccess ? '✅' : '❌'}`);
        
        if (dashboardAccess) {
          console.log('\n🎯 Step 4: Test Quiz Access with New User');
          
          // Try to access quiz functionality
          const quickQuiz = page.locator('text="Quick Quiz"').first();
          if (await quickQuiz.isVisible()) {
            await quickQuiz.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: '/tmp/reg-test-05-quiz-access.png', fullPage: true });
            
            // Try to start a quiz
            const startQuizBtn = page.locator('text="Start Quiz"').first();
            if (await startQuizBtn.isVisible()) {
              console.log('🚀 Attempting to start quiz with new user...');
              await startQuizBtn.click();
              await page.waitForTimeout(5000);
              await page.screenshot({ path: '/tmp/reg-test-06-quiz-started.png', fullPage: true });
              
              // Check if quiz engine loaded
              const hasQuestions = await page.locator('div, p, span').filter({ hasText: /A \d+-year-old|presents with|Which|What is/ }).count() > 0;
              console.log(`🧠 Quiz engine loaded: ${hasQuestions ? '✅' : '❌'}`);
            }
          }
        }
        
      } else {
        console.log('⚠️ Registration status unclear');
        
        // Check for error messages
        const errorMessages = await page.locator('[role="alert"], .error, [class*="error"]').allTextContents();
        if (errorMessages.length > 0) {
          console.log('🚨 Error messages found:');
          errorMessages.forEach(msg => console.log(`   - ${msg}`));
        }
      }
      
    } else {
      console.log('❌ No submit button found');
      await page.screenshot({ path: '/tmp/reg-test-no-submit.png', fullPage: true });
    }
    
    await page.screenshot({ path: '/tmp/reg-test-07-final.png', fullPage: true });
    
    console.log('\n📊 Registration Test Complete!');
    console.log('📁 Screenshots saved to /tmp/reg-test-*.png');
    
  } catch (error) {
    console.error('❌ Registration test error:', error.message);
    await page.screenshot({ path: '/tmp/reg-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();