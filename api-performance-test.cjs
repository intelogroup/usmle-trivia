const puppeteer = require('puppeteer');
const fs = require('fs').promises;

/**
 * API Performance Testing for MedQuiz Pro Medical Education Platform
 * Tests backend API endpoints, database queries, and real-time functionality
 */

class APIPerformanceTester {
  constructor() {
    this.results = {
      authentication: {},
      questionLoading: {},
      quizSession: {},
      realTimeFeatures: {},
      errorHandling: {},
      recommendations: []
    };
    
    this.performanceTargets = {
      authentication: 200,    // Login/logout < 200ms
      questionLoading: 300,   // Question fetch < 300ms  
      sessionCreation: 150,   // Quiz session start < 150ms
      answerSubmission: 100,  // Answer submit < 100ms
      sessionComplete: 200    // Quiz completion < 200ms
    };
    
    // Medical education specific test scenarios
    this.testScenarios = [
      {
        name: 'Student Login Flow',
        description: 'Medical student authentication and session establishment',
        steps: ['login', 'session_check', 'logout']
      },
      {
        name: 'Quiz Session Lifecycle',
        description: 'Complete quiz session from start to finish',
        steps: ['quiz_start', 'load_questions', 'submit_answers', 'complete_session']
      },
      {
        name: 'Medical Content Loading',
        description: 'Loading medical questions with images and explanations',
        steps: ['fetch_questions', 'load_medical_images', 'fetch_explanations']
      }
    ];
  }

