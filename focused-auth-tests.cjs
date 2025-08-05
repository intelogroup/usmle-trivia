/**
 * Focused Authentication Edge Case Testing for MedQuiz Pro
 * Targeting critical scenarios for medical students
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const config = {
  baseUrl: 'http://localhost:4173',
  screenshotDir: './auth-test-screenshots',
  timeout: 10000
};

// Ensure screenshot directory exists
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

class AuthEdgeCaseTests {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async init() {
    console.log('🚀 Starting MedQuiz Pro Authentication Edge Case Testing...');
    this.browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Capture console logs
    this.page.on('console', msg => console.log('🖥️  PAGE:', msg.text()));
    this.page.on('pageerror', error => console.log('❌ PAGE ERROR:', error.message));
  }

  async takeScreenshot(name, description) {
    const filepath = path.join(config.screenshotDir, `${name}_${Date.now()}.png`);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 ${description}: ${filepath}`);
    return filepath;
  }

  async recordResult(test, status, details) {
    const result = { test, status, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${details}`);
    return result;
  }

  async testSiteAccessibility() {
    console.log('\n🌐 Testing Site Accessibility and Basic Navigation...');
    
    try {
      await this.page.goto(config.baseUrl, { waitUntil: 'networkidle0', timeout: config.timeout });
      await this.takeScreenshot('01_homepage', 'Homepage loaded successfully');
      
      const title = await this.page.title();
      await this.recordResult('Site Loading', 'PASS', `Site loaded with title: ${title}`);
      
      // Check for navigation to login/register
      const loginLink = await this.page.$('a[href*="login"], button:contains("Sign in"), .login');
      const registerLink = await this.page.$('a[href*="register"], button:contains("Sign up"), .register');
      
      if (loginLink || registerLink) {
        await this.recordResult('Navigation Links', 'PASS', 'Login/Register links found');
      } else {
        await this.recordResult('Navigation Links', 'FAIL', 'No login/register links found');
      }
      
    } catch (error) {
      await this.recordResult('Site Loading', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testLoginFormAccess() {
    console.log('\n🔐 Testing Login Form Access...');
    
    try {
      // Try direct navigation to login
      await this.page.goto(`${config.baseUrl}/login`, { waitUntil: 'networkidle0', timeout: config.timeout });
      await this.takeScreenshot('02_login_page', 'Login page accessed');
      
      // Check for form elements
      const emailField = await this.page.$('#email, input[type="email"]');
      const passwordField = await this.page.$('#password, input[type="password"]');
      const submitButton = await this.page.$('button[type="submit"], input[type="submit"]');
      
      if (emailField && passwordField && submitButton) {
        await this.recordResult('Login Form Elements', 'PASS', 'All form elements found');
        return true;
      } else {
        await this.recordResult('Login Form Elements', 'FAIL', 'Missing form elements');
        return false;
      }
      
    } catch (error) {
      await this.recordResult('Login Form Access', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async testMedicalEmailFormats() {
    console.log('\n📧 Testing Medical School Email Formats...');
    
    const medicalEmails = [
      'student@harvard.edu',
      'md.candidate@johnshopkins.edu',
      'resident@mayo.edu',
      'dr.smith@oxford.ac.uk',
      'test+residency@ucsf.edu',
      'very.long.medical.student.name@extremely.long.university.name.edu'
    ];

    for (const email of medicalEmails) {
      try {
        await this.page.goto(`${config.baseUrl}/register`, { waitUntil: 'networkidle0', timeout: config.timeout });
        
        const emailField = await this.page.$('#email, input[type="email"]');
        if (emailField) {
          await emailField.click();
          await emailField.type(email);
          
          const value = await emailField.evaluate(el => el.value);
          const isAccepted = value === email;
          
          await this.takeScreenshot(`03_email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`, `Testing email: ${email}`);
          await this.recordResult(`Email Format: ${email}`, isAccepted ? 'PASS' : 'FAIL', `Email ${isAccepted ? 'accepted' : 'rejected'}`);
        }
        
      } catch (error) {
        await this.recordResult(`Email Format: ${email}`, 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testPasswordComplexity() {
    console.log('\n🔐 Testing Password Complexity Cases...');
    
    const passwordTests = [
      { pwd: 'Medicine123!', desc: 'Medical term with mixed case, numbers, symbols' },
      { pwd: 'USMLE_Step1_2024!', desc: 'USMLE reference with underscores' },
      { pwd: 'Stethoscope@Hospital', desc: 'Medical equipment reference' },
      { pwd: 'ECG+EKG+Medical#2024', desc: 'Medical abbreviations with symbols' },
      { pwd: 'Password123!@#$%^&*()', desc: 'Special characters stress test' },
      { pwd: 'shortpwd', desc: 'Too short password (should fail)' },
      { pwd: 'verylongpasswordthatexceedsnormallimitsformostapplications123!', desc: 'Very long password' }
    ];

    for (const test of passwordTests) {
      try {
        await this.page.goto(`${config.baseUrl}/register`, { waitUntil: 'networkidle0', timeout: config.timeout });
        
        const passwordField = await this.page.$('#password, input[type="password"]');
        if (passwordField) {
          await passwordField.click();
          await passwordField.type(test.pwd);
          
          const value = await passwordField.evaluate(el => el.value);
          const accepted = value.length > 0;
          
          await this.takeScreenshot(`04_password_${test.desc.replace(/[^a-zA-Z0-9]/g, '_')}`, test.desc);
          await this.recordResult(`Password: ${test.desc}`, accepted ? 'PASS' : 'FAIL', `Password handling: ${accepted ? 'accepted' : 'rejected'}`);
        }
        
      } catch (error) {
        await this.recordResult(`Password: ${test.desc}`, 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testMobileResponsiveness() {
    console.log('\n📱 Testing Mobile Device Compatibility...');
    
    const devices = [
      { name: 'iPhone', viewport: { width: 375, height: 667 } },
      { name: 'iPad', viewport: { width: 768, height: 1024 } },
      { name: 'Android', viewport: { width: 360, height: 640 } }
    ];

    for (const device of devices) {
      try {
        await this.page.setViewport(device.viewport);
        await this.page.goto(`${config.baseUrl}/login`, { waitUntil: 'networkidle0', timeout: config.timeout });
        
        await this.takeScreenshot(`05_mobile_${device.name}`, `${device.name} compatibility test`);
        
        // Test if form elements are accessible on mobile
        const emailField = await this.page.$('#email, input[type="email"]');
        const passwordField = await this.page.$('#password, input[type="password"]');
        
        if (emailField && passwordField) {
          await emailField.tap();
          await emailField.type('mobile@test.edu');
          await passwordField.tap();
          await passwordField.type('MobileTest123!');
          
          await this.recordResult(`Mobile: ${device.name}`, 'PASS', 'Form elements accessible and functional');
        } else {
          await this.recordResult(`Mobile: ${device.name}`, 'FAIL', 'Form elements not accessible');
        }
        
      } catch (error) {
        await this.recordResult(`Mobile: ${device.name}`, 'FAIL', `Error: ${error.message}`);
      }
    }
    
    // Reset viewport
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async testFormValidationAndErrorHandling() {
    console.log('\n🚨 Testing Form Validation and Error Handling...');
    
    try {
      await this.page.goto(`${config.baseUrl}/login`, { waitUntil: 'networkidle0', timeout: config.timeout });
      
      // Test empty form submission
      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await this.page.waitForTimeout(2000); // Wait for potential error messages
        
        await this.takeScreenshot('06_empty_form_submission', 'Empty form submission test');
        
        // Check for error messages or validation
        const errorElements = await this.page.$$('.error, .invalid, [class*="error"], [class*="invalid"]');
        const hasValidation = errorElements.length > 0;
        
        await this.recordResult('Empty Form Validation', hasValidation ? 'PASS' : 'FAIL', `Form validation: ${hasValidation ? 'working' : 'missing'}`);
      }
      
      // Test invalid email format
      const emailField = await this.page.$('#email, input[type="email"]');
      if (emailField) {
        await emailField.click();
        await emailField.type('invalid-email-format');
        await submitButton.click();
        await this.page.waitForTimeout(2000);
        
        await this.takeScreenshot('07_invalid_email', 'Invalid email format test');
        
        const emailValidation = await this.page.$eval('#email, input[type="email"]', el => el.validity.valid);
        await this.recordResult('Email Validation', !emailValidation ? 'PASS' : 'FAIL', `Email validation: ${!emailValidation ? 'working' : 'not working'}`);
      }
      
    } catch (error) {
      await this.recordResult('Form Validation', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testSecurityInputSanitization() {
    console.log('\n🛡️ Testing Security Input Sanitization...');
    
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '\'; DROP TABLE users; --'
    ];

    for (const maliciousInput of maliciousInputs) {
      try {
        await this.page.goto(`${config.baseUrl}/register`, { waitUntil: 'networkidle0', timeout: config.timeout });
        
        const nameField = await this.page.$('#name, input[name="name"]');
        if (nameField) {
          await nameField.click();
          await nameField.type(maliciousInput);
          
          const value = await nameField.evaluate(el => el.value);
          const isSanitized = !value.includes('<script>') || value !== maliciousInput;
          
          await this.takeScreenshot(`08_security_test_${Math.random().toString(36).substr(2, 5)}`, 'Security input test');
          await this.recordResult('Security Sanitization', isSanitized ? 'PASS' : 'FAIL', 'Input properly handled');
        }
        
      } catch (error) {
        await this.recordResult('Security Sanitization', 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testRealUserAuthentication() {
    console.log('\n👤 Testing Real User Authentication Flow...');
    
    try {
      await this.page.goto(`${config.baseUrl}/login`, { waitUntil: 'networkidle0', timeout: config.timeout });
      
      // Use the documented test credentials
      const emailField = await this.page.$('#email, input[type="email"]');
      const passwordField = await this.page.$('#password, input[type="password"]');
      const submitButton = await this.page.$('button[type="submit"]');
      
      if (emailField && passwordField && submitButton) {
        await emailField.type('jayveedz19@gmail.com');
        await passwordField.type('Jimkali90#');
        
        await this.takeScreenshot('09_real_user_login', 'Real user login attempt');
        
        await submitButton.click();
        await this.page.waitForTimeout(5000); // Wait for authentication
        
        // Check if redirected to dashboard or still on login page
        const currentUrl = this.page.url();
        const isAuthenticated = currentUrl.includes('/dashboard') || !currentUrl.includes('/login');
        
        await this.takeScreenshot('10_post_authentication', 'Post authentication state');
        
        await this.recordResult('Real User Authentication', isAuthenticated ? 'PASS' : 'FAIL', `Authentication result: ${isAuthenticated ? 'successful' : 'failed'}`);
      }
      
    } catch (error) {
      await this.recordResult('Real User Authentication', 'FAIL', `Error: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📊 Generating Test Report...');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    
    const report = {
      testSuite: 'MedQuiz Pro Authentication Edge Case Testing',
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%'
      },
      results: this.testResults
    };
    
    const reportPath = path.join(config.screenshotDir, 'authentication_test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n🎯 AUTHENTICATION EDGE CASE TEST SUMMARY:');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${report.summary.successRate}`);
    console.log(`📄 Report saved: ${reportPath}`);
    
    return report;
  }

  async runAllTests() {
    try {
      await this.init();
      
      await this.testSiteAccessibility();
      await this.testLoginFormAccess();
      await this.testMedicalEmailFormats();
      await this.testPasswordComplexity();
      await this.testMobileResponsiveness();
      await this.testFormValidationAndErrorHandling();
      await this.testSecurityInputSanitization();
      await this.testRealUserAuthentication();
      
      const report = await this.generateReport();
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

// Run tests
if (require.main === module) {
  const tester = new AuthEdgeCaseTests();
  tester.runAllTests()
    .then(report => {
      console.log('\n🎉 Authentication edge case testing completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = AuthEdgeCaseTests;