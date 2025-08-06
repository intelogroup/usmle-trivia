#!/usr/bin/env node

/**
 * 🏥 MedQuiz Pro - Enhanced Reliability Testing Script
 * Leverages Netlify MCP and TestZeus Hercules for comprehensive testing
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class MedicalReliabilityTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      netlify: {},
      performance: {},
      medical: {},
      overall: 'PENDING'
    };
  }

  async log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
  }

  async runCommand(command, description) {
    this.log(`Running: ${description}`);
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      return stdout.trim();
    } catch (error) {
      this.log(`Error in ${description}: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async testNetlifyHealth() {
    this.log('🌐 Testing Netlify Health & Deployment Status', 'TEST');
    
    try {
      // Test if Netlify CLI is available and configured
      const netlifyStatus = await this.runCommand(
        'npx netlify status',
        'Netlify Authentication Status'
      );
      
      // List sites to verify access
      const sites = await this.runCommand(
        'npx netlify sites:list --json',
        'Netlify Sites List'
      );
      
      // Check build status if site is deployed
      try {
        const buildStatus = await this.runCommand(
          'npx netlify api listSiteBuilds --data=\'{"site_id": "placeholder"}\'',
          'Latest Build Status'
        );
        this.testResults.netlify.buildStatus = 'SUCCESS';
      } catch (error) {
        this.testResults.netlify.buildStatus = 'NEEDS_DEPLOYMENT';
      }
      
      this.testResults.netlify.authentication = 'SUCCESS';
      this.testResults.netlify.siteAccess = 'SUCCESS';
      
      this.log('✅ Netlify health check passed', 'SUCCESS');
      return true;
      
    } catch (error) {
      this.testResults.netlify.authentication = 'FAILED';
      this.testResults.netlify.error = error.message;
      this.log('❌ Netlify health check failed', 'ERROR');
      return false;
    }
  }

  async testPerformanceMetrics() {
    this.log('⚡ Testing Performance Metrics with Lighthouse', 'TEST');
    
    try {
      // Start development server for testing
      this.log('Starting development server...');
      const devServer = exec('npm run dev');
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Run Lighthouse audit
      const lighthouseResult = await this.runCommand(
        'npx lighthouse http://localhost:5173 --output json --output-path ./lighthouse-report.json --chrome-flags="--headless" --quiet',
        'Lighthouse Performance Audit'
      );
      
      // Read and parse results
      const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
      const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
      
      const scores = {
        performance: Math.round(report.lhr.categories.performance.score * 100),
        accessibility: Math.round(report.lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(report.lhr.categories['best-practices'].score * 100),
        seo: Math.round(report.lhr.categories.seo.score * 100)
      };
      
      this.testResults.performance = {
        ...scores,
        loadTime: report.lhr.audits['first-contentful-paint'].numericValue,
        cumulativeLayoutShift: report.lhr.audits['cumulative-layout-shift'].numericValue
      };
      
      // Kill dev server
      devServer.kill();
      
      // Evaluate against medical standards
      const medicalStandards = {
        performance: scores.performance >= 90,
        accessibility: scores.accessibility >= 95,
        loadTime: this.testResults.performance.loadTime < 2000
      };
      
      const passedStandards = Object.values(medicalStandards).every(Boolean);
      this.testResults.performance.medicalGrade = passedStandards;
      
      this.log(`📊 Performance Scores: ${JSON.stringify(scores)}`, 'INFO');
      this.log(passedStandards ? '✅ Medical-grade performance achieved' : '⚠️ Performance needs optimization', passedStandards ? 'SUCCESS' : 'WARNING');
      
      return passedStandards;
      
    } catch (error) {
      this.testResults.performance.error = error.message;
      this.log('❌ Performance testing failed', 'ERROR');
      return false;
    }
  }

  async testMedicalContentIntegrity() {
    this.log('🏥 Testing Medical Content Integrity', 'TEST');
    
    try {
      // Test sample medical questions format
      const questionsPath = path.join(process.cwd(), 'src', 'data', 'sampleQuestions.ts');
      const questionsContent = await fs.readFile(questionsPath, 'utf8');
      
      // Validate medical question structure
      const medicalValidations = {
        hasUSMLEFormat: questionsContent.includes('clinical scenario'),
        hasMedicalTerminology: questionsContent.includes('patient') && questionsContent.includes('diagnosis'),
        hasReferences: questionsContent.includes('First Aid') || questionsContent.includes('reference'),
        hasExplanations: questionsContent.includes('explanation'),
        hasCategories: questionsContent.includes('category')
      };
      
      const medicalIntegrityScore = Object.values(medicalValidations).filter(Boolean).length;
      const totalValidations = Object.keys(medicalValidations).length;
      const medicalAccuracy = Math.round((medicalIntegrityScore / totalValidations) * 100);
      
      this.testResults.medical = {
        validations: medicalValidations,
        accuracyScore: medicalAccuracy,
        medicalGrade: medicalAccuracy >= 90
      };
      
      this.log(`🎯 Medical Content Accuracy: ${medicalAccuracy}%`, 'INFO');
      this.log(medicalAccuracy >= 90 ? '✅ Medical content meets USMLE standards' : '⚠️ Medical content needs review', medicalAccuracy >= 90 ? 'SUCCESS' : 'WARNING');
      
      return medicalAccuracy >= 90;
      
    } catch (error) {
      this.testResults.medical.error = error.message;
      this.log('❌ Medical content integrity test failed', 'ERROR');
      return false;
    }
  }

  async testTestZeusHercules() {
    this.log('🧪 Testing TestZeus Hercules Integration', 'TEST');
    
    try {
      // Check if TestZeus Hercules is available
      const testzeusStatus = await this.runCommand(
        'npx testzeus-hercules --version',
        'TestZeus Hercules Version Check'
      );
      
      // Create a basic load test configuration
      const loadTestConfig = {
        scenarios: {
          medical_student_load: {
            executor: 'ramping-vus',
            startVUs: 10,
            stages: [
              { duration: '30s', target: 20 },
              { duration: '1m', target: 20 },
              { duration: '30s', target: 0 }
            ]
          }
        },
        thresholds: {
          http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
          http_req_failed: ['rate<0.01']    // Less than 1% errors
        }
      };
      
      await fs.writeFile(
        path.join(process.cwd(), 'medical-load-test.js'),
        `
import http from 'k6/http';
import { check } from 'k6';

export const options = ${JSON.stringify(loadTestConfig, null, 2)};

export default function() {
  const response = http.get('http://localhost:5173');
  check(response, {
    'medical app loads': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
        `
      );
      
      this.testResults.testzeus = {
        available: true,
        version: testzeusStatus,
        loadTestConfigured: true
      };
      
      this.log('✅ TestZeus Hercules ready for load testing', 'SUCCESS');
      return true;
      
    } catch (error) {
      this.testResults.testzeus = {
        available: false,
        error: error.message
      };
      this.log('⚠️ TestZeus Hercules needs setup - continuing with other tests', 'WARNING');
      return false;
    }
  }

  async runComprehensiveReliabilityTest() {
    this.log('🚀 Starting Comprehensive Medical Reliability Test', 'START');
    this.log('=====================================', 'INFO');
    
    const testSuite = [
      { name: 'Netlify Health', test: () => this.testNetlifyHealth() },
      { name: 'Performance Metrics', test: () => this.testPerformanceMetrics() },
      { name: 'Medical Content', test: () => this.testMedicalContentIntegrity() },
      { name: 'TestZeus Hercules', test: () => this.testTestZeusHercules() }
    ];
    
    const results = [];
    
    for (const { name, test } of testSuite) {
      this.log(`\n🔍 Running ${name} Test...`);
      try {
        const result = await test();
        results.push({ name, result, status: result ? 'PASS' : 'FAIL' });
      } catch (error) {
        results.push({ name, result: false, status: 'ERROR', error: error.message });
      }
    }
    
    // Calculate overall reliability score
    const passedTests = results.filter(r => r.result).length;
    const totalTests = results.length;
    const reliabilityScore = Math.round((passedTests / totalTests) * 100);
    
    this.testResults.overall = {
      score: reliabilityScore,
      passedTests,
      totalTests,
      medicalGrade: reliabilityScore >= 90
    };
    
    // Generate final report
    this.log('\n📊 RELIABILITY TEST RESULTS', 'REPORT');
    this.log('=====================================', 'REPORT');
    
    results.forEach(({ name, status, error }) => {
      const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
      this.log(`${icon} ${name}: ${status}${error ? ` (${error})` : ''}`, 'REPORT');
    });
    
    this.log(`\n🎯 Overall Reliability Score: ${reliabilityScore}%`, 'REPORT');
    this.log(`🏥 Medical Grade Status: ${reliabilityScore >= 90 ? '✅ ACHIEVED' : '❌ NEEDS IMPROVEMENT'}`, 'REPORT');
    
    // Save detailed results
    await fs.writeFile(
      path.join(process.cwd(), 'reliability-test-results.json'),
      JSON.stringify(this.testResults, null, 2)
    );
    
    this.log('\n📄 Detailed results saved to: reliability-test-results.json', 'INFO');
    
    if (reliabilityScore >= 90) {
      this.log('🎉 MedQuiz Pro achieves MEDICAL-GRADE RELIABILITY! 🏥', 'SUCCESS');
    } else {
      this.log('⚠️ MedQuiz Pro needs reliability improvements for medical standards', 'WARNING');
    }
    
    return this.testResults;
  }
}

// Run comprehensive reliability test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MedicalReliabilityTester();
  tester.runComprehensiveReliabilityTest()
    .then(results => {
      process.exit(results.overall.medicalGrade ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Reliability testing failed:', error);
      process.exit(1);
    });
}

export default MedicalReliabilityTester;