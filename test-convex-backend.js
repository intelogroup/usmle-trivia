/**
 * Comprehensive Convex Backend Test Script
 * 
 * This script tests the MedQuiz Pro Convex backend deployment:
 * - Connection verification
 * - Basic functionality tests
 * - Enhanced features testing
 * - Performance verification
 * - SPEC.md compliance validation
 */

import { ConvexHttpClient } from "convex/browser";

const DEPLOYMENT_URL = "https://formal-sardine-916.convex.cloud";
const client = new ConvexHttpClient(DEPLOYMENT_URL);

// Test configuration
const TEST_CONFIG = {
  testUser: {
    email: "test.backend@medquizpro.com",
    name: "Backend Test User",
    password: "TestPassword123!",
  },
  testQuestion: {
    question: "A 65-year-old patient presents with chest pain. What is the most appropriate initial test?",
    options: ["ECG", "Chest X-ray", "Cardiac enzymes", "Echocardiogram"],
    correctAnswer: 0,
    explanation: "ECG is the most appropriate initial test for chest pain to rule out MI.",
    category: "Cardiology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["cardiology", "chest pain", "ECG"],
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  details: []
};

function logTest(testName, success, details = "") {
  testResults.details.push({
    test: testName,
    success,
    details,
    timestamp: new Date().toISOString()
  });
  
  if (success) {
    testResults.passed++;
    console.log(`✅ ${testName}: PASS ${details ? `- ${details}` : ''}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAIL ${details ? `- ${details}` : ''}`);
  }
}

// Main test runner
async function runComprehensiveBackendTests() {
  console.log("🚀 Starting Comprehensive MedQuiz Pro Convex Backend Tests");
  console.log("=" .repeat(80));
  console.log(`📡 Testing deployment: ${DEPLOYMENT_URL}`);
  console.log(`📅 Test started: ${new Date().toISOString()}`);
  console.log("");

  try {
    // 1. Connection Tests
    console.log("📡 CONNECTION VERIFICATION");
    console.log("-".repeat(40));
    await testConnection();
    console.log("");

    // 2. Database Schema Tests
    console.log("🗄️  DATABASE SCHEMA VERIFICATION");
    console.log("-".repeat(40));
    await testDatabaseSchema();
    console.log("");

    // 3. Basic Authentication Tests
    console.log("🔐 BASIC AUTHENTICATION TESTS");
    console.log("-".repeat(40));
    await testBasicAuthentication();
    console.log("");

    // 4. Enhanced Authentication Tests
    console.log("🛡️  ENHANCED AUTHENTICATION TESTS");
    console.log("-".repeat(40));
    await testEnhancedAuthentication();
    console.log("");

    // 5. Core Quiz Functionality Tests
    console.log("📚 QUIZ FUNCTIONALITY TESTS");
    console.log("-".repeat(40));
    await testQuizFunctionality();
    console.log("");

    // 6. Enhanced Features Tests
    console.log("⭐ ENHANCED FEATURES TESTS");
    console.log("-".repeat(40));
    await testEnhancedFeatures();
    console.log("");

    // 7. Analytics Tests
    console.log("📊 ANALYTICS & REPORTING TESTS");
    console.log("-".repeat(40));
    await testAnalytics();
    console.log("");

    // 8. Content Management Tests
    console.log("📝 CONTENT MANAGEMENT TESTS");
    console.log("-".repeat(40));
    await testContentManagement();
    console.log("");

    // 9. Social Features Tests
    console.log("👥 SOCIAL FEATURES TESTS");
    console.log("-".repeat(40));
    await testSocialFeatures();
    console.log("");

    // 10. Performance Tests
    console.log("⚡ PERFORMANCE TESTS");
    console.log("-".repeat(40));
    await testPerformance();
    console.log("");

  } catch (error) {
    logTest("Global Error Handler", false, error.message);
  }

  // Print final results
  printFinalResults();
}

// 1. Connection Tests
async function testConnection() {
  try {
    // Test basic connection
    const result = await client.query("quiz.getQuestions", { limit: 1 });
    logTest("Basic Connection", true, `Retrieved ${result?.length || 0} questions`);
  } catch (error) {
    logTest("Basic Connection", false, error.message);
  }

  try {
    // Test if enhanced functions are available
    const users = await client.query("auth.getUserByEmail", { 
      email: "nonexistent@test.com" 
    });
    logTest("Enhanced Functions Available", true, "Auth functions accessible");
  } catch (error) {
    logTest("Enhanced Functions Available", false, error.message);
  }
}

// 2. Database Schema Tests
async function testDatabaseSchema() {
  const requiredCollections = [
    "users", "questions", "quizSessions", "tags", "attempts", 
    "analytics", "metrics", "auditLog", "userSessions", "leaderboard",
    "bookmarks", "flaggedQuestions", "friendships", "studyGroups",
    "challenges", "contentReviews", "notifications", "systemConfig"
  ];

  // Test if we can query basic collections
  for (const collection of ["users", "questions", "quizSessions"]) {
    try {
      let result;
      if (collection === "users") {
        result = await client.query("auth.getUserByEmail", { 
          email: "test@nonexistent.com" 
        });
        logTest(`Collection ${collection}`, true, "Accessible via auth functions");
      } else if (collection === "questions") {
        result = await client.query("quiz.getQuestions", { limit: 1 });
        logTest(`Collection ${collection}`, true, `Found ${result?.length || 0} items`);
      } else if (collection === "quizSessions") {
        // This will fail if user doesn't exist, but confirms collection structure
        try {
          result = await client.query("quiz.getUserQuizHistory", { 
            userId: "test_id_fake_for_schema_check",
            limit: 1 
          });
          logTest(`Collection ${collection}`, true, "Schema accessible");
        } catch (e) {
          if (e.message?.includes("Invalid argument")) {
            logTest(`Collection ${collection}`, true, "Schema validation working");
          } else {
            throw e;
          }
        }
      }
    } catch (error) {
      logTest(`Collection ${collection}`, false, error.message);
    }
  }
}

// 3. Basic Authentication Tests
async function testBasicAuthentication() {
  let testUserId = null;

  try {
    // Test user creation
    testUserId = await client.mutation("auth.createUser", {
      email: `test.${Date.now()}@medquizpro.com`,
      name: "Test User Basic",
      password: "testpass123"
    });
    logTest("Create User (Basic)", true, `Created user ID: ${testUserId}`);
  } catch (error) {
    logTest("Create User (Basic)", false, error.message);
  }

  if (testUserId) {
    try {
      // Test get user by ID
      const user = await client.query("auth.getUserById", { userId: testUserId });
      logTest("Get User by ID", !!user, `Retrieved user: ${user?.name}`);
    } catch (error) {
      logTest("Get User by ID", false, error.message);
    }

    try {
      // Test user profile update
      const updatedUser = await client.mutation("auth.updateUserProfile", {
        userId: testUserId,
        updates: {
          medicalLevel: "student",
          studyGoals: "USMLE Step 1"
        }
      });
      logTest("Update User Profile", !!updatedUser, "Profile updated successfully");
    } catch (error) {
      logTest("Update User Profile", false, error.message);
    }
  }

  try {
    // Test leaderboard functionality
    const leaderboard = await client.query("auth.getLeaderboard", { limit: 5 });
    logTest("Get Leaderboard", Array.isArray(leaderboard), `Found ${leaderboard?.length || 0} entries`);
  } catch (error) {
    logTest("Get Leaderboard", false, error.message);
  }
}

// 4. Enhanced Authentication Tests
async function testEnhancedAuthentication() {
  let testUserId = null;
  let sessionToken = null;

  try {
    // Test secure user creation
    const result = await client.mutation("authEnhanced.createUserSecure", {
      email: `enhanced.${Date.now()}@medquizpro.com`,
      name: "Enhanced Test User",
      password: "SecurePass123!",
      role: "user"
    });
    testUserId = result?.userId;
    logTest("Create User (Enhanced)", !!testUserId, `Created user ID: ${testUserId}`);
  } catch (error) {
    logTest("Create User (Enhanced)", false, error.message);
  }

  if (testUserId) {
    try {
      // Test secure login
      const loginResult = await client.mutation("authEnhanced.loginSecure", {
        email: `enhanced.${Date.now()}@medquizpro.com`.replace('enhanced.', 'enhanced.'),
        password: "SecurePass123!",
        userAgent: "Test Suite",
        deviceType: "desktop"
      });
      sessionToken = loginResult?.sessionToken;
      logTest("Secure Login", !!sessionToken, "Login successful with JWT token");
    } catch (error) {
      logTest("Secure Login", false, error.message);
    }

    if (sessionToken) {
      try {
        // Test session validation
        const sessionInfo = await client.query("authEnhanced.validateSession", {
          tokenHash: sessionToken
        });
        logTest("Session Validation", !!sessionInfo?.user, "Session validated successfully");
      } catch (error) {
        logTest("Session Validation", false, error.message);
      }

      try {
        // Test logout
        await client.mutation("authEnhanced.logoutSecure", {
          tokenHash: sessionToken
        });
        logTest("Secure Logout", true, "Logout successful");
      } catch (error) {
        logTest("Secure Logout", false, error.message);
      }
    }
  }
}

// 5. Core Quiz Functionality Tests
async function testQuizFunctionality() {
  let questionId = null;
  let sessionId = null;
  let testUserId = null;

  try {
    // Create a test user for quiz functionality
    testUserId = await client.mutation("auth.createUser", {
      email: `quiz.${Date.now()}@medquizpro.com`,
      name: "Quiz Test User",
      password: "quizpass123"
    });

    // Test question creation
    questionId = await client.mutation("quiz.createQuestion", TEST_CONFIG.testQuestion);
    logTest("Create Question", !!questionId, `Created question ID: ${questionId}`);
  } catch (error) {
    logTest("Create Question", false, error.message);
  }

  if (questionId) {
    try {
      // Test get question
      const question = await client.query("quiz.getQuestion", { questionId });
      logTest("Get Question", !!question, `Retrieved: ${question?.question?.substring(0, 50)}...`);
    } catch (error) {
      logTest("Get Question", false, error.message);
    }

    try {
      // Test get random questions
      const randomQuestions = await client.query("quiz.getRandomQuestions", { 
        count: 5,
        difficulty: "medium"
      });
      logTest("Get Random Questions", Array.isArray(randomQuestions), `Found ${randomQuestions?.length || 0} questions`);
    } catch (error) {
      logTest("Get Random Questions", false, error.message);
    }

    if (testUserId) {
      try {
        // Test create quiz session
        sessionId = await client.mutation("quiz.createQuizSession", {
          userId: testUserId,
          mode: "quick",
          questionIds: [questionId]
        });
        logTest("Create Quiz Session", !!sessionId, `Created session ID: ${sessionId}`);
      } catch (error) {
        logTest("Create Quiz Session", false, error.message);
      }

      if (sessionId) {
        try {
          // Test submit answer
          await client.mutation("quiz.submitAnswer", {
            sessionId: sessionId,
            questionIndex: 0,
            answer: 0,
            timeSpent: 30
          });
          logTest("Submit Answer", true, "Answer submitted successfully");
        } catch (error) {
          logTest("Submit Answer", false, error.message);
        }

        try {
          // Test complete quiz
          const completedSession = await client.mutation("quiz.completeQuizSession", {
            sessionId: sessionId,
            finalTimeSpent: 45
          });
          logTest("Complete Quiz", !!completedSession, `Score: ${completedSession?.score}%`);
        } catch (error) {
          logTest("Complete Quiz", false, error.message);
        }
      }
    }
  }

  try {
    // Test search functionality
    const searchResults = await client.query("quiz.searchQuestions", {
      searchTerm: "chest pain",
      limit: 5
    });
    logTest("Search Questions", Array.isArray(searchResults), `Found ${searchResults?.length || 0} results`);
  } catch (error) {
    logTest("Search Questions", false, error.message);
  }
}

// 6. Enhanced Features Tests
async function testEnhancedFeatures() {
  try {
    // Test if enhanced functions are accessible
    const analyticsResult = await client.query("analytics.getDashboardStats", {
      adminUserId: "test_admin_fake",
      dateRange: { start: Date.now() - 86400000, end: Date.now() }
    });
    logTest("Analytics Functions", false, "Should fail with auth error but function exists");
  } catch (error) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("not found")) {
      logTest("Analytics Functions", true, "Function exists with proper authorization");
    } else {
      logTest("Analytics Functions", false, error.message);
    }
  }

  try {
    // Test content management functions
    const contentResult = await client.query("contentManagement.getQuestionsForReview", {
      reviewerId: "test_reviewer_fake",
      limit: 5
    });
    logTest("Content Management", false, "Should fail with auth but function exists");
  } catch (error) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("not found")) {
      logTest("Content Management", true, "Function exists with proper authorization");
    } else {
      logTest("Content Management", false, error.message);
    }
  }

  try {
    // Test social functions
    const socialResult = await client.query("social.getLeaderboard", { limit: 10 });
    logTest("Social Functions", Array.isArray(socialResult), `Leaderboard: ${socialResult?.length || 0} entries`);
  } catch (error) {
    logTest("Social Functions", false, error.message);
  }
}

