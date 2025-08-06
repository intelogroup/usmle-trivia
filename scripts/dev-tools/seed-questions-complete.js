#!/usr/bin/env node

// Seed all sample questions to Convex database
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import { sampleQuestions } from "./src/data/sampleQuestions.js";

const CONVEX_URL = "https://formal-sardine-916.convex.cloud";

async function seedQuestions() {
  console.log("🌱 Seeding Questions to Convex Database");
  console.log("=====================================");
  
  const client = new ConvexHttpClient(CONVEX_URL);
  
  try {
    // Check existing questions
    const existingQuestions = await client.query(api.quiz.getQuestions, { limit: 100 });
    console.log(`📊 Found ${existingQuestions.length} existing questions`);
    
    if (existingQuestions.length >= sampleQuestions.length) {
      console.log("✅ Database already has all sample questions");
      console.log("\n📊 Questions by category:");
      
      const categoryCounts = {};
      existingQuestions.forEach(q => {
        categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
      });
      
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} questions`);
      });
      
      return existingQuestions;
    }
    
    console.log(`📋 Seeding ${sampleQuestions.length} questions...`);
    
    // Batch create questions
    const questionIds = await client.mutation(api.quiz.batchCreateQuestions, {
      questions: sampleQuestions
    });
    
    console.log(`✅ Successfully created ${questionIds.length} questions`);
    
    // Verify by getting all questions
    const allQuestions = await client.query(api.quiz.getQuestions, { limit: 100 });
    console.log("\n📊 Questions in database by category:");
    
    const categoryCounts = {};
    allQuestions.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} questions`);
    });
    
    console.log(`\n🎉 Total questions in database: ${allQuestions.length}`);
    return allQuestions;
    
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedQuestions().then(() => process.exit(0)).catch(() => process.exit(1));
}

export { seedQuestions };