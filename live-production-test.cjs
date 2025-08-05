const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting comprehensive MedQuiz Pro LIVE PRODUCTION testing...');
  console.log('🌐 Testing URL: https://usmle-trivia.netlify.app/');
  console.log('👤 Test credentials: jimkalinov@gmail.com / Jimkali90#');
  
  // Launch browser with proper configuration
  const browser = await chromium.launch({ 
    headless: true,
    slowMo: 500 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: 'test-videos/' }
  });
  
  const page = await context.newPage();
  
  // Monitor console errors and warnings
  const consoleMessages = [];
  page.on('console', msg => {
    const messageType = msg.type();
    const messageText = msg.text();
    const message = `[${messageType.toUpperCase()}] ${messageText}`;
    consoleMessages.push(message);
    if (messageType === 'error') {
      console.log('❌ Console Error:', messageText);
    } else if (messageType === 'warning') {
      console.log('⚠️ Console Warning:', messageText);
    }
  });
  
  // Monitor network failures
  const networkIssues = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      const issue = `${response.status()} ${response.url()}`;
      networkIssues.push(issue);
      console.log('🌐 Network Issue:', issue);
    }
  });
  
  try {
    console.log('\n📱 PHASE 1: Landing Page Analysis & Performance');
    
    // Navigate to the application with performance tracking
    const startTime = Date.now();
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Initial load time: ${loadTime}ms`);
    
    // Get page title and meta info
    const title = await page.title();
    const url = page.url();
    console.log(`📄 Page title: "${title}"`);
    console.log(`🌐 Final URL: ${url}`);
    
    // Screenshot landing page
    await page.screenshot({ 
      path: 'test-screenshots/live-01-landing-page-desktop.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot: Landing page (desktop 1280x720)');
    
    // Analyze landing page content
    const mainHeading = await page.locator('h1').first().textContent().catch(() => 'Not found');
    const hasLoginButton = await page.locator('text=Login, text=Sign in, a[href*="login"]').first().isVisible().catch(() => false);
    const hasRegisterButton = await page.locator('text=Register, text=Sign up, a[href*="register"]').first().isVisible().catch(() => false);
    
    console.log(`📝 Main heading: "${mainHeading}"`);
    console.log(`🔐 Login button visible: ${hasLoginButton}`);
    console.log(`📝 Register button visible: ${hasRegisterButton}`);
    
    console.log('\n🔐 PHASE 2: Authentication Flow Testing');
    
    // Navigate to login page
    let loginNavigated = false;
    try {
      // Try multiple ways to get to login
      const loginSelectors = [
        'text=Login',
        'text=Sign in', 
        'a[href*="login"]',
        'button:has-text("Login")',
        '[data-testid="login-button"]'
      ];
      
      for (const selector of loginSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click();
            await page.waitForLoadState('networkidle');
            loginNavigated = true;
            console.log(`✅ Navigated to login using: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      // If no login button found, try direct navigation
      if (!loginNavigated) {
        await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
        loginNavigated = true;
        console.log('✅ Navigated to login via direct URL');
      }
    } catch (e) {
      console.log('❌ Could not navigate to login:', e.message);
    }
    
    if (loginNavigated) {
      await page.screenshot({ 
        path: 'test-screenshots/live-02-login-page.png', 
        fullPage: true 
      });
      console.log('📸 Screenshot: Login page');
      
      // Test login form
      try {
        const emailField = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
        const passwordField = await page.locator('input[type="password"], input[name="password"]').first();
        
        const emailVisible = await emailField.isVisible({ timeout: 3000 }).catch(() => false);
        const passwordVisible = await passwordField.isVisible({ timeout: 3000 }).catch(() => false);
        
        console.log(`📧 Email field visible: ${emailVisible}`);
        console.log(`🔒 Password field visible: ${passwordVisible}`);
        
        if (emailVisible && passwordVisible) {
          // Fill in credentials
          await emailField.fill('jimkalinov@gmail.com');
          await passwordField.fill('Jimkali90#');
          
          console.log('✅ Filled login credentials');
          
          // Screenshot with filled form
          await page.screenshot({ 
            path: 'test-screenshots/live-03-login-filled.png', 
            fullPage: true 
          });
          console.log('📸 Screenshot: Login form filled');
          
          // Submit form
          const submitSelectors = [
            'button[type="submit"]',
            'button:has-text("Login")',
            'button:has-text("Sign in")',
            'input[type="submit"]'
          ];
          
          let submitted = false;
          for (const selector of submitSelectors) {
            try {
              const submitBtn = await page.locator(selector).first();
              if (await submitBtn.isVisible({ timeout: 2000 })) {
                await submitBtn.click();
                submitted = true;
                console.log(`✅ Submitted form using: ${selector}`);
                break;
              }
            } catch (e) {
              // Continue to next selector
            }
          }
          
          if (submitted) {
            // Wait for response
            await page.waitForTimeout(3000);
            await page.waitForLoadState('networkidle');
            
            const currentUrl = page.url();
            console.log(`🌐 URL after login attempt: ${currentUrl}`);
            
            // Screenshot after login attempt
            await page.screenshot({ 
              path: 'test-screenshots/live-04-after-login-attempt.png', 
              fullPage: true 
            });
            console.log('📸 Screenshot: After login attempt');
            
            // Check for success indicators
            const successIndicators = [
              'text=Dashboard',
              'text=Welcome',
              '[data-testid="user-menu"]',
              'text=Logout',
              'text=Profile'
            ];
            
            let loginSuccessful = false;
            for (const indicator of successIndicators) {
              try {
                const element = await page.locator(indicator).first();
                if (await element.isVisible({ timeout: 2000 })) {
                  loginSuccessful = true;
                  console.log(`✅ Login success indicator found: ${indicator}`);
                  break;
                }
              } catch (e) {
                // Continue checking
              }
            }
            
            console.log(`🔐 Login appears successful: ${loginSuccessful}`);
            
            if (loginSuccessful) {
              console.log('\n🎯 PHASE 3: Dashboard & Navigation Testing');
              
              // Screenshot dashboard
              await page.screenshot({ 
                path: 'test-screenshots/live-05-dashboard.png', 
                fullPage: true 
              });
              console.log('📸 Screenshot: User dashboard');
              
              // Test navigation elements
              const navElements = [
                'Dashboard', 'Quiz', 'Practice', 'Results', 'Profile', 'Leaderboard'
              ];
              
              const foundNavElements = [];
              for (const nav of navElements) {
                try {
                  const element = await page.locator(`text=${nav}, a:has-text("${nav}"), button:has-text("${nav}")`).first();
                  if (await element.isVisible({ timeout: 2000 })) {
                    foundNavElements.push(nav);
                  }
                } catch (e) {
                  // Element not found
                }
              }
              
              console.log(`🧭 Navigation elements found: ${foundNavElements.join(', ')}`);
              
              console.log('\n🧠 PHASE 4: Quiz Functionality Testing');
              
              // Look for quiz start options
              const quizSelectors = [
                'button:has-text("Start Quiz")',
                'button:has-text("Quick Quiz")',
                'button:has-text("Practice")',
                'button:has-text("Start")',
                'text=Start Quiz',
                '[data-testid="start-quiz"]'
              ];
              
              let quizStarted = false;
              for (const selector of quizSelectors) {
                try {
                  const element = await page.locator(selector).first();
                  if (await element.isVisible({ timeout: 2000 })) {
                    await element.click();
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(2000);
                    quizStarted = true;
                    console.log(`✅ Started quiz using: ${selector}`);
                    break;
                  }
                } catch (e) {
                  // Continue to next selector
                }
              }
              
              if (quizStarted) {
                // Screenshot quiz interface
                await page.screenshot({ 
                  path: 'test-screenshots/live-06-quiz-interface.png', 
                  fullPage: true 
                });
                console.log('📸 Screenshot: Quiz interface');
                
                // Analyze quiz content
                const questionText = await page.locator('h1, h2, h3, .question, [data-testid="question"]').first().textContent().catch(() => 'No question found');
                console.log(`❓ Question preview: "${questionText.substring(0, 150)}..."`);
                
                // Look for answer options
                const answerOptions = await page.locator('button:has-text("A)"), button:has-text("B)"), input[type="radio"], .answer-option').all();
                console.log(`📝 Found ${answerOptions.length} answer options`);
                
                // Test answer selection if options exist
                if (answerOptions.length > 0) {
                  await answerOptions[0].click();
                  console.log('✅ Selected first answer option');
                  
                  // Look for submit button
                  const submitSelectors = [
                    'button:has-text("Submit")',
                    'button:has-text("Next")',
                    'button:has-text("Continue")',
                    '[data-testid="submit-answer"]'
                  ];
                  
                  for (const selector of submitSelectors) {
                    try {
                      const element = await page.locator(selector).first();
                      if (await element.isVisible({ timeout: 2000 })) {
                        await element.click();
                        await page.waitForTimeout(2000);
                        console.log(`✅ Submitted answer using: ${selector}`);
                        
                        // Screenshot after submission
                        await page.screenshot({ 
                          path: 'test-screenshots/live-07-after-answer-submission.png', 
                          fullPage: true 
                        });
                        console.log('📸 Screenshot: After answer submission');
                        break;
                      }
                    } catch (e) {
                      // Continue to next selector
                    }
                  }
                }
              } else {
                console.log('❌ Could not start quiz - no quiz buttons found');
              }
            }
          } else {
            console.log('❌ Could not submit login form - no submit button found');
          }
        } else {
          console.log('❌ Login form fields not found');
        }
      } catch (e) {
        console.log('❌ Login form testing failed:', e.message);
      }
    }
    
    console.log('\n📱 PHASE 5: Responsive Design Testing');
    
    // Test mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-screenshots/live-08-mobile-375x667.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot: Mobile viewport (375x667)');
    
    // Test tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-screenshots/live-09-tablet-768x1024.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot: Tablet viewport (768x1024)');
    
    // Test large desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-screenshots/live-10-desktop-1920x1080.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot: Large desktop viewport (1920x1080)');
    
    // Return to standard desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('\n🚪 PHASE 6: Logout Testing');
    
    // Test logout functionality
    const logoutSelectors = [
      'text=Logout',
      'text=Sign out', 
      'button:has-text("Logout")',
      '[data-testid="logout"]'
    ];
    
    let loggedOut = false;
    for (const selector of logoutSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          loggedOut = true;
          console.log(`✅ Logged out using: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (loggedOut) {
      await page.screenshot({ 
        path: 'test-screenshots/live-11-after-logout.png', 
        fullPage: true 
      });
      console.log('📸 Screenshot: After logout');
    } else {
      console.log('❌ Could not find logout button');
    }
    
    console.log('\n📊 PHASE 7: Performance & Technical Analysis');
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        totalLoadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    });
    
    console.log('⚡ Performance Metrics:');
    console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`   Total Load Time: ${performanceMetrics.totalLoadTime}ms`);
    console.log(`   First Paint: ${Math.round(performanceMetrics.firstPaint)}ms`);
    console.log(`   First Contentful Paint: ${Math.round(performanceMetrics.firstContentfulPaint)}ms`);
    
    // Test page accessibility
    console.log('\n♿ PHASE 8: Basic Accessibility Testing');
    
    const accessibilityIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt) {
          issues.push(`Image ${index + 1} missing alt text`);
        }
      });
      
      // Check for missing form labels
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach((input, index) => {
        const hasLabel = input.labels && input.labels.length > 0;
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
        
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push(`Form field ${index + 1} missing label`);
        }
      });
      
      // Check for missing heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        issues.push('No heading elements found');
      }
      
      return issues;
    });
    
    console.log(`♿ Accessibility issues found: ${accessibilityIssues.length}`);
    if (accessibilityIssues.length > 0) {
      console.log('   Issues:');
      accessibilityIssues.forEach((issue, index) => {
        console.log(`     ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n📋 COMPREHENSIVE TEST SUMMARY');
    console.log('=====================================');
    console.log(`⏱️ Initial Load Time: ${loadTime}ms`);
    console.log(`📄 Page Title: "${title}"`);
    console.log(`❌ Console Errors: ${consoleMessages.filter(m => m.includes('[ERROR]')).length}`);
    console.log(`⚠️ Console Warnings: ${consoleMessages.filter(m => m.includes('[WARNING]')).length}`);
    console.log(`🌐 Network Issues: ${networkIssues.length}`);
    console.log(`♿ Accessibility Issues: ${accessibilityIssues.length}`);
    console.log(`📸 Screenshots Captured: 11+`);
    
    // Final assessment
    console.log('\n🎯 OVERALL ASSESSMENT');
    console.log('======================');
    
    const overallScore = Math.max(0, 100 - 
      (consoleMessages.filter(m => m.includes('[ERROR]')).length * 10) -
      (networkIssues.length * 15) -
      (accessibilityIssues.length * 5) -
      (loadTime > 3000 ? 20 : 0)
    );
    
    console.log(`🏆 Overall Quality Score: ${overallScore}/100`);
    
    if (overallScore >= 90) {
      console.log('✅ EXCELLENT - Production ready with minor optimizations needed');
    } else if (overallScore >= 75) {
      console.log('✅ GOOD - Solid foundation with some improvements recommended');
    } else if (overallScore >= 60) {
      console.log('⚠️ FAIR - Several issues should be addressed before production');
    } else {
      console.log('❌ NEEDS WORK - Significant issues require attention');
    }
    
    console.log('\n📁 All screenshots saved in test-screenshots/ directory');
    console.log('🎬 Video recording saved in test-videos/ directory');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    await page.screenshot({ 
      path: 'test-screenshots/live-ERROR-state.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot saved');
  } finally {
    console.log('\n🔚 Closing browser...');
    await browser.close();
    console.log('✅ Comprehensive testing completed!');
  }
})();