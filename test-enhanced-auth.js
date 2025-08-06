/**
 * Test Enhanced Authentication Features
 */

import { ConvexHttpClient } from "convex/browser";

const DEPLOYMENT_URL = "https://formal-sardine-916.convex.cloud";
const client = new ConvexHttpClient(DEPLOYMENT_URL);

async function testEnhancedAuth() {
  console.log("🔐 Testing Enhanced Authentication Features");
  console.log("");

  let passed = 0;
  let failed = 0;

  // Test 1: Enhanced user creation
  let testUserId = null;
  try {
    const result = await client.mutation("authEnhanced:createUserSecure", {
      email: `enhanced.${Date.now()}@medquiz.com`,
      name: "Enhanced Test User",
      password: "SecurePass123!",
      role: "user"
    });
    testUserId = result?.userId;
    console.log(`✅ Enhanced User Creation: Created user ${testUserId}`);
    passed++;
  } catch (error) {
    console.log(`❌ Enhanced User Creation: ${error.message}`);
    failed++;
  }

  // Test 2: Secure login
  let sessionToken = null;
  if (testUserId) {
    try {
      const loginResult = await client.mutation("authEnhanced:loginSecure", {
        email: `enhanced.${Date.now() - 1000}@medquiz.com`.replace(Date.now() - 1000, 'test'),
        password: "SecurePass123!",
        userAgent: "Test Client",
        deviceType: "desktop"
      });
      sessionToken = loginResult?.sessionToken;
      console.log(`✅ Secure Login: Got session token ${sessionToken ? 'YES' : 'NO'}`);
      passed++;
    } catch (error) {
      console.log(`❌ Secure Login: ${error.message}`);
      failed++;
    }
  }

  // Test 3: Session validation
  if (sessionToken) {
    try {
      const sessionInfo = await client.query("authEnhanced:validateSession", {
        tokenHash: sessionToken
      });
      console.log(`✅ Session Validation: User ${sessionInfo?.user?.name || 'Unknown'}`);
      passed++;
    } catch (error) {
      console.log(`❌ Session Validation: ${error.message}`);
      failed++;
    }
  }

  // Test 4: Analytics functions (should be protected)
  try {
    await client.query("analytics:getDashboardStats", {
      adminUserId: "fake_id",
      dateRange: { start: Date.now() - 86400000, end: Date.now() }
    });
    console.log(`❌ Analytics Protection: Should have failed`);
    failed++;
  } catch (error) {
    if (error.message?.includes("Only admins") || error.message?.includes("Unauthorized")) {
      console.log(`✅ Analytics Protection: Properly protected`);
      passed++;
    } else {
      console.log(`❌ Analytics Protection: Unexpected error - ${error.message}`);
      failed++;
    }
  }

  // Test 5: Content management (should be protected)
  try {
    await client.query("contentManagement:getQuestionsForReview", {
      reviewerId: "fake_id",
      limit: 5
    });
    console.log(`❌ Content Mgmt Protection: Should have failed`);
    failed++;
  } catch (error) {
    if (error.message?.includes("must be") || error.message?.includes("role") || error.message?.includes("Unauthorized")) {
      console.log(`✅ Content Mgmt Protection: Properly protected`);
      passed++;
    } else {
      console.log(`❌ Content Mgmt Protection: Unexpected error - ${error.message}`);
      failed++;
    }
  }

  // Test 6: Social features
  try {
    const leaderboard = await client.query("social:getLeaderboard", { limit: 10 });
    console.log(`✅ Social Leaderboard: ${leaderboard?.length || 0} entries`);
    passed++;
  } catch (error) {
    console.log(`❌ Social Leaderboard: ${error.message}`);
    failed++;
  }

  // Test 7: System management functions
  try {
    const tags = await client.query("systemManagement:getTags", { limit: 10 });
    console.log(`✅ System Tags: ${tags?.length || 0} tags found`);
    passed++;
  } catch (error) {
    console.log(`❌ System Tags: ${error.message}`);
    failed++;
  }

  // Test 8: Logout
  if (sessionToken) {
    try {
      await client.mutation("authEnhanced:logoutSecure", {
        tokenHash: sessionToken
      });
      console.log(`✅ Secure Logout: Successfully logged out`);
      passed++;
    } catch (error) {
      console.log(`❌ Secure Logout: ${error.message}`);
      failed++;
    }
  }

  console.log("");
  console.log("📊 ENHANCED AUTH RESULTS:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

testEnhancedAuth().catch(console.error);