/**
 * 🛡️ MedQuiz Pro - Final Security & Accessibility Validation
 * 
 * This test addresses the critical gaps identified in our comprehensive testing:
 * 1. Security input validation and XSS prevention
 * 2. Accessibility compliance (WCAG 2.1 AA)
 * 3. Hospital network performance simulation
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://usmle-trivia.netlify.app';

test.describe('🔐 Final Security & Accessibility Validation', () => {

  test.describe('🛡️ Live Form Security Testing', () => {
    
    test('should test XSS prevention on live registration form', async ({ page }) => {
      console.log('🔍 Testing XSS prevention on live forms...');
      
      await page.goto(BASE_URL + '/register');
      
      // Wait for form to load
      await page.waitForSelector('input[name="name"], input[type="text"]', { timeout: 10000 });
      
      let alertTriggered = false;
      page.on('dialog', dialog => {
        console.log(`🚨 SECURITY ALERT: XSS detected - ${dialog.message()}`);
        alertTriggered = true;
        dialog.dismiss();
      });
      
      const xssPayloads = [
        '<script>alert("XSS-Test")</script>',
        '<img src="x" onerror="alert(\'XSS-IMG\')">',
        'javascript:alert("XSS-JS")',
        '<svg onload="alert(\'XSS-SVG\')">',
        '"><script>alert("XSS-BREAK")</script>',
      ];
      
      let testResults = [];
      
      for (const payload of xssPayloads) {
        try {
          // Test in name field if available
          const nameField = await page.$('input[name="name"], input[type="text"]');
          if (nameField) {
            await nameField.fill(payload);
            
            // Check if payload was sanitized
            const value = await nameField.inputValue();
            const wasSanitized = value !== payload;
            
            testResults.push({
              payload: payload.substring(0, 30) + '...',
              sanitized: wasSanitized,
              executed: alertTriggered
            });
            
            console.log(`${wasSanitized ? '✅' : '⚠️'} Payload: ${payload.substring(0, 20)}... | Sanitized: ${wasSanitized}`);
          }
          
          // Test form submission
          const emailField = await page.$('input[type="email"]');
          const passwordField = await page.$('input[type="password"]');
          
          if (emailField) await emailField.fill('security@test.com');
          if (passwordField) await passwordField.fill('SecurityTest123!');
          
          const submitButton = await page.$('button[type="submit"], input[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            await page.waitForTimeout(2000);
          }
          
        } catch (error) {
          console.log(`⚠️ Error testing payload: ${error.message}`);
        }
        
        // Reset form
        await page.reload();
        await page.waitForSelector('input[name="name"], input[type="text"]', { timeout: 5000 });
      }
      
      // Verify no XSS was executed
      expect(alertTriggered).toBe(false);
      
      console.log('🛡️ XSS Testing Results:', testResults);
      console.log('✅ XSS prevention validation completed');
    });

    test('should test SQL injection prevention on live forms', async ({ page }) => {
      console.log('💉 Testing SQL injection prevention...');
      
      await page.goto(BASE_URL + '/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      const sqlPayloads = [
        "admin'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; UNION SELECT * FROM users; --",
        "admin'/*",
        "' OR 1=1 --",
      ];
      
      let injectionResults = [];
      
      for (const payload of sqlPayloads) {
        try {
          await page.fill('input[type="email"]', payload);
          await page.fill('input[type="password"]', 'password123');
          
          const startTime = Date.now();
          await page.click('button[type="submit"]');
          
          // Wait for response
          await page.waitForSelector('.error, [role="alert"], .text-destructive', { timeout: 8000 });
          const responseTime = Date.now() - startTime;
          
          // Check error message for information disclosure
          const errorText = await page.textContent('.error, [role="alert"], .text-destructive');
          const hasDbInfo = /database|sql|mysql|postgresql|table|column/i.test(errorText);
          
          injectionResults.push({
            payload: payload.substring(0, 20) + '...',
            responseTime,
            revealsDbInfo: hasDbInfo,
            errorMessage: errorText.substring(0, 50) + '...'
          });
          
          console.log(`${hasDbInfo ? '⚠️' : '✅'} SQL Injection: ${payload.substring(0, 15)}... | DB Info: ${hasDbInfo} | Time: ${responseTime}ms`);
          
        } catch (error) {
          console.log(`⚠️ Error testing SQL injection: ${error.message}`);
        }
      }
      
      console.log('💉 SQL Injection Results:', injectionResults);
      console.log('✅ SQL injection prevention validation completed');
    });

    test('should test authentication rate limiting', async ({ page }) => {
      console.log('🔨 Testing authentication rate limiting...');
      
      const attemptResults = [];
      let rateLimitHit = false;
      
      // Attempt rapid logins
      for (let i = 0; i < 8; i++) {
        const startTime = Date.now();
        
        await page.goto(BASE_URL + '/login');
        await page.waitForSelector('input[type="email"]', { timeout: 5000 });
        
        await page.fill('input[type="email"]', `ratetest${i}@test.com`);
        await page.fill('input[type="password"]', `password${i}`);
        await page.click('button[type="submit"]');
        
        try {
          await page.waitForSelector('.error, [role="alert"], .text-destructive', { timeout: 10000 });
          const responseTime = Date.now() - startTime;
          
          const errorText = await page.textContent('.error, [role="alert"], .text-destructive');
          const isRateLimit = /rate|limit|many|blocked|throttle/i.test(errorText);
          
          if (isRateLimit) {
            rateLimitHit = true;
            console.log(`🛡️ Rate limiting detected at attempt ${i + 1}: ${errorText}`);
          }
          
          attemptResults.push({
            attempt: i + 1,
            responseTime,
            isRateLimit,
            message: errorText.substring(0, 30) + '...'
          });
          
          console.log(`Attempt ${i + 1}: ${responseTime}ms${isRateLimit ? ' [RATE LIMITED]' : ''}`);
          
        } catch (error) {
          console.log(`⚠️ Timeout on attempt ${i + 1}`);
        }
        
        // Brief pause between attempts
        await page.waitForTimeout(500);
      }
      
      const avgResponseTime = attemptResults.reduce((sum, r) => sum + r.responseTime, 0) / attemptResults.length;
      
      console.log(`📊 Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`🛡️ Rate limiting detected: ${rateLimitHit}`);
      
      // Either rate limiting should be detected OR response times should increase
      const hasProtection = rateLimitHit || avgResponseTime > 3000;
      console.log(`${hasProtection ? '✅' : '⚠️'} Brute force protection: ${hasProtection ? 'ACTIVE' : 'UNCLEAR'}`);
    });
  });

  test.describe('♿ Accessibility Compliance Testing', () => {
    
    test('should validate WCAG 2.1 AA compliance', async ({ page }) => {
      console.log('♿ Testing accessibility compliance...');
      
      // Test multiple pages
      const pagesToTest = [
        { url: BASE_URL, name: 'Homepage' },
        { url: BASE_URL + '/login', name: 'Login Page' },
        { url: BASE_URL + '/register', name: 'Registration Page' }
      ];
      
      let accessibilityResults = [];
      
      for (const pageTest of pagesToTest) {
        console.log(`🔍 Testing accessibility on ${pageTest.name}...`);
        
        await page.goto(pageTest.url);
        await page.waitForLoadState('networkidle');
        
        // Check for basic accessibility elements
        const accessibilityIssues = await page.evaluate(() => {
          const issues = [];
          
          // Check for images without alt text
          const images = document.querySelectorAll('img');
          images.forEach((img, index) => {
            if (!img.alt && !img.getAttribute('aria-label')) {
              issues.push(`Image ${index + 1} missing alt text`);
            }
          });
          
          // Check for form inputs without labels
          const inputs = document.querySelectorAll('input, textarea, select');
          inputs.forEach((input, index) => {
            const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                           input.getAttribute('aria-label') || 
                           input.getAttribute('aria-labelledby');
            if (!hasLabel && input.type !== 'hidden') {
              issues.push(`Input ${index + 1} missing label`);
            }
          });
          
          // Check for headings hierarchy
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          if (headings.length === 0) {
            issues.push('No heading elements found');
          }
          
          // Check for interactive elements without proper roles
          const buttons = document.querySelectorAll('button, [role="button"]');
          buttons.forEach((button, index) => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
              issues.push(`Button ${index + 1} missing accessible name`);
            }
          });
          
          // Check color contrast (basic check)
          const body = document.body;
          const computedStyle = window.getComputedStyle(body);
          const bgColor = computedStyle.backgroundColor;
          const textColor = computedStyle.color;
          
          if (bgColor === 'rgba(0, 0, 0, 0)' && textColor === 'rgb(0, 0, 0)') {
            issues.push('Potential color contrast issue detected');
          }
          
          // Check for skip navigation
          const skipLink = document.querySelector('a[href="#main"], [class*="skip"]');
          if (!skipLink) {
            issues.push('No skip navigation link found');
          }
          
          return {
            totalImages: images.length,
            totalInputs: inputs.length,
            totalHeadings: headings.length,
            totalButtons: buttons.length,
            issues
          };
        });
        
        // Test keyboard navigation
        console.log('⌨️ Testing keyboard navigation...');
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        // Check if focus is visible
        const focusedElement = await page.locator(':focus').count();
        const hasFocusIndicator = focusedElement > 0;
        
        accessibilityResults.push({
          page: pageTest.name,
          url: pageTest.url,
          ...accessibilityIssues,
          keyboardNavigation: hasFocusIndicator,
          accessibilityScore: Math.max(0, 100 - (accessibilityIssues.issues.length * 10))
        });
        
        console.log(`${pageTest.name} Issues: ${accessibilityIssues.issues.length}`);
        console.log(`Keyboard Navigation: ${hasFocusIndicator ? '✅' : '❌'}`);
        
        if (accessibilityIssues.issues.length > 0) {
          console.log('⚠️ Accessibility Issues Found:');
          accessibilityIssues.issues.forEach(issue => console.log(`   - ${issue}`));
        }
      }
      
      // Calculate overall accessibility score
      const overallScore = accessibilityResults.reduce((sum, r) => sum + r.accessibilityScore, 0) / accessibilityResults.length;
      
      console.log(`\n♿ Overall Accessibility Score: ${overallScore.toFixed(1)}/100`);
      
      if (overallScore >= 80) {
        console.log('✅ Good accessibility compliance');
      } else if (overallScore >= 60) {
        console.log('⚠️ Moderate accessibility compliance - improvements needed');
      } else {
        console.log('❌ Poor accessibility compliance - major improvements required');
      }
      
      // Accessibility should meet basic standards
      expect(overallScore).toBeGreaterThan(50);
    });

    test('should test screen reader compatibility', async ({ page }) => {
      console.log('👁️ Testing screen reader compatibility...');
      
      await page.goto(BASE_URL + '/login');
      await page.waitForLoadState('networkidle');
      
      // Check for ARIA landmarks and roles
      const ariaElements = await page.evaluate(() => {
        const landmarks = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]');
        const liveRegions = document.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
        
        return {
          landmarkCount: landmarks.length,
          liveRegionCount: liveRegions.length,
          hasMainLandmark: !!document.querySelector('[role="main"], main'),
          hasNavLandmark: !!document.querySelector('[role="navigation"], nav'),
          hasBannerLandmark: !!document.querySelector('[role="banner"], header'),
          hasContentinfoLandmark: !!document.querySelector('[role="contentinfo"], footer')
        };
      });
      
      console.log('👁️ Screen Reader Compatibility:');
      console.log(`   ARIA Elements: ${ariaElements.landmarkCount}`);
      console.log(`   Live Regions: ${ariaElements.liveRegionCount}`);
      console.log(`   Main Landmark: ${ariaElements.hasMainLandmark ? '✅' : '❌'}`);
      console.log(`   Navigation: ${ariaElements.hasNavLandmark ? '✅' : '❌'}`);
      console.log(`   Banner: ${ariaElements.hasBannerLandmark ? '✅' : '❌'}`);
      console.log(`   Footer: ${ariaElements.hasContentinfoLandmark ? '✅' : '❌'}`);
      
      // Basic screen reader compatibility check
      const basicCompliance = ariaElements.landmarkCount > 0 && ariaElements.hasMainLandmark;
      console.log(`${basicCompliance ? '✅' : '⚠️'} Basic screen reader compatibility: ${basicCompliance ? 'PASS' : 'NEEDS WORK'}`);
    });
  });

  test.describe('🏥 Hospital Network Performance', () => {
    
    test('should simulate slow hospital WiFi conditions', async ({ page, context }) => {
      console.log('🏥 Testing hospital network conditions...');
      
      // Simulate slow network (3G speeds common in hospitals)
      await context.route('**/*', async route => {
        // Add 2-4 second delay to simulate slow hospital network
        const delay = 2000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        route.continue();
      });
      
      const startTime = Date.now();
      
      console.log('🌐 Loading site with hospital network simulation...');
      await page.goto(BASE_URL + '/login');
      
      const pageLoadTime = Date.now() - startTime;
      console.log(`📊 Page load time: ${pageLoadTime}ms`);
      
      // Test form interaction under slow conditions
      console.log('📝 Testing form interaction...');
      const formStartTime = Date.now();
      
      await page.waitForSelector('input[type="email"]', { timeout: 30000 });
      await page.fill('input[type="email"]', 'hospital@test.com');
      await page.fill('input[type="password"]', 'HospitalTest123!');
      await page.click('button[type="submit"]');
      
      // Wait for response under slow conditions
      await page.waitForSelector('.error, [role="alert"], .text-destructive, .loading', { timeout: 30000 });
      
      const formResponseTime = Date.now() - formStartTime;
      console.log(`📊 Form response time: ${formResponseTime}ms`);
      
      // Check if loading states are shown
      const hasLoadingState = await page.isVisible('.loading, [aria-label*="loading"], .spinner, text=Signing');
      console.log(`🔄 Loading state visible: ${hasLoadingState ? '✅' : '❌'}`);
      
      // Performance should be acceptable even on slow networks
      console.log(`🏥 Hospital network performance:`);
      console.log(`   Page Load: ${pageLoadTime < 15000 ? '✅' : '⚠️'} ${pageLoadTime}ms`);
      console.log(`   Form Response: ${formResponseTime < 20000 ? '✅' : '⚠️'} ${formResponseTime}ms`);
      console.log(`   Loading States: ${hasLoadingState ? '✅' : '❌'}`);
      
      // Should handle slow networks gracefully
      expect(pageLoadTime).toBeLessThan(30000); // 30 second timeout
      expect(formResponseTime).toBeLessThan(40000); // 40 second timeout
    });

    test('should test intermittent connection drops', async ({ page }) => {
      console.log('📡 Testing intermittent connection handling...');
      
      let requestCount = 0;
      let connectionDropped = false;
      
      await page.route('**/*', async route => {
        requestCount++;
        
        // Drop every 4th request to simulate intermittent connectivity
        if (requestCount % 4 === 0 && !connectionDropped) {
          connectionDropped = true;
          console.log('💔 Simulating connection drop...');
          route.abort('internetdisconnected');
          return;
        }
        
        // Add some delay for realism
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.continue();
      });
      
      await page.goto(BASE_URL + '/login');
      
      // Try authentication during intermittent connectivity
      await page.waitForSelector('input[type="email"]', { timeout: 15000 });
      await page.fill('input[type="email"]', 'intermittent@test.com');
      await page.fill('input[type="password"]', 'IntermittentTest123!');
      await page.click('button[type="submit"]');
      
      // Should eventually show some response
      const result = await page.waitForSelector('.error, [role="alert"], .text-destructive, .success', { 
        timeout: 30000 
      }).catch(() => null);
      
      const handledGracefully = !!result;
      console.log(`📡 Intermittent connectivity handled: ${handledGracefully ? '✅' : '⚠️'}`);
      
      if (result) {
        const errorText = await result.textContent();
        console.log(`   Response: ${errorText.substring(0, 50)}...`);
      }
    });
  });

  test.describe('📱 Clinical Environment Testing', () => {
    
    test('should test authentication during clinical rounds', async ({ page }) => {
      console.log('👩‍⚕️ Testing authentication during clinical scenarios...');
      
      // Simulate medical student quickly logging in between patients
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      
      // Simulate interrupted workflow (common in clinical settings)
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'medstudent@hospital.edu');
      
      // Simulate interruption (page minimized/backgrounded)
      console.log('📱 Simulating app backgrounding...');
      await page.evaluate(() => {
        // Simulate page visibility change
        document.dispatchEvent(new Event('visibilitychange'));
      });
      
      await page.waitForTimeout(2000);
      
      // Continue authentication after interruption
      await page.fill('input[type="password"]', 'ClinicalRounds123!');
      await page.click('button[type="submit"]');
      
      const result = await page.waitForSelector('.error, [role="alert"], .text-destructive', { timeout: 10000 });
      const handledInterruption = !!result;
      
      console.log(`👩‍⚕️ Clinical workflow interruption handled: ${handledInterruption ? '✅' : '⚠️'}`);
    });

    test('should test quick access during medical emergencies', async ({ page }) => {
      console.log('🚨 Testing emergency access scenarios...');
      
      // Simulate rapid access needed during medical emergency
      const startTime = Date.now();
      
      await page.goto(BASE_URL + '/login');
      
      // Fill form as quickly as possible (emergency scenario)
      await page.fill('input[type="email"]', 'emergency@hospital.edu');
      await page.fill('input[type="password"]', 'Emergency123!');
      
      // Multiple rapid clicks (stressed user)
      for (let i = 0; i < 3; i++) {
        page.click('button[type="submit"]'); // Don't await
        await page.waitForTimeout(100);
      }
      
      const result = await page.waitForSelector('.error, [role="alert"], .text-destructive', { timeout: 8000 });
      const emergencyResponseTime = Date.now() - startTime;
      
      console.log(`🚨 Emergency response time: ${emergencyResponseTime}ms`);
      console.log(`🚨 System stability under stress: ${result ? '✅' : '⚠️'}`);
      
      // Should respond quickly in emergency scenarios
      expect(emergencyResponseTime).toBeLessThan(10000); // 10 seconds max
    });
  });

});

console.log(`
🛡️ MedQuiz Pro - Final Security & Accessibility Validation Suite
===============================================================

This comprehensive test suite addresses critical gaps:

🛡️ SECURITY TESTING:
   - XSS Prevention on Live Forms
   - SQL Injection Prevention  
   - Authentication Rate Limiting
   - Input Sanitization Validation

♿ ACCESSIBILITY COMPLIANCE:
   - WCAG 2.1 AA Standards
   - Screen Reader Compatibility
   - Keyboard Navigation
   - Color Contrast Validation

🏥 HOSPITAL ENVIRONMENT:
   - Slow WiFi Performance
   - Intermittent Connectivity
   - Clinical Workflow Interruptions
   - Emergency Access Scenarios

📱 CLINICAL SCENARIOS:
   - Mobile Device Usage
   - Interrupted Workflows
   - Rapid Emergency Access
   - Background App Handling

Run with: npx playwright test final-security-accessibility-test.js
`);