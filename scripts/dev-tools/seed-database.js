import { Client, Databases, ID } from 'appwrite';

// Sample questions data (converted from TypeScript)
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
    question: "A 28-year-old man presents with a 3-day history of fever, headache, and neck stiffness. Lumbar puncture shows opening pressure 300 mmH2O, glucose 25 mg/dL (serum glucose 90 mg/dL), protein 200 mg/dL, and 500 WBCs/μL with 90% neutrophils. Gram stain shows gram-positive cocci in pairs. What is the most appropriate initial antibiotic therapy?",
    options: [
      "Ceftriaxone",
      "Vancomycin + ceftriaxone",
      "Ampicillin",
      "Doxycycline"
    ],
    correctAnswer: 1,
    explanation: "This patient has bacterial meningitis based on the CSF findings (low glucose <40 mg/dL, high protein >45 mg/dL, neutrophilic pleocytosis). The gram-positive cocci in pairs suggest Streptococcus pneumoniae. However, given the high prevalence of penicillin-resistant S. pneumoniae, the recommended empirical therapy for bacterial meningitis in adults is vancomycin PLUS ceftriaxone. This combination covers both penicillin-sensitive and penicillin-resistant pneumococci, as well as other common causes like Neisseria meningitidis.",
    category: "Infectious Disease",
    difficulty: "hard",
    usmleCategory: "microbiology",
    tags: ["meningitis", "CSF analysis", "S. pneumoniae", "antibiotics"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Micro"]
  },
  {
    question: "A 55-year-old woman with a history of rheumatoid arthritis treated with methotrexate presents with progressive shortness of breath. Chest X-ray shows bilateral lower lobe reticular opacities. High-resolution CT shows honeycombing and traction bronchiectasis. Which of the following is the most likely cause?",
    options: [
      "Methotrexate-induced pulmonary fibrosis",
      "Rheumatoid arthritis-associated interstitial lung disease",
      "Idiopathic pulmonary fibrosis", 
      "Pneumocystis jirovecii pneumonia"
    ],
    correctAnswer: 1,
    explanation: "Rheumatoid arthritis is associated with various pulmonary complications, including interstitial lung disease (RA-ILD). The bilateral lower lobe reticular pattern with honeycombing on HRCT is characteristic of usual interstitial pneumonia (UIP) pattern, which can occur in RA-ILD. While methotrexate can cause pulmonary toxicity, it typically presents as hypersensitivity pneumonitis rather than this chronic fibrotic pattern. The combination of RA history and UIP pattern on imaging makes RA-ILD most likely.",
    category: "Pulmonary",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["rheumatoid arthritis", "interstitial lung disease", "pulmonary fibrosis", "HRCT"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 8"]
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

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('688cb738000d2fbeca0a');

const databases = new Databases(client);
const DATABASE_ID = '688cbab3000f24cafc0c';
const QUESTIONS_COLLECTION_ID = 'questions';

async function seedQuestions() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Check if questions collection exists and has data
    const existingQuestions = await databases.listDocuments(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID
    );
    
    console.log(`📊 Found ${existingQuestions.total} existing questions in database`);
    
    if (existingQuestions.total > 0) {
      console.log('⚠️ Database already has questions. Skipping seeding.');
      console.log('💡 To force re-seed, delete existing questions first.');
      return;
    }
    
    console.log('🔄 Seeding database with sample questions...');
    
    for (let i = 0; i < sampleQuestions.length; i++) {
      const question = sampleQuestions[i];
      
      try {
        const document = await databases.createDocument(
          DATABASE_ID,
          QUESTIONS_COLLECTION_ID,
          ID.unique(),
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
        
        console.log(`✅ Added question ${i + 1}/${sampleQuestions.length}: ${question.category}`);
        
      } catch (error) {
        console.error(`❌ Error adding question ${i + 1}:`, error.message);
      }
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Verify seeding
    const newCount = await databases.listDocuments(
      DATABASE_ID,
      QUESTIONS_COLLECTION_ID
    );
    
    console.log(`📊 Final count: ${newCount.total} questions in database`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    
    if (error.code === 404) {
      console.log('💡 Collection might not exist. Please create the "questions" collection first.');
    }
  }
}

// Run the seeding
seedQuestions();