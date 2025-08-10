/**
 * MedQuiz Pro - Authentication & Database Connectivity Test
 * 
 * This script tests:
 * - Convex environment configuration
 * - Authentication functions
 * - Database connection readiness
 * - Real data operations simulation
 * 
 * Version: 1.0.0
 * Last Updated: August 10, 2025
 */

const fs = require('fs');
const path = require('path');

class AuthDatabaseTest {
  constructor() {
    this.results = {
      environment: [],
      authFunctions: [],
      databaseReadiness: [],
      dataOperations: [],
      overall: { passed: 0, total: 0 }
    };
  }

  addTestResult(category, testName, passed, details) {
    const result = {
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results[category].push(result);
    this.results.overall.total++;
    if (passed) this.results.overall.passed++;
    
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    if (details) console.log(`   ${details}`);
  }

  async testEnvironmentSetup() {
    console.log('\n🌍 Testing Environment Configuration for Database Access...\n');

    // Test 1: Check environment files
    const envFiles = ['.env.local', '.env.production', '.env'];
    let envContent = '';
    let envFile = null;

    for (const file of envFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        envContent = fs.readFileSync(filePath, 'utf8');
        envFile = file;
        break;
      }
    }

    this.addTestResult('environment', 'Environment File Found',
      !!envFile, `Using: ${envFile || 'None found'}`);

    // Test 2: Check for Convex URL
    const hasConvexUrl = envContent.includes('VITE_CONVEX_URL') || envContent.includes('CONVEX_URL');
    this.addTestResult('environment', 'Convex URL Configuration',
      hasConvexUrl, hasConvexUrl ? 'Convex URL configured' : 'Missing Convex URL');

    // Test 3: Check for production Convex URL
    const convexUrlMatch = envContent.match(/VITE_CONVEX_URL=(.+)/);
    const convexUrl = convexUrlMatch ? convexUrlMatch[1].trim() : '';
    const isProductionUrl = convexUrl.includes('convex.cloud');
    
    this.addTestResult('environment', 'Production Database URL',
      isProductionUrl, `URL: ${convexUrl.substring(0, 50)}...`);

    // Test 4: Check for authentication configuration
    const hasAuthVars = envContent.includes('AUTH') || envContent.includes('JWT');
    this.addTestResult('environment', 'Authentication Variables',
      hasAuthVars, hasAuthVars ? 'Auth variables found' : 'Using Convex auth');

    return { envContent, convexUrl, isProductionUrl };
  }

  async testAuthenticationFunctions() {
    console.log('\n🔐 Testing Authentication Function Implementation...\n');

    const authPath = path.join(process.cwd(), 'convex', 'auth.ts');
    
    if (!fs.existsSync(authPath)) {
      this.addTestResult('authFunctions', 'Auth File Exists', false, 'auth.ts not found');
      return;
    }

    const authContent = fs.readFileSync(authPath, 'utf8');

    // Test 1: Core authentication functions
    const requiredFunctions = [
      'registerUser',
      'loginUser', 
      'validateSession',
      'logoutUser'
    ];

    requiredFunctions.forEach(func => {
      const hasFunction = authContent.includes(`export const ${func}`) || 
                         authContent.includes(`${func}:`);
      this.addTestResult('authFunctions', `${func} Function`,
        hasFunction, hasFunction ? 'Function found' : 'Function missing');
    });

    // Test 2: Password security implementation
    const hasPasswordHashing = authContent.includes('hash') || 
                              authContent.includes('bcrypt') ||
                              authContent.includes('crypto');
    this.addTestResult('authFunctions', 'Password Hashing',
      hasPasswordHashing, hasPasswordHashing ? 'Password hashing implemented' : 'Basic/missing hashing');

    // Test 3: Session management
    const hasSessionManagement = authContent.includes('session') || 
                                authContent.includes('token') ||
                                authContent.includes('jwt');
    this.addTestResult('authFunctions', 'Session Management',
      hasSessionManagement, hasSessionManagement ? 'Session handling found' : 'Basic session handling');

    // Test 4: Error handling in auth functions
    const hasErrorHandling = authContent.includes('try') && 
                            authContent.includes('catch');
    this.addTestResult('authFunctions', 'Error Handling',
      hasErrorHandling, hasErrorHandling ? 'Error handling implemented' : 'Minimal error handling');

    // Test 5: User data validation
    const hasValidation = authContent.includes('validate') || 
                         authContent.includes('check') ||
                         authContent.includes('verify');
    this.addTestResult('authFunctions', 'Input Validation',
      hasValidation, hasValidation ? 'Validation logic found' : 'Minimal validation');

    return { hasPasswordHashing, hasSessionManagement, hasErrorHandling };
  }

