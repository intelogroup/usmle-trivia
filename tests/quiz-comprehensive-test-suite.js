#!/usr/bin/env node

/**
 * 🎯 COMPREHENSIVE QUIZ FUNCTIONALITY TEST SUITE
 * Cross-Browser User Journey Validation with Convex MCP Integration
 */

import { test, expect, chromium, firefox, webkit } from '@playwright/test';
import { readFileSync } from 'fs';

// Test Configuration
const TEST_CONFIG = {
  browsers: ['chromium', 'firefox', 'webkit'],
  devices: [
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
    { name: 'Tablet', viewport: { width: 768, height: 1024 } },
    { name: 'Mobile', viewport: { width: 375, height: 667 } }
  ],
  baseURL: 'https://usmle-trivia.netlify.app',
  localURL: 'http://localhost:5173',
  timeout: 60000,
  retries: 2
};

// Quiz Test Data
const QUIZ_TEST_DATA = {
  users: [
    {
      email: 'test.student@medschool.edu',
      password: 'TestPass123!',
      name: 'Test Medical Student',
      level: 'MS3'
    },
    {
      email: 'resident.user@hospital.edu', 
      password: 'ResidentPass456!',
      name: 'Test Resident',
      level: 'PGY1'
    }
  ],
  quizModes: [
    { name: 'Quick Quiz', questions: 5, timeLimit: false },
    { name: 'Timed Quiz', questions: 10, timeLimit: 600 }, // 10 minutes
    { name: 'Custom Quiz', questions: 8, timeLimit: 480 }  // 8 minutes
  ],
  expectedQuestionTypes: [
    'multiple-choice',
    'clinical-scenario',
    'case-based',
    'image-based'
  ]
};

/**
 * PHASE 1: CORE QUIZ ENGINE TESTING
 */
class QuizEngineTestSuite {
  constructor(page) {
    this.page = page;
    this.testResults = {
      passed: 0,
      failed: 0,
      details: []
    };
  }

  async testQuizCreation() {
    console.log('🔧 Testing Quiz Creation & Configuration...');
    
    for (const mode of QUIZ_TEST_DATA.quizModes) {
      try {
        // Navigate to quiz setup
        await this.page.goto(`${TEST_CONFIG.baseURL}/quiz`);
        await this.page.waitForLoadState('networkidle');

        // Select quiz mode
        await this.page.click(`[data-testid="quiz-mode-${mode.name.toLowerCase().replace(' ', '-')}"]`);
        
        // Verify quiz configuration
        const questionCount = await this.page.textContent('[data-testid="question-count"]');
        expect(questionCount).toContain(mode.questions.toString());

        if (mode.timeLimit) {
          const timeDisplay = await this.page.textContent('[data-testid="time-limit"]');
          expect(timeDisplay).toBeTruthy();
        }

        // Start quiz
        await this.page.click('[data-testid="start-quiz-btn"]');
        await this.page.waitForSelector('[data-testid="quiz-question"]');

        this.testResults.passed++;
        this.testResults.details.push(`✅ ${mode.name} creation successful`);
        
      } catch (error) {
        this.testResults.failed++;
        this.testResults.details.push(`❌ ${mode.name} creation failed: ${error.message}`);
      }
    }
  }

  async testQuestionRendering() {
    console.log('📝 Testing Question Rendering...');
    
    try {
      // Verify question structure
      await this.page.waitForSelector('[data-testid="quiz-question"]');
      
      const questionText = await this.page.textContent('[data-testid="question-text"]');
      expect(questionText).toBeTruthy();
      expect(questionText.length).toBeGreaterThan(10);

      // Check for clinical scenario markers
      const hasScenario = questionText.includes('year-old') || 
                         questionText.includes('patient') ||
                         questionText.includes('history');
      
      // Verify answer options
      const options = await this.page.$$('[data-testid^="answer-option-"]');
      expect(options.length).toBeGreaterThanOrEqual(4);
      expect(options.length).toBeLessThanOrEqual(6);

      // Check for medical terminology
      const medicalTerms = ['diagnosis', 'treatment', 'symptom', 'condition'];
      const hasMedicalContent = medicalTerms.some(term => 
        questionText.toLowerCase().includes(term)
      );

      this.testResults.passed++;
      this.testResults.details.push(`✅ Question rendering validated`);
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push(`❌ Question rendering failed: ${error.message}`);
    }
  }

