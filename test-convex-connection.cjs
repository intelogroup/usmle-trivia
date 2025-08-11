#!/usr/bin/env node

/**
 * Test direct connection to Convex backend
 */

const https = require('https');

async function testConvexConnection() {
  console.log('🧪 Testing Direct Convex Backend Connection');
  console.log('🎯 URL: https://formal-sardine-916.convex.cloud');

  const convexUrl = 'https://formal-sardine-916.convex.cloud';
  
  // Test basic connectivity
  console.log('\n🔗 Step 1: Testing basic connectivity...');
  
  try {
    const response = await fetch(convexUrl);
    console.log(`✅ Basic connection: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`Response preview: ${responseText.substring(0, 200)}...`);
    
  } catch (error) {
    console.log(`❌ Basic connection failed: ${error.message}`);
  }

  // Test auth endpoint specifically
  console.log('\n🔐 Step 2: Testing auth endpoints...');
  
  const authEndpoints = [
    '/auth',
    '/api/auth',
    '/_convex/api',
    '/api'
  ];

  for (const endpoint of authEndpoints) {
    try {
      const testUrl = `${convexUrl}${endpoint}`;
      console.log(`Testing: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://usmle-trivia.netlify.app'
        }
      });
      
      console.log(`  ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.status !== 404) {
        const text = await response.text();
        console.log(`  Response: ${text.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`  ${endpoint}: Error - ${error.message}`);
    }
  }

  // Test CORS policy
  console.log('\n🌐 Step 3: Testing CORS policy...');
  
  try {
    const response = await fetch(`${convexUrl}/api`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://usmle-trivia.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`CORS preflight: ${response.status}`);
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    };
    
    console.log('CORS headers:', corsHeaders);
    
  } catch (error) {
    console.log(`CORS test failed: ${error.message}`);
  }

  // Test with a mock auth request
  console.log('\n🔐 Step 4: Testing mock auth request...');
  
  try {
    const authPayload = {
      path: 'auth:signIn',
      args: {
        provider: 'password',
        params: { email: 'test@test.com', password: 'testpass' }
      }
    };
    
    const response = await fetch(`${convexUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://usmle-trivia.netlify.app'
      },
      body: JSON.stringify(authPayload)
    });
    
    console.log(`Mock auth request: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`Auth response: ${responseText.substring(0, 200)}...`);
    
    if (responseText.includes('n is not a function')) {
      console.log('🎯 Found the "n is not a function" error!');
    }
    
  } catch (error) {
    console.log(`Mock auth request failed: ${error.message}`);
  }

  console.log('\n📊 Testing Summary:');
  console.log('- If basic connection works but auth fails, it\'s a backend configuration issue');
  console.log('- If CORS is blocking requests, frontend can\'t communicate with backend');
  console.log('- If "n is not a function" appears, there\'s a JavaScript error in the Convex Auth setup');

  // Test the environment variable that should be used
  console.log('\n🔧 Environment Configuration Check:');
  
  try {
    const { execSync } = require('child_process');
    
    // Try to get the Convex deployment info
    const result = execSync('grep -r "VITE_CONVEX_URL\\|convex.cloud" .env* || echo "No env files found"', {
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    console.log('Environment files contain:');
    console.log(result);
    
  } catch (error) {
    console.log('Could not read environment files:', error.message);
  }
}

if (require.main === module) {
  testConvexConnection().catch(console.error);
}

module.exports = { testConvexConnection };