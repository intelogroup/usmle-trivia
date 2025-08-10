#!/usr/bin/env node

/**
 * Fix MedQuiz Pro Production Deployment
 * This script addresses the JavaScript asset 404 issues
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

console.log('🔧 MedQuiz Pro Production Deployment Fix\n');

async function fixDeployment() {
  const fixes = [];
  
  console.log('1️⃣ Verifying local build...');
  
  // Check if dist exists and has assets
  const distPath = path.join(__dirname, 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ dist/ directory missing. Building now...');
    await runBuild();
    fixes.push('Built application from source');
  } else {
    console.log('✅ dist/ directory exists');
  }
  
  if (!fs.existsSync(assetsPath)) {
    console.log('❌ assets/ directory missing. Rebuilding...');
    await runBuild();
    fixes.push('Rebuilt assets');
  } else {
    const assetFiles = fs.readdirSync(assetsPath);
    console.log(`✅ Found ${assetFiles.length} asset files`);
  }

  console.log('\n2️⃣ Checking index.html asset references...');
  
  // Read index.html and verify asset references match actual files
  const indexPath = path.join(distPath, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  const scriptMatches = indexContent.match(/src="([^"]+\.js)"/g) || [];
  const scripts = scriptMatches.map(match => match.match(/src="([^"]+)"/)[1]);
  
  let mismatchFound = false;
  for (const script of scripts) {
    const scriptPath = path.join(distPath, script.substring(1)); // Remove leading /
    if (!fs.existsSync(scriptPath)) {
      console.log(`❌ Referenced script not found: ${script}`);
      mismatchFound = true;
    } else {
      console.log(`✅ Script exists: ${script}`);
    }
  }
  
  if (mismatchFound) {
    console.log('❌ Asset reference mismatch detected. Rebuilding...');
    await runBuild();
    fixes.push('Fixed asset reference mismatch');
  }

  console.log('\n3️⃣ Optimizing for Netlify deployment...');
  
  // Check _redirects file
  const redirectsPath = path.join(distPath, '_redirects');
  if (!fs.existsSync(redirectsPath)) {
    console.log('❌ _redirects file missing. Creating...');
    fs.writeFileSync(redirectsPath, '/*    /index.html   200\n');
    fixes.push('Created _redirects file for SPA routing');
  } else {
    console.log('✅ _redirects file exists');
  }

  console.log('\n4️⃣ Generating deployment verification file...');
  
  // Create a deployment info file
  const deploymentInfo = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    assetCount: fs.readdirSync(assetsPath).length,
    indexSize: fs.statSync(indexPath).size,
    fixes: fixes,
    environment: {
      VITE_CONVEX_URL: 'https://formal-sardine-916.convex.cloud'
    }
  };
  
  fs.writeFileSync(
    path.join(distPath, 'deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('\n5️⃣ Creating Netlify deployment instructions...');
  
  const deploymentInstructions = `
# 🚀 MedQuiz Pro Deployment Fix Instructions

## Issue Identified
JavaScript assets were returning 404 errors from production site, preventing React application from loading.

## Root Cause
Asset build/deployment mismatch between local build and Netlify deployment.

## Solution Applied
${fixes.map(fix => `✅ ${fix}`).join('\n')}

## Manual Deployment Steps (if needed)

### Option 1: Redeploy Current Build
1. Push current changes to GitHub:
   \`\`\`bash
   git add .
   git commit -m "fix: resolve production asset 404 errors"
   git push origin main
   \`\`\`

### Option 2: Manual Netlify Deploy
1. Install Netlify CLI: \`npm install -g netlify-cli\`
2. Build and deploy:
   \`\`\`bash
   npm run build
   netlify deploy --prod --dir=dist
   \`\`\`

### Option 3: Verify Netlify Build Settings
1. Go to Netlify Dashboard → Site Settings → Build & Deploy
2. Verify:
   - Build command: \`npm run build\`
   - Publish directory: \`dist\`
   - Node version: 20
3. Clear build cache and redeploy

## Environment Variables
Ensure these are set in Netlify:
- \`VITE_CONVEX_URL\` = \`https://formal-sardine-916.convex.cloud\`

## Verification
After deployment, test:
- https://medquiz-pro.netlify.app/register
- Assets should load without 404 errors
- Registration form should be functional

Built: ${deploymentInfo.buildTime}
  `;
  
  fs.writeFileSync('DEPLOYMENT_FIX_INSTRUCTIONS.md', deploymentInstructions);
  
  console.log('✅ All fixes applied!\n');
  console.log('📋 Summary of fixes:');
  fixes.forEach((fix, i) => console.log(`   ${i + 1}. ${fix}`));
  
  console.log('\n📖 Next steps:');
  console.log('   1. Review DEPLOYMENT_FIX_INSTRUCTIONS.md');
  console.log('   2. Deploy using one of the provided methods');
  console.log('   3. Test the production site');
  
  return fixes;
}

function runBuild() {
  return new Promise((resolve, reject) => {
    console.log('   Building application...');
    const buildProcess = spawn('npm', ['run', 'build'], { 
      stdio: ['ignore', 'pipe', 'pipe'] 
    });
    
    let output = '';
    buildProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('   ✅ Build completed successfully');
        resolve(output);
      } else {
        console.log('   ❌ Build failed');
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
}

// Run if called directly
if (require.main === module) {
  fixDeployment()
    .then(() => {
      console.log('\n🎉 Deployment fix completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Deployment fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixDeployment };