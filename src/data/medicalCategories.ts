/**
 * Medical categories and metadata
 * Separated from question data to avoid loading large data in main bundle
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
  // New structured categorization
  subject: string;       // Primary medical subject (e.g., "Internal Medicine", "Surgery", "Pediatrics")
  system: string;        // Body system (e.g., "Cardiovascular", "Respiratory", "Nervous")
  topics: string[];      // Sub-systems or specific topics (e.g., ["Myocardial Infarction", "ECG Interpretation"])
  points: number;        // Points awarded for correct answer (based on difficulty)
}

export const usmleCategories = {
  pathology: "Pathology & Pathophysiology",
  pharmacology: "Pharmacology & Therapeutics", 
  anatomy: "Anatomy & Embryology",
  physiology: "Physiology",
  microbiology: "Microbiology & Immunology",
  biochemistry: "Biochemistry & Molecular Biology",
  genetics: "Genetics",
  epidemiology: "Epidemiology & Public Health",
  ethics: "Medical Ethics & Law",
  radiology: "Radiology & Imaging",
  laboratory: "Laboratory Medicine",
  emergency: "Emergency Medicine",
  surgery: "Surgery & Procedures"
};

export const medicalSubjects = {
  "Internal Medicine": "Core adult medicine and diagnosis",
  "Surgery": "Surgical procedures and perioperative care",
  "Pediatrics": "Child and adolescent health",
  "Obstetrics/Gynecology": "Women's health and reproduction",
  "Psychiatry": "Mental health and behavioral medicine",
  "Neurology": "Nervous system disorders",
  "Emergency Medicine": "Acute care and trauma",
  "Family Medicine": "Comprehensive primary care",
  "Radiology": "Medical imaging and interpretation",
  "Pathology": "Disease diagnosis and mechanisms",
  "Anesthesiology": "Perioperative and pain management",
  "Ophthalmology": "Eye and vision disorders",
  "Dermatology": "Skin, hair, and nail conditions"
};

export const bodySystems = {
  "Cardiovascular": "Heart and blood vessels",
  "Respiratory": "Lungs and breathing",
  "Nervous": "Brain, spinal cord, and nerves",
  "Musculoskeletal": "Bones, muscles, and joints",
  "Gastrointestinal": "Digestive system",
  "Genitourinary": "Kidneys and reproductive organs",
  "Endocrine": "Hormones and metabolism",
  "Hematologic": "Blood and lymphatic system",
  "Immune": "Immune system and allergies",
  "Integumentary": "Skin and related structures"
};

export const systemTopics = {
  "Cardiovascular": ["Myocardial Infarction", "Heart Failure", "Arrhythmias", "Hypertension", "Valvular Disease"],
  "Respiratory": ["COPD", "Asthma", "Pneumonia", "Pulmonary Embolism", "Lung Cancer"],
  "Nervous": ["Stroke", "Epilepsy", "Multiple Sclerosis", "Parkinson's Disease", "Alzheimer's Disease"],
  "Musculoskeletal": ["Fractures", "Arthritis", "Osteoporosis", "Back Pain", "Sports Injuries"],
  "Gastrointestinal": ["GERD", "IBD", "Liver Disease", "Gallbladder Disease", "GI Bleeding"],
  "Genitourinary": ["UTI", "Kidney Disease", "Prostate Disease", "Reproductive Health", "STDs"],
  "Endocrine": ["Diabetes", "Thyroid Disease", "Adrenal Disease", "Pituitary Disease", "Metabolic Disorders"],
  "Hematologic": ["Anemia", "Bleeding Disorders", "Thrombosis", "Leukemia", "Lymphoma"],
  "Immune": ["Autoimmune Disease", "Immunodeficiency", "Allergies", "Transplant Medicine", "Vaccines"],
  "Integumentary": ["Dermatitis", "Skin Cancer", "Infectious Skin Disease", "Hair Disorders", "Nail Disorders"]
};

export const medicalSpecialties = {
  "Cardiology": "Heart and cardiovascular system",
  "Pulmonology": "Lungs and respiratory system", 
  "Neurology": "Brain and nervous system",
  "Gastroenterology": "Digestive system",
  "Nephrology": "Kidneys and urinary system",
  "Endocrinology": "Hormones and metabolism",
  "Hematology/Oncology": "Blood disorders and cancer",
  "Rheumatology": "Autoimmune and joint diseases",
  "Infectious Disease": "Infections and antimicrobials",
  "Dermatology": "Skin conditions",
  "Ophthalmology": "Eye diseases",
  "Orthopedics": "Bone and joint surgery",
  "Urology": "Urinary and reproductive system surgery",
  "Otolaryngology": "Ear, nose, and throat",
  "Radiology": "Medical imaging",
  "Pathology": "Disease diagnosis",
  "Anesthesiology": "Pain management and perioperative care",
  "Emergency Medicine": "Acute and urgent care",
  "Family Medicine": "Primary care",
  "Pediatrics": "Child health",
  "Obstetrics/Gynecology": "Women's health"
};

export const difficultyPoints = {
  easy: 5,
  medium: 10,
  hard: 20
};

export const quizModes = {
  quick: {
    name: "Quick Practice",
    description: "5 questions, no time limit",
    questions: 5,
    timeLimit: null,
    icon: "⚡"
  },
  timed: {
    name: "Timed Practice",
    description: "10 questions, 10 minutes",
    questions: 10,
    timeLimit: 10,
    icon: "⏱️"
  },
  custom: {
    name: "Custom Quiz",
    description: "Choose your own settings",
    questions: null,
    timeLimit: null,
    icon: "⚙️"
  },
  exam: {
    name: "Practice Exam",
    description: "50 questions, 60 minutes",
    questions: 50,
    timeLimit: 60,
    icon: "📝"
  }
};