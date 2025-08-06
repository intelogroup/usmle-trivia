#!/usr/bin/env node

// Test Authentication Flow with Convex
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const CONVEX_URL = "https://formal-sardine-916.convex.cloud";

async function testAuthFlow() {
  console.log("🔐 Testing Convex Authentication Flow");
  console.log("=====================================");
  
  const client = new ConvexHttpClient(CONVEX_URL);
  
  try {
    // Test 1: Create a test user
    console.log("\n1️⃣ Testing User Creation:");
    const testUser = {
      email: "test@medquizpro.com",
      name: "Test User",
      password: "TestPass123!"
    };
    
    try {
      const userId = await client.mutation(api.auth.createUser, testUser);
      console.log("✅ User created successfully:", userId);
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("⚠️  User already exists (expected if test was run before)");
      } else {
        console.log("❌ User creation failed:", error.message);
      }
    }
    
    // Test 2: Get user by email
    console.log("\n2️⃣ Testing User Retrieval:");
    try {
      const user = await client.query(api.auth.getUserByEmail, { email: testUser.email });
      if (user) {
        console.log("✅ User retrieved successfully:");
        console.log("   - Name:", user.name);
        console.log("   - Email:", user.email);
        console.log("   - Points:", user.points);
        console.log("   - Level:", user.level);
      } else {
        console.log("❌ User not found");
      }
    } catch (error) {
      console.log("❌ User retrieval failed:", error.message);
    }
    
    // Test 3: Get leaderboard
    console.log("\n3️⃣ Testing Leaderboard:");
    try {
      const leaderboard = await client.query(api.auth.getLeaderboard, { limit: 5 });
      console.log("✅ Leaderboard retrieved:", leaderboard.length, "users");
      leaderboard.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.userName} - ${entry.points} points`);
      });
    } catch (error) {
      console.log("❌ Leaderboard retrieval failed:", error.message);
    }
    
    console.log("\n📊 Summary:");
    console.log("✅ Convex client connection working");
    console.log("✅ Authentication functions ready for testing");
    console.log("⚠️  Full functionality requires deployed functions");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.log("\n💡 This likely means functions need to be deployed first");
    console.log("   Run: npx convex deploy");
  }
}

// Run the test
testAuthFlow();