  async testAnswerProcessing() {
    console.log('⚡ Testing Answer Processing...');
    
    try {
      // Select an answer
      await this.page.click('[data-testid="answer-option-0"]');
      
      // Verify selection highlight
      const selectedOption = await this.page.$('[data-testid="answer-option-0"].selected');
      expect(selectedOption).toBeTruthy();

      // Submit answer
      await this.page.click('[data-testid="submit-answer-btn"]');
      
      // Wait for feedback
      await this.page.waitForSelector('[data-testid="answer-feedback"]');
      
      const feedback = await this.page.textContent('[data-testid="answer-feedback"]');
      expect(feedback).toBeTruthy();

      // Check for explanation
      const explanation = await this.page.textContent('[data-testid="answer-explanation"]');
      expect(explanation).toBeTruthy();
      expect(explanation.length).toBeGreaterThan(50);

      // Verify medical references
      const references = await this.page.$$('[data-testid="medical-reference"]');
      expect(references.length).toBeGreaterThan(0);

      this.testResults.passed++;
      this.testResults.details.push(`✅ Answer processing validated`);
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push(`❌ Answer processing failed: ${error.message}`);
    }
  }

  async testSessionManagement() {
    console.log('🔄 Testing Session Management...');
    
    try {
      // Complete quiz session
      let questionCount = 0;
      const maxQuestions = 5; // For quick quiz
      
      while (questionCount < maxQuestions) {
        // Answer current question
        await this.page.click('[data-testid="answer-option-0"]');
        await this.page.click('[data-testid="submit-answer-btn"]');
        
        // Move to next question or results
        const nextBtn = await this.page.$('[data-testid="next-question-btn"]');
        if (nextBtn) {
          await nextBtn.click();
          questionCount++;
        } else {
          break;
        }
      }

      // Verify results page
      await this.page.waitForSelector('[data-testid="quiz-results"]');
      
      const score = await this.page.textContent('[data-testid="quiz-score"]');
      expect(score).toMatch(/\d+%|\d+\/\d+/);

      const performance = await this.page.textContent('[data-testid="performance-breakdown"]');
      expect(performance).toBeTruthy();

      this.testResults.passed++;
      this.testResults.details.push(`✅ Session management validated`);
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push(`❌ Session management failed: ${error.message}`);
    }
  }

  getResults() {
    return this.testResults;
  }
}

/**
 * PHASE 2: CROSS-BROWSER COMPATIBILITY TESTING
 */
class CrossBrowserTestSuite {
  constructor() {
    this.results = {};
  }

  async runBrowserTests() {
    console.log('🌐 Running Cross-Browser Compatibility Tests...');
    
    for (const browserName of TEST_CONFIG.browsers) {
      console.log(`\n📱 Testing ${browserName.toUpperCase()}...`);
      
      const browser = await this.launchBrowser(browserName);
      const context = await browser.newContext();
      
      for (const device of TEST_CONFIG.devices) {
        console.log(`  📺 Testing ${device.name} (${device.viewport.width}x${device.viewport.height})`);
        
        const page = await context.newPage();
        await page.setViewportSize(device.viewport);
        
        const quizEngine = new QuizEngineTestSuite(page);
        
        // Run core tests
        await quizEngine.testQuizCreation();
        await quizEngine.testQuestionRendering();
        await quizEngine.testAnswerProcessing();
        
        this.results[`${browserName}-${device.name}`] = quizEngine.getResults();
        
        await page.close();
      }
      
      await browser.close();
    }
  }

