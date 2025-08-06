// Seed all sample questions to Convex database
const { sampleQuestions } = require('./src/data/sampleQuestions.ts');

// Convert TypeScript export to CommonJS
const questions = sampleQuestions.default || sampleQuestions;

console.log("🌱 Seeding Questions to Convex Database");
console.log("=====================================");
console.log(`📋 Found ${questions.length} questions to seed`);

// Output the questions as JSON for use with Convex CLI
console.log(JSON.stringify({ questions }, null, 2));