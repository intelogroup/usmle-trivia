#!/usr/bin/env node

/**
 * Database seeding script for MedQuiz Pro
 * Seeds the questions collection with sample USMLE questions
 */

import { Client, Databases, ID } from 'appwrite';
import { readFileSync } from 'fs';

// Load environment variables from .env file
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Initialize Appwrite client 
const client = new Client();
client
  .setEndpoint(envVars.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(envVars.VITE_APPWRITE_PROJECT_ID || '688cb738000d2fbeca0a');

const databases = new Databases(client);
const DATABASE_ID = envVars.APPWRITE_DATABASE_ID || '688cbab3000f24cafc0c';
const QUESTIONS_COLLECTION_ID = 'questions';

// Sample questions data (first 3 for testing)
const sampleQuestions = [
  {
    question: "A 45-year-old man presents with chest pain that is crushing in nature and radiates to his left arm. The pain started 2 hours ago while he was at rest. His ECG shows ST-segment elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
    options: [
      "Left anterior descending artery (LAD)",
      "Left circumflex artery (LCX)", 
      "Right coronary artery (RCA)",
      "Left main coronary artery"
    ],
    correctAnswer: 2,
    explanation: "ST-segment elevation in leads II, III, and aVF indicates an inferior wall myocardial infarction (MI). The inferior wall of the left ventricle is primarily supplied by the right coronary artery (RCA) in most patients. The RCA gives rise to the posterior descending artery (PDA) which supplies the inferior wall. LAD occlusion would show changes in V1-V6, and LCX occlusion would show changes in I, aVL, V5-V6.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["myocardial infarction", "ECG", "coronary anatomy", "cardiology"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 4"]
  },
  {
    question: "A 32-year-old woman presents with fatigue, weight gain, and cold intolerance. Laboratory studies show TSH 15 mU/L (normal 0.5-5.0) and free T4 0.8 ng/dL (normal 1.0-2.3). What is the most likely diagnosis?",
    options: [
      "Graves' disease",
      "Hashimoto's thyroiditis",
      "Toxic multinodular goiter",
      "Subacute thyroiditis"
    ],
    correctAnswer: 1,
    explanation: "The combination of elevated TSH and low free T4 indicates primary hypothyroidism. In a young woman with symptoms of hypothyroidism, Hashimoto's thyroiditis (chronic lymphocytic thyroiditis) is the most common cause. This autoimmune condition leads to destruction of thyroid tissue and eventual hypothyroidism. Graves' disease and toxic multinodular goiter cause hyperthyroidism, while subacute thyroiditis typically causes transient hyperthyroidism followed by hypothyroidism.",
    category: "Endocrine",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["hypothyroidism", "Hashimoto's", "thyroid", "endocrinology"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 19"]
  },
  {
    question: "A 23-year-old college student presents with a 2-week history of sore throat, fever, and swollen lymph nodes. Physical examination reveals splenomegaly and posterior cervical lymphadenopathy. Laboratory studies show atypical lymphocytes on peripheral smear. Monospot test is positive. What is the most likely causative organism?",
    options: [
      "Cytomegalovirus (CMV)",
      "Epstein-Barr virus (EBV)",
      "Streptococcus pyogenes",
      "Toxoplasma gondii"
    ],
    correctAnswer: 1,
    explanation: "This presentation is classic for infectious mononucleosis caused by Epstein-Barr virus (EBV). The combination of fever, sore throat, lymphadenopathy (especially posterior cervical), splenomegaly, atypical lymphocytes, and positive monospot test strongly suggests EBV mononucleosis. CMV can cause a similar syndrome but typically has a negative monospot test. The monospot test detects heterophile antibodies that react with EBV infection but not CMV infection.",
    category: "Infectious Disease",
    difficulty: "easy",
    usmleCategory: "microbiology",
    tags: ["EBV", "mononucleosis", "monospot", "atypical lymphocytes"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Micro"]
  }
];

async function seedQuestions() {
  console.log('🌱 Starting database seeding...');
  console.log(`📊 Found ${sampleQuestions.length} questions to seed (testing with first 3)`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < sampleQuestions.length; i++) {
    const question = sampleQuestions[i];
    
    try {
      // Transform the question data to match database schema
      const questionDoc = {
        question: question.question,
        options: JSON.stringify(question.options),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        category: question.category,
        difficulty: question.difficulty,
        usmleCategory: question.usmleCategory,
        tags: JSON.stringify(question.tags),
        medicalReferences: JSON.stringify(question.medicalReferences || []),
        lastReviewed: new Date().toISOString(),
      };
      
      // Create the question document
      const result = await databases.createDocument(
        DATABASE_ID,
        QUESTIONS_COLLECTION_ID,
        ID.unique(),
        questionDoc
      );
      
      console.log(`✅ Question ${i + 1}/${sampleQuestions.length}: ${question.category} - ${question.difficulty}`);
      console.log(`   ID: ${result.$id}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Failed to seed question ${i + 1}:`, error.message);
      console.error(`   Question: ${question.question.substring(0, 50)}...`);
      errorCount++;
    }
  }
  
  console.log('\n🎯 Seeding Summary:');
  console.log(`✅ Successfully seeded: ${successCount} questions`);
  console.log(`❌ Failed to seed: ${errorCount} questions`);
  
  if (successCount === sampleQuestions.length) {
    console.log('🚀 Database seeding completed successfully!');
    console.log('💡 You can now test the quiz functionality with real medical questions.');
  } else if (successCount > 0) {
    console.log('⚠️  Partial success. Some questions were seeded successfully.');
  } else {
    console.log('💥 No questions were seeded. Check the database configuration and permissions.');
  }
}

// Run the seeding script
seedQuestions()
  .then(() => {
    console.log('✨ Seeding script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding script failed:', error);
    console.error('Full error details:', error);
    process.exit(1);
  });