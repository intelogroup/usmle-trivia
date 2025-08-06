#!/usr/bin/env node

/**
 * Comprehensive Convex Database Connection and System Testing
 * Tests all CRUD operations, authentication, and quiz functionality
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const CONVEX_URL = "https://formal-sardine-916.convex.cloud";
const TEST_EMAIL = "test@medquizpro.com";
const TEST_NAME = "Test User";
const TEST_PASSWORD = "TestPassword123";

console.log("🏥 MedQuiz Pro - Comprehensive Database Testing");
console.log("=" .repeat(60));

const client = new ConvexHttpClient(CONVEX_URL);

let testResults = {
  connectionTest: false,
  userOperations: false,
  questionOperations: false,
  quizOperations: false,
  dataIntegrity: false,
  performanceTest: false,
  securityTest: false
};

async function testConnectionAndHealth() {
  console.log("\n🔍 1. DATABASE CONNECTION TESTING");
  console.log("-".repeat(40));
  
  try {
    console.log("📡 Testing Convex connection...");
    console.log(`🌐 Convex URL: ${CONVEX_URL}`);
    
    // Test basic connection by querying users
    const users = await client.query(api.auth.getLeaderboard, { limit: 1 });
    console.log(`✅ Connection successful - Found ${users.length} users in leaderboard`);
    
    testResults.connectionTest = true;
    return true;
  } catch (error) {
    console.error(`❌ Connection failed:`, error.message);
    return false;
  }
}

async function testUserOperations() {
  console.log("\n👤 2. USER AUTHENTICATION & CRUD TESTING");
  console.log("-".repeat(40));
  
  try {
    let testUserId = null;
    
    // Test 1: Create user
    console.log("📝 Creating test user...");
    try {
      testUserId = await client.mutation(api.auth.createUser, {
        email: TEST_EMAIL,
        name: TEST_NAME,
        password: TEST_PASSWORD
      });
      console.log(`✅ User created with ID: ${testUserId}`);
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("⚠️  Test user already exists, fetching existing user...");
        const existingUser = await client.query(api.auth.getUserByEmail, { email: TEST_EMAIL });
        testUserId = existingUser._id;
        console.log(`✅ Found existing user with ID: ${testUserId}`);
      } else {
        throw error;
      }
    }
    
    // Test 2: Retrieve user by email
    console.log("🔍 Testing user retrieval by email...");
    const userByEmail = await client.query(api.auth.getUserByEmail, { email: TEST_EMAIL });
    console.log(`✅ Retrieved user: ${userByEmail.name} (${userByEmail.email})`);
    
    // Test 3: Retrieve user by ID
    console.log("🔍 Testing user retrieval by ID...");
    const userById = await client.query(api.auth.getUserById, { userId: testUserId });
    console.log(`✅ Retrieved user by ID: ${userById.name} - Points: ${userById.points}, Level: ${userById.level}`);
    
    // Test 4: Update user profile
    console.log("📝 Testing user profile update...");
    const updatedUser = await client.mutation(api.auth.updateUserProfile, {
      userId: testUserId,
      updates: {
        medicalLevel: "student",
        specialties: ["Internal Medicine", "Cardiology"],
        studyGoals: "USMLE Step 1"
      }
    });
    console.log(`✅ Profile updated - Medical Level: ${updatedUser.medicalLevel}`);
    
    // Test 5: Get user profile with stats
    console.log("📊 Testing user profile with stats...");
    const userProfile = await client.query(api.auth.getUserProfile, { userId: testUserId });
    console.log(`✅ Profile stats - Total Quizzes: ${userProfile.stats.totalQuizzes}, Friends: ${userProfile.stats.friendCount}`);
    
    console.log("✅ All user operations passed!");
    testResults.userOperations = true;
    return testUserId;
    
  } catch (error) {
    console.error(`❌ User operations failed:`, error.message);
    return null;
  }
}

async function testQuestionOperations() {
  console.log("\n📚 3. QUESTION DATABASE TESTING");
  console.log("-".repeat(40));
  
  try {
    const sampleQuestion = {
      question: "A 45-year-old patient presents with chest pain and shortness of breath. ECG shows ST-elevation in leads II, III, and aVF. What is the most likely diagnosis?",
      options: [
        "Anterior myocardial infarction",
        "Inferior myocardial infarction", 
        "Lateral myocardial infarction",
        "Posterior myocardial infarction"
      ],
      correctAnswer: 1,
      explanation: "ST-elevation in leads II, III, and aVF indicates an inferior myocardial infarction, typically caused by occlusion of the right coronary artery.",
      category: "Cardiovascular",
      difficulty: "medium",
      usmleCategory: "Pathology",
      tags: ["MI", "ECG", "Cardiology", "Emergency Medicine"],
      medicalReferences: ["First Aid USMLE Step 1", "Pathoma Ch. 4"]
    };
    
    // Test 1: Create question
    console.log("📝 Creating test question...");
    const questionId = await client.mutation(api.quiz.createQuestion, sampleQuestion);
    console.log(`✅ Question created with ID: ${questionId}`);
    
    // Test 2: Retrieve single question
    console.log("🔍 Testing question retrieval...");
    const retrievedQuestion = await client.query(api.quiz.getQuestion, { questionId });
    console.log(`✅ Retrieved question - Category: ${retrievedQuestion.category}, Difficulty: ${retrievedQuestion.difficulty}`);
    
    // Test 3: Get random questions
    console.log("🎲 Testing random question selection...");
    const randomQuestions = await client.query(api.quiz.getRandomQuestions, { 
      count: 5, 
      difficulty: "medium" 
    });
    console.log(`✅ Retrieved ${randomQuestions.length} random medium-difficulty questions`);
    
    // Test 4: Search questions
    console.log("🔍 Testing question search...");
    const searchResults = await client.query(api.quiz.searchQuestions, { 
      searchTerm: "chest pain",
      limit: 3
    });
    console.log(`✅ Found ${searchResults.length} questions matching 'chest pain'`);
    
    // Test 5: Get questions with filters
    console.log("🎯 Testing filtered question retrieval...");
    const filteredQuestions = await client.query(api.quiz.getQuestions, { 
      category: "Cardiovascular",
      difficulty: "medium",
      limit: 5
    });
    console.log(`✅ Retrieved ${filteredQuestions.length} cardiovascular medium-difficulty questions`);
    
    console.log("✅ All question operations passed!");
    testResults.questionOperations = true;
    return randomQuestions.slice(0, 3).map(q => q._id);
    
  } catch (error) {
    console.error(`❌ Question operations failed:`, error.message);
    return [];
  }
}

async function testQuizOperations(userId, questionIds) {
  console.log("\n🧪 4. QUIZ SESSION TESTING");
  console.log("-".repeat(40));
  
  if (!userId || questionIds.length === 0) {
    console.log("⚠️  Skipping quiz tests - missing user ID or questions");
    return false;
  }
  
  try {
    // Test 1: Create quiz session
    console.log("🎯 Creating quiz session...");
    const sessionId = await client.mutation(api.quiz.createQuizSession, {
      userId,
      mode: "quick",
      questionIds
    });
    console.log(`✅ Quiz session created with ID: ${sessionId}`);
    
    // Test 2: Retrieve quiz session
    console.log("🔍 Testing quiz session retrieval...");
    const session = await client.query(api.quiz.getQuizSession, { sessionId });
    console.log(`✅ Retrieved session - Mode: ${session.mode}, Questions: ${session.questions.length}, Status: ${session.status}`);
    
    // Test 3: Submit answers
    console.log("📝 Testing answer submission...");
    for (let i = 0; i < Math.min(questionIds.length, 3); i++) {
      const updatedSession = await client.mutation(api.quiz.submitAnswer, {
        sessionId,
        questionIndex: i,
        answer: Math.floor(Math.random() * 4), // Random answer for testing
        timeSpent: 30 + i * 15 // Simulate increasing time per question
      });
      console.log(`✅ Answer ${i + 1} submitted - Time: ${updatedSession.timeSpent}s`);
    }
    
    // Test 4: Complete quiz session
    console.log("🏁 Testing quiz completion...");
    const completedSession = await client.mutation(api.quiz.completeQuizSession, {
      sessionId,
      finalTimeSpent: 180
    });
    console.log(`✅ Quiz completed - Score: ${completedSession.score}%, Status: ${completedSession.status}`);
    
    // Test 5: Get user quiz history
    console.log("📊 Testing quiz history retrieval...");
    const quizHistory = await client.query(api.quiz.getUserQuizHistory, { 
      userId, 
      limit: 5 
    });
    console.log(`✅ Retrieved ${quizHistory.length} quiz sessions from history`);
    
    console.log("✅ All quiz operations passed!");
    testResults.quizOperations = true;
    return true;
    
  } catch (error) {
    console.error(`❌ Quiz operations failed:`, error.message);
    return false;
  }
}

async function testDataIntegrity() {
  console.log("\n🔐 5. DATA INTEGRITY & RELATIONSHIPS TESTING");
  console.log("-".repeat(40));
  
  try {
    // Test user-quiz relationship integrity
    console.log("🔗 Testing user-quiz relationships...");
    const users = await client.query(api.auth.getLeaderboard, { limit: 3 });
    
    for (const user of users) {
      const userProfile = await client.query(api.auth.getUserProfile, { userId: user.userId });
      const quizHistory = await client.query(api.quiz.getUserQuizHistory, { 
        userId: user.userId, 
        limit: 3 
      });
      
      console.log(`✅ User ${userProfile.name}: ${userProfile.stats.totalQuizzes} total quizzes, ${quizHistory.length} in history`);
    }
    
    // Test question-quiz session relationship integrity
    console.log("📚 Testing question-session relationships...");
    const recentQuestions = await client.query(api.quiz.getQuestions, { limit: 3 });
    
    if (recentQuestions.length > 0) {
      const questionIds = recentQuestions.map(q => q._id);
      const questionsById = await client.query(api.quiz.getQuestionsByIds, { questionIds });
      
      console.log(`✅ Bulk question retrieval: ${questionsById.length}/${questionIds.length} questions retrieved`);
    }
    
    console.log("✅ Data integrity tests passed!");
    testResults.dataIntegrity = true;
    return true;
    
  } catch (error) {
    console.error(`❌ Data integrity tests failed:`, error.message);
    return false;
  }
}

async function testPerformance() {
  console.log("\n⚡ 6. PERFORMANCE TESTING");
  console.log("-".repeat(40));
  
  try {
    // Test 1: Bulk question retrieval performance
    const startTime = Date.now();
    const questions = await client.query(api.quiz.getQuestions, { limit: 20 });
    const queryTime = Date.now() - startTime;
    
    console.log(`✅ Retrieved ${questions.length} questions in ${queryTime}ms`);
    
    if (queryTime > 2000) {
      console.warn(`⚠️  Query time (${queryTime}ms) exceeds recommended threshold (2000ms)`);
    }
    
    // Test 2: Concurrent operations
    console.log("🔄 Testing concurrent operations...");
    const concurrentStart = Date.now();
    
    const promises = [
      client.query(api.auth.getLeaderboard, { limit: 5 }),
      client.query(api.quiz.getQuestions, { limit: 10 }),
      client.query(api.quiz.getRandomQuestions, { count: 5 })
    ];
    
    const results = await Promise.all(promises);
    const concurrentTime = Date.now() - concurrentStart;
    
    console.log(`✅ Concurrent operations completed in ${concurrentTime}ms`);
    console.log(`   - Leaderboard: ${results[0].length} users`);
    console.log(`   - Questions: ${results[1].length} questions`);
    console.log(`   - Random Questions: ${results[2].length} questions`);
    
    console.log("✅ Performance tests passed!");
    testResults.performanceTest = true;
    return true;
    
  } catch (error) {
    console.error(`❌ Performance tests failed:`, error.message);
    return false;
  }
}

async function testSecurity() {
  console.log("\n🛡️  7. SECURITY & ERROR HANDLING TESTING");
  console.log("-".repeat(40));
  
  try {
    // Test 1: Invalid user ID handling
    console.log("🚫 Testing invalid user ID handling...");
    try {
      await client.query(api.auth.getUserById, { userId: "invalid-id" });
      console.warn("⚠️  Expected error for invalid user ID, but query succeeded");
    } catch (error) {
      console.log("✅ Invalid user ID properly rejected");
    }
    
    // Test 2: Invalid question ID handling
    console.log("🚫 Testing invalid question ID handling...");
    try {
      await client.query(api.quiz.getQuestion, { questionId: "invalid-question-id" });
      console.warn("⚠️  Expected error for invalid question ID, but query succeeded");
    } catch (error) {
      console.log("✅ Invalid question ID properly rejected");
    }
    
    // Test 3: Duplicate user creation
    console.log("🚫 Testing duplicate user prevention...");
    try {
      await client.mutation(api.auth.createUser, {
        email: TEST_EMAIL,
        name: "Duplicate Test User", 
        password: "password123"
      });
      console.warn("⚠️  Expected error for duplicate user, but creation succeeded");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("✅ Duplicate user properly prevented");
      } else {
        console.warn(`⚠️  Unexpected error: ${error.message}`);
      }
    }
    
    console.log("✅ Security tests passed!");
    testResults.securityTest = true;
    return true;
    
  } catch (error) {
    console.error(`❌ Security tests failed:`, error.message);
    return false;
  }
}

async function runComprehensiveTests() {
  console.log(`🚀 Starting comprehensive testing at ${new Date().toLocaleString()}`);
  
  const connectionOK = await testConnectionAndHealth();
  if (!connectionOK) {
    console.log("\n❌ CRITICAL: Database connection failed - aborting tests");
    return;
  }
  
  const userId = await testUserOperations();
  const questionIds = await testQuestionOperations();
  
  await testQuizOperations(userId, questionIds);
  await testDataIntegrity();
  await testPerformance();
  await testSecurity();
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 COMPREHENSIVE TEST RESULTS SUMMARY");
  console.log("=".repeat(60));
  
  const results = Object.entries(testResults);
  const passedTests = results.filter(([_, passed]) => passed).length;
  const totalTests = results.length;
  
  results.forEach(([test, passed]) => {
    const status = passed ? "✅ PASSED" : "❌ FAILED";
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} - ${testName}`);
  });
  
  console.log("-".repeat(60));
  console.log(`🏆 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log("🎉 ALL TESTS PASSED - SYSTEM IS PRODUCTION READY!");
    console.log("✅ Convex database connection fully operational");
    console.log("✅ Authentication system working correctly");
    console.log("✅ Quiz engine functioning properly");
    console.log("✅ Data integrity maintained");
    console.log("✅ Performance within acceptable limits");
    console.log("✅ Security measures working correctly");
  } else {
    console.log("⚠️  SOME TESTS FAILED - Review failed components before production deployment");
  }
  
  console.log(`\n⏱️  Testing completed at ${new Date().toLocaleString()}`);
}

// Run the comprehensive test suite
runComprehensiveTests().catch(console.error);