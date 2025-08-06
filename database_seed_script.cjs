#!/usr/bin/env node

/**
 * COMPREHENSIVE DATABASE SEEDING SCRIPT
 * 
 * This script will:
 * 1. Connect to Convex database
 * 2. Create the test user (jayveedz19@gmail.com)
 * 3. Seed sample USMLE questions
 * 4. Verify all data is properly created
 */

const { ConvexHttpClient } = require('convex/browser');

// Initialize Convex client
const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL || 'https://formal-sardine-916.convex.cloud');

// Test user data
const TEST_USER = {
  email: 'jayveedz19@gmail.com',
  name: 'Jay veedz',
  password: 'Jimkali90#'
};

// Sample USMLE questions data
const SAMPLE_QUESTIONS = [
  {
    question: "A 45-year-old male presents with chest pain and shortness of breath. ECG shows ST-elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
    options: [
      "Left anterior descending artery",
      "Right coronary artery", 
      "Left circumflex artery",
      "Left main coronary artery"
    ],
    correctAnswer: 1,
    explanation: "ST-elevation in leads II, III, and aVF indicates an inferior wall myocardial infarction, which is typically caused by occlusion of the right coronary artery (RCA). The RCA supplies the inferior wall of the left ventricle in most patients.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "Pathology",
    tags: ["myocardial infarction", "ECG", "coronary arteries", "cardiology"],
    medicalReferences: ["First Aid USMLE Step 1", "Pathoma Chapter 7"]
  },
  {
    question: "A 28-year-old woman presents with heat intolerance, weight loss, and palpitations. Physical exam reveals exophthalmos and a diffusely enlarged thyroid gland. What is the most likely diagnosis?",
    options: [
      "Hashimoto's thyroiditis",
      "Graves' disease",
      "Toxic multinodular goiter", 
      "Thyroid storm"
    ],
    correctAnswer: 1,
    explanation: "The combination of hyperthyroid symptoms (heat intolerance, weight loss, palpitations), exophthalmos (eye protrusion), and diffuse thyroid enlargement is classic for Graves' disease. This autoimmune condition is caused by thyroid-stimulating immunoglobulins.",
    category: "Endocrine",
    difficulty: "easy",
    usmleCategory: "Pathology",
    tags: ["hyperthyroidism", "Graves disease", "exophthalmos", "autoimmune"],
    medicalReferences: ["First Aid USMLE Step 1", "Pathoma Chapter 19"]
  },
  {
    question: "A 3-year-old child presents with fever, headache, and neck stiffness. Lumbar puncture shows elevated white cells with neutrophil predominance, low glucose, and elevated protein. What is the most likely pathogen?",
    options: [
      "Neisseria meningitidis",
      "Haemophilus influenzae",
      "Streptococcus pneumoniae",
      "Listeria monocytogenes"
    ],
    correctAnswer: 2,
    explanation: "In children aged 1 month to 18 years, Streptococcus pneumoniae is the most common cause of bacterial meningitis. The CSF findings (elevated WBCs with neutrophil predominance, low glucose, elevated protein) are classic for bacterial meningitis.",
    category: "Infectious Disease",
    difficulty: "medium",
    usmleCategory: "Microbiology",
    tags: ["meningitis", "bacterial infection", "pediatrics", "CSF analysis"],
    medicalReferences: ["First Aid USMLE Step 1", "Sketchy Micro"]
  },
  {
    question: "A 55-year-old smoker presents with progressive dyspnea and dry cough. Chest X-ray shows bilateral lower lobe reticular opacities. High-resolution CT shows honeycombing. What is the most likely diagnosis?",
    options: [
      "Chronic obstructive pulmonary disease",
      "Idiopathic pulmonary fibrosis",
      "Pneumocystis pneumonia",
      "Pulmonary edema"
    ],
    correctAnswer: 1,
    explanation: "The combination of progressive dyspnea, dry cough, bilateral lower lobe reticular opacities, and honeycombing on CT in a middle-aged patient (often with smoking history) is classic for idiopathic pulmonary fibrosis (IPF).",
    category: "Pulmonary",
    difficulty: "medium",
    usmleCategory: "Pathology",
    tags: ["pulmonary fibrosis", "honeycombing", "interstitial lung disease", "radiology"],
    medicalReferences: ["First Aid USMLE Step 1", "Pathoma Chapter 15"]
  },
  {
    question: "A 65-year-old woman presents with muscle weakness that worsens with repetitive use and improves with rest. Tensilon test is positive. What is the most likely diagnosis?",
    options: [
      "Multiple sclerosis",
      "Myasthenia gravis",
      "Guillain-Barré syndrome",
      "Amyotrophic lateral sclerosis"
    ],
    correctAnswer: 1,
    explanation: "Muscle weakness that worsens with repetitive use (fatigability) and improves with rest, combined with a positive Tensilon (edrophonium) test, is diagnostic of myasthenia gravis. This autoimmune condition affects the neuromuscular junction.",
    category: "Neurology",
    difficulty: "easy",
    usmleCategory: "Pathology",
    tags: ["myasthenia gravis", "neuromuscular junction", "acetylcholine", "autoimmune"],
    medicalReferences: ["First Aid USMLE Step 1", "Pathoma Chapter 24"]
  }
];

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seedTestUser() {
  try {
    console.log('👤 Creating test user...');
    
    // Check if user already exists
    const existingUser = await client.query('auth:getUserByEmail', { email: TEST_USER.email });
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.name);
      return existingUser;
    }
    
    // Create new user
    const userId = await client.mutation('auth:createUser', {
      email: TEST_USER.email,
      name: TEST_USER.name,
      password: TEST_USER.password
    });
    
    console.log('✅ Test user created with ID:', userId);
    
    // Get the created user to return
    const createdUser = await client.query('auth:getUserById', { userId });
    return createdUser;
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