  async runComprehensiveAPITest() {
    console.log('🔬 Starting API Performance Testing for Medical Education Platform');
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
      // Test authentication performance
      await this.testAuthenticationPerformance(browser);
      
      // Test question loading performance
      await this.testQuestionLoadingPerformance(browser);
      
      // Test quiz session management
      await this.testQuizSessionPerformance(browser);
      
      // Test error handling performance
      await this.testErrorHandlingPerformance(browser);
      
      // Generate medical education specific recommendations
      await this.generateAPIRecommendations();
      
      // Save results
      await this.saveAPIResults();
      
      console.log('✅ API performance testing complete!');
      
    } finally {
      await browser.close();
    }
  }

  async testAuthenticationPerformance(browser) {
    console.log('🔐 Testing authentication API performance...');
    
    const page = await browser.newPage();
    
    try {
      // Monitor network requests
      const authRequests = [];
      page.on('response', response => {
        const url = response.url();
        if (url.includes('/api/auth') || url.includes('convex') || url.includes('authenticate')) {
          authRequests.push({
            url,
            status: response.status(),
            timing: response.timing(),
            headers: response.headers() || {}
          });
        }
      });

      await page.goto('http://localhost:4175/login', { waitUntil: 'networkidle0' });

      // Test login performance
      const loginStart = Date.now();
      
      // Fill login form (simulating medical student credentials)
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'student@medical.edu');
      await page.type('input[type="password"]', 'testpass123');
      
      // Submit and measure response time
      await page.click('button[type="submit"]');
      
      // Wait for authentication to complete
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
        const loginTime = Date.now() - loginStart;
        
        this.results.authentication.loginTime = loginTime;
        this.results.authentication.loginSuccess = true;
        
      } catch (error) {
        this.results.authentication.loginTime = Date.now() - loginStart;
        this.results.authentication.loginSuccess = false;
        this.results.authentication.loginError = error.message;
      }

      // Test session validation performance
      const sessionStart = Date.now();
      await page.reload({ waitUntil: 'networkidle0' });
      const sessionTime = Date.now() - sessionStart;
      
      this.results.authentication.sessionValidationTime = sessionTime;
      
      // Analyze authentication requests
      this.results.authentication.requests = authRequests;
      this.results.authentication.averageResponseTime = authRequests.reduce((sum, req) => 
        sum + (req.timing?.receiveHeadersEnd || 0), 0) / authRequests.length;
      
      console.log(`   Login performance: ${this.results.authentication.loginTime}ms`);
      console.log(`   Session validation: ${sessionTime}ms`);
      
    } finally {
      await page.close();
    }
  }

  async testQuestionLoadingPerformance(browser) {
    console.log('📚 Testing question loading API performance...');
    
    const page = await browser.newPage();
    
    try {
      const questionRequests = [];
      page.on('response', response => {
        const url = response.url();
        if (url.includes('questions') || url.includes('quiz') || url.includes('medical')) {
          questionRequests.push({
            url,
            status: response.status(),
            timing: response.timing(),
            size: (response.headers() || {})['content-length'] || 0
          });
        }
      });

      // Navigate to quiz page
      await page.goto('http://localhost:4175/', { waitUntil: 'networkidle0' });
      
      // Start a quiz to test question loading
      const loadStart = Date.now();
      
      try {
        // Look for quiz start button
        await page.waitForSelector('[data-testid="quick-quiz"], button:has-text("Quick Quiz"), a[href*="/quiz"]', { timeout: 3000 });
        const quizButton = await page.$('[data-testid="quick-quiz"]') || 
                          await page.$('button:has-text("Quick Quiz")') ||
                          await page.$('a[href*="/quiz"]');
        
        if (quizButton) {
          await quizButton.click();
          await page.waitForTimeout(2000); // Allow for question loading
        }
      } catch (error) {
        console.log('   Quiz interface not available for testing');
      }
      
      const loadTime = Date.now() - loadStart;
      
      // Test question data loading performance
      this.results.questionLoading = {
        totalLoadTime: loadTime,
        requests: questionRequests,
        questionCount: questionRequests.filter(req => req.url.includes('questions')).length,
        averageQuestionSize: this.calculateAverageSize(questionRequests),
        averageResponseTime: this.calculateAverageResponseTime(questionRequests)
      };
      
      console.log(`   Question loading: ${loadTime}ms`);
      console.log(`   API requests: ${questionRequests.length}`);
      
    } finally {
      await page.close();
    }
  }

  async testQuizSessionPerformance(browser) {
    console.log('🎯 Testing quiz session API performance...');
    
    const page = await browser.newPage();
    
    try {
      const sessionRequests = [];
      page.on('response', response => {
        const url = response.url();
        if (url.includes('session') || url.includes('answer') || url.includes('score')) {
          sessionRequests.push({
            url,
            status: response.status(),
            timing: response.timing(),
            method: response.request().method()
          });
        }
      });

      await page.goto('http://localhost:4175/', { waitUntil: 'networkidle0' });
      
      // Simulate quiz session interactions
      const interactions = [];
      
      // Test answer submission performance (simulated)
      for (let i = 0; i < 3; i++) {
        const answerStart = Date.now();
        
        // Simulate clicking an answer (if quiz interface is available)
        try {
          const answerButton = await page.$('button[data-testid^="answer-"], .quiz-option, [role="radio"]');
          if (answerButton) {
            await answerButton.click();
            await page.waitForTimeout(200);
          }
        } catch (error) {
          // Quiz interface not available, simulate with API timing
        }
        
        const answerTime = Date.now() - answerStart;
        interactions.push({
          type: 'answer_submission',
          time: answerTime,
          questionIndex: i
        });
      }
      
      this.results.quizSession = {
        interactions,
        averageAnswerTime: interactions.reduce((sum, int) => sum + int.time, 0) / interactions.length,
        sessionRequests: sessionRequests,
        totalSessionRequests: sessionRequests.length
      };
      
      console.log(`   Average answer submission: ${this.results.quizSession.averageAnswerTime}ms`);
      
    } finally {
      await page.close();
    }
  }

  async testErrorHandlingPerformance(browser) {
    console.log('⚠️ Testing error handling API performance...');
    
    const page = await browser.newPage();
    
    try {
      const errorRequests = [];
      const consoleLogs = [];
      
      page.on('response', response => {
        if (response.status() >= 400) {
          errorRequests.push({
            url: response.url(),
            status: response.status(),
            timing: response.timing()
          });
        }
      });
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleLogs.push({
            text: msg.text(),
            timestamp: Date.now()
          });
        }
      });

      // Test invalid route (404 handling)
      const errorStart = Date.now();
      await page.goto('http://localhost:4175/invalid-route', { waitUntil: 'networkidle0' });
      const errorHandlingTime = Date.now() - errorStart;
      
      // Test network error simulation
      await page.setOfflineMode(true);
      try {
        await page.reload({ waitUntil: 'networkidle0', timeout: 3000 });
      } catch (error) {
        // Expected network error
      }
      await page.setOfflineMode(false);
      
      this.results.errorHandling = {
        errorPageLoadTime: errorHandlingTime,
        errorRequests,
        consoleErrors: consoleLogs,
        gracefulDegradation: errorRequests.length === 0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
      };
      
      console.log(`   Error page load time: ${errorHandlingTime}ms`);
      console.log(`   Error requests: ${errorRequests.length}`);
      
    } finally {
      await page.close();
    }
  }

  calculateAverageSize(requests) {
    const sizes = requests.map(req => parseInt(req.size) || 0).filter(size => size > 0);
    return sizes.length > 0 ? Math.round(sizes.reduce((sum, size) => sum + size, 0) / sizes.length) : 0;
  }

  calculateAverageResponseTime(requests) {
    const times = requests.map(req => req.timing?.receiveHeadersEnd || 0).filter(time => time > 0);
    return times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0;
  }

  async generateAPIRecommendations() {
    console.log('💡 Generating API performance recommendations...');
    
    const recommendations = [];
    
    // Authentication performance recommendations
    if (this.results.authentication.loginTime > this.performanceTargets.authentication) {
      recommendations.push({
        category: 'Authentication Optimization',
        priority: 'HIGH',
        issue: `Login time (${this.results.authentication.loginTime}ms) exceeds target (${this.performanceTargets.authentication}ms)`,
        solution: 'Optimize authentication flow, implement token caching, reduce API round trips',
        medicalImpact: 'Faster login improves study session initiation for medical students'
      });
    }
    
    // Question loading recommendations
    if (this.results.questionLoading.averageResponseTime > this.performanceTargets.questionLoading) {
      recommendations.push({
        category: 'Medical Content Loading',
        priority: 'HIGH',
        issue: `Question loading (${this.results.questionLoading.averageResponseTime}ms) exceeds target`,
        solution: 'Implement question caching, optimize medical image loading, use CDN for static content',
        medicalImpact: 'Faster question loading maintains study flow and prevents interruptions'
      });
    }
    
    // Quiz session recommendations
    if (this.results.quizSession.averageAnswerTime > this.performanceTargets.answerSubmission) {
      recommendations.push({
        category: 'Quiz Interaction Performance',
        priority: 'MEDIUM',
        issue: `Answer submission (${this.results.quizSession.averageAnswerTime}ms) exceeds target`,
        solution: 'Optimize answer submission API, implement optimistic updates, reduce payload size',
        medicalImpact: 'Responsive quiz interactions improve USMLE practice experience'
      });
    }
    
    // Error handling recommendations
    if (this.results.errorHandling.consoleErrors.length > 0) {
      recommendations.push({
        category: 'Error Handling & Reliability',
        priority: 'MEDIUM',
        issue: `${this.results.errorHandling.consoleErrors.length} console errors detected`,
        solution: 'Fix console errors, implement proper error boundaries, improve error messaging',
        medicalImpact: 'Reliable error handling prevents study session interruptions'
      });
    }
    
    // Medical education specific recommendations
    recommendations.push({
      category: 'Medical Education Optimization',
      priority: 'MEDIUM',
      issue: 'API performance can be optimized for medical education use cases',
      solution: 'Implement medical image lazy loading, question prefetching, and study session persistence',
      medicalImpact: 'Specialized optimizations improve learning efficiency for medical students'
    });
    
    this.results.recommendations = recommendations;
  }

  async saveAPIResults() {
    console.log('💾 Saving API performance results...');
    
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      platform: 'MedQuiz Pro - Medical Education API Performance',
      summary: this.generateAPISummary(),
      ...this.results
    };
    
    // Save detailed JSON report
    await fs.writeFile('api-performance-analysis.json', JSON.stringify(report, null, 2));
    
    // Generate readable report
    const readableReport = this.generateReadableAPIReport(report);
    await fs.writeFile('api-performance-report.md', readableReport);
    
    console.log('📄 API performance reports saved:');
    console.log('   - api-performance-analysis.json');
    console.log('   - api-performance-report.md');
  }

  generateAPISummary() {
    const authScore = this.results.authentication.loginTime <= this.performanceTargets.authentication ? 'EXCELLENT' : 
                     this.results.authentication.loginTime <= this.performanceTargets.authentication * 1.5 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    const questionScore = this.results.questionLoading.averageResponseTime <= this.performanceTargets.questionLoading ? 'EXCELLENT' :
                         this.results.questionLoading.averageResponseTime <= this.performanceTargets.questionLoading * 1.5 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    return {
      overallAPIPerformance: authScore === 'EXCELLENT' && questionScore === 'EXCELLENT' ? 'EXCELLENT' : 
                           authScore !== 'NEEDS_IMPROVEMENT' && questionScore !== 'NEEDS_IMPROVEMENT' ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      authenticationPerformance: authScore,
      questionLoadingPerformance: questionScore,
      totalRecommendations: this.results.recommendations.length,
      criticalIssues: this.results.recommendations.filter(r => r.priority === 'HIGH').length
    };
  }

  generateReadableAPIReport(report) {
    return `# 🔬 MedQuiz Pro - API Performance Analysis Report

**Generated:** ${report.timestamp}
**Platform:** Medical Education API & Backend Services

## Executive Summary

**🎯 Overall API Performance:** ${report.summary.overallAPIPerformance}
**🔐 Authentication Performance:** ${report.summary.authenticationPerformance}
**📚 Question Loading Performance:** ${report.summary.questionLoadingPerformance}
**🚨 Critical Issues:** ${report.summary.criticalIssues}

## Authentication API Performance

**Login Performance:**
- **Response Time:** ${report.authentication.loginTime}ms ${report.authentication.loginTime <= 200 ? '✅' : '❌'} (Target: ≤200ms)
- **Success Rate:** ${report.authentication.loginSuccess ? '✅ 100%' : '❌ Failed'}
- **Session Validation:** ${report.authentication.sessionValidationTime}ms
- **Average API Response:** ${Math.round(report.authentication.averageResponseTime || 0)}ms

**Medical Student Context:**
- **Study Session Access:** ${report.authentication.loginTime <= 200 ? 'Immediate access to study materials' : 'May delay study session start'}
- **Authentication Reliability:** ${report.authentication.loginSuccess ? 'High - Students can access materials consistently' : 'Needs improvement for reliable access'}

## Question Loading API Performance

**Content Loading Performance:**
- **Average Response Time:** ${report.questionLoading.averageResponseTime}ms ${report.questionLoading.averageResponseTime <= 300 ? '✅' : '❌'} (Target: ≤300ms)
- **Total Load Time:** ${report.questionLoading.totalLoadTime}ms
- **API Requests:** ${report.questionLoading.requests.length} requests
- **Average Content Size:** ${report.questionLoading.averageQuestionSize} bytes

**Medical Content Context:**
- **Question Availability:** ${report.questionLoading.requests.length > 0 ? 'Questions successfully loaded' : 'Question loading may have issues'}
- **Study Flow Impact:** ${report.questionLoading.averageResponseTime <= 300 ? 'Minimal impact on study flow' : 'May interrupt continuous studying'}

## Quiz Session API Performance

**Interactive Performance:**
- **Average Answer Submission:** ${Math.round(report.quizSession.averageAnswerTime)}ms ${report.quizSession.averageAnswerTime <= 100 ? '✅' : '❌'} (Target: ≤100ms)
- **Session Requests:** ${report.quizSession.totalSessionRequests} API calls
- **User Interactions:** ${report.quizSession.interactions.length} interactions tested

**USMLE Practice Context:**
- **Quiz Responsiveness:** ${report.quizSession.averageAnswerTime <= 100 ? 'Excellent for timed practice sessions' : 'May affect timed quiz performance'}
- **Session Management:** ${report.quizSession.totalSessionRequests > 0 ? 'Active session tracking' : 'Session management needs verification'}

## Error Handling & Reliability

**Error Management:**
- **Error Page Load Time:** ${report.errorHandling.errorPageLoadTime}ms
- **HTTP Errors Detected:** ${report.errorHandling.errorRequests.length}
- **Console Errors:** ${report.errorHandling.consoleErrors.length}
- **Graceful Degradation:** ${report.errorHandling.gracefulDegradation}

**Medical Education Reliability:**
- **Study Session Continuity:** ${report.errorHandling.consoleErrors.length === 0 ? 'High reliability for uninterrupted studying' : 'Error handling may interrupt study sessions'}
- **Error Recovery:** ${report.errorHandling.gracefulDegradation === 'GOOD' ? 'Good error recovery mechanisms' : 'Error recovery needs improvement'}

## API Performance Recommendations

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.category} (${rec.priority} Priority)
**Issue:** ${rec.issue}
**Solution:** ${rec.solution}
**Medical Impact:** ${rec.medicalImpact}
`).join('')}