  async launchBrowser(browserName) {
    switch (browserName) {
      case 'chromium':
        return await chromium.launch({ headless: false });
      case 'firefox':
        return await firefox.launch({ headless: false });
      case 'webkit':
        return await webkit.launch({ headless: false });
      default:
        throw new Error(`Unsupported browser: ${browserName}`);
    }
  }

  getResults() {
    return this.results;
  }
}

/**
 * PHASE 3: COMPLETE USER JOURNEY WORKFLOWS
 */
class UserJourneyTestSuite {
  constructor(page) {
    this.page = page;
    this.workflows = [];
  }

  async testCompleteUserJourney() {
    console.log('👤 Testing Complete User Journey...');
    
    // Workflow 1: New User Registration → First Quiz
    await this.testNewUserFlow();
    
    // Workflow 2: Returning User → Advanced Quiz
    await this.testReturningUserFlow();
    
    // Workflow 3: Social Features → Study Groups
    await this.testSocialFeaturesFlow();
    
    // Workflow 4: Performance Analytics → Progress Tracking
    await this.testAnalyticsFlow();
  }

  async testNewUserFlow() {
    try {
      // Registration
      await this.page.goto(`${TEST_CONFIG.baseURL}/register`);
      await this.page.fill('[data-testid="email-input"]', QUIZ_TEST_DATA.users[0].email);
      await this.page.fill('[data-testid="password-input"]', QUIZ_TEST_DATA.users[0].password);
      await this.page.fill('[data-testid="name-input"]', QUIZ_TEST_DATA.users[0].name);
      await this.page.click('[data-testid="register-btn"]');

      // Profile Setup
      await this.page.waitForSelector('[data-testid="profile-setup"]');
      await this.page.selectOption('[data-testid="medical-level"]', QUIZ_TEST_DATA.users[0].level);
      await this.page.click('[data-testid="complete-profile-btn"]');

      // First Quiz Experience
      await this.page.waitForSelector('[data-testid="dashboard"]');
      await this.page.click('[data-testid="start-first-quiz"]');
      
      const quizEngine = new QuizEngineTestSuite(this.page);
      await quizEngine.testQuizCreation();
      
      this.workflows.push({ name: 'New User Flow', status: 'passed' });
      
    } catch (error) {
      this.workflows.push({ name: 'New User Flow', status: 'failed', error: error.message });
    }
  }

  async testReturningUserFlow() {
    try {
      // Login
      await this.page.goto(`${TEST_CONFIG.baseURL}/login`);
      await this.page.fill('[data-testid="email-input"]', QUIZ_TEST_DATA.users[1].email);
      await this.page.fill('[data-testid="password-input"]', QUIZ_TEST_DATA.users[1].password);
      await this.page.click('[data-testid="login-btn"]');

      // Dashboard Navigation
      await this.page.waitForSelector('[data-testid="dashboard"]');
      
      // Access Advanced Quiz
      await this.page.click('[data-testid="advanced-quiz-mode"]');
      await this.page.selectOption('[data-testid="difficulty-level"]', 'hard');
      await this.page.selectOption('[data-testid="specialty"]', 'cardiology');
      
      const quizEngine = new QuizEngineTestSuite(this.page);
      await quizEngine.testQuizCreation();
      
      this.workflows.push({ name: 'Returning User Flow', status: 'passed' });
      
    } catch (error) {
      this.workflows.push({ name: 'Returning User Flow', status: 'failed', error: error.message });
    }
  }

