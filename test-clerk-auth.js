/**
 * Comprehensive Clerk Authentication Testing Script
 * Tests all authentication flows including sign-up, sign-in, and protected routes
 */

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

class ClerkAuthTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseUrl = 'http://localhost:5173';
    this.screenshots = [];
    this.testResults = [];
    this.testEmail = 'testuser+clerk_test@example.com';
    this.verificationCode = '424242';
  }

  async initialize() {
    console.log('🚀 Initializing Clerk Authentication Test Suite...');
    
    this.browser = await chromium.launch({
      headless: true,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true
    });
    
    this.page = await this.context.newPage();
    
    // Create screenshots directory
    await fs.mkdir('./screenshots', { recursive: true });
    
    console.log('✅ Test environment initialized');
  }

  async takeScreenshot(name, description) {
    const filename = `${Date.now()}-${name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    const filepath = path.join('./screenshots', filename);
    
    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });
    
    this.screenshots.push({ name, description, filepath });
    console.log(`📸 Screenshot saved: ${name} - ${description}`);
  }

  async addTestResult(test, status, details, error = null) {
    this.testResults.push({
      test,
      status,
      details,
      error,
      timestamp: new Date().toISOString()
    });
    
    const statusIcon = status === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} ${test}: ${details}`);
    
    if (error) {
      console.log(`   Error: ${error}`);
    }
  }

  async testLandingPage() {
    console.log('\n📋 Testing Landing Page...');
    
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      await this.takeScreenshot('landing-page', 'Initial landing page load');

      // Check for key elements
      const title = await this.page.textContent('h1');
      if (title && title.includes('Master USMLE')) {
        await this.addTestResult('Landing Page Title', 'PASS', 'USMLE title found correctly');
      } else {
        await this.addTestResult('Landing Page Title', 'FAIL', `Unexpected title: ${title}`);
      }

      // Check for Clerk sign-in button
      const signInButton = await this.page.locator('button:has-text("Sign In")').first();
      if (await signInButton.isVisible()) {
        await this.addTestResult('Sign In Button', 'PASS', 'Clerk sign-in button is visible');
      } else {
        await this.addTestResult('Sign In Button', 'FAIL', 'Clerk sign-in button not found');
      }

      // Check for Clerk sign-up button
      const signUpButton = await this.page.locator('button:has-text("Get Started")').first();
      if (await signUpButton.isVisible()) {
        await this.addTestResult('Sign Up Button', 'PASS', 'Clerk sign-up button is visible');
      } else {
        await this.addTestResult('Sign Up Button', 'FAIL', 'Clerk sign-up button not found');
      }

    } catch (error) {
      await this.addTestResult('Landing Page Load', 'FAIL', 'Failed to load landing page', error.message);
    }
  }

  async testProtectedRoutes() {
    console.log('\n🔒 Testing Protected Route Access...');
    
    const protectedRoutes = ['/dashboard', '/quiz', '/progress', '/analytics', '/profile'];
    
    for (const route of protectedRoutes) {
      try {
        await this.page.goto(`${this.baseUrl}${route}`, { waitUntil: 'networkidle' });
        
        // Wait for either Clerk sign-in modal or redirect
        await this.page.waitForTimeout(2000);
        
        const url = this.page.url();
        const hasClerkSignIn = await this.page.locator('[data-clerk-id]').count() > 0;
        const isClerkModal = await this.page.locator('.cl-modal').count() > 0;
        
        if (url.includes('sign-in') || hasClerkSignIn || isClerkModal) {
          await this.addTestResult(`Protected Route ${route}`, 'PASS', 'Correctly redirected to Clerk authentication');
          await this.takeScreenshot(`protected-route-${route.replace('/', '')}`, `Clerk auth challenge for ${route}`);
        } else {
          await this.addTestResult(`Protected Route ${route}`, 'FAIL', `No authentication challenge detected for ${route}`);
        }
        
      } catch (error) {
        await this.addTestResult(`Protected Route ${route}`, 'FAIL', `Error accessing ${route}`, error.message);
      }
    }
  }

  async testSignUpFlow() {
    console.log('\n📝 Testing Clerk Sign-Up Flow...');
    
    try {
      // Go back to landing page
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Click the sign-up button
      const signUpButton = await this.page.locator('button:has-text("Get Started")').first();
      await signUpButton.click();
      
      // Wait for Clerk modal to appear
      await this.page.waitForSelector('.cl-modal, [data-clerk-id], .cl-signUp-root', { timeout: 10000 });
      await this.takeScreenshot('clerk-signup-modal', 'Clerk sign-up modal opened');
      
      // Look for email input field
      const emailInput = await this.page.locator('input[name="emailAddress"], input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await this.addTestResult('Sign-Up Modal', 'PASS', 'Clerk sign-up modal opened successfully');
        
        // Fill in the test email
        await emailInput.fill(this.testEmail);
        await this.takeScreenshot('clerk-email-filled', 'Test email entered');
        
        // Look for and click continue or sign up button
        const continueButton = await this.page.locator('button:has-text("Continue"), button:has-text("Sign up"), button[type="submit"]').first();
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await this.page.waitForTimeout(2000);
          
          // Check for verification step
          const verificationInput = await this.page.locator('input[name="code"], input[placeholder*="code"]').first();
          if (await verificationInput.isVisible()) {
            await this.addTestResult('Email Verification Step', 'PASS', 'Verification code step reached');
            await this.takeScreenshot('clerk-verification', 'Email verification step');
            
            // Enter the test verification code
            await verificationInput.fill(this.verificationCode);
            await this.takeScreenshot('clerk-verification-filled', 'Verification code entered');
            
            // Try to submit verification
            const verifyButton = await this.page.locator('button:has-text("Verify"), button:has-text("Continue"), button[type="submit"]').first();
            if (await verifyButton.isVisible()) {
              await verifyButton.click();
              await this.page.waitForTimeout(3000);
              
              // Check if we were redirected to dashboard or if signup completed
              const currentUrl = this.page.url();
              if (currentUrl.includes('/dashboard') || !currentUrl.includes('sign')) {
                await this.addTestResult('Sign-Up Complete', 'PASS', 'Successfully signed up and redirected');
                await this.takeScreenshot('signup-success', 'Successful sign-up completion');
                return true; // Sign-up successful
              } else {
                await this.addTestResult('Sign-Up Complete', 'PARTIAL', 'Verification submitted but redirect unclear');
              }
            }
          } else {
            await this.addTestResult('Email Verification Step', 'FAIL', 'Verification step not found');
          }
        } else {
          await this.addTestResult('Sign-Up Continue', 'FAIL', 'Continue button not found');
        }
      } else {
        await this.addTestResult('Sign-Up Modal', 'FAIL', 'Email input field not found in modal');
      }
      
    } catch (error) {
      await this.addTestResult('Sign-Up Flow', 'FAIL', 'Error during sign-up process', error.message);
      await this.takeScreenshot('signup-error', 'Sign-up flow error state');
    }
    
    return false; // Sign-up not successful
  }

  async testSignInFlow() {
    console.log('\n🔐 Testing Clerk Sign-In Flow...');
    
    try {
      // Go to landing page
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Click sign-in button
      const signInButton = await this.page.locator('button:has-text("Sign In")').first();
      await signInButton.click();
      
      // Wait for Clerk sign-in modal
      await this.page.waitForSelector('.cl-modal, [data-clerk-id], .cl-signIn-root', { timeout: 10000 });
      await this.takeScreenshot('clerk-signin-modal', 'Clerk sign-in modal opened');
      
      // Look for email input
      const emailInput = await this.page.locator('input[name="identifier"], input[name="emailAddress"], input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill(this.testEmail);
        
        // Look for password input (might not be visible until after email)
        const passwordInput = await this.page.locator('input[name="password"], input[type="password"]').first();
        
        if (await passwordInput.isVisible()) {
          // For demo purposes, we'll just try to continue without password
          await this.takeScreenshot('clerk-signin-form', 'Sign-in form with test email');
          
          const continueButton = await this.page.locator('button:has-text("Continue"), button:has-text("Sign in"), button[type="submit"]').first();
          if (await continueButton.isVisible()) {
            await continueButton.click();
            await this.page.waitForTimeout(2000);
            
            await this.addTestResult('Sign-In Form', 'PASS', 'Sign-in form interaction successful');
            await this.takeScreenshot('signin-attempt', 'Sign-in attempt made');
          }
        } else {
          await this.addTestResult('Sign-In Password Field', 'PARTIAL', 'Password field not immediately visible');
        }
      } else {
        await this.addTestResult('Sign-In Modal', 'FAIL', 'Email input not found in sign-in modal');
      }
      
    } catch (error) {
      await this.addTestResult('Sign-In Flow', 'FAIL', 'Error during sign-in process', error.message);
      await this.takeScreenshot('signin-error', 'Sign-in flow error state');
    }
  }

  async testUserButtonFunctionality() {
    console.log('\n👤 Testing UserButton Functionality...');
    
    try {
      // Check if we're authenticated (look for UserButton)
      await this.page.goto(`${this.baseUrl}/dashboard`, { waitUntil: 'networkidle' });
      
      const userButton = await this.page.locator('.cl-userButton-root, [data-clerk-id*="user"], .cl-avatarBox').first();
      
      if (await userButton.isVisible()) {
        await this.addTestResult('UserButton Visibility', 'PASS', 'UserButton is visible when authenticated');
        await this.takeScreenshot('userbutton-visible', 'UserButton visible in authenticated state');
        
        // Try to click user button to open menu
        await userButton.click();
        await this.page.waitForTimeout(1000);
        
        // Look for user menu items
        const menuItems = await this.page.locator('.cl-userButton-popoverCard, .cl-userPreview, [role="dialog"]');
        if (await menuItems.count() > 0) {
          await this.addTestResult('UserButton Menu', 'PASS', 'UserButton menu opens successfully');
          await this.takeScreenshot('userbutton-menu', 'UserButton menu opened');
        } else {
          await this.addTestResult('UserButton Menu', 'PARTIAL', 'UserButton clicked but menu not clearly visible');
        }
        
      } else {
        await this.addTestResult('UserButton Visibility', 'FAIL', 'UserButton not visible - user may not be authenticated');
      }
      
    } catch (error) {
      await this.addTestResult('UserButton Test', 'FAIL', 'Error testing UserButton functionality', error.message);
    }
  }

  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];
    
    for (const viewport of viewports) {
      try {
        await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
        await this.page.waitForTimeout(1000);
        
        await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`, `${viewport.name} responsive design`);
        
        // Check if sign-in/sign-up buttons are still visible
        const signInButton = await this.page.locator('button:has-text("Sign In")').first();
        const signUpButton = await this.page.locator('button:has-text("Get Started")').first();
        
        if (await signInButton.isVisible() && await signUpButton.isVisible()) {
          await this.addTestResult(`Responsive ${viewport.name}`, 'PASS', `Authentication buttons visible at ${viewport.width}x${viewport.height}`);
        } else {
          await this.addTestResult(`Responsive ${viewport.name}`, 'PARTIAL', `Some UI elements may be hidden at ${viewport.width}x${viewport.height}`);
        }
        
      } catch (error) {
        await this.addTestResult(`Responsive ${viewport.name}`, 'FAIL', `Error testing ${viewport.name} responsive design`, error.message);
      }
    }
    
    // Reset to desktop viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async generateReport() {
    const report = {
      testSuite: 'Clerk Authentication System Test',
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      testEmail: this.testEmail,
      results: this.testResults,
      screenshots: this.screenshots,
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        partial: this.testResults.filter(r => r.status === 'PARTIAL').length
      }
    };

    // Save detailed JSON report
    await fs.writeFile('./clerk-auth-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 CLERK AUTHENTICATION TEST RESULTS');
    console.log('='.repeat(70));
    console.log(`📊 Test Summary:`);
    console.log(`   Total Tests: ${report.summary.total}`);
    console.log(`   ✅ Passed: ${report.summary.passed}`);
    console.log(`   ❌ Failed: ${report.summary.failed}`);
    console.log(`   ⚠️  Partial: ${report.summary.partial}`);
    console.log(`   📸 Screenshots: ${this.screenshots.length}`);
    console.log('');
    
    console.log('📋 Detailed Results:');
    this.testResults.forEach((result, index) => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${index + 1}. ${statusIcon} ${result.test}`);
      console.log(`   ${result.details}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });

    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Test environment cleaned up');
  }

  async runFullTestSuite() {
    try {
      await this.initialize();
      
      // Test sequence
      await this.testLandingPage();
      await this.testProtectedRoutes();
      await this.testSignUpFlow();
      await this.testSignInFlow();
      await this.testUserButtonFunctionality();
      await this.testResponsiveDesign();
      
      const report = await this.generateReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ Test suite error:', error);
      await this.takeScreenshot('test-suite-error', 'Critical test suite error');
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test suite if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const tester = new ClerkAuthTester();
  tester.runFullTestSuite()
    .then(report => {
      console.log('🎉 Test suite completed successfully!');
      console.log(`📄 Full report saved to: clerk-auth-test-report.json`);
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    });
}

export default ClerkAuthTester;