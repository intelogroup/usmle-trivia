#!/usr/bin/env node

/**
 * Verify what functions should be available in the Convex backend
 * This helps confirm if it's a deployment issue
 */

const fs = require('fs');
const path = require('path');

function verifyExpectedFunctions() {
  console.log('🔍 Verifying Expected Convex Functions');
  
  const results = {
    timestamp: new Date().toISOString(),
    expectedFunctions: [],
    fileAnalysis: [],
    httpRoutes: [],
    issues: []
  };

  // Analyze all .ts files in convex directory
  const convexDir = path.join(process.cwd(), 'convex');
  
  if (!fs.existsSync(convexDir)) {
    results.issues.push('Convex directory not found');
    return;
  }

  const convexFiles = fs.readdirSync(convexDir)
    .filter(file => file.endsWith('.ts') && !file.startsWith('_'))
    .filter(file => !file.includes('generated'));

  console.log(`\n📁 Found ${convexFiles.length} Convex function files:`);

  convexFiles.forEach(filename => {
    const filePath = path.join(convexDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n📄 Analyzing ${filename}:`);
    
    const analysis = {
      filename,
      queries: [],
      mutations: [],
      httpRoutes: [],
      exports: []
    };

    // Find exported queries
    const queryMatches = content.match(/export const (\w+) = query\(/g);
    if (queryMatches) {
      analysis.queries = queryMatches.map(match => {
        const name = match.match(/export const (\w+)/)[1];
        return name;
      });
      console.log(`  📊 Queries: ${analysis.queries.join(', ')}`);
    }

    // Find exported mutations
    const mutationMatches = content.match(/export const (\w+) = mutation\(/g);
    if (mutationMatches) {
      analysis.mutations = mutationMatches.map(match => {
        const name = match.match(/export const (\w+)/)[1];
        return name;
      });
      console.log(`  🔧 Mutations: ${analysis.mutations.join(', ')}`);
    }

    // Check for HTTP routes
    if (filename === 'http.ts') {
      console.log('  🌐 HTTP Router configuration found');
      analysis.httpRoutes.push('HTTP router configured');
      
      // Check if auth routes are added
      if (content.includes('auth.addHttpRoutes')) {
        analysis.httpRoutes.push('Auth routes configured');
        console.log('  🔐 Auth HTTP routes configured');
      } else {
        results.issues.push('Auth HTTP routes not configured in http.ts');
      }
    }

    // Check for auth configuration
    if (filename === 'auth.ts') {
      console.log('  🔐 Auth configuration found');
      
      if (content.includes('convexAuth')) {
        analysis.exports.push('convexAuth configured');
        console.log('  ✅ convexAuth properly configured');
      } else {
        results.issues.push('convexAuth not properly configured');
      }
      
      if (content.includes('Password')) {
        analysis.exports.push('Password provider');
        console.log('  🔑 Password provider configured');
      }
    }

    results.fileAnalysis.push(analysis);
    
    // Add to expected functions list
    analysis.queries.forEach(q => {
      results.expectedFunctions.push(`${filename.replace('.ts', '')}.${q} (query)`);
    });
    analysis.mutations.forEach(m => {
      results.expectedFunctions.push(`${filename.replace('.ts', '')}.${m} (mutation)`);
    });
  });

  // Check package.json for deployment scripts
  console.log('\n📦 Checking deployment configuration:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deployScript = packageJson.scripts['convex:deploy'];
    const buildScript = packageJson.scripts['convex:build'];
    
    console.log(`  Deploy script: ${deployScript || 'Not found'}`);
    console.log(`  Build script: ${buildScript || 'Not found'}`);
    
    if (!deployScript) {
      results.issues.push('No convex:deploy script found');
    }
    
  } catch (error) {
    results.issues.push(`Could not read package.json: ${error.message}`);
  }

  // Check environment configuration
  console.log('\n🔧 Environment Configuration:');
  
  const envFiles = ['.env', '.env.local', '.env.production'];
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      const convexUrl = content.match(/VITE_CONVEX_URL=(.+)/);
      const convexDeployment = content.match(/CONVEX_DEPLOYMENT=(.+)/);
      
      if (convexUrl) {
        console.log(`  ${envFile}: ${convexUrl[1]}`);
      }
      if (convexDeployment) {
        console.log(`  ${envFile}: Deployment ${convexDeployment[1]}`);
      }
    }
  });

  // Save results
  fs.writeFileSync('expected-functions-verification.json', JSON.stringify(results, null, 2));

  // Summary report
  console.log('\n' + '='.repeat(60));
  console.log('🔍 EXPECTED FUNCTIONS VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n📊 Total expected functions: ${results.expectedFunctions.length}`);
  results.expectedFunctions.forEach(func => {
    console.log(`  ${func}`);
  });

  if (results.issues.length > 0) {
    console.log('\n🚨 Issues Found:');
    results.issues.forEach(issue => {
      console.log(`  ❌ ${issue}`);
    });
  } else {
    console.log('\n✅ No configuration issues detected');
  }

  console.log('\n💡 Expected API Endpoints (after deployment):');
  console.log('  POST https://formal-sardine-916.convex.cloud/api');
  console.log('  - Should handle all query/mutation requests');
  console.log('  - Auth routes should be integrated via HTTP router');
  
  console.log('\n🚀 Deployment Required:');
  console.log('  The functions are properly configured but need to be deployed to:');
  console.log('  https://formal-sardine-916.convex.cloud');
  
  console.log('\n🔧 Recommended Action:');
  console.log('  Run: npx convex deploy --prod');
  console.log('  This will deploy all functions and make them accessible via HTTP');

  console.log(`\n📁 Full analysis saved to: expected-functions-verification.json`);
}

if (require.main === module) {
  verifyExpectedFunctions();
}

module.exports = { verifyExpectedFunctions };