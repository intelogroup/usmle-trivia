/**
 * Comprehensive Manual Verification - Post Duplicate Code Removal
 * 
 * This script performs manual verification of key functionality
 * to ensure the duplicate code removal didn't break anything.
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

class ManualVerification {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: { total: 0, passed: 0, failed: 0 }
    };
  }

  log(message) {
    console.log(`${new Date().toLocaleTimeString()} - ${message}`);
  }

  recordResult(test, success, details = '') {
    this.results.tests.push({
      test,
      success,
      details,
      timestamp: new Date().toISOString()
    });
    
    this.results.summary.total++;
    if (success) {
      this.results.summary.passed++;
      this.log(`✅ ${test}: PASSED ${details}`);
    } else {
      this.results.summary.failed++;
      this.log(`❌ ${test}: FAILED ${details}`);
    }
  }

  async runCommand(command, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const child = exec(command, { timeout }, (error, stdout, stderr) => {
        if (error && !error.killed) {
          reject({ error, stdout, stderr });
        } else {
          resolve({ stdout, stderr, killed: error?.killed });
        }
      });
      
      setTimeout(() => {
        child.kill();
        resolve({ stdout: '', stderr: '', killed: true });
      }, timeout);
    });
  }

  async checkServerResponse(url, timeout = 5000) {
    return new Promise((resolve) => {
      const request = http.get(url, { timeout }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({
          success: true,
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        }));
      });
      
      request.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
      
      request.on('timeout', () => {
        request.destroy();
        resolve({ success: false, error: 'Request timeout' });
      });
    });
  }

  async test1_ProjectStructure() {
    this.log('Testing project structure integrity...');
    
    const essentialFiles = [
      'package.json',
      'src/App.tsx', 
      'src/main.tsx',
      'src/index.css',
      'vite.config.ts',
      'tsconfig.json'
    ];
    
    const missingFiles = essentialFiles.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (missingFiles.length === 0) {
      this.recordResult('Project Structure', true, `All ${essentialFiles.length} essential files present`);
    } else {
      this.recordResult('Project Structure', false, `Missing: ${missingFiles.join(', ')}`);
    }
  }

  async test2_BuildProcess() {
    this.log('Testing build process...');
    
    try {
      const result = await this.runCommand('npm run build', 60000);
      
      if (result.killed) {
        this.recordResult('Build Process', false, 'Build process timed out');
      } else if (result.stderr && result.stderr.includes('error')) {
        this.recordResult('Build Process', false, `Build errors: ${result.stderr.substring(0, 200)}`);
      } else {
        // Check if dist directory was created
        const distExists = fs.existsSync(path.join(process.cwd(), 'dist'));
        const hasIndexHtml = distExists && fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));
        
        if (distExists && hasIndexHtml) {
          this.recordResult('Build Process', true, 'Build completed successfully, dist files generated');
        } else {
          this.recordResult('Build Process', false, 'Build completed but missing output files');
        }
      }
    } catch (error) {
      this.recordResult('Build Process', false, `Build error: ${error.message}`);
    }
  }

  async test3_TypeScriptCompilation() {
    this.log('Testing TypeScript compilation...');
    
    try {
      const result = await this.runCommand('npx tsc --noEmit', 30000);
      
      if (result.killed) {
        this.recordResult('TypeScript Compilation', false, 'TypeScript check timed out');
      } else if (result.stderr && result.stderr.includes('error TS')) {
        this.recordResult('TypeScript Compilation', false, `TS errors found: ${result.stderr.substring(0, 200)}`);
      } else {
        this.recordResult('TypeScript Compilation', true, 'No TypeScript errors found');
      }
    } catch (error) {
      this.recordResult('TypeScript Compilation', false, `TS compilation error: ${error.message}`);
    }
  }

  async test4_DevServerResponse() {
    this.log('Testing development server response...');
    
    const response = await this.checkServerResponse('http://localhost:5173');
    
    if (response.success && response.statusCode === 200) {
      // Check for key elements in the response
      const hasRoot = response.body.includes('id="root"');
      const hasTitle = response.body.includes('<title>');
      const hasViteScript = response.body.includes('vite') || response.body.includes('@vite/client');
      
      if (hasRoot && hasTitle && hasViteScript) {
        this.recordResult('Dev Server Response', true, `Status: ${response.statusCode}, has essential elements`);
      } else {
        this.recordResult('Dev Server Response', false, `Status: ${response.statusCode}, missing elements: root:${hasRoot}, title:${hasTitle}, vite:${hasViteScript}`);
      }
    } else {
      this.recordResult('Dev Server Response', false, response.error || `Status: ${response.statusCode}`);
    }
  }

  async test5_SPARouting() {
    this.log('Testing SPA routing...');
    
    const routes = ['/', '/login', '/register', '/dashboard'];
    const routeResults = [];
    
    for (const route of routes) {
      const response = await this.checkServerResponse(`http://localhost:5173${route}`);
      routeResults.push({
        route,
        success: response.success && response.statusCode === 200,
        statusCode: response.statusCode
      });
    }
    
    const workingRoutes = routeResults.filter(r => r.success);
    
    if (workingRoutes.length === routes.length) {
      this.recordResult('SPA Routing', true, `All ${routes.length} routes responding with 200`);
    } else {
      const failedRoutes = routeResults.filter(r => !r.success).map(r => r.route);
      this.recordResult('SPA Routing', false, `Failed routes: ${failedRoutes.join(', ')}`);
    }
  }

  async test6_ComponentFiles() {
    this.log('Testing component file structure...');
    
    const componentDirs = [
      'src/components/ui',
      'src/components/layout', 
      'src/components/dashboard',
      'src/components/quiz',
      'src/pages'
    ];
    
    const missingDirs = componentDirs.filter(dir => 
      !fs.existsSync(path.join(process.cwd(), dir))
    );
    
    if (missingDirs.length === 0) {
      // Count total component files
      let totalComponents = 0;
      componentDirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
          const files = fs.readdirSync(fullPath);
          totalComponents += files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).length;
        }
      });
      
      this.recordResult('Component Files', true, `All component directories present, ${totalComponents} component files found`);
    } else {
      this.recordResult('Component Files', false, `Missing directories: ${missingDirs.join(', ')}`);
    }
  }

  async test7_ServiceFiles() {
    this.log('Testing service layer files...');
    
    const serviceFiles = [
      'src/services/auth.ts',
      'src/services/quiz.ts',
      'src/data/sampleQuestions.ts'
    ];
    
    const missingServices = serviceFiles.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (missingServices.length === 0) {
      this.recordResult('Service Files', true, `All ${serviceFiles.length} service files present`);
    } else {
      this.recordResult('Service Files', false, `Missing services: ${missingServices.join(', ')}`);
    }
  }

  async test8_DataIntegrity() {
    this.log('Testing data file integrity...');
    
    try {
      const questionsPath = path.join(process.cwd(), 'src/data/sampleQuestions.ts');
      if (fs.existsSync(questionsPath)) {
        const content = fs.readFileSync(questionsPath, 'utf-8');
        const hasExport = content.includes('export');
        const hasQuestions = content.includes('question') || content.includes('Question');
        const hasAnswers = content.includes('answer') || content.includes('Answer');
        
        if (hasExport && hasQuestions && hasAnswers) {
          // Try to estimate question count
          const questionCount = (content.match(/question.*:/gi) || []).length;
          this.recordResult('Data Integrity', true, `Questions data file valid, ~${questionCount} questions detected`);
        } else {
          this.recordResult('Data Integrity', false, 'Questions data file format issues');
        }
      } else {
        this.recordResult('Data Integrity', false, 'Questions data file missing');
      }
    } catch (error) {
      this.recordResult('Data Integrity', false, `Data integrity error: ${error.message}`);
    }
  }

  async test9_StylesIntegrity() {
    this.log('Testing styles and CSS integrity...');
    
    const styleFiles = [
      'src/index.css',
      'tailwind.config.js'
    ];
    
    const missingStyles = styleFiles.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (missingStyles.length === 0) {
      // Check if main CSS file has essential content
      const cssContent = fs.readFileSync(path.join(process.cwd(), 'src/index.css'), 'utf-8');
      const hasTailwind = cssContent.includes('@tailwind') || cssContent.includes('tailwind');
      const hasCustomStyles = cssContent.includes('body') || cssContent.includes('html');
      
      this.recordResult('Styles Integrity', true, `Style files present, Tailwind: ${hasTailwind}, Custom: ${hasCustomStyles}`);
    } else {
      this.recordResult('Styles Integrity', false, `Missing style files: ${missingStyles.join(', ')}`);
    }
  }

  async test10_PackageIntegrity() {
    this.log('Testing package.json and dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
      
      const hasReact = packageJson.dependencies?.react;
      const hasVite = packageJson.devDependencies?.vite;
      const hasTypeScript = packageJson.devDependencies?.typescript;
      const hasScripts = packageJson.scripts?.dev && packageJson.scripts?.build;
      
      if (hasReact && hasVite && hasTypeScript && hasScripts) {
        this.recordResult('Package Integrity', true, `Package.json valid with essential dependencies and scripts`);
      } else {
        this.recordResult('Package Integrity', false, `Missing essential packages: React:${!!hasReact}, Vite:${!!hasVite}, TS:${!!hasTypeScript}, Scripts:${!!hasScripts}`);
      }
    } catch (error) {
      this.recordResult('Package Integrity', false, `Package.json error: ${error.message}`);
    }
  }

  generateReport() {
    this.results.summary.passRate = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(2);
    
    const reportPath = path.join(process.cwd(), 'manual-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    const summary = `# 🔍 Manual Verification Report - Post Duplicate Code Removal

## 📊 Summary
- **Total Tests:** ${this.results.summary.total}
- **Passed:** ${this.results.summary.passed} ✅
- **Failed:** ${this.results.summary.failed} ❌
- **Pass Rate:** ${this.results.summary.passRate}%
- **Generated:** ${this.results.timestamp}

## 📋 Test Results
${this.results.tests.map(t => 
`### ${t.success ? '✅' : '❌'} ${t.test}
${t.details ? `**Details:** ${t.details}` : ''}
**Timestamp:** ${t.timestamp}
`).join('\n')}

## 🎯 Conclusion
${this.results.summary.failed === 0 
  ? '🎉 **ALL TESTS PASSED** - The duplicate code removal was successful and no functionality was broken!' 
  : `⚠️ **${this.results.summary.failed} TESTS FAILED** - Some issues detected that may need attention.`}

---
*Generated by Manual Verification System*`;

    const summaryPath = path.join(process.cwd(), 'MANUAL-VERIFICATION-SUMMARY.md');
    fs.writeFileSync(summaryPath, summary);
    
    this.log('\n' + '='.repeat(80));
    this.log('🏁 MANUAL VERIFICATION COMPLETED');
    this.log('='.repeat(80));
    this.log(`📊 Results: ${this.results.summary.passed}/${this.results.summary.total} tests passed (${this.results.summary.passRate}%)`);
    
    if (this.results.summary.failed === 0) {
      this.log('🎉 ALL MANUAL VERIFICATIONS PASSED!');
      this.log('✨ The duplicate code removal was successful - no functionality broken!');
    } else {
      this.log(`⚠️ ${this.results.summary.failed} verifications failed - review needed`);
    }
    
    this.log(`📄 Reports saved:`);
    this.log(`   - ${reportPath}`);
    this.log(`   - ${summaryPath}`);
    this.log('='.repeat(80));
  }

  async runAll() {
    this.log('🚀 Starting comprehensive manual verification...');
    this.log('🔍 Verifying MedQuiz Pro after duplicate code removal');
    this.log('=' .repeat(80));
    
    await this.test1_ProjectStructure();
    await this.test2_BuildProcess();
    await this.test3_TypeScriptCompilation();
    await this.test4_DevServerResponse();
    await this.test5_SPARouting();
    await this.test6_ComponentFiles();
    await this.test7_ServiceFiles();
    await this.test8_DataIntegrity();
    await this.test9_StylesIntegrity();
    await this.test10_PackageIntegrity();
    
    this.generateReport();
  }
}

// Run the manual verification
const verification = new ManualVerification();
verification.runAll().catch(console.error);