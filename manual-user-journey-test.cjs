/**
 * MANUAL USER JOURNEY TESTING FOR MEDQUIZ PRO
 * Medical Education Platform - Critical User Journey Analysis
 * 
 * This script performs comprehensive testing of user journeys by analyzing
 * the application's HTML structure, functionality, and user experience
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const RESULTS_FILE = './manual-user-journey-results.json';

class MedicalStudentJourneyAnalyzer {
  constructor() {
    this.results = {
      testStartTime: new Date().toISOString(),
      scenarios: {},
      performance: {},
      usabilityFindings: [],
      bugs: [],
      recommendations: [],
      summary: {}
    };
  }

  async fetchPage(path = '/') {
    return new Promise((resolve, reject) => {
      const url = `${BASE_URL}${path}`;
      const startTime = Date.now();
      
      console.log(`📊 Fetching: ${url}`);
      
      http.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const loadTime = Date.now() - startTime;
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            html: data,
            loadTime,
            url
          });
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  analyzeHtmlStructure(html) {
    const analysis = {
      hasTitle: /<title[^>]*>([^<]+)<\/title>/i.test(html),
      hasMetaDescription: /<meta[^>]*name=['""]description['""][^>]*>/i.test(html),
      hasMetaViewport: /<meta[^>]*name=['""]viewport['""][^>]*>/i.test(html),
      
      // Navigation elements
      hasNav: /<nav[^>]*>/i.test(html) || /class=['""][^'"]*nav/i.test(html),
      hasMenu: /menu/i.test(html),
      hasHamburgerMenu: /hamburger|menu-toggle|mobile-menu/i.test(html),
      
      // Form elements
      hasEmailInput: /<input[^>]*type=['""]email['""][^>]*>/i.test(html),
      hasPasswordInput: /<input[^>]*type=['""]password['""][^>]*>/i.test(html),
      hasSearchInput: /<input[^>]*type=['""]search['""][^>]*>/i.test(html) || 
                      /<input[^>]*placeholder[^>]*search/i.test(html),
      
      // Interactive elements
      hasButtons: /<button[^>]*>/i.test(html),
      buttonCount: (html.match(/<button[^>]*>/gi) || []).length,
      hasLinks: /<a[^>]*href/i.test(html),
      linkCount: (html.match(/<a[^>]*href/gi) || []).length,
      
      // Medical/Quiz specific elements
      hasMedicalContent: /usmle|medical|quiz|question|anatomy|physiology|pathology|pharmacology/i.test(html),
      hasQuizElements: /quiz|question|answer|score|result/i.test(html),
      hasProgressIndicators: /progress|score|accuracy|streak/i.test(html),
      
      // Accessibility
      hasAriaLabels: /aria-label/i.test(html),
      hasRoles: /role=/i.test(html),
      hasAltTags: /<img[^>]*alt=/i.test(html),
      
      // Responsive design indicators
      hasBootstrap: /bootstrap/i.test(html),
      hasTailwind: /tailwind/i.test(html),
      hasResponsiveClasses: /sm:|md:|lg:|xl:|2xl:|container|grid|flex/i.test(html),
      
      // Error handling
      hasErrorMessages: /error|warning|alert/i.test(html),
      has404Elements: /404|not found|page not found/i.test(html),
      
      // Performance
      hasLazyLoading: /loading=['""]lazy['""]|lazy/i.test(html),
      hasPreload: /<link[^>]*rel=['""]preload['""][^>]*>/i.test(html),
      
      // Content quality
      textLength: html.replace(/<[^>]*>/g, '').length,
      headingCount: (html.match(/<h[1-6][^>]*>/gi) || []).length
    };
    
    return analysis;
  }

  extractInteractiveElements(html) {
    const elements = {
      buttons: [],
      links: [],
      inputs: [],
      quizElements: []
    };
    
    // Extract button information
    const buttonRegex = /<button[^>]*>(.*?)<\/button>/gi;
    let buttonMatch;
    while ((buttonMatch = buttonRegex.exec(html)) !== null) {
      elements.buttons.push({
        text: buttonMatch[1].replace(/<[^>]*>/g, '').trim(),
        fullTag: buttonMatch[0]
      });
    }
    
    // Extract link information
    const linkRegex = /<a[^>]*href=['""]([^'"]*)['""][^>]*>(.*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      elements.links.push({
        href: linkMatch[1],
        text: linkMatch[2].replace(/<[^>]*>/g, '').trim(),
        fullTag: linkMatch[0]
      });
    }
    
    // Extract input information
    const inputRegex = /<input[^>]*>/gi;
    let inputMatch;
    while ((inputMatch = inputRegex.exec(html)) !== null) {
      const input = inputMatch[0];
      const type = input.match(/type=['""]([^'"]*)['""]/) || ['', 'text'];
      const placeholder = input.match(/placeholder=['""]([^'"]*)['""]/) || ['', ''];
      
      elements.inputs.push({
        type: type[1],
        placeholder: placeholder[1],
        fullTag: input
      });
    }
    
    return elements;
  }

  async testScenario1_LandingPageAnalysis() {
    console.log('\n🎯 SCENARIO 1: Landing Page Analysis');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Landing Page Analysis',
      success: false,
      issues: [],
      findings: {},
      loadTime: 0
    };

    try {
      const response = await this.fetchPage('/');
      scenario.loadTime = response.loadTime;
      
      console.log(`✅ Page loaded in ${response.loadTime}ms`);
      
      if (response.statusCode !== 200) {
        scenario.issues.push(`HTTP ${response.statusCode} - Expected 200`);
        return scenario;
      }
      
      const structure = this.analyzeHtmlStructure(response.html);
      const elements = this.extractInteractiveElements(response.html);
      
      scenario.findings = {
        structure,
        elements,
        contentLength: response.html.length
      };
      
      // Usability analysis
      if (!structure.hasTitle) {
        scenario.issues.push('Missing page title - bad for SEO and accessibility');
      }
      
      if (!structure.hasMetaDescription) {
        scenario.issues.push('Missing meta description - impacts search rankings');
      }
      
      if (!structure.hasMetaViewport) {
        scenario.issues.push('Missing viewport meta tag - mobile experience may be poor');
      }
      
      if (scenario.loadTime > 5000) {
        scenario.issues.push(`Slow load time (${scenario.loadTime}ms) - should be under 3 seconds`);
      }
      
      if (elements.buttons.length === 0) {
        scenario.issues.push('No interactive buttons found - users cannot take action');
      }
      
      if (!structure.hasMedicalContent) {
        scenario.issues.push('No medical/USMLE content detected - may not be medical education focused');
      }
      
      // Success criteria
      scenario.success = response.statusCode === 200 && 
                        structure.hasTitle && 
                        elements.buttons.length > 0 &&
                        scenario.loadTime < 10000;
      
      console.log(`📊 Analysis complete:`);
      console.log(`   • Buttons found: ${elements.buttons.length}`);
      console.log(`   • Links found: ${elements.links.length}`);
      console.log(`   • Inputs found: ${elements.inputs.length}`);
      console.log(`   • Medical content: ${structure.hasMedicalContent ? 'Yes' : 'No'}`);
      console.log(`   • Issues found: ${scenario.issues.length}`);
      
    } catch (error) {
      scenario.issues.push(`Failed to load page: ${error.message}`);
      scenario.success = false;
    }

    this.results.scenarios.landingPageAnalysis = scenario;
    return scenario;
  }

  async testScenario2_NavigationStructure() {
    console.log('\n🧭 SCENARIO 2: Navigation Structure Analysis');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Navigation Structure',
      success: false,
      issues: [],
      findings: {},
      routes: []
    };

    try {
      const response = await this.fetchPage('/');
      const elements = this.extractInteractiveElements(response.html);
      
      // Analyze navigation elements
      const navElements = elements.links.filter(link => 
        link.href.startsWith('/') || 
        link.href.includes('localhost') ||
        link.text.toLowerCase().includes('quiz') ||
        link.text.toLowerCase().includes('login') ||
        link.text.toLowerCase().includes('register') ||
        link.text.toLowerCase().includes('dashboard')
      );
      
      scenario.findings.navigationLinks = navElements;
      scenario.routes = navElements.map(link => link.href);
      
      console.log(`📋 Found ${navElements.length} navigation links:`);
      navElements.forEach(link => {
        console.log(`   • ${link.text} → ${link.href}`);
      });
      
      // Test common routes
      const commonRoutes = ['/login', '/register', '/dashboard', '/quiz'];
      
      for (const route of commonRoutes) {
        console.log(`Testing route: ${route}`);
        try {
          const routeResponse = await this.fetchPage(route);
          console.log(`   ✅ ${route} - HTTP ${routeResponse.statusCode} (${routeResponse.loadTime}ms)`);
          
          if (routeResponse.statusCode >= 400) {
            scenario.issues.push(`Route ${route} returns HTTP ${routeResponse.statusCode}`);
          }
        } catch (error) {
          console.log(`   ❌ ${route} - Failed: ${error.message}`);
          scenario.issues.push(`Route ${route} failed to load`);
        }
      }
      
      // Navigation usability checks
      if (navElements.length < 2) {
        scenario.issues.push('Very few navigation options - users may get stuck');
      }
      
      const hasAuthLinks = navElements.some(link => 
        link.text.toLowerCase().includes('login') || 
        link.text.toLowerCase().includes('sign')
      );
      
      if (!hasAuthLinks) {
        scenario.issues.push('No clear authentication links found');
      }
      
      scenario.success = navElements.length >= 2 && scenario.issues.length < 3;
      
    } catch (error) {
      scenario.issues.push(`Navigation analysis failed: ${error.message}`);
    }

    this.results.scenarios.navigationStructure = scenario;
    return scenario;
  }

  async testScenario3_AuthenticationFlow() {
    console.log('\n🔐 SCENARIO 3: Authentication Flow Analysis');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Authentication Flow',
      success: false,
      issues: [],
      findings: {}
    };

    try {
      // Test login page
      const loginResponse = await this.fetchPage('/login');
      const loginStructure = this.analyzeHtmlStructure(loginResponse.html);
      const loginElements = this.extractInteractiveElements(loginResponse.html);
      
      console.log(`📊 Login page analysis:`);
      console.log(`   • Status: HTTP ${loginResponse.statusCode}`);
      console.log(`   • Load time: ${loginResponse.loadTime}ms`);
      console.log(`   • Has email input: ${loginStructure.hasEmailInput}`);
      console.log(`   • Has password input: ${loginStructure.hasPasswordInput}`);
      console.log(`   • Buttons: ${loginElements.buttons.length}`);
      
      scenario.findings.login = {
        status: loginResponse.statusCode,
        loadTime: loginResponse.loadTime,
        hasForm: loginStructure.hasEmailInput && loginStructure.hasPasswordInput,
        buttons: loginElements.buttons.map(b => b.text),
        inputs: loginElements.inputs
      };
      
      // Test register page
      try {
        const registerResponse = await this.fetchPage('/register');
        const registerStructure = this.analyzeHtmlStructure(registerResponse.html);
        const registerElements = this.extractInteractiveElements(registerResponse.html);
        
        console.log(`📊 Register page analysis:`);
        console.log(`   • Status: HTTP ${registerResponse.statusCode}`);
        console.log(`   • Load time: ${registerResponse.loadTime}ms`);
        console.log(`   • Buttons: ${registerElements.buttons.length}`);
        
        scenario.findings.register = {
          status: registerResponse.statusCode,
          loadTime: registerResponse.loadTime,
          hasForm: registerStructure.hasEmailInput,
          buttons: registerElements.buttons.map(b => b.text)
        };
        
      } catch (error) {
        console.log(`⚠️  Register page not accessible: ${error.message}`);
      }
      
      // Authentication flow usability checks
      if (loginResponse.statusCode !== 200) {
        scenario.issues.push(`Login page not accessible (HTTP ${loginResponse.statusCode})`);
      }
      
      if (!loginStructure.hasEmailInput) {
        scenario.issues.push('No email input found on login page');
      }
      
      if (!loginStructure.hasPasswordInput) {
        scenario.issues.push('No password input found on login page');
      }
      
      if (loginElements.buttons.length === 0) {
        scenario.issues.push('No submit button found on login page');
      }
      
      if (loginResponse.loadTime > 3000) {
        scenario.issues.push(`Login page slow to load (${loginResponse.loadTime}ms)`);
      }
      
      // Success criteria for authentication flow
      scenario.success = loginResponse.statusCode === 200 &&
                        loginStructure.hasEmailInput &&
                        loginStructure.hasPasswordInput &&
                        loginElements.buttons.length > 0;
      
    } catch (error) {
      scenario.issues.push(`Authentication flow analysis failed: ${error.message}`);
    }

    this.results.scenarios.authenticationFlow = scenario;
    return scenario;
  }

  async testScenario4_QuizFunctionality() {
    console.log('\n📚 SCENARIO 4: Quiz Functionality Analysis');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Quiz Functionality',
      success: false,
      issues: [],
      findings: {}
    };

    try {
      // Test quiz page
      const quizResponse = await this.fetchPage('/quiz');
      const quizStructure = this.analyzeHtmlStructure(quizResponse.html);
      const quizElements = this.extractInteractiveElements(quizResponse.html);
      
      console.log(`📊 Quiz page analysis:`);
      console.log(`   • Status: HTTP ${quizResponse.statusCode}`);
      console.log(`   • Load time: ${quizResponse.loadTime}ms`);
      console.log(`   • Has quiz elements: ${quizStructure.hasQuizElements}`);
      console.log(`   • Has medical content: ${quizStructure.hasMedicalContent}`);
      console.log(`   • Buttons: ${quizElements.buttons.length}`);
      
      scenario.findings = {
        status: quizResponse.statusCode,
        loadTime: quizResponse.loadTime,
        hasQuizElements: quizStructure.hasQuizElements,
        hasMedicalContent: quizStructure.hasMedicalContent,
        buttons: quizElements.buttons.map(b => b.text),
        medicalTermsFound: this.findMedicalTerms(quizResponse.html)
      };
      
      // Quiz functionality checks
      if (quizResponse.statusCode !== 200) {
        scenario.issues.push(`Quiz page not accessible (HTTP ${quizResponse.statusCode})`);
      }
      
      if (!quizStructure.hasQuizElements) {
        scenario.issues.push('No quiz-specific elements detected');
      }
      
      if (!quizStructure.hasMedicalContent) {
        scenario.issues.push('No medical content detected - not suitable for USMLE prep');
      }
      
      if (quizElements.buttons.length < 2) {
        scenario.issues.push('Insufficient interactive elements for quiz functionality');
      }
      
      if (quizResponse.loadTime > 4000) {
        scenario.issues.push(`Quiz page slow to load (${quizResponse.loadTime}ms) - affects study experience`);
      }
      
      scenario.success = quizResponse.statusCode === 200 &&
                        quizStructure.hasQuizElements &&
                        quizElements.buttons.length >= 2;
      
    } catch (error) {
      scenario.issues.push(`Quiz functionality analysis failed: ${error.message}`);
    }

    this.results.scenarios.quizFunctionality = scenario;
    return scenario;
  }

  async testScenario5_MobileResponsiveness() {
    console.log('\n📱 SCENARIO 5: Mobile Responsiveness Analysis');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Mobile Responsiveness',
      success: false,
      issues: [],
      findings: {}
    };

    try {
      const response = await this.fetchPage('/');
      const structure = this.analyzeHtmlStructure(response.html);
      
      scenario.findings = {
        hasViewportMeta: structure.hasMetaViewport,
        hasResponsiveClasses: structure.hasResponsiveClasses,
        hasBootstrap: structure.hasBootstrap,
        hasTailwind: structure.hasTailwind,
        hasHamburgerMenu: structure.hasHamburgerMenu
      };
      
      console.log(`📱 Mobile responsiveness indicators:`);
      console.log(`   • Viewport meta tag: ${structure.hasMetaViewport ? '✅' : '❌'}`);
      console.log(`   • Responsive classes: ${structure.hasResponsiveClasses ? '✅' : '❌'}`);
      console.log(`   • CSS framework: ${structure.hasTailwind ? 'Tailwind' : structure.hasBootstrap ? 'Bootstrap' : 'Custom'}`);
      console.log(`   • Mobile menu: ${structure.hasHamburgerMenu ? '✅' : '❌'}`);
      
      // Mobile responsiveness checks
      if (!structure.hasMetaViewport) {
        scenario.issues.push('Missing viewport meta tag - mobile rendering will be poor');
      }
      
      if (!structure.hasResponsiveClasses && !structure.hasBootstrap && !structure.hasTailwind) {
        scenario.issues.push('No responsive design framework detected');
      }
      
      if (!structure.hasHamburgerMenu) {
        scenario.issues.push('No mobile menu system detected - navigation may be difficult on mobile');
      }
      
      scenario.success = structure.hasMetaViewport && 
                        (structure.hasResponsiveClasses || structure.hasBootstrap || structure.hasTailwind);
      
    } catch (error) {
      scenario.issues.push(`Mobile analysis failed: ${error.message}`);
    }

    this.results.scenarios.mobileResponsiveness = scenario;
    return scenario;
  }

  findMedicalTerms(html) {
    const medicalTerms = [
      'usmle', 'step 1', 'step 2', 'step 3',
      'anatomy', 'physiology', 'pathology', 'pharmacology',
      'cardiology', 'neurology', 'endocrine', 'respiratory',
      'diagnosis', 'treatment', 'clinical', 'patient',
      'medical', 'medicine', 'doctor', 'physician',
      'symptoms', 'disease', 'syndrome', 'disorder'
    ];
    
    const foundTerms = [];
    const lowerHtml = html.toLowerCase();
    
    medicalTerms.forEach(term => {
      if (lowerHtml.includes(term)) {
        foundTerms.push(term);
      }
    });
    
    return foundTerms;
  }

  async testScenario6_PerformanceAnalysis() {
    console.log('\n⚡ SCENARIO 6: Performance Analysis');
    console.log('-'.repeat(50));
    
    const scenario = {
      name: 'Performance Analysis',
      success: false,
      issues: [],
      findings: {}
    };

    try {
      const testRoutes = ['/', '/login', '/register', '/quiz', '/dashboard'];
      const performanceData = {};
      
      for (const route of testRoutes) {
        try {
          const response = await this.fetchPage(route);
          performanceData[route] = {
            loadTime: response.loadTime,
            status: response.statusCode,
            size: response.html.length
          };
          
          console.log(`⚡ ${route}: ${response.loadTime}ms (${Math.round(response.html.length/1024)}KB)`);
          
          if (response.loadTime > 3000) {
            scenario.issues.push(`${route} loads slowly (${response.loadTime}ms)`);
          }
          
        } catch (error) {
          console.log(`❌ ${route}: Failed to load`);
          performanceData[route] = { error: error.message };
        }
      }
      
      scenario.findings = performanceData;
      
      // Calculate average load time
      const loadTimes = Object.values(performanceData)
        .filter(data => data.loadTime)
        .map(data => data.loadTime);
      
      const avgLoadTime = loadTimes.length > 0 ? 
        Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length) : 0;
      
      console.log(`📊 Average load time: ${avgLoadTime}ms`);
      
      if (avgLoadTime > 2000) {
        scenario.issues.push(`Average load time (${avgLoadTime}ms) exceeds 2s target for medical study app`);
      }
      
      scenario.success = avgLoadTime < 3000 && scenario.issues.length < 3;
      
    } catch (error) {
      scenario.issues.push(`Performance analysis failed: ${error.message}`);
    }

    this.results.scenarios.performanceAnalysis = scenario;
    return scenario;
  }

  generateUsabilityRecommendations() {
    console.log('\n💡 GENERATING USABILITY RECOMMENDATIONS');
    console.log('-'.repeat(50));
    
    const recommendations = [];
    
    // Collect all issues from scenarios
    const allIssues = [];
    Object.values(this.results.scenarios).forEach(scenario => {
      allIssues.push(...(scenario.issues || []));
    });
    
    // Performance recommendations
    const performanceIssues = allIssues.filter(issue => 
      issue.includes('slow') || issue.includes('load time')
    );
    
    if (performanceIssues.length > 0) {
      recommendations.push({
        category: 'Performance',
        priority: 'High',
        recommendation: 'Optimize page load times to under 2 seconds for better study experience',
        impact: 'Medical students need fast access to study materials'
      });
    }
    
    // Mobile recommendations
    const mobileIssues = allIssues.filter(issue => 
      issue.includes('mobile') || issue.includes('viewport') || issue.includes('responsive')
    );
    
    if (mobileIssues.length > 0) {
      recommendations.push({
        category: 'Mobile Experience',
        priority: 'High',
        recommendation: 'Implement proper mobile responsiveness with viewport meta tags and touch-friendly interface',
        impact: 'Medical students study on mobile devices between classes and clinical rotations'
      });
    }
    
    // Authentication recommendations
    const authIssues = allIssues.filter(issue => 
      issue.includes('login') || issue.includes('authentication') || issue.includes('password')
    );
    
    if (authIssues.length > 0) {
      recommendations.push({
        category: 'User Authentication',
        priority: 'High',
        recommendation: 'Ensure robust authentication flow with clear forms and error handling',
        impact: 'Users need secure access to track their USMLE preparation progress'
      });
    }
    
    // Content recommendations
    const contentIssues = allIssues.filter(issue => 
      issue.includes('medical') || issue.includes('USMLE') || issue.includes('quiz')
    );
    
    if (contentIssues.length > 0) {
      recommendations.push({
        category: 'Medical Content',
        priority: 'Critical',
        recommendation: 'Enhance medical terminology and USMLE-specific content visibility',
        impact: 'Platform must clearly serve medical education to be valuable to target users'
      });
    }
    
    // Navigation recommendations
    const navIssues = allIssues.filter(issue => 
      issue.includes('navigation') || issue.includes('menu') || issue.includes('links')
    );
    
    if (navIssues.length > 0) {
      recommendations.push({
        category: 'Navigation',
        priority: 'Medium',
        recommendation: 'Improve navigation structure and user flow between key sections',
        impact: 'Clear navigation helps users focus on studying rather than figuring out the interface'
      });
    }
    
    this.results.recommendations = recommendations;
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.category}`);
      console.log(`   Recommendation: ${rec.recommendation}`);
      console.log(`   Impact: ${rec.impact}\n`);
    });
    
    return recommendations;
  }

  async generateComprehensiveReport() {
    console.log('\n📊 GENERATING COMPREHENSIVE ANALYSIS REPORT');
    console.log('='.repeat(70));
    
    // Calculate summary statistics
    const scenarios = Object.values(this.results.scenarios);
    const totalScenarios = scenarios.length;
    const passedScenarios = scenarios.filter(s => s.success).length;
    const failedScenarios = totalScenarios - passedScenarios;
    
    this.results.summary = {
      totalScenarios,
      passedScenarios,
      failedScenarios,
      successRate: Math.round((passedScenarios / totalScenarios) * 100),
      testEndTime: new Date().toISOString()
    };
    
    // Generate recommendations
    const recommendations = this.generateUsabilityRecommendations();
    
    // Save results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null, 2));
    
    // Print executive summary
    this.printExecutiveSummary();
    
    return this.results;
  }

  printExecutiveSummary() {
    console.log('\n🏆 EXECUTIVE SUMMARY - MEDQUIZ PRO USER JOURNEY ANALYSIS');
    console.log('='.repeat(75));
    
    const summary = this.results.summary;
    
    console.log(`📊 OVERALL RESULTS:`);
    console.log(`   • Test Scenarios: ${summary.totalScenarios}`);
    console.log(`   • Scenarios Passed: ${summary.passedScenarios}`);
    console.log(`   • Scenarios Failed: ${summary.failedScenarios}`);
    console.log(`   • Success Rate: ${summary.successRate}%`);
    
    console.log(`\n🎯 SCENARIO BREAKDOWN:`);
    Object.entries(this.results.scenarios).forEach(([name, scenario]) => {
      const status = scenario.success ? '✅ PASSED' : '❌ FAILED';
      const issueCount = scenario.issues?.length || 0;
      console.log(`   ${status} ${scenario.name} (${issueCount} issues)`);
    });
    
    if (this.results.recommendations.length > 0) {
      console.log(`\n⚠️ PRIORITY RECOMMENDATIONS:`);
      this.results.recommendations
        .filter(rec => rec.priority === 'Critical' || rec.priority === 'High')
        .slice(0, 5)
        .forEach((rec, index) => {
          console.log(`   ${index + 1}. [${rec.priority}] ${rec.recommendation}`);
        });
    }
    
    // Overall assessment
    let assessment = '';
    if (summary.successRate >= 80) {
      assessment = '🏆 EXCELLENT - Platform ready for medical students';
    } else if (summary.successRate >= 60) {
      assessment = '⚠️ GOOD - Some improvements needed for optimal experience';
    } else if (summary.successRate >= 40) {
      assessment = '🔧 NEEDS IMPROVEMENT - Several critical issues to address';
    } else {
      assessment = '❌ REQUIRES MAJOR WORK - Significant issues preventing effective use';
    }
    
    console.log(`\n${assessment}`);
    console.log(`\n📄 Detailed results saved to: ${RESULTS_FILE}`);
    console.log('='.repeat(75));
  }

  async runAllTests() {
    try {
      console.log('🚀 Starting comprehensive user journey analysis...\n');
      
      await this.testScenario1_LandingPageAnalysis();
      await this.testScenario2_NavigationStructure();
      await this.testScenario3_AuthenticationFlow();
      await this.testScenario4_QuizFunctionality();
      await this.testScenario5_MobileResponsiveness();
      await this.testScenario6_PerformanceAnalysis();
      
      await this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Testing suite failed:', error);
    }
  }
}

// Run the comprehensive analysis
if (require.main === module) {
  const analyzer = new MedicalStudentJourneyAnalyzer();
  analyzer.runAllTests().catch(console.error);
}

module.exports = { MedicalStudentJourneyAnalyzer };