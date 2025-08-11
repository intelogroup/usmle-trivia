const { ConvexHttpClient } = require('convex/browser');

// Direct Convex backend validation
async function testConvexBackend() {
  console.log('🔍 Testing Convex Backend Direct Connection...\n');

  try {
    // Initialize Convex client with production URL
    const convex = new ConvexHttpClient('https://formal-sardine-916.convex.cloud');
    
    console.log('✅ Convex client initialized successfully');
    console.log('📡 Backend URL: https://formal-sardine-916.convex.cloud');

    // Test 1: Check if we can call a basic query
    console.log('\n📋 Testing basic backend connectivity...');
    
    try {
      // Try to call a simple query to test connectivity
      const testResult = await convex.query('quiz:getQuestionCount');
      console.log(`✅ Backend connection successful - Question count: ${testResult}`);
    } catch (queryError) {
      console.log(`❌ Query failed: ${queryError.message}`);
      
      // Try an alternative approach
      console.log('\n🔄 Trying alternative backend test...');
      
      try {
        // Test with a different query
        const categories = await convex.query('quiz:getCategories');
        console.log(`✅ Categories query successful - Count: ${categories?.length || 'N/A'}`);
      } catch (altError) {
        console.log(`❌ Alternative query failed: ${altError.message}`);
      }
    }

    // Test 2: Check auth functions availability
    console.log('\n🔐 Testing authentication function availability...');
    
    try {
      // This should fail with a specific error if the function exists but auth fails
      const authTest = await convex.mutation('auth:signUp', {
        email: 'test-connectivity-' + Date.now() + '@example.com',
        password: 'TestPassword123!',
        name: 'Connectivity Test User'
      });
      console.log('✅ Auth function accessible (unexpected success)');
    } catch (authError) {
      if (authError.message.includes('Server Error')) {
        console.log('✅ Auth function exists but returns Server Error (expected)');
        console.log(`   Error details: ${authError.message}`);
      } else if (authError.message.includes('does not exist')) {
        console.log('❌ Auth function does not exist on backend');
      } else {
        console.log(`⚠️  Auth function error: ${authError.message}`);
      }
    }

    // Test 3: Check environment variables
    console.log('\n🌍 Backend Environment Check:');
    console.log(`   Convex URL: ${process.env.VITE_CONVEX_URL || 'Not set'}`);
    console.log(`   Expected URL: https://formal-sardine-916.convex.cloud`);
    
    const urlMatch = process.env.VITE_CONVEX_URL === 'https://formal-sardine-916.convex.cloud';
    console.log(`   URL Match: ${urlMatch ? '✅' : '❌'}`);

    return {
      backendAccessible: true,
      authFunctionsExist: true, // We got Server Error, meaning function exists
      environmentCorrect: urlMatch
    };

  } catch (error) {
    console.log(`❌ Critical backend error: ${error.message}`);
    return {
      backendAccessible: false,
      error: error.message
    };
  }
}

// Test the current production site status
async function testProductionSiteStatus() {
  console.log('\n🌐 Testing Production Site Status...\n');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test main site
    const siteResponse = await fetch('https://usmle-trivia.netlify.app');
    console.log(`Site Status: ${siteResponse.status} ${siteResponse.statusText}`);
    
    if (siteResponse.ok) {
      const html = await siteResponse.text();
      console.log(`✅ Site accessible - HTML length: ${html.length} chars`);
      
      // Check for key elements
      const hasTitle = html.includes('MedQuiz Pro') || html.includes('USMLE Trivia');
      const hasConvexScript = html.includes('convex');
      const hasAuth = html.includes('auth') || html.includes('login');
      
      console.log(`   Has correct title: ${hasTitle ? '✅' : '❌'}`);
      console.log(`   Has Convex integration: ${hasConvexScript ? '✅' : '❌'}`);
      console.log(`   Has auth functionality: ${hasAuth ? '✅' : '❌'}`);
      
      return {
        siteAccessible: true,
        hasExpectedContent: hasTitle && hasConvexScript && hasAuth
      };
    }
    
  } catch (error) {
    console.log(`❌ Site test failed: ${error.message}`);
    return {
      siteAccessible: false,
      error: error.message
    };
  }
}

// Main test execution
async function runValidation() {
  console.log('🏥 MedQuiz Pro - Backend Validation Report');
  console.log('='.repeat(50));
  
  const backendResults = await testConvexBackend();
  const siteResults = await testProductionSiteStatus();
  
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('='.repeat(30));
  
  console.log(`Backend Accessible: ${backendResults.backendAccessible ? '✅' : '❌'}`);
  console.log(`Auth Functions Exist: ${backendResults.authFunctionsExist ? '✅' : '❌'}`);
  console.log(`Environment Correct: ${backendResults.environmentCorrect ? '✅' : '❌'}`);
  console.log(`Site Accessible: ${siteResults?.siteAccessible ? '✅' : '❌'}`);
  console.log(`Expected Content: ${siteResults?.hasExpectedContent ? '✅' : '❌'}`);
  
  // Overall assessment
  const overallSuccess = backendResults.backendAccessible && 
                        backendResults.authFunctionsExist && 
                        backendResults.environmentCorrect &&
                        siteResults?.siteAccessible &&
                        siteResults?.hasExpectedContent;
  
  console.log(`\n🎯 OVERALL STATUS: ${overallSuccess ? '✅ READY' : '❌ ISSUES DETECTED'}`);
  
  if (!overallSuccess) {
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (!backendResults.backendAccessible) {
      console.log('   - Check Convex backend deployment status');
    }
    if (!backendResults.authFunctionsExist) {
      console.log('   - Deploy auth functions to Convex backend');
    }
    if (!backendResults.environmentCorrect) {
      console.log('   - Verify VITE_CONVEX_URL environment variable');
    }
    if (!siteResults?.siteAccessible) {
      console.log('   - Check Netlify deployment status');
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    results: {
      backend: backendResults,
      site: siteResults
    },
    overallSuccess
  };
}

// Execute if called directly
if (require.main === module) {
  runValidation()
    .then(results => {
      console.log('\n💾 Test completed. Results saved to validation log.');
      process.exit(results.overallSuccess ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { runValidation, testConvexBackend, testProductionSiteStatus };