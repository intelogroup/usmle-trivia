#!/usr/bin/env node

/**
 * 🧪 MedQuiz Pro Authentication - Comprehensive Test Runner
 * 
 * This script orchestrates all authentication testing scenarios
 * and provides detailed reporting on system resilience.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Test configuration
const BASE_URL = 'https://usmle-trivia.netlify.app';
const TEST_RESULTS_DIR = './test-results';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test suite configurations
const testSuites = [
  {
    name: 'Basic Functionality',
    file: 'simple-auth-test.cjs',
    description: 'Core authentication functionality validation',
    priority: 1,
    timeout: 60000,
  },
  {
    name: 'Edge Cases & Real-World Scenarios',
    file: 'auth-edge-case-tests.js',
    description: 'Complex user scenarios and edge case handling',
    priority: 2,
    timeout: 300000, // 5 minutes
  },
  {
    name: 'Stress & Load Testing',
    file: 'auth-stress-tests.js',
    description: 'High-load scenarios and performance validation',
    priority: 3,
    timeout: 600000, // 10 minutes
  },
  {
    name: 'Security Penetration Testing',
    file: 'auth-security-tests.js',
    description: 'Security vulnerability assessment',
    priority: 4,
    timeout: 900000, // 15 minutes
  }
];

// Create test results directory
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  const border = '='.repeat(message.length + 4);
  log(`\n${border}`, colors.cyan);
  log(`  ${message}`, colors.cyan + colors.bright);
  log(`${border}`, colors.cyan);
}

function logSection(message) {
  log(`\n${colors.blue}${colors.bright}🔍 ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

async function checkPrerequisites() {
  logSection('Checking Prerequisites');
  
  // Check if Playwright is installed
  try {
    await runCommand('npx', ['playwright', '--version']);
    logSuccess('Playwright is installed');
  } catch {
    logError('Playwright not found. Installing...');
    await runCommand('npm', ['install', '@playwright/test']);
    await runCommand('npx', ['playwright', 'install']);
  }
  
  // Check if site is accessible
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      logSuccess(`Site is accessible: ${BASE_URL}`);
    } else {
      logWarning(`Site returned status ${response.status}`);
    }
  } catch (error) {
    logError(`Cannot access site: ${error.message}`);
    throw new Error('Site is not accessible');
  }
  
  // Check test files exist
  for (const suite of testSuites) {
    if (fs.existsSync(suite.file)) {
      logSuccess(`Test file found: ${suite.file}`);
    } else {
      logWarning(`Test file missing: ${suite.file}`);
    }
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'pipe',
      ...options
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject({ code, stdout, stderr });
      }
    });
  });
}

async function runTestSuite(suite) {
  logSection(`Running ${suite.name}`);
  log(`📝 ${suite.description}`);
  log(`⏱️  Timeout: ${suite.timeout / 1000} seconds`);
  
  const startTime = Date.now();
  const resultFile = path.join(TEST_RESULTS_DIR, `${suite.name.replace(/\s+/g, '-').toLowerCase()}-${TIMESTAMP}.json`);
  
  try {
    if (!fs.existsSync(suite.file)) {
      logWarning(`Skipping ${suite.name} - test file not found: ${suite.file}`);
      return {
        name: suite.name,
        status: 'skipped',
        reason: 'Test file not found',
        duration: 0
      };
    }
    
    // Run Playwright test
    const result = await runCommand('npx', [
      'playwright', 'test', 
      suite.file,
      '--reporter=json',
      `--output=${resultFile}`,
      '--workers=1',
      `--timeout=${suite.timeout}`
    ]);
    
    const duration = Date.now() - startTime;
    
    logSuccess(`${suite.name} completed in ${(duration / 1000).toFixed(2)}s`);
    
    // Parse results if JSON reporter was used
    let testResults = null;
    try {
      if (fs.existsSync(resultFile)) {
        testResults = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
      }
    } catch (parseError) {
      logWarning('Could not parse test results JSON');
    }
    
    return {
      name: suite.name,
      status: 'passed',
      duration,
      stdout: result.stdout,
      stderr: result.stderr,
      results: testResults
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logError(`${suite.name} failed after ${(duration / 1000).toFixed(2)}s`);
    logError(`Exit code: ${error.code}`);
    
    if (error.stderr) {
      log(`\n${colors.red}STDERR:${colors.reset}`);
      log(error.stderr.substring(0, 2000)); // Limit output
    }
    
    return {
      name: suite.name,
      status: 'failed',
      duration,
      error: error.stderr || error.stdout || 'Unknown error',
      exitCode: error.code
    };
  }
}

async function generateReport(results) {
  logHeader('Test Results Summary');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'passed').length;
  const failedTests = results.filter(r => r.status === 'failed').length;
  const skippedTests = results.filter(r => r.status === 'skipped').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  log(`📊 Total Test Suites: ${totalTests}`);
  log(`${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
  log(`${colors.red}❌ Failed: ${failedTests}${colors.reset}`);
  log(`${colors.yellow}⏭️  Skipped: ${skippedTests}${colors.reset}`);
  log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)} seconds`);
  
  // Detailed results
  logSection('Detailed Results');
  
  for (const result of results) {
    const statusIcon = result.status === 'passed' ? '✅' : 
                      result.status === 'failed' ? '❌' : '⏭️';
    const statusColor = result.status === 'passed' ? colors.green : 
                       result.status === 'failed' ? colors.red : colors.yellow;
    
    log(`\n${statusColor}${statusIcon} ${result.name}${colors.reset}`);
    log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);
    
    if (result.reason) {
      log(`   Reason: ${result.reason}`);
    }
    
    if (result.error) {
      log(`   Error: ${result.error.substring(0, 200)}...`);
    }
  }
  
  // Generate comprehensive report file
  const reportData = {
    timestamp: new Date().toISOString(),
    environment: {
      baseUrl: BASE_URL,
      nodeVersion: process.version,
      platform: process.platform
    },
    summary: {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalDuration,
      successRate: ((passedTests / totalTests) * 100).toFixed(2)
    },
    results
  };
  
  const reportFile = path.join(TEST_RESULTS_DIR, `comprehensive-report-${TIMESTAMP}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
  
  logSuccess(`Comprehensive report saved: ${reportFile}`);
  
  // Generate recommendations
  logSection('Recommendations');
  
  if (failedTests === 0) {
    logSuccess('🎉 All test suites passed! The authentication system shows excellent resilience.');
  } else {
    logWarning(`${failedTests} test suite(s) failed. Review the detailed results above.`);
  }
  
  if (passedTests / totalTests >= 0.8) {
    logSuccess('✨ Overall system health is excellent (≥80% pass rate)');
  } else if (passedTests / totalTests >= 0.6) {
    logWarning('⚠️ System health is acceptable but needs improvement (60-79% pass rate)');
  } else {
    logError('🚨 System needs significant attention (<60% pass rate)');
  }
  
  return reportData;
}

async function quickHealthCheck() {
  logSection('Quick Health Check');
  
  try {
    // Test basic connectivity
    const response = await fetch(BASE_URL);
    logSuccess(`Site status: ${response.status}`);
    
    // Test login page accessibility
    const loginResponse = await fetch(`${BASE_URL}/login`);
    logSuccess(`Login page status: ${loginResponse.status}`);
    
    // Test registration page accessibility
    const registerResponse = await fetch(`${BASE_URL}/register`);
    logSuccess(`Register page status: ${registerResponse.status}`);
    
    return true;
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function main() {
  const startTime = Date.now();
  
  logHeader('🧪 MedQuiz Pro Authentication - Comprehensive Test Suite');
  log(`🌐 Target: ${BASE_URL}`);
  log(`📅 Started: ${new Date().toLocaleString()}`);
  
  try {
    // Quick health check
    const isHealthy = await quickHealthCheck();
    if (!isHealthy) {
      throw new Error('System health check failed');
    }
    
    // Check prerequisites
    await checkPrerequisites();
    
    // Run test suites
    logSection('Executing Test Suites');
    const results = [];
    
    for (const suite of testSuites) {
      const result = await runTestSuite(suite);
      results.push(result);
      
      // Brief pause between test suites
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate comprehensive report
    const reportData = await generateReport(results);
    
    const totalDuration = Date.now() - startTime;
    
    logHeader('Testing Complete');
    log(`⏱️  Total execution time: ${(totalDuration / 1000 / 60).toFixed(2)} minutes`);
    log(`📊 Success rate: ${reportData.summary.successRate}%`);
    log(`📁 Results saved in: ${TEST_RESULTS_DIR}`);
    
    // Exit with appropriate code
    const failedCount = results.filter(r => r.status === 'failed').length;
    process.exit(failedCount > 0 ? 1 : 0);
    
  } catch (error) {
    logError(`\nTesting aborted: ${error.message}`);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  logWarning('\n\nTest execution interrupted by user');
  process.exit(130);
});

process.on('SIGTERM', () => {
  logWarning('\n\nTest execution terminated');  
  process.exit(143);
});

// Run the test suite
if (require.main === module) {
  main().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runTestSuite,
  generateReport,
  quickHealthCheck,
  testSuites
};

console.log(`
🧪 MedQuiz Pro Authentication - Comprehensive Test Runner
========================================================

This test runner orchestrates comprehensive authentication testing including:

🔧 Basic Functionality Testing
🌐 Edge Cases & Real-World Scenarios  
🔥 Stress & Load Testing
🛡️ Security Penetration Testing

Usage:
  node run-auth-tests.js                    # Run all test suites
  node run-auth-tests.js --quick           # Quick health check only
  node run-auth-tests.js --suite=basic     # Run specific test suite

Results will be saved in: ${TEST_RESULTS_DIR}/
`);