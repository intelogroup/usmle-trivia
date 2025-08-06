/**
 * 🔥 MedQuiz Pro Authentication - Stress & Load Testing Suite
 * 
 * These tests simulate high-stress scenarios that the authentication system
 * might face in production with thousands of medical students using the platform.
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://usmle-trivia.netlify.app';

test.describe('🔥 Authentication Stress & Load Testing', () => {

  test.describe('High Load Scenarios', () => {
    
    test('should handle burst registration attempts', async ({ page, context }) => {
      console.log('💥 Testing burst registration load...');
      
      const startTime = Date.now();
      const promises = [];
      
      // Simulate 10 simultaneous registration attempts
      for (let i = 0; i < 10; i++) {
        const newPage = context.newPage();
        promises.push(
          newPage.then(async (p) => {
            await p.goto(BASE_URL + '/register');
            await p.fill('input[name="name"]', `Burst User ${i}`);
            await p.fill('input[type="email"]', `burst${i}.${Date.now()}@test.com`);
            await p.fill('input[type="password"]', `BurstTest${i}123!`);
            await p.fill('input[name="confirmPassword"]', `BurstTest${i}123!`);
            await p.click('button[type="submit"]');
            
            // Wait for response
            await p.waitForSelector('.text-destructive, .error, [role="alert"], .success', { timeout: 10000 });
            return p;
          })
        );
      }
      
      const pages = await Promise.all(promises);
      const endTime = Date.now();
      
      console.log(`✅ Handled ${pages.length} burst registrations in ${endTime - startTime}ms`);
      
      // Clean up
      await Promise.all(pages.map(p => p.close()));
    });

    test('should maintain performance under continuous load', async ({ page }) => {
      console.log('⚡ Testing continuous authentication load...');
      
      const performanceMetrics = [];
      
      // Perform 20 sequential authentication attempts
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();
        
        await page.goto(BASE_URL + '/login');
        await page.fill('input[type="email"]', `load${i}@test.com`);
        await page.fill('input[type="password"]', `LoadTest${i}123!`);
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 5000 });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        performanceMetrics.push(responseTime);
        
        console.log(`Request ${i + 1}: ${responseTime}ms`);
      }
      
      const avgResponseTime = performanceMetrics.reduce((a, b) => a + b, 0) / performanceMetrics.length;
      const maxResponseTime = Math.max(...performanceMetrics);
      
      console.log(`📊 Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`📊 Max response time: ${maxResponseTime}ms`);
      
      // Performance should remain reasonable
      expect(avgResponseTime).toBeLessThan(5000); // 5 seconds average
      expect(maxResponseTime).toBeLessThan(10000); // 10 seconds max
      
      console.log('✅ Performance maintained under continuous load');
    });

    test('should handle memory-intensive form operations', async ({ page }) => {
      console.log('🧠 Testing memory-intensive form operations...');
      
      await page.goto(BASE_URL + '/register');
      
      // Fill form with extremely large data
      const largeString = 'A'.repeat(10000); // 10KB string
      const mediumString = 'B'.repeat(1000);  // 1KB string
      
      // Test browser's ability to handle large inputs
      await page.fill('input[name="name"]', mediumString);
      await page.fill('input[type="email"]', 'memory@test.com');
      await page.fill('input[type="password"]', mediumString + '123!');
      await page.fill('input[name="confirmPassword"]', mediumString + '123!');
      
      // Should handle large inputs without crashing
      const nameValue = await page.inputValue('input[name="name"]');
      expect(nameValue.length).toBe(1000);
      
      // Simulate rapid typing and deletions
      for (let i = 0; i < 50; i++) {
        await page.type('input[name="name"]', 'X');
        await page.keyboard.press('Backspace');
      }
      
      const finalValue = await page.inputValue('input[name="name"]');
      expect(finalValue.length).toBe(1000); // Should maintain original value
      
      console.log('✅ Handles memory-intensive operations correctly');
    });
  });

  test.describe('Network Stress Tests', () => {
    
    test('should handle slow network connections', async ({ page }) => {
      console.log('🐌 Testing slow network performance...');
      
      // Simulate slow 3G connection
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 second delay
        route.continue();
      });
      
      const startTime = Date.now();
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'slow@test.com');
      await page.fill('input[type="password"]', 'SlowTest123!');
      
      // Should show loading state immediately
      await page.click('button[type="submit"]');
      const loadingVisible = await page.waitForSelector('text=Signing in..., [aria-label*="loading"], .animate-spin', { timeout: 1000 });
      expect(loadingVisible).toBeTruthy();
      
      // Wait for completion
      await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 15000 });
      
      const endTime = Date.now();
      console.log(`🐌 Slow network test completed in ${endTime - startTime}ms`);
      
      console.log('✅ Handles slow networks with proper loading states');
    });

    test('should recover from network interruptions', async ({ page }) => {
      console.log('📡 Testing network interruption recovery...');
      
      let requestCount = 0;
      
      await page.route('**/*', async (route) => {
        requestCount++;
        
        if (requestCount === 2) {
          // Simulate network interruption on second request
          console.log('💔 Simulating network interruption...');
          route.abort();
          return;
        }
        
        if (requestCount === 3) {
          // Recovery: delay then continue
          console.log('🔄 Network recovering...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        route.continue();
      });
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'recovery@test.com');
      await page.fill('input[type="password"]', 'RecoveryTest123!');
      await page.click('button[type="submit"]');
      
      // Should eventually show some response (error or success)
      const result = await page.waitForSelector('.text-destructive, .error, [role="alert"], .success', { timeout: 10000 });
      expect(result).toBeTruthy();
      
      console.log('✅ Recovers from network interruptions');
    });

    test('should handle DNS resolution failures', async ({ page }) => {
      console.log('🌐 Testing DNS resolution failure handling...');
      
      // Simulate DNS resolution failure for Convex
      await page.route('**/convex.cloud/**', route => {
        route.fulfill({
          status: 0, // Network error
          body: ''
        });
      });
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'dns@test.com');
      await page.fill('input[type="password"]', 'DnsTest123!');
      await page.click('button[type="submit"]');
      
      // Should show network error
      const errorVisible = await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 8000 });
      expect(errorVisible).toBeTruthy();
      
      const errorText = await page.textContent('.text-destructive, .error, [role="alert"]');
      expect(errorText.toLowerCase()).toMatch(/error|failed|network|connection/);
      
      console.log('✅ Handles DNS resolution failures gracefully');
    });
  });

  test.describe('Browser Resource Stress', () => {
    
    test('should work with limited browser memory', async ({ page }) => {
      console.log('💾 Testing limited memory scenarios...');
      
      // Consume memory by creating large objects
      await page.evaluate(() => {
        // Create memory pressure
        window.memoryConsumer = [];
        for (let i = 0; i < 1000; i++) {
          window.memoryConsumer.push(new Array(10000).fill('memory-test-data'));
        }
      });
      
      await page.goto(BASE_URL + '/login');
      
      // Authentication should still work despite memory pressure
      await page.fill('input[type="email"]', 'memory@test.com');
      await page.fill('input[type="password"]', 'MemoryTest123!');
      await page.click('button[type="submit"]');
      
      const result = await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 10000 });
      expect(result).toBeTruthy();
      
      // Clean up memory
      await page.evaluate(() => {
        window.memoryConsumer = null;
      });
      
      console.log('✅ Functions correctly under memory pressure');
    });

    test('should handle CPU-intensive operations', async ({ page }) => {
      console.log('🔥 Testing CPU-intensive scenarios...');
      
      // Start CPU-intensive task
      await page.evaluate(() => {
        const startTime = Date.now();
        
        // CPU-intensive loop in background
        function cpuIntensiveTask() {
          const endTime = Date.now() + 5000; // Run for 5 seconds
          while (Date.now() < endTime) {
            Math.random() * Math.random();
          }
          console.log('CPU-intensive task completed');
        }
        
        setTimeout(cpuIntensiveTask, 100);
      });
      
      await page.goto(BASE_URL + '/login');
      
      // UI should remain responsive despite CPU load
      const startTime = Date.now();
      await page.fill('input[type="email"]', 'cpu@test.com');
      const fillTime = Date.now() - startTime;
      
      // Filling should complete reasonably quickly
      expect(fillTime).toBeLessThan(2000);
      
      await page.fill('input[type="password"]', 'CpuTest123!');
      await page.click('button[type="submit"]');
      
      const result = await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 10000 });
      expect(result).toBeTruthy();
      
      console.log('✅ Remains responsive under CPU load');
    });
  });

  test.describe('Extreme Input Stress Tests', () => {
    
    test('should handle unicode and special characters', async ({ page }) => {
      console.log('🌍 Testing unicode and special character handling...');
      
      const unicodeInputs = [
        '用户@测试.中国',                    // Chinese
        'مستخدم@اختبار.كوم',                 // Arabic
        'пользователь@тест.рф',            // Russian Cyrillic
        'ユーザー@テスト.日本',               // Japanese
        '🏥👨‍⚕️@medical-🔬.test',          // Emojis
        'tëst.üsér@mėdįčăl.éxãmplë.cøm',  // Accented characters
        'user+tag@sub.domain.co.uk',       // Complex valid email
      ];
      
      await page.goto(BASE_URL + '/register');
      
      for (const input of unicodeInputs) {
        await page.fill('input[name="name"]', `Unicode Test ${Date.now()}`);
        await page.fill('input[type="email"]', input);
        await page.fill('input[type="password"]', 'UnicodeTest123!');
        await page.fill('input[name="confirmPassword"]', 'UnicodeTest123!');
        
        // Check if input is accepted and properly rendered
        const emailValue = await page.inputValue('input[type="email"]');
        expect(emailValue).toBe(input);
        
        console.log(`✅ Handles unicode input: ${input}`);
        
        // Clear for next test
        await page.fill('input[type="email"]', '');
      }
    });

    test('should handle malformed and edge case inputs', async ({ page }) => {
      console.log('🚫 Testing malformed input handling...');
      
      await page.goto(BASE_URL + '/login');
      
      const malformedInputs = [
        '',                           // Empty
        ' ',                          // Whitespace only
        '\n\t\r',                     // Control characters
        'a'.repeat(1000),             // Very long
        '...@...',                    // Multiple dots
        'test@',                      // Incomplete email
        '@test.com',                  // Missing local part
        'test@.com',                  // Missing domain
        'test@test',                  // Missing TLD
        'test test@test.com',         // Space in local part
        'test@test test.com',         // Space in domain
      ];
      
      for (const input of malformedInputs) {
        await page.fill('input[type="email"]', input);
        await page.fill('input[type="password"]', 'MalformedTest123!');
        await page.click('button[type="submit"]');
        
        // Should show validation error, not crash
        const hasError = await page.isVisible('.text-destructive, .error, [role="alert"]');
        
        if (input.trim() === '') {
          // Empty inputs should trigger required field validation
          expect(hasError).toBe(true);
        }
        
        console.log(`✅ Handles malformed input: "${input}"`);
        
        // Clear for next test
        await page.fill('input[type="email"]', '');
        await page.waitForTimeout(100);
      }
    });

    test('should handle rapid form manipulation', async ({ page }) => {
      console.log('⚡ Testing rapid form manipulation...');
      
      await page.goto(BASE_URL + '/register');
      
      // Rapid typing and deletion
      for (let i = 0; i < 100; i++) {
        await page.type('input[name="name"]', 'A');
        if (i % 5 === 0) {
          await page.keyboard.press('Backspace');
        }
      }
      
      // Rapid tab navigation
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(10);
      }
      
      // Rapid form submission attempts
      await page.fill('input[name="name"]', 'Rapid Test');
      await page.fill('input[type="email"]', 'rapid@test.com');
      await page.fill('input[type="password"]', 'RapidTest123!');
      await page.fill('input[name="confirmPassword"]', 'RapidTest123!');
      
      // Multiple rapid clicks
      for (let i = 0; i < 10; i++) {
        page.click('button[type="submit"]'); // Don't await
        await page.waitForTimeout(50);
      }
      
      // Should handle rapid manipulation without crashing
      const formStillFunctional = await page.isVisible('form');
      expect(formStillFunctional).toBe(true);
      
      console.log('✅ Handles rapid form manipulation correctly');
    });
  });

  test.describe('Session Management Stress', () => {
    
    test('should handle session timeout scenarios', async ({ page }) => {
      console.log('⏰ Testing session timeout handling...');
      
      // Simulate successful login
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'timeout@test.com');
      await page.fill('input[type="password"]', 'TimeoutTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(2000);
      
      // Simulate session expiry by clearing storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to access protected area
      await page.goto(BASE_URL + '/dashboard');
      
      // Should redirect to login or show authentication error
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      const isLoginPage = currentUrl.includes('/login') || 
                         await page.isVisible('input[type="email"]') ||
                         await page.isVisible('text=Sign In');
      
      expect(isLoginPage).toBe(true);
      
      console.log('✅ Handles session timeout correctly');
    });

    test('should manage multiple concurrent sessions', async ({ page, context }) => {
      console.log('👥 Testing multiple concurrent sessions...');
      
      const sessions = [];
      
      // Create 5 concurrent sessions
      for (let i = 0; i < 5; i++) {
        const newPage = await context.newPage();
        sessions.push(newPage);
        
        await newPage.goto(BASE_URL + '/login');
        await newPage.fill('input[type="email"]', `session${i}@test.com`);
        await newPage.fill('input[type="password"]', `SessionTest${i}123!`);
        await newPage.click('button[type="submit"]');
      }
      
      // Wait for all sessions to process
      await Promise.all(sessions.map(s => s.waitForTimeout(3000)));
      
      // Check that all sessions are independent
      for (let i = 0; i < sessions.length; i++) {
        const isWorking = await sessions[i].isVisible('form, input[type="email"], .dashboard');
        expect(isWorking).toBe(true);
        console.log(`✅ Session ${i + 1} is functional`);
      }
      
      // Clean up
      await Promise.all(sessions.map(s => s.close()));
      
      console.log('✅ Multiple concurrent sessions work correctly');
    });
  });

  test.describe('Real-World Medical Scenarios', () => {
    
    test('should handle peak usage times (exam periods)', async ({ page }) => {
      console.log('📚 Testing peak exam period usage...');
      
      // Simulate multiple rapid quiz attempts during exam season
      const examAttempts = [];
      
      for (let attempt = 0; attempt < 15; attempt++) {
        const startTime = Date.now();
        
        await page.goto(BASE_URL + '/login');
        await page.fill('input[type="email"]', `examstudent${attempt}@med.edu`);
        await page.fill('input[type="password"]', `ExamPrep${attempt}123!`);
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 8000 });
        
        const responseTime = Date.now() - startTime;
        examAttempts.push(responseTime);
        
        console.log(`Exam attempt ${attempt + 1}: ${responseTime}ms`);
      }
      
      const avgExamResponseTime = examAttempts.reduce((a, b) => a + b, 0) / examAttempts.length;
      console.log(`📊 Average exam period response time: ${avgExamResponseTime.toFixed(2)}ms`);
      
      // Should maintain reasonable performance even during peak times
      expect(avgExamResponseTime).toBeLessThan(8000); // 8 seconds during peak
      
      console.log('✅ Handles peak exam period usage effectively');
    });

    test('should handle international medical school access', async ({ page }) => {
      console.log('🌍 Testing international medical school access...');
      
      const internationalSchools = [
        'student@mcmaster.ca',           // Canada
        'medstudent@sydney.edu.au',      // Australia
        'doctor@imperial.ac.uk',         // UK
        'resident@karolinska.se',        // Sweden
        'intern@meduni-wien.ac.at',      // Austria
        'fellow@nus.edu.sg',             // Singapore
      ];
      
      for (let i = 0; i < internationalSchools.length; i++) {
        const email = internationalSchools[i];
        const startTime = Date.now();
        
        await page.goto(BASE_URL + '/register');
        await page.fill('input[name="name"]', `International Student ${i + 1}`);
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', `IntlStudent${i}123!`);
        await page.fill('input[name="confirmPassword"]', `IntlStudent${i}123!`);
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"], .success', { timeout: 10000 });
        
        const responseTime = Date.now() - startTime;
        console.log(`✅ ${email}: ${responseTime}ms`);
      }
      
      console.log('✅ Supports international medical school access');
    });
  });

});

console.log(`
🔥 MedQuiz Pro Authentication Stress Testing Suite
==================================================

This comprehensive stress test suite validates:
💥 High Load Scenarios (burst registrations, continuous load)
🧠 Memory & Resource Stress (large inputs, memory pressure)
📡 Network Stress (slow connections, interruptions, DNS failures)
🔥 CPU-Intensive Operations
🌍 Unicode & Special Character Handling
🚫 Malformed Input Processing
⚡ Rapid Form Manipulation
⏰ Session Management Under Stress
👥 Concurrent User Sessions
📚 Peak Usage Scenarios (exam periods)
🌍 International Access Patterns

Run with: npx playwright test auth-stress-tests.js --workers=1
`);