#!/usr/bin/env node

/**
 * Diagnose Convex Backend Issues
 * Checks deployment status and tests API endpoints
 */

const fs = require('fs');
const { chromium } = require('playwright');

async function diagnoseConvexBackend() {
  console.log('🔍 Diagnosing Convex Backend Issues');
  
  const results = {
    timestamp: new Date().toISOString(),
    diagnostics: [],
    errors: [],
    networkLogs: []
  };

  // Check environment configuration
  console.log('\n📋 Step 1: Checking Environment Configuration...');
  
  try {
    // Check for .env.local
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const hasConvexUrl = envContent.includes('VITE_CONVEX_URL');
      const hasValidUrl = envContent.includes('https://');
      
      results.diagnostics.push(`✅ .env.local exists`);
      results.diagnostics.push(`${hasConvexUrl ? '✅' : '❌'} VITE_CONVEX_URL configured`);
      results.diagnostics.push(`${hasValidUrl ? '✅' : '❌'} Valid Convex URL format`);
      
      if (hasConvexUrl && hasValidUrl) {
        // Extract URL
        const urlMatch = envContent.match(/VITE_CONVEX_URL="?([^"\n]+)"?/);
        if (urlMatch) {
          const convexUrl = urlMatch[1];
          console.log(`📡 Convex URL: ${convexUrl}`);
          results.diagnostics.push(`📡 Convex URL: ${convexUrl}`);
        }
      }
    } else {
      results.diagnostics.push('❌ .env.local not found');
    }
  } catch (error) {
    results.errors.push(`Environment check error: ${error.message}`);
  }

  // Check package.json for Convex Auth version
  console.log('\n📦 Step 2: Checking Package Dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const convexAuthVersion = packageJson.dependencies?.['@convex-dev/auth'] || packageJson.devDependencies?.['@convex-dev/auth'];
    const convexVersion = packageJson.dependencies?.['convex'] || packageJson.devDependencies?.['convex'];
    
    results.diagnostics.push(`📦 @convex-dev/auth version: ${convexAuthVersion || 'Not found'}`);
    results.diagnostics.push(`📦 convex version: ${convexVersion || 'Not found'}`);
    
    console.log(`@convex-dev/auth: ${convexAuthVersion}`);
    console.log(`convex: ${convexVersion}`);
  } catch (error) {
    results.errors.push(`Package.json check error: ${error.message}`);
  }

  // Test network connectivity to Convex
  console.log('\n🌐 Step 3: Testing Network Connectivity...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Monitor network requests
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('convex') || url.includes('auth')) {
      results.networkLogs.push(`${status} ${url}`);
      console.log(`📡 ${status} ${url}`);
      
      if (!response.ok()) {
        results.errors.push(`Network error: ${status} ${url}`);
      }
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('convex')) {
      results.errors.push(`Console error: ${msg.text()}`);
      console.log(`❌ Console: ${msg.text()}`);
    }
  });

  try {
    // Load the production site
    await page.goto('https://usmle-trivia.netlify.app/', { waitUntil: 'networkidle' });
    results.diagnostics.push('✅ Site loads successfully');

    // Try to trigger a Convex request
    await page.goto('https://usmle-trivia.netlify.app/login', { waitUntil: 'networkidle' });
    results.diagnostics.push('✅ Login page loads successfully');

    // Fill in a form to trigger auth request
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    
    if (emailInput > 0 && passwordInput > 0) {
      await page.locator('input[type="email"]').fill('test@test.com');
      await page.locator('input[type="password"]').fill('testpass');
      
      // Try to submit to trigger backend request
      const submitButton = await page.locator('button[type="submit"]').count();
      if (submitButton > 0) {
        console.log('🔍 Triggering auth request...');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(5000); // Wait for response
        
        results.diagnostics.push('✅ Auth request triggered');
      }
    }

  } catch (error) {
    results.errors.push(`Browser test error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Check Convex schema file
  console.log('\n📄 Step 4: Checking Convex Schema...');
  
  try {
    if (fs.existsSync('convex/schema.ts')) {
      const schemaContent = fs.readFileSync('convex/schema.ts', 'utf8');
      const hasUsers = schemaContent.includes('users');
      const hasUserProfiles = schemaContent.includes('userProfiles');
      const hasAuth = schemaContent.includes('auth') || schemaContent.includes('Auth');
      
      results.diagnostics.push(`${hasUsers ? '✅' : '❌'} Users table in schema`);
      results.diagnostics.push(`${hasUserProfiles ? '✅' : '❌'} UserProfiles table in schema`);
      results.diagnostics.push(`${hasAuth ? '✅' : '❌'} Auth configuration in schema`);
    } else {
      results.diagnostics.push('❌ convex/schema.ts not found');
    }
  } catch (error) {
    results.errors.push(`Schema check error: ${error.message}`);
  }

  // Check for generated files
  console.log('\n⚙️ Step 5: Checking Generated Files...');
  
  const generatedFiles = [
    'convex/_generated/api.d.ts',
    'convex/_generated/api.js',
    'convex/_generated/dataModel.d.ts',
    'convex/_generated/server.d.ts',
    'convex/_generated/server.js'
  ];
  
  generatedFiles.forEach(file => {
    const exists = fs.existsSync(file);
    results.diagnostics.push(`${exists ? '✅' : '❌'} ${file}`);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
  });

  // Save results
  fs.writeFileSync('convex-backend-diagnosis.json', JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('🔍 CONVEX BACKEND DIAGNOSIS SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n📋 Diagnostics:');
  results.diagnostics.forEach(diag => {
    console.log(`  ${diag}`);
  });
  
  console.log('\n🚨 Errors Found:');
  results.errors.forEach(error => {
    console.log(`  ${error}`);
  });
  
  console.log('\n📡 Network Activity:');
  results.networkLogs.forEach(log => {
    console.log(`  ${log}`);
  });

  console.log(`\nDiagnosis completed at: ${new Date().toISOString()}`);
  console.log('Results saved to: convex-backend-diagnosis.json');
  
  // Provide recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (results.errors.length > 0) {
    console.log('🔧 Issues detected that need attention:');
    
    const hasServerError = results.errors.some(e => e.includes('Server Error'));
    if (hasServerError) {
      console.log('  1. Convex Auth server error - check backend deployment');
      console.log('  2. Verify Convex Auth configuration in auth.ts');
      console.log('  3. Check if Convex functions are properly deployed');
    }
    
    const hasNetworkError = results.errors.some(e => e.includes('Network error'));
    if (hasNetworkError) {
      console.log('  4. Network connectivity issues to Convex backend');
      console.log('  5. Verify VITE_CONVEX_URL is correct and accessible');
    }
  }
  
  console.log('\n🚀 Next steps:');
  console.log('  1. Run: npm run dev:backend (if available)');
  console.log('  2. Run: npx convex dev');
  console.log('  3. Check Convex dashboard for deployment status');
  console.log('  4. Verify environment variables are properly configured');
}

if (require.main === module) {
  diagnoseConvexBackend().catch(console.error);
}

module.exports = { diagnoseConvexBackend };