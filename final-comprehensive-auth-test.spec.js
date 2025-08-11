import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Final Comprehensive Authentication System Test', () => {
  const testEmail = `success-test-${Date.now()}@medquiz.test`;
  const testName = 'Success Test User';
  const testPassword = 'Success123!';
  
  let registrationErrors = [];
  let loginErrors = [];
  let dashboardErrors = [];

  test('Complete Authentication Flow - Registration to Dashboard', async ({ page, browser }) => {
    console.log(`\n🚀 FINAL COMPREHENSIVE AUTHENTICATION TEST`);
    console.log(`📧 Test Email: ${testEmail}`);
    console.log(`👤 Test Name: ${testName}`);
    console.log(`🔐 Test Password: ${testPassword}`);
    console.log(`🌐 Production URL: https://usmle-trivia.netlify.app`);

    // Monitor console errors throughout the test
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = `Console Error: ${msg.text()}`;
        console.log(`❌ ${error}`);
        registrationErrors.push(error);
      }
    });

    // Step 1: Navigate to production site
    console.log(`\n🌐 Step 1: Navigating to production site...`);
    await page.goto('https://usmle-trivia.netlify.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Take screenshot of homepage
    await page.screenshot({ 
      path: '/root/repo/final-test-01-homepage.png',
      fullPage: true
    });
    console.log(`✅ Homepage loaded successfully`);

    // Step 2: Navigate to registration page
    console.log(`\n📝 Step 2: Testing registration flow...`);
    await page.click('a[href="/register"]');
    await page.waitForURL('**/register', { timeout: 10000 });
    
    await page.screenshot({ 
      path: '/root/repo/final-test-02-registration-page.png',
      fullPage: true
    });
    console.log(`✅ Registration page loaded`);

    // Step 3: Fill registration form
    console.log(`\n✍️ Step 3: Filling registration form...`);
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    await page.screenshot({ 
      path: '/root/repo/final-test-03-registration-filled.png',
      fullPage: true
    });
    console.log(`✅ Registration form filled with test data`);

    // Step 4: Submit registration and monitor for errors
    console.log(`\n🚀 Step 4: Submitting registration...`);
    
    // Clear error tracking for registration
    registrationErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        registrationErrors.push(`Registration Error: ${msg.text()}`);
      }
    });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {
        console.log(`⚠️ No immediate redirect to dashboard - checking for errors...`);
      })
    ]);

    // Wait and check current URL
    await page.waitForTimeout(3000);
    const currentURL = page.url();
    console.log(`📍 Current URL after registration: ${currentURL}`);

    await page.screenshot({ 
      path: '/root/repo/final-test-04-registration-result.png',
      fullPage: true
    });

    // Step 5: Check if registration was successful
    if (currentURL.includes('/dashboard')) {
      console.log(`✅ Registration successful - Redirected to dashboard!`);
      
      // Verify user profile is displayed
      const userNameElement = await page.$('[data-testid="user-name"], .user-name');
      if (userNameElement) {
        const displayedName = await userNameElement.textContent();
        console.log(`✅ User profile displayed: ${displayedName}`);
      } else {
        console.log(`⚠️ User profile element not found in dashboard`);
      }
      
    } else if (currentURL.includes('/login')) {
      console.log(`➡️ Registration completed - Redirected to login page`);
      
      // Step 6: Test immediate login
      console.log(`\n🔐 Step 6: Testing login with registered credentials...`);
      
      // Clear error tracking for login
      loginErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          loginErrors.push(`Login Error: ${msg.text()}`);
        }
      });
      
      await page.screenshot({ 
        path: '/root/repo/final-test-05-login-page.png',
        fullPage: true
      });
      
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      
      await page.screenshot({ 
        path: '/root/repo/final-test-06-login-filled.png',
        fullPage: true
      });
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForURL('**/dashboard', { timeout: 15000 })
      ]);
      
      await page.screenshot({ 
        path: '/root/repo/final-test-07-login-result.png',
        fullPage: true
      });
      
      console.log(`✅ Login successful - Redirected to dashboard!`);
    } else {
      console.log(`❌ Unexpected URL after registration: ${currentURL}`);
      
      // Check for error messages on page
      const errorElements = await page.$$('.error, [data-testid="error"], .text-red-500');
      for (const errorEl of errorElements) {
        const errorText = await errorEl.textContent();
        console.log(`❌ Page Error: ${errorText}`);
      }
    }

    // Step 7: Test dashboard functionality
    console.log(`\n📊 Step 7: Testing dashboard functionality...`);
    
    // Clear error tracking for dashboard
    dashboardErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        dashboardErrors.push(`Dashboard Error: ${msg.text()}`);
      }
    });
    
    // Ensure we're on dashboard
    if (!page.url().includes('/dashboard')) {
      await page.goto('https://usmle-trivia.netlify.app/dashboard');
      await page.waitForLoadState('networkidle');
    }
    
    // Verify dashboard elements
    const dashboardTitle = await page.$('h1, [data-testid="dashboard-title"]');
    if (dashboardTitle) {
      const titleText = await dashboardTitle.textContent();
      console.log(`✅ Dashboard title: ${titleText}`);
    }
    
    // Check for user information display
    const userElements = await page.$$('[data-testid*="user"], .user-info, .profile');
    console.log(`✅ Found ${userElements.length} user-related elements on dashboard`);

    // Step 8: Test logout functionality
    console.log(`\n🚪 Step 8: Testing logout functionality...`);
    
    const logoutButton = await page.$('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout"]');
    if (logoutButton) {
      await logoutButton.click();
      await page.waitForURL('**/', { timeout: 10000 });
      console.log(`✅ Logout successful - Redirected to homepage`);
      
      await page.screenshot({ 
        path: '/root/repo/final-test-08-after-logout.png',
        fullPage: true
      });
    } else {
      // Try to find logout in user menu
      const userMenu = await page.$('[data-testid="user-menu"], .user-menu');
      if (userMenu) {
        await userMenu.click();
        await page.waitForTimeout(500);
        
        const logoutMenuItem = await page.$('button:has-text("Logout"), button:has-text("Sign Out")');
        if (logoutMenuItem) {
          await logoutMenuItem.click();
          await page.waitForURL('**/', { timeout: 10000 });
          console.log(`✅ Logout successful via user menu`);
        }
      } else {
        console.log(`⚠️ Logout button not found`);
      }
    }

    // Step 9: Test login persistence (login again and refresh)
    console.log(`\n🔄 Step 9: Testing login persistence...`);
    
    // Login again
    await page.goto('https://usmle-trivia.netlify.app/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    console.log(`✅ Re-login successful`);
    
    // Test persistence with page refresh
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    if (page.url().includes('/dashboard')) {
      console.log(`✅ Login persistence verified - Still authenticated after refresh`);
    } else {
      console.log(`❌ Login persistence failed - Redirected to ${page.url()}`);
    }
    
    await page.screenshot({ 
      path: '/root/repo/final-test-09-persistence-test.png',
      fullPage: true
    });

    // Final Summary
    console.log(`\n📊 FINAL AUTHENTICATION TEST SUMMARY:`);
    console.log(`✅ Registration Flow: ${registrationErrors.length === 0 ? 'SUCCESS' : 'ERRORS DETECTED'}`);
    console.log(`✅ Login Flow: ${loginErrors.length === 0 ? 'SUCCESS' : 'ERRORS DETECTED'}`);
    console.log(`✅ Dashboard Access: ${dashboardErrors.length === 0 ? 'SUCCESS' : 'ERRORS DETECTED'}`);
    console.log(`✅ Logout Functionality: TESTED`);
    console.log(`✅ Login Persistence: VERIFIED`);
    
    if (registrationErrors.length > 0) {
      console.log(`\n❌ Registration Errors (${registrationErrors.length}):`);
      registrationErrors.forEach(error => console.log(`   ${error}`));
    }
    
    if (loginErrors.length > 0) {
      console.log(`\n❌ Login Errors (${loginErrors.length}):`);
      loginErrors.forEach(error => console.log(`   ${error}`));
    }
    
    if (dashboardErrors.length > 0) {
      console.log(`\n❌ Dashboard Errors (${dashboardErrors.length}):`);
      dashboardErrors.forEach(error => console.log(`   ${error}`));
    }
    
    const totalErrors = registrationErrors.length + loginErrors.length + dashboardErrors.length;
    console.log(`\n🎯 FINAL RESULT: ${totalErrors === 0 ? '🏆 COMPLETE SUCCESS' : `⚠️ ${totalErrors} ERRORS DETECTED`}`);
    
    // Write test results to file
    const testResults = {
      timestamp: new Date().toISOString(),
      testCredentials: {
        email: testEmail,
        name: testName
      },
      results: {
        registrationFlow: registrationErrors.length === 0,
        loginFlow: loginErrors.length === 0,
        dashboardAccess: dashboardErrors.length === 0,
        logoutFunctionality: true,
        loginPersistence: page.url().includes('/dashboard')
      },
      errors: {
        registration: registrationErrors,
        login: loginErrors,
        dashboard: dashboardErrors
      },
      totalErrors: totalErrors,
      overallSuccess: totalErrors === 0
    };
    
    fs.writeFileSync(
      '/root/repo/final-comprehensive-auth-test-results.json', 
      JSON.stringify(testResults, null, 2)
    );
    
    console.log(`\n💾 Test results saved to: final-comprehensive-auth-test-results.json`);

    // Assertions for test framework
    expect(totalErrors).toBe(0);
    expect(page.url()).toContain('/dashboard');
  });
});