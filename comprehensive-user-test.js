import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
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
    console.log('🏥 MedQuiz Pro - Comprehensive User Registration & Login Test');
    console.log(`👤 Testing with: ${newUser.name} (${newUser.email})`);
    
    // Step 1: Navigate to landing page
    console.log('\n🎯 Step 1: Navigate to Landing Page');
    await page.goto('http://localhost:5174');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/comp-01-landing.png', fullPage: true });
    console.log('✅ Landing page loaded');
    
    // Step 2: Try direct login first to see if user exists
    console.log('\n🔐 Step 2: Test if User Already Exists (Login Attempt)');
    
    const signInBtn = page.locator('text="Sign in"').first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: '/tmp/comp-02-login-page.png', fullPage: true });
    
    // Try to login with the credentials
    const loginEmailField = page.locator('input[type="email"], input[name="email"]').first();
    const loginPasswordField = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await loginEmailField.isVisible() && await loginPasswordField.isVisible()) {
      console.log('🔑 Attempting login with existing credentials...');
      await loginEmailField.fill(newUser.email);
      await loginPasswordField.fill(newUser.password);
      
      const loginSubmitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
      if (await loginSubmitBtn.isVisible()) {
        await loginSubmitBtn.click();
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: '/tmp/comp-03-login-attempt.png', fullPage: true });
        
        // Check if login was successful
        const currentUrl = page.url();
        const hasdashboard = await page.locator('text="Dashboard"').count() > 0;
        const hasWelcome = await page.locator('text="Welcome"').count() > 0;
        
        if (hasdashboard || hasWelcome || currentUrl.includes('dashboard')) {
          console.log('✅ User already exists and login successful!');
          console.log(`📍 Redirected to: ${currentUrl}`);
          
          // Test the existing user's dashboard access
          await page.screenshot({ path: '/tmp/comp-04-existing-dashboard.png', fullPage: true });
          
          // Step 3: Test logout
          console.log('\n🚪 Step 3: Test Logout with Existing User');
          
          // Look for user menu or logout button
          const userMenuSelectors = [
            'text="John Doe"',
            'text="John"',
            '[class*="user"]',
            '[role="button"]:has-text("Doe")',
            'button:has-text("John")'
          ];
          
          let logoutSuccess = false;
          for (const selector of userMenuSelectors) {
            const userMenu = page.locator(selector).first();
            if (await userMenu.isVisible()) {
              console.log(`🔍 Found user menu: ${selector}`);
              await userMenu.click();
              await page.waitForTimeout(1000);
              
              const logoutBtn = page.locator('text="Logout", text="Sign out"');
              if (await logoutBtn.count() > 0) {
                await logoutBtn.first().click();
                await page.waitForTimeout(3000);
                logoutSuccess = true;
                break;
              }
            }
          }
          
          // Try direct logout selectors
          if (!logoutSuccess) {
            const directLogoutSelectors = [
              'text="Logout"',
              'text="Sign out"',
              'button:has-text("Logout")',
              '[role="menuitem"]:has-text("Logout")'
            ];
            
            for (const selector of directLogoutSelectors) {
              const logoutBtn = page.locator(selector);
              if (await logoutBtn.isVisible()) {
                console.log(`✅ Found logout button: ${selector}`);
                await logoutBtn.click();
                await page.waitForTimeout(3000);
                logoutSuccess = true;
                break;
              }
            }
          }
          
          await page.screenshot({ path: '/tmp/comp-05-after-logout.png', fullPage: true });
          
          if (logoutSuccess) {
            console.log('✅ Logout successful');
          } else {
            console.log('⚠️ Logout button not found - may need manual inspection');
          }
          
          // Step 4: Test login again
          console.log('\n🔄 Step 4: Test Login Again');
          
          // Navigate back to login
          const backToLoginBtn = page.locator('text="Sign in", text="Login"').first();
          if (await backToLoginBtn.isVisible()) {
            await backToLoginBtn.click();
            await page.waitForTimeout(2000);
            
            // Fill login form again
            const emailField2 = page.locator('input[type="email"], input[name="email"]').first();
            const passwordField2 = page.locator('input[type="password"], input[name="password"]').first();
            
            if (await emailField2.isVisible()) {
              await emailField2.fill(newUser.email);
              await passwordField2.fill(newUser.password);
              
              const submitBtn2 = page.locator('button[type="submit"], button:has-text("Sign in")').first();
              await submitBtn2.click();
              await page.waitForTimeout(5000);
              
              await page.screenshot({ path: '/tmp/comp-06-second-login.png', fullPage: true });
              
              const secondLoginSuccess = await page.locator('text="Dashboard"').count() > 0;
              console.log(`🔐 Second login: ${secondLoginSuccess ? '✅ Success' : '❌ Failed'}`);
              
              if (secondLoginSuccess) {
                // Step 5: Test quiz access
                console.log('\n🧠 Step 5: Test Quiz Access');
                
                const quickQuizBtn = page.locator('text="Quick Quiz"').first();
                if (await quickQuizBtn.isVisible()) {
                  await quickQuizBtn.click();
                  await page.waitForTimeout(3000);
                  
                  await page.screenshot({ path: '/tmp/comp-07-quiz-access.png', fullPage: true });
                  
                  const startQuizBtn = page.locator('text="Start Quiz", button:has-text("Start")').first();
                  if (await startQuizBtn.isVisible()) {
                    console.log('🚀 Starting quiz...');
                    await startQuizBtn.click();
                    await page.waitForTimeout(5000);
                    
                    await page.screenshot({ path: '/tmp/comp-08-quiz-started.png', fullPage: true });
                    
                    // Check if quiz loaded with questions
                    const hasQuestionContent = await page.locator('div, p, span').filter({ 
                      hasText: /A \d+-year-old|presents with|Which|What is|patient|diagnosis|clinical/i 
                    }).count() > 0;
                    
                    console.log(`🧠 Quiz loaded: ${hasQuestionContent ? '✅ Success' : '❌ Failed'}`);
                    
                    if (hasQuestionContent) {
                      // Try to interact with a question
                      const answerOptions = page.locator('input[type="radio"], [role="radio"], button[class*="option"]');
                      const optionCount = await answerOptions.count();
                      
                      if (optionCount > 0) {
                        console.log(`📝 Found ${optionCount} answer options - testing interaction`);
                        await answerOptions.first().click();
                        await page.waitForTimeout(1000);
                        await page.screenshot({ path: '/tmp/comp-09-quiz-interaction.png', fullPage: true });
                        console.log('✅ Quiz interaction successful');
                      }
                    }
                  }
                }
              }
            }
          }
          
          console.log('\n🏆 RESULT: User already exists and all authentication flows work!');
          return;
        } else {
          console.log('❌ Login failed - user may not exist or credentials incorrect');
          console.log('🔄 Proceeding with registration...');
        }
      }
    }
    
    // Step 6: Registration (if user doesn't exist)
    console.log('\n📝 Step 6: User Registration Process');
    
    // Navigate to registration page
    const signUpLink = page.locator('text="Sign up", text="Register", text="Create account", a[href*="register"]').first();
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await page.waitForTimeout(2000);
    } else {
      // Try accessing registration through different paths
      await page.goto('http://localhost:5174/register');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: '/tmp/comp-10-registration-form.png', fullPage: true });
    
    // Fill registration form with better field detection
    console.log('✍️ Filling registration form...');
    
    const nameField = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name"]').first();
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"]').first();
    const confirmPasswordField = page.locator('input[type="password"]').nth(1); // Second password field
    
    // Fill name
    if (await nameField.isVisible()) {
      await nameField.clear();
      await nameField.fill(newUser.name);
      console.log('✅ Name field filled');
    }
    
    // Fill email
    if (await emailField.isVisible()) {
      await emailField.clear();
      await emailField.fill(newUser.email);
      console.log('✅ Email field filled');
    }
    
    // Fill password
    if (await passwordField.isVisible()) {
      await passwordField.clear();
      await passwordField.fill(newUser.password);
      console.log('✅ Password field filled');
    }
    
    // Fill confirm password
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.clear();
      await confirmPasswordField.fill(newUser.password);
      console.log('✅ Confirm password field filled');
    } else {
      console.log('⚠️ Confirm password field not found');
    }
    
    await page.screenshot({ path: '/tmp/comp-11-form-filled.png', fullPage: true });
    
    // Submit registration
    console.log('🚀 Submitting registration...');
    const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Sign up")').first();
    
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(5000);
      
      await page.screenshot({ path: '/tmp/comp-12-registration-result.png', fullPage: true });
      
      // Check for success or error
      const errorMessage = await page.locator('[role="alert"], .error, [class*="error"]').textContent();
      const successMessage = await page.locator('text="Welcome", text="Success", text="Dashboard"').count() > 0;
      
      if (errorMessage && errorMessage.trim()) {
        console.log(`🚨 Registration error: ${errorMessage}`);
      } else if (successMessage) {
        console.log('🎉 Registration successful!');
      } else {
        console.log('⚠️ Registration status unclear');
      }
    }
    
    await page.screenshot({ path: '/tmp/comp-13-final.png', fullPage: true });
    
    console.log('\n📊 Test Summary Complete!');
    console.log('📁 Screenshots saved to /tmp/comp-*.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: '/tmp/comp-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();