#!/usr/bin/env node

/**
 * CONVEX QUIZ DATA DEBUGGING SCRIPT
 * 
 * This script will:
 * 1. Direct test the Convex quiz functions
 * 2. Verify data is loading properly from Convex 
 * 3. Test question fetching outside of React component
 */

const { ConvexHttpClient } = require('convex/browser');

// Initialize Convex client
const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL || 'https://formal-sardine-916.convex.cloud');

async function testConvexQuizFunctions() {
  try {
    console.log('🔗 Testing Convex quiz functions directly...');
    console.log('🌐 Convex URL:', process.env.VITE_CONVEX_URL || 'https://formal-sardine-916.convex.cloud');
    
    // Test 1: Get all questions
    console.log('\n📚 Test 1: Getting all questions...');
    const allQuestions = await client.query('quiz:getQuestions', { limit: 10 });
    console.log(`✅ Found ${allQuestions.length} questions`);
    
    if (allQuestions.length > 0) {
      console.log('📋 Sample question:');
      console.log(`   ID: ${allQuestions[0]._id}`);
      console.log(`   Question: ${allQuestions[0].question.substring(0, 100)}...`);
      console.log(`   Options: ${allQuestions[0].options.length} choices`);
      console.log(`   Category: ${allQuestions[0].category}`);
      console.log(`   Difficulty: ${allQuestions[0].difficulty}`);
    }
    
    // Test 2: Get random questions (same call as QuizEngine)
    console.log('\n🎲 Test 2: Getting 5 random questions...');
    const randomQuestions = await client.query('quiz:getRandomQuestions', { count: 5 });
    console.log(`✅ Found ${randomQuestions.length} random questions`);
    
    if (randomQuestions.length > 0) {
      console.log('📋 Random questions:');
      randomQuestions.forEach((q, index) => {
        console.log(`   ${index + 1}. ${q.category} - ${q.difficulty} - ${q.question.substring(0, 50)}...`);
      });
    }
    
    // Test 3: Get test user
    console.log('\n👤 Test 3: Getting test user...');
    const testUser = await client.query('auth:getUserByEmail', { email: 'jayveedz19@gmail.com' });
    if (testUser) {
      console.log(`✅ Test user found: ${testUser.name} (ID: ${testUser._id})`);
    } else {
      console.log('❌ Test user not found');
      return false;
    }
    
    // Test 4: Try to create a quiz session
    console.log('\n🎮 Test 4: Creating test quiz session...');
    if (randomQuestions.length >= 5) {
      const questionIds = randomQuestions.slice(0, 5).map(q => q._id);
      console.log('📝 Question IDs for session:', questionIds);
      
      try {
        const sessionId = await client.mutation('quiz:createQuizSession', {
          userId: testUser._id,
          mode: 'quick',
          questionIds: questionIds
        });
        
        console.log(`✅ Quiz session created: ${sessionId}`);
        
        // Test 5: Get the created session
        console.log('\n📖 Test 5: Retrieving quiz session...');
        const session = await client.query('quiz:getQuizSession', { sessionId });
        if (session) {
          console.log(`✅ Session retrieved: ${session.mode} mode, ${session.questions.length} questions`);
          console.log(`   Status: ${session.status}`);
          console.log(`   User: ${session.userId}`);
        }
        
        return true;
        
      } catch (sessionError) {
        console.error('❌ Failed to create quiz session:', sessionError);
        return false;
      }
    } else {
      console.log('❌ Not enough questions to create session');
      return false;
    }
    
  } catch (error) {
    console.error('🚨 Convex testing error:', error);
    return false;
  }
}

// Test specific query that QuizEngine uses
async function testQuizEngineQuery() {
  try {
    console.log('\n🔧 Testing exact QuizEngine query...');
    
    // This is the exact same call that QuizEngine makes
    const questions = await client.query('quiz:getRandomQuestions', { 
      count: 5,
      difficulty: undefined,
      category: undefined
    });
    
    console.log(`📊 QuizEngine query result: ${questions.length} questions`);
    
    if (questions.length === 0) {
      console.log('❌ QuizEngine query returned no questions - this is the problem!');
      
      // Debug: try different parameters
      console.log('\n🔍 Debugging query parameters...');
      
      const allQs = await client.query('quiz:getQuestions', {});
      console.log(`   Total questions in DB: ${allQs.length}`);
      
      const countOnly = await client.query('quiz:getRandomQuestions', { count: 1 });
      console.log(`   Random with count=1: ${countOnly.length}`);
      
      const withoutOptionals = await client.query('quiz:getRandomQuestions', { count: 5 });
      console.log(`   Random without optional params: ${withoutOptionals.length}`);
      
      return false;
    } else {
      console.log('✅ QuizEngine query working correctly');
      return true;
    }
    
  } catch (error) {
    console.error('🚨 QuizEngine query test failed:', error);
    return false;
  }
}

// Main testing function
async function runConvexDebugging() {
  console.log('🧪 CONVEX QUIZ DATA DEBUGGING');
  console.log('===============================');
  
  try {
    const basicTest = await testConvexQuizFunctions();
    const quizEngineTest = await testQuizEngineQuery();
    
    console.log('\n📊 DEBUGGING RESULTS');
    console.log('====================');
    console.log(`Basic Convex functions: ${basicTest ? '✅' : '❌'}`);
    console.log(`QuizEngine query: ${quizEngineTest ? '✅' : '❌'}`);
    
    if (!quizEngineTest) {
      console.log('\n💡 DIAGNOSIS: The issue is likely in how the React component calls the Convex hooks');
      console.log('   Possible causes:');
      console.log('   1. useGetRandomQuestions hook not being called properly');
      console.log('   2. Hook parameters not being passed correctly');
      console.log('   3. React component not waiting for Convex query results');
      console.log('   4. Component rendering before questions are loaded');
    }
    
    return basicTest && quizEngineTest;
    
  } catch (error) {
    console.error('🚨 Fatal debugging error:', error);
    return false;
  }
}

// Execute debugging if run directly
if (require.main === module) {
  runConvexDebugging()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runConvexDebugging };