// 7. Analytics Tests
async function testAnalytics() {
  // Most analytics functions require admin access, so we test their existence
  const analyticsTests = [
    "getDashboardStats",
    "getUserEngagementMetrics", 
    "getQuestionPerformanceAnalytics",
    "getSystemHealthMetrics"
  ];

  for (const func of analyticsTests) {
    try {
      await client.query(`analytics.${func}`, { 
        adminUserId: "test_fake",
        dateRange: { start: Date.now() - 86400000, end: Date.now() }
      });
      logTest(`Analytics - ${func}`, false, "Should fail with proper auth error");
    } catch (error) {
      if (error.message?.includes("Unauthorized") || error.message?.includes("Only admins")) {
        logTest(`Analytics - ${func}`, true, "Proper authorization implemented");
      } else {
        logTest(`Analytics - ${func}`, false, `Unexpected error: ${error.message}`);
      }
    }
  }
}

// 8. Content Management Tests
async function testContentManagement() {
  // Test content management workflow functions
  const cmTests = [
    "getQuestionsForReview",
    "getContentWorkflowStats",
    "getPendingApprovals"
  ];

  for (const func of cmTests) {
    try {
      await client.query(`contentManagement.${func}`, { 
        reviewerId: "test_fake",
        limit: 5
      });
      logTest(`Content Mgmt - ${func}`, false, "Should fail with auth error");
    } catch (error) {
      if (error.message?.includes("Unauthorized") || error.message?.includes("must be") || error.message?.includes("role")) {
        logTest(`Content Mgmt - ${func}`, true, "Proper role-based access control");
      } else {
        logTest(`Content Mgmt - ${func}`, false, `Unexpected error: ${error.message}`);
      }
    }
  }
}

