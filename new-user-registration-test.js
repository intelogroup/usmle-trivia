import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true }); // Use headless mode for server environment
  const page = await browser.newPage();
  
  // Configure viewport for desktop testing
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Listen for console messages and errors
  page.on('console', msg => {
    console.log(`🖥️ Console [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  // Test user credentials as specified
  const newUser = {
    email: 'johndoe2025@gmail.com',
    password: 'Jimkali90#',
    name: 'John Doe'
  };
  
  try {
    console.log('🏥 MedQuiz Pro - New User Registration Test');
    console.log(`👤 Testing registration for: ${newUser.name} (${newUser.email})`);
    
    // Step 1: Navigate to landing page
    console.log('\n🎯 Step 1: Navigate to MedQuiz Pro Landing Page');
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/newuser-01-landing-page.png', fullPage: true });
    console.log('✅ Landing page loaded');
    
    // Step 2: Navigate to registration
    console.log('\n📝 Step 2: Navigate to Registration Page');
    
    // Look for registration/sign up links
    let registrationFound = false;
    const registrationSelectors = [
      'text="Sign up"',
      'text="Register"', 
      'text="Create account"',
      'a[href*="register"]',
      'a[href*="signup"]'
    ];
    
    for (const selector of registrationSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`✅ Found registration link: ${selector}`);
        await element.click();
        registrationFound = true;
        break;
      }
    }
    
    // If not found on main page, try login page first
    if (!registrationFound) {
      console.log('🔑 No direct registration link found, checking login page...');
      const loginBtn = page.locator('text="Login"').first();
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        await page.waitForTimeout(2000);
        
        // Look for sign up link on login page
        const signUpOnLogin = page.locator('text="Sign up"').first();
        if (await signUpOnLogin.isVisible()) {
          console.log('✅ Found "Sign up" link on login page');
          await signUpOnLogin.click();
          registrationFound = true;
        }
      }
    }
    
    if (!registrationFound) {
      console.log('❌ Could not find registration access');
      await page.screenshot({ path: '/tmp/newuser-error-no-registration.png', fullPage: true });
      throw new Error('Registration page not accessible');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/newuser-02-registration-form.png', fullPage: true });
    console.log('✅ Registration form loaded');
    
    // Step 3: Fill registration form
    console.log('\n✍️ Step 3: Fill Registration Form');
    
    // Locate form fields with individual selectors
    const nameField = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name"]').first();
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirmation"]').first();
    
    // Fill name field
    if (await nameField.isVisible()) {
      console.log('✅ Filling name field with: John Doe');
      await nameField.clear();
      await nameField.fill(newUser.name);
    } else {
      console.log('⚠️ Name field not found');
    }
    
    // Fill email field
    if (await emailField.isVisible()) {
      console.log('✅ Filling email field with: johndoe2025@gmail.com');
      await emailField.clear();
      await emailField.fill(newUser.email);
    } else {
      console.log('❌ Email field not found');
      throw new Error('Email field is required but not found');
    }
    
    // Fill password field
    if (await passwordField.isVisible()) {
      console.log('✅ Filling password field');
      await passwordField.clear();
      await passwordField.fill(newUser.password);
    } else {
      console.log('❌ Password field not found');
      throw new Error('Password field is required but not found');
    }
    
    // Fill confirm password if exists
    if (await confirmPasswordField.isVisible()) {
      console.log('✅ Filling confirm password field');
      await confirmPasswordField.clear();
      await confirmPasswordField.fill(newUser.password);
    }
    
    await page.screenshot({ path: '/tmp/newuser-03-form-filled.png', fullPage: true });
    console.log('✅ Registration form completed');
    
    // Step 4: Submit registration
    console.log('\n🚀 Step 4: Submit Registration');
    
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create"), input[type="submit"]').first();
    
    if (await submitBtn.isVisible()) {
      console.log('🚀 Submitting registration form...');
      await submitBtn.click();
      
      // Wait for response and potential redirect
      await page.waitForTimeout(5000);
      await page.screenshot({ path: '/tmp/newuser-04-after-submit.png', fullPage: true });
      
      // Check for registration success indicators
      const successIndicators = [
        'text="Welcome"',
        'text="Dashboard"',
        'text="Success"',
        'text="Account created"',
        'text="Registration successful"',
        '[role="alert"]:has-text("success")'
      ];
      
      let registrationSuccess = false;
      for (const indicator of successIndicators) {
        const element = page.locator(indicator);
        if (await element.count() > 0) {
          console.log(`✅ Success indicator found: ${indicator}`);
          registrationSuccess = true;
          break;
        }
      }
      
      // Check for error messages
      const errorSelectors = [
        '[role="alert"]',
        '.error',
        '[class*="error"]',
        '.alert-danger',
        'text="already exists"',
        'text="invalid"'
      ];
      
      let hasErrors = false;
      for (const selector of errorSelectors) {
        const errorElement = page.locator(selector);
        if (await errorElement.count() > 0) {
          const errorText = await errorElement.allTextContents();
          if (errorText.some(text => text.trim().length > 0)) {
            console.log(`🚨 Error found: ${errorText.join(', ')}`);
            hasErrors = true;
          }
        }
      }
      
      if (hasErrors) {
        console.log('⚠️ Registration completed but with errors/warnings');
        if (newUser.email.includes('johndoe2025')) {
          console.log('💡 Note: User may already exist - this is expected if test was run before');
        }
      } else if (registrationSuccess) {
        console.log('🎉 Registration successful!');
        
        // Step 5: Test immediate dashboard access
        console.log('\n📊 Step 5: Verify Dashboard Access');
        
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        await page.screenshot({ path: '/tmp/newuser-05-dashboard.png', fullPage: true });
        
        // Check dashboard elements
        const dashboardElements = [
          'text="Dashboard"',
          'text="Quiz"',
          'text="Quick Quiz"',
          'text="Stats"',
          'text="Progress"'
        ];
        
        for (const element of dashboardElements) {
          const found = await page.locator(element).count() > 0;
          console.log(`${found ? '✅' : '❌'} ${element}: ${found ? 'Found' : 'Not found'}`);
        }
        
        // Step 6: Test logout functionality
        console.log('\n🚪 Step 6: Test Logout');
        
        const logoutSelectors = [
          'text="Logout"',
          'text="Sign out"',
          'button:has-text("Logout")',
          '[role="menuitem"]:has-text("Logout")'
        ];
        
        let logoutFound = false;
        for (const selector of logoutSelectors) {
          const logoutBtn = page.locator(selector);
          if (await logoutBtn.isVisible()) {
            console.log(`✅ Found logout button: ${selector}`);
            await logoutBtn.click();
            logoutFound = true;
            break;
          }
        }
        
        if (!logoutFound) {
          // Try clicking on user menu/avatar first
          const userMenuSelectors = [
            '[role="button"]:has-text("John")',
            '[class*="avatar"]',
            '[class*="user-menu"]',
            'button:has-text("John Doe")'
          ];
          
          for (const selector of userMenuSelectors) {
            const userMenu = page.locator(selector);
            if (await userMenu.isVisible()) {
              console.log(`🔍 Clicking user menu: ${selector}`);
              await userMenu.click();
              await page.waitForTimeout(1000);
              
              // Now try logout again
              const logoutBtn = page.locator('text="Logout"').first();
              if (await logoutBtn.isVisible()) {
                console.log('✅ Found logout in user menu');
                await logoutBtn.click();
                logoutFound = true;
                break;
              }
            }
          }
        }
        
        if (logoutFound) {
          await page.waitForTimeout(3000);
          await page.screenshot({ path: '/tmp/newuser-06-after-logout.png', fullPage: true });
          console.log('✅ Logout completed');
          
          // Step 7: Test login with new credentials
          console.log('\n🔑 Step 7: Test Login with New Credentials');
          
          // Navigate to login page
          const loginBtn = page.locator('text="Login"').first();
          if (await loginBtn.isVisible()) {
            await loginBtn.click();
            await page.waitForTimeout(2000);
            
            // Fill login form
            const loginEmailField = page.locator('input[type="email"], input[name="email"]').first();
            const loginPasswordField = page.locator('input[type="password"], input[name="password"]').first();
            
            if (await loginEmailField.isVisible() && await loginPasswordField.isVisible()) {
              console.log('✅ Filling login form...');
              await loginEmailField.fill(newUser.email);
              await loginPasswordField.fill(newUser.password);
              
              await page.screenshot({ path: '/tmp/newuser-07-login-form.png', fullPage: true });
              
              const loginSubmitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
              if (await loginSubmitBtn.isVisible()) {
                await loginSubmitBtn.click();
                await page.waitForTimeout(5000);
                
                await page.screenshot({ path: '/tmp/newuser-08-after-login.png', fullPage: true });
                
                // Verify successful login
                const loginSuccess = await page.locator('text="Dashboard"').count() > 0 ||
                                   await page.locator('text="Welcome"').count() > 0;
                
                console.log(`🔐 Login verification: ${loginSuccess ? '✅ Success' : '❌ Failed'}`);
                
                if (loginSuccess) {
                  // Step 8: Test quiz access
                  console.log('\n🧠 Step 8: Test Quiz Access with New User');
                  
                  const quickQuizBtn = page.locator('text="Quick Quiz"').first();
                  if (await quickQuizBtn.isVisible()) {
                    await quickQuizBtn.click();
                    await page.waitForTimeout(3000);
                    
                    await page.screenshot({ path: '/tmp/newuser-09-quiz-access.png', fullPage: true });
                    
                    const startQuizBtn = page.locator('text="Start Quiz"').first();
                    if (await startQuizBtn.isVisible()) {
                      console.log('🚀 Starting quiz with new user...');
                      await startQuizBtn.click();
                      await page.waitForTimeout(5000);
                      
                      await page.screenshot({ path: '/tmp/newuser-10-quiz-started.png', fullPage: true });
                      
                      // Check if quiz questions loaded
                      const hasQuestionContent = await page.locator('div, p, span').filter({ 
                        hasText: /A \d+-year-old|presents with|Which|What is|patient|diagnosis/i 
                      }).count() > 0;
                      
                      console.log(`🧠 Quiz engine loaded: ${hasQuestionContent ? '✅ Success' : '❌ Failed'}`);
                      
                      if (hasQuestionContent) {
                        // Try to answer a question
                        const answerOptions = page.locator('input[type="radio"], button[role="radio"], [class*="option"]');
                        const optionCount = await answerOptions.count();
                        
                        if (optionCount > 0) {
                          console.log(`📝 Found ${optionCount} answer options`);
                          await answerOptions.first().click();
                          await page.waitForTimeout(1000);
                          
                          // Look for submit/next button
                          const submitAnswerBtn = page.locator('button:has-text("Submit"), button:has-text("Next")').first();
                          if (await submitAnswerBtn.isVisible()) {
                            await submitAnswerBtn.click();
                            await page.waitForTimeout(2000);
                            
                            await page.screenshot({ path: '/tmp/newuser-11-quiz-interaction.png', fullPage: true });
                            console.log('✅ Quiz interaction successful');
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          console.log('⚠️ Logout button not found');
        }
      } else {
        console.log('⚠️ Registration status unclear - no clear success indicators');
      }
      
    } else {
      console.log('❌ Submit button not found');
      await page.screenshot({ path: '/tmp/newuser-error-no-submit.png', fullPage: true });
    }
    
    // Final screenshot
    await page.screenshot({ path: '/tmp/newuser-12-final-state.png', fullPage: true });
    
    console.log('\n🏆 Comprehensive Registration Test Complete!');
    console.log('📁 Screenshots saved to /tmp/newuser-*.png');
    console.log('\n📊 Test Summary:');
    console.log(`👤 User: ${newUser.name}`);
    console.log(`📧 Email: ${newUser.email}`);
    console.log('🔍 Check screenshots for detailed verification');
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
    await page.screenshot({ path: '/tmp/newuser-error-final.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
})();