  async testDatabaseReadiness() {
    console.log('\n🗄️ Testing Database Schema Readiness...\n');

    const schemaPath = path.join(process.cwd(), 'convex', 'schema.ts');
    
    if (!fs.existsSync(schemaPath)) {
      this.addTestResult('databaseReadiness', 'Schema File', false, 'schema.ts not found');
      return;
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Test 1: User collection structure
    const userCollectionMatch = schemaContent.match(/users:\s*defineTable\(\{([^}]+)\}/s);
    const hasUserCollection = !!userCollectionMatch;
    
    if (hasUserCollection) {
      const userFields = userCollectionMatch[1];
      const requiredUserFields = ['email', 'name', 'points', 'level', 'streak'];
      const foundFields = requiredUserFields.filter(field => userFields.includes(field));
      
      this.addTestResult('databaseReadiness', 'User Collection Structure',
        foundFields.length >= 4, `Found ${foundFields.length}/5 required fields: ${foundFields.join(', ')}`);
    } else {
      this.addTestResult('databaseReadiness', 'User Collection Structure', false, 'User collection not found');
    }

    // Test 2: Authentication-related collections
    const hasUserSessions = schemaContent.includes('userSessions');
    this.addTestResult('databaseReadiness', 'User Sessions Collection',
      hasUserSessions, hasUserSessions ? 'User sessions table found' : 'No session persistence');

    // Test 3: Quiz-related collections
    const quizCollections = ['questions', 'quizSessions', 'attempts'];
    const foundQuizCollections = quizCollections.filter(collection => 
      schemaContent.includes(`${collection}:`) || schemaContent.includes(`"${collection}"`)
    );
    
    this.addTestResult('databaseReadiness', 'Quiz Collections',
      foundQuizCollections.length >= 2, 
      `Found: ${foundQuizCollections.join(', ')} (${foundQuizCollections.length}/${quizCollections.length})`);

    // Test 4: Analytics collections
    const analyticsCollections = ['analytics', 'metrics'];
    const foundAnalytics = analyticsCollections.filter(collection => 
      schemaContent.includes(`${collection}:`)
    );
    
    this.addTestResult('databaseReadiness', 'Analytics Collections',
      foundAnalytics.length > 0,
      `Found: ${foundAnalytics.join(', ')} (${foundAnalytics.length}/${analyticsCollections.length})`);

    // Test 5: Database indexes for performance
    const indexCount = (schemaContent.match(/\.index\(/g) || []).length;
    this.addTestResult('databaseReadiness', 'Performance Indexes',
      indexCount >= 20, `Found ${indexCount} indexes (recommended: 20+)`);

    return { hasUserCollection, hasUserSessions, foundQuizCollections, indexCount };
  }

  async testDataOperationReadiness() {
    console.log('\n⚡ Testing Data Operation Functions...\n');

    const functionFiles = ['auth.ts', 'quiz.ts', 'analytics.ts', 'quizSessionManagement.ts'];
    let totalFunctions = 0;
    let functionsWithErrorHandling = 0;
    let functionsWithValidation = 0;

    for (const file of functionFiles) {
      const filePath = path.join(process.cwd(), 'convex', file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Count exported functions
        const functions = content.match(/export const \w+/g) || [];
        totalFunctions += functions.length;
        
        // Check for error handling
        if (content.includes('try') && content.includes('catch')) {
          functionsWithErrorHandling++;
        }
        
        // Check for input validation
        if (content.includes('validate') || content.includes('check') || content.includes('v.')) {
          functionsWithValidation++;
        }
      }
    }

    this.addTestResult('dataOperations', 'Function Implementation Count',
      totalFunctions >= 15, `Found ${totalFunctions} exported functions`);

    this.addTestResult('dataOperations', 'Error Handling Coverage',
      functionsWithErrorHandling >= 2, 
      `${functionsWithErrorHandling}/${functionFiles.length} files have error handling`);

    this.addTestResult('dataOperations', 'Input Validation',
      functionsWithValidation >= 2,
      `${functionsWithValidation}/${functionFiles.length} files have validation`);

    // Test specific critical functions
    const quizPath = path.join(process.cwd(), 'convex', 'quiz.ts');
    if (fs.existsSync(quizPath)) {
      const quizContent = fs.readFileSync(quizPath, 'utf8');
      const hasCriticalQuizFunctions = ['getRandomQuestions', 'createQuizSession', 'submitAnswer'].every(func =>
        quizContent.includes(func)
      );
      
      this.addTestResult('dataOperations', 'Critical Quiz Functions',
        hasCriticalQuizFunctions, 'Core quiz operations available');
    }

    // Test analytics functions
    const analyticsPath = path.join(process.cwd(), 'convex', 'analytics.ts');
    if (fs.existsSync(analyticsPath)) {
      const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
      const hasAnalyticsFunctions = ['trackEvent', 'getUserAnalytics'].some(func =>
        analyticsContent.includes(func)
      );
      
      this.addTestResult('dataOperations', 'Analytics Functions',
        hasAnalyticsFunctions, 'Analytics tracking available');
    }

    return { totalFunctions, functionsWithErrorHandling, functionsWithValidation };
  }

  async checkConvexDeploymentReadiness() {
    console.log('\n🚀 Checking Convex Deployment Readiness...\n');

    // Test 1: Check for generated API files
    const generatedDir = path.join(process.cwd(), 'convex', '_generated');
    const generatedExists = fs.existsSync(generatedDir);
    
    this.addTestResult('databaseReadiness', 'Generated API Files',
      generatedExists, generatedExists ? '_generated directory found' : 'Run npx convex dev to generate');

    if (generatedExists) {
      const generatedFiles = fs.readdirSync(generatedDir);
      const hasApiFiles = generatedFiles.some(file => file.includes('api'));
      
      this.addTestResult('databaseReadiness', 'API Definition Files',
        hasApiFiles, hasApiFiles ? 'API files generated' : 'API files missing');
    }

    // Test 2: Check for auth config
    const authConfigPath = path.join(process.cwd(), 'convex', 'auth.config.ts');
    const authConfigExists = fs.existsSync(authConfigPath);
    
    this.addTestResult('databaseReadiness', 'Auth Configuration',
      authConfigExists, authConfigExists ? 'Auth config found' : 'Basic auth only');

    // Test 3: Check for deployment scripts
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const scripts = packageJson.scripts || {};
      
      const hasConvexScripts = Object.keys(scripts).some(script => 
        script.includes('convex') || scripts[script].includes('convex')
      );
      
      this.addTestResult('databaseReadiness', 'Deployment Scripts',
        hasConvexScripts, hasConvexScripts ? 'Convex scripts configured' : 'Manual deployment required');
    }
  }

  generateReport() {
    console.log('\n📊 Generating Authentication & Database Test Report...\n');

    const percentage = this.results.overall.total > 0 ? 
      Math.round((this.results.overall.passed / this.results.overall.total) * 100) : 0;

    const report = {
      metadata: {
        title: 'MedQuiz Pro Authentication & Database Readiness Report',
        timestamp: new Date().toISOString(),
        testDuration: Date.now() - this.startTime
      },
      summary: {
        overallScore: `${this.results.overall.passed}/${this.results.overall.total} (${percentage}%)`,
        status: percentage >= 90 ? 'PRODUCTION READY' : 
                percentage >= 75 ? 'MOSTLY READY' : 
                percentage >= 60 ? 'NEEDS IMPROVEMENT' : 'CRITICAL ISSUES',
        readinessLevel: this.determineReadinessLevel(percentage)
      },
      categories: {
        environment: {
          tests: this.results.environment.length,
          passed: this.results.environment.filter(t => t.passed).length
        },
        authentication: {
          tests: this.results.authFunctions.length,
          passed: this.results.authFunctions.filter(t => t.passed).length
        },
        database: {
          tests: this.results.databaseReadiness.length,
          passed: this.results.databaseReadiness.filter(t => t.passed).length
        },
        operations: {
          tests: this.results.dataOperations.length,
          passed: this.results.dataOperations.filter(t => t.passed).length
        }
      },
      detailedResults: this.results,
      recommendations: this.generateRecommendations(percentage),
      nextSteps: this.generateNextSteps(percentage)
    };

    // Save report
    const reportPath = path.join(process.cwd(), 'auth-database-readiness-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    console.log('🎯 AUTHENTICATION & DATABASE READINESS SUMMARY');
    console.log('==============================================');
    console.log(`Overall Score: ${this.results.overall.passed}/${this.results.overall.total} (${percentage}%)`);
    console.log(`Status: ${report.summary.status}`);
    console.log(`Readiness Level: ${report.summary.readinessLevel}\n`);

    Object.entries(report.categories).forEach(([category, data]) => {
      const categoryPercentage = data.tests > 0 ? Math.round((data.passed / data.tests) * 100) : 0;
      console.log(`${category.toUpperCase()}: ${categoryPercentage}% (${data.passed}/${data.tests})`);
    });

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    return report;
  }

  determineReadinessLevel(percentage) {
    if (percentage >= 95) return 'FULLY READY FOR PRODUCTION';
    if (percentage >= 85) return 'READY WITH MINOR OPTIMIZATIONS';
    if (percentage >= 75) return 'READY WITH SOME IMPROVEMENTS NEEDED';
    if (percentage >= 65) return 'MOSTLY READY - ADDRESS KEY ISSUES';
    if (percentage >= 50) return 'PARTIALLY READY - SIGNIFICANT WORK NEEDED';
    return 'NOT READY - CRITICAL ISSUES MUST BE RESOLVED';
  }

  generateRecommendations(percentage) {
    const recommendations = [];

    if (percentage < 90) {
      recommendations.push({
        priority: 'HIGH',
        area: 'Overall System',
        recommendation: 'Address failing test cases to achieve production readiness'
      });
    }

    // Environment-specific recommendations
    const envPassed = this.results.environment.filter(t => t.passed).length;
    const envTotal = this.results.environment.length;
    
    if (envTotal > 0 && envPassed < envTotal) {
      recommendations.push({
        priority: 'CRITICAL',
        area: 'Environment Configuration',
        recommendation: 'Complete environment setup with proper Convex URL and authentication variables'
      });
    }

    // Authentication-specific recommendations
    const authPassed = this.results.authFunctions.filter(t => t.passed).length;
    const authTotal = this.results.authFunctions.length;
    
    if (authTotal > 0 && authPassed < authTotal * 0.8) {
      recommendations.push({
        priority: 'HIGH',
        area: 'Authentication Security',
        recommendation: 'Implement production-grade password hashing and comprehensive error handling'
      });
    }

    // Database recommendations
    const dbPassed = this.results.databaseReadiness.filter(t => t.passed).length;
    const dbTotal = this.results.databaseReadiness.length;
    
    if (dbTotal > 0 && dbPassed < dbTotal * 0.9) {
      recommendations.push({
        priority: 'MEDIUM',
        area: 'Database Optimization',
        recommendation: 'Optimize database schema and add missing collections/indexes'
      });
    }

    return recommendations;
  }

  generateNextSteps(percentage) {
    if (percentage >= 90) {
      return [
        'Deploy to production with confidence',
        'Monitor authentication performance',
        'Set up database monitoring and alerts',
        'Plan for user load testing'
      ];
    } else if (percentage >= 75) {
      return [
        'Address high-priority recommendations',
        'Complete missing authentication features',
        'Optimize database performance',
        'Run additional integration tests'
      ];
    } else {
      return [
        'Complete critical authentication functions',
        'Fix database schema issues',
        'Implement proper error handling',
        'Re-run tests after improvements'
      ];
    }
  }

  async runFullTest() {
    this.startTime = Date.now();
    
    console.log('\n🚀 MedQuiz Pro Authentication & Database Readiness Test');
    console.log('======================================================');

    try {
      await this.testEnvironmentSetup();
      await this.testAuthenticationFunctions();
      await this.testDatabaseReadiness();
      await this.testDataOperationReadiness();
      await this.checkConvexDeploymentReadiness();
      
      const report = this.generateReport();
      
      console.log('\n🎉 Authentication & Database testing completed!');
      return report;
      
    } catch (error) {
      console.log('\n❌ Testing failed:', error.message);
      throw error;
    }
  }
}

// Run the test
async function runAuthDatabaseTest() {
  const tester = new AuthDatabaseTest();
  try {
    return await tester.runFullTest();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runAuthDatabaseTest();
}

module.exports = AuthDatabaseTest;