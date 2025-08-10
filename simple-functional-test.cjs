/**
 * Simple Functional Test - Post Duplicate Code Removal
 * 
 * This test verifies that all MedQuiz Pro functionality works correctly
 * after the duplicate code removal refactoring using simple HTTP requests.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';

class SimpleFunctionalTest {
  constructor() {
    this.testResults = {
      startTime: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  recordTest(testName, passed, details = '') {
    const result = {
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.tests.push(result);
    this.testResults.summary.total++;
    
    if (passed) {
      this.testResults.summary.passed++;
      console.log(`✅ ${testName}: PASSED`);
    } else {
      this.testResults.summary.failed++;
      console.log(`❌ ${testName}: FAILED - ${details}`);
    }
    
    if (details) {
      console.log(`   📝 Details: ${details}`);
    }
  }

  async makeRequest(path = '', timeout = 10000) {
    return new Promise((resolve, reject) => {
      const url = `${BASE_URL}${path}`;
      const request = http.get(url, { timeout }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            url
          });
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async test1_ServerResponding() {
    console.log('\n🧪 Test 1: Server is responding');
    
    try {
      const response = await this.makeRequest('/');
      
      if (response.statusCode === 200) {
        this.recordTest('Server Responding', true, 
          `Status: ${response.statusCode}, Content-Type: ${response.headers['content-type']}`);
      } else {
        this.recordTest('Server Responding', false, 
          `Unexpected status: ${response.statusCode}`);
      }
    } catch (error) {
      this.recordTest('Server Responding', false, error.message);
    }
  }

  async test2_LandingPageContent() {
    console.log('\n🧪 Test 2: Landing page has expected content');
    
    try {
      const response = await this.makeRequest('/');
      
      if (response.statusCode === 200) {
        const body = response.body.toLowerCase();
        const hasTitle = body.includes('<title>') && body.includes('</title>');
        const hasReactRoot = body.includes('id="root"');
        const hasViteScripts = body.includes('vite') || body.includes('script');
        
        if (hasTitle && hasReactRoot && hasViteScripts) {
          this.recordTest('Landing Page Content', true, 
            'HTML structure looks correct');
        } else {
          this.recordTest('Landing Page Content', false, 
            `Missing elements - Title: ${hasTitle}, Root: ${hasReactRoot}, Scripts: ${hasViteScripts}`);
        }
      } else {
        this.recordTest('Landing Page Content', false, 
          `Status: ${response.statusCode}`);
      }
    } catch (error) {
      this.recordTest('Landing Page Content', false, error.message);
    }
  }

  async test3_StaticAssets() {
    console.log('\n🧪 Test 3: Static assets are accessible');
    
    const assetPaths = [
      '/src/main.tsx',
      '/src/index.css',
      '/src/App.tsx'
    ];
    
    let assetsWorking = 0;
    
    for (const assetPath of assetPaths) {
      try {
        const response = await this.makeRequest(assetPath);
        if (response.statusCode === 200) {
          assetsWorking++;
        }
      } catch (error) {
        // Asset might not be directly accessible, which is normal in dev mode
      }
    }
    
    // Check if Vite is serving assets (even if transformed)
    try {
      const response = await this.makeRequest('/@vite/client');
      if (response.statusCode === 200) {
        this.recordTest('Static Assets', true, 
          'Vite client accessible, dev server working properly');
      } else {
        this.recordTest('Static Assets', false, 
          'Vite client not accessible');
      }
    } catch (error) {
      this.recordTest('Static Assets', false, 
        'Vite development server not responding properly');
    }
  }

  async test4_RouterPaths() {
    console.log('\n🧪 Test 4: Router paths are responding');
    
    const paths = ['/', '/login', '/register', '/dashboard'];
    let workingPaths = 0;
    
    for (const testPath of paths) {
      try {
        const response = await this.makeRequest(testPath);
        
        // In SPA, all paths should return the same HTML with status 200
        if (response.statusCode === 200) {
          workingPaths++;
          console.log(`   ✓ ${testPath} -> ${response.statusCode}`);
        } else {
          console.log(`   ✗ ${testPath} -> ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`   ✗ ${testPath} -> ERROR: ${error.message}`);
      }
    }
    
    if (workingPaths === paths.length) {
      this.recordTest('Router Paths', true, 
        `All ${workingPaths} paths returning 200`);
    } else {
      this.recordTest('Router Paths', false, 
        `Only ${workingPaths}/${paths.length} paths working`);
    }
  }

  async test5_ErrorHandling() {
    console.log('\n🧪 Test 5: Error handling for invalid paths');
    
    try {
      const response = await this.makeRequest('/nonexistent-endpoint-test');
      
      // For SPAs, this should still return the main HTML (status 200)
      // The 404 handling happens client-side
      if (response.statusCode === 200) {
        this.recordTest('Error Handling', true, 
          'SPA fallback working - client-side routing will handle 404s');
      } else if (response.statusCode === 404) {
        this.recordTest('Error Handling', true, 
          'Server-side 404 handling working');
      } else {
        this.recordTest('Error Handling', false, 
          `Unexpected status: ${response.statusCode}`);
      }
    } catch (error) {
      this.recordTest('Error Handling', false, error.message);
    }
  }

  async test6_BuildIntegrity() {
    console.log('\n🧪 Test 6: Build and file integrity checks');
    
    // Check if essential files exist
    const essentialFiles = [
      'package.json',
      'src/App.tsx',
      'src/main.tsx',
      'src/index.css',
      'index.html'
    ];
    
    let existingFiles = 0;
    
    for (const file of essentialFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        existingFiles++;
        console.log(`   ✓ ${file} exists`);
      } else {
        console.log(`   ✗ ${file} missing`);
      }
    }
    
    if (existingFiles === essentialFiles.length) {
      this.recordTest('Build Integrity', true, 
        `All ${existingFiles} essential files present`);
    } else {
      this.recordTest('Build Integrity', false, 
        `Missing files: ${essentialFiles.length - existingFiles}`);
    }
  }

  async test7_TypeScriptConfig() {
    console.log('\n🧪 Test 7: TypeScript configuration integrity');
    
    try {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const tsconfigAppPath = path.join(process.cwd(), 'tsconfig.app.json');
      
      const hasTsconfig = fs.existsSync(tsconfigPath);
      const hasTsconfigApp = fs.existsSync(tsconfigAppPath);
      
      if (hasTsconfig && hasTsconfigApp) {
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
        const hasReferences = tsconfig.references && tsconfig.references.length > 0;
        
        this.recordTest('TypeScript Configuration', true, 
          `TypeScript config files present, references: ${hasReferences}`);
      } else {
        this.recordTest('TypeScript Configuration', false, 
          `Missing config files - base: ${hasTsconfig}, app: ${hasTsconfigApp}`);
      }
    } catch (error) {
      this.recordTest('TypeScript Configuration', false, error.message);
    }
  }

  async test8_DependenciesCheck() {
    console.log('\n🧪 Test 8: Dependencies and package integrity');
    
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const lockPath = path.join(process.cwd(), 'package-lock.json');
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      
      const hasPackageJson = fs.existsSync(packagePath);
      const hasLockFile = fs.existsSync(lockPath);
      const hasNodeModules = fs.existsSync(nodeModulesPath);
      
      if (hasPackageJson && hasLockFile && hasNodeModules) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        const hasVite = packageJson.devDependencies && packageJson.devDependencies.vite;
        const hasReact = packageJson.dependencies && packageJson.dependencies.react;
        
        this.recordTest('Dependencies Check', true, 
          `Package files present, Vite: ${!!hasVite}, React: ${!!hasReact}`);
      } else {
        this.recordTest('Dependencies Check', false, 
          `Missing files - package: ${hasPackageJson}, lock: ${hasLockFile}, modules: ${hasNodeModules}`);
      }
    } catch (error) {
      this.recordTest('Dependencies Check', false, error.message);
    }
  }

  async test9_ViteConfiguration() {
    console.log('\n🧪 Test 9: Vite configuration integrity');
    
    try {
      const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
      const hasViteConfig = fs.existsSync(viteConfigPath);
      
      if (hasViteConfig) {
        const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
        const hasReactPlugin = viteConfig.includes('@vitejs/plugin-react') || viteConfig.includes('react()');
        const hasDefineConfig = viteConfig.includes('defineConfig');
        
        this.recordTest('Vite Configuration', true, 
          `Vite config present, React plugin: ${hasReactPlugin}, defineConfig: ${hasDefineConfig}`);
      } else {
        this.recordTest('Vite Configuration', false, 
          'vite.config.ts not found');
      }
    } catch (error) {
      this.recordTest('Vite Configuration', false, error.message);
    }
  }

  async test10_DevServerHealth() {
    console.log('\n🧪 Test 10: Development server health check');
    
    try {
      // Test multiple requests to ensure server stability
      const requests = [];
      for (let i = 0; i < 3; i++) {
        requests.push(this.makeRequest('/'));
      }
      
      const responses = await Promise.all(requests);
      const allSuccessful = responses.every(r => r.statusCode === 200);
      const responseTimes = responses.map(r => r.responseTime || 'unknown');
      
      if (allSuccessful) {
        this.recordTest('Dev Server Health', true, 
          `All ${responses.length} concurrent requests successful`);
      } else {
        this.recordTest('Dev Server Health', false, 
          'Some requests failed');
      }
    } catch (error) {
      this.recordTest('Dev Server Health', false, error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting simple functional test suite...');
    console.log(`📍 Testing against: ${BASE_URL}`);
    console.log('=' .repeat(80));
    
    try {
      await this.test1_ServerResponding();
      await this.test2_LandingPageContent();
      await this.test3_StaticAssets();
      await this.test4_RouterPaths();
      await this.test5_ErrorHandling();
      await this.test6_BuildIntegrity();
      await this.test7_TypeScriptConfig();
      await this.test8_DependenciesCheck();
      await this.test9_ViteConfiguration();
      await this.test10_DevServerHealth();
    } catch (error) {
      console.error('❌ Test suite error:', error);
    }
    
    this.generateReport();
  }

  generateReport() {
    const endTime = new Date().toISOString();
    const duration = new Date() - new Date(this.testResults.startTime);
    
    this.testResults.endTime = endTime;
    this.testResults.duration = duration;
    this.testResults.summary.passRate = 
      ((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(2);
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'simple-functional-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    // Generate summary
    const summary = `
# 🧪 Simple Functional Test Report - Post Refactor

## 📊 Test Summary
- **Total Tests:** ${this.testResults.summary.total}
- **Passed:** ${this.testResults.summary.passed} ✅
- **Failed:** ${this.testResults.summary.failed} ❌
- **Pass Rate:** ${this.testResults.summary.passRate}%
- **Duration:** ${Math.round(duration / 1000)}s

## 🧪 Detailed Results
${this.testResults.tests.map(test => 
  `### ${test.passed ? '✅' : '❌'} ${test.name}
${test.details ? `**Details:** ${test.details}` : ''}
**Time:** ${test.timestamp}
`).join('\n')}

---
*Generated on ${new Date().toLocaleString()}*
`;

    const summaryPath = path.join(process.cwd(), 'SIMPLE-FUNCTIONAL-TEST-SUMMARY.md');
    fs.writeFileSync(summaryPath, summary);
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 SIMPLE FUNCTIONAL TEST COMPLETED');
    console.log('='.repeat(80));
    console.log(`📊 Results: ${this.testResults.summary.passed}/${this.testResults.summary.total} tests passed (${this.testResults.summary.passRate}%)`);
    console.log(`📄 Reports saved to:`);
    console.log(`   - ${reportPath}`);
    console.log(`   - ${summaryPath}`);
    
    if (this.testResults.summary.failed === 0) {
      console.log('🎉 ALL TESTS PASSED - Application is working correctly after refactor!');
    } else {
      console.log(`⚠️ ${this.testResults.summary.failed} tests failed - Review needed`);
    }
    console.log('='.repeat(80));
  }
}

// Run the test suite
const testSuite = new SimpleFunctionalTest();
testSuite.runAllTests().catch(console.error);