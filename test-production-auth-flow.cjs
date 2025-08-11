#!/usr/bin/env node

/**
 * Test Complete Authentication Flow on Production Site
 * Tests: Registration → Login → Dashboard → Logout → Login Again
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function testProductionAuth() {
  console.log('🧪 Testing Complete Authentication Flow on Production Site');
  console.log('🔗 Site: https://usmle-trivia.netlify.app/');
  
  const browser = await chromium.launch({ headless: true, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    testResults: [],
    screenshots: [],
    errors: [],
    networkLogs: []
  };
  
  // Listen for console messages and network errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.errors.push(`Console Error: ${msg.text()}`);
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  page.on('response', response => {
    if (!response.ok()) {
      results.networkLogs.push(`Failed: ${response.status()} ${response.url()}`);
      console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
    }
  });

  try {
    // Step 1: Load homepage
    console.log('\n🏠 Step 1: Loading Homepage...');
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'production-auth-01-homepage.png', fullPage: true });
    results.screenshots.push('production-auth-01-homepage.png');
    results.testResults.push('✅ Homepage loaded successfully');
    
    // Step 2: Navigate to registration
    console.log('\n📝 Step 2: Testing Registration Flow...');
    
    // Look for registration link/button
    const registerButtons = await page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Sign up"), a:has-text("Sign up"), button:has-text("Register"), a:has-text("Register")').count();
    console.log(`Found ${registerButtons} registration buttons/links`);
    
    if (registerButtons > 0) {
      await page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Sign up"), a:has-text("Sign up"), button:has-text("Register"), a:has-text("Register")').first().click();
      await page.waitForTimeout(2000);
    } else {
      // Try navigating directly to register page
      await page.goto('https://usmle-trivia.netlify.app/register');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'production-auth-02-register-page.png', fullPage: true });
    results.screenshots.push('production-auth-02-register-page.png');
    
    // Test registration form
    const testEmail = `test_${Date.now()}@medicalstudent.edu`;
    const testPassword = 'MedQuiz2025!';
    const testName = 'Dr. Test User';
    
    console.log(`📧 Testing registration with: ${testEmail}`);
    
    // Fill registration form
    const emailInput = await page.locator('input[type="email"], input[placeholder*="email" i], input[name="email"]').count();
    const passwordInput = await page.locator('input[type="password"], input[placeholder*="password" i], input[name="password"]').count();
    const nameInput = await page.locator('input[placeholder*="name" i], input[name="name"], input[type="text"]').count();
    
    console.log(`Found inputs - Email: ${emailInput}, Password: ${passwordInput}, Name: ${nameInput}`);
    
    if (emailInput > 0 && passwordInput > 0) {
      await page.locator('input[type="email"], input[placeholder*="email" i], input[name="email"]').first().fill(testEmail);
      
      if (nameInput > 0) {
        await page.locator('input[placeholder*="name" i], input[name="name"], input[type="text"]').first().fill(testName);
      }
      
      // Handle password - might be multiple password fields
      const passwordFields = await page.locator('input[type="password"], input[placeholder*="password" i], input[name="password"]').count();
      await page.locator('input[type="password"], input[placeholder*="password" i], input[name="password"]').first().fill(testPassword);
      
      if (passwordFields > 1) {
        // Might have confirm password field
        await page.locator('input[type="password"], input[placeholder*="password" i], input[name="password"]').nth(1).fill(testPassword);
      }
      
      await page.screenshot({ path: 'production-auth-03-register-filled.png', fullPage: true });
      results.screenshots.push('production-auth-03-register-filled.png');
      
      // Submit registration
      const submitButtons = await page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign up"), button:has-text("Create")').count();
      console.log(`Found ${submitButtons} submit buttons`);
      
      if (submitButtons > 0) {
        await page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign up"), button:has-text("Create")').first().click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: 'production-auth-04-after-registration.png', fullPage: true });
        results.screenshots.push('production-auth-04-after-registration.png');
        
        // Check if we're now logged in (dashboard, profile, etc.)
        const currentUrl = page.url();
        console.log(`After registration, current URL: ${currentUrl}`);
        
        const dashboardIndicators = await page.locator('[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard"), h2:has-text("Welcome")').count();
        const loginIndicators = await page.locator('button:has-text("Login"), a:has-text("Login"), input[type="email"]').count();
        
        if (dashboardIndicators > 0) {
          results.testResults.push('✅ Registration successful - redirected to dashboard');
          console.log('✅ Registration successful - user logged in');
        } else if (loginIndicators > 0) {
          results.testResults.push('⚠️ Registration completed but redirected to login');
          console.log('⚠️ Registration completed but user needs to log in');
        } else {
          results.testResults.push('❓ Registration status unclear');
          console.log('❓ Registration status unclear');
        }
      } else {
        results.testResults.push('❌ No submit button found on registration form');
      }
    } else {
      results.testResults.push('❌ Registration form inputs not found');
    }

    // Step 3: Test login flow
    console.log('\n🔐 Step 3: Testing Login Flow...');
    
    // Navigate to login page
    const loginButtons = await page.locator('button:has-text("Login"), a:has-text("Login"), button:has-text("Sign in"), a:has-text("Sign in")').count();
    
    if (loginButtons > 0) {
      await page.locator('button:has-text("Login"), a:has-text("Login"), button:has-text("Sign in"), a:has-text("Sign in")').first().click();
      await page.waitForTimeout(2000);
    } else {
      await page.goto('https://usmle-trivia.netlify.app/login');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'production-auth-05-login-page.png', fullPage: true });
    results.screenshots.push('production-auth-05-login-page.png');
    
    // Test with the account we just created
    const loginEmailInput = await page.locator('input[type="email"], input[placeholder*="email" i], input[name="email"]').count();
    const loginPasswordInput = await page.locator('input[type="password"], input[placeholder*="password" i], input[name="password"]').count();
    
    if (loginEmailInput > 0 && loginPasswordInput > 0) {
      await page.locator('input[type="email"], input[placeholder*="email" i], input[name="email"]').first().fill(testEmail);
      await page.locator('input[type="password"], input[placeholder*="password" i], input[name="password"]').first().fill(testPassword);
      
      await page.screenshot({ path: 'production-auth-06-login-filled.png', fullPage: true });
      results.screenshots.push('production-auth-06-login-filled.png');
      
      // Submit login
      const loginSubmitButtons = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').count();
      
      if (loginSubmitButtons > 0) {
        await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
        await page.waitForTimeout(5000); // Wait longer for login
        
        await page.screenshot({ path: 'production-auth-07-after-login.png', fullPage: true });
        results.screenshots.push('production-auth-07-after-login.png');
        
        // Check login success
        const currentUrl = page.url();
        console.log(`After login, current URL: ${currentUrl}`);
        
        const dashboardIndicators = await page.locator('[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard"), h2:has-text("Welcome"), button:has-text("Start Quiz")').count();
        const userMenus = await page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile"), button:has-text("Logout")').count();
        
        if (dashboardIndicators > 0 || userMenus > 0) {
          results.testResults.push('✅ Login successful - dashboard accessible');
          console.log('✅ Login successful');
          
          // Step 4: Test authenticated features
          console.log('\n🎯 Step 4: Testing Authenticated Features...');
          
          // Try to access dashboard
          await page.goto('https://usmle-trivia.netlify.app/dashboard');
          await page.waitForTimeout(2000);
          
          await page.screenshot({ path: 'production-auth-08-dashboard.png', fullPage: true });
          results.screenshots.push('production-auth-08-dashboard.png');
          
          const authContent = await page.locator('h1, h2, .welcome, [data-testid="dashboard"]').count();
          if (authContent > 0) {
            results.testResults.push('✅ Dashboard accessible when authenticated');
          } else {
            results.testResults.push('❌ Dashboard not accessible after login');
          }
          
          // Step 5: Test logout
          console.log('\n🚪 Step 5: Testing Logout...');
          
          const logoutButtons = await page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")').count();
          
          if (logoutButtons > 0) {
            await page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")').first().click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ path: 'production-auth-09-after-logout.png', fullPage: true });
            results.screenshots.push('production-auth-09-after-logout.png');
            
            // Verify logout by trying to access dashboard
            await page.goto('https://usmle-trivia.netlify.app/dashboard');
            await page.waitForTimeout(2000);
            
            const currentUrlAfterLogout = page.url();
            
            if (currentUrlAfterLogout.includes('/login') || currentUrlAfterLogout === 'https://usmle-trivia.netlify.app/') {
              results.testResults.push('✅ Logout successful - redirected to login/home');
            } else {
              results.testResults.push('❌ Logout may have failed - still on protected page');
            }
          } else {
            results.testResults.push('❌ Logout button not found');
          }
          
        } else {
          results.testResults.push('❌ Login failed - no dashboard indicators found');
          
          // Check for error messages
          const errorMessages = await page.locator('.error, [role="alert"], .alert-danger, .text-red').count();
          if (errorMessages > 0) {
            const errorText = await page.locator('.error, [role="alert"], .alert-danger, .text-red').first().textContent();
            results.errors.push(`Login Error: ${errorText}`);
            console.log(`❌ Login Error: ${errorText}`);
          }
        }
      } else {
        results.testResults.push('❌ No login submit button found');
      }
    } else {
      results.testResults.push('❌ Login form inputs not found');
    }

    // Step 6: Test with existing known credentials
    console.log('\n🔄 Step 6: Testing Known Credentials...');
    
    await page.goto('https://usmle-trivia.netlify.app/login');
    await page.waitForTimeout(2000);
    
    // Test with jayveedz19@gmail.com
    const knownEmail = 'jayveedz19@gmail.com';
    const knownPassword = 'Jimkali90#';
    
    const knownEmailInput = await page.locator('input[type="email"], input[placeholder*="email" i], input[name="email"]').count();
    const knownPasswordInput = await page.locator('input[type="password"], input[placeholder*="password" i], input[name="password"]').count();
    
    if (knownEmailInput > 0 && knownPasswordInput > 0) {
      await page.locator('input[type="email"], input[placeholder*="email" i], input[name="email"]').first().fill(knownEmail);
      await page.locator('input[type="password"], input[placeholder*="password" i], input[name="password"]').first().fill(knownPassword);
      
      await page.screenshot({ path: 'production-auth-10-known-credentials.png', fullPage: true });
      results.screenshots.push('production-auth-10-known-credentials.png');
      
      const knownSubmitButtons = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').count();
      
      if (knownSubmitButtons > 0) {
        await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
        await page.waitForTimeout(5000);
        
        await page.screenshot({ path: 'production-auth-11-known-login-result.png', fullPage: true });
        results.screenshots.push('production-auth-11-known-login-result.png');
        
        const currentUrl = page.url();
        console.log(`After known credentials login, current URL: ${currentUrl}`);
        
        const dashboardSuccess = await page.locator('[data-testid="dashboard"], .dashboard, h1:has-text("Dashboard"), h2:has-text("Welcome"), button:has-text("Start Quiz")').count();
        
        if (dashboardSuccess > 0) {
          results.testResults.push('✅ Known credentials login successful');
          console.log('✅ Known credentials (jayveedz19@gmail.com) login successful');
          
          // Get user info from page
          try {
            const userName = await page.locator('h1, h2, .welcome').first().textContent();
            console.log(`👤 User displayed as: ${userName}`);
            results.testResults.push(`✅ User name displayed: ${userName}`);
          } catch (e) {
            console.log('ℹ️ Could not extract user name from page');
          }
          
        } else {
          results.testResults.push('❌ Known credentials login failed');
          
          // Check for specific error messages
          const errorElements = await page.locator('.error, [role="alert"], .alert-danger, .text-red, .text-danger').count();
          if (errorElements > 0) {
            for (let i = 0; i < errorElements; i++) {
              const errorText = await page.locator('.error, [role="alert"], .alert-danger, .text-red, .text-danger').nth(i).textContent();
              results.errors.push(`Known Credentials Error: ${errorText}`);
              console.log(`❌ Error: ${errorText}`);
            }
          }
        }
      }
    }

    // Final screenshot
    await page.screenshot({ path: 'production-auth-12-final-state.png', fullPage: true });
    results.screenshots.push('production-auth-12-final-state.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
    results.errors.push(`Test Exception: ${error.message}`);
    
    try {
      await page.screenshot({ path: 'production-auth-ERROR.png', fullPage: true });
      results.screenshots.push('production-auth-ERROR.png');
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError);
    }
  } finally {
    await browser.close();
  }

  // Save results
  fs.writeFileSync('production-auth-test-results.json', JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('🧪 PRODUCTION AUTHENTICATION TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n✅ Successful Tests:');
  results.testResults.filter(result => result.startsWith('✅')).forEach(result => {
    console.log(`  ${result}`);
  });
  
  console.log('\n⚠️ Warnings:');
  results.testResults.filter(result => result.startsWith('⚠️')).forEach(result => {
    console.log(`  ${result}`);
  });
  
  console.log('\n❌ Failed Tests:');
  results.testResults.filter(result => result.startsWith('❌')).forEach(result => {
    console.log(`  ${result}`);
  });
  
  console.log('\n🚨 Errors Encountered:');
  results.errors.forEach(error => {
    console.log(`  ${error}`);
  });
  
  console.log('\n📸 Screenshots captured:');
  results.screenshots.forEach(screenshot => {
    console.log(`  ${screenshot}`);
  });
  
  console.log('\n📊 Network Issues:');
  results.networkLogs.forEach(log => {
    console.log(`  ${log}`);
  });
  
  console.log('\nTest completed at:', new Date().toISOString());
  console.log('Results saved to: production-auth-test-results.json');
}

if (require.main === module) {
  testProductionAuth().catch(console.error);
}

module.exports = { testProductionAuth };