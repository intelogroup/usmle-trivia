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
  // New structured categorization
  subject: string;       // Primary medical subject (e.g., "Internal Medicine", "Surgery", "Pediatrics")
  system: string;        // Body system (e.g., "Cardiovascular", "Respiratory", "Nervous")
  topics: string[];      // Sub-systems or specific topics (e.g., ["Myocardial Infarction", "ECG Interpretation"])
  points: number;        // Points awarded for correct answer (based on difficulty)
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
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 4"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Myocardial Infarction", "ECG Interpretation", "Coronary Anatomy"],
    points: 15
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
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 19"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Thyroid Disorders", "Hypothyroidism", "Autoimmune Diseases"],
    points: 10
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
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Micro"],
    subject: "Internal Medicine",
    system: "Nervous System", 
    topics: ["CNS Infections", "Bacterial Meningitis", "Antibiotic Therapy"],
    points: 20
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
  },
  // New USMLE Categories - Psychiatry
  {
    question: "A 25-year-old woman presents with a 6-month history of hearing voices that tell her she is special and chosen by God. She has delusions of grandiosity and believes she can read people's minds. She has poor hygiene and social withdrawal. What is the most likely diagnosis?",
    options: [
      "Bipolar disorder with psychotic features",
      "Schizophrenia",
      "Major depressive disorder with psychotic features", 
      "Brief psychotic disorder"
    ],
    correctAnswer: 1,
    explanation: "This patient meets criteria for schizophrenia with positive symptoms (auditory hallucinations, delusions of grandiosity, thought broadcasting) and negative symptoms (poor hygiene, social withdrawal) lasting >6 months. The duration rules out brief psychotic disorder (<1 month). The absence of significant mood symptoms makes bipolar disorder or major depression with psychotic features less likely.",
    category: "Psychiatry",
    difficulty: "medium",
    usmleCategory: "behavioral sciences",
    tags: ["schizophrenia", "psychosis", "hallucinations", "delusions"],
    medicalReferences: ["DSM-5", "First Aid USMLE Step 1 2025"]
  },
  // Dermatology
  {
    question: "A 45-year-old fair-skinned man presents with a 6mm asymmetric, irregularly bordered, dark brown lesion with color variation on his back. The lesion has grown larger over the past 3 months. What is the most likely diagnosis?",
    options: [
      "Seborrheic keratosis",
      "Melanoma",
      "Basal cell carcinoma",
      "Dysplastic nevus"
    ],
    correctAnswer: 1,
    explanation: "This lesion demonstrates the ABCDE criteria for melanoma: Asymmetry, irregular Borders, Color variation, Diameter >6mm, and Evolving (growing larger). The combination of all these features in a fair-skinned individual is highly suspicious for malignant melanoma, which requires immediate biopsy and staging.",
    category: "Dermatology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["melanoma", "ABCDE criteria", "skin cancer", "pigmented lesion"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 21"]
  },
  // Emergency Medicine
  {
    question: "A 32-year-old man is brought to the ED after a motorcycle accident. He is unconscious with a Glasgow Coma Scale of 8. CT head shows a right-sided epidural hematoma. What is the most appropriate immediate management?",
    options: [
      "Mannitol and hyperventilation",
      "Emergency craniotomy",
      "Observation with serial neurologic exams",
      "Lumbar puncture"
    ],
    correctAnswer: 1,
    explanation: "Epidural hematoma with GCS ≤8 indicates severe head trauma with mass effect and impending herniation. Emergency surgical evacuation (craniotomy) is required to prevent brainstem compression and death. The 'lucid interval' followed by rapid deterioration is classic for epidural hematoma. Medical management alone is insufficient for large epidural hematomas.",
    category: "Emergency Medicine",
    difficulty: "hard", 
    usmleCategory: "pathology",
    tags: ["epidural hematoma", "head trauma", "neurosurgery", "herniation"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Orthopedics
  {
    question: "A 67-year-old woman with osteoporosis falls and presents with severe hip pain and inability to bear weight. X-ray shows a displaced femoral neck fracture. What is the most appropriate surgical treatment?",
    options: [
      "Open reduction and internal fixation",
      "Hip hemiarthroplasty",
      "Total hip arthroplasty", 
      "Conservative management with bed rest"
    ],
    correctAnswer: 1,
    explanation: "In elderly patients (>65 years) with displaced femoral neck fractures, hemiarthroplasty is preferred over ORIF due to high rates of nonunion and avascular necrosis with internal fixation. The femoral head blood supply is compromised in displaced fractures. Hemiarthroplasty allows immediate weight bearing and has lower revision rates than ORIF in this population.",
    category: "Orthopedics",
    difficulty: "medium",
    usmleCategory: "surgery",
    tags: ["femoral neck fracture", "hemiarthroplasty", "osteoporosis", "avascular necrosis"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Pediatrics
  {
    question: "A 2-year-old boy presents with sudden onset of severe colicky abdominal pain, vomiting, and bloody stool. Physical exam reveals a palpable sausage-shaped mass in the right upper quadrant. What is the most likely diagnosis?",
    options: [
      "Pyloric stenosis",
      "Intussusception", 
      "Appendicitis",
      "Meckel's diverticulum"
    ],
    correctAnswer: 1,
    explanation: "The triad of colicky abdominal pain, bloody stool ('currant jelly' stool), and palpable abdominal mass in a toddler is classic for intussusception. The ileocolic type is most common, with the ileum telescoping into the colon. The sausage-shaped mass represents the intussuscepted bowel. This is a surgical emergency that can lead to bowel necrosis if not promptly reduced.",
    category: "Pediatrics",
    difficulty: "medium",
    usmleCategory: "surgery",
    tags: ["intussusception", "bloody stool", "colicky pain", "sausage-shaped mass"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Urology
  {
    question: "A 28-year-old man presents with acute onset of severe left flank pain radiating to the groin, nausea, and hematuria. Non-contrast CT shows a 6mm stone in the left ureter. What is the most appropriate initial management?",
    options: [
      "Immediate ureteroscopy with stone extraction",
      "Extracorporeal shock wave lithotripsy (ESWL)",
      "Conservative management with hydration and pain control",
      "Percutaneous nephrolithotomy"
    ],
    correctAnswer: 2,
    explanation: "Ureteral stones <10mm have a high likelihood of spontaneous passage (>90% for stones <5mm, ~50% for 5-10mm stones). Conservative management with adequate hydration, pain control (NSAIDs), and possibly alpha-blockers (tamsulosin) to facilitate passage is appropriate first-line therapy. Surgical intervention is reserved for failed conservative management, intractable pain, or signs of obstruction.",
    category: "Urology",
    difficulty: "medium",
    usmleCategory: "surgery", 
    tags: ["nephrolithiasis", "ureteral stone", "renal colic", "conservative management"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Radiology
  {
    question: "A 55-year-old woman with breast cancer undergoes staging CT. The report describes multiple 'punched-out' lucent lesions in the spine and pelvis without surrounding sclerosis. What type of metastatic pattern is this?",
    options: [
      "Osteoblastic metastases",
      "Osteolytic metastases",
      "Mixed osteolytic and osteoblastic metastases",
      "Pathologic fractures"
    ],
    correctAnswer: 1,
    explanation: "Breast cancer commonly causes osteolytic (lucent/punched-out) metastases that destroy bone without new bone formation, appearing as dark areas on imaging. This is in contrast to osteoblastic metastases (seen with prostate cancer) which appear as sclerotic/white areas due to new bone formation. The absence of surrounding sclerosis confirms the purely osteolytic nature.",
    category: "Radiology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["osteolytic metastases", "breast cancer", "bone metastases", "imaging"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Gastroenterology
  {
    question: "A 45-year-old man with a history of alcohol abuse presents with severe epigastric pain radiating to the back, nausea, and vomiting. Serum lipase is elevated at 800 U/L (normal <160). CT shows pancreatic edema and peripancreatic fluid collection. What is the most likely diagnosis?",
    options: [
      "Pancreatic adenocarcinoma",
      "Acute pancreatitis",
      "Chronic pancreatitis", 
      "Pancreatic pseudocyst"
    ],
    correctAnswer: 1,
    explanation: "The combination of severe epigastric pain radiating to the back, elevated lipase (>3x normal), and CT findings of pancreatic edema in a patient with alcohol abuse is classic for acute pancreatitis. Alcohol is one of the most common causes of acute pancreatitis. The peripancreatic fluid collection is consistent with acute inflammatory changes rather than a chronic pseudocyst.",
    category: "Gastroenterology",
    difficulty: "easy",
    usmleCategory: "pathology", 
    tags: ["acute pancreatitis", "alcohol abuse", "lipase elevation", "epigastric pain"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 11"]
  },
  // Rheumatology  
  {
    question: "A 28-year-old woman presents with a butterfly rash across her cheeks, joint pain affecting multiple joints, and fatigue. Laboratory studies show ANA 1:640 (speckled pattern), anti-dsDNA antibodies positive, and complement levels (C3, C4) are low. What is the most likely diagnosis?",
    options: [
      "Systemic lupus erythematosus (SLE)",
      "Sjögren's syndrome",
      "Systemic sclerosis",
      "Rheumatoid arthritis"
    ],
    correctAnswer: 0,
    explanation: "This patient meets multiple criteria for SLE: malar (butterfly) rash, arthritis, positive ANA, and positive anti-dsDNA antibodies. Low complement levels (C3, C4) indicate active disease with immune complex formation and complement consumption. Anti-dsDNA antibodies are highly specific for SLE and correlate with disease activity, particularly lupus nephritis.",
    category: "Rheumatology",
    difficulty: "medium",
    usmleCategory: "immunology",
    tags: ["SLE", "butterfly rash", "anti-dsDNA", "complement", "autoimmune"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Hematology/Oncology
  {
    question: "A 65-year-old man presents with fatigue and easy bruising. CBC shows Hgb 8.2 g/dL, platelets 45,000/μL, and WBC 2,800/μL with 15% blasts. Bone marrow biopsy shows hypercellularity with dysplastic changes in all cell lines and 10% blasts. What is the most likely diagnosis?",
    options: [
      "Acute myeloid leukemia",
      "Myelodysplastic syndrome",
      "Aplastic anemia", 
      "Chronic myeloid leukemia"
    ],
    correctAnswer: 1,
    explanation: "Myelodysplastic syndrome (MDS) is characterized by cytopenias despite hypercellular bone marrow due to dysplastic cell production and increased apoptosis. Key features include: elderly patient, pancytopenia, <20% blasts (this patient has 10%), and dysplastic changes in multiple cell lines. MDS is a clonal stem cell disorder that can transform to AML.",
    category: "Hematology/Oncology",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["myelodysplastic syndrome", "pancytopenia", "dysplasia", "bone marrow"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 6"]
  },
  // Additional Questions - Expanding to 100+ total
  // Nephrology
  {
    question: "A 45-year-old diabetic man presents with progressive fatigue and ankle swelling. Lab results show creatinine 3.2 mg/dL, BUN 45 mg/dL, and proteinuria 3.5 g/24h. Kidney biopsy shows nodular glomerulosclerosis with mesangial expansion. What is the most likely diagnosis?",
    options: [
      "Minimal change disease",
      "Diabetic nephropathy",
      "Focal segmental glomerulosclerosis",
      "Membranous nephropathy"
    ],
    correctAnswer: 1,
    explanation: "The combination of diabetes, progressive kidney failure, heavy proteinuria, and nodular glomerulosclerosis (Kimmelstiel-Wilson nodules) is pathognomonic for diabetic nephropathy. This is the leading cause of end-stage renal disease in developed countries. The mesangial expansion and nodular sclerosis are characteristic histologic findings.",
    category: "Nephrology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["diabetic nephropathy", "glomerulosclerosis", "proteinuria", "CKD"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 14"]
  },
  // Pulmonology
  {
    question: "A 22-year-old college student presents with sudden onset of pleuritic chest pain and shortness of breath while playing basketball. He is tall and thin. Chest X-ray shows a 30% right-sided pneumothorax. What is the most appropriate initial management?",
    options: [
      "Observation and supplemental oxygen",
      "Needle decompression",
      "Chest tube placement",
      "Emergency thoracotomy"
    ],
    correctAnswer: 2,
    explanation: "A spontaneous pneumothorax >20-30% in size requires chest tube placement for evacuation. The patient's tall, thin build (ectomorphic habitus) is a classic risk factor for primary spontaneous pneumothorax. Observation is only appropriate for small pneumothoraces (<20%). Needle decompression is for tension pneumothorax.",
    category: "Pulmonary",
    difficulty: "medium",
    usmleCategory: "surgery",
    tags: ["spontaneous pneumothorax", "chest tube", "ectomorphic", "pleuritic pain"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Cardiology
  {
    question: "A 65-year-old man with a history of hypertension presents with syncope. Physical exam reveals a harsh systolic murmur that increases with Valsalva maneuver and decreases with squatting. Echocardiogram shows left ventricular hypertrophy with systolic anterior motion of the mitral valve. What is the most likely diagnosis?",
    options: [
      "Aortic stenosis",
      "Hypertrophic cardiomyopathy",
      "Mitral regurgitation",
      "Ventricular septal defect"
    ],
    correctAnswer: 1,
    explanation: "Hypertrophic cardiomyopathy (HCM) classically presents with a murmur that increases with decreased preload (Valsalva, standing) and decreases with increased preload (squatting, leg raise). Systolic anterior motion (SAM) of the mitral valve is pathognomonic for HCM with outflow tract obstruction. Syncope can occur due to outflow obstruction.",
    category: "Cardiovascular",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["hypertrophic cardiomyopathy", "SAM", "Valsalva", "syncope"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 4"]
  },
  // Endocrinology
  {
    question: "A 28-year-old woman presents with heat intolerance, weight loss, and palpitations. Physical exam reveals exophthalmos, pretibial myxedema, and a diffusely enlarged thyroid with a bruit. TSH is <0.01 mU/L and free T4 is 4.2 ng/dL. What is the most likely diagnosis?",
    options: [
      "Toxic multinodular goiter",
      "Graves' disease",
      "Hashimoto's thyroiditis",
      "Thyroid storm"
    ],
    correctAnswer: 1,
    explanation: "Graves' disease is characterized by the triad of hyperthyroidism, ophthalmopathy (exophthalmos), and dermopathy (pretibial myxedema). The diffusely enlarged thyroid with bruit, along with the extrathyroidal manifestations, distinguishes it from toxic multinodular goiter. TSI (thyroid-stimulating immunoglobulin) antibodies cause the clinical features.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Graves disease", "exophthalmos", "pretibial myxedema", "hyperthyroidism"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 19"]
  },
  // Gastroenterology
  {
    question: "A 35-year-old man presents with chronic diarrhea, abdominal pain, and weight loss. Colonoscopy shows cobblestone appearance with skip lesions and deep linear ulcers. Biopsy reveals transmural inflammation with noncaseating granulomas. What is the most likely diagnosis?",
    options: [
      "Ulcerative colitis",
      "Crohn's disease",
      "Ischemic colitis",
      "Infectious colitis"
    ],
    correctAnswer: 1,
    explanation: "The cobblestone appearance, skip lesions, transmural inflammation, and noncaseating granulomas are pathognomonic for Crohn's disease. Unlike ulcerative colitis, which shows continuous mucosal inflammation, Crohn's disease has patchy involvement (skip lesions) and can affect the entire bowel wall thickness (transmural).",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Crohn disease", "granulomas", "skip lesions", "transmural"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 11"]
  },
  // Infectious Disease
  {
    question: "A 45-year-old HIV-positive man with CD4 count of 150/μL presents with headache, fever, and altered mental status. Lumbar puncture shows opening pressure 250 mmH2O, glucose 35 mg/dL, protein 60 mg/dL, and India ink stain reveals encapsulated yeast. What is the most likely diagnosis?",
    options: [
      "Toxoplasma gondii encephalitis",
      "Cryptococcal meningitis",
      "Progressive multifocal leukoencephalopathy",
      "CMV encephalitis"
    ],
    correctAnswer: 1,
    explanation: "Cryptococcal meningitis in HIV patients typically presents with subacute headache and altered mental status. The India ink stain showing encapsulated yeast is diagnostic for Cryptococcus neoformans. The elevated opening pressure is characteristic, and CSF shows moderate pleocytosis with low glucose. CD4 <100 is a major risk factor.",
    category: "Infectious Disease",
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["cryptococcal meningitis", "HIV", "India ink", "encapsulated yeast"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Micro"]
  },
  // Neurology
  {
    question: "A 70-year-old man presents with resting tremor, bradykinesia, and rigidity. Symptoms improve with levodopa therapy. However, after 5 years of treatment, he develops involuntary writhing movements of his face and limbs. What is the most likely cause of these new symptoms?",
    options: [
      "Tardive dyskinesia",
      "Levodopa-induced dyskinesia",
      "Essential tremor",
      "Huntington's disease"
    ],
    correctAnswer: 1,
    explanation: "Levodopa-induced dyskinesia (LID) is a common complication of long-term levodopa therapy in Parkinson's disease, typically developing after 5-10 years of treatment. The dyskinesias are choreiform movements that can be disabling. This occurs due to pulsatile dopamine stimulation and receptor sensitization. Treatment may involve adjusting levodopa dosing or adding amantadine.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["Parkinson disease", "levodopa", "dyskinesia", "dopamine"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Pharm"]
  },
  // Psychiatry
  {
    question: "A 19-year-old college student is brought to the ED by friends after they found her talking to herself and appearing paranoid. She reports that the CIA is monitoring her through her laptop camera. She has been isolating herself for the past month and has poor hygiene. Mental status exam reveals disorganized speech and flat affect. What is the most appropriate initial treatment?",
    options: [
      "Lithium",
      "Haloperidol",
      "Sertraline",
      "Lorazepam"
    ],
    correctAnswer: 1,
    explanation: "This patient presents with acute psychosis with positive symptoms (delusions, disorganized speech) and negative symptoms (flat affect, poor hygiene, social withdrawal). Haloperidol, a typical antipsychotic, is appropriate for acute psychosis management. It blocks dopamine D2 receptors and helps control positive symptoms. Atypical antipsychotics could also be used.",
    category: "Psychiatry",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["psychosis", "antipsychotics", "haloperidol", "delusions"],
    medicalReferences: ["DSM-5", "Sketchy Pharm"]
  },
  // Dermatology
  {
    question: "A 25-year-old woman presents with well-demarcated, erythematous plaques with silvery scales on her elbows and knees. She also complains of nail pitting and joint pain in her fingers. What is the most likely diagnosis?",
    options: [
      "Eczema",
      "Psoriasis",
      "Seborrheic dermatitis",
      "Lichen planus"
    ],
    correctAnswer: 1,
    explanation: "Psoriasis classically presents with well-demarcated, erythematous plaques with silvery scales on extensor surfaces (elbows, knees). Nail pitting and psoriatic arthritis (joint pain) are important associated features. The Auspitz sign (pinpoint bleeding when scales are removed) is pathognomonic. Psoriasis is a T-cell mediated autoimmune condition.",
    category: "Dermatology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["psoriasis", "silvery scales", "nail pitting", "psoriatic arthritis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 21"]
  },
  // Emergency Medicine
  {
    question: "A 35-year-old man is brought to the ED after a motor vehicle collision. He is hypotensive (BP 80/50) and tachycardic (HR 120). FAST exam shows fluid in Morrison's pouch and the pelvis. What is the most appropriate next step?",
    options: [
      "CT scan of the abdomen and pelvis",
      "Diagnostic peritoneal lavage",
      "Immediate exploratory laparotomy",
      "Serial abdominal exams"
    ],
    correctAnswer: 2,
    explanation: "A hemodynamically unstable trauma patient with positive FAST exam (free fluid indicating hemoperitoneum) requires immediate surgical exploration. The combination of hypotension, tachycardia, and free intraperitoneal fluid suggests active intra-abdominal bleeding. CT scan would delay definitive treatment in an unstable patient.",
    category: "Emergency Medicine",
    difficulty: "medium",
    usmleCategory: "surgery",
    tags: ["trauma", "FAST exam", "hemoperitoneum", "exploratory laparotomy"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Orthopedics
  {
    question: "A 16-year-old basketball player presents with knee pain and swelling after landing awkwardly from a jump. Physical exam reveals a positive anterior drawer test and Lachman test. MRI confirms the suspected diagnosis. What structure is most likely injured?",
    options: [
      "Medial collateral ligament (MCL)",
      "Lateral collateral ligament (LCL)",
      "Anterior cruciate ligament (ACL)",
      "Posterior cruciate ligament (PCL)"
    ],
    correctAnswer: 2,
    explanation: "The anterior drawer test and Lachman test are specific for ACL injury. ACL tears are common in young athletes, especially in sports involving cutting and jumping movements. The mechanism often involves a non-contact injury with knee hyperextension or rotation. MRI is the gold standard for diagnosis, and surgical reconstruction is often needed in active individuals.",
    category: "Orthopedics",
    difficulty: "easy",
    usmleCategory: "anatomy",
    tags: ["ACL tear", "Lachman test", "anterior drawer", "sports injury"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Pediatrics
  {
    question: "A 6-month-old infant presents with poor feeding, failure to thrive, and cyanosis that worsens with crying. Physical exam reveals clubbing of fingers and a harsh systolic murmur. Chest X-ray shows decreased pulmonary vascular markings. What is the most likely diagnosis?",
    options: [
      "Ventricular septal defect",
      "Atrial septal defect",
      "Tetralogy of Fallot",
      "Patent ductus arteriosus"
    ],
    correctAnswer: 2,
    explanation: "Tetralogy of Fallot is the most common cyanotic congenital heart disease. The tetrad includes: 1) pulmonary stenosis, 2) VSD, 3) overriding aorta, 4) right ventricular hypertrophy. Cyanosis worsens with crying due to increased right-to-left shunting. Decreased pulmonary vascular markings on CXR reflect decreased pulmonary blood flow from pulmonary stenosis.",
    category: "Pediatrics",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["tetralogy of Fallot", "cyanotic CHD", "pulmonary stenosis", "VSD"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 4"]
  },
  // Urology
  {
    question: "A 65-year-old man presents with urinary frequency, nocturia, and difficulty starting urination. Digital rectal exam reveals a smooth, firm, uniformly enlarged prostate. PSA is 6.2 ng/mL (normal <4). What is the most likely diagnosis?",
    options: [
      "Prostate cancer",
      "Benign prostatic hyperplasia",
      "Prostatitis",
      "Bladder cancer"
    ],
    correctAnswer: 1,
    explanation: "Benign prostatic hyperplasia (BPH) typically presents with lower urinary tract symptoms (LUTS) including frequency, nocturia, and hesitancy. The smooth, uniformly enlarged prostate on DRE is characteristic of BPH. While PSA is mildly elevated, the smooth texture makes BPH more likely than cancer, which typically causes nodular, hard areas.",
    category: "Urology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["BPH", "LUTS", "PSA", "prostate enlargement"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Radiology
  {
    question: "A 55-year-old smoker presents with a persistent cough and weight loss. Chest CT shows a 3cm spiculated mass in the right upper lobe with mediastinal lymphadenopathy. What is the most appropriate next step?",
    options: [
      "PET scan",
      "Bronchoscopy with biopsy",
      "Mediastinoscopy",
      "Thoracotomy"
    ],
    correctAnswer: 1,
    explanation: "A spiculated lung mass in a smoker is highly suspicious for lung cancer. Bronchoscopy with biopsy is the most appropriate next step to obtain tissue diagnosis. The spiculated appearance (irregular, star-shaped borders) is characteristic of malignancy. Once histologic diagnosis is confirmed, staging workup including PET scan can be performed.",
    category: "Radiology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["lung cancer", "spiculated mass", "bronchoscopy", "smoking"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Rheumatology
  {
    question: "A 55-year-old man presents with severe pain and swelling of his great toe that started overnight. He has a history of hypertension and takes hydrochlorothiazide. Joint aspiration reveals needle-shaped, negatively birefringent crystals. What is the most likely diagnosis?",
    options: [
      "Pseudogout",
      "Gout",
      "Septic arthritis",
      "Rheumatoid arthritis"
    ],
    correctAnswer: 1,
    explanation: "Acute gout typically affects the first metatarsophalangeal joint (podagra) and presents with sudden, severe pain. Needle-shaped, negatively birefringent uric acid crystals under polarized light microscopy are diagnostic. Risk factors include male sex, hypertension, and diuretic use (hydrochlorothiazide), which can increase uric acid levels.",
    category: "Rheumatology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["gout", "uric acid crystals", "podagra", "birefringence"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Hematology/Oncology
  {
    question: "A 25-year-old man presents with fatigue and painless lymphadenopathy. Lymph node biopsy shows Reed-Sternberg cells in a background of inflammatory cells. CT scan shows mediastinal and cervical lymphadenopathy. What is the most likely diagnosis?",
    options: [
      "Non-Hodgkin lymphoma",
      "Hodgkin lymphoma",
      "Chronic lymphocytic leukemia",
      "Infectious mononucleosis"
    ],
    correctAnswer: 1,
    explanation: "Reed-Sternberg cells are pathognomonic for Hodgkin lymphoma. These are large, multinucleated cells with prominent nucleoli ('owl's eye' appearance). Hodgkin lymphoma typically spreads in a contiguous manner and commonly involves mediastinal nodes. The bimodal age distribution peaks in the 20s-30s and 50s-60s.",
    category: "Hematology/Oncology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["Hodgkin lymphoma", "Reed-Sternberg cells", "lymphadenopathy", "mediastinal"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 6"]
  },
  // Pharmacology
  {
    question: "A 45-year-old man with atrial fibrillation is started on warfarin. After 2 weeks, his INR is 1.8. He then starts taking a new antibiotic for a skin infection. One week later, his INR increases to 4.5. Which antibiotic is he most likely taking?",
    options: [
      "Azithromycin",
      "Trimethoprim-sulfamethoxazole",
      "Cephalexin",
      "Doxycycline"
    ],
    correctAnswer: 1,
    explanation: "Trimethoprim-sulfamethoxazole significantly increases warfarin's anticoagulant effect by inhibiting CYP2C9, the enzyme responsible for warfarin metabolism. This leads to increased warfarin levels and elevated INR. Other antibiotics that interact with warfarin include metronidazole and fluoroquinolones. Careful monitoring is required when starting these antibiotics in patients on warfarin.",
    category: "Pharmacology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["warfarin", "drug interactions", "INR", "CYP2C9"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Pharm"]
  },
  // Obstetrics/Gynecology
  {
    question: "A 28-year-old woman at 32 weeks gestation presents with severe headache, blurred vision, and right upper quadrant pain. Blood pressure is 170/110 mmHg. Urinalysis shows 3+ proteinuria. Lab studies reveal AST 150 U/L, ALT 140 U/L, and platelets 90,000/μL. What is the most appropriate management?",
    options: [
      "Antihypertensive therapy and close monitoring",
      "Magnesium sulfate and immediate delivery",
      "Bed rest and serial monitoring",
      "Corticosteroids for fetal lung maturity"
    ],
    correctAnswer: 1,
    explanation: "This patient has severe preeclampsia with features concerning for HELLP syndrome (elevated liver enzymes, low platelets). At 32 weeks with severe features (severe hypertension, symptoms, elevated liver enzymes, thrombocytopenia), immediate delivery is indicated after seizure prophylaxis with magnesium sulfate. Expectant management is contraindicated with severe features.",
    category: "Obstetrics/Gynecology",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["preeclampsia", "HELLP syndrome", "magnesium sulfate", "delivery"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Immunology
  {
    question: "A 3-year-old boy presents with recurrent bacterial infections, including pneumonia and skin abscesses. Laboratory studies show absent mature B cells and markedly decreased immunoglobulin levels (IgG, IgA, IgM all low). T cell function is normal. What is the most likely diagnosis?",
    options: [
      "DiGeorge syndrome",
      "X-linked agammaglobulinemia",
      "Common variable immunodeficiency",
      "Severe combined immunodeficiency"
    ],
    correctAnswer: 1,
    explanation: "X-linked agammaglobulinemia (Bruton agammaglobulinemia) is caused by mutations in the BTK gene, leading to absent mature B cells and severely decreased antibody production. Affected males present with recurrent bacterial infections after maternal antibodies wane (around 6 months). T cell function is normal, distinguishing it from SCID.",
    category: "Immunology",
    difficulty: "medium",
    usmleCategory: "immunology",
    tags: ["X-linked agammaglobulinemia", "BTK", "B cell deficiency", "hypogammaglobulinemia"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 2"]
  },
  // Microbiology
  {
    question: "A 25-year-old man who recently returned from a camping trip in Connecticut presents with an expanding erythematous rash with central clearing on his thigh. He also reports fatigue, fever, and myalgias. What is the most likely causative organism?",
    options: [
      "Rickettsia rickettsii",
      "Borrelia burgdorferi",
      "Ehrlichia chaffeensis",
      "Babesia microti"
    ],
    correctAnswer: 1,
    explanation: "The expanding erythematous rash with central clearing (erythema migrans) is pathognomonic for Lyme disease caused by Borrelia burgdorferi. The patient's recent camping in Connecticut (endemic area) and the characteristic 'bull's-eye' rash make this diagnosis most likely. Early symptoms include fever, fatigue, and myalgias. Treatment is with doxycycline.",
    category: "Microbiology",
    difficulty: "easy",
    usmleCategory: "microbiology",
    tags: ["Lyme disease", "erythema migrans", "Borrelia burgdorferi", "tick-borne"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Micro"]
  },
  // Pathology
  {
    question: "A 50-year-old woman undergoes a routine mammogram that shows clustered microcalcifications in a linear distribution. Core needle biopsy reveals atypical ductal cells filling the lumen without invasion through the basement membrane. What is the most likely diagnosis?",
    options: [
      "Invasive ductal carcinoma",
      "Ductal carcinoma in situ (DCIS)",
      "Lobular carcinoma in situ (LCIS)",
      "Fibroadenoma"
    ],
    correctAnswer: 1,
    explanation: "Ductal carcinoma in situ (DCIS) is characterized by malignant ductal epithelial cells that have not invaded through the basement membrane. Clustered microcalcifications in a linear distribution are the classic mammographic finding. DCIS is considered a precursor to invasive ductal carcinoma and requires surgical treatment to prevent progression.",
    category: "Pathology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["DCIS", "microcalcifications", "breast cancer", "in situ"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 15"]
  },
  // Physiology
  {
    question: "A patient has a pulmonary function test showing FEV1/FVC ratio of 0.65 (normal >0.7), increased total lung capacity, and decreased DLCO. The patient most likely has which type of lung disease?",
    options: [
      "Restrictive lung disease",
      "Obstructive lung disease",
      "Pulmonary vascular disease",
      "Normal lung function"
    ],
    correctAnswer: 1,
    explanation: "The reduced FEV1/FVC ratio (<0.7) indicates obstructive lung disease. The increased TLC suggests air trapping (characteristic of emphysema), and the decreased DLCO indicates impaired gas exchange due to alveolar wall destruction. This pattern is typical of COPD, particularly emphysema.",
    category: "Physiology",
    difficulty: "medium",
    usmleCategory: "physiology",
    tags: ["PFTs", "obstructive disease", "COPD", "DLCO"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Biochemistry
  {
    question: "A newborn presents with vomiting, lethargy, and hepatomegaly after starting formula feeding. Urine tests positive for reducing substances but negative for glucose. Liver biopsy shows fatty infiltration. What enzyme is most likely deficient?",
    options: [
      "Glucose-6-phosphatase",
      "Galactokinase",
      "Galactose-1-phosphate uridyltransferase",
      "Fructokinase"
    ],
    correctAnswer: 2,
    explanation: "Classic galactosemia is caused by galactose-1-phosphate uridyltransferase deficiency. Symptoms develop after lactose exposure (breast milk or formula). The presence of reducing substances (galactose) in urine with negative glucose test is characteristic. Complications include hepatomegaly, cataracts, and intellectual disability if untreated. Treatment involves galactose restriction.",
    category: "Biochemistry",
    difficulty: "hard",
    usmleCategory: "biochemistry",
    tags: ["galactosemia", "reducing substances", "hepatomegaly", "enzyme deficiency"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Genetics
  {
    question: "A couple seeks genetic counseling because their first child has cystic fibrosis. Both parents are unaffected. If they have another child, what is the probability that the child will be a carrier for cystic fibrosis?",
    options: [
      "0%",
      "25%",
      "50%",
      "100%"
    ],
    correctAnswer: 2,
    explanation: "Cystic fibrosis is an autosomal recessive disorder. Since both parents are unaffected but have an affected child, both parents must be carriers (heterozygotes). In each pregnancy: 25% chance of affected child (homozygous recessive), 50% chance of carrier (heterozygous), and 25% chance of normal (homozygous dominant). Therefore, 50% chance the child will be a carrier.",
    category: "Genetics",
    difficulty: "medium",
    usmleCategory: "genetics",
    tags: ["autosomal recessive", "cystic fibrosis", "carrier", "Punnett square"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Anatomy
  {
    question: "During a thyroidectomy, a surgeon must be careful to preserve a nerve that runs close to the thyroid gland. Damage to this nerve would result in hoarseness and difficulty with high-pitched sounds. Which nerve is most at risk?",
    options: [
      "External branch of superior laryngeal nerve",
      "Recurrent laryngeal nerve",
      "Hypoglossal nerve",
      "Marginal mandibular branch of facial nerve"
    ],
    correctAnswer: 1,
    explanation: "The recurrent laryngeal nerve runs in the tracheoesophageal groove, very close to the thyroid gland. It innervates all intrinsic laryngeal muscles except the cricothyroid. Damage causes vocal cord paralysis, resulting in hoarseness and difficulty with high-pitched sounds. This is the most common nerve injured during thyroidectomy.",
    category: "Anatomy",
    difficulty: "medium",
    usmleCategory: "anatomy",
    tags: ["recurrent laryngeal nerve", "thyroidectomy", "vocal cords", "hoarseness"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Additional Cardiovascular
  {
    question: "A 60-year-old man with diabetes presents with chest pain. ECG shows T-wave inversions in leads V1-V4. Cardiac enzymes show troponin I of 2.5 ng/mL (normal <0.1). Echocardiogram shows wall motion abnormality in the anterior wall. What is the most likely diagnosis?",
    options: [
      "Unstable angina",
      "NSTEMI",
      "STEMI",
      "Pericarditis"
    ],
    correctAnswer: 1,
    explanation: "This patient has NSTEMI (Non-ST elevation myocardial infarction). The elevated troponin indicates myocardial necrosis, and the T-wave inversions in precordial leads suggest anterior ischemia. The absence of ST elevations differentiates NSTEMI from STEMI. The wall motion abnormality on echo confirms myocardial injury.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["NSTEMI", "troponin", "T-wave inversion", "anterior wall"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Additional Neurology
  {
    question: "A 65-year-old woman presents with sudden onset of right-sided weakness and aphasia. CT head shows no hemorrhage. She arrives at the hospital 2 hours after symptom onset. What is the most appropriate acute treatment?",
    options: [
      "Aspirin 325 mg",
      "Tissue plasminogen activator (tPA)",
      "Heparin infusion",
      "Surgical embolectomy"
    ],
    correctAnswer: 1,
    explanation: "This patient presents with acute ischemic stroke within the therapeutic window (<4.5 hours). After excluding hemorrhage on CT, tissue plasminogen activator (tPA) is the first-line treatment for acute ischemic stroke if given within 4.5 hours of symptom onset. The patient meets criteria for thrombolytic therapy.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["stroke", "tPA", "thrombolysis", "therapeutic window"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Additional Surgery
  {
    question: "A 25-year-old woman presents with right lower quadrant pain that started 8 hours ago. Physical exam reveals rebound tenderness and a positive psoas sign. CT scan shows a thickened appendiceal wall with surrounding fat stranding. What is the most appropriate management?",
    options: [
      "Antibiotics and observation",
      "Laparoscopic appendectomy",
      "Open appendectomy",
      "Percutaneous drainage"
    ],
    correctAnswer: 1,
    explanation: "This patient has uncomplicated acute appendicitis based on clinical presentation and CT findings. Laparoscopic appendectomy is the preferred surgical approach for uncomplicated appendicitis in most patients, as it offers advantages including shorter recovery time, less postoperative pain, and better cosmetic results compared to open surgery.",
    category: "Surgery",
    difficulty: "easy",
    usmleCategory: "surgery",
    tags: ["appendicitis", "laparoscopic surgery", "rebound tenderness", "psoas sign"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Additional Infectious Disease
  {
    question: "A 30-year-old man who recently traveled to India presents with high fever, headache, and a rose-colored rash on his trunk. Blood cultures grow gram-negative rods that are catalase positive and produce hydrogen sulfide. What is the most likely organism?",
    options: [
      "Shigella dysenteriae",
      "Salmonella Typhi",
      "Escherichia coli",
      "Vibrio cholerae"
    ],
    correctAnswer: 1,
    explanation: "Salmonella Typhi causes typhoid fever, characterized by prolonged fever, headache, and rose spots on the trunk. The travel history to an endemic area (India) is significant. S. Typhi is gram-negative, catalase positive, and produces H2S (unlike other Salmonella species). The clinical presentation and laboratory characteristics are classic for typhoid fever.",
    category: "Infectious Disease",
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["typhoid fever", "Salmonella Typhi", "rose spots", "H2S production"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sketchy Micro"]
  },
  // Additional Pediatrics
  {
    question: "A 2-year-old child presents with barking cough, inspiratory stridor, and low-grade fever. The child appears comfortable at rest but develops stridor with agitation. What is the most likely diagnosis?",
    options: [
      "Epiglottitis",
      "Croup (laryngotracheobronchitis)",
      "Bacterial tracheitis",
      "Foreign body aspiration"
    ],
    correctAnswer: 1,
    explanation: "Croup (viral laryngotracheobronchitis) typically affects children 6 months to 6 years old. The classic presentation includes barking cough, inspiratory stridor that worsens with agitation, and low-grade fever. Most cases are caused by parainfluenza virus. Treatment includes cool mist, dexamethasone, and nebulized racemic epinephrine for severe cases.",
    category: "Pediatrics",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["croup", "laryngotracheobronchitis", "barking cough", "inspiratory stridor"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Additional Dermatology
  {
    question: "A 45-year-old man presents with multiple flesh-colored, dome-shaped papules with central umbilication on his face and neck. He is HIV-positive with a CD4 count of 180/μL. What is the most likely diagnosis?",
    options: [
      "Seborrheic keratoses",
      "Molluscum contagiosum",
      "Basal cell carcinomas",
      "Kaposi's sarcoma"
    ],
    correctAnswer: 1,
    explanation: "Molluscum contagiosum in immunocompromised patients (especially HIV) can present with numerous lesions on the face and neck. The dome-shaped papules with central umbilication are characteristic. In HIV patients, molluscum can be extensive and persistent. It's caused by a poxvirus and spreads by direct contact or autoinoculation.",
    category: "Dermatology",
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["molluscum contagiosum", "HIV", "umbilicated papules", "poxvirus"],
    medicalReferences: ["First Aid USMLE Step 1 2025"]
  },
  // Additional Endocrinology
  {
    question: "A 45-year-old woman presents with muscle weakness, easy bruising, and central obesity. Physical exam reveals purple striae on the abdomen and a buffalo hump. 24-hour urine free cortisol is elevated. Dexamethasone suppression test shows no suppression of cortisol. What is the most likely diagnosis?",
    options: [
      "Pituitary adenoma (Cushing's disease)",
      "Adrenal adenoma",
      "Ectopic ACTH syndrome",
      "Primary adrenal insufficiency"
    ],
    correctAnswer: 1,
    explanation: "This patient has Cushing's syndrome based on clinical features (central obesity, purple striae, buffalo hump, muscle weakness) and elevated 24-hour urine free cortisol. The lack of suppression with dexamethasone suggests either pituitary adenoma (Cushing's disease) or ectopic ACTH. Pituitary adenoma is the most common cause of Cushing's syndrome.",
    category: "Endocrine",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["Cushing syndrome", "purple striae", "dexamethasone suppression", "buffalo hump"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 19"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Adrenal Disorders", "Cushing Syndrome"],
    points: 20
  },
  // Additional HIGH-YIELD USMLE Questions - Expanding to 100+ total
  // Cardiology - Arrhythmias
  {
    question: "A 70-year-old man with a history of atrial fibrillation presents with palpitations and dizziness. ECG shows irregularly irregular rhythm with narrow QRS complexes and absence of P waves. His heart rate is 140 bpm. He is hemodynamically stable. What is the most appropriate initial treatment?",
    options: [
      "Electrical cardioversion",
      "Rate control with metoprolol",
      "Rhythm control with amiodarone",
      "Anticoagulation with warfarin only"
    ],
    correctAnswer: 1,
    explanation: "For hemodynamically stable atrial fibrillation with rapid ventricular response, rate control is the initial priority. Beta-blockers like metoprolol or calcium channel blockers are first-line agents for rate control. Cardioversion is reserved for unstable patients or after adequate anticoagulation for elective cardioversion.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["atrial fibrillation", "rate control", "beta blockers", "arrhythmia"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Arrhythmias", "Atrial Fibrillation"],
    points: 15
  },
  // Pulmonology - Asthma
  {
    question: "A 25-year-old woman presents to the ED with wheezing, cough, and shortness of breath that started after exposure to cats. Physical exam reveals decreased air entry bilaterally with expiratory wheeze. Peak flow is 40% of predicted. What is the most appropriate immediate treatment?",
    options: [
      "Oral prednisone",
      "Nebulized albuterol",
      "IV methylprednisolone",
      "Inhaled fluticasone"
    ],
    correctAnswer: 1,
    explanation: "This patient has acute asthma exacerbation. Nebulized short-acting beta-2 agonists (albuterol) are first-line treatment for acute bronchospasm. The peak flow of 40% predicted indicates moderate-to-severe exacerbation requiring immediate bronchodilation.",
    category: "Pulmonary",
    difficulty: "easy",
    usmleCategory: "pharmacology",
    tags: ["asthma", "bronchodilator", "albuterol", "acute exacerbation"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["Asthma", "Bronchodilators"],
    points: 10
  },
  // Gastroenterology - Upper GI Bleeding
  {
    question: "A 55-year-old man with a history of peptic ulcer disease presents with coffee-ground vomitus and melena. His blood pressure is 90/60 mmHg and heart rate is 110 bpm. Hemoglobin is 7.2 g/dL. What is the most appropriate initial management?",
    options: [
      "Upper endoscopy within 24 hours",
      "IV fluid resuscitation and blood transfusion",
      "High-dose proton pump inhibitor",
      "Nasogastric tube placement"
    ],
    correctAnswer: 1,
    explanation: "This patient has signs of upper GI bleeding with hemodynamic instability (hypotension, tachycardia) and severe anemia. Initial management focuses on hemodynamic stabilization with IV fluids and blood transfusion before diagnostic procedures. The ABC approach (Airway, Breathing, Circulation) takes priority.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["upper GI bleeding", "hemodynamic instability", "resuscitation", "peptic ulcer"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["GI Bleeding", "Peptic Ulcer Disease"],
    points: 15
  },
  // Nephrology - Acute Kidney Injury
  {
    question: "A 65-year-old diabetic man is admitted for pneumonia and treated with gentamicin. After 5 days, his creatinine rises from 1.2 mg/dL to 2.8 mg/dL. Urinalysis shows muddy brown casts. What is the most likely cause of his kidney injury?",
    options: [
      "Prerenal azotemia",
      "Acute tubular necrosis",
      "Acute glomerulonephritis",
      "Postrenal obstruction"
    ],
    correctAnswer: 1,
    explanation: "Gentamicin is nephrotoxic and commonly causes acute tubular necrosis (ATN). The presence of muddy brown casts (renal tubular epithelial cell casts) is pathognomonic for ATN. The temporal relationship with gentamicin therapy supports drug-induced ATN.",
    category: "Nephrology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["acute kidney injury", "gentamicin", "nephrotoxicity", "muddy brown casts"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Genitourinary",
    topics: ["Acute Kidney Injury", "Drug-Induced Nephrotoxicity"],
    points: 15
  },
  // Hematology - Iron Deficiency Anemia
  {
    question: "A 35-year-old woman with heavy menstrual periods presents with fatigue. Laboratory studies show Hgb 8.5 g/dL, MCV 68 fL, ferritin 8 ng/mL, and TIBC 450 μg/dL (normal 250-400). What is the most likely diagnosis?",
    options: [
      "Thalassemia minor",
      "Iron deficiency anemia",
      "Anemia of chronic disease",
      "Sideroblastic anemia"
    ],
    correctAnswer: 1,
    explanation: "This patient has classic iron deficiency anemia: microcytic anemia (low MCV), low ferritin (iron stores), and elevated TIBC (iron binding capacity increases when iron is low). Heavy menstruation is a common cause of iron deficiency in premenopausal women.",
    category: "Hematology/Oncology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["iron deficiency anemia", "microcytic anemia", "ferritin", "menorrhagia"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Hematologic",
    topics: ["Anemia", "Iron Deficiency"],
    points: 10
  },
  // Rheumatology - Rheumatoid Arthritis
  {
    question: "A 45-year-old woman presents with morning stiffness lasting 2 hours and symmetric joint pain affecting her wrists and MCPs bilaterally. Physical exam reveals swan-neck deformities. Laboratory studies show positive rheumatoid factor and anti-CCP antibodies. What is the most appropriate initial treatment?",
    options: [
      "NSAIDs only",
      "Methotrexate",
      "Prednisone",
      "Physical therapy"
    ],
    correctAnswer: 1,
    explanation: "This patient has rheumatoid arthritis based on symmetric polyarthritis, morning stiffness >1 hour, positive RF and anti-CCP antibodies. Methotrexate is the first-line DMARD (disease-modifying antirheumatic drug) for RA and should be started early to prevent joint destruction.",
    category: "Rheumatology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["rheumatoid arthritis", "methotrexate", "DMARD", "anti-CCP"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Rheumatoid Arthritis", "DMARDs"],
    points: 15
  },
  // Endocrinology - Diabetic Ketoacidosis
  {
    question: "A 19-year-old type 1 diabetic presents with nausea, vomiting, and abdominal pain. Vital signs show Kussmaul respirations. Laboratory studies reveal glucose 450 mg/dL, bicarbonate 8 mEq/L, and positive serum ketones. What is the most appropriate initial treatment?",
    options: [
      "IV regular insulin bolus",
      "IV normal saline",
      "Sodium bicarbonate",
      "Potassium replacement"
    ],
    correctAnswer: 1,
    explanation: "This patient has diabetic ketoacidosis (DKA). The initial priority is fluid resuscitation with normal saline to restore intravascular volume and improve perfusion. Insulin therapy should begin after initial fluid replacement, and potassium must be monitored/replaced as insulin drives potassium intracellularly.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["diabetic ketoacidosis", "DKA", "fluid resuscitation", "Kussmaul respirations"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Emergency Medicine",
    system: "Endocrine",
    topics: ["Diabetes Complications", "DKA"],
    points: 15
  },
  // Neurology - Migraine
  {
    question: "A 28-year-old woman presents with recurrent unilateral throbbing headaches preceded by visual aura. The headaches last 8-12 hours and are associated with nausea and photophobia. What is the most appropriate acute treatment?",
    options: [
      "Morphine",
      "Sumatriptan",
      "Acetaminophen",
      "Prednisone"
    ],
    correctAnswer: 1,
    explanation: "This patient has classic migraine with aura. Sumatriptan, a selective 5-HT1B/1D receptor agonist (triptan), is first-line acute treatment for moderate to severe migraine. It's most effective when taken early in the headache phase.",
    category: "Neurology",
    difficulty: "easy",
    usmleCategory: "pharmacology",
    tags: ["migraine", "sumatriptan", "triptan", "aura"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Nervous System",
    topics: ["Headache Disorders", "Migraine"],
    points: 10
  },
  // Infectious Disease - UTI
  {
    question: "A 25-year-old sexually active woman presents with dysuria, urinary frequency, and suprapubic pain. Urinalysis shows >100 WBCs/hpf, positive nitrites, and positive leukocyte esterase. What is the most appropriate treatment?",
    options: [
      "Ciprofloxacin 500mg BID x 7 days",
      "Nitrofurantoin 100mg BID x 5 days",
      "Trimethoprim-sulfamethoxazole DS BID x 3 days",
      "Amoxicillin 500mg TID x 7 days"
    ],
    correctAnswer: 2,
    explanation: "This patient has uncomplicated cystitis. Trimethoprim-sulfamethoxazole for 3 days is first-line treatment for uncomplicated UTI in areas with <20% E. coli resistance. The short course is as effective as longer treatments and reduces antibiotic exposure.",
    category: "Infectious Disease",
    difficulty: "easy",
    usmleCategory: "microbiology",
    tags: ["UTI", "cystitis", "trimethoprim-sulfamethoxazole", "E. coli"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Genitourinary",
    topics: ["Urinary Tract Infections", "Antibiotic Therapy"],
    points: 10
  },
  // Psychiatry - Major Depression
  {
    question: "A 35-year-old man presents with a 6-week history of depressed mood, loss of interest in activities, fatigue, poor concentration, and feelings of worthlessness. He has lost 15 pounds without trying. What is the most appropriate first-line treatment?",
    options: [
      "Amitriptyline",
      "Sertraline",
      "Lithium",
      "Alprazolam"
    ],
    correctAnswer: 1,
    explanation: "This patient meets criteria for major depressive disorder (depressed mood, anhedonia, plus neurovegetative symptoms >2 weeks). SSRIs like sertraline are first-line treatment due to their favorable side effect profile compared to tricyclics. They're generally well-tolerated and effective.",
    category: "Psychiatry",
    difficulty: "easy",
    usmleCategory: "pharmacology",
    tags: ["major depression", "SSRI", "sertraline", "anhedonia"],
    medicalReferences: ["DSM-5", "First Aid USMLE Step 1 2025"],
    subject: "Psychiatry",
    system: "Nervous System",
    topics: ["Mood Disorders", "Depression"],
    points: 10
  },
  // Dermatology - Basal Cell Carcinoma
  {
    question: "A 65-year-old fair-skinned man who works outdoors presents with a 2cm pearly, flesh-colored papule with rolled borders and central ulceration on his nose. What is the most likely diagnosis?",
    options: [
      "Squamous cell carcinoma",
      "Basal cell carcinoma",
      "Melanoma",
      "Sebaceous cyst"
    ],
    correctAnswer: 1,
    explanation: "The description of a pearly papule with rolled borders and central ulceration (rodent ulcer) is classic for basal cell carcinoma (BCC). BCC is the most common skin cancer, typically occurring in sun-exposed areas in fair-skinned individuals. It rarely metastasizes but can be locally invasive.",
    category: "Dermatology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["basal cell carcinoma", "pearly papule", "rolled borders", "sun exposure"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Integumentary",
    topics: ["Skin Cancer", "BCC"],
    points: 10
  },
  // Emergency Medicine - Anaphylaxis
  {
    question: "A 30-year-old woman develops hives, wheezing, and hypotension within minutes of eating shellfish at a restaurant. Her blood pressure is 70/40 mmHg. What is the most appropriate immediate treatment?",
    options: [
      "IV diphenhydramine",
      "Intramuscular epinephrine",
      "IV methylprednisolone",
      "Nebulized albuterol"
    ],
    correctAnswer: 1,
    explanation: "This patient has anaphylaxis with systemic symptoms (hypotension, wheezing, urticaria). Intramuscular epinephrine (0.3-0.5mg in the anterolateral thigh) is the first-line treatment for anaphylaxis. It reverses bronchospasm, increases blood pressure, and stabilizes mast cells.",
    category: "Emergency Medicine",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["anaphylaxis", "epinephrine", "food allergy", "hypotension"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Emergency Medicine",
    system: "Immune System",
    topics: ["Allergic Reactions", "Anaphylaxis"],
    points: 15
  },
  // Orthopedics - Hip Fracture
  {
    question: "A 78-year-old woman falls and presents with right hip pain and inability to bear weight. Physical exam reveals right leg shortening and external rotation. X-ray shows an intertrochanteric hip fracture. What is the most appropriate treatment?",
    options: [
      "Conservative management with bed rest",
      "Open reduction and internal fixation",
      "Hip hemiarthroplasty",
      "Total hip replacement"
    ],
    correctAnswer: 1,
    explanation: "Intertrochanteric hip fractures, unlike femoral neck fractures, have good blood supply and heal well with internal fixation. ORIF with intramedullary nail or sliding hip screw is the treatment of choice. This allows early mobilization and reduces complications of prolonged bed rest.",
    category: "Orthopedics",
    difficulty: "medium",
    usmleCategory: "surgery",
    tags: ["intertrochanteric fracture", "ORIF", "hip fracture", "elderly"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Surgery",
    system: "Musculoskeletal",
    topics: ["Hip Fractures", "Orthopedic Surgery"],
    points: 15
  },
  // Pediatrics - Febrile Seizure
  {
    question: "A 2-year-old previously healthy child presents with a 2-minute generalized tonic-clonic seizure during a febrile illness. Temperature is 39.5°C (103.1°F). The child is now alert and interactive. What is the most likely diagnosis?",
    options: [
      "Meningitis",
      "Simple febrile seizure",
      "Complex febrile seizure",
      "Epilepsy"
    ],
    correctAnswer: 1,
    explanation: "Simple febrile seizures occur in 3-5% of children aged 6 months to 5 years. They are generalized, last <15 minutes, and don't recur within 24 hours. This child meets criteria for simple febrile seizure. Complex febrile seizures are focal, prolonged (>15 min), or recurrent.",
    category: "Pediatrics",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["febrile seizure", "pediatric", "fever", "generalized seizure"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Pediatrics",
    system: "Nervous System",
    topics: ["Pediatric Seizures", "Febrile Seizures"],
    points: 10
  },
  // Urology - Benign Prostatic Hyperplasia
  {
    question: "A 70-year-old man presents with urinary hesitancy, weak stream, and nocturia. Digital rectal exam reveals a uniformly enlarged, non-tender prostate. PSA is 5.2 ng/mL. What is the most appropriate initial treatment?",
    options: [
      "Immediate prostate biopsy",
      "Alpha-blocker (tamsulosin)",
      "5-alpha reductase inhibitor (finasteride)",
      "Transurethral resection of prostate"
    ],
    correctAnswer: 1,
    explanation: "This patient has benign prostatic hyperplasia (BPH) with lower urinary tract symptoms. Alpha-blockers like tamsulosin are first-line medical therapy for BPH as they relax prostatic smooth muscle and provide rapid symptom relief. The slightly elevated PSA can be explained by BPH.",
    category: "Urology",
    difficulty: "easy",
    usmleCategory: "pharmacology",
    tags: ["BPH", "alpha blocker", "tamsulosin", "LUTS"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Genitourinary",
    topics: ["Benign Prostatic Hyperplasia", "Alpha Blockers"],
    points: 10
  },
  // Radiology - Chest X-ray
  {
    question: "A 65-year-old smoker presents with cough and weight loss. Chest X-ray shows a 4cm mass in the right hilum with associated lymphadenopathy. What is the most appropriate next step?",
    options: [
      "CT chest with contrast",
      "PET scan",
      "Bronchoscopy with biopsy",
      "Mediastinoscopy"
    ],
    correctAnswer: 2,
    explanation: "A hilar mass in a smoker is highly suspicious for lung cancer. Bronchoscopy with biopsy is the most appropriate next step to obtain tissue diagnosis. Central/hilar lesions are usually accessible via bronchoscopy, making it the preferred diagnostic approach over transthoracic biopsy.",
    category: "Radiology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["lung cancer", "hilar mass", "bronchoscopy", "smoking"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["Lung Cancer", "Bronchoscopy"],
    points: 15
  },
  // Gastroenterology - Inflammatory Bowel Disease
  {
    question: "A 25-year-old man presents with chronic bloody diarrhea, tenesmus, and left lower quadrant pain. Colonoscopy shows continuous mucosal inflammation limited to the rectum and sigmoid colon with crypt abscesses. What is the most likely diagnosis?",
    options: [
      "Crohn's disease",
      "Ulcerative colitis",
      "Ischemic colitis",
      "C. difficile colitis"
    ],
    correctAnswer: 1,
    explanation: "Ulcerative colitis is characterized by continuous mucosal inflammation starting from the rectum and extending proximally. The presence of crypt abscesses and limitation to the left colon with bloody diarrhea and tenesmus are classic features of UC, distinguishing it from Crohn's disease which has skip lesions.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["ulcerative colitis", "inflammatory bowel disease", "crypt abscesses", "bloody diarrhea"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Inflammatory Bowel Disease", "Ulcerative Colitis"],
    points: 15
  },
  // Infectious Disease - Community Acquired Pneumonia
  {
    question: "A 45-year-old healthy man presents with acute onset of fever, productive cough with rust-colored sputum, and pleuritic chest pain. Chest X-ray shows right lower lobe consolidation. What is the most likely causative organism?",
    options: [
      "Mycoplasma pneumoniae",
      "Streptococcus pneumoniae",
      "Haemophilus influenzae",
      "Legionella pneumophila"
    ],
    correctAnswer: 1,
    explanation: "The acute onset with fever, productive cough, rust-colored sputum, and lobar consolidation is classic for pneumococcal pneumonia. Streptococcus pneumoniae is the most common cause of community-acquired pneumonia in immunocompetent adults and typically presents with these features.",
    category: "Infectious Disease",
    difficulty: "easy",
    usmleCategory: "microbiology",
    tags: ["pneumonia", "S. pneumoniae", "lobar consolidation", "rust-colored sputum"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["Community Acquired Pneumonia", "Bacterial Pneumonia"],
    points: 10
  },
  // Neurology - Bell's Palsy
  {
    question: "A 35-year-old woman wakes up with sudden onset of left-sided facial weakness. She cannot close her left eye, wrinkle her forehead on the left, or smile on the left side. Hearing is normal and there are no other neurologic deficits. What is the most likely diagnosis?",
    options: [
      "Stroke involving facial nerve",
      "Bell's palsy",
      "Trigeminal neuralgia",
      "Multiple sclerosis"
    ],
    correctAnswer: 1,
    explanation: "Bell's palsy is idiopathic facial nerve (CN VII) paralysis affecting both upper and lower facial muscles unilaterally. The inability to wrinkle the forehead distinguishes peripheral (Bell's palsy) from central (stroke) facial nerve lesions, where forehead sparing occurs due to bilateral cortical innervation of the upper face.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Bell's palsy", "facial nerve", "peripheral facial paralysis", "forehead involvement"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Nervous System",
    topics: ["Cranial Nerve Disorders", "Facial Nerve Palsy"],
    points: 15
  },
  // Psychiatry - Bipolar Disorder
  {
    question: "A 28-year-old man is brought to the ED by family for bizarre behavior. He has been awake for 3 days, believes he can fly, spent $10,000 on lottery tickets, and speaks rapidly with flight of ideas. One month ago he was severely depressed. What is the most likely diagnosis?",
    options: [
      "Schizophrenia",
      "Bipolar I disorder",
      "Major depression with psychotic features",
      "Substance-induced mood disorder"
    ],
    correctAnswer: 1,
    explanation: "This patient presents with a manic episode (grandiosity, decreased sleep, poor judgment, pressured speech, flight of ideas) following a major depressive episode. This pattern is diagnostic of Bipolar I disorder, which requires only one manic episode for diagnosis.",
    category: "Psychiatry",
    difficulty: "medium",
    usmleCategory: "behavioral sciences",
    tags: ["bipolar disorder", "mania", "grandiosity", "flight of ideas"],
    medicalReferences: ["DSM-5", "First Aid USMLE Step 1 2025"],
    subject: "Psychiatry",
    system: "Nervous System",
    topics: ["Mood Disorders", "Bipolar Disorder"],
    points: 15
  },
  // Dermatology - Eczema
  {
    question: "A 4-year-old child presents with pruritic, erythematous, scaling patches in the antecubital and popliteal fossae. The mother reports similar rashes appearing and resolving since infancy. The child also has a history of asthma. What is the most likely diagnosis?",
    options: [
      "Contact dermatitis",
      "Atopic dermatitis",
      "Seborrheic dermatitis",
      "Psoriasis"
    ],
    correctAnswer: 1,
    explanation: "Atopic dermatitis (eczema) classically affects flexural areas in children (antecubital and popliteal fossae) and is associated with asthma and allergies (atopic triad). The chronic, relapsing nature and distribution pattern are characteristic. It often begins in infancy and may persist into childhood.",
    category: "Dermatology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["atopic dermatitis", "eczema", "flexural distribution", "atopic triad"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Pediatrics",
    system: "Integumentary",
    topics: ["Pediatric Dermatology", "Atopic Dermatitis"],
    points: 10
  },
  // EXPANDING TO 100+ QUESTIONS - HIGH-YIELD MEDICAL SPECIALTIES
  // Additional Emergency Medicine
  {
    question: "A 55-year-old man presents with sudden onset of severe chest pain radiating to his back. Blood pressure is 180/100 mmHg with a 20 mmHg difference between arms. Chest X-ray shows widened mediastinum. What is the most likely diagnosis?",
    options: [
      "Acute myocardial infarction",
      "Aortic dissection",
      "Pulmonary embolism",
      "Pneumothorax"
    ],
    correctAnswer: 1,
    explanation: "The combination of severe chest pain radiating to the back, blood pressure differential between arms (>20 mmHg), and widened mediastinum on chest X-ray is classic for acute aortic dissection. This is a surgical emergency requiring immediate imaging (CT angiography) and blood pressure control.",
    category: "Emergency Medicine",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["aortic dissection", "widened mediastinum", "blood pressure differential", "chest pain"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Emergency Medicine",
    system: "Cardiovascular",
    topics: ["Aortic Emergencies", "Chest Pain"],
    points: 20
  },
  // Additional Cardiology
  {
    question: "A 60-year-old diabetic woman presents with fatigue and shortness of breath. ECG shows Q waves in leads V1-V4. Echocardiogram reveals reduced ejection fraction of 35%. What is the most appropriate long-term medication?",
    options: [
      "Digoxin",
      "ACE inhibitor (lisinopril)",
      "Calcium channel blocker",
      "Nitrates"
    ],
    correctAnswer: 1,
    explanation: "This patient has heart failure with reduced ejection fraction (HFrEF) following anterior MI (Q waves in V1-V4). ACE inhibitors are first-line therapy for HFrEF as they improve survival by reducing afterload and preventing ventricular remodeling. They're especially important post-MI.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["heart failure", "ACE inhibitor", "reduced ejection fraction", "post-MI"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Heart Failure", "Post-MI Care"],
    points: 15
  },
  // Additional Pulmonology
  {
    question: "A 45-year-old man with a history of smoking presents with progressive dyspnea. Pulmonary function tests show FEV1/FVC ratio of 0.6, increased total lung capacity, and decreased DLCO. What is the most likely diagnosis?",
    options: [
      "Asthma",
      "Chronic bronchitis",
      "Emphysema",
      "Pulmonary fibrosis"
    ],
    correctAnswer: 2,
    explanation: "The combination of reduced FEV1/FVC ratio (<0.7), increased TLC (air trapping), and decreased DLCO (impaired gas exchange) in a smoker is characteristic of emphysema. This represents destruction of alveolar walls leading to loss of elastic recoil and decreased surface area for gas exchange.",
    category: "Pulmonary",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["emphysema", "COPD", "smoking", "DLCO"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["COPD", "Emphysema"],
    points: 15
  },
  // Additional Gastroenterology
  {
    question: "A 40-year-old woman presents with right upper quadrant pain, fever, and jaundice. Murphy's sign is positive. Ultrasound shows gallbladder wall thickening and pericholecystic fluid. What is the most appropriate management?",
    options: [
      "Antibiotics and observation",
      "Emergency cholecystectomy",
      "ERCP",
      "Percutaneous cholecystostomy"
    ],
    correctAnswer: 1,
    explanation: "This patient has acute cholecystitis (Charcot's triad: pain, fever, jaundice plus Murphy's sign). Emergency cholecystectomy within 72 hours is the preferred treatment for acute cholecystitis in suitable surgical candidates, as it reduces complications and length of stay compared to delayed surgery.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "surgery",
    tags: ["acute cholecystitis", "Murphy's sign", "cholecystectomy", "Charcot's triad"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Surgery",
    system: "Gastrointestinal",
    topics: ["Biliary Disease", "Acute Cholecystitis"],
    points: 15
  },
  // Additional Nephrology
  {
    question: "A 45-year-old man presents with flank pain and hematuria. CT shows multiple bilateral renal cysts and enlarged kidneys. His father had similar kidney problems and died from kidney failure. What is the most likely diagnosis?",
    options: [
      "Simple renal cysts",
      "Autosomal dominant polycystic kidney disease",
      "Acquired cystic kidney disease",
      "Multicystic dysplastic kidney"
    ],
    correctAnswer: 1,
    explanation: "Bilateral enlarged kidneys with multiple cysts and family history of renal failure strongly suggest autosomal dominant polycystic kidney disease (ADPKD). This is the most common inherited kidney disorder, typically presenting in adulthood with flank pain, hematuria, and progressive kidney enlargement.",
    category: "Nephrology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["ADPKD", "polycystic kidney disease", "bilateral renal cysts", "genetic"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Genitourinary",
    topics: ["Cystic Kidney Disease", "Genetic Disorders"],
    points: 15
  },
  // Additional Hematology/Oncology
  {
    question: "A 30-year-old man presents with painless testicular swelling. Physical exam reveals a firm, non-tender testicular mass. Tumor markers show elevated AFP and beta-hCG. What is the most likely diagnosis?",
    options: [
      "Seminoma",
      "Non-seminomatous germ cell tumor",
      "Epididymitis",
      "Testicular torsion"
    ],
    correctAnswer: 1,
    explanation: "Elevated AFP and beta-hCG in a young man with testicular mass indicates non-seminomatous germ cell tumor (NSGCT). Seminomas typically have normal AFP and may have elevated beta-hCG. The painless, firm nature distinguishes it from inflammatory conditions or torsion.",
    category: "Hematology/Oncology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["testicular cancer", "NSGCT", "AFP", "beta-hCG"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Surgery",
    system: "Reproductive",
    topics: ["Testicular Cancer", "Tumor Markers"],
    points: 15
  },
  // Additional Rheumatology
  {
    question: "A 55-year-old man presents with severe pain and swelling in his great toe that awakens him from sleep. Joint aspiration reveals needle-shaped, negatively birefringent crystals. Serum uric acid is elevated. What is the most appropriate acute treatment?",
    options: [
      "Allopurinol",
      "Colchicine",
      "Probenecid",
      "Aspirin"
    ],
    correctAnswer: 1,
    explanation: "This patient has acute gout (podagra) confirmed by uric acid crystals. Colchicine is effective for acute gout attacks, especially if started within 24-48 hours. Allopurinol should never be started during an acute attack as it can worsen symptoms. NSAIDs are also first-line for acute gout.",
    category: "Rheumatology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["acute gout", "colchicine", "uric acid crystals", "podagra"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Crystal Arthropathy", "Gout"],
    points: 15
  },
  // Additional Endocrinology
  {
    question: "A 35-year-old woman presents with palpitations, heat intolerance, and weight loss. Physical exam reveals diffuse goiter and exophthalmos. TSH is undetectable, T4 is elevated. What is the most likely diagnosis?",
    options: [
      "Toxic multinodular goiter",
      "Graves' disease",
      "Hashimoto's thyroiditis",
      "Subacute thyroiditis"
    ],
    correctAnswer: 1,
    explanation: "The combination of hyperthyroidism (suppressed TSH, elevated T4), diffuse goiter, and exophthalmos (eye protrusion) is pathognomonic for Graves' disease. The extrathyroidal manifestations (ophthalmopathy) distinguish it from other causes of hyperthyroidism.",
    category: "Endocrine",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["Graves disease", "hyperthyroidism", "exophthalmos", "diffuse goiter"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Thyroid Disorders", "Hyperthyroidism"],
    points: 10
  },
  // Additional Neurology
  {
    question: "A 75-year-old man presents with progressive memory loss, confusion, and difficulty with familiar tasks. MRI shows cortical atrophy. CSF shows decreased amyloid-β42 and elevated tau protein. What is the most likely diagnosis?",
    options: [
      "Vascular dementia",
      "Alzheimer's disease",
      "Lewy body dementia",
      "Frontotemporal dementia"
    ],
    correctAnswer: 1,
    explanation: "Progressive memory loss with cortical atrophy and CSF biomarkers showing decreased Aβ42 and elevated tau is diagnostic of Alzheimer's disease. These biomarkers reflect amyloid plaques and neurofibrillary tangles, the pathologic hallmarks of AD.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Alzheimer's disease", "dementia", "amyloid-β", "tau protein"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Nervous System",
    topics: ["Dementia", "Alzheimer's Disease"],
    points: 15
  },
  // Additional Infectious Disease
  {
    question: "A 25-year-old man who recently returned from Southeast Asia presents with fever, headache, and a painless eschar on his leg. He also has generalized lymphadenopathy. What is the most likely causative organism?",
    options: [
      "Rickettsia typhi",
      "Orientia tsutsugamushi",
      "Borrelia burgdorferi",
      "Francisella tularensis"
    ],
    correctAnswer: 1,
    explanation: "The combination of fever, headache, eschar (black scab), and lymphadenopathy in a traveler from Southeast Asia is classic for scrub typhus caused by Orientia tsutsugamushi. The painless eschar at the site of chigger bite is pathognomonic.",
    category: "Infectious Disease",
    difficulty: "hard",
    usmleCategory: "microbiology",
    tags: ["scrub typhus", "Orientia tsutsugamushi", "eschar", "Southeast Asia"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Multiple Systems",
    topics: ["Rickettsial Diseases", "Travel Medicine"],
    points: 20
  },
  // Additional Psychiatry
  {
    question: "A 19-year-old college student is brought to the ED by friends who report she has been acting strangely for 2 weeks. She believes her roommate is poisoning her food and hears voices telling her to stay away from people. What is the most likely diagnosis?",
    options: [
      "Major depressive disorder with psychotic features",
      "Brief psychotic disorder",
      "Schizophreniform disorder",
      "Substance-induced psychosis"
    ],
    correctAnswer: 2,
    explanation: "Psychotic symptoms (delusions, auditory hallucinations) lasting 1-6 months in a young adult suggests schizophreniform disorder. This is essentially schizophrenia but with duration <6 months. Brief psychotic disorder lasts <1 month, while schizophrenia requires ≥6 months of symptoms.",
    category: "Psychiatry",
    difficulty: "medium",
    usmleCategory: "behavioral sciences",
    tags: ["schizophreniform disorder", "psychosis", "delusions", "hallucinations"],
    medicalReferences: ["DSM-5", "First Aid USMLE Step 1 2025"],
    subject: "Psychiatry",
    system: "Nervous System",
    topics: ["Psychotic Disorders", "Schizophrenia Spectrum"],
    points: 15
  },
  // Additional Dermatology
  {
    question: "A 30-year-old woman presents with symmetric, erythematous, scaly plaques on her elbows and knees that have been present for months. Scraping reveals pinpoint bleeding. What is the most likely diagnosis?",
    options: [
      "Eczema",
      "Psoriasis",
      "Lichen planus",
      "Seborrheic dermatitis"
    ],
    correctAnswer: 1,
    explanation: "Well-demarcated, erythematous, scaly plaques on extensor surfaces (elbows, knees) with pinpoint bleeding on scraping (Auspitz sign) is classic for psoriasis. The symmetric distribution and chronic nature are characteristic features.",
    category: "Dermatology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["psoriasis", "Auspitz sign", "extensor surfaces", "scaly plaques"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Integumentary",
    topics: ["Inflammatory Skin Conditions", "Psoriasis"],
    points: 10
  },
  // Additional Emergency Medicine
  {
    question: "A 25-year-old woman presents with sudden severe headache, neck stiffness, and photophobia. She describes it as 'the worst headache of her life.' Non-contrast CT head is normal. What is the most appropriate next step?",
    options: [
      "MRI brain",
      "Lumbar puncture",
      "CT angiography of the head",
      "Discharge with pain medication"
    ],
    correctAnswer: 1,
    explanation: "This presentation suggests subarachnoid hemorrhage (SAH). When CT is normal but clinical suspicion for SAH is high, lumbar puncture is needed to look for blood or xanthochromia. The 'worst headache ever' (thunderclap headache) is classic for SAH.",
    category: "Emergency Medicine",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["subarachnoid hemorrhage", "thunderclap headache", "lumbar puncture", "worst headache"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Emergency Medicine",
    system: "Nervous System",
    topics: ["Intracranial Hemorrhage", "Headache"],
    points: 15
  },
  // Additional Orthopedics
  {
    question: "A 16-year-old basketball player presents with knee pain after pivoting. Physical exam reveals a positive Lachman test and anterior drawer sign. What structure is most likely injured?",
    options: [
      "Posterior cruciate ligament",
      "Anterior cruciate ligament",
      "Medial collateral ligament",
      "Lateral collateral ligament"
    ],
    correctAnswer: 1,
    explanation: "Positive Lachman test and anterior drawer sign indicate anterior cruciate ligament (ACL) tear. This commonly occurs in athletes during pivoting or cutting movements. The Lachman test is more sensitive than the anterior drawer test for ACL injury.",
    category: "Orthopedics",
    difficulty: "easy",
    usmleCategory: "anatomy",
    tags: ["ACL tear", "Lachman test", "anterior drawer", "sports injury"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Surgery",
    system: "Musculoskeletal",
    topics: ["Knee Injuries", "Ligament Tears"],
    points: 10
  },
  // Additional Pediatrics
  {
    question: "A 6-month-old infant presents with failure to thrive, chronic diarrhea, and recurrent respiratory infections. Sweat chloride test is 70 mEq/L (normal <40). What is the most likely diagnosis?",
    options: [
      "Celiac disease",
      "Cystic fibrosis",
      "Immunodeficiency",
      "Inflammatory bowel disease"
    ],
    correctAnswer: 1,
    explanation: "Failure to thrive, chronic diarrhea (malabsorption), recurrent respiratory infections, and elevated sweat chloride >60 mEq/L is diagnostic of cystic fibrosis. This autosomal recessive disorder affects the CFTR gene, leading to thick secretions in multiple organs.",
    category: "Pediatrics",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["cystic fibrosis", "sweat chloride test", "failure to thrive", "CFTR"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Pediatrics",
    system: "Multiple Systems",
    topics: ["Genetic Disorders", "Cystic Fibrosis"],
    points: 15
  },
  // Additional Urology
  {
    question: "A 35-year-old man presents with sudden onset of severe left flank pain radiating to the groin, nausea, and hematuria. CT shows a 4mm stone in the left ureter. What is the most appropriate initial management?",
    options: [
      "Immediate ureteroscopy",
      "Conservative management with hydration and analgesia",
      "Extracorporeal shock wave lithotripsy",
      "Open surgical removal"
    ],
    correctAnswer: 1,
    explanation: "Small ureteral stones (<5mm) have a high likelihood of spontaneous passage (>90%). Conservative management with adequate hydration, pain control, and possibly alpha-blockers to facilitate passage is appropriate first-line therapy for stones <5mm without obstruction.",
    category: "Urology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["ureteral stone", "nephrolithiasis", "conservative management", "spontaneous passage"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Genitourinary",
    topics: ["Kidney Stones", "Renal Colic"],
    points: 15
  },
  // Additional Radiology
  {
    question: "A 50-year-old woman undergoes mammography for screening. The report describes irregular, spiculated mass with associated microcalcifications. What is the most appropriate next step?",
    options: [
      "Repeat mammography in 6 months",
      "Breast ultrasound",
      "Core needle biopsy",
      "MRI breast"
    ],
    correctAnswer: 2,
    explanation: "An irregular, spiculated mass with microcalcifications on mammography is highly suspicious for malignancy (BI-RADS 4 or 5). Core needle biopsy is the standard of care for tissue diagnosis of suspicious mammographic lesions, allowing for histologic and immunohistochemical analysis.",
    category: "Radiology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["mammography", "spiculated mass", "microcalcifications", "core needle biopsy"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Surgery",
    system: "Reproductive",
    topics: ["Breast Cancer Screening", "Breast Biopsy"],
    points: 15
  },
  // Additional Gastroenterology
  {
    question: "A 50-year-old man with a history of heavy alcohol use presents with epigastric pain and steatorrhea. CT shows pancreatic calcifications and ductal dilatation. What is the most likely diagnosis?",
    options: [
      "Acute pancreatitis",
      "Chronic pancreatitis",
      "Pancreatic adenocarcinoma",
      "Pancreatic pseudocyst"
    ],
    correctAnswer: 1,
    explanation: "Chronic pancreatitis is characterized by irreversible pancreatic damage with calcifications, ductal changes, and exocrine insufficiency (steatorrhea). Heavy alcohol use is the most common cause in adults. The pancreatic calcifications on CT are pathognomonic.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["chronic pancreatitis", "pancreatic calcifications", "steatorrhea", "alcohol"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Pancreatic Disorders", "Chronic Pancreatitis"],
    points: 15
  },
  // Additional Infectious Disease
  {
    question: "A 45-year-old immunocompromised patient presents with pneumonia that is not responding to standard antibiotics. Chest X-ray shows bilateral diffuse infiltrates. Induced sputum stains positive for cysts. What is the most likely organism?",
    options: [
      "Streptococcus pneumoniae",
      "Pneumocystis jirovecii",
      "Mycobacterium tuberculosis",
      "Legionella pneumophila"
    ],
    correctAnswer: 1,
    explanation: "Bilateral diffuse infiltrates in an immunocompromised patient with cysts seen on sputum stain is classic for Pneumocystis jirovecii pneumonia (PCP). This opportunistic infection typically occurs in patients with CD4 <200 or other forms of immunosuppression.",
    category: "Infectious Disease",
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["Pneumocystis jirovecii", "PCP", "immunocompromised", "bilateral infiltrates"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["Opportunistic Infections", "Pneumocystis Pneumonia"],
    points: 15
  },
  // Additional Neurology
  {
    question: "A 70-year-old man presents with resting tremor of his right hand, bradykinesia, and rigidity. Symptoms improve with levodopa. What is the most likely diagnosis?",
    options: [
      "Essential tremor",
      "Parkinson's disease",
      "Multiple sclerosis",
      "Huntington's disease"
    ],
    correctAnswer: 1,
    explanation: "The triad of resting tremor, bradykinesia, and rigidity that responds to levodopa is classic for Parkinson's disease. Essential tremor is an action tremor, not a resting tremor, and doesn't respond to levodopa. The dopamine responsiveness confirms the diagnosis.",
    category: "Neurology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["Parkinson's disease", "resting tremor", "bradykinesia", "levodopa"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Nervous System",
    topics: ["Movement Disorders", "Parkinson's Disease"],
    points: 10
  },
  // Additional Psychiatry
  {
    question: "A 30-year-old woman presents with persistent sadness, loss of interest, sleep disturbance, and feelings of guilt for 3 months following the death of her spouse. She has no appetite and has lost 15 pounds. What is the most likely diagnosis?",
    options: [
      "Normal grief",
      "Major depressive disorder",
      "Adjustment disorder",
      "Persistent complex bereavement disorder"
    ],
    correctAnswer: 1,
    explanation: "While grief is expected after loss of a spouse, the persistence of symptoms for 3 months with neurovegetative signs (sleep disturbance, appetite loss, weight loss) and feelings of guilt suggest major depressive disorder. Normal grief typically doesn't include persistent feelings of worthlessness or significant functional impairment.",
    category: "Psychiatry",
    difficulty: "medium",
    usmleCategory: "behavioral sciences",
    tags: ["major depressive disorder", "grief", "bereavement", "neurovegetative symptoms"],
    medicalReferences: ["DSM-5", "First Aid USMLE Step 1 2025"],
    subject: "Psychiatry",
    system: "Nervous System",
    topics: ["Mood Disorders", "Grief and Bereavement"],
    points: 15
  },
  // Additional Dermatology
  {
    question: "A 60-year-old man presents with a slowly growing, waxy, 'stuck-on' appearing lesion on his back. The lesion has a warty surface and appears to be sitting on top of the skin. What is the most likely diagnosis?",
    options: [
      "Basal cell carcinoma",
      "Seborrheic keratosis",
      "Squamous cell carcinoma",
      "Melanoma"
    ],
    correctAnswer: 1,
    explanation: "The 'stuck-on' appearance with waxy, warty surface is pathognomonic for seborrheic keratosis. These benign lesions are common in older adults and have a characteristic appearance of being pasted onto the skin surface. They require no treatment unless cosmetically bothersome.",
    category: "Dermatology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["seborrheic keratosis", "stuck-on appearance", "waxy lesion", "benign"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Integumentary",
    topics: ["Benign Skin Lesions", "Seborrheic Keratosis"],
    points: 10
  },
  // FINAL QUESTIONS TO REACH 100+ - COMPLETING HIGH-YIELD SPECIALTIES
  // Additional Obstetrics/Gynecology
  {
    question: "A 25-year-old woman at 32 weeks gestation presents with painless vaginal bleeding. Ultrasound shows placenta implanted over the internal cervical os. What is the most likely diagnosis?",
    options: [
      "Placental abruption",
      "Placenta previa",
      "Vasa previa",
      "Cervical laceration"
    ],
    correctAnswer: 1,
    explanation: "Painless vaginal bleeding in the third trimester with placenta covering the internal cervical os on ultrasound is diagnostic of placenta previa. This is distinguished from placental abruption, which typically presents with painful bleeding and uterine contractions.",
    category: "Obstetrics/Gynecology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["placenta previa", "painless bleeding", "third trimester", "internal os"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Obstetrics & Gynecology",
    system: "Reproductive",
    topics: ["Pregnancy Complications", "Placental Disorders"],
    points: 15
  },
  // Additional Pediatrics - Immunizations
  {
    question: "A 2-month-old infant is brought for routine immunizations. The mother is concerned about vaccine safety. Which vaccine is contraindicated in immunocompromised patients?",
    options: [
      "DTaP (Diphtheria, Tetanus, Pertussis)",
      "IPV (Inactivated Polio Vaccine)", 
      "MMR (Measles, Mumps, Rubella)",
      "Hib (Haemophilus influenzae type b)"
    ],
    correctAnswer: 2,
    explanation: "MMR is a live attenuated vaccine and is contraindicated in immunocompromised patients due to risk of causing disease. DTaP, IPV, and Hib are inactivated vaccines and are safe in immunocompromised patients. Live vaccines should be avoided in immunodeficiency.",
    category: "Pediatrics",
    difficulty: "medium",
    usmleCategory: "immunology",
    tags: ["immunizations", "MMR vaccine", "immunocompromised", "live attenuated vaccine"],
    medicalReferences: ["CDC Immunization Schedule", "First Aid USMLE Step 1 2025"],
    subject: "Pediatrics",
    system: "Immune System",
    topics: ["Pediatric Immunizations", "Vaccine Safety"],
    points: 15
  },
  // Additional Surgery
  {
    question: "A 45-year-old woman presents with a hard, fixed breast mass and skin dimpling. Core needle biopsy confirms invasive ductal carcinoma. Staging workup shows no distant metastases. What is the most appropriate initial treatment?",
    options: [
      "Chemotherapy first (neoadjuvant)",
      "Surgical resection first",
      "Radiation therapy first",
      "Hormone therapy first"
    ],
    correctAnswer: 1,
    explanation: "A hard, fixed breast mass with skin dimpling suggests locally advanced breast cancer (T4 disease). Neoadjuvant chemotherapy is preferred for locally advanced breast cancer to downsize the tumor and make it surgically resectable, potentially allowing breast-conserving surgery instead of mastectomy.",
    category: "Surgery",
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["breast cancer", "locally advanced", "neoadjuvant chemotherapy", "skin dimpling"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Surgery",
    system: "Reproductive",
    topics: ["Breast Cancer", "Oncologic Surgery"],
    points: 20
  },
  // Additional Infectious Disease - TB
  {
    question: "A 35-year-old immigrant from Asia presents with chronic cough, weight loss, and night sweats. Chest X-ray shows upper lobe cavitary lesions. Sputum acid-fast stain is positive. What is the most appropriate initial treatment regimen?",
    options: [
      "Isoniazid and rifampin for 9 months",
      "Rifampin, isoniazid, ethambutol, and pyrazinamide for 2 months",
      "Streptomycin and para-aminosalicylic acid",
      "Fluoroquinolone monotherapy"
    ],
    correctAnswer: 1,
    explanation: "Active pulmonary tuberculosis requires initial 4-drug therapy with rifampin, isoniazid, ethambutol, and pyrazinamide (RIPE) for 2 months, followed by rifampin and isoniazid for 4 months. This combination prevents drug resistance and ensures effective treatment.",
    category: "Infectious Disease",
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["tuberculosis", "RIPE therapy", "cavitary lesions", "acid-fast stain"],
    medicalReferences: ["CDC TB Guidelines", "First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["Tuberculosis", "Mycobacterial Infections"],
    points: 15
  },
  // Additional Pharmacology
  {
    question: "A 65-year-old man with atrial fibrillation is started on warfarin. His INR goal is 2.0-3.0. After 3 days, his INR is 1.5. What is the most appropriate next step?",
    options: [
      "Continue current warfarin dose",
      "Increase warfarin dose",
      "Add aspirin",
      "Switch to heparin"
    ],
    correctAnswer: 1,
    explanation: "Warfarin takes 3-5 days to reach therapeutic levels due to its mechanism of action (inhibiting vitamin K-dependent clotting factors with long half-lives). An INR of 1.5 after 3 days is expected, and the dose should be increased to reach the target range of 2.0-3.0 for atrial fibrillation.",
    category: "Pharmacology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["warfarin", "INR", "anticoagulation", "atrial fibrillation"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Anticoagulation", "Warfarin Therapy"],
    points: 15
  },
  // Additional Pathology
  {
    question: "A 50-year-old woman undergoes colonoscopy for screening. A 1.5cm pedunculated polyp is found and removed. Histology shows adenomatous changes with high-grade dysplasia but no invasion through the muscularis mucosae. What is the most appropriate management?",
    options: [
      "No further treatment needed",
      "Repeat colonoscopy in 1 year", 
      "Segmental colectomy",
      "Chemotherapy"
    ],
    correctAnswer: 1,
    explanation: "This describes an adenomatous polyp with high-grade dysplasia but no invasion (adenoma, not carcinoma). Complete polypectomy is curative for adenomas. Surveillance colonoscopy should be performed in 3 years for high-grade dysplasia, but no additional treatment is needed if completely excised.",
    category: "Pathology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["adenomatous polyp", "high-grade dysplasia", "colonoscopy", "polypectomy"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Colorectal Screening", "Adenomatous Polyps"],
    points: 15
  },
  // Additional Emergency Medicine - Toxicology
  {
    question: "A 25-year-old man is brought to the ED after taking an overdose of acetaminophen 6 hours ago. He ingested approximately 15 grams. What is the most appropriate treatment?",
    options: [
      "Activated charcoal",
      "N-acetylcysteine",
      "Gastric lavage",
      "Hemodialysis"
    ],
    correctAnswer: 1,
    explanation: "N-acetylcysteine is the antidote for acetaminophen poisoning and is most effective when given within 8-10 hours of ingestion. At 6 hours post-ingestion with a large overdose (15g), NAC should be started immediately. Activated charcoal is only effective within 1-2 hours of ingestion.",
    category: "Emergency Medicine",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["acetaminophen overdose", "N-acetylcysteine", "toxicology", "antidote"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Emergency Medicine",
    system: "Multiple Systems",
    topics: ["Toxicology", "Drug Overdose"],
    points: 15
  },
  // Additional Ophthalmology
  {
    question: "A 70-year-old diabetic man presents with sudden, painless vision loss in his right eye. Fundoscopic examination shows retinal whitening with a cherry-red spot at the macula. What is the most likely diagnosis?",
    options: [
      "Central retinal vein occlusion",
      "Central retinal artery occlusion",
      "Diabetic retinopathy",
      "Age-related macular degeneration"
    ],
    correctAnswer: 1,
    explanation: "Sudden, painless vision loss with retinal whitening and cherry-red spot at the macula is classic for central retinal artery occlusion (CRAO). The cherry-red spot represents the normal choroidal circulation visible through the thin foveal retina, while surrounding retina appears white due to ischemia.",
    category: "Ophthalmology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["central retinal artery occlusion", "cherry-red spot", "sudden vision loss", "retinal ischemia"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Internal Medicine",
    system: "Nervous System",
    topics: ["Retinal Vascular Disorders", "Vision Loss"],
    points: 15
  },
  // Additional Anesthesiology
  {
    question: "A 30-year-old patient develops muscle rigidity, hyperthermia (temperature 42°C), and tachycardia during general anesthesia with succinylcholine and halothane. What is the most appropriate immediate treatment?",
    options: [
      "Cooling measures only",
      "Dantrolene sodium",
      "Epinephrine",
      "Discontinue surgery immediately"
    ],
    correctAnswer: 1,
    explanation: "This presentation is classic for malignant hyperthermia, a life-threatening reaction to certain anesthetic agents (succinylcholine, volatile anesthetics). Dantrolene sodium is the specific antidote that blocks calcium release from the sarcoplasmic reticulum, stopping the hypermetabolic crisis.",
    category: "Anesthesiology",
    difficulty: "hard",
    usmleCategory: "pharmacology",
    tags: ["malignant hyperthermia", "dantrolene", "succinylcholine", "hyperthermia"],
    medicalReferences: ["First Aid USMLE Step 1 2025"],
    subject: "Anesthesiology",
    system: "Multiple Systems",
    topics: ["Anesthetic Complications", "Malignant Hyperthermia"],
    points: 20
  },
  // Additional Family Medicine
  {
    question: "A 55-year-old man with no significant medical history presents for routine health maintenance. His blood pressure readings are 145/92 mmHg and 148/90 mmHg on two separate visits. What is the most appropriate initial management?",
    options: [
      "Start ACE inhibitor immediately",
      "Lifestyle modifications for 3 months, then reassess",
      "24-hour ambulatory blood pressure monitoring",
      "No treatment needed"
    ],
    correctAnswer: 1,
    explanation: "This patient has stage 1 hypertension (SBP 130-139 or DBP 80-89 mmHg) without cardiovascular risk factors. Current guidelines recommend starting with lifestyle modifications (diet, exercise, weight loss) for 3 months before considering medication in low-risk patients with stage 1 hypertension.",
    category: "Family Medicine",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["hypertension", "lifestyle modifications", "stage 1 HTN", "cardiovascular risk"],
    medicalReferences: ["AHA/ACC Hypertension Guidelines", "First Aid USMLE Step 1 2025"],
    subject: "Family Medicine",
    system: "Cardiovascular",
    topics: ["Hypertension Management", "Preventive Medicine"],
    points: 15
  },
  
  // Additional USMLE Questions (Questions 41-140)
  {
    question: "A 28-year-old woman presents with a 3-week history of progressive fatigue, palpitations, and heat intolerance. Physical examination reveals a fine tremor, warm moist skin, and a diffusely enlarged thyroid with an audible bruit. TSH is <0.01 mU/L, and free T4 is elevated. What is the most likely diagnosis?",
    options: [
      "Hashimoto's thyroiditis",
      "Graves' disease", 
      "Toxic multinodular goiter",
      "Thyroid storm"
    ],
    correctAnswer: 1,
    explanation: "Graves' disease presents with hyperthyroid symptoms (heat intolerance, palpitations, tremor), diffuse goiter with bruit (due to increased vascularity), and suppressed TSH with elevated free T4. The thyroid bruit is characteristic of Graves' disease due to increased blood flow. Toxic multinodular goiter typically occurs in older patients with nodular thyroid disease.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["hyperthyroidism", "Graves disease", "thyroid", "endocrinology"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Hyperthyroidism", "Graves Disease", "Thyroid Disorders"],
    points: 15
  },
  {
    question: "A 55-year-old man with a history of alcoholism presents with confusion, ataxia, and nystagmus. He is given IV thiamine, and his symptoms improve significantly within hours. Which brain structures are most commonly affected in this condition?",
    options: [
      "Hippocampus and temporal lobe",
      "Mammillary bodies and dorsal medial thalamus",
      "Basal ganglia and substantia nigra", 
      "Frontal cortex and corpus callosum"
    ],
    correctAnswer: 1,
    explanation: "This patient has Wernicke encephalopathy, caused by thiamine (vitamin B1) deficiency. The classic triad includes confusion, ataxia, and nystagmus. The mammillary bodies and dorsal medial thalamus are the brain structures most commonly affected. Prompt thiamine administration can reverse acute symptoms, but chronic changes may lead to Korsakoff syndrome with permanent memory impairment.",
    category: "Neurology",
    difficulty: "medium", 
    usmleCategory: "pathology",
    tags: ["Wernicke encephalopathy", "thiamine deficiency", "alcoholism", "neurology"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology", 
    system: "Nervous",
    topics: ["Wernicke Encephalopathy", "Nutritional Deficiencies", "Alcoholism"],
    points: 15
  },
  {
    question: "A 22-year-old college student presents with a 2-day history of fever, headache, and neck stiffness. CSF analysis shows 800 WBC/μL (90% neutrophils), glucose 35 mg/dL (serum glucose 90 mg/dL), and protein 180 mg/dL. Gram stain shows gram-positive cocci in chains. What is the most likely causative organism?",
    options: [
      "Neisseria meningitidis",
      "Streptococcus pneumoniae", 
      "Haemophilus influenzae",
      "Listeria monocytogenes"
    ],
    correctAnswer: 1,
    explanation: "The CSF findings indicate bacterial meningitis (high WBC with neutrophil predominance, low glucose, high protein). Gram-positive cocci in chains are characteristic of Streptococcus pneumoniae, the most common cause of bacterial meningitis in adults. S. pneumoniae is also the most common cause in college-age students living in dormitories.",
    category: "Infectious Disease", 
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["bacterial meningitis", "pneumococcus", "CSF analysis", "infectious disease"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Infectious Diseases"],
    subject: "Internal Medicine",
    system: "Nervous",
    topics: ["Bacterial Meningitis", "CNS Infections", "CSF Analysis"],
    points: 15
  },
  {
    question: "A 45-year-old woman presents with severe right upper quadrant pain that radiates to her right shoulder blade. The pain occurs 30 minutes after eating fatty meals and lasts for several hours. Murphy's sign is positive. What is the most appropriate initial diagnostic test?",
    options: [
      "CT scan of the abdomen", 
      "HIDA scan",
      "Right upper quadrant ultrasound",
      "ERCP"
    ],
    correctAnswer: 2,
    explanation: "This patient has classic symptoms of cholelithiasis/cholecystitis: RUQ pain after fatty meals, radiation to right shoulder (referred pain via phrenic nerve), positive Murphy's sign. Right upper quadrant ultrasound is the initial test of choice for suspected gallbladder disease due to its high sensitivity for gallstones, non-invasive nature, and cost-effectiveness.",
    category: "Gastroenterology",
    difficulty: "easy", 
    usmleCategory: "pathology",
    tags: ["cholecystitis", "gallstones", "Murphy sign", "ultrasound"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Surgery",
    system: "Gastrointestinal", 
    topics: ["Cholelithiasis", "Acute Cholecystitis", "Abdominal Pain"],
    points: 10
  },
  {
    question: "A 35-year-old man presents with progressive muscle weakness, particularly in his hands and feet. On examination, he has decreased deep tendon reflexes and distal sensory loss in a stocking-glove distribution. Nerve conduction studies show decreased conduction velocity. What type of neuropathy is most likely?",
    options: [
      "Demyelinating neuropathy",
      "Axonal neuropathy", 
      "Mixed neuropathy",
      "Neuromuscular junction disorder"
    ],
    correctAnswer: 0,
    explanation: "Decreased nerve conduction velocity indicates demyelinating neuropathy. Axonal neuropathies typically have normal or mildly decreased conduction velocities but reduced amplitudes. The stocking-glove distribution suggests distal symmetric polyneuropathy. Common causes of demyelinating neuropathy include Guillain-Barré syndrome, CIDP, and hereditary neuropathies like Charcot-Marie-Tooth disease.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["peripheral neuropathy", "demyelinating", "nerve conduction", "neurology"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology",
    system: "Nervous", 
    topics: ["Peripheral Neuropathy", "Nerve Conduction Studies", "Demyelinating Disease"],
    points: 15
  },
  {
    question: "A 28-year-old pregnant woman at 32 weeks gestation presents with headaches, blurred vision, and epigastric pain. Blood pressure is 160/110 mmHg. Urinalysis shows 3+ protein. Laboratory studies reveal platelet count 90,000/μL, ALT 120 U/L, and LDH 800 U/L. What is the most likely diagnosis?",
    options: [
      "Gestational hypertension", 
      "Preeclampsia with severe features",
      "HELLP syndrome",
      "Acute fatty liver of pregnancy"
    ],
    correctAnswer: 2,
    explanation: "HELLP syndrome is characterized by Hemolysis (elevated LDH), Elevated Liver enzymes (ALT >70), and Low Platelets (<100,000). This patient has all components plus severe preeclampsia features (BP >160/110, proteinuria, symptoms). HELLP syndrome is a severe form of preeclampsia requiring immediate delivery regardless of gestational age to prevent maternal and fetal complications.",
    category: "Obstetrics/Gynecology",
    difficulty: "hard",
    usmleCategory: "pathology", 
    tags: ["HELLP syndrome", "preeclampsia", "pregnancy complications", "obstetrics"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Williams Obstetrics"],
    subject: "Obstetrics/Gynecology",
    system: "Reproductive",
    topics: ["HELLP Syndrome", "Preeclampsia", "Pregnancy Complications"],
    points: 20
  },
  {
    question: "A 60-year-old man with COPD presents with acute worsening of dyspnea and productive cough with purulent sputum. Arterial blood gas shows pH 7.32, PCO2 65 mmHg, PO2 55 mmHg, HCO3- 32 mEq/L. What is the primary acid-base disorder?",
    options: [
      "Respiratory acidosis with metabolic compensation",
      "Metabolic acidosis with respiratory compensation",
      "Mixed respiratory and metabolic acidosis", 
      "Normal acid-base status"
    ],
    correctAnswer: 0,
    explanation: "This patient has respiratory acidosis (pH <7.35, PCO2 >45) with metabolic compensation (HCO3- >26). In COPD exacerbation, CO2 retention causes respiratory acidosis. The kidneys compensate by retaining bicarbonate to normalize pH. Expected compensation: HCO3- increases by 4 mEq/L for every 10 mmHg increase in PCO2 in chronic respiratory acidosis.",
    category: "Pulmonology", 
    difficulty: "medium",
    usmleCategory: "physiology",
    tags: ["COPD exacerbation", "respiratory acidosis", "acid-base", "ABG interpretation"], 
    medicalReferences: ["First Aid USMLE Step 1 2025", "Murray and Nadel's Respiratory Medicine"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["COPD Exacerbation", "Acid-Base Disorders", "ABG Interpretation"],
    points: 15
  },
  {
    question: "A 25-year-old woman presents with a 6-month history of amenorrhea, galactorrhea, and headaches. MRI shows a 15mm pituitary adenoma. Prolactin level is 180 ng/mL (normal <25). What is the most appropriate initial treatment?", 
    options: [
      "Transsphenoidal surgery",
      "Radiation therapy",
      "Cabergoline",
      "Bromocriptine"
    ],
    correctAnswer: 2,
    explanation: "This patient has a prolactinoma (pituitary adenoma secreting prolactin). Cabergoline is the first-line treatment for prolactinomas as it's a dopamine agonist that effectively suppresses prolactin secretion and shrinks tumor size. Cabergoline is preferred over bromocriptine due to better efficacy, tolerability, and less frequent dosing. Surgery is reserved for cases resistant to medical therapy.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["prolactinoma", "cabergoline", "dopamine agonist", "pituitary adenoma"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine", 
    system: "Endocrine",
    topics: ["Prolactinoma", "Pituitary Disorders", "Dopamine Agonists"],
    points: 15
  },
  {
    question: "A 70-year-old man presents with progressive dyspnea on exertion and lower extremity edema. Echocardiogram shows left ventricular ejection fraction of 35% and dilated left ventricle. Which medication has been shown to reduce mortality in this condition?",
    options: [
      "Furosemide",
      "Diltiazem", 
      "Lisinopril",
      "Digoxin"
    ],
    correctAnswer: 2,
    explanation: "This patient has heart failure with reduced ejection fraction (HFrEF, EF <40%). ACE inhibitors like lisinopril have proven mortality benefit in HFrEF by reducing preload, afterload, and preventing ventricular remodeling. They are first-line therapy along with beta-blockers. Furosemide improves symptoms but doesn't reduce mortality. Digoxin improves symptoms but may increase mortality.",
    category: "Cardiovascular", 
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["heart failure", "ACE inhibitor", "HFrEF", "mortality benefit"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA Heart Failure Guidelines"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Heart Failure", "ACE Inhibitors", "HFrEF Management"],
    points: 15
  },
  {
    question: "A 45-year-old woman presents with episodic severe headaches associated with palpitations, diaphoresis, and hypertension (BP peaks at 220/120 mmHg). Between episodes, her blood pressure is normal. Plasma metanephrines are elevated. What is the most likely diagnosis?",
    options: [
      "Essential hypertension",
      "Pheochromocytoma",
      "Hyperthyroidism", 
      "Panic disorder"
    ],
    correctAnswer: 1,
    explanation: "The classic triad of headache, palpitations/tachycardia, and diaphoresis with episodic hypertension strongly suggests pheochromocytoma. Elevated plasma metanephrines (metabolites of catecholamines) confirm the diagnosis. Pheochromocytomas secrete catecholamines episodically, causing paroxysmal symptoms. The '4 H's' (Headache, Heart racing, Hyperhidrosis, Hypertension) are characteristic.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["pheochromocytoma", "catecholamines", "metanephrines", "hypertensive crisis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine", 
    topics: ["Pheochromocytoma", "Secondary Hypertension", "Catecholamine Excess"],
    points: 15
  },
  {
    question: "A 32-year-old man presents with a 2-week history of painful oral ulcers, genital ulcers, and skin lesions. He also complains of eye pain and blurred vision. Ophthalmologic examination reveals anterior uveitis. What is the most likely diagnosis?",
    options: [
      "Herpes simplex virus infection", 
      "Behçet's disease",
      "Aphthous stomatitis",
      "Crohn's disease"
    ],
    correctAnswer: 1,
    explanation: "Behçet's disease is a multisystem vasculitis characterized by recurrent oral ulcers (nearly universal), genital ulcers, skin lesions (erythema nodosum, pustules), and ocular involvement (uveitis, retinal vasculitis). The combination of oral and genital ulceration with uveitis is pathognomonic for Behçet's disease. It's more common in patients from the 'Silk Road' regions (Mediterranean, Middle East, East Asia).",
    category: "Rheumatology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Behçet disease", "uveitis", "oral ulcers", "genital ulcers"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Kelley's Rheumatology"],
    subject: "Internal Medicine", 
    system: "Musculoskeletal",
    topics: ["Behçet Disease", "Vasculitis", "Uveitis"],
    points: 15
  },
  {
    question: "A 18-year-old male athlete collapses during basketball practice. He is unconscious and has no pulse. CPR is initiated. The automated external defibrillator advises no shock. After 2 minutes of CPR, he regains consciousness and pulse. What is the most likely cause of his cardiac arrest?",
    options: [
      "Hypertrophic cardiomyopathy", 
      "Long QT syndrome",
      "Brugada syndrome",
      "Arrhythmogenic right ventricular cardiomyopathy"
    ],
    correctAnswer: 0,
    explanation: "Hypertrophic cardiomyopathy (HCM) is the most common cause of sudden cardiac death in young athletes. The thickened interventricular septum can cause dynamic left ventricular outflow tract obstruction during exercise, leading to ventricular arrhythmias. The fact that the AED advised no shock suggests a non-shockable rhythm like pulseless electrical activity (PEA), which can occur with severe obstruction.",
    category: "Cardiovascular", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["hypertrophic cardiomyopathy", "sudden cardiac death", "athletes", "LVOT obstruction"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA Sports Cardiology Guidelines"],
    subject: "Sports Medicine",
    system: "Cardiovascular",
    topics: ["Hypertrophic Cardiomyopathy", "Sudden Cardiac Death", "Athletic Screening"],
    points: 15
  },
  {
    question: "A 55-year-old man with diabetes presents with a non-healing ulcer on his right great toe that has been present for 3 months. The ulcer is deep with exposed bone. X-ray shows osteolytic changes in the distal phalanx. What is the most appropriate next step in management?",
    options: [
      "Topical antibiotics and dressing changes",
      "Oral antibiotics for 2 weeks", 
      "MRI of the foot",
      "Bone biopsy for culture and histology"
    ],
    correctAnswer: 3,
    explanation: "This patient has osteomyelitis (bone infection) evidenced by exposed bone and osteolytic changes on X-ray. In diabetic foot osteomyelitis, bone biopsy is the gold standard for diagnosis, providing culture results for targeted antibiotic therapy and confirming the diagnosis histologically. MRI can help assess extent but doesn't provide microbiologic diagnosis. Treatment requires 6-8 weeks of targeted antibiotics based on culture results.",
    category: "Infectious Disease",
    difficulty: "medium", 
    usmleCategory: "microbiology",
    tags: ["osteomyelitis", "diabetic foot", "bone biopsy", "chronic infection"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Mandell's Infectious Diseases"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Osteomyelitis", "Diabetic Foot", "Chronic Infections"], 
    points: 15
  },
  {
    question: "A 26-year-old woman presents with a 3-day history of fever, dysuria, and flank pain. Urinalysis shows >100 WBC/hpf, numerous bacteria, and WBC casts. Blood cultures are pending. What is the most appropriate initial antibiotic therapy?",
    options: [
      "Trimethoprim-sulfamethoxazole", 
      "Nitrofurantoin",
      "Ceftriaxone",
      "Ciprofloxacin"
    ],
    correctAnswer: 2,
    explanation: "This patient has acute pyelonephritis (fever, flank pain, WBC casts in urine). Ceftriaxone is an appropriate choice for hospitalized patients with pyelonephritis as it has excellent gram-negative coverage including E. coli (most common cause) and good tissue penetration into the kidney. Nitrofurantoin doesn't achieve adequate tissue levels for pyelonephritis. TMP-SMX has high resistance rates in many areas.",
    category: "Infectious Disease", 
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["pyelonephritis", "UTI", "ceftriaxone", "WBC casts"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Mandell's Infectious Diseases"],
    subject: "Internal Medicine",
    system: "Genitourinary",
    topics: ["Pyelonephritis", "Upper UTI", "Antibiotic Selection"],
    points: 15
  },
  {
    question: "A 40-year-old woman presents with fatigue, hair loss, and constipation. Laboratory studies show TSH 25 mU/L, free T4 0.6 ng/dL, and positive anti-thyroid peroxidase (anti-TPO) antibodies. What is the most likely diagnosis?",
    options: [
      "Graves' disease",
      "Hashimoto's thyroiditis", 
      "Subacute thyroiditis",
      "Postpartum thyroiditis"
    ],
    correctAnswer: 1,
    explanation: "Hashimoto's thyroiditis is the most common cause of hypothyroidism in iodine-sufficient areas. It's an autoimmune condition characterized by positive anti-TPO antibodies (and/or anti-thyroglobulin antibodies), elevated TSH, and low free T4. Symptoms include fatigue, hair loss, constipation, weight gain, and cold intolerance. Treatment is levothyroxine replacement.",
    category: "Endocrine",
    difficulty: "easy",
    usmleCategory: "pathology", 
    tags: ["Hashimoto thyroiditis", "hypothyroidism", "anti-TPO", "autoimmune"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Hashimoto Thyroiditis", "Hypothyroidism", "Autoimmune Thyroid Disease"],
    points: 10
  },
  {
    question: "A 65-year-old man with a history of smoking presents with a 6-month history of progressive dyspnea and dry cough. Chest CT shows bilateral lower lobe reticular opacities and honeycombing. Pulmonary function tests show a restrictive pattern. What is the most likely diagnosis?",
    options: [
      "Chronic obstructive pulmonary disease",
      "Idiopathic pulmonary fibrosis", 
      "Hypersensitivity pneumonitis",
      "Sarcoidosis"
    ],
    correctAnswer: 1,
    explanation: "Idiopathic pulmonary fibrosis (IPF) typically presents in older patients (>60 years) with progressive dyspnea, dry cough, and bilateral lower lobe fibrosis with honeycombing on CT. The restrictive pattern on PFTs is characteristic. IPF has a poor prognosis with median survival of 3-5 years. Risk factors include age, male sex, and smoking. Treatment includes antifibrotic agents (pirfenidone, nintedanib).",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["idiopathic pulmonary fibrosis", "interstitial lung disease", "honeycombing", "restrictive lung disease"], 
    medicalReferences: ["First Aid USMLE Step 1 2025", "Murray and Nadel's Respiratory Medicine"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["Idiopathic Pulmonary Fibrosis", "Interstitial Lung Disease", "Pulmonary Function Tests"],
    points: 15
  },
  {
    question: "A 30-year-old man presents with acute onset severe abdominal pain that radiates to his back. He has nausea and vomiting. Physical examination shows epigastric tenderness. Laboratory studies show lipase 800 U/L (normal <60) and normal bilirubin. What is the most common cause of this condition in his age group?",
    options: [
      "Gallstones", 
      "Alcohol abuse",
      "Hypertriglyceridemia",
      "Medications"
    ],
    correctAnswer: 1,
    explanation: "This patient has acute pancreatitis (severe epigastric pain radiating to back, elevated lipase >3x normal). In young men, alcohol abuse is the most common cause of acute pancreatitis. In women and older patients, gallstones are more common. Other causes include hypertriglyceridemia (levels >1000 mg/dL), medications (thiazides, sulfonamides, steroids), and autoimmune pancreatitis.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["acute pancreatitis", "alcohol abuse", "lipase", "abdominal pain"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Acute Pancreatitis", "Alcohol-Related Disease", "Abdominal Pain"],
    points: 15
  },
  {
    question: "A 50-year-old woman presents with progressive weakness in her hands, difficulty swallowing, and muscle fasciculations. Electromyography shows denervation in multiple muscle groups. Upper and lower motor neuron signs are present on examination. What is the most likely diagnosis?",
    options: [
      "Multiple sclerosis",
      "Amyotrophic lateral sclerosis", 
      "Guillain-Barré syndrome",
      "Myasthenia gravis"
    ],
    correctAnswer: 1,
    explanation: "Amyotrophic lateral sclerosis (ALS) is characterized by progressive weakness, muscle fasciculations, and both upper motor neuron signs (spasticity, hyperreflexia, Babinski sign) and lower motor neuron signs (weakness, atrophy, fasciculations). EMG shows denervation. ALS typically presents with asymmetric limb weakness or bulbar symptoms (dysphagia, dysarthria). It's a fatal neurodegenerative disease affecting motor neurons.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["ALS", "motor neuron disease", "fasciculations", "upper and lower motor neuron"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology", 
    system: "Nervous",
    topics: ["Amyotrophic Lateral Sclerosis", "Motor Neuron Disease", "Neuromuscular Disorders"],
    points: 15
  },
  {
    question: "A 35-year-old woman presents with fatigue, weight loss, and abdominal pain. Physical examination shows hyperpigmentation of skin creases and oral mucosa. Laboratory studies show Na+ 128 mEq/L, K+ 5.2 mEq/L, and low cortisol with high ACTH. What is the most likely diagnosis?",
    options: [
      "Cushing's syndrome",
      "Primary adrenal insufficiency", 
      "Secondary adrenal insufficiency",
      "Conn's syndrome"
    ],
    correctAnswer: 1,
    explanation: "Primary adrenal insufficiency (Addison's disease) presents with fatigue, weight loss, hyperpigmentation (due to high ACTH stimulating melanocytes), hyponatremia, hyperkalemia, and low cortisol with high ACTH. The high ACTH distinguishes primary (adrenal gland failure) from secondary (pituitary/hypothalamic) causes. Most common causes include autoimmune adrenalitis, tuberculosis, and metastases.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["Addison disease", "adrenal insufficiency", "hyperpigmentation", "ACTH"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Addison Disease", "Primary Adrenal Insufficiency", "Electrolyte Disorders"],
    points: 15
  },
  {
    question: "A 28-year-old woman presents with a 6-month history of joint pain involving her wrists, knees, and small joints of her hands. Morning stiffness lasts 2 hours. Physical examination shows synovial thickening and warmth in affected joints. ESR and CRP are elevated, and rheumatoid factor is positive. What is the most likely diagnosis?",
    options: [
      "Osteoarthritis",
      "Rheumatoid arthritis", 
      "Systemic lupus erythematosus",
      "Psoriatic arthritis"
    ],
    correctAnswer: 1,
    explanation: "Rheumatoid arthritis (RA) is characterized by symmetric polyarthritis affecting small joints (MCPs, PIPs, wrists), prolonged morning stiffness (>1 hour), synovial inflammation, elevated acute phase reactants (ESR, CRP), and positive rheumatoid factor. RA is more common in women and typically presents in the 30-50 age group. Early diagnosis and treatment with DMARDs prevents joint destruction.",
    category: "Rheumatology",
    difficulty: "easy", 
    usmleCategory: "pathology",
    tags: ["rheumatoid arthritis", "polyarthritis", "rheumatoid factor", "morning stiffness"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Kelley's Rheumatology"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Rheumatoid Arthritis", "Inflammatory Arthritis", "Autoimmune Disease"],
    points: 10
  },
  {
    question: "A 45-year-old man presents with sudden onset severe chest pain that radiates to his back. Blood pressure is 180/100 mmHg in the right arm and 140/80 mmHg in the left arm. Chest X-ray shows widened mediastinum. What is the most likely diagnosis?",
    options: [
      "Myocardial infarction",
      "Pulmonary embolism", 
      "Aortic dissection",
      "Pneumothorax"
    ],
    correctAnswer: 2,
    explanation: "Aortic dissection presents with sudden, severe, tearing chest pain that radiates to the back. The blood pressure differential between arms (>20 mmHg) suggests involvement of the brachiocephalic artery. Widened mediastinum on chest X-ray is a classic finding. Type A dissection involves the ascending aorta and requires emergency surgery. CT angiography or TEE confirms the diagnosis.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["aortic dissection", "chest pain", "blood pressure differential", "widened mediastinum"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Braunwald's Heart Disease"],
    subject: "Emergency Medicine",
    system: "Cardiovascular",
    topics: ["Aortic Dissection", "Aortic Emergency", "Chest Pain"],
    points: 15
  },
  {
    question: "A 22-year-old woman presents with a 3-day history of fever, sore throat, and lymphadenopathy. Physical examination shows exudative tonsillitis, posterior cervical lymphadenopathy, and splenomegaly. Monospot test is positive. What is the most likely causative organism?",
    options: [
      "Streptococcus pyogenes",
      "Epstein-Barr virus", 
      "Cytomegalovirus",
      "Adenovirus"
    ],
    correctAnswer: 1,
    explanation: "Infectious mononucleosis caused by Epstein-Barr virus (EBV) presents with fever, exudative pharyngitis, lymphadenopathy (especially posterior cervical), and splenomegaly. The positive monospot test (heterophil antibodies) confirms EBV mononucleosis. CMV can cause a similar syndrome but is usually monospot-negative. Complications include splenic rupture, so contact sports should be avoided.",
    category: "Infectious Disease",
    difficulty: "easy",
    usmleCategory: "microbiology", 
    tags: ["infectious mononucleosis", "EBV", "monospot", "splenomegaly"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Mandell's Infectious Diseases"],
    subject: "Internal Medicine",
    system: "Hematologic/Lymphatic",
    topics: ["Infectious Mononucleosis", "Epstein-Barr Virus", "Viral Infections"],
    points: 10
  },
  {
    question: "A 65-year-old man with a history of atrial fibrillation on warfarin presents with sudden onset left-sided weakness and aphasia. CT scan of the head shows no acute hemorrhage. INR is 1.8 (therapeutic range 2.0-3.0). What is the most appropriate immediate treatment?",
    options: [
      "Increase warfarin dose",
      "Administer tPA", 
      "Start heparin infusion",
      "Give aspirin 325 mg"
    ],
    correctAnswer: 1,
    explanation: "This patient has acute ischemic stroke (sudden neurologic deficit, no hemorrhage on CT). Despite being on warfarin with subtherapeutic INR, he's still a candidate for thrombolytic therapy if within the time window (<4.5 hours from symptom onset) and meets inclusion criteria. tPA (tissue plasminogen activator) is the standard thrombolytic agent. INR should be ≤1.7 for tPA administration.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pharmacology", 
    tags: ["acute stroke", "tPA", "thrombolysis", "atrial fibrillation"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA Stroke Guidelines"],
    subject: "Neurology",
    system: "Nervous",
    topics: ["Acute Ischemic Stroke", "Thrombolytic Therapy", "Stroke Management"],
    points: 15
  },
  {
    question: "A 50-year-old man presents with progressive dyspnea and orthopnea. Physical examination reveals elevated JVP, S3 gallop, and bilateral lower extremity edema. Echocardiogram shows ejection fraction of 25%. BNP is elevated. What is the most appropriate initial diuretic therapy?",
    options: [
      "Hydrochlorothiazide", 
      "Spironolactone",
      "Furosemide",
      "Acetazolamide"
    ],
    correctAnswer: 2,
    explanation: "This patient has acute decompensated heart failure with fluid overload (elevated JVP, S3, edema, elevated BNP). Furosemide, a loop diuretic, is the most appropriate initial diuretic for acute heart failure as it provides rapid and potent diuresis. It blocks the Na-K-2Cl cotransporter in the thick ascending limb of Henle, causing significant sodium and water loss. Thiazides are less potent and used for maintenance therapy.",
    category: "Cardiovascular",
    difficulty: "easy",
    usmleCategory: "pharmacology", 
    tags: ["heart failure", "furosemide", "loop diuretic", "fluid overload"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA Heart Failure Guidelines"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Acute Heart Failure", "Loop Diuretics", "Fluid Management"],
    points: 10
  },
  {
    question: "A 30-year-old woman presents with recurrent episodes of severe headaches, nausea, and visual disturbances that last 4-6 hours. The headaches are unilateral and throbbing. She experiences photophobia and phonophobia during episodes. What is the most likely diagnosis?",
    options: [
      "Tension-type headache",
      "Migraine without aura", 
      "Cluster headache",
      "Trigeminal neuralgia"
    ],
    correctAnswer: 1,
    explanation: "This patient has migraine without aura. Migraines are characterized by recurrent headaches lasting 4-72 hours, typically unilateral and pulsating, with associated nausea/vomiting, photophobia, and phonophobia. They're more common in women and often have triggers. Treatment includes acute therapy (triptans, NSAIDs) and prophylaxis for frequent episodes (topiramate, propranolol, amitriptyline).",
    category: "Neurology",
    difficulty: "easy",
    usmleCategory: "pathology", 
    tags: ["migraine", "headache", "photophobia", "phonophobia"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology",
    system: "Nervous",
    topics: ["Migraine Headache", "Primary Headaches", "Neurologic Disorders"],
    points: 10
  },
  {
    question: "A 55-year-old diabetic man presents with a painless ulcer on the plantar surface of his right foot. The ulcer is 2 cm in diameter with clean edges and appears well-perfused. Sensation is decreased in both feet. What is the most likely cause of this ulcer?",
    options: [
      "Arterial insufficiency",
      "Venous stasis", 
      "Neuropathic ulcer",
      "Pressure sore"
    ],
    correctAnswer: 2,
    explanation: "Diabetic neuropathic ulcers typically occur on pressure-bearing areas (plantar surface), are painless due to sensory neuropathy, have clean edges, and appear well-perfused. They result from repetitive trauma in areas of altered sensation. Risk factors include peripheral neuropathy, foot deformities, and inadequate foot care. Treatment includes offloading, wound care, and glucose control.",
    category: "Endocrine",
    difficulty: "easy",
    usmleCategory: "pathology", 
    tags: ["diabetic foot ulcer", "neuropathy", "peripheral neuropathy", "diabetes complications"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "ADA Diabetic Foot Guidelines"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Diabetic Foot Ulcer", "Diabetic Neuropathy", "Diabetes Complications"],
    points: 10
  },
  {
    question: "A 40-year-old woman presents with fatigue, cold intolerance, and weight gain. TSH is 8.5 mU/L (normal 0.5-5.0), free T4 is 0.9 ng/dL (normal 1.0-2.3), and anti-TPO antibodies are positive. What is the most appropriate treatment?",
    options: [
      "Methimazole",
      "Levothyroxine", 
      "Propranolol",
      "Radioactive iodine"
    ],
    correctAnswer: 1,
    explanation: "This patient has subclinical hypothyroidism (elevated TSH, normal free T4) with positive anti-TPO antibodies indicating Hashimoto's thyroiditis. Levothyroxine replacement therapy is indicated for TSH >10 mU/L, or TSH 5-10 mU/L with symptoms or positive antibodies. The goal is to normalize TSH levels. Starting dose is typically 1.6 mcg/kg/day in healthy adults, with dose adjustments based on TSH levels after 6-8 weeks.",
    category: "Endocrine",
    difficulty: "easy",
    usmleCategory: "pharmacology",
    tags: ["subclinical hypothyroidism", "levothyroxine", "Hashimoto thyroiditis", "anti-TPO"], 
    medicalReferences: ["First Aid USMLE Step 1 2025", "ATA Hypothyroidism Guidelines"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Subclinical Hypothyroidism", "Levothyroxine Therapy", "Hashimoto Thyroiditis"],
    points: 10
  },
  {
    question: "A 25-year-old man presents with acute onset shortness of breath and chest pain after playing basketball. Physical examination shows diminished breath sounds and hyperresonance on the right side. Chest X-ray confirms the suspected diagnosis. What is the most appropriate immediate management?",
    options: [
      "Observation and oxygen",
      "Needle thoracentesis", 
      "Chest tube insertion",
      "Bronchoscopy"
    ],
    correctAnswer: 2,
    explanation: "This patient has a pneumothorax (sudden chest pain and dyspnea in a young, tall, thin male athlete). The physical findings (diminished breath sounds, hyperresonance) and chest X-ray confirm the diagnosis. A large pneumothorax (>50% or symptomatic) requires chest tube insertion for immediate decompression and re-expansion of the lung. Small, asymptomatic pneumothoraces may be observed.",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["pneumothorax", "chest tube", "spontaneous pneumothorax", "chest pain"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Murray and Nadel's Respiratory Medicine"],
    subject: "Emergency Medicine",
    system: "Respiratory",
    topics: ["Pneumothorax", "Chest Tube", "Respiratory Emergency"],
    points: 15
  },
  {
    question: "A 60-year-old man with a history of smoking and COPD presents with worsening dyspnea, increased sputum production, and sputum purulence. Chest X-ray shows no pneumonia. What is the most appropriate antibiotic therapy for this COPD exacerbation?",
    options: [
      "Amoxicillin",
      "Azithromycin", 
      "Levofloxacin",
      "Cephalexin"
    ],
    correctAnswer: 1,
    explanation: "This patient has a COPD exacerbation with increased dyspnea, sputum volume, and purulence (Anthonisen criteria). Azithromycin is an appropriate choice as it covers typical respiratory pathogens (H. influenzae, S. pneumoniae, M. catarrhalis) and has anti-inflammatory properties. It's particularly effective in COPD exacerbations and has good tissue penetration. Amoxicillin-clavulanate would also be appropriate.",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "microbiology", 
    tags: ["COPD exacerbation", "azithromycin", "respiratory infection", "Anthonisen criteria"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "GOLD COPD Guidelines"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["COPD Exacerbation", "Antibiotic Therapy", "Respiratory Infections"],
    points: 15
  },
  {
    question: "A 35-year-old woman presents with palpitations, anxiety, heat intolerance, and unintentional weight loss. Physical examination shows fine tremor, warm moist skin, and tachycardia. TSH is <0.01 mU/L, free T4 is elevated, and radioiodine uptake is increased. What is the most appropriate initial treatment?",
    options: [
      "Levothyroxine",
      "Methimazole", 
      "Propranolol only",
      "Radioactive iodine"
    ],
    correctAnswer: 1,
    explanation: "This patient has hyperthyroidism with elevated radioiodine uptake, most likely Graves' disease. Methimazole is the preferred initial antithyroid drug as it has a longer half-life than propylthiouracil (PTU) and better side effect profile. It blocks thyroid hormone synthesis by inhibiting thyroid peroxidase. Propranolol can be added for symptomatic relief of adrenergic symptoms. PTU is reserved for pregnancy or thyroid storm.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pharmacology", 
    tags: ["hyperthyroidism", "Graves disease", "methimazole", "antithyroid drugs"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "ATA Hyperthyroidism Guidelines"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Hyperthyroidism", "Graves Disease", "Antithyroid Therapy"],
    points: 15
  },
  {
    question: "A 50-year-old man presents with progressive shortness of breath and fatigue. Echocardiogram shows severe aortic stenosis with a valve area of 0.8 cm² (normal >2.0 cm²) and mean gradient of 50 mmHg. He is currently asymptomatic at rest but has dyspnea with moderate exertion. What is the most appropriate management?",
    options: [
      "Medical management with diuretics",
      "Aortic valve replacement", 
      "Balloon valvuloplasty",
      "Serial echocardiographic monitoring"
    ],
    correctAnswer: 1,
    explanation: "This patient has severe aortic stenosis (valve area <1.0 cm², mean gradient >40 mmHg) with symptoms of dyspnea on exertion. Symptomatic severe aortic stenosis has a poor prognosis without intervention. Aortic valve replacement (surgical or transcatheter TAVR) is indicated for symptomatic severe AS. Medical therapy doesn't improve survival in severe AS. Balloon valvuloplasty provides only temporary relief.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["aortic stenosis", "aortic valve replacement", "valve disease", "dyspnea"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA Valvular Heart Disease Guidelines"],
    subject: "Cardiology",
    system: "Cardiovascular",
    topics: ["Aortic Stenosis", "Valvular Heart Disease", "Valve Replacement"],
    points: 15
  },
  {
    question: "A 45-year-old woman presents with a 2-month history of progressive dysphagia to both solids and liquids. She also reports regurgitation of undigested food and chest pain. Barium swallow shows a 'bird's beak' appearance of the gastroesophageal junction. What is the most likely diagnosis?",
    options: [
      "Gastroesophageal reflux disease",
      "Esophageal cancer", 
      "Achalasia",
      "Esophageal spasm"
    ],
    correctAnswer: 2,
    explanation: "Achalasia is characterized by progressive dysphagia to both solids and liquids (versus GERD/cancer which affects solids first), regurgitation of undigested food, and chest pain. The 'bird's beak' appearance on barium swallow shows the non-relaxing lower esophageal sphincter. It's caused by degeneration of enteric neurons in the myenteric plexus. Treatment includes pneumatic dilation, laparoscopic myotomy, or POEM.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["achalasia", "dysphagia", "bird's beak", "LES dysfunction"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topics: ["Achalasia", "Esophageal Motility Disorders", "Dysphagia"],
    points: 15
  },
  {
    question: "A 70-year-old man presents with fatigue, bone pain, and recurrent infections. Laboratory studies show hemoglobin 8.5 g/dL, calcium 11.2 mg/dL (normal 8.5-10.5), creatinine 1.8 mg/dL, and total protein 9.5 g/dL with monoclonal protein spike on electrophoresis. What is the most likely diagnosis?",
    options: [
      "Chronic lymphocytic leukemia",
      "Multiple myeloma", 
      "Waldenstrom's macroglobulinemia",
      "Monoclonal gammopathy of undetermined significance"
    ],
    correctAnswer: 1,
    explanation: "Multiple myeloma presents with the classic 'CRAB' features: hyperCalcemia, Renal dysfunction, Anemia, and Bone lesions/bone pain. The monoclonal protein spike (M protein) on serum protein electrophoresis indicates clonal plasma cell proliferation. Additional features include recurrent infections due to hypogammaglobulinemia. Diagnosis requires >10% clonal plasma cells in bone marrow plus end-organ damage.",
    category: "Hematology/Oncology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["multiple myeloma", "CRAB symptoms", "monoclonal protein", "plasma cell disorder"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Wintrobe's Hematology"],
    subject: "Hematology/Oncology",
    system: "Hematologic/Lymphatic",
    topics: ["Multiple Myeloma", "Plasma Cell Disorders", "Hematologic Malignancies"],
    points: 15
  },
  {
    question: "A 25-year-old woman presents with a 3-day history of fever, headache, and a rash that started on her wrists and ankles and spread centrally. She recently returned from camping in North Carolina. Laboratory studies show thrombocytopenia and elevated liver enzymes. What is the most likely diagnosis?",
    options: [
      "Lyme disease",
      "Rocky Mountain spotted fever", 
      "Ehrlichiosis",
      "Tularemia"
    ],
    correctAnswer: 1,
    explanation: "Rocky Mountain spotted fever (RMSF) is caused by Rickettsia rickettsii transmitted by ticks. The classic triad includes fever, headache, and rash that starts on wrists/ankles and spreads centrally (centripetal spread). Laboratory findings include thrombocytopenia, elevated liver enzymes, and hyponatremia. It's endemic in the southeastern United States (despite the name). Treatment is doxycycline regardless of age.",
    category: "Infectious Disease",
    difficulty: "medium",
    usmleCategory: "microbiology", 
    tags: ["Rocky Mountain spotted fever", "RMSF", "tick-borne disease", "centripetal rash"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Mandell's Infectious Diseases"],
    subject: "Infectious Disease",
    system: "Integumentary",
    topics: ["Rocky Mountain Spotted Fever", "Tick-Borne Diseases", "Rickettsial Infections"],
    points: 15
  },
  {
    question: "A 60-year-old man with diabetes presents with sudden onset severe pain, swelling, and redness of his right great toe. The joint is warm and exquisitely tender. Synovial fluid analysis shows 50,000 WBC/μL with intracellular negatively birefringent crystals. What is the most likely diagnosis?",
    options: [
      "Septic arthritis",
      "Gout", 
      "Pseudogout",
      "Rheumatoid arthritis"
    ],
    correctAnswer: 1,
    explanation: "Acute gout typically presents with sudden onset severe monoarthritis, often affecting the first metatarsophalangeal joint (podagra). Risk factors include diabetes, hypertension, and metabolic syndrome. Synovial fluid shows negatively birefringent uric acid crystals under polarized light microscopy. The high WBC count indicates acute inflammation. Treatment includes NSAIDs, colchicine, or corticosteroids for acute attacks.",
    category: "Rheumatology",
    difficulty: "easy",
    usmleCategory: "pathology", 
    tags: ["gout", "uric acid crystals", "podagra", "monoarthritis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Kelley's Rheumatology"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Acute Gout", "Crystal Arthropathy", "Monoarthritis"],
    points: 10
  },
  {
    question: "A 40-year-old woman presents with progressive muscle weakness, difficulty climbing stairs, and a heliotrope rash around her eyes. Laboratory studies show elevated CK and aldolase. EMG shows myopathic changes. What is the most likely diagnosis?",
    options: [
      "Polymyositis",
      "Dermatomyositis", 
      "Inclusion body myositis",
      "Muscular dystrophy"
    ],
    correctAnswer: 1,
    explanation: "Dermatomyositis presents with proximal muscle weakness (difficulty climbing stairs, rising from chairs) plus characteristic skin manifestations including heliotrope rash (purple discoloration around eyes), Gottron's papules (over knuckles), and shawl sign. Elevated muscle enzymes (CK, aldolase, LDH) and myopathic EMG changes support the diagnosis. It's associated with increased malignancy risk, especially in adults over 40.",
    category: "Rheumatology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["dermatomyositis", "heliotrope rash", "proximal muscle weakness", "myositis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Kelley's Rheumatology"],
    subject: "Rheumatology",
    system: "Musculoskeletal",
    topics: ["Dermatomyositis", "Inflammatory Myopathy", "Autoimmune Muscle Disease"],
    points: 15
  },
  {
    question: "A 55-year-old woman presents with progressive dyspnea and dry cough. Chest CT shows bilateral upper lobe fibrosis and hilar lymphadenopathy. Serum ACE level is elevated. Transbronchial biopsy shows non-caseating granulomas. What is the most likely diagnosis?",
    options: [
      "Idiopathic pulmonary fibrosis",
      "Sarcoidosis", 
      "Hypersensitivity pneumonitis",
      "Silicosis"
    ],
    correctAnswer: 1,
    explanation: "Sarcoidosis is a multisystem granulomatous disease that commonly affects the lungs. Bilateral hilar lymphadenopathy with upper lobe fibrosis is characteristic. Non-caseating granulomas on biopsy and elevated serum ACE support the diagnosis. It predominantly affects young adults, especially African Americans. Pulmonary sarcoidosis may resolve spontaneously or progress to pulmonary fibrosis requiring immunosuppression.",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["sarcoidosis", "bilateral hilar lymphadenopathy", "non-caseating granulomas", "ACE level"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Murray and Nadel's Respiratory Medicine"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["Sarcoidosis", "Interstitial Lung Disease", "Granulomatous Disease"],
    points: 15
  },
  {
    question: "A 30-year-old man presents with bloody diarrhea, abdominal cramping, and weight loss for 2 months. Colonoscopy shows continuous mucosal inflammation limited to the rectum and sigmoid colon with loss of haustral markings. What is the most likely diagnosis?",
    options: [
      "Crohn's disease",
      "Ulcerative colitis", 
      "Infectious colitis",
      "Ischemic colitis"
    ],
    correctAnswer: 1,
    explanation: "Ulcerative colitis is characterized by continuous mucosal inflammation starting from the rectum and extending proximally. The loss of haustral markings ('lead pipe' appearance) is characteristic of chronic UC. Unlike Crohn's disease, UC involves only the mucosa/submucosa, is continuous (not skip lesions), and starts in the rectum. Treatment includes aminosalicylates, immunosuppressants, and biologics for severe disease.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["ulcerative colitis", "IBD", "continuous inflammation", "lead pipe colon"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topics: ["Ulcerative Colitis", "Inflammatory Bowel Disease", "Chronic Diarrhea"],
    points: 15
  },
  {
    question: "A 65-year-old man with a history of hypertension and diabetes presents with chest pain and dyspnea. ECG shows new left bundle branch block. Troponin I is elevated. What is the most appropriate next step in management?",
    options: [
      "Stress testing",
      "Echocardiogram", 
      "Emergency cardiac catheterization",
      "CT angiography"
    ],
    correctAnswer: 2,
    explanation: "New left bundle branch block (LBBB) in the setting of chest pain and elevated troponin indicates ST-elevation myocardial infarction equivalent (STEMI equivalent). This requires emergency reperfusion therapy with primary percutaneous coronary intervention (PCI) within 90 minutes of presentation. New LBBB obscures ST changes on ECG but carries the same urgency as STEMI for reperfusion therapy.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["STEMI equivalent", "new LBBB", "primary PCI", "acute MI"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA STEMI Guidelines"],
    subject: "Cardiology",
    system: "Cardiovascular",
    topics: ["STEMI Equivalent", "Acute MI", "Emergency Cardiology"],
    points: 15
  },
  {
    question: "A 20-year-old woman presents with amenorrhea, galactorrhea, and visual field defects. MRI shows a large pituitary mass compressing the optic chiasm. Prolactin level is 250 ng/mL (normal <25). What visual field defect is most likely present?",
    options: [
      "Monocular visual loss",
      "Bitemporal hemianopsia", 
      "Homonymous hemianopsia",
      "Quadrantanopia"
    ],
    correctAnswer: 1,
    explanation: "Large pituitary adenomas (macroadenomas >10mm) can compress the optic chiasm, causing bitemporal hemianopsia. The optic chiasm is located directly above the pituitary gland, and compression affects the crossing nasal fibers from both eyes, resulting in loss of temporal visual fields bilaterally. This patient has a prolactinoma with mass effect requiring treatment with dopamine agonists or surgical decompression.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "anatomy", 
    tags: ["prolactinoma", "bitemporal hemianopsia", "optic chiasm compression", "pituitary adenoma"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Neurology",
    system: "Endocrine",
    topics: ["Pituitary Adenoma", "Visual Field Defects", "Mass Effect"],
    points: 15
  },
  {
    question: "A 45-year-old man presents with recurrent peptic ulcers and diarrhea. Fasting serum gastrin level is markedly elevated at 800 pg/mL (normal <100). Secretin stimulation test shows a paradoxical increase in gastrin levels. What is the most likely diagnosis?",
    options: [
      "H. pylori gastritis",
      "Zollinger-Ellison syndrome", 
      "Atrophic gastritis",
      "Peptic ulcer disease"
    ],
    correctAnswer: 1,
    explanation: "Zollinger-Ellison syndrome (ZES) is caused by gastrinomas that secrete excessive gastrin, leading to recurrent peptic ulcers and diarrhea from gastric acid hypersecretion. The secretin stimulation test is diagnostic: normal patients have decreased gastrin after secretin, but ZES patients have a paradoxical increase >200 pg/mL. Most gastrinomas are located in the pancreas or duodenum ('gastrinoma triangle'). Treatment includes proton pump inhibitors.",
    category: "Gastroenterology",
    difficulty: "hard",
    usmleCategory: "pathology", 
    tags: ["Zollinger-Ellison syndrome", "gastrinoma", "secretin stimulation test", "peptic ulcers"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topics: ["Zollinger-Ellison Syndrome", "Gastrinoma", "Neuroendocrine Tumors"],
    points: 20
  },
  {
    question: "A 35-year-old woman presents with fatigue, weight gain, and depression. Laboratory studies show TSH 0.8 mU/L (normal), free T4 0.7 ng/dL (low normal), and reverse T3 elevated. She has a history of chronic illness and recent hospitalization. What is the most likely diagnosis?",
    options: [
      "Primary hypothyroidism",
      "Euthyroid sick syndrome", 
      "Central hypothyroidism",
      "Subclinical hypothyroidism"
    ],
    correctAnswer: 1,
    explanation: "Euthyroid sick syndrome (non-thyroidal illness syndrome) occurs during acute or chronic illness. It's characterized by low/normal free T4, normal/low TSH, and elevated reverse T3. The body downregulates thyroid hormone as an adaptive response to illness. TSH remains normal or slightly low (unlike primary hypothyroidism). Treatment is supportive care of the underlying illness; thyroid hormone replacement is generally not indicated.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["euthyroid sick syndrome", "non-thyroidal illness", "reverse T3", "chronic illness"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Euthyroid Sick Syndrome", "Thyroid Function", "Critical Illness"],
    points: 15
  },
  {
    question: "A 50-year-old man presents with progressive weakness, particularly in his hands. Physical examination shows muscle atrophy, fasciculations, and both upper and lower motor neuron signs. EMG shows widespread denervation. Bulbar symptoms are absent. What is the most likely diagnosis?",
    options: [
      "Multiple sclerosis",
      "Amyotrophic lateral sclerosis", 
      "Spinal muscular atrophy",
      "Primary lateral sclerosis"
    ],
    correctAnswer: 1,
    explanation: "Amyotrophic lateral sclerosis (ALS) presents with progressive weakness, muscle atrophy, fasciculations, and both upper motor neuron signs (spasticity, hyperreflexia) and lower motor neuron signs (weakness, atrophy, fasciculations). EMG shows widespread denervation. ALS can present with limb onset (as in this case) or bulbar onset. It's a fatal neurodegenerative disease with median survival of 3-5 years from symptom onset.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["ALS", "motor neuron disease", "upper and lower motor neuron signs", "fasciculations"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology",
    system: "Nervous",
    topics: ["Amyotrophic Lateral Sclerosis", "Motor Neuron Disease", "Progressive Weakness"],
    points: 15
  },
  {
    question: "A 25-year-old woman presents with recurrent miscarriages in the second trimester. She has a history of deep vein thrombosis and a characteristic facial rash. Laboratory studies show prolonged PTT that doesn't correct with mixing studies and positive anticardiolipin antibodies. What is the most likely diagnosis?",
    options: [
      "Systemic lupus erythematosus",
      "Antiphospholipid syndrome", 
      "Factor V Leiden deficiency",
      "Protein C deficiency"
    ],
    correctAnswer: 1,
    explanation: "Antiphospholipid syndrome (APS) is characterized by recurrent pregnancy losses (especially second trimester), arterial/venous thrombosis, and positive antiphospholipid antibodies (anticardiolipin, anti-β2 glycoprotein I, lupus anticoagulant). The lupus anticoagulant prolongs PTT in vitro but causes thrombosis in vivo. APS can be primary or secondary to SLE. Treatment includes anticoagulation and low-dose aspirin during pregnancy.",
    category: "Rheumatology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["antiphospholipid syndrome", "recurrent pregnancy loss", "lupus anticoagulant", "thrombosis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Kelley's Rheumatology"],
    subject: "Rheumatology",
    system: "Hematologic/Lymphatic",
    topics: ["Antiphospholipid Syndrome", "Thrombophilia", "Recurrent Pregnancy Loss"],
    points: 15
  }
];

// USMLE Category Classifications
export const usmleCategories = {
  // USMLE Step 1 Categories
  anatomy: "Anatomy",
  behavioral_sciences: "Behavioral Sciences", 
  biochemistry: "Biochemistry",
  microbiology: "Microbiology",
  pathology: "Pathology",
  pharmacology: "Pharmacology",
  physiology: "Physiology",
  immunology: "Immunology",
  genetics: "Genetics",
  
  // USMLE Step 2 Categories  
  internal_medicine: "Internal Medicine",
  surgery: "Surgery",
  pediatrics: "Pediatrics",
  obstetrics_gynecology: "Obstetrics & Gynecology",
  psychiatry: "Psychiatry",
  family_medicine: "Family Medicine",
  emergency_medicine: "Emergency Medicine",
  preventive_medicine: "Preventive Medicine"
};

// Medical Subject Categories (Primary Subjects)
export const medicalSubjects = {
  internal_medicine: "Internal Medicine",
  surgery: "Surgery", 
  pediatrics: "Pediatrics",
  obstetrics_gynecology: "Obstetrics & Gynecology",
  psychiatry: "Psychiatry",
  emergency_medicine: "Emergency Medicine",
  family_medicine: "Family Medicine",
  pathology: "Pathology",
  radiology: "Radiology",
  anesthesiology: "Anesthesiology"
};

// Body System Categories
export const bodySystems = {
  cardiovascular: "Cardiovascular",
  respiratory: "Respiratory", 
  gastrointestinal: "Gastrointestinal",
  genitourinary: "Genitourinary",
  nervous: "Nervous System",
  endocrine: "Endocrine",
  musculoskeletal: "Musculoskeletal",
  integumentary: "Integumentary",
  hematologic: "Hematologic",
  immune: "Immune System",
  reproductive: "Reproductive"
};

// Topics by System (Sub-categories)
export const systemTopics = {
  cardiovascular: ["Myocardial Infarction", "Heart Failure", "Arrhythmias", "Hypertension", "ECG Interpretation", "Valvular Disease"],
  respiratory: ["Pneumonia", "COPD", "Asthma", "Lung Cancer", "Pulmonary Embolism", "Pleural Disease"],
  gastrointestinal: ["IBD", "GERD", "Liver Disease", "Pancreatitis", "GI Bleeding", "Bowel Obstruction"],
  genitourinary: ["AKI", "CKD", "UTI", "Nephrolithiasis", "Glomerulonephritis", "Urological Cancer"],
  nervous: ["Stroke", "Epilepsy", "Dementia", "Movement Disorders", "Neuromuscular", "CNS Infections"],
  endocrine: ["Diabetes", "Thyroid Disorders", "Adrenal Disorders", "Pituitary Disorders", "Bone/Mineral", "Reproductive Hormones"],
  musculoskeletal: ["Fractures", "Arthritis", "Sports Injuries", "Bone Tumors", "Connective Tissue", "Spine Disorders"],
  integumentary: ["Skin Cancer", "Dermatitis", "Infections", "Autoimmune Skin", "Pediatric Dermatology", "Dermatopathology"],
  hematologic: ["Anemia", "Bleeding Disorders", "Thrombosis", "Hematologic Malignancies", "Transfusion Medicine", "Bone Marrow Disorders"],
  immune: ["Immunodeficiency", "Hypersensitivity", "Autoimmune Diseases", "Transplant Medicine", "Immunotherapy", "Vaccination"]
};

// Medical Specialty Categories (for backward compatibility)
export const medicalSpecialties = {
  cardiovascular: "Cardiovascular",
  endocrine: "Endocrine", 
  infectious_disease: "Infectious Disease",
  pulmonary: "Pulmonary",
  neurology: "Neurology", 
  ophthalmology: "Ophthalmology",
  obstetrics_gynecology: "Obstetrics/Gynecology",
  surgery: "Surgery",
  psychiatry: "Psychiatry",
  dermatology: "Dermatology",
  emergency_medicine: "Emergency Medicine", 
  orthopedics: "Orthopedics",
  pediatrics: "Pediatrics",
  urology: "Urology",
  radiology: "Radiology",
  gastroenterology: "Gastroenterology",
  rheumatology: "Rheumatology",
  hematology_oncology: "Hematology/Oncology"
};

// Points system based on difficulty
export const difficultyPoints = {
  easy: 10,
  medium: 15,  
  hard: 20
};

// Helper function to auto-categorize questions based on their category
export function getQuestionCategorization(category: string, difficulty: 'easy' | 'medium' | 'hard') {
  const categoryMap: Record<string, {subject: string, system: string, topics: string[]}> = {
    'Cardiovascular': {
      subject: 'Internal Medicine',
      system: 'Cardiovascular', 
      topics: ['Myocardial Infarction', 'Heart Disease']
    },
    'Endocrine': {
      subject: 'Internal Medicine',
      system: 'Endocrine',
      topics: ['Thyroid Disorders', 'Hormone Disorders']
    },
    'Infectious Disease': {
      subject: 'Internal Medicine', 
      system: 'Immune System',
      topics: ['Bacterial Infections', 'CNS Infections']
    },
    'Pulmonary': {
      subject: 'Internal Medicine',
      system: 'Respiratory',
      topics: ['Lung Disease', 'Pulmonary Pathology']
    },
    'Neurology': {
      subject: 'Internal Medicine',
      system: 'Nervous System', 
      topics: ['Neuromuscular', 'Dementia']
    },
    'Ophthalmology': {
      subject: 'Surgery',
      system: 'Nervous System',
      topics: ['Eye Disorders', 'Retinal Disease']
    },
    'Obstetrics/Gynecology': {
      subject: 'Obstetrics & Gynecology',
      system: 'Reproductive',
      topics: ['Pregnancy Complications', 'Maternal Health']
    },
    'Surgery': {
      subject: 'Surgery',
      system: 'Gastrointestinal', 
      topics: ['Surgical Emergencies', 'Abdominal Pain']
    },
    'Psychiatry': {
      subject: 'Psychiatry',
      system: 'Nervous System',
      topics: ['Psychotic Disorders', 'Mental Health']
    },
    'Dermatology': {
      subject: 'Internal Medicine',
      system: 'Integumentary',
      topics: ['Skin Cancer', 'Dermatitis']
    },
    'Emergency Medicine': {
      subject: 'Emergency Medicine',
      system: 'Multiple Systems',
      topics: ['Trauma', 'Emergency Care']
    },
    'Orthopedics': {
      subject: 'Surgery',
      system: 'Musculoskeletal',
      topics: ['Fractures', 'Sports Injuries']
    },
    'Pediatrics': {
      subject: 'Pediatrics',
      system: 'Multiple Systems',
      topics: ['Pediatric Emergencies', 'Child Development']
    },
    'Urology': {
      subject: 'Surgery',
      system: 'Genitourinary',
      topics: ['Urological Disorders', 'Kidney Stones']
    }
  };
  
  const defaults = {
    subject: 'Internal Medicine',
    system: 'Multiple Systems', 
    topics: ['General Medicine']
  };
  
  const categorization = categoryMap[category] || defaults;
  return {
    ...categorization,
    points: difficultyPoints[difficulty]
  };
}

// Helper function to get questions by category
export function getQuestionsByCategory(category: string): QuestionData[] {
  return processedSampleQuestions.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

// Helper function to get questions by subject
export function getQuestionsBySubject(subject: string): QuestionData[] {
  return processedSampleQuestions.filter(q => 
    q.subject && q.subject.toLowerCase() === subject.toLowerCase()
  );
}

// Helper function to get questions by system
export function getQuestionsBySystem(system: string): QuestionData[] {
  return processedSampleQuestions.filter(q => 
    q.system && q.system.toLowerCase() === system.toLowerCase()
  );
}

// Helper function to get questions by topic
export function getQuestionsByTopic(topic: string): QuestionData[] {
  return processedSampleQuestions.filter(q => 
    q.topics && q.topics.some(t => t.toLowerCase() === topic.toLowerCase())
  );
}

// Helper function to get questions with filters
export function getFilteredQuestions(filters: {
  subjects?: string[];
  systems?: string[];
  topics?: string[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  count?: number;
}): QuestionData[] {
  let filtered = processedSampleQuestions;
  
  if (filters.subjects && filters.subjects.length > 0) {
    filtered = filtered.filter(q => 
      q.subject && filters.subjects!.includes(q.subject)
    );
  }
  
  if (filters.systems && filters.systems.length > 0) {
    filtered = filtered.filter(q => 
      q.system && filters.systems!.includes(q.system)
    );
  }
  
  if (filters.topics && filters.topics.length > 0) {
    filtered = filtered.filter(q => 
      q.topics && q.topics.some(topic => filters.topics!.includes(topic))
    );
  }
  
  if (filters.difficulty && filters.difficulty.length > 0) {
    filtered = filtered.filter(q => filters.difficulty!.includes(q.difficulty));
  }
  
  // Shuffle the results
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  
  return filters.count ? shuffled.slice(0, filters.count) : shuffled;
}

// Helper function to get questions by difficulty
export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): QuestionData[] {
  return processedSampleQuestions.filter(q => q.difficulty === difficulty);
}

// Helper function to get random questions
export function getRandomQuestions(count: number): QuestionData[] {
  const shuffled = [...processedSampleQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Auto-populate missing fields in sample questions
const processedQuestions = sampleQuestions.map(q => {
  if (!q.subject || !q.system || !q.topics || !q.points) {
    const categorization = getQuestionCategorization(q.category, q.difficulty);
    return {
      ...q,
      subject: q.subject || categorization.subject,
      system: q.system || categorization.system,
      topics: q.topics || categorization.topics,
      points: q.points || categorization.points
    };
  }
  return q;
});

// Export the processed questions (replaces the original export)
export const processedSampleQuestions = processedQuestions;

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