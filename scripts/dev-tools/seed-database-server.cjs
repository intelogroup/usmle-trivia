#!/usr/bin/env node

/**
 * Server-side database seeding script for MedQuiz Pro
 * Uses node-appwrite for server-side operations
 */

const sdk = require('node-appwrite');

// Initialize Appwrite client with server SDK
const client = new sdk.Client();
client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('688cb738000d2fbeca0a')
  .setKey('standard_b22ff614f85dc9a8732a8782c082461714c3d20cf55be3096b9bd8e8b0adcb113326fa3a88edf5c87ea588973d7a3017b38cce11ead7dc582aeb713f08ff5b45926fee6ccea370266fc7ed8a304533fd9e0725d87b3ff77d04bc19b9b38d999c6448474652875b94dbb3d713f7b85bfe16779df81ceb97f4ed04aaefc4ac119f');

const databases = new sdk.Databases(client);
const users = new sdk.Users(client);
const DATABASE_ID = '688cbab3000f24cafc0c';
const QUESTIONS_COLLECTION_ID = 'questions';

// Extended question bank with more USMLE questions
const additionalQuestions = [
  {
    question: "A 34-year-old woman presents with palpitations, weight loss, and heat intolerance. Physical examination reveals an enlarged thyroid gland and exophthalmos. TSH is <0.01 mU/L and free T4 is 4.2 ng/dL. Which antibody is most likely positive?",
    options: [
      "Anti-TPO antibodies",
      "TSH receptor antibodies (TRAb)",
      "Anti-thyroglobulin antibodies",
      "Anti-microsomal antibodies"
    ],
    correctAnswer: 1,
    explanation: "This patient has classic signs of Graves' disease: hyperthyroidism with goiter and exophthalmos (Graves' ophthalmopathy). Graves' disease is caused by TSH receptor antibodies (TRAb) that stimulate the thyroid gland, leading to hyperthyroidism. The exophthalmos is pathognomonic for Graves' disease and helps differentiate it from other causes of hyperthyroidism.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Graves disease", "hyperthyroidism", "TSH receptor antibodies", "exophthalmos"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 19"]
  },
  {
    question: "A 28-year-old man presents with a 2-week history of bloody diarrhea, abdominal cramping, and urgency. Colonoscopy shows continuous mucosal inflammation from the rectum to the splenic flexure with loss of haustral markings. What is the most likely diagnosis?",
    options: [
      "Crohn's disease",
      "Ulcerative colitis",
      "Ischemic colitis",
      "Infectious colitis"
    ],
    correctAnswer: 1,
    explanation: "The key features pointing to ulcerative colitis include: continuous mucosal inflammation (no skip lesions), involvement starting from the rectum extending proximally, and loss of haustral markings ('lead pipe' appearance). Crohn's disease typically shows skip lesions, can affect any part of the GI tract, and involves transmural inflammation. The continuous pattern from rectum extending proximally is classic for UC.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["ulcerative colitis", "IBD", "colonoscopy", "bloody diarrhea"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 11"]
  },
  {
    question: "A 55-year-old smoker presents with a 3-month history of progressive dyspnea and weight loss. Chest X-ray shows a large right upper lobe mass. Biopsy reveals large cells with keratin pearls and intercellular bridges. Which of the following is the most likely diagnosis?",
    options: [
      "Adenocarcinoma",
      "Squamous cell carcinoma",
      "Small cell lung cancer",
      "Large cell carcinoma"
    ],
    correctAnswer: 1,
    explanation: "The histologic features of keratin pearls and intercellular bridges are pathognomonic for squamous cell carcinoma. This type of lung cancer is strongly associated with smoking and often presents as a central/hilar mass. Adenocarcinoma lacks these specific features and is more common in non-smokers, while small cell carcinoma has small cells with scant cytoplasm and large cell carcinoma lacks the specific differentiation features.",
    category: "Pulmonary",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["lung cancer", "squamous cell carcinoma", "keratin pearls", "smoking"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 8"]
  },
  {
    question: "A 3-year-old boy is brought by his parents for evaluation of recurrent respiratory infections and failure to thrive. Sweat chloride test is 70 mEq/L (normal <40). Which of the following proteins is most likely defective?",
    options: [
      "α1-antitrypsin",
      "CFTR (cystic fibrosis transmembrane conductance regulator)",
      "Surfactant protein B",
      "Clara cell protein"
    ],
    correctAnswer: 1,
    explanation: "The combination of recurrent respiratory infections, failure to thrive, and elevated sweat chloride (>60 mEq/L) is diagnostic of cystic fibrosis. CF is caused by mutations in the CFTR gene, which encodes a chloride channel. The defective CFTR protein leads to thick, viscous secretions that obstruct airways and pancreatic ducts, resulting in the clinical manifestations seen in this patient.",
    category: "Pediatrics",
    difficulty: "easy",
    usmleCategory: "genetics",
    tags: ["cystic fibrosis", "CFTR", "sweat test", "failure to thrive"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 8"]
  },
  {
    question: "A 65-year-old man with a history of atrial fibrillation presents with sudden onset of severe abdominal pain out of proportion to physical findings. CT angiography shows occlusion of the superior mesenteric artery. What is the most likely cause of this patient's condition?",
    options: [
      "Atherosclerotic plaque rupture",
      "Embolic phenomenon from atrial fibrillation",
      "Mesenteric venous thrombosis",
      "Nonocclusive mesenteric ischemia"
    ],
    correctAnswer: 1,
    explanation: "Acute mesenteric ischemia in a patient with atrial fibrillation is most commonly due to embolism from the left atrium. Atrial fibrillation predisposes to thrombus formation in the left atrial appendage, which can embolize to various organs including the mesenteric circulation. The acute onset and complete occlusion on CT angiography support an embolic rather than thrombotic cause.",
    category: "Surgery",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["mesenteric ischemia", "atrial fibrillation", "embolism", "SMA occlusion"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  {
    question: "A 25-year-old woman presents with amenorrhea for 6 months. She has a history of anorexia nervosa and her BMI is 16 kg/m². LH and FSH levels are low. Which of the following best explains the mechanism of her amenorrhea?",
    options: [
      "Primary ovarian failure",
      "Hypothalamic dysfunction",
      "Pituitary adenoma",
      "Polycystic ovary syndrome"
    ],
    correctAnswer: 1,
    explanation: "In patients with anorexia nervosa and low BMI, amenorrhea is caused by hypothalamic dysfunction due to stress and low body weight. The hypothalamus decreases GnRH release, leading to low LH and FSH (hypogonadotropic hypogonadism). This is a protective mechanism during periods of nutritional stress. Primary ovarian failure would show high LH/FSH, while PCOS typically shows elevated LH:FSH ratio.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "physiology",
    tags: ["amenorrhea", "anorexia nervosa", "hypogonadotropic hypogonadism", "hypothalamic dysfunction"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  {
    question: "A 42-year-old man presents with progressive muscle weakness and difficulty climbing stairs. Physical examination reveals proximal muscle weakness and a heliotrope rash around the eyes. Muscle biopsy shows inflammatory infiltrates. Which antibody is most commonly associated with this condition?",
    options: [
      "Anti-Jo-1 antibodies",
      "Anti-centromere antibodies",
      "Anti-Scl-70 antibodies",
      "Anti-dsDNA antibodies"
    ],
    correctAnswer: 0,
    explanation: "This patient has dermatomyositis, characterized by proximal muscle weakness and the pathognomonic heliotrope rash (violaceous discoloration around the eyes). Anti-Jo-1 antibodies are associated with myositis syndromes, particularly dermatomyositis and polymyositis. These antibodies are part of the anti-synthetase syndrome and are associated with interstitial lung disease, arthritis, and mechanic's hands.",
    category: "Rheumatology",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["dermatomyositis", "heliotrope rash", "Anti-Jo-1", "myositis"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  {
    question: "A 16-year-old boy presents with a 2-day history of severe testicular pain and swelling. Physical examination reveals an enlarged, tender testis with absent cremasteric reflex. Doppler ultrasound shows decreased blood flow to the affected testis. What is the most appropriate immediate management?",
    options: [
      "Antibiotic therapy",
      "Scrotal elevation and NSAIDs",
      "Immediate surgical exploration",
      "Observation for 24 hours"
    ],
    correctAnswer: 2,
    explanation: "This presentation is highly suggestive of testicular torsion: acute onset of severe testicular pain, absent cremasteric reflex, and decreased blood flow on Doppler. Testicular torsion is a urological emergency requiring immediate surgical exploration (detorsion and orchiopexy) to salvage the testis. The window for testicular salvage is approximately 6 hours, making this a time-sensitive emergency. Delay in treatment leads to testicular necrosis and loss.",
    category: "Urology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["testicular torsion", "urological emergency", "detorsion", "orchiopexy"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  {
    question: "A 58-year-old diabetic woman presents with malodorous vaginal discharge and pelvic pain. Pelvic examination reveals necrotic tissue in the vaginal vault. CT shows gas in the soft tissues of the pelvis. Blood glucose is 450 mg/dL. Which organism is most likely responsible?",
    options: [
      "Candida albicans",
      "Clostridium perfringens",
      "Escherichia coli",
      "Group B Streptococcus"
    ],
    correctAnswer: 1,
    explanation: "The combination of necrotic tissue, gas in soft tissues (pneumogas), and severe diabetes suggests necrotizing fasciitis caused by Clostridium perfringens. This gram-positive, spore-forming anaerobe produces lecithinase and other toxins that cause rapid tissue necrosis and gas production. Diabetic patients are at increased risk for this life-threatening infection, which requires immediate surgical debridement and antibiotic therapy.",
    category: "Infectious Disease",
    difficulty: "hard",
    usmleCategory: "microbiology",
    tags: ["necrotizing fasciitis", "Clostridium perfringens", "diabetes", "gas gangrene"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Micro"]
  },
  {
    question: "A 8-year-old boy presents with sudden onset of bilateral lower extremity weakness and loss of bowel control after falling from a tree. MRI shows compression at the L2 level. Which part of the spinal cord anatomy explains the bowel and bladder dysfunction?",
    options: [
      "Corticospinal tracts",
      "Dorsal columns",
      "Autonomic nerve fibers in the conus medullaris",
      "Spinothalamic tracts"
    ],
    correctAnswer: 2,
    explanation: "The conus medullaris (L1-L2 level) contains autonomic nerve fibers that control bowel and bladder function. Injury at this level can cause conus medullaris syndrome, characterized by lower motor neuron findings in the legs, saddle anesthesia, and loss of bowel/bladder control due to damage to parasympathetic fibers. The corticospinal and other ascending/descending tracts primarily control motor and sensory functions but not autonomic functions.",
    category: "Neurology",
    difficulty: "hard",
    usmleCategory: "anatomy",
    tags: ["conus medullaris", "spinal cord injury", "autonomic dysfunction", "bowel bladder control"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Netter's Anatomy"]
  },
  {
    question: "A 52-year-old man with a history of heavy alcohol use presents with progressive confusion and ataxia. MRI brain shows symmetric hyperintensities in the mammillary bodies and periaqueductal gray matter. Which vitamin deficiency is most likely responsible?",
    options: [
      "Vitamin B1 (thiamine)",
      "Vitamin B12 (cobalamin)",
      "Vitamin B6 (pyridoxine)",
      "Folate"
    ],
    correctAnswer: 0,
    explanation: "This patient has Wernicke encephalopathy, characterized by the classic triad of confusion, ataxia, and ophthalmoplegia (though all three may not always be present). The MRI findings of symmetric hyperintensities in mammillary bodies and periaqueductal gray matter are characteristic. Wernicke encephalopathy is caused by thiamine (B1) deficiency, commonly seen in chronic alcoholics due to poor nutrition and impaired thiamine absorption.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Wernicke encephalopathy", "thiamine deficiency", "alcoholism", "mammillary bodies"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 17"]
  },
  {
    question: "A 35-year-old woman presents with recurrent kidney stones. Laboratory studies show hypercalciuria, hypocitraturia, and normal serum calcium. Urinalysis shows calcium oxalate crystals. Which of the following dietary modifications would be most beneficial?",
    options: [
      "Decrease calcium intake",
      "Increase sodium intake",
      "Increase citrate intake",
      "Increase oxalate intake"
    ],
    correctAnswer: 2,
    explanation: "This patient has idiopathic hypercalciuria with calcium oxalate stones. Citrate is a stone inhibitor that binds calcium and prevents stone formation. Hypocitraturia is a risk factor for calcium stone formation. Increasing citrate intake (through citrus fruits, potassium citrate supplements) would be most beneficial. Decreasing calcium intake paradoxically increases oxalate absorption and stone risk. Sodium restriction, not increase, is recommended as it reduces calcium excretion.",
    category: "Nephrology",
    difficulty: "medium",
    usmleCategory: "physiology",
    tags: ["kidney stones", "hypercalciuria", "citrate", "calcium oxalate"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  {
    question: "A 29-year-old pregnant woman at 20 weeks gestation undergoes routine ultrasound screening. The fetus shows enlarged ventricles, a lemon-shaped skull, and banana-shaped cerebellum. Which of the following is the most likely diagnosis?",
    options: [
      "Anencephaly",
      "Spina bifida with Chiari II malformation",
      "Holoprosencephaly",
      "Dandy-Walker malformation"
    ],
    correctAnswer: 1,
    explanation: "The ultrasound findings of enlarged ventricles (hydrocephalus), lemon-shaped skull, and banana-shaped cerebellum are pathognomonic for Chiari II malformation associated with spina bifida (myelomeningocele). The lemon sign reflects frontal bone scalloping, while the banana sign shows cerebellar herniation and compression. These are classic prenatal ultrasound markers for neural tube defects with Chiari II malformation.",
    category: "Obstetrics/Gynecology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Chiari II malformation", "spina bifida", "lemon sign", "banana sign", "prenatal diagnosis"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  {
    question: "A 45-year-old man presents with recurrent episodes of severe periorbital headache lasting 30-90 minutes, associated with ipsilateral nasal congestion and lacrimation. The episodes occur daily for 2-3 weeks, then disappear for months. What is the most effective acute treatment?",
    options: [
      "Sumatriptan injection",
      "High-flow oxygen",
      "Oral morphine",
      "Intravenous hydrocortisone"
    ],
    correctAnswer: 1,
    explanation: "This patient has cluster headaches, characterized by severe unilateral periorbital pain with autonomic symptoms (nasal congestion, lacrimation) occurring in clusters with pain-free intervals. High-flow oxygen (100% O2 at 7-12 L/min) is the most effective acute treatment for cluster headaches, providing relief in 70-80% of patients within 15 minutes. Sumatriptan can also be effective but oxygen is first-line due to its safety profile and effectiveness.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["cluster headache", "oxygen therapy", "trigeminal autonomic cephalgia", "acute treatment"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  }
];

// Function to create test user
async function createTestUser() {
  console.log('👤 Creating test user...');
  
  try {
    // Check if user already exists
    try {
      const existingUsers = await users.list([
        sdk.Query.equal('email', 'johndoe2025@gmail.com')
      ]);
      
      if (existingUsers.total > 0) {
        console.log('ℹ️  Test user already exists');
        return existingUsers.users[0];
      }
    } catch (error) {
      // User doesn't exist, proceed to create
    }
    
    // Create new user
    const newUser = await users.create(
      sdk.ID.unique(),
      'johndoe2025@gmail.com',
      undefined, // phone
      'Jimkali90#', // password
      'John Doe Test User' // name
    );
    
    console.log('✅ Test user created successfully:', newUser.email);
    
    // Create user document in users collection
    const userDoc = await databases.createDocument(
      DATABASE_ID,
      'users',
      newUser.$id,
      {
        email: 'johndoe2025@gmail.com',
        name: 'John Doe Test User',
        points: 0,
        level: 1,
        streak: 0,
        totalQuizzes: 0,
        accuracy: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    
    console.log('✅ User document created in database');
    return newUser;
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    throw error;
  }
}

// Function to seed questions
async function seedQuestions() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Check existing questions
    const existingQuestions = await databases.listDocuments(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID
    );
    
    console.log(`📊 Found ${existingQuestions.total} existing questions in database`);
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`🔄 Adding ${additionalQuestions.length} new questions...`);
    
    for (let i = 0; i < additionalQuestions.length; i++) {
      const question = additionalQuestions[i];
      
      try {
        const document = await databases.createDocument(
          DATABASE_ID,
          QUESTIONS_COLLECTION_ID,
          sdk.ID.unique(),
          {
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
        
        console.log(`✅ Added question ${i + 1}/${additionalQuestions.length}: ${question.category} - ${question.difficulty}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error adding question ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    // Final count
    const finalCount = await databases.listDocuments(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID
    );
    
    console.log('\n🎯 Seeding Summary:');
    console.log(`✅ Successfully added: ${successCount} questions`);
    console.log(`❌ Failed to add: ${errorCount} questions`);
    console.log(`📊 Total questions in database: ${finalCount.total}`);
    
    return { successCount, errorCount, totalCount: finalCount.total };
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    throw error;
  }
}

// Function to verify database schema
async function verifyDatabaseSchema() {
  console.log('🔍 Verifying database schema...');
  
  try {
    // Check collections
    const collections = await databases.listCollections(DATABASE_ID);
    console.log(`📋 Found ${collections.total} collections:`);
    
    collections.collections.forEach(collection => {
      console.log(`  - ${collection.name} (${collection.$id})`);
    });
    
    // Check users collection
    const users = await databases.listDocuments(DATABASE_ID, 'users');
    console.log(`👥 Users collection: ${users.total} users`);
    
    // Check questions collection  
    const questions = await databases.listDocuments(DATABASE_ID, 'questions');
    console.log(`❓ Questions collection: ${questions.total} questions`);
    
    // Check quiz_sessions collection
    const sessions = await databases.listDocuments(DATABASE_ID, 'quiz_sessions');
    console.log(`📝 Quiz sessions collection: ${sessions.total} sessions`);
    
    return {
      collectionsCount: collections.total,
      usersCount: users.total,
      questionsCount: questions.total,
      sessionsCount: sessions.total
    };
    
  } catch (error) {
    console.error('❌ Database schema verification failed:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Appwrite database verification and seeding...\n');
    
    // Step 1: Verify database schema
    const schemaInfo = await verifyDatabaseSchema();
    console.log('\n✅ Database schema verified successfully');
    
    // Step 2: Create test user
    await createTestUser();
    console.log('\n✅ Test user setup completed');
    
    // Step 3: Seed additional questions
    const seedingResult = await seedQuestions();
    console.log('\n✅ Database seeding completed');
    
    console.log('\n🎉 All operations completed successfully!');
    console.log('\n📊 Final Status:');
    console.log(`  - Collections: ${schemaInfo.collectionsCount}`);
    console.log(`  - Users: ${schemaInfo.usersCount + 1} (including test user)`);
    console.log(`  - Questions: ${seedingResult.totalCount}`);
    console.log(`  - Quiz Sessions: ${schemaInfo.sessionsCount}`);
    console.log('\n✅ Ready for authentication testing with johndoe2025@gmail.com');
    
  } catch (error) {
    console.error('\n💥 Operation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();