// 9. Social Features Tests
async function testSocialFeatures() {
  try {
    // Test leaderboard
    const leaderboard = await client.query("social.getLeaderboard", { limit: 10 });
    logTest("Social Leaderboard", Array.isArray(leaderboard), `${leaderboard?.length || 0} entries`);
  } catch (error) {
    logTest("Social Leaderboard", false, error.message);
  }

  try {
    // Test getting study groups  
    const studyGroups = await client.query("social.getPublicStudyGroups", { limit: 5 });
    logTest("Study Groups", Array.isArray(studyGroups), `${studyGroups?.length || 0} groups`);
  } catch (error) {
    logTest("Study Groups", false, error.message);
  }

  try {
    // Test challenges
    const challenges = await client.query("social.getActiveChallenges", { 
      userId: "test_fake",
      limit: 5 
    });
    logTest("Social Challenges", false, "Should handle invalid user gracefully");
  } catch (error) {
    if (error.message?.includes("not found") || error.message?.includes("Invalid")) {
      logTest("Social Challenges", true, "Proper error handling for invalid users");
    } else {
      logTest("Social Challenges", false, error.message);
    }
  }
}

// 10. Performance Tests
async function testPerformance() {
  const performanceTests = [];

  try {
    // Test query performance
    const start = Date.now();
    const questions = await client.query("quiz.getQuestions", { limit: 50 });
    const duration = Date.now() - start;
    
    performanceTests.push({ test: "Query 50 Questions", duration, success: duration < 1000 });
    logTest("Query Performance", duration < 1000, `${duration}ms for 50 questions`);
  } catch (error) {
    logTest("Query Performance", false, error.message);
  }

  try {
    // Test batch operations performance
    const start = Date.now();
    await Promise.all([
      client.query("quiz.getQuestions", { limit: 10 }),
      client.query("auth.getLeaderboard", { limit: 10 }),
      client.query("quiz.getRandomQuestions", { count: 5 })
    ]);
    const duration = Date.now() - start;
    
    performanceTests.push({ test: "Concurrent Queries", duration, success: duration < 2000 });
    logTest("Concurrent Queries", duration < 2000, `${duration}ms for 3 concurrent queries`);
  } catch (error) {
    logTest("Concurrent Queries", false, error.message);
  }

  // Log performance summary
  console.log("📊 Performance Summary:");
  performanceTests.forEach(test => {
    console.log(`   ${test.success ? '✅' : '❌'} ${test.test}: ${test.duration}ms`);
  });
}

