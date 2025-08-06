#!/usr/bin/env node

/**
 * 🏥 MedQuiz Pro - Medical Load Testing Script
 * Simulates realistic medical student usage patterns
 */

import http from 'http';
import https from 'https';
import { promisify } from 'util';
import fs from 'fs/promises';

class MedicalLoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://usmle-trivia.netlify.app';
    this.concurrentUsers = options.concurrentUsers || 10;
    this.testDuration = options.testDuration || 30000; // 30 seconds
    this.results = {
      startTime: Date.now(),
      requests: [],
      summary: {}
    };
  }

  async log(message, type = 'INFO') {
    const timestamp = new Date().toISOString().substr(11, 8);
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const client = url.startsWith('https:') ? https : http;
      
      const req = client.request(url, { method: 'GET' }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            responseTime,
            contentLength: data.length,
            success: res.statusCode >= 200 && res.statusCode < 400
          });
        });
      });
      
      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        reject({
          error: error.message,
          responseTime,
          success: false
        });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        reject({
          error: 'Request timeout',
          responseTime,
          success: false
        });
      });
      
      req.end();
    });
  }

  async simulateMedicalStudentSession() {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const sessionResults = [];
    
    // Medical student usage pattern: Landing -> Quiz -> Results
    const userJourney = [
      { path: '/', description: 'Landing page visit' },
      { path: '/#/dashboard', description: 'Dashboard access' },
      { path: '/#/quiz', description: 'Quiz start' },
      { path: '/#/quiz', description: 'Quiz questions' }, // Simulate multiple question requests
      { path: '/#/quiz', description: 'Quiz completion' }
    ];
    
    for (const step of userJourney) {
      try {
        const url = `${this.baseUrl}${step.path}`;
        const result = await this.makeRequest(url);
        
        sessionResults.push({
          sessionId,
          timestamp: Date.now(),
          step: step.description,
          ...result
        });
        
        // Simulate reading time between requests (medical students spend time reading)
        const readingTime = Math.random() * 2000 + 500; // 0.5-2.5 seconds
        await new Promise(resolve => setTimeout(resolve, readingTime));
        
      } catch (error) {
        sessionResults.push({
          sessionId,
          timestamp: Date.now(),
          step: step.description,
          ...error
        });
      }
    }
    
    return sessionResults;
  }

  async runLoadTest() {
    await this.log('🚀 Starting Medical Student Load Test', 'START');
    await this.log(`👥 Simulating ${this.concurrentUsers} concurrent medical students`);
    await this.log(`⏱️ Test duration: ${this.testDuration}ms`);
    await this.log(`🌐 Target URL: ${this.baseUrl}`);
    
    const startTime = Date.now();
    const sessions = [];
    
    // Start concurrent medical student sessions
    for (let i = 0; i < this.concurrentUsers; i++) {
      sessions.push(this.simulateMedicalStudentSession());
    }
    
    // Wait for all sessions to complete or timeout
    const timeoutPromise = new Promise(resolve => 
      setTimeout(() => resolve([]), this.testDuration)
    );
    
    const allResults = await Promise.race([
      Promise.allSettled(sessions),
      timeoutPromise
    ]);
    
    const endTime = Date.now();
    const actualDuration = endTime - startTime;
    
    // Process results
    const allRequests = [];
    if (Array.isArray(allResults)) {
      allResults.forEach(result => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          allRequests.push(...result.value);
        }
      });
    }
    
    this.results.requests = allRequests;
    this.results.endTime = endTime;
    this.results.actualDuration = actualDuration;
    
    // Calculate performance metrics
    const successfulRequests = allRequests.filter(r => r.success);
    const failedRequests = allRequests.filter(r => !r.success);
    
    const responseTimes = successfulRequests.map(r => r.responseTime);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    const p95ResponseTime = responseTimes.length > 0 
      ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)]
      : 0;
    
    const requestsPerSecond = allRequests.length / (actualDuration / 1000);
    const successRate = (successfulRequests.length / allRequests.length) * 100;
    
    this.results.summary = {
      totalRequests: allRequests.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      actualDuration,
      medicalGradePerformance: {
        acceptable: successRate >= 99 && avgResponseTime <= 1000,
        excellent: successRate >= 99.5 && avgResponseTime <= 500
      }
    };
    
    // Generate report
    await this.log('\n📊 MEDICAL LOAD TEST RESULTS', 'REPORT');
    await this.log('=======================================', 'REPORT');
    await this.log(`📈 Total Requests: ${this.results.summary.totalRequests}`, 'REPORT');
    await this.log(`✅ Successful: ${this.results.summary.successfulRequests}`, 'REPORT');
    await this.log(`❌ Failed: ${this.results.summary.failedRequests}`, 'REPORT');
    await this.log(`🎯 Success Rate: ${this.results.summary.successRate}%`, 'REPORT');
    await this.log(`⚡ Avg Response Time: ${this.results.summary.avgResponseTime}ms`, 'REPORT');
    await this.log(`📊 95th Percentile: ${this.results.summary.p95ResponseTime}ms`, 'REPORT');
    await this.log(`🚀 Requests/Second: ${this.results.summary.requestsPerSecond}`, 'REPORT');
    
    // Medical grade assessment
    const { acceptable, excellent } = this.results.summary.medicalGradePerformance;
    if (excellent) {
      await this.log('🏥 EXCELLENT: Medical-grade performance! ✨', 'SUCCESS');
    } else if (acceptable) {
      await this.log('✅ ACCEPTABLE: Meets medical education standards', 'SUCCESS');
    } else {
      await this.log('⚠️ NEEDS IMPROVEMENT: Performance optimization required', 'WARNING');
    }
    
    // Save detailed results
    await fs.writeFile(
      'medical-load-test-results.json',
      JSON.stringify(this.results, null, 2)
    );
    
    await this.log('\n📄 Detailed results saved to: medical-load-test-results.json', 'INFO');
    
    return this.results;
  }
}

// Medical load testing scenarios
export const medicalScenarios = {
  light: { concurrentUsers: 5, testDuration: 15000 },    // Light usage
  normal: { concurrentUsers: 10, testDuration: 30000 },  // Normal studying
  peak: { concurrentUsers: 25, testDuration: 45000 },    // Peak exam season
  stress: { concurrentUsers: 50, testDuration: 60000 }   // Stress test
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const scenario = process.argv[2] || 'normal';
  const config = medicalScenarios[scenario] || medicalScenarios.normal;
  
  console.log(`🏥 Running ${scenario} load test scenario`);
  
  const tester = new MedicalLoadTester(config);
  tester.runLoadTest()
    .then(results => {
      const { acceptable, excellent } = results.summary.medicalGradePerformance;
      process.exit((acceptable || excellent) ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Load test failed:', error);
      process.exit(1);
    });
}

export default MedicalLoadTester;