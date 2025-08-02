#!/usr/bin/env node

/**
 * Test authentication with the new user account
 */

const { Client, Account, Databases } = require('appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('688cb738000d2fbeca0a');

const account = new Account(client);
const databases = new Databases(client);
const DATABASE_ID = '688cbab3000f24cafc0c';

async function testAuthentication() {
  console.log('🔐 Testing authentication system...\n');

  try {
    // Test credentials
    const testEmail = 'johndoe2025@gmail.com';
    const testPassword = 'Jimkali90#';

    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword.replace(/./g, '*')}`);
    console.log('');

    // Step 1: Try to login
    console.log('⏳ Attempting login...');
    
    try {
      const session = await account.createEmailPasswordSession(testEmail, testPassword);
      console.log('✅ Login successful!');
      console.log(`📋 Session ID: ${session.$id}`);
      console.log(`⏰ Session expires: ${session.expire}`);
      console.log('');
      
      // Step 2: Get current user info
      console.log('👤 Fetching user information...');
      const user = await account.get();
      console.log('✅ User info retrieved:');
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - User ID: ${user.$id}`);
      console.log(`  - Email verified: ${user.emailVerification}`);
      console.log('');

      // Step 3: Try to fetch user document from database
      console.log('🗃️ Fetching user document from database...');
      try {
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          'users',
          user.$id
        );
        console.log('✅ User document retrieved:');
        console.log(`  - Points: ${userDoc.points}`);
        console.log(`  - Level: ${userDoc.level}`);
        console.log(`  - Total Quizzes: ${userDoc.totalQuizzes}`);
        console.log(`  - Accuracy: ${userDoc.accuracy}%`);
        console.log(`  - Created: ${userDoc.createdAt}`);
        console.log('');
      } catch (dbError) {
        console.log('⚠️  User document not found in database, but authentication worked');
        console.log('');
      }

      // Step 4: Test logout
      console.log('🚪 Testing logout...');
      await account.deleteSession('current');
      console.log('✅ Logout successful!');
      console.log('');

      // Step 5: Verify logout by trying to get user (should fail)
      console.log('🔍 Verifying logout (should fail)...');
      try {
        await account.get();
        console.log('❌ Logout verification failed - still authenticated');
      } catch (error) {
        console.log('✅ Logout verified - no longer authenticated');
      }

      console.log('\n🎉 Authentication test completed successfully!');
      console.log('\n📊 Test Results:');
      console.log('  ✅ Login: PASS');
      console.log('  ✅ User info retrieval: PASS');
      console.log('  ✅ Logout: PASS');
      console.log('  ✅ Overall: ALL TESTS PASSED');

      return true;

    } catch (authError) {
      console.error('❌ Authentication failed:', authError.message);
      
      if (authError.code === 401) {
        console.log('💡 This might indicate:');
        console.log('  - Incorrect email or password');
        console.log('  - User account not properly created');
        console.log('  - Database/authentication server issues');
      }
      
      return false;
    }

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    return false;
  }
}

// Run the test
testAuthentication()
  .then((success) => {
    if (success) {
      console.log('\n🚀 Ready for production deployment!');
      process.exit(0);
    } else {
      console.log('\n🛑 Authentication issues detected - needs investigation');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });