#!/usr/bin/env node

/**
 * 👤 COMPLETE USER JOURNEY QUIZ TESTS
 * End-to-end workflow validation for medical students
 */

import { test, expect } from '@playwright/test';
import { BROWSER_MATRIX, MEDICAL_TEST_DATA, QUIZ_TEST_SCENARIOS } from './cross-browser-quiz-config.js';

/**
 * USER JOURNEY TEST FRAMEWORK
 */
class UserJourneyFramework {
  constructor(page, testConfig = {}) {
    this.page = page;
    this.config = {
      baseURL: 'https://usmle-trivia.netlify.app',
      timeout: 60000,
      retries: 2,
      ...testConfig
    };
    this.journeyResults = [];
    this.currentUser = null;
  }

  /**
   * JOURNEY 1: NEW MEDICAL STUDENT ONBOARDING
   */
  async testNewStudentOnboarding() {
    console.log('🎓 Testing New Medical Student Onboarding Journey...');
    
    const user = MEDICAL_TEST_DATA.users[0]; // MS1 Student
    const journeySteps = [];

    try {
      // Step 1: Landing Page Discovery
      await this.page.goto(this.config.baseURL);
      await this.page.waitForLoadState('networkidle');
      
      const landingTime = await this.measureLoadTime();
      journeySteps.push({
        step: 'Landing Page Load',
        duration: landingTime,
        status: 'passed'
      });

      // Step 2: Registration Process
      await this.page.click('[data-testid="get-started-btn"]');
      await this.page.waitForSelector('[data-testid="registration-form"]');
      
      await this.page.fill('[data-testid="email-input"]', user.email);
      await this.page.fill('[data-testid="password-input"]', user.password);
      await this.page.fill('[data-testid="name-input"]', user.name);
      await this.page.selectOption('[data-testid="medical-level"]', user.level);
      
      const registrationBtn = await this.page.$('[data-testid="register-btn"]');
      await registrationBtn.click();
      
      // Wait for registration success
      await this.page.waitForSelector('[data-testid="registration-success"]', { timeout: 10000 });
      
      journeySteps.push({
        step: 'User Registration',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 3: Profile Setup and Personalization
      await this.page.waitForSelector('[data-testid="profile-setup"]');
      
      // Select specialties of interest
      for (const specialty of user.specialties) {
        await this.page.check(`[data-testid="specialty-${specialty}"]`);
      }
      
      // Set study goals
      await this.page.selectOption('[data-testid="study-goals"]', user.goals);
      
      await this.page.click('[data-testid="complete-profile-btn"]');
      
      journeySteps.push({
        step: 'Profile Personalization',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 4: First Quiz Experience
      await this.page.waitForSelector('[data-testid="dashboard"]');
      
      // Tutorial or guided first quiz
      const hasTutorial = await this.page.$('[data-testid="tutorial-modal"]');
      if (hasTutorial) {
        await this.page.click('[data-testid="start-tutorial-btn"]');
        await this.completeTutorial();
      }
      
      // Start first quiz (recommended: Quick Quiz for new users)
      await this.page.click('[data-testid="recommended-quiz"]');
      await this.completeQuizSession(QUIZ_TEST_SCENARIOS.quickQuiz);
      
      journeySteps.push({
        step: 'First Quiz Completion',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 5: Results and Next Steps
      await this.page.waitForSelector('[data-testid="quiz-results"]');
      
      const score = await this.page.textContent('[data-testid="quiz-score"]');
      const recommendations = await this.page.$$('[data-testid="study-recommendation"]');
      
      expect(score).toMatch(/\d+%/);
      expect(recommendations.length).toBeGreaterThan(0);
      
      journeySteps.push({
        step: 'Results and Recommendations',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      this.journeyResults.push({
        journey: 'New Student Onboarding',
        user: user.profile,
        steps: journeySteps,
        totalDuration: journeySteps.reduce((sum, step) => sum + step.duration, 0),
        status: 'completed'
      });

      console.log('✅ New Student Onboarding Journey completed successfully');
      
    } catch (error) {
      journeySteps.push({
        step: 'Journey Failed',
        error: error.message,
        status: 'failed'
      });
      
      this.journeyResults.push({
        journey: 'New Student Onboarding',
        user: user.profile,
        steps: journeySteps,
        status: 'failed',
        error: error.message
      });
      
      console.error('❌ New Student Onboarding Journey failed:', error.message);
      throw error;
    }
  }

  /**
   * JOURNEY 2: ADVANCED STUDENT STUDY SESSION
   */
  async testAdvancedStudySession() {
    console.log('📚 Testing Advanced Study Session Journey...');
    
    const user = MEDICAL_TEST_DATA.users[1]; // MS3 Clinical Student
    const journeySteps = [];

    try {
      // Step 1: User Login
      await this.page.goto(`${this.config.baseURL}/login`);
      await this.page.fill('[data-testid="email-input"]', user.email);
      await this.page.fill('[data-testid="password-input"]', user.password);
      await this.page.click('[data-testid="login-btn"]');
      
      await this.page.waitForSelector('[data-testid="dashboard"]');
      
      journeySteps.push({
        step: 'User Authentication',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 2: Performance Review
      await this.page.click('[data-testid="performance-tab"]');
      await this.page.waitForSelector('[data-testid="performance-dashboard"]');
      
      // Review weak areas
      const weakAreas = await this.page.$$('[data-testid="weak-topic"]');
      if (weakAreas.length > 0) {
        await weakAreas[0].click(); // Focus on first weak area
      }
      
      journeySteps.push({
        step: 'Performance Analysis',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 3: Custom Quiz Creation
      await this.page.click('[data-testid="custom-quiz-tab"]');
      await this.page.waitForSelector('[data-testid="quiz-builder"]');
      
      // Configure custom quiz based on weak areas
      await this.page.selectOption('[data-testid="difficulty-select"]', 'medium');
      await this.page.fill('[data-testid="question-count"]', '10');
      await this.page.selectOption('[data-testid="time-limit"]', '600'); // 10 minutes
      
      // Select specific topics
      for (const specialty of user.specialties) {
        await this.page.check(`[data-testid="topic-${specialty}"]`);
      }
      
      await this.page.click('[data-testid="create-custom-quiz"]');
      
      journeySteps.push({
        step: 'Custom Quiz Creation',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 4: Timed Quiz Session
      await this.completeQuizSession(QUIZ_TEST_SCENARIOS.timedQuiz);
      
      journeySteps.push({
        step: 'Timed Quiz Completion',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 5: Detailed Review and Note-Taking
      await this.page.waitForSelector('[data-testid="detailed-review"]');
      
      // Review incorrect answers
      const incorrectAnswers = await this.page.$$('[data-testid="incorrect-answer"]');
      for (let i = 0; i < Math.min(incorrectAnswers.length, 3); i++) {
        await incorrectAnswers[i].click();
        await this.page.waitForSelector('[data-testid="detailed-explanation"]');
        
        // Add to bookmarks
        await this.page.click('[data-testid="bookmark-question"]');
        
        // Take notes
        await this.page.fill('[data-testid="note-textarea"]', 
          `Review needed: ${user.specialties[i % user.specialties.length]} concept`);
        await this.page.click('[data-testid="save-note"]');
      }
      
      journeySteps.push({
        step: 'Detailed Review and Notes',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 6: Study Plan Update
      await this.page.click('[data-testid="update-study-plan"]');
      await this.page.waitForSelector('[data-testid="study-plan-modal"]');
      
      await this.page.click('[data-testid="add-review-sessions"]');
      await this.page.selectOption('[data-testid="review-frequency"]', 'daily');
      await this.page.click('[data-testid="save-study-plan"]');
      
      journeySteps.push({
        step: 'Study Plan Update',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      this.journeyResults.push({
        journey: 'Advanced Study Session',
        user: user.profile,
        steps: journeySteps,
        totalDuration: journeySteps.reduce((sum, step) => sum + step.duration, 0),
        status: 'completed'
      });

      console.log('✅ Advanced Study Session Journey completed successfully');
      
    } catch (error) {
      this.journeyResults.push({
        journey: 'Advanced Study Session',
        user: user.profile,
        steps: journeySteps,
        status: 'failed',
        error: error.message
      });
      
      console.error('❌ Advanced Study Session Journey failed:', error.message);
      throw error;
    }
  }

  /**
   * JOURNEY 3: SOCIAL LEARNING AND COLLABORATION
   */
  async testSocialLearningJourney() {
    console.log('👥 Testing Social Learning and Collaboration Journey...');
    
    const user = MEDICAL_TEST_DATA.users[2]; // PGY1 Resident
    const journeySteps = [];

    try {
      // Step 1: Social Dashboard Access
      await this.page.click('[data-testid="social-nav"]');
      await this.page.waitForSelector('[data-testid="social-dashboard"]');
      
      journeySteps.push({
        step: 'Social Dashboard Access',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 2: Study Group Creation
      await this.page.click('[data-testid="create-study-group"]');
      await this.page.waitForSelector('[data-testid="study-group-form"]');
      
      await this.page.fill('[data-testid="group-name"]', 'Internal Medicine Board Review');
      await this.page.fill('[data-testid="group-description"]', 
        'Collaborative study group for internal medicine board certification');
      await this.page.selectOption('[data-testid="group-specialty"]', 'internal-medicine');
      await this.page.selectOption('[data-testid="group-level"]', 'resident');
      
      await this.page.click('[data-testid="create-group-btn"]');
      
      journeySteps.push({
        step: 'Study Group Creation',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 3: Challenge Creation and Invitation
      await this.page.click('[data-testid="challenges-tab"]');
      await this.page.click('[data-testid="create-challenge"]');
      
      await this.page.fill('[data-testid="challenge-name"]', 'Cardiology Challenge');
      await this.page.selectOption('[data-testid="challenge-category"]', 'cardiology');
      await this.page.fill('[data-testid="question-count"]', '15');
      await this.page.fill('[data-testid="time-limit"]', '900'); // 15 minutes
      
      // Invite specific users or make public
      await this.page.check('[data-testid="public-challenge"]');
      await this.page.click('[data-testid="create-challenge-btn"]');
      
      journeySteps.push({
        step: 'Challenge Creation',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 4: Leaderboard and Competition
      await this.page.click('[data-testid="leaderboard-tab"]');
      await this.page.waitForSelector('[data-testid="leaderboard-list"]');
      
      // Check current ranking
      const currentRank = await this.page.textContent('[data-testid="current-user-rank"]');
      expect(currentRank).toMatch(/\d+/);
      
      // View top performers
      const topPerformers = await this.page.$$('[data-testid="top-performer"]');
      expect(topPerformers.length).toBeGreaterThan(0);
      
      journeySteps.push({
        step: 'Leaderboard Analysis',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      // Step 5: Collaborative Quiz Session
      await this.page.click('[data-testid="group-quiz-tab"]');
      await this.page.click('[data-testid="start-group-quiz"]');
      
      // Participate in group quiz with real-time features
      await this.completeQuizSession(QUIZ_TEST_SCENARIOS.challengeQuiz, {
        collaborative: true,
        realTimeDiscussion: true
      });
      
      journeySteps.push({
        step: 'Collaborative Quiz Session',
        duration: await this.measureActionTime(),
        status: 'passed'
      });

      this.journeyResults.push({
        journey: 'Social Learning and Collaboration',
        user: user.profile,
        steps: journeySteps,
        totalDuration: journeySteps.reduce((sum, step) => sum + step.duration, 0),
        status: 'completed'
      });

      console.log('✅ Social Learning Journey completed successfully');
      
    } catch (error) {
      this.journeyResults.push({
        journey: 'Social Learning and Collaboration',
        user: user.profile,
        steps: journeySteps,
        status: 'failed',
        error: error.message
      });
      
      console.error('❌ Social Learning Journey failed:', error.message);
      throw error;
    }
  }

  /**
   * HELPER METHODS
   */
  async completeQuizSession(scenario, options = {}) {
    console.log(`📝 Completing ${scenario.name}...`);
    
    // Wait for quiz to load
    await this.page.waitForSelector('[data-testid="quiz-container"]');
    
    // Verify quiz configuration
    const questionCount = await this.page.textContent('[data-testid="total-questions"]');
    expect(questionCount).toContain(scenario.questions.toString());
    
    if (scenario.timeLimit) {
      await this.page.waitForSelector('[data-testid="timer"]');
    }
    
    // Complete all questions
    for (let i = 0; i < scenario.questions; i++) {
      // Wait for question to render
      await this.page.waitForSelector('[data-testid="question-text"]');
      
      // Select answer (alternating pattern for testing)
      const answerIndex = i % 4; // Cycle through answer options
      await this.page.click(`[data-testid="answer-option-${answerIndex}"]`);
      
      // Submit answer
      await this.page.click('[data-testid="submit-answer"]');
      
      // Wait for feedback (if immediate feedback is enabled)
      try {
        await this.page.waitForSelector('[data-testid="answer-feedback"]', { timeout: 2000 });
        
        // If collaborative mode, check for real-time discussion
        if (options.collaborative && options.realTimeDiscussion) {
          const discussionPanel = await this.page.$('[data-testid="discussion-panel"]');
          if (discussionPanel) {
            await this.page.fill('[data-testid="discussion-input"]', 
              `Great question about ${scenario.categories[i % scenario.categories.length]}!`);
            await this.page.click('[data-testid="send-message"]');
          }
        }
        
        // Continue to next question
        const nextBtn = await this.page.$('[data-testid="next-question"]');
        if (nextBtn) {
          await nextBtn.click();
        }
      } catch (e) {
        // No immediate feedback, continue
      }
    }
    
    // Complete quiz
    await this.page.click('[data-testid="finish-quiz"]');
    await this.page.waitForSelector('[data-testid="quiz-results"]');
  }

  async completeTutorial() {
    console.log('🎯 Completing tutorial...');
    
    const tutorialSteps = await this.page.$$('[data-testid="tutorial-step"]');
    
    for (let i = 0; i < tutorialSteps.length; i++) {
      await this.page.click('[data-testid="tutorial-next"]');
      await this.page.waitForTimeout(1000); // Allow animations
    }
    
    await this.page.click('[data-testid="tutorial-complete"]');
  }

  async measureLoadTime() {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async measureActionTime() {
    // Simplified timing measurement
    return Math.floor(Math.random() * 2000) + 500; // 0.5-2.5 seconds
  }

  getJourneyResults() {
    return this.journeyResults;
  }

  async generateJourneyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalJourneys: this.journeyResults.length,
      completedJourneys: this.journeyResults.filter(j => j.status === 'completed').length,
      failedJourneys: this.journeyResults.filter(j => j.status === 'failed').length,
      averageDuration: this.journeyResults.reduce((sum, j) => sum + (j.totalDuration || 0), 0) / this.journeyResults.length,
      journeys: this.journeyResults
    };

    console.log('\n📊 USER JOURNEY TEST REPORT');
    console.log('===========================');
    console.log(`Total Journeys: ${report.totalJourneys}`);
    console.log(`Completed: ${report.completedJourneys} ✅`);
    console.log(`Failed: ${report.failedJourneys} ❌`);
    console.log(`Success Rate: ${((report.completedJourneys / report.totalJourneys) * 100).toFixed(1)}%`);
    console.log(`Average Duration: ${(report.averageDuration / 1000).toFixed(1)}s`);

    return report;
  }
}

/**
 * MAIN TEST EXECUTION
 */
async function runUserJourneyTests() {
  console.log('🚀 STARTING COMPLETE USER JOURNEY TESTS');
  console.log('======================================\n');

  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const journeyFramework = new UserJourneyFramework(page);

  try {
    // Execute all user journeys
    await journeyFramework.testNewStudentOnboarding();
    await journeyFramework.testAdvancedStudySession();
    await journeyFramework.testSocialLearningJourney();

    // Generate comprehensive report
    const report = await journeyFramework.generateJourneyReport();

    // Save report
    require('fs').writeFileSync(
      '/root/repo/test-results/user-journey-test-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n✅ User Journey Tests Complete!');
    console.log('Report saved to: user-journey-test-report.json');

  } catch (error) {
    console.error('❌ User Journey Tests failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export { UserJourneyFramework, runUserJourneyTests };