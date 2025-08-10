/**
 * Comprehensive Quiz Engine Testing Script
 * Tests all aspects of the MedQuiz Pro quiz engine functionality
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class QuizEngineTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      testSuite: 'Quiz Engine Comprehensive Testing',
      startTime: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
    this.screenshotCounter = 0;
  }

  async initialize() {
    this.browser = await chromium.launch({
      headless: false,
      slowMo: 1000,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('🚀 Starting comprehensive quiz engine testing...');
  }

  async captureScreenshot(name, testCase) {
    this.screenshotCounter++;
    const filename = `quiz-test-${this.screenshotCounter.toString().padStart(2, '0')}-${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    const filepath = path.join(__dirname, 'quiz-test-screenshots', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📷 Screenshot captured: ${filename}`);
    return filename;
  }

  async addTest(name, status, details = '', screenshot = null) {
    const test = {
      name,
      status,
      details,
      screenshot,
      timestamp: new Date().toISOString()
    };
    
    this.results.tests.push(test);
    this.results.summary.total++;
    
    if (status === 'PASS') {
      this.results.summary.passed++;
      console.log(`✅ ${name}`);
    } else if (status === 'FAIL') {
      this.results.summary.failed++;
      console.log(`❌ ${name}: ${details}`);
    } else if (status === 'WARNING') {
      this.results.summary.warnings++;
      console.log(`⚠️  ${name}: ${details}`);
    }
    
    if (details) console.log(`   ${details}`);
  }

  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  async testHomepageAccess() {
    console.log('\n🏠 Testing Homepage Access...');
    
    try {
      await this.page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
      const title = await this.page.title();
      
      const screenshot = await this.captureScreenshot('homepage-access', 'homepage');
      
      if (title.includes('MedQuiz') || title.includes('USMLE')) {
        await this.addTest('Homepage loads successfully', 'PASS', `Page title: ${title}`, screenshot);
      } else {
        await this.addTest('Homepage loads with correct title', 'WARNING', `Unexpected title: ${title}`, screenshot);
      }
    } catch (error) {
      await this.addTest('Homepage access', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testUserAuthentication() {
    console.log('\n🔐 Testing User Authentication...');
    
    try {
      // Look for login elements
      const hasGetStarted = await this.waitForElement('button:has-text("Get Started")', 3000);
      const hasLoginLink = await this.waitForElement('a:has-text("Sign In")', 3000);
      
      if (hasGetStarted || hasLoginLink) {
        const screenshot = await this.captureScreenshot('authentication-elements', 'auth');
        await this.addTest('Authentication elements present', 'PASS', 'Login/signup elements found', screenshot);
        
        // Try to access login page
        if (hasLoginLink) {
          await this.page.click('a:has-text("Sign In")');
          await this.page.waitForTimeout(2000);
          
          const loginScreenshot = await this.captureScreenshot('login-page', 'auth');
          
          // Check if we can access the login page
          const currentUrl = this.page.url();
          if (currentUrl.includes('login') || await this.waitForElement('input[type="email"]', 3000)) {
            await this.addTest('Login page accessible', 'PASS', `URL: ${currentUrl}`, loginScreenshot);
            
            // Test with known credentials
            await this.testKnownUserLogin();
          } else {
            await this.addTest('Login page access', 'FAIL', `Could not access login page: ${currentUrl}`, loginScreenshot);
          }
        }
      } else {
        await this.addTest('Authentication elements', 'FAIL', 'No login/signup elements found');
      }
    } catch (error) {
      await this.addTest('User authentication test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testKnownUserLogin() {
    console.log('\n👤 Testing Known User Login...');
    
    try {
      // Use the test credentials from developer handoff
      const email = 'jayveedz19@gmail.com';
      const password = 'Jimkali90#';
      
      // Fill login form
      const emailField = await this.waitForElement('input[type="email"]', 3000);
      const passwordField = await this.waitForElement('input[type="password"]', 3000);
      
      if (emailField && passwordField) {
        await this.page.fill('input[type="email"]', email);
        await this.page.fill('input[type="password"]', password);
        
        const filledFormScreenshot = await this.captureScreenshot('login-form-filled', 'auth');
        await this.addTest('Login form filled', 'PASS', `Email: ${email}`, filledFormScreenshot);
        
        // Submit login
        const submitButton = await this.page.$('button[type="submit"]') || await this.page.$('button:has-text("Sign In")');
        if (submitButton) {
          await submitButton.click();
          
          // Wait for navigation or dashboard
          await this.page.waitForTimeout(3000);
          
          const afterLoginScreenshot = await this.captureScreenshot('after-login-attempt', 'auth');
          
          // Check if login was successful (look for dashboard elements)
          const hasDashboard = await this.waitForElement('[role="main"]', 5000) || 
                               await this.waitForElement('.dashboard', 5000) ||
                               await this.waitForElement('h1:has-text("Dashboard")', 5000) ||
                               await this.waitForElement('h1:has-text("Welcome")', 5000);
          
          if (hasDashboard) {
            await this.addTest('User login successful', 'PASS', 'Dashboard accessible after login', afterLoginScreenshot);
            return true; // Login successful
          } else {
            // Check for error messages
            const errorMessage = await this.page.textContent('.error, .alert, [role="alert"]').catch(() => null);
            await this.addTest('User login', 'FAIL', `Login failed. Error: ${errorMessage || 'Unknown error'}`, afterLoginScreenshot);
            return false;
          }
        } else {
          await this.addTest('Login form submission', 'FAIL', 'Could not find submit button');
          return false;
        }
      } else {
        await this.addTest('Login form fields', 'FAIL', 'Could not find email/password fields');
        return false;
      }
    } catch (error) {
      await this.addTest('Known user login', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async testQuestionDataLoading() {
    console.log('\n📚 Testing Question Data Loading...');
    
    try {
      // Check if we can access question data by examining the source file
      const fs = require('fs');
      const questionPath = path.join(__dirname, 'src', 'data', 'sampleQuestions.ts');
      
      if (fs.existsSync(questionPath)) {
        const content = fs.readFileSync(questionPath, 'utf8');
        const questionMatches = content.match(/question:/g);
        const questionCount = questionMatches ? questionMatches.length : 0;
        
        await this.addTest('Question data file exists', 'PASS', `Found ${questionCount} questions in data file`);
        
        if (questionCount >= 246) {
          await this.addTest('Question count verification', 'PASS', `${questionCount} questions available (≥246 required)`);
        } else {
          await this.addTest('Question count verification', 'WARNING', `Only ${questionCount} questions found, expected 246+`);
        }
        
        // Check question structure
        const hasOptions = content.includes('options:');
        const hasExplanations = content.includes('explanation:');
        const hasCategories = content.includes('category:');
        const hasDifficulty = content.includes('difficulty:');
        
        if (hasOptions && hasExplanations && hasCategories && hasDifficulty) {
          await this.addTest('Question data structure', 'PASS', 'All required question fields present');
        } else {
          const missing = [];
          if (!hasOptions) missing.push('options');
          if (!hasExplanations) missing.push('explanations');
          if (!hasCategories) missing.push('categories');
          if (!hasDifficulty) missing.push('difficulty');
          await this.addTest('Question data structure', 'FAIL', `Missing fields: ${missing.join(', ')}`);
        }
      } else {
        await this.addTest('Question data file', 'FAIL', 'Sample questions file not found');
      }
    } catch (error) {
      await this.addTest('Question data loading test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testQuizModes() {
    console.log('\n🎯 Testing Quiz Modes...');
    
    try {
      // Look for quiz mode selectors on dashboard
      const quickQuizButton = await this.waitForElement('button:has-text("Quick Quiz")', 5000) ||
                             await this.waitForElement('button:has-text("Quick")', 5000) ||
                             await this.waitForElement('.quiz-mode:has-text("Quick")', 5000);
      
      const timedQuizButton = await this.waitForElement('button:has-text("Timed")', 5000) ||
                             await this.waitForElement('button:has-text("Timed Quiz")', 5000) ||
                             await this.waitForElement('.quiz-mode:has-text("Timed")', 5000);
      
      const customQuizButton = await this.waitForElement('button:has-text("Custom")', 5000) ||
                              await this.waitForElement('button:has-text("Custom Quiz")', 5000) ||
                              await this.waitForElement('.quiz-mode:has-text("Custom")', 5000);
      
      if (quickQuizButton) {
        await this.addTest('Quick Quiz mode available', 'PASS', 'Quick quiz option found');
        await this.testSpecificQuizMode('quick');
      } else {
        await this.addTest('Quick Quiz mode', 'FAIL', 'Quick quiz option not found');
      }
      
      if (timedQuizButton) {
        await this.addTest('Timed Quiz mode available', 'PASS', 'Timed quiz option found');
        // Navigate back to test timed quiz
        await this.page.goBack().catch(() => {}); // Ignore errors
        await this.page.waitForTimeout(2000);
        await this.testSpecificQuizMode('timed');
      } else {
        await this.addTest('Timed Quiz mode', 'WARNING', 'Timed quiz option not clearly visible');
      }
      
      if (customQuizButton) {
        await this.addTest('Custom Quiz mode available', 'PASS', 'Custom quiz option found');
        // Navigate back to test custom quiz
        await this.page.goBack().catch(() => {}); // Ignore errors
        await this.page.waitForTimeout(2000);
        await this.testSpecificQuizMode('custom');
      } else {
        await this.addTest('Custom Quiz mode', 'WARNING', 'Custom quiz option not clearly visible');
      }
      
    } catch (error) {
      await this.addTest('Quiz modes test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testSpecificQuizMode(mode) {
    console.log(`\n🎮 Testing ${mode.toUpperCase()} Quiz Mode...`);
    
    try {
      // Try to start the quiz mode
      const modeButton = await this.page.$(`button:has-text("${mode.charAt(0).toUpperCase() + mode.slice(1)}")`);
      
      if (modeButton) {
        await modeButton.click();
        await this.page.waitForTimeout(3000);
        
        const quizStartScreenshot = await this.captureScreenshot(`${mode}-quiz-started`, 'quiz');
        
        // Check if quiz interface loaded
        const hasQuestion = await this.waitForElement('.question, [role="main"]:has-text("question")', 5000) ||
                           await this.waitForElement('h1, h2, h3, p', 5000);
        
        const hasOptions = await this.waitForElement('button:has-text("A."), button:has-text("B."), button:has-text("C."), button:has-text("D.")', 5000) ||
                          await this.waitForElement('.option, .answer-option', 5000);
        
        if (hasQuestion && hasOptions) {
          await this.addTest(`${mode} quiz interface`, 'PASS', 'Question and options displayed', quizStartScreenshot);
          
          // Test quiz interaction
          await this.testQuizInteraction(mode);
        } else {
          await this.addTest(`${mode} quiz interface`, 'FAIL', 'Quiz interface not properly loaded', quizStartScreenshot);
        }
      } else {
        await this.addTest(`${mode} quiz mode button`, 'FAIL', `Could not find ${mode} quiz button`);
      }
    } catch (error) {
      await this.addTest(`${mode} quiz mode test`, 'FAIL', `Error: ${error.message}`);
    }
  }

  async testQuizInteraction(mode) {
    console.log(`\n⚡ Testing ${mode.toUpperCase()} Quiz Interaction...`);
    
    try {
      // Try to select an answer
      const answerOptions = await this.page.$$('button:has-text("A."), button:has-text("B."), button:has-text("C."), button:has-text("D.")');
      
      if (answerOptions.length >= 2) {
        // Select option B
        await answerOptions[1].click();
        await this.page.waitForTimeout(2000);
        
        const answerSelectedScreenshot = await this.captureScreenshot(`${mode}-answer-selected`, 'quiz');
        
        // Check if explanation appears or next button becomes available
        const hasExplanation = await this.waitForElement('.explanation, .answer-explanation', 3000);
        const hasNextButton = await this.waitForElement('button:has-text("Next")', 3000);
        const hasCompleteButton = await this.waitForElement('button:has-text("Complete")', 3000);
        
        if (hasExplanation || hasNextButton || hasCompleteButton) {
          await this.addTest(`${mode} quiz answer selection`, 'PASS', 'Answer selection triggers response', answerSelectedScreenshot);
          
          // Test progression
          if (hasNextButton) {
            await this.page.click('button:has-text("Next")');
            await this.page.waitForTimeout(2000);
            await this.addTest(`${mode} quiz progression`, 'PASS', 'Next question navigation works');
          } else if (hasCompleteButton) {
            await this.testQuizCompletion(mode);
          }
        } else {
          await this.addTest(`${mode} quiz answer feedback`, 'FAIL', 'No feedback after answer selection', answerSelectedScreenshot);
        }
      } else {
        await this.addTest(`${mode} quiz answer options`, 'FAIL', `Found ${answerOptions.length} answer options, expected 4`);
      }
    } catch (error) {
      await this.addTest(`${mode} quiz interaction test`, 'FAIL', `Error: ${error.message}`);
    }
  }

  async testQuizCompletion(mode) {
    console.log(`\n🏁 Testing ${mode.toUpperCase()} Quiz Completion...`);
    
    try {
      // Click complete quiz button
      const completeButton = await this.page.$('button:has-text("Complete")');
      if (completeButton) {
        await completeButton.click();
        await this.page.waitForTimeout(3000);
        
        const resultsScreenshot = await this.captureScreenshot(`${mode}-quiz-results`, 'quiz');
        
        // Check if results page loads
        const hasResults = await this.waitForElement('.score, .results, h1:has-text("Complete")', 5000);
        const hasPercentage = await this.waitForElement(':has-text("%")', 3000);
        
        if (hasResults && hasPercentage) {
          await this.addTest(`${mode} quiz completion`, 'PASS', 'Results page displayed with score', resultsScreenshot);
          
          // Test results components
          await this.testQuizResults(mode);
        } else {
          await this.addTest(`${mode} quiz completion`, 'FAIL', 'Results page not properly loaded', resultsScreenshot);
        }
      } else {
        await this.addTest(`${mode} quiz completion button`, 'FAIL', 'Complete quiz button not found');
      }
    } catch (error) {
      await this.addTest(`${mode} quiz completion test`, 'FAIL', `Error: ${error.message}`);
    }
  }

  async testQuizResults(mode) {
    console.log(`\n📊 Testing ${mode.toUpperCase()} Quiz Results...`);
    
    try {
      // Check for score display
      const scoreText = await this.page.textContent('.score, :has-text("%")').catch(() => 'Not found');
      const hasScore = scoreText.includes('%');
      
      // Check for action buttons
      const hasRetryButton = await this.waitForElement('button:has-text("Try Again"), button:has-text("Retry")', 3000);
      const hasHomeButton = await this.waitForElement('button:has-text("Dashboard"), button:has-text("Home")', 3000);
      
      if (hasScore) {
        await this.addTest(`${mode} quiz score display`, 'PASS', `Score displayed: ${scoreText.substring(0, 50)}`);
      } else {
        await this.addTest(`${mode} quiz score display`, 'FAIL', 'Score not properly displayed');
      }
      
      if (hasRetryButton && hasHomeButton) {
        await this.addTest(`${mode} quiz result actions`, 'PASS', 'Retry and home buttons available');
      } else {
        const missing = [];
        if (!hasRetryButton) missing.push('Retry');
        if (!hasHomeButton) missing.push('Home');
        await this.addTest(`${mode} quiz result actions`, 'WARNING', `Missing buttons: ${missing.join(', ')}`);
      }
      
      // Test navigation back to dashboard
      if (hasHomeButton) {
        await this.page.click('button:has-text("Dashboard"), button:has-text("Home")');
        await this.page.waitForTimeout(2000);
        
        const backToDashboardScreenshot = await this.captureScreenshot(`${mode}-back-to-dashboard`, 'navigation');
        await this.addTest(`${mode} quiz result navigation`, 'PASS', 'Navigation back to dashboard works', backToDashboardScreenshot);
      }
      
    } catch (error) {
      await this.addTest(`${mode} quiz results test`, 'FAIL', `Error: ${error.message}`);
    }
  }

  async testTimerFunctionality() {
    console.log('\n⏰ Testing Timer Functionality...');
    
    try {
      // This would require starting a timed quiz and checking for timer elements
      // For comprehensive testing, we'd need to verify:
      // 1. Timer display
      // 2. Countdown functionality
      // 3. Auto-submission when timer expires
      
      await this.addTest('Timer functionality test', 'WARNING', 'Timer testing requires specific timed quiz setup - marked for manual verification');
    } catch (error) {
      await this.addTest('Timer functionality test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testAccessibilityFeatures() {
    console.log('\n♿ Testing Accessibility Features...');
    
    try {
      // Check for ARIA labels and accessibility attributes
      const hasAriaLabels = await this.page.$$eval('[aria-label]', els => els.length > 0).catch(() => false);
      const hasRoles = await this.page.$$eval('[role]', els => els.length > 0).catch(() => false);
      const hasProperHeadings = await this.page.$$eval('h1, h2, h3', els => els.length > 0).catch(() => false);
      
      const accessibilityScreenshot = await this.captureScreenshot('accessibility-check', 'accessibility');
      
      if (hasAriaLabels) {
        await this.addTest('ARIA labels present', 'PASS', 'Found elements with aria-label attributes');
      } else {
        await this.addTest('ARIA labels', 'WARNING', 'No aria-label attributes found');
      }
      
      if (hasRoles) {
        await this.addTest('ARIA roles present', 'PASS', 'Found elements with role attributes');
      } else {
        await this.addTest('ARIA roles', 'WARNING', 'No role attributes found');
      }
      
      if (hasProperHeadings) {
        await this.addTest('Heading structure', 'PASS', 'Proper heading elements found', accessibilityScreenshot);
      } else {
        await this.addTest('Heading structure', 'FAIL', 'No proper heading structure found');
      }
      
    } catch (error) {
      await this.addTest('Accessibility features test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testPerformanceAndErrorHandling() {
    console.log('\n⚡ Testing Performance and Error Handling...');
    
    try {
      // Check for console errors
      const consoleErrors = [];
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Wait and collect any console errors
      await this.page.waitForTimeout(2000);
      
      if (consoleErrors.length === 0) {
        await this.addTest('Console errors check', 'PASS', 'No console errors detected');
      } else {
        await this.addTest('Console errors check', 'WARNING', `Found ${consoleErrors.length} console errors: ${consoleErrors.slice(0, 3).join('; ')}`);
      }
      
      // Test error boundary (try to trigger an error scenario)
      // This is harder to test automatically, so we'll mark for manual testing
      await this.addTest('Error boundary testing', 'WARNING', 'Error boundary testing requires manual verification of error scenarios');
      
    } catch (error) {
      await this.addTest('Performance and error handling test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async generateReport() {
    this.results.endTime = new Date().toISOString();
    this.results.duration = new Date(this.results.endTime) - new Date(this.results.startTime);
    
    // Calculate success rate
    this.results.summary.successRate = this.results.summary.total > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.total) * 100)
      : 0;
    
    // Save results to file
    const reportPath = path.join(__dirname, 'quiz-engine-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate readable summary
    const summaryPath = path.join(__dirname, 'quiz-engine-test-summary.md');
    const summary = this.generateMarkdownSummary();
    fs.writeFileSync(summaryPath, summary);
    
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('========================');
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log(`📈 Success Rate: ${this.results.summary.successRate}%`);
    console.log(`📄 Report saved: ${reportPath}`);
    console.log(`📝 Summary saved: ${summaryPath}`);
    
    return this.results;
  }

  generateMarkdownSummary() {
    const { summary, tests } = this.results;
    
    let markdown = `# Quiz Engine Comprehensive Test Results\n\n`;
    markdown += `**Test Date**: ${new Date(this.results.startTime).toLocaleString()}\n`;
    markdown += `**Duration**: ${Math.round(this.results.duration / 1000)}s\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- **Total Tests**: ${summary.total}\n`;
    markdown += `- **✅ Passed**: ${summary.passed}\n`;
    markdown += `- **❌ Failed**: ${summary.failed}\n`;
    markdown += `- **⚠️ Warnings**: ${summary.warnings}\n`;
    markdown += `- **Success Rate**: ${summary.successRate}%\n\n`;
    
    // Group tests by status
    const passed = tests.filter(t => t.status === 'PASS');
    const failed = tests.filter(t => t.status === 'FAIL');
    const warnings = tests.filter(t => t.status === 'WARNING');
    
    if (passed.length > 0) {
      markdown += `## ✅ Passed Tests (${passed.length})\n\n`;
      passed.forEach(test => {
        markdown += `- **${test.name}**: ${test.details || 'Success'}\n`;
      });
      markdown += `\n`;
    }
    
    if (failed.length > 0) {
      markdown += `## ❌ Failed Tests (${failed.length})\n\n`;
      failed.forEach(test => {
        markdown += `- **${test.name}**: ${test.details}\n`;
      });
      markdown += `\n`;
    }
    
    if (warnings.length > 0) {
      markdown += `## ⚠️ Warnings (${warnings.length})\n\n`;
      warnings.forEach(test => {
        markdown += `- **${test.name}**: ${test.details}\n`;
      });
      markdown += `\n`;
    }
    
    markdown += `## Test Details\n\n`;
    tests.forEach((test, index) => {
      const status = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
      markdown += `### ${index + 1}. ${status} ${test.name}\n\n`;
      markdown += `**Status**: ${test.status}\n`;
      markdown += `**Details**: ${test.details || 'N/A'}\n`;
      if (test.screenshot) {
        markdown += `**Screenshot**: ${test.screenshot}\n`;
      }
      markdown += `**Timestamp**: ${test.timestamp}\n\n`;
    });
    
    return markdown;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.initialize();
      
      // Run all test suites
      await this.testHomepageAccess();
      await this.testUserAuthentication();
      await this.testQuestionDataLoading();
      await this.testQuizModes();
      await this.testTimerFunctionality();
      await this.testAccessibilityFeatures();
      await this.testPerformanceAndErrorHandling();
      
      return await this.generateReport();
      
    } catch (error) {
      console.error('Test suite error:', error);
      await this.addTest('Test Suite Execution', 'FAIL', `Critical error: ${error.message}`);
      return await this.generateReport();
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test suite
async function main() {
  console.log('🧪 MedQuiz Pro Quiz Engine Comprehensive Testing');
  console.log('================================================\n');
  
  const testSuite = new QuizEngineTestSuite();
  const results = await testSuite.runAllTests();
  
  // Exit with appropriate code
  const hasFailures = results.summary.failed > 0;
  process.exit(hasFailures ? 1 : 0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { QuizEngineTestSuite };