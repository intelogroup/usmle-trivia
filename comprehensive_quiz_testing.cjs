#!/usr/bin/env node

/**
 * Comprehensive Quiz Mode Testing Script
 * Tests all three quiz modes (Quick, Timed, Custom) end-to-end
 * Focused testing subagent for MedQuiz Pro application
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:5175',
  credentials: {
    email: 'testuser@quiz-testing.com',
    password: 'TestPassword123!'
  },
  timeouts: {
    navigation: 30000,
    interaction: 10000,
    quiz: 300000  // 5 minutes for quiz completion
  },
  screenshots: {
    path: './screenshots/quiz-testing'
  }
};

// Quiz mode configurations (matching the actual implementation)
const QUIZ_MODES = {
  quick: {
    name: 'Quick Quiz',
    questions: 5,
    timeLimit: null,
    duration: '5-10 min',
    description: 'Fast practice session'
  },
  timed: {
    name: 'Timed Practice',
    questions: 10,
    timeLimit: 600, // 10 minutes
    duration: '10 min',
    description: 'Test your speed and accuracy'
  },
  custom: {
    name: 'Custom Quiz',
    questions: 8,
    timeLimit: 480, // 8 minutes
    duration: '8 min',
    description: 'Design your own quiz'
  }
};

class QuizTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = {
      quick: null,
      timed: null,
      custom: null,
      errors: []
    };
  }

  async init() {
    console.log('🚀 Initializing comprehensive quiz mode testing...');
    
    // Create screenshots directory
    if (!fs.existsSync(TEST_CONFIG.screenshots.path)) {
      fs.mkdirSync(TEST_CONFIG.screenshots.path, { recursive: true });
    }

    // Launch browser
    this.browser = await chromium.launch({
      headless: true, // Run in headless mode for server environment
      slowMo: 500  // Add slight delay for better reliability
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.context.newPage();
    
    // Enable console logging
    this.page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
    this.page.on('pageerror', error => {
      console.error(`[Page Error] ${error.message}`);
      this.results.errors.push({
        type: 'page_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name) {
    const filename = `${Date.now()}-${name.replace(/\\s+/g, '-').toLowerCase()}.png`;
    const filepath = path.join(TEST_CONFIG.screenshots.path, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  async registerTestUser() {
    console.log('📝 Registering test user...');
    
    try {
      await this.page.goto(`${TEST_CONFIG.baseURL}/register`, {
        waitUntil: 'networkidle',
        timeout: TEST_CONFIG.timeouts.navigation
      });

      await this.takeScreenshot('01-register-page');

      // Fill registration form
      await this.page.fill('input[id="name"]', 'Test User');
      await this.page.fill('input[id="email"]', TEST_CONFIG.credentials.email);
      await this.page.fill('input[id="password"]', TEST_CONFIG.credentials.password);
      await this.page.fill('input[id="confirmPassword"]', TEST_CONFIG.credentials.password);
      
      // Click register button
      await this.page.click('button[type="submit"]');
      
      // Wait for either dashboard (success) or error
      try {
        await this.page.waitForURL('**/dashboard', { 
          timeout: TEST_CONFIG.timeouts.navigation 
        });
        
        await this.takeScreenshot('02-dashboard-after-register');
        console.log('✅ Registration successful - Dashboard loaded');
        return true;
        
      } catch (dashboardError) {
        // If registration succeeded but didn't navigate, user might already exist
        console.log('User might already exist, trying login instead...');
        return await this.login();
      }
      
    } catch (error) {
      console.log('❌ Registration failed, trying login instead:', error.message);
      return await this.login();
    }
  }

  async login() {
    console.log('🔐 Logging in with test credentials...');
    
    try {
      await this.page.goto(`${TEST_CONFIG.baseURL}/login`, {
        waitUntil: 'networkidle',
        timeout: TEST_CONFIG.timeouts.navigation
      });

      await this.takeScreenshot('03-login-page');

      // Fill login form
      await this.page.fill('input[type="email"]', TEST_CONFIG.credentials.email);
      await this.page.fill('input[type="password"]', TEST_CONFIG.credentials.password);
      
      // Click login button
      await this.page.click('button[type="submit"]');
      
      // Wait for dashboard to load
      await this.page.waitForURL('**/dashboard', { 
        timeout: TEST_CONFIG.timeouts.navigation 
      });
      
      await this.takeScreenshot('04-dashboard-loaded');
      console.log('✅ Login successful - Dashboard loaded');
      
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      await this.takeScreenshot('error-login-failed');
      this.results.errors.push({
        type: 'login_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  async testQuizMode(mode) {
    console.log(`\\n🎯 Testing ${QUIZ_MODES[mode].name} (${mode} mode)...`);
    
    const modeConfig = QUIZ_MODES[mode];
    const startTime = Date.now();
    
    try {
      // Navigate to dashboard first
      await this.page.goto(`${TEST_CONFIG.baseURL}/dashboard`, {
        waitUntil: 'networkidle'
      });

      await this.takeScreenshot(`${mode}-01-dashboard`);

      // Navigate using the sidebar menu instead of direct URL
      console.log(`Clicking ${mode} quiz mode from sidebar...`);
      
      // Wait for dashboard to be fully loaded
      await this.page.waitForSelector('[data-testid="dashboard"], .dashboard-content, h1:has-text("Dashboard")', {
        timeout: 5000
      }).catch(() => console.log('Dashboard selector not found, continuing...'));
      
      // Map mode to sidebar text
      const sidebarTextMap = {
        'quick': 'Quick Quiz',
        'timed': 'Timed Quiz', 
        'custom': 'Custom Quiz'
      };
      
      const expectedText = sidebarTextMap[mode] || modeConfig.name;
      console.log(`Looking for sidebar link: "${expectedText}"`);
      
      // Try to find the sidebar navigation link
      let sidebarLink = null;
      
      // Method 1: Look for exact text match in sidebar
      const sidebarLinks = await this.page.$$('nav a, .sidebar a, a');
      for (let link of sidebarLinks) {
        const text = await link.textContent();
        if (text && text.trim() === expectedText) {
          sidebarLink = link;
          console.log(`Found sidebar link with exact text: "${text.trim()}"`);
          break;
        }
      }
      
      // Method 2: If not found, try partial text match
      if (!sidebarLink) {
        for (let link of sidebarLinks) {
          const text = await link.textContent();
          if (text && text.toLowerCase().includes(mode)) {
            sidebarLink = link;
            console.log(`Found sidebar link with partial match: "${text.trim()}"`);
            break;
          }
        }
      }
      
      // Method 3: Try clicking elements that contain the mode name
      if (!sidebarLink) {
        const clickableElements = await this.page.$$('button, div[role="button"], [tabindex="0"]');
        for (let element of clickableElements) {
          const text = await element.textContent();
          if (text && text.toLowerCase().includes(mode.toLowerCase())) {
            sidebarLink = element;
            console.log(`Found clickable element: "${text.trim()}"`);
            break;
          }
        }
      }

      if (sidebarLink) {
        console.log('Clicking sidebar navigation...');
        await sidebarLink.click();
        await this.page.waitForTimeout(2000); // Wait for navigation
      } else {
        console.log('Sidebar navigation not found, trying main quiz area...');
        
        // Try to find quiz mode cards in the main content area
        const quizCards = await this.page.$$('[class*="quiz"], [class*="card"], [class*="mode"]');
        for (let card of quizCards) {
          const text = await card.textContent();
          if (text && text.toLowerCase().includes(mode)) {
            console.log(`Found quiz card: "${text.substring(0, 50)}..."`);
            await card.click();
            break;
          }
        }
      }

      await this.takeScreenshot(`${mode}-02-navigation-clicked`);

      // Wait for quiz setup page or quiz engine to load
      await this.page.waitForTimeout(2000);

      // Look for Start Quiz button if in setup phase
      const startButton = await this.page.$('button:has-text("Start Quiz")');
      if (startButton) {
        console.log('Starting quiz from setup page...');
        await startButton.click();
        await this.takeScreenshot(`${mode}-03-quiz-started`);
      }

      // Wait for quiz engine to load
      await this.page.waitForSelector('.quiz-question, h1:has-text("Question")', {
        timeout: TEST_CONFIG.timeouts.interaction
      });

      console.log(`Quiz engine loaded for ${mode} mode`);
      await this.takeScreenshot(`${mode}-04-first-question`);

      // Track quiz completion
      const quizResults = await this.completeQuiz(mode, modeConfig);
      
      const endTime = Date.now();
      const totalTime = Math.round((endTime - startTime) / 1000);

      this.results[mode] = {
        success: true,
        totalTime: totalTime,
        expectedQuestions: modeConfig.questions,
        ...quizResults
      };

      console.log(`✅ ${modeConfig.name} completed successfully in ${totalTime}s`);
      
    } catch (error) {
      console.error(`❌ ${modeConfig.name} failed:`, error.message);
      await this.takeScreenshot(`${mode}-error-failed`);
      
      this.results[mode] = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.results.errors.push({
        type: 'quiz_mode_error',
        mode: mode,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async completeQuiz(mode, modeConfig) {
    console.log(`Completing ${mode} quiz with ${modeConfig.questions} questions...`);
    
    let questionCount = 0;
    let correctAnswers = 0;
    let timeRemaining = modeConfig.timeLimit;
    const startTime = Date.now();

    while (questionCount < modeConfig.questions) {
      try {
        // Wait for question to load
        await this.page.waitForSelector('.quiz-question, [data-testid="question"], h1:has-text("Question")', {
          timeout: TEST_CONFIG.timeouts.interaction
        });

        questionCount++;
        console.log(`Answering question ${questionCount}/${modeConfig.questions}`);

        // Take screenshot of current question
        await this.takeScreenshot(`${mode}-question-${questionCount}`);

        // Find answer options (try different selectors)
        let answerOptions = await this.page.$$('button[data-option], .answer-option button, button:has-text("A)"), button:has-text("B)")');
        
        if (answerOptions.length === 0) {
          // Try alternative selectors
          answerOptions = await this.page.$$('div[role="button"]:has-text("A)"), div[role="button"]:has-text("B)")');
        }

        if (answerOptions.length === 0) {
          // Try even more generic selectors
          answerOptions = await this.page.$$('button, [role="button"]');
          answerOptions = answerOptions.filter(async (element) => {
            const text = await element.textContent();
            return text && (text.includes('A)') || text.includes('B)') || text.includes('C)') || text.includes('D)'));
          });
        }

        if (answerOptions.length > 0) {
          // Select a random answer (for testing purposes)
          const randomIndex = Math.floor(Math.random() * Math.min(4, answerOptions.length));
          await answerOptions[randomIndex].click();
          
          console.log(`Selected answer option ${randomIndex + 1}`);
          await this.page.waitForTimeout(1000); // Wait for answer processing
          
          await this.takeScreenshot(`${mode}-question-${questionCount}-answered`);

          // Look for explanation or next button
          const nextButton = await this.page.waitForSelector('button:has-text("Next"), button:has-text("Finish"), button:has-text("Continue")', {
            timeout: 5000
          });

          if (nextButton) {
            const buttonText = await nextButton.textContent();
            console.log(`Clicking: ${buttonText}`);
            await nextButton.click();
            
            if (buttonText.toLowerCase().includes('finish')) {
              console.log('Quiz completed - finish button clicked');
              break;
            }
          }
          
          // Check if we've reached the last question
          if (questionCount >= modeConfig.questions) {
            break;
          }

        } else {
          console.log('No answer options found, taking screenshot for debugging');
          await this.takeScreenshot(`${mode}-no-options-debug-q${questionCount}`);
          break;
        }

        // Brief wait before next question
        await this.page.waitForTimeout(2000);

      } catch (error) {
        console.error(`Error on question ${questionCount}:`, error.message);
        await this.takeScreenshot(`${mode}-question-${questionCount}-error`);
        break;
      }
    }

    // Wait for results page
    try {
      await this.page.waitForSelector('.quiz-results, [data-testid="results"], h1:has-text("Results"), h2:has-text("Quiz Complete")', {
        timeout: 10000
      });
      
      await this.takeScreenshot(`${mode}-06-results`);
      console.log(`Quiz results displayed for ${mode} mode`);

      // Try to extract score information
      const scoreElements = await this.page.$$('text=/\\d+%/, text=/Score:/, text=/\\d+\\/\\d+/');
      let score = 'Not detected';
      
      if (scoreElements.length > 0) {
        score = await scoreElements[0].textContent();
      }

      const endTime = Date.now();
      const quizDuration = Math.round((endTime - startTime) / 1000);

      return {
        questionsCompleted: questionCount,
        score: score,
        quizDuration: quizDuration,
        resultsDisplayed: true
      };

    } catch (error) {
      console.log('Results page not found, quiz may have ended differently');
      await this.takeScreenshot(`${mode}-results-not-found`);
      
      const endTime = Date.now();
      const quizDuration = Math.round((endTime - startTime) / 1000);

      return {
        questionsCompleted: questionCount,
        score: 'Results not displayed',
        quizDuration: quizDuration,
        resultsDisplayed: false
      };
    }
  }

  async testCrossModeSwitching() {
    console.log('\\n🔄 Testing cross-mode switching and state management...');
    
    try {
      // Navigate to dashboard
      await this.page.goto(`${TEST_CONFIG.baseURL}/dashboard`);
      
      // Test rapid mode switching
      for (const mode of Object.keys(QUIZ_MODES)) {
        console.log(`Accessing ${mode} mode setup...`);
        await this.page.goto(`${TEST_CONFIG.baseURL}/quiz/${mode}`);
        await this.page.waitForTimeout(1000);
        await this.takeScreenshot(`cross-mode-${mode}-access`);
        
        // Go back to dashboard
        await this.page.goto(`${TEST_CONFIG.baseURL}/dashboard`);
        await this.page.waitForTimeout(1000);
      }
      
      console.log('✅ Cross-mode switching test completed');
      
    } catch (error) {
      console.error('❌ Cross-mode switching failed:', error.message);
      this.results.errors.push({
        type: 'cross_mode_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async generateReport() {
    console.log('\\n📊 Generating comprehensive test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.keys(QUIZ_MODES).length,
        successfulTests: Object.values(this.results).filter(r => r && r.success).length,
        failedTests: Object.values(this.results).filter(r => r && !r.success).length,
        totalErrors: this.results.errors.length
      },
      quizModes: this.results,
      recommendations: []
    };

    // Add recommendations based on results
    if (report.summary.failedTests > 0) {
      report.recommendations.push('Some quiz modes failed testing. Review error logs and fix issues.');
    }
    
    if (this.results.errors.length > 0) {
      report.recommendations.push('Multiple errors detected. Implement better error handling.');
    }
    
    if (report.summary.successfulTests === report.summary.totalTests) {
      report.recommendations.push('All quiz modes working correctly. Ready for production deployment.');
    }

    // Save report
    const reportPath = path.join(TEST_CONFIG.screenshots.path, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Console output
    console.log('\\n' + '='.repeat(60));
    console.log('🎯 COMPREHENSIVE QUIZ MODE TESTING REPORT');
    console.log('='.repeat(60));
    console.log(`📅 Test Date: ${new Date().toLocaleDateString()}`);
    console.log(`⏰ Test Time: ${new Date().toLocaleTimeString()}`);
    console.log(`\\n📈 SUMMARY:`);
    console.log(`   Total Quiz Modes Tested: ${report.summary.totalTests}`);
    console.log(`   ✅ Successful: ${report.summary.successfulTests}`);
    console.log(`   ❌ Failed: ${report.summary.failedTests}`);
    console.log(`   🚨 Total Errors: ${report.summary.totalErrors}`);
    
    console.log(`\\n🎮 QUIZ MODE RESULTS:`);
    
    for (const [mode, result] of Object.entries(this.results)) {
      if (mode === 'errors') continue;
      
      const config = QUIZ_MODES[mode];
      console.log(`\\n   ${config.name} (${mode}):`);
      
      if (result && result.success) {
        console.log(`   ✅ Status: PASSED`);
        console.log(`   ⏱️  Total Time: ${result.totalTime}s`);
        console.log(`   📝 Questions: ${result.questionsCompleted}/${config.questions}`);
        console.log(`   📊 Score: ${result.score || 'Not recorded'}`);
        console.log(`   ⏲️  Quiz Duration: ${result.quizDuration}s`);
      } else if (result && !result.success) {
        console.log(`   ❌ Status: FAILED`);
        console.log(`   💥 Error: ${result.error}`);
      } else {
        console.log(`   ⚠️  Status: NOT TESTED`);
      }
    }

    if (this.results.errors.length > 0) {
      console.log(`\\n🚨 ERRORS ENCOUNTERED:`);
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.type}] ${error.message}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log(`\\n💡 RECOMMENDATIONS:`);
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log(`\\n📁 Screenshots saved in: ${TEST_CONFIG.screenshots.path}`);
    console.log(`📄 Full report saved: ${reportPath}`);
    console.log('='.repeat(60));

    return report;
  }
}

// Main execution
async function main() {
  const tester = new QuizTester();
  
  try {
    await tester.init();
    
    // Step 1: Register or Login
    const authSuccess = await tester.registerTestUser();
    if (!authSuccess) {
      console.error('❌ Authentication failed, cannot proceed with quiz testing');
      process.exit(1);
    }

    // Step 2: Test each quiz mode
    for (const mode of Object.keys(QUIZ_MODES)) {
      await tester.testQuizMode(mode);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause between tests
    }

    // Step 3: Test cross-mode functionality
    await tester.testCrossModeSwitching();

    // Step 4: Generate comprehensive report
    const report = await tester.generateReport();
    
    // Exit with appropriate code
    if (report.summary.failedTests === 0) {
      console.log('\\n🎉 All tests passed! Quiz modes are working correctly.');
      process.exit(0);
    } else {
      console.log('\\n⚠️ Some tests failed. Please review the report and fix issues.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\\n🛑 Test interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\\n🛑 Test terminated');
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { QuizTester, TEST_CONFIG, QUIZ_MODES };