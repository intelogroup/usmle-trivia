#!/usr/bin/env node

/**
 * MedQuiz Pro Production Issue Diagnostic Script
 * Comprehensive investigation of registration form JavaScript issues
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

const REPORT_FILE = 'production-debug-report.json';
const NETLIFY_URL = process.env.NETLIFY_URL || 'https://medquiz-pro.netlify.app';

async function runDiagnostics() {
  const report = {
    timestamp: new Date().toISOString(),
    diagnostics: {
      buildHealth: null,
      environmentVariables: null,
      cspAnalysis: null,
      networkRequests: null,
      javascriptErrors: null,
      formFunctionality: null,
      convexConnection: null,
    },
    issues: [],
    solutions: [],
    summary: null
  };

  console.log('🔍 Starting MedQuiz Pro production issue diagnostics...\n');

  // 1. Build Health Check
  console.log('1️⃣ Checking build health...');
  try {
    const buildResult = await checkBuildHealth();
    report.diagnostics.buildHealth = buildResult;
    console.log(`✅ Build Health: ${buildResult.status}\n`);
  } catch (error) {
    report.diagnostics.buildHealth = { status: 'error', error: error.message };
    report.issues.push('Build process has issues');
    console.log(`❌ Build Health: Error - ${error.message}\n`);
  }

  // 2. Environment Variables Check
  console.log('2️⃣ Checking environment variables...');
  try {
    const envResult = await checkEnvironmentVariables();
    report.diagnostics.environmentVariables = envResult;
    if (envResult.convexUrlPresent) {
      console.log('✅ Environment variables: VITE_CONVEX_URL found in build');
    } else {
      console.log('❌ Environment variables: VITE_CONVEX_URL missing');
      report.issues.push('VITE_CONVEX_URL not found in production build');
    }
  } catch (error) {
    report.diagnostics.environmentVariables = { error: error.message };
    report.issues.push('Environment variable check failed');
  }

  // 3. CSP Analysis
  console.log('\n3️⃣ Analyzing Content Security Policy...');
  try {
    const cspResult = await analyzeCSP();
    report.diagnostics.cspAnalysis = cspResult;
    if (cspResult.reactCompatible) {
      console.log('✅ CSP: Compatible with React applications');
    } else {
      console.log('❌ CSP: May block React JavaScript execution');
      report.issues.push('CSP may be too restrictive for React');
      report.solutions.push('Update CSP to allow React JavaScript patterns');
    }
  } catch (error) {
    report.diagnostics.cspAnalysis = { error: error.message };
  }

  // 4. Production Site Testing
  console.log('\n4️⃣ Testing production site functionality...');
  try {
    const siteResult = await testProductionSite();
    report.diagnostics.networkRequests = siteResult.networkRequests;
    report.diagnostics.javascriptErrors = siteResult.javascriptErrors;
    report.diagnostics.formFunctionality = siteResult.formFunctionality;
    report.diagnostics.convexConnection = siteResult.convexConnection;

    if (siteResult.formFunctionality.working) {
      console.log('✅ Form functionality: Working correctly');
    } else {
      console.log('❌ Form functionality: Not working');
      report.issues.push('Registration form JavaScript not functioning');
    }

    if (siteResult.javascriptErrors.length === 0) {
      console.log('✅ JavaScript errors: None detected');
    } else {
      console.log(`❌ JavaScript errors: ${siteResult.javascriptErrors.length} detected`);
      report.issues.push(`${siteResult.javascriptErrors.length} JavaScript errors found`);
    }

  } catch (error) {
    console.log(`❌ Production site testing failed: ${error.message}`);
    report.issues.push('Production site testing failed');
  }

  // Generate solutions based on detected issues
  generateSolutions(report);

  // Save report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n📊 Diagnostic report saved to ${REPORT_FILE}`);

  // Print summary
  printSummary(report);

  return report;
}

async function checkBuildHealth() {
  return new Promise((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'pipe' });
    let output = '';
    let error = '';

    buildProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    buildProcess.on('close', (code) => {
      const bundleInfo = extractBundleInfo(output);
      
      if (code === 0) {
        resolve({
          status: 'success',
          exitCode: code,
          bundleSize: bundleInfo.totalSize,
          chunkCount: bundleInfo.chunkCount,
          hasSourcemaps: bundleInfo.hasSourcemaps,
          output: output.split('\n').slice(-10) // Last 10 lines
        });
      } else {
        reject(new Error(`Build failed with code ${code}: ${error}`));
      }
    });
  });
}

function extractBundleInfo(output) {
  const lines = output.split('\n');
  let totalSize = 0;
  let chunkCount = 0;
  let hasSourcemaps = false;

  lines.forEach(line => {
    if (line.includes('.js') && line.includes('kB')) {
      const sizeMatch = line.match(/(\d+\.\d+)\s*kB/);
      if (sizeMatch) {
        totalSize += parseFloat(sizeMatch[1]);
        chunkCount++;
      }
    }
    if (line.includes('.js.map')) {
      hasSourcemaps = true;
    }
  });

  return { totalSize, chunkCount, hasSourcemaps };
}

async function checkEnvironmentVariables() {
  const distPath = path.join(__dirname, 'dist');
  
  if (!fs.existsSync(distPath)) {
    throw new Error('dist directory not found - build may have failed');
  }

  const assetFiles = fs.readdirSync(path.join(distPath, 'assets'))
    .filter(file => file.endsWith('.js'));

  let convexUrlFound = false;
  let environmentFileContent = '';

  // Check for VITE_CONVEX_URL in bundle files
  for (const file of assetFiles) {
    const filePath = path.join(distPath, 'assets', file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('formal-sardine-916.convex.cloud')) {
      convexUrlFound = true;
      if (content.includes('VITE_CONVEX_URL')) {
        // Extract environment variables section
        const envMatch = content.match(/VITE_[^"]+":"[^"]+"/g);
        if (envMatch) {
          environmentFileContent = envMatch.join('\n');
        }
      }
    }
  }

  return {
    convexUrlPresent: convexUrlFound,
    environmentVariables: environmentFileContent,
    bundleFiles: assetFiles.length,
    distExists: true
  };
}

async function analyzeCSP() {
  const netlifyConfig = fs.readFileSync(path.join(__dirname, 'netlify.toml'), 'utf8');
  
  const cspMatch = netlifyConfig.match(/Content-Security-Policy\s*=\s*"([^"]+)"/);
  
  if (!cspMatch) {
    return { error: 'CSP not found in netlify.toml' };
  }

  const csp = cspMatch[1];
  const policies = csp.split(';').map(p => p.trim());

  const analysis = {
    rawCSP: csp,
    policies: {},
    reactCompatible: true,
    issues: []
  };

  policies.forEach(policy => {
    const [directive, ...values] = policy.split(' ');
    analysis.policies[directive] = values;
  });

  // Check React compatibility
  if (!analysis.policies['script-src'] || 
      !analysis.policies['script-src'].includes("'unsafe-inline'")) {
    analysis.reactCompatible = false;
    analysis.issues.push('script-src missing unsafe-inline for React');
  }

  if (!analysis.policies['script-src'] || 
      !analysis.policies['script-src'].includes("'unsafe-eval'")) {
    analysis.reactCompatible = false;
    analysis.issues.push('script-src missing unsafe-eval for React');
  }

  return analysis;
}

async function testProductionSite() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const result = {
    networkRequests: [],
    javascriptErrors: [],
    formFunctionality: { working: false, errors: [] },
    convexConnection: { established: false, errors: [] }
  };

  // Monitor network requests
  page.on('request', request => {
    result.networkRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType()
    });
  });

  // Monitor JavaScript errors
  page.on('pageerror', error => {
    result.javascriptErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  page.on('console', message => {
    if (message.type() === 'error') {
      result.javascriptErrors.push({
        message: message.text(),
        type: 'console-error'
      });
    }
  });

  try {
    // Navigate to registration page
    console.log(`   Loading ${NETLIFY_URL}/register...`);
    await page.goto(`${NETLIFY_URL}/register`, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 });

    // Test form functionality
    const formWorking = await page.evaluate(() => {
      const form = document.querySelector('form');
      const nameInput = document.querySelector('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInputs = document.querySelectorAll('input[type="password"]');
      const submitButton = document.querySelector('button[type="submit"]');

      return {
        formExists: !!form,
        nameInputExists: !!nameInput,
        emailInputExists: !!emailInput,
        passwordInputsExist: passwordInputs.length >= 2,
        submitButtonExists: !!submitButton,
        formHasEventListeners: !!(form && form.onsubmit),
      };
    });

    // Test form submission
    try {
      await page.type('input[type="text"]', 'Test User');
      await page.type('input[type="email"]', 'test@example.com');
      
      const passwordInputs = await page.$$('input[type="password"]');
      await passwordInputs[0].type('TestPassword123!');
      await passwordInputs[1].type('TestPassword123!');

      // Check if submit button becomes enabled/interactive
      const submitButton = await page.$('button[type="submit"]');
      const buttonEnabled = await page.evaluate(btn => !btn.disabled, submitButton);

      result.formFunctionality = {
        working: formWorking.formExists && formWorking.submitButtonExists,
        details: formWorking,
        buttonEnabled,
        formFilled: true
      };

    } catch (error) {
      result.formFunctionality.errors.push(`Form interaction failed: ${error.message}`);
    }

    // Check Convex connection
    const convexCheck = await page.evaluate(() => {
      try {
        // Check if ConvexReactClient is available
        return {
          convexGlobalExists: typeof window.convex !== 'undefined',
          reactMounted: !!document.querySelector('#root').innerHTML,
          convexEnvVar: window.location.href.includes('formal-sardine-916')
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    result.convexConnection.established = !convexCheck.error;
    result.convexConnection.details = convexCheck;

  } catch (error) {
    result.javascriptErrors.push({
      message: `Page navigation failed: ${error.message}`,
      type: 'navigation-error'
    });
  }

  await browser.close();
  return result;
}

function generateSolutions(report) {
  const { issues, solutions } = report;

  if (issues.includes('CSP may be too restrictive for React')) {
    solutions.push({
      issue: 'Content Security Policy blocking React',
      solution: 'Update netlify.toml CSP to allow React patterns',
      action: 'Add \'unsafe-inline\' and \'unsafe-eval\' to script-src directive'
    });
  }

  if (issues.includes('VITE_CONVEX_URL not found in production build')) {
    solutions.push({
      issue: 'Environment variable not in build',
      solution: 'Ensure VITE_CONVEX_URL is set in Netlify environment variables',
      action: 'Check Netlify dashboard > Site settings > Environment variables'
    });
  }

  if (issues.includes('Registration form JavaScript not functioning')) {
    solutions.push({
      issue: 'Form JavaScript not working',
      solution: 'Debug React component mounting and event handlers',
      action: 'Check browser console for React hydration errors'
    });
  }

  if (issues.length === 0) {
    solutions.push({
      issue: 'No issues detected',
      solution: 'Configuration appears correct',
      action: 'Check for temporary network/deployment issues'
    });
  }
}

function printSummary(report) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 PRODUCTION DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n🕐 Timestamp: ${report.timestamp}`);
  console.log(`🎯 Target: ${NETLIFY_URL}`);

  if (report.issues.length > 0) {
    console.log(`\n❌ Issues Found (${report.issues.length}):`);
    report.issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ No Issues Detected');
  }

  if (report.solutions.length > 0) {
    console.log(`\n🔧 Recommended Solutions:`);
    report.solutions.forEach((solution, i) => {
      if (typeof solution === 'string') {
        console.log(`   ${i + 1}. ${solution}`);
      } else {
        console.log(`   ${i + 1}. ${solution.solution}`);
        console.log(`      Action: ${solution.action}`);
      }
    });
  }

  // Build summary
  const build = report.diagnostics.buildHealth;
  if (build && build.status === 'success') {
    console.log(`\n📦 Build: ✅ Success (${build.bundleSize.toFixed(1)}kB, ${build.chunkCount} chunks)`);
  }

  // Environment summary
  const env = report.diagnostics.environmentVariables;
  if (env && env.convexUrlPresent) {
    console.log(`📍 Environment: ✅ VITE_CONVEX_URL configured`);
  } else {
    console.log(`📍 Environment: ❌ Missing configuration`);
  }

  // CSP summary
  const csp = report.diagnostics.cspAnalysis;
  if (csp && csp.reactCompatible) {
    console.log(`🔒 Security: ✅ CSP compatible with React`);
  } else {
    console.log(`🔒 Security: ⚠️  CSP may block React execution`);
  }

  console.log('\n' + '='.repeat(60));
}

// Run diagnostics if called directly
if (require.main === module) {
  runDiagnostics()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Diagnostic script failed:', error);
      process.exit(1);
    });
}

module.exports = { runDiagnostics };