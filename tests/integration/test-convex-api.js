#!/usr/bin/env node

// Test Convex API Connection
const CONVEX_URL = "https://formal-sardine-916.convex.cloud";

async function testConvexAPI() {
  console.log("🔍 Testing Convex API Connection...");
  console.log(`📍 URL: ${CONVEX_URL}`);
  console.log("");

  try {
    // Test 1: Check if the deployment is accessible
    const response = await fetch(CONVEX_URL);
    console.log(`✅ Deployment reachable - Status: ${response.status}`);
    
    // Test 2: Try to access the API endpoint
    const apiResponse = await fetch(`${CONVEX_URL}/api`);
    console.log(`📡 API endpoint - Status: ${apiResponse.status}`);
    
    if (apiResponse.ok) {
      console.log("✅ Convex API is accessible");
    } else {
      console.log("⚠️  API endpoint returned non-OK status (functions may not be deployed)");
    }

    // Test 3: Check version info
    const versionResponse = await fetch(`${CONVEX_URL}/version.txt`);
    if (versionResponse.ok) {
      const version = await versionResponse.text();
      console.log(`📦 Convex version: ${version.trim()}`);
    }

    console.log("");
    console.log("📊 Summary:");
    console.log("✅ Convex deployment URL is accessible");
    console.log("✅ Connection established successfully");
    console.log("⚠️  Functions need to be deployed for full functionality");
    console.log("");
    console.log("💡 Next steps:");
    console.log("1. Deploy functions using Convex CLI");
    console.log("2. Enable React hooks in convexAuth.ts and convexQuiz.ts");
    console.log("3. Test authentication and quiz functionality");

  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    console.log("");
    console.log("💡 Troubleshooting:");
    console.log("1. Check internet connection");
    console.log("2. Verify deployment URL is correct");
    console.log("3. Ensure Convex deployment is active");
  }
}

testConvexAPI();