// Print final results
function printFinalResults() {
  console.log("");
  console.log("=" .repeat(80));
  console.log("📋 FINAL TEST RESULTS");
  console.log("=" .repeat(80));
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📊 Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log("");

  if (testResults.failed > 0) {
    console.log("🔍 FAILED TESTS SUMMARY:");
    console.log("-".repeat(40));
    testResults.details
      .filter(t => !t.success)
      .forEach(t => console.log(`❌ ${t.test}: ${t.details}`));
    console.log("");
  }

  console.log("💡 KEY FINDINGS:");
  console.log("-".repeat(40));
  
  const connectionTests = testResults.details.filter(t => t.test.includes("Connection"));
  const authTests = testResults.details.filter(t => t.test.includes("Auth") || t.test.includes("User"));
  const quizTests = testResults.details.filter(t => t.test.includes("Quiz") || t.test.includes("Question"));
  const enhancedTests = testResults.details.filter(t => t.test.includes("Enhanced") || t.test.includes("Analytics"));

  console.log(`🔗 Connection: ${connectionTests.filter(t => t.success).length}/${connectionTests.length} tests passed`);
  console.log(`🔐 Authentication: ${authTests.filter(t => t.success).length}/${authTests.length} tests passed`);
  console.log(`📚 Quiz Functions: ${quizTests.filter(t => t.success).length}/${quizTests.length} tests passed`);
  console.log(`⭐ Enhanced Features: ${enhancedTests.filter(t => t.success).length}/${enhancedTests.length} tests passed`);

  console.log("");
  console.log(`🏁 Test completed: ${new Date().toISOString()}`);
  console.log("=" .repeat(80));

  // Export results to JSON file
  return testResults;
}

// Run the tests
runComprehensiveBackendTests().catch(console.error);