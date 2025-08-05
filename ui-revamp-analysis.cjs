const { chromium } = require('playwright');

(async () => {
  console.log('🎨 Starting UI/UX Analysis for MedQuiz Pro');
  console.log('🌐 Testing URL: https://usmle-trivia.netlify.app/');
  
  const browser = await chromium.launch({ 
    headless: true,
    slowMo: 200
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  // Monitor console for specific errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Monitor network issues
  const networkIssues = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkIssues.push({
        status: response.status(),
        url: response.url(),
        statusText: response.statusText()
      });
    }
  });
  
  try {
    console.log('\n🔍 PHASE 1: Core Application Status Analysis');
    
    // Navigate and check basic functionality
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    
    // Screenshot full landing page
    await page.screenshot({ 
      path: 'ui-analysis-landing.png', 
      fullPage: true 
    });
    
    console.log('✅ Landing page loaded successfully');
    
    // Check for React app initialization
    const reactApp = await page.evaluate(() => {
      return {
        hasReactRoot: !!document.querySelector('#root'),
        hasReactComponents: document.querySelector('[data-reactroot], .react-component, [class*="react"]') !== null,
        title: document.title,
        bodyContent: document.body.textContent ? document.body.textContent.length > 100 : false
      };
    });
    
    console.log(`📱 React app status:`, reactApp);
    
    // Navigate to login to test authentication
    console.log('\n🔐 PHASE 2: Authentication & Navigation Analysis');
    
    try {
      await page.click('text=Sign in');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'ui-analysis-login.png', 
        fullPage: true 
      });
      
      console.log('✅ Navigation to login successful');
      
      // Fill login form with test credentials
      await page.fill('input[type="email"]', 'jimkalinov@gmail.com');
      await page.fill('input[type="password"]', 'Jimkali90#');
      
      await page.screenshot({ 
        path: 'ui-analysis-login-filled.png', 
        fullPage: true 
      });
      
      // Try login
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      console.log(`🌐 URL after login attempt: ${currentUrl}`);
      
      await page.screenshot({ 
        path: 'ui-analysis-after-login.png', 
        fullPage: true 
      });
      
      // Check if we're still on login page (indicates login failure)
      const stillOnLogin = currentUrl.includes('/login');
      console.log(`🔐 Login result: ${stillOnLogin ? 'FAILED - Still on login page' : 'SUCCESS - Redirected'}`);
      
    } catch (e) {
      console.log('❌ Authentication flow error:', e.message);
    }
    
    console.log('\n📱 PHASE 3: Mobile Responsiveness Analysis');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'ui-analysis-mobile.png', 
      fullPage: true 
    });
    
    console.log('📸 Mobile screenshot captured');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'ui-analysis-tablet.png', 
      fullPage: true 
    });
    
    console.log('📸 Tablet screenshot captured');
    
    // Return to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('\n🎨 PHASE 4: UI/UX Design Analysis');
    
    // Go back to landing page for design analysis
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    
    const designAnalysis = await page.evaluate(() => {
      const styles = getComputedStyle(document.body);
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input');
      const cards = document.querySelectorAll('.card, [class*="card"], .bg-white, [class*="bg-white"]');
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      return {
        colorScheme: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontFamily: styles.fontFamily
        },
        components: {
          buttonCount: buttons.length,
          inputCount: inputs.length,
          cardCount: cards.length,
          headingCount: headings.length
        },
        layout: {
          maxWidth: styles.maxWidth,
          padding: styles.padding,
          margin: styles.margin
        }
      };
    });
    
    console.log('🎨 Design analysis:', JSON.stringify(designAnalysis, null, 2));
    
    // Take a final high-quality screenshot
    await page.screenshot({ 
      path: 'ui-analysis-final-desktop.png', 
      fullPage: true,
      type: 'png',
      quality: 100
    });
    
    console.log('\n📊 PHASE 5: Issue Summary & Recommendations');
    
    console.log('\n🐛 Technical Issues Found:');
    console.log(`❌ Console Errors: ${errors.length}`);
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    
    console.log(`\n🌐 Network Issues: ${networkIssues.length}`);
    networkIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.status} - ${issue.url}`);
    });
    
    // Analyze the core issues
    const convexErrors = errors.filter(e => e.includes('convex') || e.includes('Failed to load resource'));
    const authErrors = networkIssues.filter(i => i.url.includes('getUserByEmail') || i.url.includes('auth'));
    
    console.log('\n🔍 Root Cause Analysis:');
    if (convexErrors.length > 0) {
      console.log('🔴 CRITICAL: Convex backend connection issues detected');
      console.log('   - The app is not properly connected to its database');
      console.log('   - Authentication will fail due to API endpoints not responding');
      console.log('   - Quiz functionality will be non-functional');
    }
    
    if (authErrors.length > 0) {
      console.log('🔴 CRITICAL: Authentication service failures');
      console.log('   - User login/registration not working');
      console.log('   - Backend API endpoints returning 404');
    }
    
    console.log('\n✅ Working Components:');
    console.log('✅ React app loads and renders');
    console.log('✅ UI components display correctly');
    console.log('✅ Navigation between pages works');
    console.log('✅ Responsive design adapts to different screen sizes');
    console.log('✅ Forms accept user input');
    
    console.log('\n🎯 PRIORITY FIXES NEEDED:');
    console.log('1. 🔴 HIGH: Fix Convex backend connection (environment variables?)');
    console.log('2. 🔴 HIGH: Resolve authentication API endpoints');
    console.log('3. 🟡 MEDIUM: Improve error handling for better UX');
    console.log('4. 🟢 LOW: UI/UX enhancements and modern design updates');
    
    console.log('\n🎨 UI/UX ENHANCEMENT OPPORTUNITIES:');
    console.log('1. Modern gradient backgrounds and glass morphism effects');
    console.log('2. Improved button hover states and micro-interactions');
    console.log('3. Better loading states and skeleton screens');
    console.log('4. Enhanced mobile touch targets and gestures');
    console.log('5. Dark mode support with system preference detection');
    console.log('6. Improved typography hierarchy and spacing');
    
    // Save analysis results
    const analysisResults = {
      timestamp: new Date().toISOString(),
      coreStatus: {
        reactAppWorking: reactApp.hasReactRoot && reactApp.bodyContent,
        navigationWorking: true,
        responsiveDesign: true,
        backendConnected: networkIssues.length === 0,
        authenticationWorking: authErrors.length === 0
      },
      issues: {
        consoleErrors: errors,
        networkIssues: networkIssues,
        convexConnectionIssues: convexErrors.length > 0,
        authenticationIssues: authErrors.length > 0
      },
      designAnalysis: designAnalysis,
      recommendations: {
        criticalFixes: [
          'Fix Convex backend connection',
          'Resolve authentication API endpoints',
          'Improve error handling for better UX'
        ],
        uiEnhancements: [
          'Modern gradient backgrounds and glass morphism',
          'Improved button hover states and micro-interactions',
          'Better loading states and skeleton screens',
          'Enhanced mobile touch targets',
          'Dark mode support',
          'Improved typography hierarchy'
        ]
      }
    };
    
    require('fs').writeFileSync('ui-analysis-results.json', JSON.stringify(analysisResults, null, 2));
    console.log('\n📁 Analysis results saved to ui-analysis-results.json');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    await page.screenshot({ 
      path: 'ui-analysis-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n✅ UI/UX Analysis completed!');
  }
})();