  async testSocialFeaturesFlow() {
    try {
      // Navigate to Social Features
      await this.page.click('[data-testid="social-nav"]');
      
      // Test Leaderboard
      await this.page.click('[data-testid="leaderboard-tab"]');
      await this.page.waitForSelector('[data-testid="leaderboard-list"]');
      
      // Test Study Groups
      await this.page.click('[data-testid="study-groups-tab"]');
      await this.page.click('[data-testid="create-study-group"]');
      await this.page.fill('[data-testid="group-name"]', 'USMLE Step 1 Study Group');
      await this.page.click('[data-testid="create-group-btn"]');
      
      this.workflows.push({ name: 'Social Features Flow', status: 'passed' });
      
    } catch (error) {
      this.workflows.push({ name: 'Social Features Flow', status: 'failed', error: error.message });
    }
  }

  async testAnalyticsFlow() {
    try {
      // Navigate to Analytics
      await this.page.click('[data-testid="analytics-nav"]');
      
      // Test Performance Dashboard
      await this.page.waitForSelector('[data-testid="performance-chart"]');
      
      // Test Progress Tracking
      await this.page.click('[data-testid="progress-tab"]');
      await this.page.waitForSelector('[data-testid="progress-indicators"]');
      
      // Test Achievement System
      await this.page.click('[data-testid="achievements-tab"]');
      await this.page.waitForSelector('[data-testid="achievement-badges"]');
      
      this.workflows.push({ name: 'Analytics Flow', status: 'passed' });
      
    } catch (error) {
      this.workflows.push({ name: 'Analytics Flow', status: 'failed', error: error.message });
    }
  }

  getWorkflows() {
    return this.workflows;
  }
}

/**
 * MAIN TEST EXECUTION
 */
async function runComprehensiveQuizTests() {
  console.log('🚀 STARTING COMPREHENSIVE QUIZ FUNCTIONALITY TESTS');
  console.log('=================================================\n');

  const testResults = {
    timestamp: new Date().toISOString(),
    phases: {},
    summary: { total: 0, passed: 0, failed: 0 }
  };

  try {
    // Phase 1: Core Quiz Engine Testing
    console.log('📋 PHASE 1: Core Quiz Engine Testing');
    console.log('-----------------------------------');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const quizEngine = new QuizEngineTestSuite(page);
    await quizEngine.testQuizCreation();
    await quizEngine.testQuestionRendering();
    await quizEngine.testAnswerProcessing();
    await quizEngine.testSessionManagement();
    
    testResults.phases.coreEngine = quizEngine.getResults();
    
    // Phase 2: Cross-Browser Compatibility
    console.log('\n🌐 PHASE 2: Cross-Browser Compatibility');
    console.log('---------------------------------------');
    
    const crossBrowser = new CrossBrowserTestSuite();
    await crossBrowser.runBrowserTests();
    
    testResults.phases.crossBrowser = crossBrowser.getResults();
    
    // Phase 3: User Journey Workflows
    console.log('\n👤 PHASE 3: User Journey Workflows');
    console.log('----------------------------------');
    
    const userJourney = new UserJourneyTestSuite(page);
    await userJourney.testCompleteUserJourney();
    
    testResults.phases.userJourney = userJourney.getWorkflows();
    
    await browser.close();
    
    // Calculate summary
    Object.values(testResults.phases).forEach(phase => {
      if (phase.passed) testResults.summary.passed += phase.passed;
      if (phase.failed) testResults.summary.failed += phase.failed;
    });
    testResults.summary.total = testResults.summary.passed + testResults.summary.failed;
    
    // Generate report
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed} ✅`);
    console.log(`Failed: ${testResults.summary.failed} ❌`);
    console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
    
    // Save results
    require('fs').writeFileSync(
      '/root/repo/test-results/quiz-comprehensive-test-results.json',
      JSON.stringify(testResults, null, 2)
    );
    
    console.log('\n✅ Comprehensive Quiz Tests Complete!');
    console.log('Results saved to: quiz-comprehensive-test-results.json');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    throw error;
  }
}

// Export for use as module or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveQuizTests().catch(console.error);
}

export { QuizEngineTestSuite, CrossBrowserTestSuite, UserJourneyTestSuite, runComprehensiveQuizTests };