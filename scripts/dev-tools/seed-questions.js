#\!/usr/bin/env node

// Seed sample questions to Convex database
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import { sampleQuestions } from "./src/data/sampleQuestions.js";

const CONVEX_URL = "https://formal-sardine-916.convex.cloud";

async function seedQuestions() {
  console.log("🌱 Seeding Questions to Convex Database");
  console.log("=====================================");
  
  const client = new ConvexHttpClient(CONVEX_URL);
  
  try {
    // Check if questions already exist
    const existingQuestions = await client.query(api.quiz.getQuestions, { limit: 1 });
    
    if (existingQuestions.length > 0) {
      console.log("⚠️  Questions already exist in the database");
      console.log(`   Found ${existingQuestions.length} existing questions`);
      return;
    }
    
    console.log(`📋 Seeding ${sampleQuestions.length} questions...`);
    
    // Batch create questions
    const questionIds = await client.mutation(api.quiz.batchCreateQuestions, {
      questions: sampleQuestions
    });
    
    console.log(`✅ Successfully created ${questionIds.length} questions`);
    
    // Verify by getting some questions
    const verifyQuestions = await client.query(api.quiz.getQuestions, { limit: 3 });
    console.log("\n📊 Sample questions created:");
    verifyQuestions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.question.substring(0, 60)}...`);
      console.log(`   Category: ${q.category}, Difficulty: ${q.difficulty}`);
    });
    
    console.log("\n🎉 Database seeding complete\!");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  }
}

seedQuestions();
EOF < /dev/null
