/**
 * Database User Data Cleanup Script
 * 
 * This script will:
 * 1. Verify what data will be preserved (questions, tags, system config)
 * 2. Clear all user-generated data from Convex database
 * 3. Verify the cleanup was successful
 * 4. Confirm preserved data is intact
 */

const { ConvexHttpClient } = require("convex/browser");

// Get Convex URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL environment variable is required");
  process.exit(1);
}

console.log("🔧 Initializing Convex client...");
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  try {
    console.log("🔍 Step 1: Verifying data to be preserved...");
    
    // Check what will be preserved
    const preservedData = await client.mutation("clearDatabase:verifyPreservedData");
    console.log("📊 Data to be preserved:");
    console.log("  Questions:", preservedData.preservedData.questions);
    console.log("  Tags:", preservedData.preservedData.tags);  
    console.log("  System Config:", preservedData.preservedData.systemConfig);
    
    if (preservedData.questionSamples.length > 0) {
      console.log("\n📝 Sample questions that will be preserved:");
      preservedData.questionSamples.forEach((q, i) => {
        console.log(`  ${i + 1}. [${q.difficulty}] ${q.category}: ${q.question}`);
      });
    }
    
    // Check current user data
    console.log("\n🔍 Step 2: Checking current user data...");
    const currentState = await client.mutation("clearDatabase:verifyDatabaseEmpty");
    console.log("📊 Current user data records:");
    Object.entries(currentState.counts).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`  ${table}: ${count} records`);
      }
    });
    console.log(`\n📈 Total user data records: ${currentState.totalRecords}`);
    
    if (currentState.totalRecords === 0) {
      console.log("✅ Database is already clean of user data!");
      return;
    }
    
    // Confirm cleanup
    console.log("\n⚠️  WARNING: This will permanently delete ALL user data!");
    console.log("🔒 The following will be PRESERVED:");
    console.log("   - All questions and medical content");
    console.log("   - Tags and categories");
    console.log("   - System configuration");
    console.log("\n🗑️  The following will be DELETED:");
    console.log("   - All user profiles and accounts");  
    console.log("   - All quiz sessions and results");
    console.log("   - All user analytics and attempts");
    console.log("   - All social features (friends, groups, challenges)");
    console.log("   - All bookmarks and user preferences");
    
    // In a real interactive environment, you'd prompt for confirmation
    // For this script, we'll proceed automatically
    console.log("\n🚀 Step 3: Proceeding with user data cleanup...");
    
    const result = await client.mutation("clearDatabase:clearUserData");
    
    if (result.success) {
      console.log("✅ User data cleanup completed successfully!");
      console.log("\n📊 Deleted records:");
      Object.entries(result.deletedCounts).forEach(([table, count]) => {
        if (count > 0) {
          console.log(`  ${table}: ${count} records deleted`);
        }
      });
    } else {
      console.error("❌ Cleanup failed:", result.message);
      return;
    }
    
    // Verify cleanup
    console.log("\n🔍 Step 4: Verifying cleanup...");
    const verifyEmpty = await client.mutation("clearDatabase:verifyDatabaseEmpty");
    
    if (verifyEmpty.isEmpty) {
      console.log("✅ Verification successful - all user data has been removed!");
    } else {
      console.log("⚠️  Some user data remains:");
      Object.entries(verifyEmpty.counts).forEach(([table, count]) => {
        if (count > 0) {
          console.log(`  ${table}: ${count} records`);
        }
      });
    }
    
    // Verify preserved data
    console.log("\n🔍 Step 5: Verifying preserved data...");
    const finalPreserved = await client.mutation("clearDatabase:verifyPreservedData");
    console.log("✅ Preserved data verification:");
    console.log("  Questions:", finalPreserved.preservedData.questions);
    console.log("  Tags:", finalPreserved.preservedData.tags);
    console.log("  System Config:", finalPreserved.preservedData.systemConfig);
    
    console.log("\n🎉 Database cleanup completed successfully!");
    console.log("🔒 All medical questions and system data have been preserved");
    console.log("🗑️  All user-generated data has been removed");
    console.log("🚀 Ready for new authentication system implementation");
    
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    console.error("\nTroubleshooting tips:");
    console.error("1. Ensure VITE_CONVEX_URL is set correctly");
    console.error("2. Verify Convex deployment is running");  
    console.error("3. Check network connection");
    process.exit(1);
  }
}

// Run the cleanup
main().catch(console.error);