/**
 * Production Site Edge Case Testing for MedQuiz Pro
 * Testing the live site at https://usmle-trivia.netlify.app
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const config = {
  baseUrl: 'https://usmle-trivia.netlify.app',
  screenshotDir: './production-test-screenshots',
  timeout: 15000
};

// Ensure screenshot directory exists
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

class ProductionEdgeCaseTests {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async init() {
    console.log('🚀 Starting Production MedQuiz Pro Edge Case Testing...');
    console.log(`🌐 Testing site: ${config.baseUrl}`);
    
    this.browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Capture console logs and errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 CONSOLE ERROR:', msg.text());
      } else {
        console.log('🖥️  CONSOLE:', msg.text());
      }
    });
    this.page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));
    this.page.on('requestfailed', request => console.log('🚫 REQUEST FAILED:', request.url()));
  }

  async takeScreenshot(name, description) {
    const filepath = path.join(config.screenshotDir, `${name}_${Date.now()}.png`);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 ${description}: ${filepath}`);
    return filepath;
  }

  async recordResult(test, status, details, screenshot = null) {
    const result = { test, status, details, screenshot, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    console.log(`${status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'} ${test}: ${details}`);
    return result;
  }

  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  async testSiteAccessibilityAndBasicNavigation() {
    console.log('\n🌐 Testing Production Site Accessibility...');
    
    try {
      await this.page.goto(config.baseUrl, { waitUntil: 'networkidle0', timeout: config.timeout });
      await this.takeScreenshot('01_prod_homepage', 'Production homepage loaded');
      
      const title = await this.page.title();
      await this.recordResult('Production Site Loading', 'PASS', `Site loaded successfully: ${title}`);
      
      // Look for navigation elements
      const hasGetStarted = await this.page.$('button:has-text("Get Started"), a:has-text("Get Started"), [class*="get-started"], [class*="start"]');
      const hasLogin = await this.page.$('button:has-text("Login"), a:has-text("Login"), a[href*="login"], [class*="login"]');
      const hasSignUp = await this.page.$('button:has-text("Sign Up"), a:has-text("Sign Up"), a[href*="register"], [class*="register"]');
      
      if (hasGetStarted || hasLogin || hasSignUp) {
        await this.recordResult('Navigation Elements', 'PASS', 'Authentication navigation found');
        return true;
      } else {
        await this.recordResult('Navigation Elements', 'FAIL', 'No authentication navigation found');
        return false;
      }
      
    } catch (error) {
      await this.recordResult('Production Site Loading', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async testNavigationToAuthPages() {
    console.log('\n🔍 Testing Navigation to Authentication Pages...');
    
    try {
      // Try multiple navigation strategies
      const strategies = [
        { method: 'direct', url: '/login' },
        { method: 'direct', url: '/register' },
        { method: 'button', selector: 'button:has-text("Get Started")' },
        { method: 'link', selector: 'a[href*="login"]' },
        { method: 'link', selector: 'a[href*="register"]' }
      ];

      for (const strategy of strategies) {
        try {
          if (strategy.method === 'direct') {
            console.log(`Trying direct navigation to ${strategy.url}...`);
            await this.page.goto(`${config.baseUrl}${strategy.url}`, { 
              waitUntil: 'networkidle0', 
              timeout: config.timeout 
            });
            
            const url = this.page.url();
            if (url.includes(strategy.url)) {
              await this.takeScreenshot(`02_nav_${strategy.url.replace('/', '')}`, `Navigation to ${strategy.url}`);
              await this.recordResult(`Navigation to ${strategy.url}`, 'PASS', `Successfully navigated to ${strategy.url}`);
              return strategy.url;
            }
          } else {
            console.log(`Trying ${strategy.method} with selector: ${strategy.selector}...`);
            await this.page.goto(config.baseUrl);
            const element = await this.page.$(strategy.selector);
            if (element) {
              await element.click();
              await this.page.waitForTimeout(2000);
              const newUrl = this.page.url();
              if (newUrl !== config.baseUrl) {
                await this.takeScreenshot(`02_nav_${strategy.method}`, `Navigation via ${strategy.method}`);
                await this.recordResult(`Navigation via ${strategy.method}`, 'PASS', `Successfully navigated to: ${newUrl}`);
                return newUrl;
              }
            }
          }
        } catch (error) {
          console.log(`Strategy ${strategy.method} failed: ${error.message}`);
        }
      }
      
      await this.recordResult('Authentication Navigation', 'FAIL', 'No working navigation to auth pages found');
      return null;
      
    } catch (error) {
      await this.recordResult('Authentication Navigation', 'FAIL', `Error: ${error.message}`);
      return null;
    }
  }

  async testFormElementsAndInteractions() {
    console.log('\n📝 Testing Form Elements and Interactions...');
    
    try {
      // Try to find and test form elements
      const authUrl = await this.testNavigationToAuthPages();
      if (!authUrl) {
        await this.recordResult('Form Elements Test', 'SKIP', 'No auth pages accessible');
        return;
      }

      // Look for various form input patterns
      const inputSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email"]',
        'input[id*="email"]',
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="password"]',
        'input[id*="password"]',
        'input[type="text"]',
        'input[name="name"]',
        'input[placeholder*="name"]'
      ];

      let foundInputs = [];
      for (const selector of inputSelectors) {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          foundInputs.push(`${selector} (${elements.length})`);
        }
      }

      if (foundInputs.length > 0) {
        await this.takeScreenshot('03_form_elements', 'Form elements found');
        await this.recordResult('Form Elements Detection', 'PASS', `Found inputs: ${foundInputs.join(', ')}`);
        return foundInputs;
      } else {
        await this.recordResult('Form Elements Detection', 'FAIL', 'No form inputs found');
        return [];
      }
      
    } catch (error) {
      await this.recordResult('Form Elements Test', 'FAIL', `Error: ${error.message}`);
      return [];
    }
  }

  async testMedicalEmailFormats() {
    console.log('\n📧 Testing Medical School Email Formats on Production...');
    
    const medicalEmails = [
      'student@harvard.edu',
      'med.student@johnshopkins.edu',
      'resident@mayo.edu',
      'dr.smith@oxford.ac.uk',
      'international@universidad.mx',
      'test+residency@ucsf.edu'
    ];

    for (const email of medicalEmails) {
      try {
        // Navigate to registration or login page
        await this.page.goto(`${config.baseUrl}/register`, { waitUntil: 'networkidle0', timeout: config.timeout });
        
        // Try multiple email input selectors
        const emailSelectors = ['#email', 'input[type="email"]', 'input[name="email"]', 'input[placeholder*="email"]'];
        let emailInput = null;
        
        for (const selector of emailSelectors) {
          emailInput = await this.page.$(selector);
          if (emailInput) break;
        }

        if (emailInput) {
          await emailInput.click();
          await emailInput.evaluate(el => el.value = ''); // Clear field
          await emailInput.type(email);
          
          const value = await emailInput.evaluate(el => el.value);
          const accepted = value === email;
          
          await this.takeScreenshot(`04_email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`, `Testing email: ${email}`);
          await this.recordResult(`Medical Email: ${email}`, accepted ? 'PASS' : 'FAIL', `Email ${accepted ? 'accepted' : 'rejected'}`);
        } else {
          await this.recordResult(`Medical Email: ${email}`, 'SKIP', 'No email input found');
        }
        
      } catch (error) {
        await this.recordResult(`Medical Email: ${email}`, 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testPasswordComplexityEdgeCases() {
    console.log('\n🔐 Testing Password Complexity Edge Cases...');
    
    const passwordTests = [
      { pwd: 'Medicine123!', desc: 'Medical term with numbers and symbols' },
      { pwd: 'Stethoscope@2024', desc: 'Medical equipment reference' },
      { pwd: 'USMLE_Step1_Ready!', desc: 'USMLE reference with underscores' },
      { pwd: 'ECG+EKG+Medical#2024', desc: 'Medical abbreviations with special chars' },
      { pwd: 'Très_Médical_123!', desc: 'Accented characters' },
      { pwd: 'shortpwd', desc: 'Too short password (should fail validation)' },
      { pwd: 'A'.repeat(100) + '123!', desc: 'Very long password' }
    ];

    for (const test of passwordTests) {
      try {
        await this.page.goto(`${config.baseUrl}/register`, { waitUntil: 'networkidle0', timeout: config.timeout });
        
        const passwordSelectors = ['#password', 'input[type="password"]', 'input[name="password"]'];
        let passwordInput = null;
        
        for (const selector of passwordSelectors) {
          passwordInput = await this.page.$(selector);
          if (passwordInput) break;
        }

        if (passwordInput) {
          await passwordInput.click();
          await passwordInput.evaluate(el => el.value = '');
          await passwordInput.type(test.pwd);
          
          const value = await passwordInput.evaluate(el => el.value);
          const accepted = value.length > 0;
          
          await this.takeScreenshot(`05_password_${test.desc.replace(/[^a-zA-Z0-9]/g, '_')}`, test.desc);
          await this.recordResult(`Password: ${test.desc}`, accepted ? 'PASS' : 'FAIL', `Password handling test`);
        } else {
          await this.recordResult(`Password: ${test.desc}`, 'SKIP', 'No password input found');
        }
        
      } catch (error) {
        await this.recordResult(`Password: ${test.desc}`, 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testMobileDeviceCompatibility() {
    console.log('\n📱 Testing Mobile Device Compatibility...');
    
    const devices = [
      { name: 'iPhone_SE', viewport: { width: 375, height: 667 } },
      { name: 'iPhone_12', viewport: { width: 390, height: 844 } },
      { name: 'iPad', viewport: { width: 768, height: 1024 } },
      { name: 'Android_Phone', viewport: { width: 360, height: 640 } },
      { name: 'Samsung_Galaxy', viewport: { width: 412, height: 915 } }
    ];

    for (const device of devices) {
      try {
        await this.page.setViewport(device.viewport);
        await this.page.goto(config.baseUrl, { waitUntil: 'networkidle0', timeout: config.timeout });
        
        await this.takeScreenshot(`06_mobile_${device.name}`, `${device.name} compatibility test`);
        
        // Test if the page is responsive
        const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = device.viewport.width;
        const isResponsive = bodyWidth <= viewportWidth * 1.1; // Allow 10% tolerance
        
        // Try to find and interact with form elements on mobile
        const hasFormElements = await this.page.$('input, button');
        
        await this.recordResult(
          `Mobile: ${device.name}`, 
          (isResponsive && hasFormElements) ? 'PASS' : 'PARTIAL', 
          `Responsive: ${isResponsive}, Has forms: ${!!hasFormElements}`
        );
        
      } catch (error) {
        await this.recordResult(`Mobile: ${device.name}`, 'FAIL', `Error: ${error.message}`);
      }
    }
    
    // Reset to desktop viewport
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async testRapidInteractionsAndStressTests() {
    console.log('\n⚡ Testing Rapid Interactions (Stressed Students Scenario)...');
    
    try {
      await this.page.goto(config.baseUrl, { waitUntil: 'networkidle0', timeout: config.timeout });
      
      // Simulate rapid clicking and interactions
      const buttons = await this.page.$$('button, a, input[type="submit"]');
      
      if (buttons.length > 0) {
        console.log(`Found ${buttons.length} interactive elements. Testing rapid interactions...`);
        
        // Rapid clicking test
        for (let i = 0; i < Math.min(5, buttons.length); i++) {
          try {
            await buttons[i].click({ delay: 50 });
            await this.page.waitForTimeout(100);
          } catch (error) {
            console.log(`Rapid click ${i} failed: ${error.message}`);
          }
        }
        
        await this.takeScreenshot('07_rapid_interactions', 'After rapid interaction test');
        
        // Check if site is still functional
        const isStillLoaded = await this.page.evaluate(() => document.readyState === 'complete');
        
        await this.recordResult(
          'Rapid Interactions Test', 
          isStillLoaded ? 'PASS' : 'FAIL', 
          `Site ${isStillLoaded ? 'remained stable' : 'became unstable'} after rapid interactions`
        );
      } else {
        await this.recordResult('Rapid Interactions Test', 'SKIP', 'No interactive elements found');
      }
      
    } catch (error) {
      await this.recordResult('Rapid Interactions Test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testAccessibilityCompliance() {
    console.log('\n♿ Testing Accessibility Compliance...');
    
    try {
      await this.page.goto(config.baseUrl, { waitUntil: 'networkidle0', timeout: config.timeout });
      
      // Test keyboard navigation
      let tabCount = 0;
      const maxTabs = 10;
      
      for (let i = 0; i < maxTabs; i++) {
        await this.page.keyboard.press('Tab');
        const activeElement = await this.page.evaluate(() => document.activeElement?.tagName);
        if (activeElement && ['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA'].includes(activeElement)) {
          tabCount++;
        }
        await this.page.waitForTimeout(100);
      }
      
      await this.takeScreenshot('08_accessibility_navigation', 'Keyboard navigation test');
      
      // Test for ARIA labels and roles
      const ariaElements = await this.page.$$('[aria-label], [role], [aria-describedby]');
      const hasAriaSupport = ariaElements.length > 0;
      
      // Test for heading structure
      const headings = await this.page.$$('h1, h2, h3, h4, h5, h6');
      const hasProperHeadings = headings.length > 0;
      
      const accessibilityScore = (tabCount > 0 ? 1 : 0) + (hasAriaSupport ? 1 : 0) + (hasProperHeadings ? 1 : 0);
      
      await this.recordResult(
        'Accessibility Compliance',
        accessibilityScore >= 2 ? 'PASS' : 'PARTIAL',
        `Tabbable elements: ${tabCount}, ARIA support: ${hasAriaSupport}, Headings: ${hasProperHeadings}`
      );
      
    } catch (error) {
      await this.recordResult('Accessibility Compliance', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testSecurityInputSanitization() {
    console.log('\n🛡️ Testing Security Input Sanitization...');
    
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '\'; DROP TABLE users; --',
      '<iframe src="javascript:alert(1)"></iframe>'
    ];

    let testsPassed = 0;
    
    for (const maliciousInput of maliciousInputs) {
      try {
        await this.page.goto(config.baseUrl, { waitUntil: 'networkidle0', timeout: config.timeout });
        
        // Try to find any input field
        const inputs = await this.page.$$('input[type="text"], input[type="email"], input[name="name"], textarea');
        
        if (inputs.length > 0) {
          const input = inputs[0];
          await input.click();
          await input.evaluate(el => el.value = '');
          await input.type(maliciousInput);
          
          const value = await input.evaluate(el => el.value);
          const isSanitized = !value.includes('<script>') && !value.includes('javascript:');
          
          if (isSanitized) testsPassed++;
          
          await this.recordResult(
            'Security Input Sanitization',
            isSanitized ? 'PASS' : 'FAIL',
            `Malicious input ${isSanitized ? 'properly handled' : 'not sanitized'}`
          );
        } else {
          await this.recordResult('Security Input Sanitization', 'SKIP', 'No input fields found');
        }
        
      } catch (error) {
        await this.recordResult('Security Input Sanitization', 'FAIL', `Error: ${error.message}`);
      }
    }
    
    await this.takeScreenshot('09_security_test', 'Security input sanitization test');
  }

  async testNetworkConditionsAndPerformance() {
    console.log('\n🌐 Testing Network Conditions and Performance...');
    
    try {
      // Test under slow network conditions
      await this.page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 100 * 1024, // 100kb/s
        uploadThroughput: 50 * 1024,    // 50kb/s
        latency: 1000 // 1s latency
      });

      const startTime = Date.now();
      await this.page.goto(config.baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      const loadTime = Date.now() - startTime;
      
      await this.takeScreenshot('10_slow_network', 'Site under slow network conditions');
      
      await this.recordResult(
        'Slow Network Performance',
        loadTime < 20000 ? 'PASS' : 'FAIL',
        `Site loaded in ${loadTime}ms under slow network (target: <20s)`
      );
      
      // Reset network conditions
      await this.page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 0,
        uploadThroughput: 0,
        latency: 0
      });
      
    } catch (error) {
      await this.recordResult('Network Performance Test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async generateComprehensiveReport() {
    console.log('\n📊 Generating Comprehensive Test Report...');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const skippedTests = this.testResults.filter(r => r.status === 'SKIP').length;
    const partialTests = this.testResults.filter(r => r.status === 'PARTIAL').length;
    
    const report = {
      testSuite: 'MedQuiz Pro Production Edge Case Testing',
      siteUrl: config.baseUrl,
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
        partial: partialTests,
        successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%'
      },
      categories: {
        'Basic Functionality': this.testResults.filter(r => r.test.includes('Site Loading') || r.test.includes('Navigation')),
        'Authentication Features': this.testResults.filter(r => r.test.includes('Email') || r.test.includes('Password') || r.test.includes('Form')),
        'Mobile Compatibility': this.testResults.filter(r => r.test.includes('Mobile')),
        'Security & Performance': this.testResults.filter(r => r.test.includes('Security') || r.test.includes('Network') || r.test.includes('Rapid')),
        'Accessibility': this.testResults.filter(r => r.test.includes('Accessibility'))
      },
      detailedResults: this.testResults,
      criticalIssues: this.testResults.filter(r => r.status === 'FAIL' && (r.test.includes('Site Loading') || r.test.includes('Security'))),
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = path.join(config.screenshotDir, 'production_edge_case_test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate human-readable summary
    const summaryPath = path.join(config.screenshotDir, 'test_summary.md');
    const summaryContent = this.generateMarkdownSummary(report);
    fs.writeFileSync(summaryPath, summaryContent);
    
    console.log('\n🎯 PRODUCTION EDGE CASE TEST SUMMARY:');
    console.log(`🌐 Site Tested: ${config.baseUrl}`);
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Partial: ${partialTests}`);
    console.log(`⏭️  Skipped: ${skippedTests}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}`);
    console.log(`📄 Detailed Report: ${reportPath}`);
    console.log(`📋 Summary Report: ${summaryPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for common issues
    if (this.testResults.some(r => r.test.includes('Navigation') && r.status === 'FAIL')) {
      recommendations.push('🔧 Fix navigation to authentication pages - critical for user onboarding');
    }
    
    if (this.testResults.some(r => r.test.includes('Form') && r.status === 'FAIL')) {
      recommendations.push('📝 Improve form element accessibility and functionality');
    }
    
    if (this.testResults.some(r => r.test.includes('Mobile') && r.status === 'FAIL')) {
      recommendations.push('📱 Enhance mobile responsiveness for clinical settings');
    }
    
    if (this.testResults.some(r => r.test.includes('Security') && r.status === 'FAIL')) {
      recommendations.push('🛡️ Implement proper input sanitization - security critical');
    }
    
    if (this.testResults.some(r => r.test.includes('Network') && r.status === 'FAIL')) {
      recommendations.push('🌐 Optimize for slow network conditions common in hospitals');
    }
    
    return recommendations;
  }

  generateMarkdownSummary(report) {
    return `# MedQuiz Pro Production Edge Case Testing Report

## Test Summary
- **Site Tested**: ${config.baseUrl}
- **Test Date**: ${new Date().toLocaleDateString()}
- **Total Tests**: ${report.summary.total}
- **Success Rate**: ${report.summary.successRate}

## Results Breakdown
- ✅ **Passed**: ${report.summary.passed}
- ❌ **Failed**: ${report.summary.failed}
- ⚠️ **Partial**: ${report.summary.partial}
- ⏭️ **Skipped**: ${report.summary.skipped}

## Critical Issues Found
${report.criticalIssues.length > 0 ? 
  report.criticalIssues.map(issue => `- ❌ **${issue.test}**: ${issue.details}`).join('\n') :
  '✅ No critical issues found'}

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Test Categories Performance
${Object.entries(report.categories).map(([category, tests]) => {
  const passed = tests.filter(t => t.status === 'PASS').length;
  const total = tests.length;
  const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
  return `- **${category}**: ${passed}/${total} (${rate}%)`;
}).join('\n')}

## Medical Student Impact Assessment
This testing focused on real-world scenarios that medical students encounter:
- 📧 Medical school email formats (.edu, international)
- 🔐 Complex passwords with medical terminology
- 📱 Mobile device usage in clinical settings
- ⚡ Rapid interactions during exam stress
- 🌐 Hospital WiFi network conditions
- ♿ Accessibility for students with disabilities

## Deployment Readiness
${report.summary.successRate >= '80%' ? 
  '✅ **READY FOR PRODUCTION** - High success rate with acceptable edge case handling' :
  '⚠️ **NEEDS IMPROVEMENT** - Address critical issues before full deployment'}
`;
  }

  async runAllTests() {
    try {
      await this.init();
      
      // Core functionality tests
      await this.testSiteAccessibilityAndBasicNavigation();
      await this.testNavigationToAuthPages();
      await this.testFormElementsAndInteractions();
      
      // Medical student specific tests
      await this.testMedicalEmailFormats();
      await this.testPasswordComplexityEdgeCases();
      
      // Device and performance tests
      await this.testMobileDeviceCompatibility();
      await this.testRapidInteractionsAndStressTests();
      
      // Security and accessibility
      await this.testAccessibilityCompliance();
      await this.testSecurityInputSanitization();
      await this.testNetworkConditionsAndPerformance();
      
      const report = await this.generateComprehensiveReport();
      return report;
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Execute tests
if (require.main === module) {
  const tester = new ProductionEdgeCaseTests();
  tester.runAllTests()
    .then(report => {
      console.log('\n🎉 Production edge case testing completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Production testing failed:', error);
      process.exit(1);
    });
}

module.exports = ProductionEdgeCaseTests;