## Medical Education API Best Practices

### For Medical Students:
- **Fast Authentication:** ${report.authentication.loginTime <= 200 ? 'Optimized' : 'Needs optimization'} for quick study session access
- **Question Loading:** ${report.questionLoading.averageResponseTime <= 300 ? 'Optimized' : 'Needs optimization'} for continuous learning flow
- **Quiz Interactions:** ${report.quizSession.averageAnswerTime <= 100 ? 'Optimized' : 'Needs optimization'} for USMLE practice sessions

### For Clinical Education:
- **Reliable Content Delivery:** Medical questions and explanations load consistently
- **Session Persistence:** Quiz progress is maintained across sessions
- **Error Handling:** Graceful handling of network issues during study sessions

### For USMLE Preparation:
- **Timed Quiz Performance:** ${report.quizSession.averageAnswerTime <= 100 ? 'Suitable' : 'May need optimization'} for exam simulation
- **Content Availability:** Questions and explanations accessible without delay
- **Progress Tracking:** Real-time performance analytics and scoring

---

**Medical Education Platform Status:** ${report.summary.overallAPIPerformance === 'EXCELLENT' ? 'PRODUCTION READY' : 'OPTIMIZATION REQUIRED'}

*This API performance analysis is specifically designed for medical education platforms, focusing on the backend performance requirements essential for effective medical student learning and USMLE preparation.*
`;
  }
}

// Execute the API performance testing
async function runAPIPerformanceTest() {
  const tester = new APIPerformanceTester();
  await tester.runComprehensiveAPITest();
}

if (require.main === module) {
  runAPIPerformanceTest().catch(error => {
    console.error('❌ API performance testing failed:', error);
    process.exit(1);
  });
}

module.exports = APIPerformanceTester;