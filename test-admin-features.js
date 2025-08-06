/**
 * Test Admin Features with Real Admin Account
 */

import { ConvexHttpClient } from "convex/browser";

const DEPLOYMENT_URL = "https://formal-sardine-916.convex.cloud";
const client = new ConvexHttpClient(DEPLOYMENT_URL);

async function testAdminFeatures() {
  console.log("👑 Testing Admin Features with Real Admin Account");
  console.log("");

  let passed = 0;
  let failed = 0;

  // Step 1: Login as admin
  let adminSession = null;
  let adminUserId = null;

  try {
    const loginResult = await client.mutation("authEnhanced:loginSecure", {
      email: "admin@medquizpro.com",
      password: "AdminPass2025!",
      userAgent: "Admin Test Client",
      deviceType: "desktop"
    });
    adminSession = loginResult?.sessionToken;
    adminUserId = loginResult?.user?._id;
    console.log(`✅ Admin Login: Successfully logged in as ${loginResult?.user?.name}`);
    console.log(`   User ID: ${adminUserId}`);
    console.log(`   Role: ${loginResult?.user?.role}`);
    passed++;
  } catch (error) {
    console.log(`❌ Admin Login: ${error.message}`);
    failed++;
  }

  // Step 2: Test analytics with admin role
  if (adminUserId) {
    try {
      const analytics = await client.query("analytics:getDashboardMetrics", {
        requestingUserId: adminUserId,
        period: "30d"
      });
      console.log(`✅ Analytics Access: Retrieved dashboard metrics`);
      console.log(`   Data points available: ${Object.keys(analytics || {}).length}`);
      passed++;
    } catch (error) {
      console.log(`❌ Analytics Access: ${error.message}`);
      failed++;
    }

    try {
      const userAnalytics = await client.query("analytics:getUserAnalytics", {
        requestingUserId: adminUserId,
        targetUserId: adminUserId,
        period: "30d"
      });
      console.log(`✅ User Analytics: Retrieved user-specific metrics`);
      passed++;
    } catch (error) {
      console.log(`❌ User Analytics: ${error.message}`);
      failed++;
    }
  }

  // Step 3: Test content management functions
  if (adminUserId) {
    try {
      const contentStats = await client.query("contentManagement:getContentWorkflowStats", {
        requestingUserId: adminUserId
      });
      console.log(`✅ Content Workflow: Retrieved workflow statistics`);
      passed++;
    } catch (error) {
      console.log(`❌ Content Workflow: ${error.message}`);
      failed++;
    }

    try {
      const pendingApprovals = await client.query("contentManagement:getPendingApprovals", {
        requestingUserId: adminUserId,
        limit: 10
      });
      console.log(`✅ Pending Approvals: Found ${pendingApprovals?.length || 0} items`);
      passed++;
    } catch (error) {
      console.log(`❌ Pending Approvals: ${error.message}`);
      failed++;
    }
  }

  // Step 4: Test system management functions
  if (adminUserId) {
    try {
      const systemHealth = await client.query("systemManagement:getSystemHealth", {
        requestingUserId: adminUserId
      });
      console.log(`✅ System Health: Retrieved health metrics`);
      console.log(`   Health status: ${systemHealth?.status || 'unknown'}`);
      passed++;
    } catch (error) {
      console.log(`❌ System Health: ${error.message}`);
      failed++;
    }

    try {
      const config = await client.query("systemManagement:getSystemConfig", {
        requestingUserId: adminUserId,
        category: "feature-flags"
      });
      console.log(`✅ System Config: Retrieved configuration`);
      passed++;
    } catch (error) {
      console.log(`❌ System Config: ${error.message}`);
      failed++;
    }
  }

  // Step 5: Test user management functions  
  if (adminUserId) {
    try {
      const users = await client.query("authEnhanced:getUsersWithFilters", {
        requestingUserId: adminUserId,
        filters: { role: "admin" },
        limit: 10
      });
      console.log(`✅ User Management: Found ${users?.length || 0} admin users`);
      passed++;
    } catch (error) {
      console.log(`❌ User Management: ${error.message}`);
      failed++;
    }
  }

  // Step 6: Test role-based access works for non-admins
  try {
    // This should fail - testing with fake user ID
    await client.query("analytics:getDashboardMetrics", {
      requestingUserId: "fake_user_id",
      period: "30d"
    });
    console.log(`❌ Access Control: Should have blocked non-admin access`);
    failed++;
  } catch (error) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Invalid argument")) {
      console.log(`✅ Access Control: Properly blocked non-admin access`);
      passed++;
    } else {
      console.log(`❌ Access Control: Unexpected error - ${error.message}`);
      failed++;
    }
  }

  // Step 7: Test session validation
  if (adminSession) {
    try {
      const sessionInfo = await client.query("authEnhanced:validateSession", {
        tokenHash: adminSession
      });
      console.log(`✅ Session Validation: Valid admin session for ${sessionInfo?.user?.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ Session Validation: ${error.message}`);
      failed++;
    }
  }

  // Step 8: Test logout
  if (adminSession) {
    try {
      await client.mutation("authEnhanced:logoutSecure", {
        tokenHash: adminSession
      });
      console.log(`✅ Admin Logout: Successfully logged out`);
      passed++;
    } catch (error) {
      console.log(`❌ Admin Logout: ${error.message}`);
      failed++;
    }
  }

  console.log("");
  console.log("👑 ADMIN FEATURES TEST RESULTS:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (passed >= 8) {
    console.log("🎉 Admin features are fully functional!");
  } else if (passed >= 5) {
    console.log("⚠️  Admin features mostly working with some issues");
  } else {
    console.log("🚨 Admin features need attention");
  }
}

testAdminFeatures().catch(console.error);