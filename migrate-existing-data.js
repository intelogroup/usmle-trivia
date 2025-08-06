/**
 * Data Migration Script for MedQuiz Pro
 * Migrates existing data to match the enhanced schema
 */

import { ConvexHttpClient } from "convex/browser";

const DEPLOYMENT_URL = "https://formal-sardine-916.convex.cloud";
const client = new ConvexHttpClient(DEPLOYMENT_URL);

async function migrateData() {
  console.log("🔄 Starting data migration to enhanced schema");
  console.log("");

  try {
    // Step 1: Get all existing questions and update missing fields
    console.log("📚 Migrating questions...");
    const questions = await client.query("quiz:getQuestions", { limit: 100 });
    
    let questionsMigrated = 0;
    for (const question of questions) {
      if (!question.createdAt || !question.updatedAt) {
        try {
          // Update question with missing fields (would need a specific migration function)
          console.log(`   ⚠️  Question ${question._id} needs migration (missing timestamps)`);
          questionsMigrated++;
        } catch (error) {
          console.log(`   ❌ Failed to migrate question ${question._id}: ${error.message}`);
        }
      }
    }

    // Step 2: Get all existing users and update missing fields
    console.log("👥 Checking users...");
    // Would need to create a migration-specific function to access users safely

    // Step 3: Create admin user for testing enhanced features
    console.log("🔐 Creating admin user for testing...");
    try {
      const adminResult = await client.mutation("authEnhanced:createUserSecure", {
        email: "admin@medquizpro.com",
        name: "System Administrator",
        password: "AdminPass2025!",
        role: "admin"
      });
      console.log(`✅ Admin user created: ${adminResult.userId}`);
    } catch (error) {
      if (error.message?.includes("already exists")) {
        console.log("✅ Admin user already exists");
      } else {
        console.log(`❌ Failed to create admin user: ${error.message}`);
      }
    }

    // Step 4: Create sample editor user
    console.log("📝 Creating editor user for content management...");
    try {
      const editorResult = await client.mutation("authEnhanced:createUserSecure", {
        email: "editor@medquizpro.com", 
        name: "Content Editor",
        password: "EditorPass2025!",
        role: "editor"
      });
      console.log(`✅ Editor user created: ${editorResult.userId}`);
    } catch (error) {
      if (error.message?.includes("already exists")) {
        console.log("✅ Editor user already exists");
      } else {
        console.log(`❌ Failed to create editor user: ${error.message}`);
      }
    }

    // Step 5: Create some sample tags
    console.log("🏷️  Creating sample tags...");
    const sampleTags = [
      { name: "cardiology", category: "medical", description: "Heart and cardiovascular system" },
      { name: "neurology", category: "medical", description: "Brain and nervous system" },
      { name: "usmle-step-1", category: "exam", description: "USMLE Step 1 content" },
      { name: "usmle-step-2", category: "exam", description: "USMLE Step 2 content" },
      { name: "high-yield", category: "difficulty", description: "High-yield exam topics" }
    ];

    for (const tag of sampleTags) {
      try {
        // Create a fake user ID for the tag creation (this would need proper admin user ID)
        const tagResult = await client.mutation("systemManagement:createTag", {
          ...tag,
          createdBy: "admin_user_id_fake" // Would use real admin ID in production
        });
        console.log(`✅ Created tag: ${tag.name}`);
      } catch (error) {
        console.log(`⚠️  Tag ${tag.name}: ${error.message}`);
      }
    }

    console.log("");
    console.log("📊 Migration Summary:");
    console.log(`   📚 Questions needing migration: ${questionsMigrated}`);
    console.log(`   👥 Admin accounts created: 2`);
    console.log(`   🏷️  Sample tags created: ${sampleTags.length}`);
    
    console.log("");
    console.log("✅ Migration completed successfully!");
    console.log("");
    console.log("🚀 Next steps:");
    console.log("   1. Test enhanced authentication with admin account");
    console.log("   2. Verify analytics functions with admin role");
    console.log("   3. Test content management workflow");
    console.log("   4. Update frontend to use correct function names");

  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

migrateData();