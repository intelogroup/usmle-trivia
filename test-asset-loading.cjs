#!/usr/bin/env node

/**
 * Test JavaScript asset loading from production site
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://medquiz-pro.netlify.app';

async function testAssetLoading() {
  console.log('🔍 Testing JavaScript asset loading from production site...\n');

  // Read the built index.html to get asset references
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Extract script and CSS references
  const scriptMatches = indexContent.match(/src="([^"]+\.js)"/g) || [];
  const cssMatches = indexContent.match(/href="([^"]+\.css)"/g) || [];
  
  const scripts = scriptMatches.map(match => match.match(/src="([^"]+)"/)[1]);
  const stylesheets = cssMatches.map(match => match.match(/href="([^"]+)"/)[1]);
  
  console.log(`Found ${scripts.length} JavaScript files and ${stylesheets.length} CSS files in index.html\n`);
  
  const results = {
    scripts: [],
    stylesheets: [],
    summary: { working: 0, failing: 0 }
  };

  // Test each script
  for (const script of scripts) {
    console.log(`Testing: ${script}`);
    const url = `${BASE_URL}${script}`;
    
    try {
      const status = await checkUrlStatus(url);
      results.scripts.push({ url: script, status, working: status === 200 });
      
      if (status === 200) {
        console.log(`  ✅ ${status} - OK`);
        results.summary.working++;
      } else {
        console.log(`  ❌ ${status} - Failed`);
        results.summary.failing++;
      }
    } catch (error) {
      console.log(`  ❌ Error - ${error.message}`);
      results.scripts.push({ url: script, error: error.message, working: false });
      results.summary.failing++;
    }
  }

  // Test each stylesheet
  for (const css of stylesheets) {
    console.log(`Testing: ${css}`);
    const url = `${BASE_URL}${css}`;
    
    try {
      const status = await checkUrlStatus(url);
      results.stylesheets.push({ url: css, status, working: status === 200 });
      
      if (status === 200) {
        console.log(`  ✅ ${status} - OK`);
        results.summary.working++;
      } else {
        console.log(`  ❌ ${status} - Failed`);
        results.summary.failing++;
      }
    } catch (error) {
      console.log(`  ❌ Error - ${error.message}`);
      results.stylesheets.push({ url: css, error: error.message, working: false });
      results.summary.failing++;
    }
  }

  console.log(`\n📊 Summary: ${results.summary.working} working, ${results.summary.failing} failing`);

  // Save detailed results
  fs.writeFileSync('asset-loading-test-results.json', JSON.stringify(results, null, 2));

  if (results.summary.failing > 0) {
    console.log('\n❌ Asset loading issues detected!');
    console.log('This explains why the React application is not working in production.');
    console.log('\nPossible solutions:');
    console.log('1. Check Netlify deployment logs for asset building issues');
    console.log('2. Verify that the dist/ directory contains all referenced assets');
    console.log('3. Check Netlify site settings for proper publish directory configuration');
    console.log('4. Ensure _redirects file is properly configured for SPA routing');
  } else {
    console.log('\n✅ All assets are loading correctly from production!');
    console.log('The issue may be with JavaScript execution, not asset loading.');
  }

  return results;
}

function checkUrlStatus(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Run if called directly
if (require.main === module) {
  testAssetLoading()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Asset loading test failed:', error);
      process.exit(1);
    });
}

module.exports = { testAssetLoading };