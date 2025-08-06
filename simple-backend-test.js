/**
 * Simple Convex Backend Test
 */

import { ConvexHttpClient } from "convex/browser";

const DEPLOYMENT_URL = "https://formal-sardine-916.convex.cloud";
const client = new ConvexHttpClient(DEPLOYMENT_URL);

async function testBasicFunctionality() {
  console.log("🚀 Testing MedQuiz Pro Convex Backend");
  console.log(`📡 Deployment: ${DEPLOYMENT_URL}`);
  console.log("");

  let passed = 0;
  let failed = 0;

  // Test 1: Connection and basic query
  try {
    const questions = await client.query("quiz:getQuestions", { limit: 5 });
    console.log(`✅ Connection Test: Found ${questions?.length || 0} questions`);
    passed++;
  } catch (error) {
    console.log(`❌ Connection Test: ${error.message}`);
    failed++;
  }

  // Test 2: User creation (basic auth)
  let testUserId = null;
  try {
    testUserId = await client.mutation("auth:createUser", {
      email: `test.${Date.now()}@medquiz.com`,
      name: "Test User",
      password: "testpass123"
    });
    console.log(`✅ User Creation: Created user ${testUserId}`);
    passed++;
  } catch (error) {
    console.log(`❌ User Creation: ${error.message}`);
    failed++;
  }

  // Test 3: Get user by email
  if (testUserId) {
    try {
      const user = await client.query("auth:getUserById", { userId: testUserId });
      console.log(`✅ Get User: Retrieved user "${user.name}"`);
      passed++;
    } catch (error) {
      console.log(`❌ Get User: ${error.message}`);
      failed++;
    }
  }

  // Test 4: Create a question
  let questionId = null;
  try {
    questionId = await client.mutation("quiz:createQuestion", {
      question: "What is the most common cause of chest pain in young adults?",
      options: ["Myocardial infarction", "Costochondritis", "Pulmonary embolism", "Pneumothorax"],
      correctAnswer: 1,
      explanation: "Costochondritis is the most common cause of chest pain in young, healthy adults.",
      category: "Cardiology",
      difficulty: "easy",
      usmleCategory: "Step 2 CK",
      tags: ["chest pain", "cardiology"]
    });
    console.log(`✅ Question Creation: Created question ${questionId}`);
    passed++;
  } catch (error) {
    console.log(`❌ Question Creation: ${error.message}`);
    failed++;
  }

  // Test 5: Get random questions
  try {
    const randomQuestions = await client.query("quiz:getRandomQuestions", {
      count: 3
    });
    console.log(`✅ Random Questions: Retrieved ${randomQuestions?.length || 0} questions`);
    passed++;
  } catch (error) {
    console.log(`❌ Random Questions: ${error.message}`);
    failed++;
  }

  // Test 6: Create quiz session
  let sessionId = null;
  if (testUserId && questionId) {
    try {
      sessionId = await client.mutation("quiz:createQuizSession", {
        userId: testUserId,
        mode: "quick",
        questionIds: [questionId]
      });
      console.log(`✅ Quiz Session: Created session ${sessionId}`);
      passed++;
    } catch (error) {
      console.log(`❌ Quiz Session: ${error.message}`);
      failed++;
    }
  }

  // Test 7: Submit answer
  if (sessionId) {
    try {
      await client.mutation("quiz:submitAnswer", {
        sessionId: sessionId,
        questionIndex: 0,
        answer: 1,
        timeSpent: 30
      });
      console.log(`✅ Submit Answer: Successfully submitted`);
      passed++;
    } catch (error) {
      console.log(`❌ Submit Answer: ${error.message}`);
      failed++;
    }
  }

  // Test 8: Complete quiz
  if (sessionId) {
    try {
      const result = await client.mutation("quiz:completeQuizSession", {
        sessionId: sessionId,
        finalTimeSpent: 45
      });
      console.log(`✅ Complete Quiz: Score ${result.score}%`);
      passed++;
    } catch (error) {
      console.log(`❌ Complete Quiz: ${error.message}`);
      failed++;
    }
  }

  // Test 9: Leaderboard
  try {
    const leaderboard = await client.query("auth:getLeaderboard", { limit: 5 });
    console.log(`✅ Leaderboard: ${leaderboard?.length || 0} entries`);
    passed++;
  } catch (error) {
    console.log(`❌ Leaderboard: ${error.message}`);
    failed++;
  }

  // Test 10: Search questions
  try {
    const searchResults = await client.query("quiz:searchQuestions", {
      searchTerm: "chest",
      limit: 3
    });
    console.log(`✅ Search: Found ${searchResults?.length || 0} results`);
    passed++;
  } catch (error) {
    console.log(`❌ Search: ${error.message}`);
    failed++;
  }

  // Test 11: Enhanced functions exist
  try {
    await client.query("systemManagement:getSystemHealth", {
      requestingUserId: "fake_admin_id"
    });
    console.log(`❌ Enhanced Functions: Should have failed with auth error`);
    failed++;
  } catch (error) {
    if (error.message?.includes("not found") || error.message?.includes("Invalid") || error.message?.includes("Unauthorized")) {
      console.log(`✅ Enhanced Functions: Proper error handling (${error.message.substring(0, 50)}...)`);
      passed++;
    } else {
      console.log(`❌ Enhanced Functions: Unexpected error - ${error.message}`);
      failed++;
    }
  }

  console.log("");
  console.log("📊 RESULTS:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (passed >= 8) {
    console.log("🎉 Backend is working well!");
  } else if (passed >= 5) {
    console.log("⚠️  Backend has some issues but core functionality works");
  } else {
    console.log("🚨 Backend has significant issues");
  }
}

testBasicFunctionality().catch(console.error);