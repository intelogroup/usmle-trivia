#!/usr/bin/env node

/**
 * Simple authentication test focusing on login/logout cycle
 */

const { Client, Account } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('688cb738000d2fbeca0a');

const account = new Account(client);

async function testSimpleAuth() {
  console.log('🔐 Testing simple authentication...\n');

  const testEmail = 'johndoe2025@gmail.com';
  const testPassword = 'Jimkali90#';

  try {
    // Step 1: Login
    console.log('⏳ Attempting login...');
    const session = await account.createEmailPasswordSession(testEmail, testPassword);
    
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log(`📋 Session ID: ${session.$id}`);
    console.log(`👤 User ID: ${session.userId}`);
    console.log(`⏰ Expires: ${new Date(session.expire).toLocaleString()}`);
    console.log('');

    // Step 2: Logout
    console.log('🚪 Attempting logout...');
    await account.deleteSession('current');
    console.log('✅ LOGOUT SUCCESSFUL!');
    console.log('');

    console.log('🎉 AUTHENTICATION TEST PASSED!');
    console.log('\n📊 Results:');
    console.log('  ✅ Login with johndoe2025@gmail.com: PASS');
    console.log('  ✅ Session creation: PASS');
    console.log('  ✅ Logout: PASS');
    console.log('\n🚀 Ready for front-end authentication testing!');

    return true;

  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.log('\n📊 Results:');
    console.log('  ❌ Authentication: FAILED');
    
    return false;
  }
}

// Run the test
testSimpleAuth()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });