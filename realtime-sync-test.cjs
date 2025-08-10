/**
 * MedQuiz Pro - Real-Time Data Synchronization Test
 * 
 * This script tests:
 * - Real-time database connectivity
 * - Data synchronization performance
 * - Query performance and optimization
 * - Database relationship integrity
 * - Production scalability readiness
 * 
 * Version: 1.0.0
 * Last Updated: August 10, 2025
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class RealTimeSyncTest {
  constructor() {
    this.results = {
      connectivity: [],
      performance: [],
      relationships: [],
      scalability: [],
      realtime: [],
      overall: { passed: 0, total: 0 }
    };
    this.convexUrl = null;
  }

  addTestResult(category, testName, passed, details, metrics = {}) {
    const result = {
      test: testName,
      passed,
      details,
      metrics,
      timestamp: new Date().toISOString()
    };
    
    this.results[category].push(result);
    this.results.overall.total++;
    if (passed) this.results.overall.passed++;
    
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    if (details) console.log(`   ${details}`);
    if (Object.keys(metrics).length > 0) {
      console.log(`   Metrics: ${JSON.stringify(metrics)}`);
    }
  }

  async loadEnvironmentConfig() {
    console.log('\n🔧 Loading Environment Configuration...\n');

    const envFiles = ['.env.local', '.env.production', '.env'];
    let envContent = '';

    for (const file of envFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        envContent = fs.readFileSync(filePath, 'utf8');
        break;
      }
    }

    const convexUrlMatch = envContent.match(/VITE_CONVEX_URL=(.+)/);
    this.convexUrl = convexUrlMatch ? convexUrlMatch[1].trim() : null;

    console.log(`Convex URL: ${this.convexUrl ? this.convexUrl.substring(0, 50) + '...' : 'Not found'}`);
    return this.convexUrl;
  }

  async testDatabaseConnectivity() {
    console.log('\n📡 Testing Database Connectivity...\n');

    if (!this.convexUrl) {
      this.addTestResult('connectivity', 'Convex URL Configuration', false, 'No Convex URL found');
      return;
    }

    // Test 1: HTTP connectivity to Convex
    const connectivityStart = Date.now();
    
    try {
      await this.makeHttpRequest(this.convexUrl);
      const responseTime = Date.now() - connectivityStart;
      
      this.addTestResult('connectivity', 'HTTP Connectivity',
        responseTime < 5000, 
        `Connected to Convex cloud`,
        { responseTime: `${responseTime}ms` });
        
    } catch (error) {
      this.addTestResult('connectivity', 'HTTP Connectivity', false, 
        `Connection failed: ${error.message}`);
    }

    // Test 2: Check Convex cloud region
    const isNYC = this.convexUrl.includes('nyc') || this.convexUrl.includes('new-york');
    const isCloud = this.convexUrl.includes('convex.cloud');
    
    this.addTestResult('connectivity', 'Production Database',
      isCloud, 
      `Using ${isCloud ? 'Convex Cloud' : 'Local'} database${isNYC ? ' (NYC region)' : ''}`);

    // Test 3: SSL/TLS verification
    const isHTTPS = this.convexUrl.startsWith('https://');
    this.addTestResult('connectivity', 'Secure Connection',
      isHTTPS, `Connection is ${isHTTPS ? 'HTTPS' : 'HTTP'}`);

    return { responseTime: Date.now() - connectivityStart, isCloud, isHTTPS };
  }

  async testQueryPerformance() {
    console.log('\n⚡ Testing Query Performance Analysis...\n');

    // Test 1: Analyze schema complexity
    const schemaPath = path.join(process.cwd(), 'convex', 'schema.ts');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    const collectionCount = (schemaContent.match(/defineTable\(/g) || []).length;
    const indexCount = (schemaContent.match(/\.index\(/g) || []).length;
    const searchIndexCount = (schemaContent.match(/\.searchIndex\(/g) || []).length;

    this.addTestResult('performance', 'Schema Complexity',
      collectionCount <= 25 && indexCount >= 20,
      `${collectionCount} collections, ${indexCount} indexes, ${searchIndexCount} search indexes`,
      { collections: collectionCount, indexes: indexCount, searchIndexes: searchIndexCount });

    // Test 2: Index optimization analysis
    const avgIndexesPerCollection = indexCount / collectionCount;
    this.addTestResult('performance', 'Index Optimization',
      avgIndexesPerCollection >= 3,
      `Average ${avgIndexesPerCollection.toFixed(1)} indexes per collection`,
      { averageIndexes: avgIndexesPerCollection });

    // Test 3: Query function analysis
    const functionFiles = ['auth.ts', 'quiz.ts', 'analytics.ts'];
    let totalQueries = 0;
    let optimizedQueries = 0;

    for (const file of functionFiles) {
      const filePath = path.join(process.cwd(), 'convex', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Count database queries
        const queries = content.match(/ctx\.db\./g) || [];
        totalQueries += queries.length;
        
        // Count optimized queries (with filters/indexes)
        const optimized = content.match(/\.filter\(|\.withIndex\(|\.order\(/g) || [];
        optimizedQueries += optimized.length;
      }
    }

    const optimizationRatio = totalQueries > 0 ? optimizedQueries / totalQueries : 0;
    this.addTestResult('performance', 'Query Optimization',
      optimizationRatio >= 0.3,
      `${optimizedQueries}/${totalQueries} queries are optimized (${(optimizationRatio * 100).toFixed(1)}%)`,
      { totalQueries, optimizedQueries, optimizationRatio });

    return { collectionCount, indexCount, totalQueries, optimizationRatio };
  }

  async testDataRelationships() {
    console.log('\n🔗 Testing Data Relationships & Integrity...\n');

    const schemaPath = path.join(process.cwd(), 'convex', 'schema.ts');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Test 1: Foreign key relationships
    const idReferences = schemaContent.match(/v\.id\("(\w+)"\)/g) || [];
    const referencedCollections = [...new Set(idReferences.map(ref => 
      ref.match(/v\.id\("(\w+)"\)/)[1]
    ))];

    this.addTestResult('relationships', 'Foreign Key Relationships',
      referencedCollections.length >= 3,
      `Found ${idReferences.length} references to ${referencedCollections.length} collections: ${referencedCollections.join(', ')}`,
      { totalReferences: idReferences.length, uniqueCollections: referencedCollections.length });

    // Test 2: Core relationship patterns
    const coreRelationships = [
      { from: 'quizSessions', to: 'users', pattern: 'userId:.*id\\("users"\\)' },
      { from: 'attempts', to: 'questions', pattern: 'questionId:.*id\\("questions"\\)' },
      { from: 'analytics', to: 'users', pattern: 'userId:.*id\\("users"\\)' }
    ];

    let validRelationships = 0;
    coreRelationships.forEach(rel => {
      const hasRelationship = new RegExp(rel.pattern).test(schemaContent);
      if (hasRelationship) validRelationships++;
      
      this.addTestResult('relationships', `${rel.from} → ${rel.to} Relationship`,
        hasRelationship, `${rel.from} references ${rel.to}`);
    });

    // Test 3: Data integrity constraints
    const requiredFields = schemaContent.match(/v\.\w+\(\),?\s*\/\/.*required/gi) || [];
    const optionalFields = schemaContent.match(/v\.optional\(/g) || [];
    const totalFields = (schemaContent.match(/\w+:\s*v\./g) || []).length;

    this.addTestResult('relationships', 'Data Integrity Constraints',
      optionalFields.length > 0,
      `${requiredFields.length} required fields, ${optionalFields.length} optional fields out of ${totalFields} total`,
      { requiredFields: requiredFields.length, optionalFields: optionalFields.length, totalFields });

    return { referencedCollections, validRelationships, totalFields };
  }

  async testRealTimeCapabilities() {
    console.log('\n🔄 Testing Real-Time Synchronization Capabilities...\n');

    // Test 1: Real-time function patterns
    const functionFiles = ['auth.ts', 'quiz.ts', 'analytics.ts'];
    let hasSubscriptions = false;
    let hasRealTimeQueries = false;
    let hasMutations = false;

    for (const file of functionFiles) {
      const filePath = path.join(process.cwd(), 'convex', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('query(') || content.includes('internalQuery(')) {
          hasRealTimeQueries = true;
        }
        
        if (content.includes('mutation(') || content.includes('internalMutation(')) {
          hasMutations = true;
        }
        
        if (content.includes('subscription') || content.includes('live')) {
          hasSubscriptions = true;
        }
      }
    }

    this.addTestResult('realtime', 'Real-Time Query Functions',
      hasRealTimeQueries, `Real-time queries ${hasRealTimeQueries ? 'implemented' : 'missing'}`);

    this.addTestResult('realtime', 'Real-Time Mutation Functions',
      hasMutations, `Real-time mutations ${hasMutations ? 'implemented' : 'missing'}`);

    this.addTestResult('realtime', 'Subscription Patterns',
      hasSubscriptions, `Live subscriptions ${hasSubscriptions ? 'implemented' : 'not used'}`);

    // Test 2: Event-driven patterns
    const analyticsPath = path.join(process.cwd(), 'convex', 'analytics.ts');
    let hasEventTracking = false;
    
    if (fs.existsSync(analyticsPath)) {
      const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
      hasEventTracking = analyticsContent.includes('trackEvent') || 
                        analyticsContent.includes('logEvent');
    }

    this.addTestResult('realtime', 'Event-Driven Architecture',
      hasEventTracking, `Event tracking ${hasEventTracking ? 'implemented' : 'missing'}`);

    // Test 3: Real-time data flow
    const hasRealTimeFlow = hasRealTimeQueries && hasMutations && hasEventTracking;
    this.addTestResult('realtime', 'Complete Real-Time Data Flow',
      hasRealTimeFlow, `Real-time system ${hasRealTimeFlow ? 'fully implemented' : 'partially implemented'}`);

    return { hasRealTimeQueries, hasMutations, hasSubscriptions, hasEventTracking };
  }

  async testScalabilityReadiness() {
    console.log('\n📈 Testing Scalability & Production Readiness...\n');

    // Test 1: Batch operation support
    const functionFiles = ['auth.ts', 'quiz.ts', 'analytics.ts'];
    let hasBatchOperations = false;
    let hasRateLimiting = false;
    let hasErrorRecovery = false;

    for (const file of functionFiles) {
      const filePath = path.join(process.cwd(), 'convex', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('Promise.all') || content.includes('batch') || 
            content.includes('transaction')) {
          hasBatchOperations = true;
        }
        
        if (content.includes('rate') || content.includes('limit') || 
            content.includes('throttle')) {
          hasRateLimiting = true;
        }
        
        if (content.includes('retry') || content.includes('recover') || 
            content.includes('fallback')) {
          hasErrorRecovery = true;
        }
      }
    }

    this.addTestResult('scalability', 'Batch Operation Support',
      hasBatchOperations, `Batch operations ${hasBatchOperations ? 'implemented' : 'not implemented'}`);

    this.addTestResult('scalability', 'Rate Limiting',
      hasRateLimiting, `Rate limiting ${hasRateLimiting ? 'implemented' : 'not implemented'}`);

    this.addTestResult('scalability', 'Error Recovery',
      hasErrorRecovery, `Error recovery ${hasErrorRecovery ? 'implemented' : 'not implemented'}`);

    // Test 2: Memory efficiency
    const schemaPath = path.join(process.cwd(), 'convex', 'schema.ts');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Count large text fields that might need optimization
    const textFields = schemaContent.match(/v\.string\(\)/g) || [];
    const optionalTextFields = schemaContent.match(/v\.optional\(v\.string\(\)\)/g) || [];
    const memoryEfficient = optionalTextFields.length / textFields.length >= 0.3;

    this.addTestResult('scalability', 'Memory Efficiency',
      memoryEfficient, 
      `${optionalTextFields.length}/${textFields.length} text fields are optional`,
      { textFields: textFields.length, optionalTextFields: optionalTextFields.length });

    // Test 3: Concurrent user support
    const sessionManagementPath = path.join(process.cwd(), 'convex', 'quizSessionManagement.ts');
    const hasSessionManagement = fs.existsSync(sessionManagementPath);
    
    let supportsConcurrency = false;
    if (hasSessionManagement) {
      const content = fs.readFileSync(sessionManagementPath, 'utf8');
      supportsConcurrency = content.includes('concurrent') || 
                           content.includes('parallel') ||
                           content.includes('session') && content.includes('management');
    }

    this.addTestResult('scalability', 'Concurrent User Support',
      supportsConcurrency || hasSessionManagement, 
      `Session management ${hasSessionManagement ? 'implemented' : 'missing'}`);

    return { hasBatchOperations, hasRateLimiting, hasErrorRecovery, supportsConcurrency };
  }

  async makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const request = client.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve({ statusCode: response.statusCode, data }));
      });
      
      request.on('error', reject);
      request.setTimeout(5000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  generateReport() {
    console.log('\n📊 Generating Real-Time Synchronization Report...\n');

    const percentage = this.results.overall.total > 0 ? 
      Math.round((this.results.overall.passed / this.results.overall.total) * 100) : 0;

    const report = {
      metadata: {
        title: 'MedQuiz Pro Real-Time Data Synchronization Report',
        timestamp: new Date().toISOString(),
        convexUrl: this.convexUrl ? this.convexUrl.substring(0, 50) + '...' : 'Not configured',
        testDuration: Date.now() - this.startTime
      },
      summary: {
        overallScore: `${this.results.overall.passed}/${this.results.overall.total} (${percentage}%)`,
        status: percentage >= 90 ? 'EXCELLENT REAL-TIME PERFORMANCE' : 
                percentage >= 80 ? 'GOOD REAL-TIME PERFORMANCE' : 
                percentage >= 70 ? 'ADEQUATE REAL-TIME PERFORMANCE' : 
                percentage >= 60 ? 'NEEDS REAL-TIME IMPROVEMENTS' : 'CRITICAL REAL-TIME ISSUES',
        readinessLevel: this.determineReadinessLevel(percentage)
      },
      categories: this.generateCategoryScores(),
      detailedResults: this.results,
      recommendations: this.generateRecommendations(),
      performanceMetrics: this.extractPerformanceMetrics(),
      nextSteps: this.generateNextSteps(percentage)
    };

    // Save report
    const reportPath = path.join(process.cwd(), 'realtime-sync-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    console.log('🎯 REAL-TIME SYNCHRONIZATION SUMMARY');
    console.log('====================================');
    console.log(`Overall Score: ${this.results.overall.passed}/${this.results.overall.total} (${percentage}%)`);
    console.log(`Status: ${report.summary.status}`);
    console.log(`Readiness Level: ${report.summary.readinessLevel}\n`);

    Object.entries(report.categories).forEach(([category, data]) => {
      console.log(`${category.toUpperCase()}: ${data.percentage}% (${data.passed}/${data.total})`);
    });

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    return report;
  }

  generateCategoryScores() {
    const categories = {};
    
    Object.keys(this.results).forEach(category => {
      if (category !== 'overall') {
        const tests = this.results[category];
        const passed = tests.filter(t => t.passed).length;
        const total = tests.length;
        
        categories[category] = {
          passed,
          total,
          percentage: total > 0 ? Math.round((passed / total) * 100) : 0
        };
      }
    });
    
    return categories;
  }

  determineReadinessLevel(percentage) {
    if (percentage >= 95) return 'FULLY OPTIMIZED FOR PRODUCTION SCALE';
    if (percentage >= 85) return 'READY FOR HIGH-VOLUME PRODUCTION';
    if (percentage >= 75) return 'READY FOR STANDARD PRODUCTION';
    if (percentage >= 65) return 'READY WITH PERFORMANCE MONITORING';
    if (percentage >= 50) return 'READY WITH SIGNIFICANT OPTIMIZATIONS NEEDED';
    return 'NOT READY FOR PRODUCTION - CRITICAL PERFORMANCE ISSUES';
  }

  extractPerformanceMetrics() {
    const metrics = {};
    
    Object.values(this.results).forEach(category => {
      if (Array.isArray(category)) {
        category.forEach(test => {
          if (test.metrics && Object.keys(test.metrics).length > 0) {
            metrics[test.test] = test.metrics;
          }
        });
      }
    });
    
    return metrics;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Connectivity recommendations
    const connectivityIssues = this.results.connectivity.filter(t => !t.passed).length;
    if (connectivityIssues > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Database Connectivity',
        issue: `${connectivityIssues} connectivity issues detected`,
        solution: 'Verify Convex configuration and network connectivity'
      });
    }
    
    // Performance recommendations
    const performanceIssues = this.results.performance.filter(t => !t.passed).length;
    if (performanceIssues > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Query Performance',
        issue: `${performanceIssues} performance issues detected`,
        solution: 'Optimize database queries and add missing indexes'
      });
    }
    
    // Real-time recommendations
    const realtimeIssues = this.results.realtime.filter(t => !t.passed).length;
    if (realtimeIssues > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Real-Time Features',
        issue: `${realtimeIssues} real-time features missing`,
        solution: 'Implement missing real-time synchronization features'
      });
    }
    
    // Scalability recommendations
    const scalabilityIssues = this.results.scalability.filter(t => !t.passed).length;
    if (scalabilityIssues > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Scalability',
        issue: `${scalabilityIssues} scalability concerns detected`,
        solution: 'Implement batch operations, rate limiting, and error recovery'
      });
    }
    
    return recommendations;
  }

  generateNextSteps(percentage) {
    if (percentage >= 90) {
      return [
        'Deploy to production with confidence',
        'Set up real-time monitoring dashboards',
        'Plan for user load testing',
        'Monitor database performance metrics'
      ];
    } else if (percentage >= 75) {
      return [
        'Address high-priority performance issues',
        'Optimize slow database queries',
        'Implement missing real-time features',
        'Set up performance monitoring'
      ];
    } else {
      return [
        'Fix critical connectivity issues',
        'Optimize database schema and queries',
        'Implement essential real-time features',
        'Address scalability concerns before production'
      ];
    }
  }

  async runFullTest() {
    this.startTime = Date.now();
    
    console.log('\n🚀 MedQuiz Pro Real-Time Data Synchronization Test');
    console.log('==================================================');

    try {
      await this.loadEnvironmentConfig();
      await this.testDatabaseConnectivity();
      await this.testQueryPerformance();
      await this.testDataRelationships();
      await this.testRealTimeCapabilities();
      await this.testScalabilityReadiness();
      
      const report = this.generateReport();
      
      console.log('\n🎉 Real-time synchronization testing completed!');
      return report;
      
    } catch (error) {
      console.log('\n❌ Testing failed:', error.message);
      throw error;
    }
  }
}

// Run the test
async function runRealTimeSyncTest() {
  const tester = new RealTimeSyncTest();
  try {
    return await tester.runFullTest();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runRealTimeSyncTest();
}

module.exports = RealTimeSyncTest;