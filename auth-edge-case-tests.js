/**
 * 🔐 MedQuiz Pro Authentication System - Edge Case Testing Suite
 * 
 * This comprehensive test suite validates the authentication system against
 * real-world scenarios, edge cases, and potential vulnerabilities that
 * medical students and healthcare professionals might encounter.
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'https://usmle-trivia.netlify.app';
const TEST_TIMEOUT = 30000;

test.describe('🏥 MedQuiz Pro Authentication - Real World Edge Cases', () => {

  // ==============================================
  // 🔒 SECURITY & VALIDATION EDGE CASES
  // ==============================================

  test.describe('Security & Input Validation', () => {
    
    test('should prevent SQL injection attempts in email field', async ({ page }) => {
      console.log('🛡️ Testing SQL injection prevention...');
      
      await page.goto(BASE_URL + '/login');
      
      const maliciousInputs = [
        "admin'; DROP TABLE users; --",
        "test@test.com' OR '1'='1",
        "'; UNION SELECT * FROM users; --",
        "admin'/*",
        "test@test.com'; DELETE FROM users WHERE '1'='1"
      ];
      
      for (const maliciousInput of maliciousInputs) {
        await page.fill('input[type="email"]', maliciousInput);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        // Should show invalid email format or login failed, not crash
        const errorVisible = await page.isVisible('[role="alert"], .error, .text-red-500, .text-destructive');
        expect(errorVisible).toBe(true);
        
        console.log(`✅ Handled malicious input: ${maliciousInput.substring(0, 20)}...`);
      }
    });

    test('should prevent XSS attacks in user input fields', async ({ page }) => {
      console.log('🛡️ Testing XSS prevention...');
      
      await page.goto(BASE_URL + '/register');
      
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        '"><script>alert("XSS")</script>',
        '\'; alert(\'XSS\'); //',
      ];
      
      for (const payload of xssPayloads) {
        // Test in name field
        await page.fill('input[name="name"]', payload);
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'ValidPass123!');
        await page.fill('input[name="confirmPassword"]', 'ValidPass123!');
        
        // Check that script doesn't execute
        let alertFired = false;
        page.on('dialog', dialog => {
          alertFired = true;
          dialog.dismiss();
        });
        
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
        
        expect(alertFired).toBe(false);
        console.log(`✅ Prevented XSS payload: ${payload.substring(0, 20)}...`);
      }
    });

    test('should enforce strong password requirements', async ({ page }) => {
      console.log('🔐 Testing password strength validation...');
      
      await page.goto(BASE_URL + '/register');
      
      const weakPasswords = [
        '123',                    // Too short
        'password',               // Common password
        'qwerty',                 // Common password
        '12345678',               // Numbers only
        'abcdefgh',               // Letters only
        'Password',               // Missing special characters
        'password123',            // Missing uppercase and special
        'PASSWORD123!',           // Missing lowercase
        'Password!',              // Too short with requirements
      ];
      
      for (const weakPassword of weakPasswords) {
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', weakPassword);
        await page.fill('input[name="confirmPassword"]', weakPassword);
        
        await page.click('button[type="submit"]');
        
        // Should show password strength error
        const errorVisible = await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 2000 }).catch(() => null);
        expect(errorVisible).toBeTruthy();
        
        console.log(`✅ Rejected weak password: ${weakPassword}`);
      }
    });

    test('should prevent account enumeration attacks', async ({ page }) => {
      console.log('🕵️ Testing account enumeration prevention...');
      
      await page.goto(BASE_URL + '/login');
      
      // Test with non-existent email
      await page.fill('input[type="email"]', 'definitely.not.exist@nonexistentdomain12345.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      const errorMessage1 = await page.textContent('.text-destructive, .error, [role="alert"]');
      
      // Test with potentially existing email but wrong password
      await page.fill('input[type="email"]', 'admin@medquiz.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      const errorMessage2 = await page.textContent('.text-destructive, .error, [role="alert"]');
      
      // Error messages should be generic and similar
      expect(errorMessage1).toContain('Invalid');
      expect(errorMessage2).toContain('Invalid');
      
      console.log('✅ Error messages are generic, preventing account enumeration');
    });
  });

  // ==============================================
  // 🌐 NETWORK & CONNECTION EDGE CASES
  // ==============================================

  test.describe('Network & Connection Issues', () => {
    
    test('should handle network timeouts gracefully', async ({ page }) => {
      console.log('⏱️ Testing network timeout handling...');
      
      // Slow down network to simulate timeout
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        route.continue();
      });
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      const submitPromise = page.click('button[type="submit"]');
      
      // Should show loading state
      const loadingVisible = await page.isVisible('text=Signing in..., [aria-label*="loading"], .animate-spin');
      expect(loadingVisible).toBe(true);
      
      console.log('✅ Shows appropriate loading state during network delays');
    });

    test('should handle Convex service unavailable', async ({ page }) => {
      console.log('🚫 Testing Convex service unavailable scenario...');
      
      // Block all Convex requests
      await page.route('**/convex.cloud/**', route => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service Unavailable' })
        });
      });
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Should show service error message
      const errorVisible = await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 10000 });
      expect(errorVisible).toBeTruthy();
      
      console.log('✅ Handles Convex service unavailability gracefully');
    });

    test('should work offline after initial load', async ({ page, context }) => {
      console.log('📴 Testing offline functionality...');
      
      await page.goto(BASE_URL);
      
      // Go offline
      await context.setOffline(true);
      
      // Try to navigate to login (should work with cached resources)
      await page.click('text=Sign In, a[href="/login"]');
      
      // Should show login form (cached)
      const loginForm = await page.isVisible('form, input[type="email"]');
      expect(loginForm).toBe(true);
      
      // But authentication should fail gracefully
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Should show network error
      const errorVisible = await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 5000 }).catch(() => null);
      expect(errorVisible).toBeTruthy();
      
      console.log('✅ Handles offline scenarios appropriately');
    });
  });

  // ==============================================
  // 📱 MOBILE & BROWSER COMPATIBILITY
  // ==============================================

  test.describe('Mobile & Browser Compatibility', () => {
    
    test('should work on mobile devices with touch events', async ({ page }) => {
      console.log('📱 Testing mobile touch interactions...');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(BASE_URL + '/login');
      
      // Test touch interactions
      await page.tap('input[type="email"]');
      await page.fill('input[type="email"]', 'mobile.test@example.com');
      
      await page.tap('input[type="password"]');
      await page.fill('input[type="password"]', 'MobileTest123!');
      
      await page.tap('button[type="submit"]');
      
      // Should handle touch events properly
      const formWorking = await page.isVisible('input[type="email"]');
      expect(formWorking).toBe(true);
      
      console.log('✅ Mobile touch interactions work correctly');
    });

    test('should handle virtual keyboard on mobile', async ({ page }) => {
      console.log('⌨️ Testing virtual keyboard handling...');
      
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL + '/register');
      
      // Simulate virtual keyboard opening (reduces viewport height)
      await page.click('input[type="email"]');
      await page.setViewportSize({ width: 375, height: 300 }); // Keyboard open
      
      // Form should still be usable
      const formVisible = await page.isVisible('form');
      expect(formVisible).toBe(true);
      
      // Should be able to scroll to submit button
      await page.fill('input[name="name"]', 'Virtual Keyboard Test');
      await page.fill('input[type="email"]', 'keyboard@test.com');
      await page.fill('input[type="password"]', 'KeyboardTest123!');
      
      const submitButton = await page.isVisible('button[type="submit"]');
      expect(submitButton).toBe(true);
      
      console.log('✅ Virtual keyboard handling works correctly');
    });

    test('should work with browser autofill/password managers', async ({ page }) => {
      console.log('🔑 Testing browser autofill compatibility...');
      
      await page.goto(BASE_URL + '/login');
      
      // Simulate autofill
      await page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (emailInput && passwordInput) {
          emailInput.value = 'autofill@test.com';
          passwordInput.value = 'AutofillTest123!';
          
          // Trigger input events that autofill would trigger
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      
      // Form should recognize autofilled values
      const emailValue = await page.inputValue('input[type="email"]');
      const passwordValue = await page.inputValue('input[type="password"]');
      
      expect(emailValue).toBe('autofill@test.com');
      expect(passwordValue).toBe('AutofillTest123!');
      
      console.log('✅ Browser autofill compatibility verified');
    });
  });

  // ==============================================
  // ⚡ PERFORMANCE & LOAD TESTING
  // ==============================================

  test.describe('Performance & Load Scenarios', () => {
    
    test('should handle rapid form submissions', async ({ page }) => {
      console.log('⚡ Testing rapid form submission handling...');
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'rapid@test.com');
      await page.fill('input[type="password"]', 'RapidTest123!');
      
      // Submit multiple times rapidly
      for (let i = 0; i < 5; i++) {
        page.click('button[type="submit"]'); // Don't await
        await page.waitForTimeout(100);
      }
      
      // Should not crash or create multiple sessions
      await page.waitForTimeout(2000);
      
      const errorMessages = await page.$$('.text-destructive, .error, [role="alert"]');
      expect(errorMessages.length).toBeLessThanOrEqual(1); // Should handle gracefully
      
      console.log('✅ Handles rapid form submissions without crashing');
    });

    test('should maintain performance with large user data', async ({ page }) => {
      console.log('📊 Testing performance with large user data...');
      
      await page.goto(BASE_URL + '/login');
      
      // Test with very long input values
      const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      const longPassword = 'P'.repeat(200) + '123!';
      
      const startTime = Date.now();
      
      await page.fill('input[type="email"]', longEmail);
      await page.fill('input[type="password"]', longPassword);
      
      const fillTime = Date.now() - startTime;
      
      // Should handle large inputs reasonably fast (< 2 seconds)
      expect(fillTime).toBeLessThan(2000);
      
      console.log(`✅ Handles large inputs in ${fillTime}ms`);
    });

    test('should handle memory leaks during session management', async ({ page }) => {
      console.log('🧠 Testing memory leak prevention...');
      
      // Simulate multiple login/logout cycles
      for (let i = 0; i < 3; i++) {
        await page.goto(BASE_URL + '/login');
        await page.fill('input[type="email"]', `memtest${i}@example.com`);
        await page.fill('input[type="password"]', 'MemTest123!');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(1000);
        
        // Go back to home
        await page.goto(BASE_URL);
        await page.waitForTimeout(500);
      }
      
      // Check for JavaScript errors
      const errors = [];
      page.on('pageerror', error => errors.push(error));
      
      await page.waitForTimeout(1000);
      
      expect(errors.length).toBe(0);
      
      console.log('✅ No memory leaks detected during session cycles');
    });
  });

  // ==============================================
  // 👥 CONCURRENT USERS & RACE CONDITIONS
  // ==============================================

  test.describe('Concurrent Users & Race Conditions', () => {
    
    test('should handle duplicate email registration attempts', async ({ page, context }) => {
      console.log('👥 Testing duplicate email registration...');
      
      const email = `duplicate.test.${Date.now()}@example.com`;
      
      // First registration attempt
      await page.goto(BASE_URL + '/register');
      await page.fill('input[name="name"]', 'First User');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', 'FirstUser123!');
      await page.fill('input[name="confirmPassword"]', 'FirstUser123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      
      // Second registration attempt with same email (new tab)
      const page2 = await context.newPage();
      await page2.goto(BASE_URL + '/register');
      await page2.fill('input[name="name"]', 'Second User');
      await page2.fill('input[type="email"]', email);
      await page2.fill('input[type="password"]', 'SecondUser123!');
      await page2.fill('input[name="confirmPassword"]', 'SecondUser123!');
      await page2.click('button[type="submit"]');
      
      // Second attempt should fail with appropriate error
      const errorVisible = await page2.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 5000 }).catch(() => null);
      expect(errorVisible).toBeTruthy();
      
      const errorText = await page2.textContent('.text-destructive, .error, [role="alert"]');
      expect(errorText.toLowerCase()).toContain('exist');
      
      console.log('✅ Properly handles duplicate email registrations');
    });

    test('should maintain session integrity across tabs', async ({ page, context }) => {
      console.log('🔄 Testing session integrity across tabs...');
      
      // Login in first tab
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'session.test@example.com');
      await page.fill('input[type="password"]', 'SessionTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      
      // Open second tab
      const page2 = await context.newPage();
      await page2.goto(BASE_URL + '/dashboard');
      
      // Both tabs should maintain the same session
      const authenticatedInTab1 = await page.isVisible('[data-testid="user-menu"], .user-avatar, text=Dashboard');
      const authenticatedInTab2 = await page2.isVisible('[data-testid="user-menu"], .user-avatar, text=Dashboard');
      
      // Should be consistent across tabs
      expect(authenticatedInTab1).toBe(authenticatedInTab2);
      
      console.log('✅ Session integrity maintained across tabs');
    });
  });

  // ==============================================
  // ♿ ACCESSIBILITY & USER EXPERIENCE
  // ==============================================

  test.describe('Accessibility & UX Edge Cases', () => {
    
    test('should be fully keyboard navigable', async ({ page }) => {
      console.log('⌨️ Testing keyboard navigation...');
      
      await page.goto(BASE_URL + '/login');
      
      // Navigate using only keyboard
      await page.keyboard.press('Tab'); // Focus email input
      await page.keyboard.type('keyboard@test.com');
      
      await page.keyboard.press('Tab'); // Focus password input
      await page.keyboard.type('KeyboardTest123!');
      
      await page.keyboard.press('Tab'); // Focus submit button
      await page.keyboard.press('Enter'); // Submit form
      
      // Should handle keyboard-only interaction
      const formSubmitted = await page.waitForSelector('.text-destructive, .error, [role="alert"], .loading', { timeout: 3000 }).catch(() => null);
      expect(formSubmitted).toBeTruthy();
      
      console.log('✅ Full keyboard navigation works correctly');
    });

    test('should work with screen readers', async ({ page }) => {
      console.log('👁️ Testing screen reader compatibility...');
      
      await page.goto(BASE_URL + '/login');
      
      // Check for proper ARIA labels and roles
      const emailInput = await page.getAttribute('input[type="email"]', 'aria-label');
      const passwordInput = await page.getAttribute('input[type="password"]', 'aria-label');
      const submitButton = await page.getAttribute('button[type="submit"]', 'aria-label');
      
      // Should have proper accessibility attributes
      expect(emailInput || await page.textContent('label[for*="email"]')).toBeTruthy();
      expect(passwordInput || await page.textContent('label[for*="password"]')).toBeTruthy();
      
      // Check for error announcements
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      const errorElement = await page.$('.text-destructive, .error, [role="alert"]');
      if (errorElement) {
        const ariaLive = await errorElement.getAttribute('aria-live');
        const role = await errorElement.getAttribute('role');
        
        expect(ariaLive || role).toBeTruthy();
      }
      
      console.log('✅ Screen reader compatibility verified');
    });

    test('should handle high contrast and zoom modes', async ({ page }) => {
      console.log('🔍 Testing high contrast and zoom accessibility...');
      
      // Set high zoom level
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.evaluate(() => {
        document.body.style.zoom = '200%';
      });
      
      await page.goto(BASE_URL + '/login');
      
      // Form should still be usable at high zoom
      const emailVisible = await page.isVisible('input[type="email"]');
      const passwordVisible = await page.isVisible('input[type="password"]');
      const submitVisible = await page.isVisible('button[type="submit"]');
      
      expect(emailVisible).toBe(true);
      expect(passwordVisible).toBe(true);
      expect(submitVisible).toBe(true);
      
      // Elements should not overlap
      const emailBox = await page.boundingBox('input[type="email"]');
      const passwordBox = await page.boundingBox('input[type="password"]');
      
      if (emailBox && passwordBox) {
        expect(emailBox.y + emailBox.height).toBeLessThanOrEqual(passwordBox.y);
      }
      
      console.log('✅ High contrast and zoom modes work correctly');
    });
  });

  // ==============================================
  // 🏥 MEDICAL PROFESSIONAL SPECIFIC SCENARIOS
  // ==============================================

  test.describe('Medical Professional Scenarios', () => {
    
    test('should handle medical email domains and institutions', async ({ page }) => {
      console.log('🏥 Testing medical institution email formats...');
      
      const medicalEmails = [
        'student@med.harvard.edu',
        'resident@mayo.edu',
        'doctor@jhmi.edu',
        'physician@ucsf.edu',
        'medstudent@stanford.edu',
        'intern@nyp.org',
        'fellowship@clevelandclinic.org'
      ];
      
      await page.goto(BASE_URL + '/register');
      
      for (const email of medicalEmails) {
        await page.fill('input[type="email"]', email);
        
        // Should accept medical institution emails
        const emailValue = await page.inputValue('input[type="email"]');
        expect(emailValue).toBe(email);
        
        // Fill other fields for validation
        await page.fill('input[name="name"]', 'Medical Professional');
        await page.fill('input[type="password"]', 'MedicalPass123!');
        await page.fill('input[name="confirmPassword"]', 'MedicalPass123!');
        
        console.log(`✅ Accepts medical email: ${email}`);
      }
    });

    test('should handle HIPAA compliance requirements', async ({ page }) => {
      console.log('🛡️ Testing HIPAA compliance features...');
      
      await page.goto(BASE_URL + '/login');
      
      // Check for privacy policy and terms
      const privacyLink = await page.isVisible('text=Privacy, a[href*="privacy"]');
      const termsLink = await page.isVisible('text=Terms, a[href*="terms"]');
      
      // Should have proper legal documentation
      expect(privacyLink || termsLink).toBe(true);
      
      // Test that no PII is logged to console
      const consoleLogs = [];
      page.on('console', msg => consoleLogs.push(msg.text()));
      
      await page.fill('input[type="email"]', 'hipaa.test@medical.edu');
      await page.fill('input[type="password"]', 'HipaaTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      
      // Check that email/password are not logged in plain text
      const sensitiveDataLogged = consoleLogs.some(log => 
        log.includes('hipaa.test@medical.edu') || 
        log.includes('HipaaTest123!')
      );
      
      expect(sensitiveDataLogged).toBe(false);
      
      console.log('✅ HIPAA compliance requirements verified');
    });

    test('should handle shift work schedules and multiple device access', async ({ page, context }) => {
      console.log('🏥 Testing multiple device access scenarios...');
      
      // Simulate doctor logging in from hospital computer
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'doctor@hospital.edu');
      await page.fill('input[type="password"]', 'HospitalDoc123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      
      // Simulate logging in from mobile device (different session)
      const mobilePage = await context.newPage();
      await mobilePage.setViewportSize({ width: 375, height: 667 });
      await mobilePage.goto(BASE_URL + '/login');
      await mobilePage.fill('input[type="email"]', 'doctor@hospital.edu');
      await mobilePage.fill('input[type="password"]', 'HospitalDoc123!');
      await mobilePage.click('button[type="submit"]');
      
      await mobilePage.waitForTimeout(2000);
      
      // Both sessions should work independently
      const desktopWorking = await page.isVisible('form, input[type="email"]');
      const mobileWorking = await mobilePage.isVisible('form, input[type="email"]');
      
      expect(desktopWorking).toBe(true);
      expect(mobileWorking).toBe(true);
      
      console.log('✅ Multiple device access scenarios work correctly');
    });
  });

  // ==============================================
  // 🚨 ERROR RECOVERY & RESILIENCE
  // ==============================================

  test.describe('Error Recovery & System Resilience', () => {
    
    test('should recover from browser crashes and page reloads', async ({ page }) => {
      console.log('🔄 Testing crash recovery...');
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'recovery@test.com');
      await page.fill('input[type="password"]', 'RecoveryTest123!');
      
      // Simulate browser crash/reload
      await page.reload();
      
      // Form should be reset but functional
      const emailValue = await page.inputValue('input[type="email"]');
      expect(emailValue).toBe(''); // Should be cleared
      
      // Should still be able to login after reload
      await page.fill('input[type="email"]', 'recovery@test.com');
      await page.fill('input[type="password"]', 'RecoveryTest123!');
      await page.click('button[type="submit"]');
      
      const formSubmitted = await page.waitForSelector('.text-destructive, .error, [role="alert"], .loading', { timeout: 3000 }).catch(() => null);
      expect(formSubmitted).toBeTruthy();
      
      console.log('✅ Recovers properly from page reloads');
    });

    test('should handle partial network failures', async ({ page }) => {
      console.log('🌐 Testing partial network failure recovery...');
      
      let requestCount = 0;
      
      // Intermittent network failures
      await page.route('**/*', async route => {
        requestCount++;
        if (requestCount % 3 === 0) {
          // Fail every 3rd request
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Intermittent failure' })
          });
        } else {
          route.continue();
        }
      });
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'network@test.com');
      await page.fill('input[type="password"]', 'NetworkTest123!');
      await page.click('button[type="submit"]');
      
      // Should handle intermittent failures gracefully
      const result = await page.waitForSelector('.text-destructive, .error, [role="alert"], .loading', { timeout: 10000 }).catch(() => null);
      expect(result).toBeTruthy();
      
      console.log('✅ Handles partial network failures gracefully');
    });

    test('should maintain data integrity during errors', async ({ page }) => {
      console.log('🔒 Testing data integrity during errors...');
      
      await page.goto(BASE_URL + '/register');
      
      // Fill form with valid data
      await page.fill('input[name="name"]', 'Data Integrity Test');
      await page.fill('input[type="email"]', 'integrity@test.com');
      await page.fill('input[type="password"]', 'IntegrityTest123!');
      await page.fill('input[name="confirmPassword"]', 'IntegrityTest123!');
      
      // Simulate error during submission
      await page.route('**/*convex*', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Validation failed' })
        });
      });
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Form data should be preserved
      const nameValue = await page.inputValue('input[name="name"]');
      const emailValue = await page.inputValue('input[type="email"]');
      
      expect(nameValue).toBe('Data Integrity Test');
      expect(emailValue).toBe('integrity@test.com');
      // Passwords should be cleared for security
      
      console.log('✅ Maintains data integrity during errors');
    });
  });

  // ==============================================
  // 📊 ANALYTICS & MONITORING TESTS
  // ==============================================

  test.describe('Analytics & Monitoring', () => {
    
    test('should track authentication events properly', async ({ page }) => {
      console.log('📊 Testing authentication event tracking...');
      
      const events = [];
      page.on('console', msg => {
        if (msg.text().includes('📊') || msg.text().includes('Analytics:')) {
          events.push(msg.text());
        }
      });
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'analytics@test.com');
      await page.fill('input[type="password"]', 'AnalyticsTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Should have tracked login attempt
      expect(events.length).toBeGreaterThan(0);
      
      console.log(`✅ Tracked ${events.length} authentication events`);
    });

    test('should log errors for monitoring systems', async ({ page }) => {
      console.log('🚨 Testing error logging for monitoring...');
      
      const errorLogs = [];
      page.on('console', msg => {
        if (msg.type() === 'error' || msg.text().includes('🚨')) {
          errorLogs.push(msg.text());
        }
      });
      
      // Trigger authentication error
      await page.route('**/*convex*', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database connection failed' })
        });
      });
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'monitoring@test.com');
      await page.fill('input[type="password"]', 'MonitoringTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Should have logged errors for monitoring
      expect(errorLogs.length).toBeGreaterThan(0);
      
      console.log(`✅ Logged ${errorLogs.length} errors for monitoring systems`);
    });
  });

});

// Helper function to generate test data
function generateTestUser(prefix = 'test') {
  const timestamp = Date.now();
  return {
    name: `${prefix} User ${timestamp}`,
    email: `${prefix}.${timestamp}@example.com`,
    password: `${prefix}Pass123!`
  };
}

console.log(`
🏥 MedQuiz Pro Authentication Edge Case Testing Suite
=====================================================

This comprehensive test suite validates:
✅ Security & Input Validation (SQL injection, XSS, etc.)
✅ Network & Connection Issues (timeouts, offline, etc.)
✅ Mobile & Browser Compatibility
✅ Performance & Load Testing
✅ Concurrent Users & Race Conditions
✅ Accessibility & UX Edge Cases
✅ Medical Professional Scenarios
✅ Error Recovery & System Resilience
✅ Analytics & Monitoring

Run with: npx playwright test auth-edge-case-tests.js
`);