async function seedQuestions() {
  try {
    console.log('📚 Seeding sample questions...');
    
    // Get existing questions count
    const existingQuestions = await client.query('quiz:getQuestions', { limit: 100 });
    console.log('📊 Existing questions in database:', existingQuestions.length);
    
    if (existingQuestions.length >= SAMPLE_QUESTIONS.length) {
      console.log('✅ Questions already seeded');
      return existingQuestions;
    }
    
    // Create questions one by one
    const createdQuestions = [];
    
    for (let i = 0; i < SAMPLE_QUESTIONS.length; i++) {
      const questionData = SAMPLE_QUESTIONS[i];
      console.log(`📝 Creating question ${i + 1}/${SAMPLE_QUESTIONS.length}: ${questionData.category}`);
      
      try {
        const questionId = await client.mutation('quiz:createQuestion', questionData);
        const createdQuestion = await client.query('quiz:getQuestion', { questionId });
        createdQuestions.push(createdQuestion);
        console.log(`✅ Question created: ${questionId}`);
        
        // Small delay to avoid overwhelming the database
        await delay(200);
        
      } catch (questionError) {
        console.error(`❌ Error creating question ${i + 1}:`, questionError);
        // Continue with other questions even if one fails
      }
    }
    
    console.log(`✅ Successfully created ${createdQuestions.length} questions`);
    return createdQuestions;
    
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    throw error;
  }
}

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database setup...');
    
    // Verify test user
    const testUser = await client.query('auth:getUserByEmail', { email: TEST_USER.email });
    if (!testUser) {
      throw new Error('Test user not found after seeding');
    }
    console.log('✅ Test user verified:', testUser.name);
    
    // Verify questions
    const questions = await client.query('quiz:getQuestions', { limit: 10 });
    if (questions.length === 0) {
      throw new Error('No questions found after seeding');
    }
    console.log('✅ Questions verified:', questions.length, 'available');
    
    // Test random questions query
    const randomQuestions = await client.query('quiz:getRandomQuestions', { count: 5 });
    if (randomQuestions.length === 0) {
      throw new Error('Random questions query failed');
    }
    console.log('✅ Random questions query working:', randomQuestions.length, 'returned');
    
    return {
      user: testUser,
      questionsCount: questions.length,
      randomQuestionsWorking: randomQuestions.length > 0
    };
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    console.log('🌐 Convex URL:', process.env.VITE_CONVEX_URL || 'https://formal-sardine-916.convex.cloud');
    
    // Create test user
    const user = await seedTestUser();
    
    // Seed questions
    const questions = await seedQuestions();
    
    // Verify everything is working
    const verification = await verifyDatabase();
    
    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('================================');
    console.log('✅ Test User:', verification.user.name, '(' + verification.user.email + ')');
    console.log('✅ Questions Available:', verification.questionsCount);
    console.log('✅ Random Query Working:', verification.randomQuestionsWorking);
    console.log('\n💡 You can now test the quiz functionality with:');
    console.log('   📧 Email:', TEST_USER.email);
    console.log('   🔐 Password:', TEST_USER.password);
    
    return {
      success: true,
      user: verification.user,
      questionsCount: verification.questionsCount
    };
    
  } catch (error) {
    console.error('\n🚨 DATABASE SEEDING FAILED!');
    console.error('================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute seeding if run directly
if (require.main === module) {
  seedDatabase()
    .then((result) => {
      if (result.success) {
        console.log('\n🚀 Ready for testing!');
        process.exit(0);
      } else {
        console.log('\n❌ Seeding failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, TEST_USER, SAMPLE_QUESTIONS };