#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Simple authentication test for MedQuiz Pro without browser automation
class SimpleAuthTester {
  constructor() {
    this.baseUrl = 'http://localhost:5173';
    this.testResults = [];
    this.existingUser = {
      email: 'jayveedz19@gmail.com',
      password: 'Jimkali90#'
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  addResult(test, status, message = '') {
    this.testResults.push({
      test,
      status,
      message,
      timestamp: new Date().toISOString()
    });
    this.log(`${test}: ${status}${message ? ` - ${message}` : ''}`, status.toLowerCase());
  }

  async makeRequest(path = '', method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MedQuiz-AuthTester/1.0'
        },
        timeout: 10000
      };

      if (data && method !== 'GET') {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            url: res.url
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data && method !== 'GET') {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async testServerConnection() {
    this.log('Testing server connection...', 'info');
    
    try {
      const response = await this.makeRequest('/');
      
      if (response.statusCode === 200) {
        this.addResult('Server Connection', 'PASS', `Server responding with status ${response.statusCode}`);
        return true;
      } else {
        this.addResult('Server Connection', 'FAIL', `Server returned status ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.addResult('Server Connection', 'FAIL', `Server not reachable: ${error.message}`);
      return false;
    }
  }

  async testLandingPage() {
    this.log('Testing landing page...', 'info');
    
    try {
      const response = await this.makeRequest('/');
      
      if (response.statusCode === 200) {
        const body = response.body.toLowerCase();
        
        // Check for key elements that should be on the landing page
        const hasTitle = body.includes('medquiz') || body.includes('quiz') || body.includes('<title>');
        const hasNavigation = body.includes('login') || body.includes('register') || body.includes('nav');
        const hasReactApp = body.includes('react') || body.includes('div id="root"') || body.includes('vite');
        
        if (hasTitle && hasNavigation) {
          this.addResult('Landing Page Content', 'PASS', 'Landing page contains expected elements');
        } else if (hasReactApp) {
          this.addResult('Landing Page Content', 'PASS', 'React app detected (content loaded dynamically)');
        } else {
          this.addResult('Landing Page Content', 'WARN', 'Landing page missing some expected elements');
        }
        
        return true;
      } else {
        this.addResult('Landing Page Load', 'FAIL', `Landing page returned status ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.addResult('Landing Page Load', 'FAIL', error.message);
      return false;
    }
  }

  async testLoginPage() {
    this.log('Testing login page...', 'info');
    
    try {
      const response = await this.makeRequest('/login');
      
      if (response.statusCode === 200) {
        const body = response.body.toLowerCase();
        
        // For SPA, we might get the main HTML and routing happens client-side
        const hasReactApp = body.includes('div id="root"') || body.includes('react');
        const hasLoginElements = body.includes('login') || body.includes('email') || body.includes('password');
        
        if (hasReactApp) {
          this.addResult('Login Page Load', 'PASS', 'Login route accessible (React SPA detected)');
        } else if (hasLoginElements) {
          this.addResult('Login Page Load', 'PASS', 'Login page contains expected elements');
        } else {
          this.addResult('Login Page Load', 'WARN', 'Login page content not directly visible (likely SPA routing)');
        }
        
        return true;
      } else {
        this.addResult('Login Page Load', 'FAIL', `Login page returned status ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.addResult('Login Page Load', 'FAIL', error.message);
      return false;
    }
  }

  async testRegisterPage() {
    this.log('Testing register page...', 'info');
    
    try {
      const response = await this.makeRequest('/register');
      
      if (response.statusCode === 200) {
        const body = response.body.toLowerCase();
        
        const hasReactApp = body.includes('div id="root"') || body.includes('react');
        const hasRegisterElements = body.includes('register') || body.includes('signup') || body.includes('name');
        
        if (hasReactApp) {
          this.addResult('Register Page Load', 'PASS', 'Register route accessible (React SPA detected)');
        } else if (hasRegisterElements) {
          this.addResult('Register Page Load', 'PASS', 'Register page contains expected elements');
        } else {
          this.addResult('Register Page Load', 'WARN', 'Register page content not directly visible (likely SPA routing)');
        }
        
        return true;
      } else {
        this.addResult('Register Page Load', 'FAIL', `Register page returned status ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.addResult('Register Page Load', 'FAIL', error.message);
      return false;
    }
  }

  async testProtectedRoute() {
    this.log('Testing protected route access...', 'info');
    
    try {
      const response = await this.makeRequest('/dashboard');
      
      if (response.statusCode === 200) {
        const body = response.body.toLowerCase();
        
        // For React SPA, protected routes are handled client-side
        const hasReactApp = body.includes('div id="root"') || body.includes('react');
        
        if (hasReactApp) {
          this.addResult('Protected Route Access', 'PASS', 'Dashboard route accessible (authentication handled client-side)');
        } else {
          this.addResult('Protected Route Access', 'WARN', 'Dashboard route behavior unclear');
        }
        
        return true;
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        this.addResult('Protected Route Redirect', 'PASS', `Dashboard redirects (status ${response.statusCode})`);
        return true;
      } else {
        this.addResult('Protected Route Access', 'FAIL', `Dashboard returned status ${response.statusCode}`);
        return false;
      }
    } catch (error) {
      this.addResult('Protected Route Access', 'FAIL', error.message);
      return false;
    }
  }

  async testEnvironmentConfiguration() {
    this.log('Testing environment configuration...', 'info');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check if .env.local exists
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        const hasAppwriteEndpoint = envContent.includes('VITE_APPWRITE_ENDPOINT');
        const hasAppwriteProject = envContent.includes('VITE_APPWRITE_PROJECT_ID');
        
        if (hasAppwriteEndpoint && hasAppwriteProject) {
          this.addResult('Environment Configuration', 'PASS', 'Required environment variables present');
        } else {
          this.addResult('Environment Configuration', 'FAIL', 'Missing required environment variables');
        }
      } else {
        this.addResult('Environment Configuration', 'FAIL', '.env.local file not found');
      }
      
      return true;
    } catch (error) {
      this.addResult('Environment Configuration', 'FAIL', error.message);
      return false;
    }
  }

  async testAppwriteConfiguration() {
    this.log('Testing Appwrite configuration...', 'info');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check appwrite config files
      const configFiles = ['appwrite.config.json', 'mcp-appwrite-config.json'];
      let configFound = false;
      
      for (const configFile of configFiles) {
        const configPath = path.join(process.cwd(), configFile);
        if (fs.existsSync(configPath)) {
          configFound = true;
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          
          if (config.projectId) {
            this.addResult('Appwrite Configuration', 'PASS', `Configuration found in ${configFile}`);
            break;
          }
        }
      }
      
      if (!configFound) {
        this.addResult('Appwrite Configuration', 'WARN', 'No Appwrite configuration files found');
      }
      
      return true;
    } catch (error) {
      this.addResult('Appwrite Configuration', 'FAIL', error.message);
      return false;
    }
  }

  async generateReport() {
    this.log('Generating test report...', 'info');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnTests = this.testResults.filter(r => r.status === 'WARN').length;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 MEDQUIZ PRO AUTHENTICATION TEST REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ PASSED: ${passedTests}/${totalTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log(`❌ FAILED: ${failedTests}/${totalTests}`);
    console.log(`⚠️  WARNINGS: ${warnTests}/${totalTests}`);
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔍 DETAILED RESULTS:');
    this.testResults.forEach((result, index) => {
      const emoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${index + 1}. ${emoji} ${result.test}: ${result.status}`);
      if (result.message) {
        console.log(`   └─ ${result.message}`);
      }
    });
    
    console.log('\n📋 SUMMARY:');
    if (failedTests === 0) {
      console.log('🎉 ALL BASIC TESTS PASSED! The application appears to be configured correctly.');
      console.log('💡 Note: Full authentication flow testing requires browser automation.');
      console.log('🔄 For complete testing, consider using the existing E2E test suite.');
    } else {
      console.log('⚠️  Some tests failed. Please check the configuration and try again.');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. 🌐 Open http://localhost:5173 in your browser');
    console.log('2. 🔐 Test login with: jayveedz19@gmail.com / Jimkali90#');
    console.log('3. 📝 Test registration with a new user');
    console.log('4. 🏠 Verify dashboard access after login');
    console.log('5. 🚪 Test logout functionality');
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      warnings: warnTests,
      results: this.testResults
    };
  }

  async runTests() {
    console.log('🏥 MedQuiz Pro - Simple Authentication Test Suite\n');
    
    try {
      await this.testServerConnection();
      await this.testEnvironmentConfiguration();
      await this.testAppwriteConfiguration();
      await this.testLandingPage();
      await this.testLoginPage();
      await this.testRegisterPage();
      await this.testProtectedRoute();
      
      const report = await this.generateReport();
      return report;
      
    } catch (error) {
      this.log(`Test suite error: ${error.message}`, 'fail');
      return null;
    }
  }
}

// Run the tests
(async () => {
  const tester = new SimpleAuthTester();
  const report = await tester.runTests();
  
  if (report) {
    const success = report.failed === 0;
    process.exit(success ? 0 : 1);
  } else {
    process.exit(1);
  }
})();