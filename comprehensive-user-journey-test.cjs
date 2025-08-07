/**
 * COMPREHENSIVE USER JOURNEY TESTING SUITE
 * MedQuiz Pro - Medical Education Platform
 * 
 * Tests critical user journeys for medical students using Playwright
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './test-results/user-journey-screenshots';
const RESULTS_FILE = './user-journey-test-results.json';

// Medical student test scenarios
const MEDICAL_SEARCH_TERMS = [
  'cardiovascular',
  'diabetes',
  'infectious disease',
  'pulmonary',
  'neurology'
];

class MedicalStudentUserJourneyTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      testStartTime: new Date().toISOString(),
      scenarios: {},
      performance: {},
      usabilityFindings: [],
      bugs: [],
      recommendations: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  }

  async initialize() {
    console.log('🏥 MEDQUIZ PRO - COMPREHENSIVE USER JOURNEY TESTING');
    console.log('=' .repeat(60));
    
    try {
      this.browser = await chromium.launch({
        headless: true,  // Run headless in server environment
        slowMo: 50       // Reduce slowMo for efficiency
      });
      
      this.page = await this.browser.newPage();
      
      // Set viewport to desktop size
      await this.page.setViewportSize({ width: 1280, height: 720 });
      
      // Monitor console errors
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('❌ Console Error:', msg.text());
        }
      });
      
      console.log('✅ Browser initialized successfully');
      return true;
      
    } catch (error) {
      console.log('❌ Failed to initialize browser:', error.message);
      return false;
    }
  }

  async takeScreenshot(name, description = '') {
    try {
      const timestamp = Date.now();
      const filename = `${name}_${timestamp}.png`;
      const filepath = path.join(SCREENSHOT_DIR, filename);
      
      await this.page.screenshot({
        path: filepath,
        fullPage: true
      });
      
      console.log(`📸 Screenshot: ${filename} - ${description}`);
      return filename;
    } catch (error) {
      console.log(`❌ Screenshot failed: ${error.message}`);
      return null;
    }
  }

  async measureTaskTime(taskName, taskFunction) {
    const startTime = Date.now();
    let success = false;
    let error = null;
    
    try {
      await taskFunction();
      success = true;
      console.log(`✅ Task completed: ${taskName}`);
    } catch (e) {
      error = e.message;
      console.log(`❌ Task failed: ${taskName} - ${error}`);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return {
      success,
      duration,
      error,
      timestamp: new Date().toISOString()
    };
  }

  async testScenario1_PrimaryQuizJourney() {
    console.log('\n🎯 SCENARIO 1: Primary User Journey - Take a Quiz');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Primary Quiz Journey',
      steps: [],
      totalTime: 0,
      success: false,
      usabilityIssues: [],
      taskCompletionTimes: {}
    };

    // Step 1: Navigate to application
    const step1 = await this.measureTaskTime('Load Landing Page', async () => {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await this.takeScreenshot('01_landing_page', 'Initial application load');
      
      // Check if page loaded properly
      const title = await this.page.title();
      if (!title || title === '') {
        throw new Error('Page title is empty - possible loading issue');
      }
    });
    scenario.steps.push(step1);

    // Step 2: Find and click primary CTA
    const step2 = await this.measureTaskTime('Navigate to Quiz', async () => {
      // Wait for page to be interactive
      await this.page.waitForTimeout(2000);
      
      // Look for primary action buttons
      const ctaButtons = await this.page.$$eval('button', buttons => 
        buttons.map(btn => ({
          text: btn.textContent?.trim() || '',
          visible: btn.offsetParent !== null,
          classes: btn.className || ''
        })).filter(btn => btn.visible)
      );
      
      console.log('Available CTA buttons:', ctaButtons);
      
      // Try different button selection strategies
      let clicked = false;
      
      // Strategy 1: Look for "Get Started" or similar
      const getStartedSelectors = [
        'button:has-text("Get Started")',
        'button:has-text("Start Quiz")',
        'button:has-text("Begin")',
        'a:has-text("Get Started")',
        'a:has-text("Start Quiz")'
      ];
      
      for (const selector of getStartedSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            clicked = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      // Strategy 2: Click first prominent button
      if (!clicked) {
        const buttons = await this.page.$$('button');
        if (buttons.length > 0) {
          await buttons[0].click();
          clicked = true;
        }
      }
      
      if (!clicked) {
        throw new Error('No primary CTA button found or clickable');
      }
      
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('02_after_cta_click', 'After clicking primary CTA');
    });
    scenario.steps.push(step2);

    // Step 3: Handle authentication if needed
    const step3 = await this.measureTaskTime('Handle Authentication', async () => {
      const currentUrl = this.page.url();
      console.log('Current URL after navigation:', currentUrl);
      
      // Check if we're on a login/auth page
      const hasEmailInput = await this.page.$('input[type="email"]') !== null;
      const hasPasswordInput = await this.page.$('input[type="password"]') !== null;
      
      if (hasEmailInput && hasPasswordInput) {
        console.log('Authentication required, filling login form...');
        
        await this.page.fill('input[type="email"]', 'medical.student@johnshopkins.edu');
        await this.page.fill('input[type="password"]', 'UsmleStep1Prep2025!');
        
        await this.takeScreenshot('03_login_filled', 'Login form filled');
        
        // Submit form
        const submitButton = await this.page.$('button[type="submit"]') || 
                            await this.page.$('button:has-text("Login")') ||
                            await this.page.$('button:has-text("Sign In")');
        
        if (submitButton) {
          await submitButton.click();
          await this.page.waitForTimeout(5000);
          await this.takeScreenshot('04_after_login', 'After login submission');
        }
      } else {
        console.log('No authentication required or already authenticated');
      }
    });
    scenario.steps.push(step3);

    // Step 4: Navigate to quiz selection
    const step4 = await this.measureTaskTime('Find Quiz Options', async () => {
      await this.page.waitForTimeout(2000);
      
      // Look for quiz-related elements
      const quizElements = await this.page.$$eval('*', elements => {
        return elements.filter(el => {
          const text = (el.textContent || '').toLowerCase();
          const className = (el.className || '').toLowerCase();
          
          return text.includes('quiz') || 
                 text.includes('quick') || 
                 text.includes('timed') || 
                 text.includes('custom') ||
                 className.includes('quiz') ||
                 text.includes('5 questions') ||
                 text.includes('practice');
        }).map(el => ({
          tag: el.tagName,
          text: (el.textContent || '').substring(0, 100),
          className: el.className || ''
        }));
      });
      
      console.log('Quiz elements found:', quizElements);
      
      if (quizElements.length === 0) {
        scenario.usabilityIssues.push('No clear quiz options visible to users');
      }
      
      await this.takeScreenshot('05_quiz_options', 'Quiz selection interface');
    });
    scenario.steps.push(step4);

    // Step 5: Select and start a quiz
    const step5 = await this.measureTaskTime('Start Quiz Session', async () => {
      // Try to find and click a quiz start button
      const quizStartSelectors = [
        'button:has-text("Quick Quiz")',
        'button:has-text("Start Quiz")',
        'button:has-text("Timed")',
        'button:has-text("5 Questions")',
        '.quiz-card button',
        '[data-quiz-type] button'
      ];
      
      let quizStarted = false;
      
      for (const selector of quizStartSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            quizStarted = true;
            console.log(`Started quiz using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!quizStarted) {
        // Try clicking any button with "quiz" in the class or text
        const allButtons = await this.page.$$('button');
        for (const button of allButtons) {
          const text = await button.textContent();
          const className = await button.getAttribute('class');
          
          if ((text && text.toLowerCase().includes('quiz')) || 
              (className && className.toLowerCase().includes('quiz'))) {
            await button.click();
            quizStarted = true;
            break;
          }
        }
      }
      
      if (!quizStarted) {
        throw new Error('Could not start quiz - no clickable quiz elements found');
      }
      
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('06_quiz_started', 'Quiz session started');
    });
    scenario.steps.push(step5);

    // Step 6: Interact with quiz questions
    const step6 = await this.measureTaskTime('Complete Quiz Questions', async () => {
      let questionsAnswered = 0;
      const maxQuestions = 5;
      
      for (let i = 0; i < maxQuestions; i++) {
        await this.page.waitForTimeout(2000);
        
        // Look for question content
        const questionExists = await this.page.$('div:has-text("Question"), .question, h1, h2, h3') !== null;
        
        if (!questionExists) {
          console.log('No more questions found, quiz may be complete');
          break;
        }
        
        await this.takeScreenshot(`07_question_${i + 1}`, `Question ${i + 1}`);
        
        // Simulate medical student thinking time (3-8 seconds)
        const thinkingTime = Math.random() * 5000 + 3000;
        await this.page.waitForTimeout(thinkingTime);
        
        // Try to find and select answer options
        const answerOptions = await this.page.$$('input[type="radio"], button[role="radio"], .answer-option');
        
        if (answerOptions.length > 0) {
          const selectedIndex = Math.floor(Math.random() * answerOptions.length);
          await answerOptions[selectedIndex].click();
          
          console.log(`Selected answer option ${selectedIndex + 1} for question ${i + 1}`);
          
          // Look for and click next button
          await this.page.waitForTimeout(1000);
          
          const nextButtons = await this.page.$$('button:has-text("Next"), button:has-text("Continue"), button[class*="next"]');
          if (nextButtons.length > 0) {
            await nextButtons[0].click();
          }
          
          questionsAnswered++;
        } else {
          console.log(`No answer options found for question ${i + 1}`);
          break;
        }
      }
      
      console.log(`Answered ${questionsAnswered} questions`);
      
      if (questionsAnswered === 0) {
        throw new Error('No questions were successfully answered');
      }
      
      await this.takeScreenshot('08_quiz_completion', 'Quiz completion attempt');
    });
    scenario.steps.push(step6);

    // Calculate results
    scenario.totalTime = scenario.steps.reduce((total, step) => total + step.duration, 0);
    scenario.success = scenario.steps.filter(step => step.success).length >= 4; // At least 4 of 6 steps
    
    this.results.scenarios.primaryQuizJourney = scenario;
    
    console.log(`✅ Scenario 1 completed in ${scenario.totalTime / 1000}s`);
    console.log(`   Success: ${scenario.success} (${scenario.steps.filter(s => s.success).length}/${scenario.steps.length} steps)`);
    
    return scenario;
  }

  async testScenario2_SearchAndDiscovery() {
    console.log('\n🔍 SCENARIO 2: Search & Discovery');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Search & Discovery',
      steps: [],
      success: false,
      searchResults: {}
    };

    const step1 = await this.measureTaskTime('Find Search Functionality', async () => {
      // Look for search inputs
      const searchInputs = await this.page.$$('input[type="search"], input[placeholder*="search"], [role="searchbox"]');
      
      if (searchInputs.length === 0) {
        scenario.usabilityIssues = ['No search functionality found'];
        throw new Error('No search inputs found');
      }
      
      await this.takeScreenshot('09_search_interface', 'Search interface');
    });
    scenario.steps.push(step1);

    // Test medical search terms
    for (const searchTerm of MEDICAL_SEARCH_TERMS.slice(0, 2)) {
      const searchStep = await this.measureTaskTime(`Search for "${searchTerm}"`, async () => {
        const searchInput = await this.page.$('input[type="search"], input[placeholder*="search"], [role="searchbox"]');
        
        if (searchInput) {
          await searchInput.fill(searchTerm);
          await this.page.keyboard.press('Enter');
          await this.page.waitForTimeout(2000);
          
          const resultsCount = await this.page.$$eval('*', elements => {
            return elements.filter(el => {
              const text = (el.textContent || '').toLowerCase();
              return text.includes('question') || 
                     text.includes('result') || 
                     el.className.includes('question');
            }).length;
          });
          
          scenario.searchResults[searchTerm] = resultsCount;
          console.log(`Found ${resultsCount} results for "${searchTerm}"`);
          
          await this.takeScreenshot(`10_search_${searchTerm.replace(/\s+/g, '_')}`, `Search results for ${searchTerm}`);
        }
      });
      scenario.steps.push(searchStep);
    }

    scenario.success = scenario.steps.every(step => step.success);
    this.results.scenarios.searchAndDiscovery = scenario;
    
    return scenario;
  }

  async testScenario3_MobileResponsiveness() {
    console.log('\n📱 SCENARIO 3: Mobile Responsiveness');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Mobile Responsiveness',
      devices: [],
      success: false
    };

    const mobileViewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 }
    ];

    for (const viewport of mobileViewports) {
      const deviceTest = await this.measureTaskTime(`Test ${viewport.name}`, async () => {
        await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
        await this.page.reload({ waitUntil: 'networkidle' });
        
        // Check for mobile-specific elements
        const mobileElements = await this.page.evaluate(() => {
          return {
            hasHamburgerMenu: !!document.querySelector('[class*="hamburger"], [class*="menu-toggle"]'),
            hasBottomNav: !!document.querySelector('[class*="bottom-nav"]'),
            hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
            touchTargetSize: Array.from(document.querySelectorAll('button')).some(btn => {
              const rect = btn.getBoundingClientRect();
              return rect.height >= 44 && rect.width >= 44;
            })
          };
        });
        
        console.log(`${viewport.name} analysis:`, mobileElements);
        
        await this.takeScreenshot(`11_mobile_${viewport.name.replace(/\s+/g, '_').toLowerCase()}`, `${viewport.name} layout`);
      });
      
      scenario.devices.push({
        name: viewport.name,
        success: deviceTest.success,
        viewport
      });
    }

    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    scenario.success = scenario.devices.every(device => device.success);
    this.results.scenarios.mobileResponsiveness = scenario;
    
    return scenario;
  }

  async testScenario4_PerformanceAndErrors() {
    console.log('\n⚡ SCENARIO 4: Performance & Error Handling');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Performance & Error Handling',
      steps: [],
      loadTimes: {},
      success: false
    };

    // Test page load performance
    const performanceStep = await this.measureTaskTime('Measure Page Load Performance', async () => {
      const pages = ['/', '/login', '/dashboard'];
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        
        try {
          await this.page.goto(`${BASE_URL}${pagePath}`, { 
            waitUntil: 'networkidle',
            timeout: 10000 
          });
          
          const loadTime = Date.now() - startTime;
          scenario.loadTimes[pagePath] = loadTime;
          
          console.log(`${pagePath} loaded in ${loadTime}ms`);
          
          if (loadTime > 5000) {
            scenario.usabilityIssues = scenario.usabilityIssues || [];
            scenario.usabilityIssues.push(`${pagePath} load time (${loadTime}ms) exceeds 5s`);
          }
          
        } catch (error) {
          scenario.loadTimes[pagePath] = 'TIMEOUT';
          console.log(`${pagePath} failed to load: ${error.message}`);
        }
      }
      
      await this.takeScreenshot('12_performance_test', 'Performance testing completed');
    });
    scenario.steps.push(performanceStep);

    // Test error handling
    const errorStep = await this.measureTaskTime('Test Error Handling', async () => {
      // Try navigating to non-existent page
      try {
        await this.page.goto(`${BASE_URL}/nonexistent-page`, { 
          waitUntil: 'networkidle',
          timeout: 5000 
        });
        
        const has404Content = await this.page.evaluate(() => {
          const text = document.body.textContent.toLowerCase();
          return text.includes('404') || 
                 text.includes('not found') || 
                 text.includes('page not found');
        });
        
        if (!has404Content) {
          scenario.usabilityIssues = scenario.usabilityIssues || [];
          scenario.usabilityIssues.push('No clear 404 error page shown');
        }
        
        await this.takeScreenshot('13_error_handling', '404 error page test');
        
      } catch (error) {
        console.log('Error page test completed:', error.message);
      }
    });
    scenario.steps.push(errorStep);

    scenario.success = scenario.steps.every(step => step.success);
    this.results.scenarios.performanceAndErrors = scenario;
    
    return scenario;
  }

  async generateReport() {
    console.log('\n📋 GENERATING COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));
    
    // Calculate overall statistics
    this.results.totalTests = Object.keys(this.results.scenarios).length;
    this.results.passedTests = Object.values(this.results.scenarios).filter(s => s.success).length;
    this.results.failedTests = this.results.totalTests - this.results.passedTests;
    
    // Collect usability findings
    Object.values(this.results.scenarios).forEach(scenario => {
      if (scenario.usabilityIssues) {
        this.results.usabilityFindings.push(...scenario.usabilityIssues);
      }
    });
    
    // Generate recommendations
    this.results.recommendations = [
      'Ensure primary quiz flow completion rate above 80%',
      'Implement clear search functionality with medical terminology',
      'Optimize mobile experience for medical students on-the-go',
      'Keep page load times under 3 seconds for optimal study experience',
      'Provide clear error messages and recovery paths'
    ];

    this.results.testEndTime = new Date().toISOString();
    
    // Save detailed results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null, 2));
    
    // Print executive summary
    this.printExecutiveSummary();
    
    return this.results;
  }

  printExecutiveSummary() {
    console.log('\n🏆 EXECUTIVE SUMMARY - MEDQUIZ PRO USER JOURNEY TESTING');
    console.log('='.repeat(70));
    
    console.log(`📊 OVERALL RESULTS:`);
    console.log(`   • Total Scenarios Tested: ${this.results.totalTests}`);
    console.log(`   • Scenarios Passed: ${this.results.passedTests}`);
    console.log(`   • Scenarios Failed: ${this.results.failedTests}`);
    console.log(`   • Success Rate: ${Math.round(this.results.passedTests / this.results.totalTests * 100)}%`);
    
    console.log(`\n🎯 SCENARIO RESULTS:`);
    Object.entries(this.results.scenarios).forEach(([name, scenario]) => {
      const status = scenario.success ? '✅ PASSED' : '❌ FAILED';
      console.log(`   ${status} ${name}`);
    });
    
    if (this.results.usabilityFindings.length > 0) {
      console.log(`\n⚠️ KEY USABILITY FINDINGS:`);
      this.results.usabilityFindings.forEach((finding, index) => {
        console.log(`   ${index + 1}. ${finding}`);
      });
    }
    
    const overallSuccess = this.results.passedTests / this.results.totalTests;
    let assessment = '';
    
    if (overallSuccess >= 0.8) {
      assessment = '🏆 EXCELLENT - Ready for medical student use';
    } else if (overallSuccess >= 0.6) {
      assessment = '⚠️ GOOD - Some improvements recommended';
    } else {
      assessment = '❌ NEEDS WORK - Critical issues identified';
    }
    
    console.log(`\n${assessment}`);
    console.log(`\n📄 Detailed results: ${RESULTS_FILE}`);
    console.log(`📸 Screenshots: ${SCREENSHOT_DIR}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution function
async function runComprehensiveTests() {
  const tester = new MedicalStudentUserJourneyTester();
  
  try {
    const initialized = await tester.initialize();
    if (!initialized) {
      console.log('❌ Failed to initialize testing environment');
      return;
    }
    
    // Run all test scenarios
    await tester.testScenario1_PrimaryQuizJourney();
    await tester.testScenario2_SearchAndDiscovery();
    await tester.testScenario3_MobileResponsiveness();
    await tester.testScenario4_PerformanceAndErrors();
    
    // Generate comprehensive report
    await tester.generateReport();
    
  } catch (error) {
    console.error('❌ Testing suite failed:', error.message);
  } finally {
    await tester.cleanup();
  }
}

// Export for use as module or run directly
if (require.main === module) {
  runComprehensiveTests().catch(console.error);
}

module.exports = { MedicalStudentUserJourneyTester };