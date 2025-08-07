/**
 * COMPREHENSIVE USER JOURNEY TESTING SUITE
 * For MedQuiz Pro - Medical Education Platform
 * 
 * Tests all critical user journeys following usability-test-plan.md specifications
 * Target: Second-year medical students and residents
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5176';
const SCREENSHOT_DIR = './test-results/user-journey-screenshots';
const RESULTS_FILE = './user-journey-test-results.json';

// Medical student test data
const TEST_USER = {
  email: 'medical.student.test@johnshopkins.edu',
  password: 'UsmleStep1Prep2025!',
  name: 'Dr. Sarah Wilson'
};

const MEDICAL_SEARCH_TERMS = [
  'cardiovascular',
  'myocardial infarction',
  'diabetes',
  'infectious disease',
  'pulmonary',
  'endocrine'
];

class UserJourneyTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      testStartTime: new Date().toISOString(),
      scenarios: {},
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      performance: {},
      usabilityFindings: [],
      bugs: [],
      recommendations: []
    };
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  }

  async initialize() {
    console.log('🏥 MEDQUIZ PRO - COMPREHENSIVE USER JOURNEY TESTING');
    console.log('=' .repeat(60));
    
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for better observation
      slowMo: 100, // Add delay to simulate real user behavior
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    
    // Enable request interception for network testing
    await this.page.setRequestInterception(true);
    this.page.on('request', request => request.continue());
    
    // Monitor console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Set up performance monitoring
    await this.page.setCacheEnabled(false);
  }

  async takeScreenshot(name, description = '') {
    const timestamp = Date.now();
    const filename = `${name}_${timestamp}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    
    await this.page.screenshot({
      path: filepath,
      fullPage: true
    });
    
    console.log(`📸 Screenshot: ${filename} - ${description}`);
    return filename;
  }

  async measureTaskTime(taskName, taskFunction) {
    const startTime = Date.now();
    let success = false;
    let error = null;
    
    try {
      await taskFunction();
      success = true;
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

  async waitForSelector(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.log(`⏰ Timeout waiting for: ${selector}`);
      return false;
    }
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
    console.log('Step 1: Navigate to landing page');
    const step1 = await this.measureTaskTime('Landing Page Load', async () => {
      await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });
      await this.takeScreenshot('01_landing_page', 'Initial landing page');
    });
    scenario.steps.push(step1);
    scenario.taskCompletionTimes.landingPageLoad = step1.duration;

    // Step 2: Navigate to quiz selection
    console.log('Step 2: Navigate to quiz selection');
    const step2 = await this.measureTaskTime('Quiz Navigation', async () => {
      // Look for quiz entry points
      const startButtons = await this.page.$$eval('button', buttons => 
        buttons.map(btn => ({ text: btn.textContent, visible: btn.offsetParent !== null }))
      );
      console.log('Available buttons:', startButtons);

      // Try multiple possible navigation paths
      let navigated = false;
      
      // Try "Get Started" button first
      if (await this.page.$('button:contains("Get Started")')) {
        await this.page.click('button:contains("Get Started")');
        navigated = true;
      } else if (await this.page.$('button[class*="primary"]')) {
        await this.page.click('button[class*="primary"]');
        navigated = true;
      } else {
        // Look for any CTA button
        const buttons = await this.page.$$('button');
        if (buttons.length > 0) {
          await buttons[0].click();
          navigated = true;
        }
      }
      
      if (!navigated) {
        throw new Error('Could not find quiz entry point');
      }
      
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('02_quiz_navigation', 'After clicking primary CTA');
    });
    scenario.steps.push(step2);

    // Step 3: Login/Authentication (if required)
    console.log('Step 3: Handle authentication if needed');
    const step3 = await this.measureTaskTime('Authentication', async () => {
      const currentUrl = this.page.url();
      
      if (currentUrl.includes('login') || await this.page.$('input[type="email"]')) {
        console.log('Authentication required, attempting login');
        
        await this.page.type('input[type="email"]', TEST_USER.email);
        await this.page.type('input[type="password"]', TEST_USER.password);
        await this.takeScreenshot('03_login_form', 'Login form filled');
        
        await this.page.click('button[type="submit"]');
        await this.page.waitForTimeout(3000);
        await this.takeScreenshot('04_after_login', 'After login attempt');
      }
    });
    scenario.steps.push(step3);

    // Step 4: Select 5-question timed quiz
    console.log('Step 4: Select 5-question timed quiz');
    const step4 = await this.measureTaskTime('Quiz Mode Selection', async () => {
      // Look for quiz mode options
      const quizOptions = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, div[class*="quiz"], div[class*="card"]'));
        return buttons.map(el => ({
          text: el.textContent || '',
          classes: el.className || '',
          tag: el.tagName
        })).filter(item => 
          item.text.toLowerCase().includes('quiz') || 
          item.text.toLowerCase().includes('quick') ||
          item.text.toLowerCase().includes('timed') ||
          item.classes.includes('quiz')
        );
      });
      
      console.log('Available quiz options:', quizOptions);
      
      // Try to select timed or quick quiz (5 questions)
      let quizSelected = false;
      
      // Look for "Quick Quiz" (usually 5 questions)
      if (await this.page.$('button:contains("Quick Quiz")')) {
        await this.page.click('button:contains("Quick Quiz")');
        quizSelected = true;
      } else if (await this.page.$('button:contains("Timed")')) {
        await this.page.click('button:contains("Timed")');
        quizSelected = true;
      } else {
        // Select first available quiz option
        const firstQuizButton = await this.page.$('button[class*="quiz"], div[class*="quiz"] button');
        if (firstQuizButton) {
          await firstQuizButton.click();
          quizSelected = true;
        }
      }
      
      if (!quizSelected) {
        throw new Error('Could not find quiz selection options');
      }
      
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('05_quiz_selected', 'Quiz mode selected');
    });
    scenario.steps.push(step4);

    // Step 5: Complete the quiz with realistic behavior
    console.log('Step 5: Complete quiz with medical student behavior');
    const step5 = await this.measureTaskTime('Quiz Completion', async () => {
      let questionCount = 0;
      const maxQuestions = 5;
      
      while (questionCount < maxQuestions) {
        // Check if we're on a quiz question
        const questionText = await this.page.$eval(
          'div[class*="question"], .question-text, h1, h2, h3', 
          el => el.textContent || ''
        ).catch(() => '');
        
        if (!questionText) {
          console.log('No question found, may have completed quiz');
          break;
        }
        
        console.log(`Question ${questionCount + 1}: ${questionText.substring(0, 100)}...`);
        
        // Take screenshot of question
        await this.takeScreenshot(`06_question_${questionCount + 1}`, `Question ${questionCount + 1}`);
        
        // Simulate medical student thinking time (3-10 seconds per question)
        const thinkingTime = Math.random() * 7000 + 3000;
        await this.page.waitForTimeout(thinkingTime);
        
        // Select an answer (simulate realistic selection patterns)
        const answerOptions = await this.page.$$('input[type="radio"], button[class*="option"], div[class*="option"]');
        
        if (answerOptions.length > 0) {
          // Medical students often eliminate obviously wrong answers first
          // Simulate this by sometimes clicking multiple options (changing mind)
          if (Math.random() > 0.7 && answerOptions.length > 2) {
            await answerOptions[Math.floor(Math.random() * answerOptions.length)].click();
            await this.page.waitForTimeout(1000);
          }
          
          // Final answer selection
          const selectedIndex = Math.floor(Math.random() * answerOptions.length);
          await answerOptions[selectedIndex].click();
          
          // Wait a moment and move to next question
          await this.page.waitForTimeout(1000);
          
          // Look for next button or auto-advance
          const nextButton = await this.page.$('button:contains("Next"), button[class*="next"]');
          if (nextButton) {
            await nextButton.click();
            await this.page.waitForTimeout(2000);
          }
        }
        
        questionCount++;
        
        // Check if quiz completed
        const completionIndicator = await this.page.$('div[class*="results"], div[class*="complete"], h1:contains("Results")');
        if (completionIndicator) {
          console.log('Quiz completed detected');
          break;
        }
      }
      
      await this.takeScreenshot('07_quiz_completed', 'Quiz completion');
    });
    scenario.steps.push(step5);

    // Step 6: Review results and explanations
    console.log('Step 6: Review results and explanations');
    const step6 = await this.measureTaskTime('Results Review', async () => {
      // Look for results page elements
      const resultsElements = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const text = el.textContent || '';
          return text.includes('Score') || 
                 text.includes('Results') || 
                 text.includes('Explanation') ||
                 text.includes('Correct') ||
                 text.includes('%') ||
                 text.includes('Performance');
        }).map(el => ({
          tag: el.tagName,
          text: el.textContent.substring(0, 100),
          classes: el.className
        }));
      });
      
      console.log('Results page elements:', resultsElements);
      
      // Take screenshot of results
      await this.takeScreenshot('08_results_page', 'Quiz results page');
      
      // Look for explanations
      const explanationButton = await this.page.$('button:contains("Explanation"), button:contains("Review"), button[class*="explanation"]');
      if (explanationButton) {
        await explanationButton.click();
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('09_explanations', 'Question explanations');
      }
    });
    scenario.steps.push(step6);

    // Calculate total scenario time
    scenario.totalTime = scenario.steps.reduce((total, step) => total + step.duration, 0);
    scenario.success = scenario.steps.every(step => step.success);
    
    // Usability assessment
    if (scenario.totalTime > 300000) { // More than 5 minutes
      scenario.usabilityIssues.push('Quiz completion time exceeds expected 5-minute target for medical students');
    }
    
    if (!scenario.success) {
      scenario.usabilityIssues.push('Critical user journey failed - users cannot complete basic quiz flow');
    }

    this.results.scenarios.primaryQuizJourney = scenario;
    console.log(`✅ Scenario 1 completed in ${scenario.totalTime / 1000}s (Success: ${scenario.success})`);
    
    return scenario;
  }

  async testScenario2_BookmarkWorkflow() {
    console.log('\n🔖 SCENARIO 2: Bookmark & Review Workflow');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Bookmark & Review Workflow',
      steps: [],
      totalTime: 0,
      success: false,
      usabilityIssues: []
    };

    // This scenario requires starting a quiz first
    console.log('Setting up for bookmark testing...');
    
    // Step 1: Start a quiz
    const step1 = await this.measureTaskTime('Start Quiz for Bookmarking', async () => {
      // Navigate back to quiz if needed
      await this.page.goto(`${BASE_URL}/quiz`, { waitUntil: 'networkidle2' }).catch(() => {
        return this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });
      });
      
      await this.takeScreenshot('10_bookmark_setup', 'Setting up bookmark test');
    });
    scenario.steps.push(step1);

    // Step 2: Look for bookmark functionality during quiz
    const step2 = await this.measureTaskTime('Find Bookmark Feature', async () => {
      // Look for bookmark buttons or icons
      const bookmarkElements = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const text = (el.textContent || '').toLowerCase();
          const classes = (el.className || '').toLowerCase();
          const title = (el.title || '').toLowerCase();
          
          return text.includes('bookmark') || 
                 classes.includes('bookmark') || 
                 title.includes('bookmark') ||
                 text.includes('save') ||
                 classes.includes('favorite') ||
                 el.querySelector('svg') && (
                   classes.includes('star') || 
                   classes.includes('heart') ||
                   classes.includes('save')
                 );
        }).map(el => ({
          tag: el.tagName,
          text: el.textContent.substring(0, 50),
          classes: el.className,
          hasIcon: !!el.querySelector('svg')
        }));
      });
      
      console.log('Bookmark elements found:', bookmarkElements);
      
      if (bookmarkElements.length === 0) {
        scenario.usabilityIssues.push('No visible bookmark functionality found - critical for medical study workflow');
      }
      
      await this.takeScreenshot('11_bookmark_search', 'Looking for bookmark functionality');
    });
    scenario.steps.push(step2);

    // Step 3: Test Review mode access
    const step3 = await this.measureTaskTime('Access Review Mode', async () => {
      // Look for Review mode navigation
      const reviewElements = await this.page.$$eval('*', elements => {
        return elements.filter(el => {
          const text = (el.textContent || '').toLowerCase();
          return text.includes('review') || 
                 text.includes('bookmarks') || 
                 text.includes('saved');
        }).map(el => ({
          tag: el.tagName,
          text: el.textContent.substring(0, 50),
          classes: el.className
        }));
      });
      
      console.log('Review mode elements:', reviewElements);
      
      // Try to navigate to review mode
      let reviewAccessed = false;
      if (await this.page.$('a[href*="review"], button:contains("Review")')) {
        const reviewLink = await this.page.$('a[href*="review"], button:contains("Review")');
        await reviewLink.click();
        await this.page.waitForTimeout(2000);
        reviewAccessed = true;
      }
      
      if (!reviewAccessed) {
        scenario.usabilityIssues.push('Review mode not easily accessible - important for medical education workflow');
      }
      
      await this.takeScreenshot('12_review_mode', 'Review mode access attempt');
    });
    scenario.steps.push(step3);

    scenario.totalTime = scenario.steps.reduce((total, step) => total + step.duration, 0);
    scenario.success = scenario.steps.every(step => step.success);
    
    this.results.scenarios.bookmarkWorkflow = scenario;
    console.log(`✅ Scenario 2 completed in ${scenario.totalTime / 1000}s (Success: ${scenario.success})`);
    
    return scenario;
  }

  async testScenario3_SearchDiscovery() {
    console.log('\n🔍 SCENARIO 3: Search & Discovery');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Search & Discovery',
      steps: [],
      totalTime: 0,
      success: false,
      usabilityIssues: [],
      searchResults: {}
    };

    // Step 1: Find search functionality
    const step1 = await this.measureTaskTime('Find Search Feature', async () => {
      // Look for search input fields
      const searchElements = await this.page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, [role="searchbox"]'));
        return inputs.filter(input => {
          const type = input.type || '';
          const placeholder = input.placeholder || '';
          const classes = input.className || '';
          const ariaLabel = input.getAttribute('aria-label') || '';
          
          return type.includes('search') ||
                 placeholder.toLowerCase().includes('search') ||
                 classes.toLowerCase().includes('search') ||
                 ariaLabel.toLowerCase().includes('search');
        }).map(input => ({
          type: input.type,
          placeholder: input.placeholder,
          classes: input.className,
          id: input.id
        }));
      });
      
      console.log('Search elements found:', searchElements);
      
      if (searchElements.length === 0) {
        scenario.usabilityIssues.push('No search functionality found - critical for medical question bank navigation');
      }
      
      await this.takeScreenshot('13_search_discovery', 'Search functionality assessment');
    });
    scenario.steps.push(step1);

    // Step 2: Test medical specialty searches
    for (const searchTerm of MEDICAL_SEARCH_TERMS.slice(0, 3)) { // Test first 3 terms
      const stepName = `Search for "${searchTerm}"`;
      console.log(`Step: ${stepName}`);
      
      const searchStep = await this.measureTaskTime(stepName, async () => {
        const searchInput = await this.page.$('input[type="search"], input[placeholder*="search"], [role="searchbox"]');
        
        if (searchInput) {
          await searchInput.click();
          await searchInput.clear();
          await searchInput.type(searchTerm);
          
          // Trigger search
          await this.page.keyboard.press('Enter');
          await this.page.waitForTimeout(2000);
          
          // Count results
          const resultsCount = await this.page.$$eval('*', elements => {
            return elements.filter(el => {
              const text = (el.textContent || '').toLowerCase();
              return text.includes('question') || 
                     text.includes('result') || 
                     el.className.includes('question') ||
                     el.className.includes('card');
            }).length;
          });
          
          scenario.searchResults[searchTerm] = resultsCount;
          console.log(`Search results for "${searchTerm}": ${resultsCount} items`);
          
          await this.takeScreenshot(`14_search_${searchTerm.replace(' ', '_')}`, `Search results for ${searchTerm}`);
        } else {
          throw new Error('Search input not found');
        }
      });
      
      scenario.steps.push(searchStep);
    }

    // Step 3: Test empty search state
    const step3 = await this.measureTaskTime('Test Empty Search State', async () => {
      const searchInput = await this.page.$('input[type="search"], input[placeholder*="search"], [role="searchbox"]');
      
      if (searchInput) {
        await searchInput.click();
        await searchInput.clear();
        await searchInput.type('xyznomatchmedicalterm'); // Intentionally unmatchable term
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(2000);
        
        // Check for no results message
        const noResultsMessage = await this.page.$eval('body', body => {
          const text = body.textContent.toLowerCase();
          return text.includes('no results') || 
                 text.includes('not found') || 
                 text.includes('no matches') ||
                 text.includes('try again');
        }).catch(() => false);
        
        if (!noResultsMessage) {
          scenario.usabilityIssues.push('No clear "no results" message shown for empty searches');
        }
        
        await this.takeScreenshot('15_empty_search', 'Empty search state');
      }
    });
    scenario.steps.push(step3);

    scenario.totalTime = scenario.steps.reduce((total, step) => total + step.duration, 0);
    scenario.success = scenario.steps.every(step => step.success);
    
    this.results.scenarios.searchDiscovery = scenario;
    console.log(`✅ Scenario 3 completed in ${scenario.totalTime / 1000}s (Success: ${scenario.success})`);
    
    return scenario;
  }

  async testScenario4_PerformanceAnalytics() {
    console.log('\n📊 SCENARIO 4: Performance Analytics');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Performance Analytics',
      steps: [],
      totalTime: 0,
      success: false,
      usabilityIssues: [],
      analyticsFound: []
    };

    // Step 1: Navigate to dashboard/profile area
    const step1 = await this.measureTaskTime('Navigate to Analytics', async () => {
      // Look for dashboard or profile navigation
      const navElements = await this.page.$$eval('a, button', elements => {
        return elements.filter(el => {
          const text = (el.textContent || '').toLowerCase();
          return text.includes('dashboard') || 
                 text.includes('profile') || 
                 text.includes('progress') ||
                 text.includes('analytics') ||
                 text.includes('stats');
        }).map(el => ({
          text: el.textContent,
          href: el.href || '',
          classes: el.className
        }));
      });
      
      console.log('Navigation elements for analytics:', navElements);
      
      // Try to navigate to dashboard
      let navigated = false;
      for (const navText of ['dashboard', 'profile', 'progress', 'stats']) {
        const navElement = await this.page.$(`a:contains("${navText}"), button:contains("${navText}")`);
        if (navElement) {
          await navElement.click();
          await this.page.waitForTimeout(2000);
          navigated = true;
          break;
        }
      }
      
      if (!navigated) {
        // Try navigation by URL
        await this.page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' }).catch(() => {
          return this.page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle2' }).catch(() => {});
        });
      }
      
      await this.takeScreenshot('16_analytics_navigation', 'Navigation to analytics area');
    });
    scenario.steps.push(step1);

    // Step 2: Identify analytics components
    const step2 = await this.measureTaskTime('Find Analytics Components', async () => {
      const analyticsElements = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const text = (el.textContent || '').toLowerCase();
          const classes = (el.className || '').toLowerCase();
          
          // Look for common analytics indicators
          return text.includes('score') || 
                 text.includes('accuracy') || 
                 text.includes('streak') ||
                 text.includes('quiz') ||
                 text.includes('performance') ||
                 text.includes('%') ||
                 classes.includes('stat') ||
                 classes.includes('metric') ||
                 classes.includes('chart') ||
                 classes.includes('progress') ||
                 el.tagName === 'CANVAS' || // Charts
                 (text.match(/\d+/) && (text.includes('correct') || text.includes('total')));
        }).map(el => ({
          tag: el.tagName,
          text: el.textContent.substring(0, 100),
          classes: el.className,
          hasNumbers: !!(el.textContent || '').match(/\d+/)
        }));
      });
      
      console.log('Analytics elements found:', analyticsElements.length);
      scenario.analyticsFound = analyticsElements;
      
      // Check for key performance indicators
      const kpiTypes = ['accuracy', 'score', 'streak', 'total', 'time'];
      const foundKPIs = kpiTypes.filter(kpi => 
        analyticsElements.some(el => el.text.toLowerCase().includes(kpi))
      );
      
      console.log('KPIs found:', foundKPIs);
      
      if (foundKPIs.length < 2) {
        scenario.usabilityIssues.push('Limited performance analytics available - medical students need detailed progress tracking');
      }
      
      await this.takeScreenshot('17_analytics_overview', 'Analytics dashboard overview');
    });
    scenario.steps.push(step2);

    // Step 3: Test historical data access
    const step3 = await this.measureTaskTime('Access Historical Data', async () => {
      // Look for historical data indicators
      const historyElements = await this.page.$$eval('*', elements => {
        return elements.filter(el => {
          const text = (el.textContent || '').toLowerCase();
          return text.includes('history') || 
                 text.includes('recent') || 
                 text.includes('past') ||
                 text.includes('previous') ||
                 text.includes('last') ||
                 el.className.includes('history') ||
                 el.className.includes('timeline');
        }).map(el => ({
          text: el.textContent.substring(0, 50),
          classes: el.className
        }));
      });
      
      console.log('Historical data elements:', historyElements);
      
      if (historyElements.length === 0) {
        scenario.usabilityIssues.push('No clear access to historical performance data');
      }
      
      await this.takeScreenshot('18_historical_data', 'Historical performance data');
    });
    scenario.steps.push(step3);

    scenario.totalTime = scenario.steps.reduce((total, step) => total + step.duration, 0);
    scenario.success = scenario.steps.every(step => step.success);
    
    this.results.scenarios.performanceAnalytics = scenario;
    console.log(`✅ Scenario 4 completed in ${scenario.totalTime / 1000}s (Success: ${scenario.success})`);
    
    return scenario;
  }

  async testScenario5_ErrorHandlingNetworkIssues() {
    console.log('\n🔧 SCENARIO 5: Error Handling & Network Issues');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Error Handling & Network Issues',
      steps: [],
      totalTime: 0,
      success: false,
      usabilityIssues: [],
      errorsEncountered: []
    };

    // Step 1: Test network disconnection simulation
    const step1 = await this.measureTaskTime('Simulate Network Disconnection', async () => {
      // Set up network interception to simulate offline
      await this.page.setOfflineMode(true);
      
      // Try to navigate or perform action while offline
      await this.page.reload().catch(() => {
        console.log('Expected: Page reload failed due to simulated offline mode');
      });
      
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('19_network_offline', 'Simulated offline state');
      
      // Check for offline handling
      const offlineMessage = await this.page.$eval('body', body => {
        const text = body.textContent.toLowerCase();
        return text.includes('offline') || 
               text.includes('connection') || 
               text.includes('network') ||
               text.includes('retry');
      }).catch(() => false);
      
      if (!offlineMessage) {
        scenario.usabilityIssues.push('No clear offline/network error messaging for users');
      }
    });
    scenario.steps.push(step1);

    // Step 2: Test recovery mechanisms
    const step2 = await this.measureTaskTime('Test Error Recovery', async () => {
      // Restore network
      await this.page.setOfflineMode(false);
      
      // Look for retry buttons or recovery mechanisms
      const retryElements = await this.page.$$eval('button, a', elements => {
        return elements.filter(el => {
          const text = (el.textContent || '').toLowerCase();
          return text.includes('retry') || 
                 text.includes('try again') || 
                 text.includes('refresh') ||
                 text.includes('reload');
        }).map(el => ({
          text: el.textContent,
          classes: el.className
        }));
      });
      
      console.log('Recovery elements found:', retryElements);
      
      // Try using retry mechanism if available
      if (retryElements.length > 0) {
        const retryButton = await this.page.$('button:contains("retry"), button:contains("Try Again")');
        if (retryButton) {
          await retryButton.click();
          await this.page.waitForTimeout(2000);
          await this.takeScreenshot('20_after_retry', 'After using retry mechanism');
        }
      } else {
        scenario.usabilityIssues.push('No clear retry mechanism available for error recovery');
      }
    });
    scenario.steps.push(step2);

    // Step 3: Test timeout scenarios
    const step3 = await this.measureTaskTime('Test Timeout Handling', async () => {
      // Simulate slow network
      await this.page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 50 * 1024 / 8, // 50kb/s
        uploadThroughput: 20 * 1024 / 8,   // 20kb/s
        latency: 2000, // 2 second delay
      });
      
      // Try to start a quiz or navigate
      try {
        const startQuizButton = await this.page.$('button[class*="quiz"], a[href*="quiz"]');
        if (startQuizButton) {
          await startQuizButton.click();
          await this.page.waitForTimeout(5000); // Wait longer due to slow network
        }
        
        await this.takeScreenshot('21_slow_network', 'Under slow network conditions');
      } catch (error) {
        console.log('Timeout error encountered (expected):', error.message.substring(0, 100));
        scenario.errorsEncountered.push(`Timeout: ${error.message}`);
      }
      
      // Reset network conditions
      await this.page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 0,
        uploadThroughput: 0,
        latency: 0,
      });
    });
    scenario.steps.push(step3);

    scenario.totalTime = scenario.steps.reduce((total, step) => total + step.duration, 0);
    scenario.success = scenario.steps.filter(step => step.success).length >= 2; // At least 2 of 3 should work
    
    this.results.scenarios.errorHandlingNetworkIssues = scenario;
    console.log(`✅ Scenario 5 completed in ${scenario.totalTime / 1000}s (Success: ${scenario.success})`);
    
    return scenario;
  }

  async testMobileResponsiveness() {
    console.log('\n📱 MOBILE RESPONSIVENESS TESTING');
    console.log('-'.repeat(50));
    
    const mobileTest = {
      name: 'Mobile Responsiveness',
      devices: [],
      success: false,
      usabilityIssues: []
    };

    const devices = [
      { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
      { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
      { name: 'Samsung Galaxy', viewport: { width: 360, height: 740 } },
      { name: 'iPad', viewport: { width: 768, height: 1024 } }
    ];

    for (const device of devices) {
      console.log(`Testing ${device.name} (${device.viewport.width}x${device.viewport.height})`);
      
      const deviceTest = await this.measureTaskTime(`${device.name} Test`, async () => {
        await this.page.setViewport(device.viewport);
        await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });
        
        // Check for mobile-specific elements
        const mobileElements = await this.page.evaluate(() => {
          return {
            hasHamburgerMenu: !!document.querySelector('[class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"]'),
            hasBottomNav: !!document.querySelector('[class*="bottom-nav"], nav[class*="mobile"]'),
            hasTouchTargets: Array.from(document.querySelectorAll('button, a')).length > 0,
            buttonsAreTouchFriendly: Array.from(document.querySelectorAll('button')).some(btn => {
              const rect = btn.getBoundingClientRect();
              return rect.height >= 44 && rect.width >= 44; // Apple's 44px minimum
            }),
            hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
          };
        });
        
        console.log(`${device.name} mobile elements:`, mobileElements);
        
        if (mobileElements.hasHorizontalScroll) {
          mobileTest.usabilityIssues.push(`${device.name}: Horizontal scroll detected - layout overflow`);
        }
        
        if (!mobileElements.buttonsAreTouchFriendly) {
          mobileTest.usabilityIssues.push(`${device.name}: Touch targets may be too small (< 44px)`);
        }
        
        await this.takeScreenshot(`22_mobile_${device.name.replace(' ', '_').toLowerCase()}`, `${device.name} layout`);
      });
      
      mobileTest.devices.push({
        name: device.name,
        viewport: device.viewport,
        success: deviceTest.success,
        duration: deviceTest.duration
      });
    }

    // Reset to desktop viewport
    await this.page.setViewport({ width: 1280, height: 720 });
    
    mobileTest.success = mobileTest.devices.every(device => device.success);
    this.results.mobileResponsiveness = mobileTest;
    
    console.log(`✅ Mobile testing completed (Success: ${mobileTest.success})`);
    return mobileTest;
  }

  async performanceAudit() {
    console.log('\n⚡ PERFORMANCE AUDIT');
    console.log('-'.repeat(50));
    
    const performanceData = {
      pageLoadTimes: {},
      resourceSizes: {},
      interactionLatency: {},
      recommendations: []
    };

    // Test key pages
    const pagesToTest = [
      { name: 'Landing', url: BASE_URL },
      { name: 'Login', url: `${BASE_URL}/login` },
      { name: 'Dashboard', url: `${BASE_URL}/dashboard` },
      { name: 'Quiz', url: `${BASE_URL}/quiz` }
    ];

    for (const pageTest of pagesToTest) {
      console.log(`Testing performance of ${pageTest.name} page`);
      
      const startTime = Date.now();
      
      try {
        await this.page.goto(pageTest.url, { waitUntil: 'networkidle2', timeout: 30000 });
        const loadTime = Date.now() - startTime;
        performanceData.pageLoadTimes[pageTest.name] = loadTime;
        
        console.log(`${pageTest.name} page loaded in ${loadTime}ms`);
        
        // Check for performance issues
        if (loadTime > 3000) {
          performanceData.recommendations.push(`${pageTest.name} page load time (${loadTime}ms) exceeds 3s target`);
        }
        
      } catch (error) {
        performanceData.pageLoadTimes[pageTest.name] = 'TIMEOUT';
        performanceData.recommendations.push(`${pageTest.name} page failed to load within 30s`);
      }
    }

    this.results.performance = performanceData;
    console.log('✅ Performance audit completed');
    
    return performanceData;
  }

  async generateReport() {
    console.log('\n📋 GENERATING COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));
    
    // Calculate overall statistics
    this.results.totalTests = Object.keys(this.results.scenarios).length;
    this.results.passedTests = Object.values(this.results.scenarios).filter(s => s.success).length;
    this.results.failedTests = this.results.totalTests - this.results.passedTests;
    
    // Collect all usability issues
    Object.values(this.results.scenarios).forEach(scenario => {
      this.results.usabilityFindings.push(...(scenario.usabilityIssues || []));
    });
    
    if (this.results.mobileResponsiveness) {
      this.results.usabilityFindings.push(...this.results.mobileResponsiveness.usabilityIssues);
    }

    // Generate recommendations
    this.results.recommendations = [
      ...new Set([ // Remove duplicates
        ...this.results.usabilityFindings,
        ...(this.results.performance?.recommendations || [])
      ])
    ];

    // Add summary statistics
    const totalTime = Object.values(this.results.scenarios).reduce((total, scenario) => 
      total + (scenario.totalTime || 0), 0
    );
    
    this.results.testEndTime = new Date().toISOString();
    this.results.totalTestDuration = totalTime;
    this.results.averageScenarioTime = totalTime / this.results.totalTests;

    // Calculate completion rates
    this.results.completionRates = {};
    Object.entries(this.results.scenarios).forEach(([name, scenario]) => {
      const successfulSteps = scenario.steps?.filter(step => step.success).length || 0;
      const totalSteps = scenario.steps?.length || 1;
      this.results.completionRates[name] = Math.round((successfulSteps / totalSteps) * 100);
    });

    // Save results to file
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null, 2));
    console.log(`✅ Detailed results saved to: ${RESULTS_FILE}`);
    
    // Print executive summary
    this.printExecutiveSummary();
    
    return this.results;
  }

  printExecutiveSummary() {
    console.log('\n🏆 EXECUTIVE SUMMARY - MEDQUIZ PRO USER JOURNEY TESTING');
    console.log('='.repeat(70));
    
    console.log(`📊 OVERALL RESULTS:`);
    console.log(`   • Total Scenarios Tested: ${this.results.totalTests}`);
    console.log(`   • Scenarios Passed: ${this.results.passedTests} (${Math.round(this.results.passedTests / this.results.totalTests * 100)}%)`);
    console.log(`   • Scenarios Failed: ${this.results.failedTests}`);
    console.log(`   • Average Scenario Duration: ${Math.round(this.results.averageScenarioTime / 1000)}s`);
    
    console.log(`\n🎯 SCENARIO COMPLETION RATES:`);
    Object.entries(this.results.completionRates).forEach(([scenario, rate]) => {
      const status = rate >= 80 ? '✅' : rate >= 60 ? '⚠️' : '❌';
      console.log(`   ${status} ${scenario}: ${rate}%`);
    });
    
    if (this.results.usabilityFindings.length > 0) {
      console.log(`\n⚠️ KEY USABILITY ISSUES FOUND (${this.results.usabilityFindings.length}):`);
      this.results.usabilityFindings.slice(0, 5).forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      if (this.results.usabilityFindings.length > 5) {
        console.log(`   ... and ${this.results.usabilityFindings.length - 5} more issues`);
      }
    }
    
    console.log(`\n📱 MOBILE RESPONSIVENESS:`);
    if (this.results.mobileResponsiveness) {
      const mobileSuccess = this.results.mobileResponsiveness.success;
      console.log(`   ${mobileSuccess ? '✅' : '❌'} Overall Mobile Test: ${mobileSuccess ? 'PASSED' : 'FAILED'}`);
      this.results.mobileResponsiveness.devices.forEach(device => {
        console.log(`   ${device.success ? '✅' : '❌'} ${device.name}: ${device.success ? 'PASSED' : 'FAILED'}`);
      });
    }
    
    console.log(`\n⚡ PERFORMANCE SUMMARY:`);
    if (this.results.performance) {
      Object.entries(this.results.performance.pageLoadTimes).forEach(([page, time]) => {
        const status = typeof time === 'number' ? 
          (time < 2000 ? '✅ FAST' : time < 3000 ? '⚠️ MODERATE' : '❌ SLOW') : 
          '❌ TIMEOUT';
        const displayTime = typeof time === 'number' ? `${time}ms` : time;
        console.log(`   ${status} ${page}: ${displayTime}`);
      });
    }
    
    // Final assessment
    const overallSuccess = this.results.passedTests / this.results.totalTests;
    let finalAssessment = '';
    
    if (overallSuccess >= 0.8) {
      finalAssessment = '🏆 EXCELLENT - Ready for medical student use';
    } else if (overallSuccess >= 0.6) {
      finalAssessment = '⚠️ GOOD - Some improvements needed before launch';
    } else {
      finalAssessment = '❌ NEEDS WORK - Critical issues must be resolved';
    }
    
    console.log(`\n${finalAssessment}`);
    console.log(`\n📄 Full detailed report saved to: ${RESULTS_FILE}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('='.repeat(70));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function runComprehensiveUserJourneyTests() {
  const tester = new UserJourneyTester();
  
  try {
    await tester.initialize();
    
    // Run all test scenarios
    await tester.testScenario1_PrimaryQuizJourney();
    await tester.testScenario2_BookmarkWorkflow();
    await tester.testScenario3_SearchDiscovery();
    await tester.testScenario4_PerformanceAnalytics();
    await tester.testScenario5_ErrorHandlingNetworkIssues();
    
    // Run additional testing
    await tester.testMobileResponsiveness();
    await tester.performanceAudit();
    
    // Generate comprehensive report
    await tester.generateReport();
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run the tests
runComprehensiveUserJourneyTests().catch(console.error);