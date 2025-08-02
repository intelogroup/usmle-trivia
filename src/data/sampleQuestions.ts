/**
 * Sample USMLE-style medical questions for testing
 * These are for development purposes only and should be replaced with professionally reviewed content
 */

export interface QuestionData {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  usmleCategory: string;
  tags: string[];
  medicalReferences?: string[];
}

export const sampleQuestions: QuestionData[] = [
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
  },
  {
    question: "A 67-year-old man with diabetes mellitus presents with gradually worsening vision in his right eye over several months. Fundoscopic examination reveals neovascularization, hard exudates, and microaneurysms. Which of the following is the most appropriate next step in management?",
    options: [
      "Immediate cataract surgery",
      "Laser photocoagulation therapy",
      "Intravitreal corticosteroid injection",
      "Topical antibiotic drops"
    ],
    correctAnswer: 1,
    explanation: "This patient has diabetic retinopathy with neovascularization, indicating proliferative diabetic retinopathy (PDR). The presence of neovascularization is a sight-threatening complication that requires urgent treatment to prevent further vision loss and complications like vitreous hemorrhage or retinal detachment. Laser photocoagulation (panretinal photocoagulation) is the standard treatment for PDR to reduce neovascularization and preserve vision.",
    category: "Ophthalmology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["diabetic retinopathy", "neovascularization", "laser therapy", "diabetes complications"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  {
    question: "A 45-year-old woman presents with muscle weakness, difficulty swallowing, and double vision that worsens throughout the day and improves with rest. Acetylcholine receptor antibodies are positive. Which of the following medications would be most appropriate for symptomatic treatment?",
    options: [
      "Pyridostigmine",
      "Prednisone",
      "Azathioprine",
      "Plasmapheresis"
    ],
    correctAnswer: 0,
    explanation: "This patient has myasthenia gravis, characterized by fatigable weakness, bulbar symptoms (dysphagia, diplopia), and positive acetylcholine receptor antibodies. Pyridostigmine is an acetylcholinesterase inhibitor that increases the amount of acetylcholine available at the neuromuscular junction, providing symptomatic relief. While prednisone and azathioprine are used for immunosuppression in myasthenia gravis, and plasmapheresis for acute exacerbations, pyridostigmine is the first-line symptomatic treatment.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["myasthenia gravis", "acetylcholinesterase inhibitor", "neuromuscular junction", "pyridostigmine"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Pharm"]
  },
  {
    question: "A 31-year-old pregnant woman at 28 weeks gestation presents with severe headache, blurred vision, and epigastric pain. Blood pressure is 165/105 mmHg. Urinalysis shows 3+ proteinuria. Laboratory studies reveal platelets 85,000/μL, AST 120 U/L, and LDH 600 U/L. What is the most likely diagnosis?",
    options: [
      "Gestational hypertension",
      "Preeclampsia",
      "HELLP syndrome",
      "Acute fatty liver of pregnancy"
    ],
    correctAnswer: 2,
    explanation: "HELLP syndrome is a severe variant of preeclampsia characterized by Hemolysis (elevated LDH), Elevated Liver enzymes (AST >70), and Low Platelets (<100,000). This patient has all three components plus hypertension and proteinuria. The combination of epigastric pain (from liver involvement), thrombocytopenia, elevated liver enzymes, and hemolysis (elevated LDH) in a pregnant woman with hypertension and proteinuria is diagnostic of HELLP syndrome, which is a medical emergency requiring immediate delivery.",
    category: "Obstetrics/Gynecology",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["HELLP syndrome", "preeclampsia", "pregnancy complications", "liver enzymes"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  {
    question: "A 72-year-old man presents with progressive memory loss and behavioral changes over the past year. Brain MRI shows bilateral temporal lobe atrophy. Cerebrospinal fluid shows tau protein elevation and decreased amyloid-β42. What is the most likely diagnosis?",
    options: [
      "Alzheimer's disease",
      "Frontotemporal dementia",
      "Lewy body dementia",
      "Normal pressure hydrocephalus"
    ],
    correctAnswer: 0,
    explanation: "The combination of progressive memory loss, bilateral temporal lobe atrophy on MRI, and CSF findings of elevated tau protein with decreased amyloid-β42 is characteristic of Alzheimer's disease. The temporal lobe atrophy correlates with the memory impairment, and the CSF biomarkers (elevated tau and decreased Aβ42) are specific for Alzheimer's pathology. Frontotemporal dementia typically shows frontal/temporal atrophy but different CSF findings, while Lewy body dementia has different clinical features and biomarkers.",
    category: "Neurology",  
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Alzheimer's disease", "dementia", "CSF biomarkers", "temporal lobe atrophy"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 17"]
  },
  {
    question: "A 19-year-old college student presents with a 3-day history of severe abdominal pain, nausea, and vomiting. She reports that the pain started around her umbilicus and then moved to the right lower quadrant. Physical examination reveals McBurney's point tenderness and positive psoas sign. What is the most appropriate next step?",
    options: [
      "CT scan of the abdomen and pelvis",
      "Upper GI series",
      "Immediate surgical consultation",
      "Discharge with symptomatic treatment"
    ],
    correctAnswer: 2,
    explanation: "This patient has classic signs and symptoms of acute appendicitis: periumbilical pain that migrates to the right lower quadrant, McBurney's point tenderness, and positive psoas sign. In a young patient with classic presentation, immediate surgical consultation for appendectomy is appropriate. While CT scan can be helpful in unclear cases, the classic presentation warrants urgent surgical evaluation to prevent complications like perforation. Delaying surgery in classic appendicitis increases morbidity and mortality.",
    category: "Surgery",
    difficulty: "easy", 
    usmleCategory: "pathology",
    tags: ["appendicitis", "McBurney's point", "psoas sign", "surgical emergency"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  }
];

// Helper function to get questions by category
export function getQuestionsByCategory(category: string): QuestionData[] {
  return sampleQuestions.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

// Helper function to get questions by difficulty
export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): QuestionData[] {
  return sampleQuestions.filter(q => q.difficulty === difficulty);
}

// Helper function to get random questions
export function getRandomQuestions(count: number): QuestionData[] {
  const shuffled = [...sampleQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Quiz mode configurations
export const quizModes = {
  quick: {
    name: 'Quick Quiz',
    questionCount: 5,
    timeLimit: null, // No time limit
    description: '5 random questions, no time pressure'
  },
  timed: {
    name: 'Timed Practice', 
    questionCount: 10,
    timeLimit: 600, // 10 minutes
    description: '10 questions in 10 minutes'
  },
  custom: {
    name: 'Custom Quiz',
    questionCount: null, // User defined
    timeLimit: null, // User defined
    description: 'Customize your quiz experience'
  }
};