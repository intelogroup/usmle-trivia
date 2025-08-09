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
  },

  // Additional 100 USMLE Questions (Questions 151-250)
  {
    question: "A 42-year-old man presents with severe epigastric pain radiating to his back, nausea, and vomiting. He has a history of heavy alcohol use. Serum lipase is 950 U/L (normal <60). CT scan shows pancreatic inflammation and peripancreatic fluid collection. What is the most appropriate initial management?",
    options: [
      "Immediate surgical intervention",
      "NPO, IV fluids, and pain control",
      "Antibiotics and antifungal therapy", 
      "Endoscopic sphincterotomy"
    ],
    correctAnswer: 1,
    explanation: "Acute pancreatitis management focuses on supportive care: NPO (bowel rest), aggressive IV fluid resuscitation, and adequate pain control. Most cases are self-limited and resolve with conservative management. Surgery is reserved for complications like infected necrosis or persistent organ failure. Antibiotics are not routinely used unless there's evidence of infection.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["acute pancreatitis", "alcohol", "supportive care", "NPO"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Acute Pancreatitis", "Alcohol-Related Disease", "Emergency Management"],
    points: 15
  },
  {
    question: "A 65-year-old woman presents with progressive memory loss, difficulty with word-finding, and getting lost in familiar places. Mini-Mental State Exam score is 18/30. MRI shows generalized cerebral atrophy with hippocampal atrophy. CSF shows elevated tau and decreased Aβ42. What is the most likely diagnosis?",
    options: [
      "Vascular dementia",
      "Alzheimer's disease",
      "Lewy body dementia", 
      "Frontotemporal dementia"
    ],
    correctAnswer: 1,
    explanation: "Alzheimer's disease presents with progressive memory loss, language difficulties, and visuospatial problems. The hippocampal atrophy on MRI and CSF biomarkers (elevated tau, decreased Aβ42) are characteristic. These biomarkers reflect neuronal injury (tau) and amyloid pathology (Aβ42). The combination of clinical presentation, imaging, and CSF findings strongly suggests Alzheimer's disease.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["Alzheimer disease", "dementia", "CSF biomarkers", "hippocampal atrophy"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology", 
    system: "Nervous",
    topics: ["Alzheimer Disease", "Dementia", "Cognitive Disorders"],
    points: 15
  },
  {
    question: "A 30-year-old pregnant woman at 28 weeks gestation presents with fever, dysuria, and flank pain. Urinalysis shows >100 WBC/hpf and nitrites. Blood pressure is normal. What is the most appropriate antibiotic treatment?",
    options: [
      "Trimethoprim-sulfamethoxazole",
      "Cephalexin", 
      "Ciprofloxacin",
      "Doxycycline"
    ],
    correctAnswer: 1,
    explanation: "Pyelonephritis in pregnancy requires safe and effective antibiotics. Cephalexin (cephalosporin) is pregnancy category B and has excellent gram-negative coverage for E. coli. TMP-SMX is avoided in pregnancy due to folate antagonism. Fluoroquinolones and tetracyclines are contraindicated in pregnancy due to potential fetal toxicity (cartilage and bone development issues).",
    category: "Obstetrics/Gynecology",
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["pyelonephritis", "pregnancy", "cephalexin", "antibiotic safety"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Williams Obstetrics"],
    subject: "Obstetrics/Gynecology", 
    system: "Genitourinary",
    topics: ["UTI in Pregnancy", "Antibiotic Safety", "Maternal-Fetal Medicine"],
    points: 15
  },
  {
    question: "A 50-year-old man presents with crushing chest pain, diaphoresis, and nausea. ECG shows ST-elevation in leads V1-V4. He receives primary PCI within 90 minutes. Which medication should be started immediately and continued long-term for secondary prevention?",
    options: [
      "Metoprolol",
      "Aspirin",
      "Atorvastatin", 
      "Lisinopril"
    ],
    correctAnswer: 1,
    explanation: "Aspirin is the most important medication for secondary prevention after STEMI. It should be given immediately (chewed for rapid absorption) and continued indefinitely. Aspirin reduces mortality, reinfarction, and stroke. While beta-blockers, ACE inhibitors, and statins are also important for secondary prevention, aspirin is the cornerstone therapy with the strongest evidence for immediate and long-term benefit.",
    category: "Cardiovascular",
    difficulty: "easy",
    usmleCategory: "pharmacology", 
    tags: ["STEMI", "aspirin", "secondary prevention", "antiplatelet"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA STEMI Guidelines"],
    subject: "Cardiology",
    system: "Cardiovascular",
    topics: ["STEMI Management", "Secondary Prevention", "Antiplatelet Therapy"],
    points: 10
  },
  {
    question: "A 25-year-old woman presents with fatigue, palpitations, and pale conjunctiva. Laboratory studies show Hgb 7.8 g/dL, MCV 68 fL, ferritin 8 ng/mL, and TIBC 450 μg/dL (elevated). She reports heavy menstrual periods. What is the most likely diagnosis?",
    options: [
      "Thalassemia minor",
      "Iron deficiency anemia",
      "Anemia of chronic disease", 
      "Sideroblastic anemia"
    ],
    correctAnswer: 1,
    explanation: "Iron deficiency anemia presents with microcytic anemia (low MCV), low ferritin (depleted iron stores), and high TIBC (increased transferrin production). Heavy menstrual periods are a common cause in reproductive-age women. Thalassemia minor would have normal ferritin and TIBC. Anemia of chronic disease typically has low or normal TIBC and normal/elevated ferritin.",
    category: "Hematology/Oncology",
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["iron deficiency anemia", "microcytic anemia", "menorrhagia", "ferritin"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Wintrobe's Hematology"],
    subject: "Internal Medicine", 
    system: "Hematologic/Lymphatic",
    topics: ["Iron Deficiency Anemia", "Microcytic Anemia", "Menstrual Disorders"],
    points: 10
  },
  {
    question: "A 60-year-old man with diabetes and hypertension presents with gradual onset bilateral lower extremity swelling and foamy urine. Urinalysis shows 4+ proteinuria. 24-hour urine protein is 4.5 g (normal <150 mg). Serum albumin is 2.8 g/dL. What is the most likely diagnosis?",
    options: [
      "Acute glomerulonephritis",
      "Nephrotic syndrome", 
      "Nephritic syndrome",
      "Acute tubular necrosis"
    ],
    correctAnswer: 1,
    explanation: "Nephrotic syndrome is characterized by heavy proteinuria (>3.5 g/day), hypoalbuminemia (<3.5 g/dL), edema, and often hyperlipidemia. In adults with diabetes, diabetic nephropathy is the most common cause. The gradual onset, massive proteinuria, and associated diabetes strongly suggest nephrotic syndrome. Nephritic syndrome typically presents with hematuria, hypertension, and less severe proteinuria.",
    category: "Nephrology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["nephrotic syndrome", "proteinuria", "diabetic nephropathy", "edema"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Brenner's The Kidney"],
    subject: "Internal Medicine",
    system: "Genitourinary", 
    topics: ["Nephrotic Syndrome", "Diabetic Nephropathy", "Proteinuria"],
    points: 15
  },
  {
    question: "A 35-year-old woman presents with recurrent episodes of palpitations, sweating, and feeling of impending doom lasting 5-10 minutes. Episodes occur unpredictably and cause significant distress. Physical examination and ECG are normal. What is the most likely diagnosis?",
    options: [
      "Generalized anxiety disorder",
      "Panic disorder", 
      "Hyperthyroidism",
      "Pheochromocytoma"
    ],
    correctAnswer: 1,
    explanation: "Panic disorder is characterized by recurrent, unexpected panic attacks lasting minutes with physical symptoms (palpitations, sweating, trembling) and psychological symptoms (fear of dying, losing control). The episodic nature, brief duration, and normal physical examination distinguish it from medical causes like hyperthyroidism or pheochromocytoma. Generalized anxiety disorder involves persistent worry rather than discrete episodes.",
    category: "Psychiatry",
    difficulty: "medium", 
    usmleCategory: "pathology",
    tags: ["panic disorder", "panic attacks", "anxiety", "palpitations"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "DSM-5-TR"],
    subject: "Psychiatry",
    system: "Nervous",
    topics: ["Panic Disorder", "Anxiety Disorders", "Psychiatric Emergency"],
    points: 15
  },
  {
    question: "A 70-year-old man presents with worsening shortness of breath and bilateral lower extremity edema. Chest X-ray shows cardiomegaly and pulmonary vascular congestion. Echocardiogram shows EF 60% with left atrial enlargement and thick left ventricular walls. What is the most likely diagnosis?",
    options: [
      "Systolic heart failure",
      "Diastolic heart failure", 
      "Restrictive cardiomyopathy",
      "Hypertrophic cardiomyopathy"
    ],
    correctAnswer: 1,
    explanation: "Heart failure with preserved ejection fraction (HFpEF or diastolic heart failure) presents with heart failure symptoms but normal EF (>50%). The thick LV walls suggest hypertensive heart disease with diastolic dysfunction. The left atrium enlarges due to elevated filling pressures. This is increasingly common in elderly patients with hypertension, diabetes, and obesity.",
    category: "Cardiovascular",
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["diastolic heart failure", "HFpEF", "preserved ejection fraction", "hypertensive heart disease"], 
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA Heart Failure Guidelines"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Heart Failure with Preserved EF", "Diastolic Dysfunction", "Hypertensive Heart Disease"],
    points: 15
  },
  {
    question: "A 45-year-old woman presents with morning stiffness lasting 3 hours, symmetric joint pain in hands and wrists, and fatigue for 8 months. Physical exam shows synovial swelling in MCPs and PIPs. Rheumatoid factor and anti-CCP antibodies are positive. What is the most appropriate initial treatment?",
    options: [
      "NSAIDs only",
      "Corticosteroids", 
      "Methotrexate",
      "Biologics"
    ],
    correctAnswer: 2,
    explanation: "Early rheumatoid arthritis requires prompt initiation of disease-modifying antirheumatic drugs (DMARDs) to prevent joint destruction. Methotrexate is the first-line DMARD for RA due to its efficacy, safety profile, and cost-effectiveness. Early treatment (within 3 months of symptom onset) improves long-term outcomes. NSAIDs alone are insufficient to prevent joint damage.",
    category: "Rheumatology", 
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["rheumatoid arthritis", "methotrexate", "DMARD", "early treatment"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "ACR RA Guidelines"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Rheumatoid Arthritis", "DMARD Therapy", "Early Intervention"],
    points: 15
  },
  {
    question: "A 28-year-old man presents with acute onset severe headache described as 'the worst headache of my life.' He is alert but photophobic. CT scan of the head is normal. What is the most appropriate next step?",
    options: [
      "MRI of the brain",
      "Lumbar puncture", 
      "Start migraine treatment",
      "Discharge with analgesics"
    ],
    correctAnswer: 1,
    explanation: "Sudden onset severe headache ('thunderclap' headache) raises suspicion for subarachnoid hemorrhage (SAH). When CT is normal within 12 hours, lumbar puncture is indicated to detect blood products (RBCs) or xanthochromia (bilirubin from RBC breakdown). SAH can be rapidly fatal, so prompt diagnosis is crucial. A normal CT doesn't rule out SAH, especially in the first 12 hours.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["subarachnoid hemorrhage", "thunderclap headache", "lumbar puncture", "xanthochromia"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Emergency Medicine",
    system: "Nervous",
    topics: ["Subarachnoid Hemorrhage", "Thunderclap Headache", "Neurologic Emergency"],
    points: 15
  },
  {
    question: "A 55-year-old woman with osteoporosis takes alendronate weekly. She develops chest pain and difficulty swallowing after taking her medication. Barium swallow shows esophageal ulceration. What is the most likely cause?",
    options: [
      "Gastroesophageal reflux disease",
      "Bisphosphonate-induced esophagitis", 
      "Infectious esophagitis",
      "Eosinophilic esophagitis"
    ],
    correctAnswer: 1,
    explanation: "Bisphosphonates (alendronate, risedronate, ibandronate) can cause severe esophagitis and esophageal ulceration. Patients must take these medications with a full glass of water, remain upright for 30-60 minutes, and take them on an empty stomach. The temporal relationship between medication administration and symptoms, along with the endoscopic findings, confirms bisphosphonate-induced esophagitis.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["bisphosphonate", "esophagitis", "alendronate", "drug-induced"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"], 
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Drug-Induced Esophagitis", "Bisphosphonate Side Effects", "Osteoporosis Treatment"],
    points: 15
  },
  {
    question: "A 40-year-old man presents with fatigue, weakness, and darkening of skin, especially in skin creases and knuckles. He has lost 15 pounds over 3 months. Laboratory studies show glucose 250 mg/dL and elevated HbA1c. What is the most likely underlying condition?",
    options: [
      "Type 2 diabetes mellitus",
      "Pancreatic adenocarcinoma", 
      "Cushing's syndrome",
      "Hemochromatosis"
    ],
    correctAnswer: 1,
    explanation: "New-onset diabetes in a middle-aged adult with weight loss and acanthosis nigricans (darkened, velvety skin) should raise suspicion for pancreatic cancer. Pancreatic adenocarcinoma can cause diabetes by destroying insulin-producing beta cells. The combination of new diabetes, weight loss, and acanthosis nigricans in this age group warrants investigation for malignancy.",
    category: "Hematology/Oncology",
    difficulty: "hard",
    usmleCategory: "pathology", 
    tags: ["pancreatic cancer", "new onset diabetes", "acanthosis nigricans", "weight loss"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "DeVita's Cancer"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Pancreatic Adenocarcinoma", "Secondary Diabetes", "Paraneoplastic Syndromes"],
    points: 20
  },
  {
    question: "A 22-year-old woman presents with amenorrhea for 6 months, galactorrhea, and visual field defects. Pregnancy test is negative. Serum prolactin is 180 ng/mL (normal <25). MRI shows a 12mm pituitary mass. What is the most appropriate treatment?",
    options: [
      "Bromocriptine",
      "Cabergoline", 
      "Transsphenoidal surgery",
      "Radiation therapy"
    ],
    correctAnswer: 1,
    explanation: "Prolactinoma is treated with dopamine agonists as first-line therapy. Cabergoline is preferred over bromocriptine due to better efficacy, tolerability, and twice-weekly dosing (versus daily for bromocriptine). Even large prolactinomas typically respond well to medical therapy with tumor shrinkage and normalization of prolactin levels. Surgery is reserved for medication-resistant cases or acute visual field defects.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pharmacology", 
    tags: ["prolactinoma", "cabergoline", "dopamine agonist", "hyperprolactinemia"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Prolactinoma", "Dopamine Agonist Therapy", "Pituitary Disorders"],
    points: 15
  },
  {
    question: "A 65-year-old man with COPD presents with acute worsening dyspnea, increased sputum production, and sputum purulence. Temperature is 38.2°C. Chest X-ray shows no infiltrates. Arterial blood gas shows pH 7.35, PCO2 50 mmHg, PO2 65 mmHg. What is the most appropriate treatment?",
    options: [
      "Antibiotics and corticosteroids",
      "Bronchodilators only", 
      "Mechanical ventilation",
      "Chest physiotherapy"
    ],
    correctAnswer: 0,
    explanation: "COPD exacerbation with increased dyspnea, sputum volume, and purulence (Anthonisen criteria) requires both antibiotics and systemic corticosteroids. Antibiotics target bacterial pathogens (H. influenzae, S. pneumoniae, M. catarrhalis), while corticosteroids reduce airway inflammation. This combination reduces treatment failure, speeds recovery, and may prevent hospitalization.",
    category: "Pulmonology", 
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["COPD exacerbation", "antibiotics", "corticosteroids", "Anthonisen criteria"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "GOLD COPD Guidelines"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["COPD Exacerbation", "Combination Therapy", "Respiratory Infection"],
    points: 15
  },
  {
    question: "A 30-year-old woman presents with fatigue, hair loss, constipation, and cold intolerance. TSH is 12 mU/L (normal 0.5-5.0), free T4 is 0.8 ng/dL (normal 1.0-2.3). Anti-TPO antibodies are positive. What is the most appropriate initial treatment?",
    options: [
      "Methimazole",
      "Levothyroxine", 
      "Liothyronine (T3)",
      "Propylthiouracil"
    ],
    correctAnswer: 1,
    explanation: "Primary hypothyroidism (elevated TSH, low free T4) with positive anti-TPO antibodies indicates Hashimoto's thyroiditis. Levothyroxine is the treatment of choice for hypothyroidism. Starting dose is typically 1.6 mcg/kg/day in healthy adults, with dose adjustments based on TSH levels after 6-8 weeks. The goal is to normalize TSH levels.",
    category: "Endocrine",
    difficulty: "easy", 
    usmleCategory: "pharmacology",
    tags: ["hypothyroidism", "levothyroxine", "Hashimoto thyroiditis", "hormone replacement"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "ATA Hypothyroidism Guidelines"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Primary Hypothyroidism", "Levothyroxine Therapy", "Hashimoto Thyroiditis"],
    points: 10
  },
  {
    question: "A 45-year-old man presents with progressive dyspnea, dry cough, and clubbing of fingers. Chest CT shows bilateral lower lobe honeycombing and traction bronchiectasis. Pulmonary function tests show FVC 60% predicted, DLCO 45% predicted. What is the most likely diagnosis?",
    options: [
      "Chronic obstructive pulmonary disease",
      "Idiopathic pulmonary fibrosis", 
      "Hypersensitivity pneumonitis",
      "Sarcoidosis"
    ],
    correctAnswer: 1,
    explanation: "Idiopathic pulmonary fibrosis (IPF) typically presents in men >60 with progressive dyspnea, dry cough, and clubbing. The characteristic CT pattern shows lower lobe honeycombing with traction bronchiectasis. PFTs show restrictive pattern (low FVC) with reduced DLCO due to impaired gas exchange. IPF has a poor prognosis with median survival 3-5 years without treatment.",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["idiopathic pulmonary fibrosis", "honeycombing", "restrictive lung disease", "DLCO"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Murray and Nadel's Respiratory Medicine"],
    subject: "Internal Medicine",
    system: "Respiratory",
    topics: ["Idiopathic Pulmonary Fibrosis", "Interstitial Lung Disease", "Restrictive Physiology"],
    points: 15
  },
  {
    question: "A 35-year-old man presents with sudden onset severe back pain radiating to his groin. He is restless and cannot find a comfortable position. Urinalysis shows 2+ hematuria. CT scan shows a 4mm stone in the right ureter. What is the most appropriate initial management?",
    options: [
      "Immediate surgical removal",
      "Pain control and observation", 
      "Antibiotics and fluids",
      "Emergency lithotripsy"
    ],
    correctAnswer: 1,
    explanation: "Ureteral stones <5mm have a high likelihood of spontaneous passage (>90%). Initial management includes adequate pain control (NSAIDs are first-line for renal colic) and observation with alpha-blockers (tamsulosin) to facilitate passage. Surgical intervention is reserved for stones >5mm, infection, or persistent symptoms. Most small stones pass within 4 weeks.",
    category: "Urology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["nephrolithiasis", "renal colic", "conservative management", "spontaneous passage"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Campbell-Walsh Urology"],
    subject: "Urology",
    system: "Genitourinary",
    topics: ["Nephrolithiasis", "Renal Colic", "Conservative Management"],
    points: 15
  },
  {
    question: "A 28-year-old woman presents with palpitations, heat intolerance, and weight loss despite increased appetite. Physical examination shows fine tremor, warm moist skin, and diffuse goiter with bruit. TSH <0.01 mU/L, free T4 elevated. What is the most appropriate initial treatment?",
    options: [
      "Propranolol only",
      "Methimazole", 
      "Radioactive iodine",
      "Thyroidectomy"
    ],
    correctAnswer: 1,
    explanation: "Graves' disease in a young woman should be treated initially with antithyroid drugs. Methimazole is preferred over propylthiouracil due to once-daily dosing, lower hepatotoxicity risk, and better side effect profile. PTU is reserved for pregnancy, thyroid storm, or methimazole intolerance. Propranolol can be added for symptomatic relief but doesn't treat the underlying hyperthyroidism.",
    category: "Endocrine",
    difficulty: "medium",
    usmleCategory: "pharmacology", 
    tags: ["Graves disease", "hyperthyroidism", "methimazole", "antithyroid drugs"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "ATA Hyperthyroidism Guidelines"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Graves Disease", "Antithyroid Therapy", "Hyperthyroidism Management"],
    points: 15
  },
  {
    question: "A 60-year-old man with diabetes presents with a foot ulcer that has been present for 2 months. The ulcer is on the plantar surface, painless, and well-demarcated. Sensation is decreased bilaterally in a stocking distribution. What is the most important initial intervention?",
    options: [
      "Systemic antibiotics",
      "Offloading with total contact cast", 
      "Debridement",
      "Hyperbaric oxygen therapy"
    ],
    correctAnswer: 1,
    explanation: "Diabetic neuropathic foot ulcers require offloading as the primary intervention. Total contact casting is the gold standard for offloading plantar ulcers, reducing pressure and allowing healing. Without proper offloading, other interventions (antibiotics, debridement) are unlikely to succeed. The key is removing repetitive pressure from the neuropathic foot.",
    category: "Endocrine", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["diabetic foot ulcer", "offloading", "neuropathy", "total contact cast"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "ADA Diabetic Foot Guidelines"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Diabetic Foot Care", "Neuropathic Ulcers", "Wound Management"],
    points: 15
  },
  {
    question: "A 55-year-old woman presents with progressive fatigue, shortness of breath, and palpitations. Laboratory studies show Hgb 6.8 g/dL, MCV 105 fL, and LDH 850 U/L (elevated). Peripheral smear shows hypersegmented neutrophils. What is the most likely diagnosis?",
    options: [
      "Iron deficiency anemia",
      "Folate deficiency", 
      "Hypothyroidism",
      "Chronic kidney disease"
    ],
    correctAnswer: 1,
    explanation: "Macrocytic anemia (MCV >100) with hypersegmented neutrophils (>5 lobes) indicates megaloblastic anemia. Folate deficiency causes DNA synthesis impairment, leading to large, immature red cells and hypersegmented neutrophils. The elevated LDH reflects ineffective erythropoiesis. B12 deficiency would cause similar findings but might include neurologic symptoms.",
    category: "Hematology/Oncology",
    difficulty: "medium",
    usmleCategory: "pathology", 
    tags: ["folate deficiency", "megaloblastic anemia", "hypersegmented neutrophils", "macrocytic"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Wintrobe's Hematology"],
    subject: "Internal Medicine",
    system: "Hematologic/Lymphatic",
    topics: ["Megaloblastic Anemia", "Folate Deficiency", "Macrocytic Anemia"],
    points: 15
  },
  {
    question: "A 25-year-old man presents with acute onset shortness of breath and pleuritic chest pain after coughing. He is tall and thin. Physical examination shows decreased breath sounds on the right side. Chest X-ray shows a 30% pneumothorax. What is the most appropriate management?",
    options: [
      "Observation with oxygen",
      "Needle decompression", 
      "Chest tube insertion",
      "Surgical intervention"
    ],
    correctAnswer: 0,
    explanation: "Small spontaneous pneumothorax (<50% or <3cm gap between lung and chest wall) in a stable patient can be managed with observation and supplemental oxygen. Oxygen increases nitrogen reabsorption and accelerates pleural air reabsorption. Large pneumothorax (>50%) or hemodynamic instability would require chest tube insertion. This patient's 30% pneumothorax can be observed.",
    category: "Pulmonology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["spontaneous pneumothorax", "observation", "oxygen therapy", "conservative management"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Murray and Nadel's Respiratory Medicine"],
    subject: "Emergency Medicine",
    system: "Respiratory",
    topics: ["Spontaneous Pneumothorax", "Conservative Management", "Respiratory Emergency"],
    points: 15
  },
  {
    question: "A 70-year-old man presents with fatigue, bone pain, and confusion. Laboratory studies show calcium 12.5 mg/dL (normal 8.5-10.5), phosphate 2.1 mg/dL (low), and intact PTH 85 pg/mL (elevated). What is the most likely diagnosis?",
    options: [
      "Primary hyperparathyroidism",
      "Malignancy-related hypercalcemia", 
      "Sarcoidosis",
      "Milk-alkali syndrome"
    ],
    correctAnswer: 0,
    explanation: "Primary hyperparathyroidism presents with hypercalcemia, hypophosphatemia, and elevated or inappropriately normal PTH. The classic presentation includes 'stones, bones, groans, and psychiatric overtones' (kidney stones, bone disease, GI symptoms, neuropsychiatric symptoms). Most cases are due to parathyroid adenoma. Malignancy-related hypercalcemia would have suppressed PTH.",
    category: "Endocrine", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["primary hyperparathyroidism", "hypercalcemia", "PTH", "parathyroid adenoma"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Primary Hyperparathyroidism", "Hypercalcemia", "Parathyroid Disorders"],
    points: 15
  },
  {
    question: "A 42-year-old woman presents with fatigue, cold intolerance, and constipation. She has a history of postpartum thyroiditis 5 years ago. TSH is 15 mU/L, free T4 is 0.6 ng/dL, and anti-TPO antibodies are positive. What is the most appropriate treatment?",
    options: [
      "Observation and repeat labs in 6 months",
      "Levothyroxine therapy", 
      "Methimazole",
      "Radioactive iodine"
    ],
    correctAnswer: 1,
    explanation: "This patient has overt hypothyroidism (TSH >10 mU/L, low free T4) with positive anti-TPO antibodies, indicating chronic autoimmune thyroiditis (Hashimoto's). Treatment with levothyroxine is indicated for symptomatic hypothyroidism with TSH >10 mU/L. The goal is to normalize TSH levels and relieve symptoms. Prior postpartum thyroiditis may progress to permanent hypothyroidism.",
    category: "Endocrine",
    difficulty: "easy",
    usmleCategory: "pharmacology", 
    tags: ["overt hypothyroidism", "levothyroxine", "Hashimoto thyroiditis", "postpartum thyroiditis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "ATA Hypothyroidism Guidelines"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Overt Hypothyroidism", "Levothyroxine Therapy", "Postpartum Thyroiditis"],
    points: 10
  },
  {
    question: "A 35-year-old man presents with progressive dyspnea on exertion and fatigue. Echocardiogram shows ejection fraction of 25%, left ventricular dilation, and global hypokinesis. He has no history of coronary artery disease. What is the most likely diagnosis?",
    options: [
      "Ischemic cardiomyopathy",
      "Dilated cardiomyopathy", 
      "Hypertrophic cardiomyopathy",
      "Restrictive cardiomyopathy"
    ],
    correctAnswer: 1,
    explanation: "Dilated cardiomyopathy presents with systolic heart failure (reduced EF <40%), ventricular dilation, and global wall motion abnormalities in the absence of coronary disease. Causes include viral myocarditis, alcohol, chemotherapy, genetic mutations, and idiopathic. The young age and absence of coronary risk factors support non-ischemic dilated cardiomyopathy.",
    category: "Cardiovascular", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["dilated cardiomyopathy", "systolic heart failure", "reduced ejection fraction", "non-ischemic"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA Heart Failure Guidelines"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Dilated Cardiomyopathy", "Non-Ischemic Heart Failure", "Cardiomyopathy"],
    points: 15
  },
  {
    question: "A 25-year-old woman presents with fatigue, joint pain, and a facial rash that worsens with sun exposure. Laboratory studies show ANA 1:320 (speckled pattern), anti-dsDNA positive, and low complement levels. Urinalysis shows proteinuria and hematuria. What is the most likely diagnosis?",
    options: [
      "Drug-induced lupus",
      "Systemic lupus erythematosus", 
      "Mixed connective tissue disease",
      "Sjögren's syndrome"
    ],
    correctAnswer: 1,
    explanation: "Systemic lupus erythematosus (SLE) is diagnosed based on clinical features (malar rash, photosensitivity, joint pain) and laboratory findings (positive ANA, anti-dsDNA, low complement). The presence of nephritis (proteinuria, hematuria) indicates lupus nephritis, a serious manifestation requiring immunosuppressive therapy. Anti-dsDNA is highly specific for SLE and correlates with disease activity.",
    category: "Rheumatology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["systemic lupus erythematosus", "SLE", "anti-dsDNA", "lupus nephritis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Kelley's Rheumatology"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Systemic Lupus Erythematosus", "Autoimmune Disease", "Lupus Nephritis"],
    points: 15
  },
  {
    question: "A 65-year-old man presents with progressive difficulty swallowing solids but not liquids. He has lost 20 pounds over 4 months. Upper endoscopy shows an irregular, ulcerated mass in the distal esophagus. Biopsy confirms adenocarcinoma. What is the most significant risk factor for this condition?",
    options: [
      "Smoking",
      "Barrett's esophagus", 
      "Achalasia",
      "Alcohol use"
    ],
    correctAnswer: 1,
    explanation: "Esophageal adenocarcinoma is strongly associated with Barrett's esophagus (intestinal metaplasia of the esophageal mucosa), which results from chronic gastroesophageal reflux. The distal location and adenocarcinoma histology are characteristic. Barrett's esophagus increases cancer risk 30-125 fold. Smoking and alcohol are risk factors for squamous cell carcinoma of the esophagus, typically in the mid-esophagus.",
    category: "Gastroenterology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["esophageal adenocarcinoma", "Barrett esophagus", "GERD", "dysplasia"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Gastroenterology",
    system: "Gastrointestinal",
    topics: ["Esophageal Adenocarcinoma", "Barrett Esophagus", "GI Malignancy"],
    points: 15
  },
  {
    question: "A 40-year-old woman presents with episodes of severe abdominal pain, nausea, and vomiting. CT scan shows multiple gallstones with common bile duct dilation to 12mm (normal <6mm). Total bilirubin is 4.8 mg/dL (elevated). What is the most likely diagnosis?",
    options: [
      "Acute cholecystitis",
      "Choledocholithiasis", 
      "Cholangitis",
      "Gallstone pancreatitis"
    ],
    correctAnswer: 1,
    explanation: "Choledocholithiasis (stones in the common bile duct) presents with biliary colic, jaundice, and dilated bile duct on imaging. The combination of gallstones, CBD dilation >6mm, and elevated bilirubin strongly suggests CBD stones. This requires therapeutic ERCP with sphincterotomy and stone extraction, followed by cholecystectomy. Cholangitis would include fever and sepsis (Charcot's triad).",
    category: "Gastroenterology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["choledocholithiasis", "CBD stones", "biliary obstruction", "ERCP"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Surgery",
    system: "Gastrointestinal",
    topics: ["Choledocholithiasis", "Biliary Obstruction", "ERCP"],
    points: 15
  },
  {
    question: "A 50-year-old man with cirrhosis presents with confusion, asterixis, and elevated ammonia levels. He is currently taking lactulose. What additional medication should be added to his regimen?",
    options: [
      "Furosemide",
      "Rifaximin", 
      "Propranolol",
      "Spironolactone"
    ],
    correctAnswer: 1,
    explanation: "Hepatic encephalopathy treatment includes lactulose (reduces ammonia absorption) and rifaximin (non-absorbable antibiotic that reduces ammonia-producing bacteria). Rifaximin is particularly effective for preventing recurrent episodes of hepatic encephalopathy. The combination of lactulose and rifaximin is more effective than lactulose alone in reducing hospitalizations and improving quality of life.",
    category: "Gastroenterology", 
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["hepatic encephalopathy", "rifaximin", "ammonia", "cirrhosis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AASLD Hepatic Encephalopathy Guidelines"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Hepatic Encephalopathy", "Cirrhosis Complications", "Rifaximin"],
    points: 15
  },
  {
    question: "A 30-year-old woman presents with fatigue, weakness, and palpitations. Physical examination shows pale conjunctiva and spoon-shaped nails (koilonychia). Laboratory studies show Hgb 7.2 g/dL, MCV 62 fL, ferritin 8 ng/mL. What is the most appropriate next step?",
    options: [
      "Iron supplementation",
      "Investigate source of blood loss", 
      "Hemoglobin electrophoresis",
      "Bone marrow biopsy"
    ],
    correctAnswer: 1,
    explanation: "Iron deficiency anemia in adults requires investigation for the source of blood loss, even when iron supplementation is started. In premenopausal women, menstrual losses are common, but GI bleeding must be excluded. In men and postmenopausal women, GI evaluation is mandatory. The goal is to identify and treat the underlying cause while correcting the iron deficiency.",
    category: "Hematology/Oncology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["iron deficiency anemia", "blood loss", "koilonychia", "GI evaluation"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Wintrobe's Hematology"],
    subject: "Internal Medicine",
    system: "Hematologic/Lymphatic",
    topics: ["Iron Deficiency Anemia", "GI Blood Loss", "Anemia Workup"],
    points: 15
  },
  {
    question: "A 55-year-old man with diabetes and hypertension presents with chest pain and dyspnea. ECG shows ST-elevation in leads II, III, and aVF. He undergoes primary PCI of the right coronary artery. Which medication should be avoided in this patient?",
    options: [
      "Metoprolol",
      "Verapamil", 
      "Lisinopril",
      "Atorvastatin"
    ],
    correctAnswer: 1,
    explanation: "Inferior MI (RCA occlusion) can involve the right ventricle, making it dependent on preload. Non-dihydropyridine calcium channel blockers (verapamil, diltiazem) have negative inotropic effects and can cause hypotension and heart failure in inferior MI. Beta-blockers, ACE inhibitors, and statins are beneficial post-MI therapies. Verapamil should be avoided in acute MI due to its negative inotropic effects.",
    category: "Cardiovascular", 
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["inferior MI", "RCA", "verapamil", "negative inotrope"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA STEMI Guidelines"],
    subject: "Cardiology",
    system: "Cardiovascular",
    topics: ["Inferior MI", "Post-MI Management", "Drug Contraindications"],
    points: 15
  },
  {
    question: "A 35-year-old man presents with progressive muscle weakness, fasciculations, and difficulty speaking and swallowing. Physical examination shows both upper and lower motor neuron signs. EMG shows widespread denervation. What is the expected course of this disease?",
    options: [
      "Stable course with minimal progression",
      "Progressive deterioration over 2-5 years", 
      "Improvement with immunosuppressive therapy",
      "Episodic relapses with recovery"
    ],
    correctAnswer: 1,
    explanation: "Amyotrophic lateral sclerosis (ALS) is a progressive neurodegenerative disease affecting both upper and lower motor neurons. The median survival is 2-5 years from symptom onset, with death typically from respiratory failure. There is no effective treatment to halt progression, though riluzole may modestly slow disease progression. The combination of UMN and LMN signs with widespread denervation is characteristic of ALS.",
    category: "Neurology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["ALS", "motor neuron disease", "prognosis", "progressive"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology",
    system: "Nervous",
    topics: ["Amyotrophic Lateral Sclerosis", "Motor Neuron Disease", "Neurodegenerative Disease"],
    points: 15
  },
  {
    question: "A 28-year-old woman presents with recurrent episodes of palpitations, sweating, and anxiety lasting 5-10 minutes. She avoids crowded places due to fear of having episodes. Between episodes, she feels normal. What is the most appropriate treatment?",
    options: [
      "Alprazolam as needed",
      "Sertraline daily", 
      "Propranolol as needed",
      "Cognitive behavioral therapy only"
    ],
    correctAnswer: 1,
    explanation: "Panic disorder with agoraphobia (avoidance of situations where escape might be difficult) is best treated with selective serotonin reuptake inhibitors (SSRIs) like sertraline as first-line therapy. SSRIs reduce the frequency and severity of panic attacks and help with anticipatory anxiety. Benzodiazepines provide rapid relief but risk dependence and should generally be avoided for chronic treatment.",
    category: "Psychiatry", 
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["panic disorder", "agoraphobia", "SSRI", "sertraline"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "DSM-5-TR"],
    subject: "Psychiatry",
    system: "Nervous",
    topics: ["Panic Disorder", "SSRI Treatment", "Anxiety Disorders"],
    points: 15
  },
  {
    question: "A 60-year-old woman with rheumatoid arthritis on methotrexate presents with dry eyes, dry mouth, and dental caries. Schirmer test shows decreased tear production. Anti-Ro/SSA and anti-La/SSB antibodies are positive. What is the most likely diagnosis?",
    options: [
      "Drug-induced sicca syndrome",
      "Secondary Sjögren's syndrome", 
      "Primary Sjögren's syndrome",
      "Sarcoidosis"
    ],
    correctAnswer: 1,
    explanation: "Secondary Sjögren's syndrome occurs in patients with existing connective tissue diseases (RA, SLE, systemic sclerosis). The combination of sicca symptoms (dry eyes, dry mouth), positive anti-Ro/SSA and anti-La/SSB antibodies, and underlying RA is diagnostic. Primary Sjögren's occurs without other autoimmune diseases. The sicca syndrome can lead to increased dental caries and corneal damage.",
    category: "Rheumatology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["secondary Sjögren syndrome", "sicca syndrome", "anti-Ro", "anti-La"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Kelley's Rheumatology"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Secondary Sjögren Syndrome", "Autoimmune Disease", "Sicca Syndrome"],
    points: 15
  },
  {
    question: "A 45-year-old man presents with acute onset severe abdominal pain and bloody diarrhea. He recently started taking NSAIDs for back pain. Colonoscopy shows mucosal ulceration in the sigmoid colon. What is the most likely diagnosis?",
    options: [
      "Ulcerative colitis",
      "NSAID-induced colitis", 
      "Crohn's disease",
      "Infectious colitis"
    ],
    correctAnswer: 1,
    explanation: "NSAID-induced colitis typically affects the right colon and cecum but can involve any segment. NSAIDs reduce prostaglandin synthesis, leading to mucosal injury and ulceration. The temporal relationship between NSAID use and symptom onset is key. Treatment involves NSAID discontinuation and supportive care. The colitis usually resolves after stopping NSAIDs, unlike IBD which is chronic.",
    category: "Gastroenterology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["NSAID colitis", "drug-induced", "prostaglandin", "mucosal injury"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Drug-Induced Colitis", "NSAID Side Effects", "Colitis"],
    points: 15
  },
  {
    question: "A 30-year-old man presents with fatigue, abdominal pain, and bronze skin pigmentation. Laboratory studies show elevated serum iron, ferritin 1500 ng/mL, and transferrin saturation 85%. Liver biopsy shows iron deposition. What is the most likely diagnosis?",
    options: [
      "Alcoholic liver disease",
      "Hereditary hemochromatosis", 
      "Wilson's disease",
      "Secondary iron overload"
    ],
    correctAnswer: 1,
    explanation: "Hereditary hemochromatosis presents with iron overload causing fatigue, arthralgia, diabetes, cardiomyopathy, and bronze skin pigmentation ('bronze diabetes'). Laboratory findings include elevated iron indices (serum iron, ferritin, transferrin saturation >45%). Liver biopsy shows hepatic iron deposition. Most cases are due to HFE gene mutations (C282Y homozygous). Treatment is therapeutic phlebotomy.",
    category: "Gastroenterology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["hereditary hemochromatosis", "iron overload", "bronze diabetes", "HFE gene"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Sleisenger's Gastroenterology"],
    subject: "Internal Medicine",
    system: "Gastrointestinal",
    topics: ["Hereditary Hemochromatosis", "Iron Overload", "Genetic Liver Disease"],
    points: 15
  },
  {
    question: "A 25-year-old woman presents with amenorrhea for 8 months and galactorrhea. She is not pregnant and not breastfeeding. Prolactin level is 150 ng/mL (normal <25). MRI shows a 8mm pituitary mass. What is the classification of this lesion?",
    options: [
      "Microprolactinoma",
      "Macroprolactinoma", 
      "Prolactin-secreting adenoma",
      "Non-functioning pituitary adenoma"
    ],
    correctAnswer: 0,
    explanation: "Pituitary adenomas are classified by size: microadenomas (<10mm) and macroadenomas (≥10mm). This 8mm prolactin-secreting tumor is a microprolactinoma. Microprolactinomas are more common in women and often present with amenorrhea and galactorrhea. They respond well to dopamine agonist therapy and rarely require surgery unless medication-resistant.",
    category: "Endocrine", 
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["microprolactinoma", "prolactin", "amenorrhea", "galactorrhea"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Microprolactinoma", "Prolactin Disorders", "Pituitary Adenoma"],
    points: 10
  },
  {
    question: "A 65-year-old man with atrial fibrillation on warfarin presents with sudden onset left-sided weakness and aphasia. CT scan shows no hemorrhage. INR is 2.1. What is the most likely type of stroke?",
    options: [
      "Cardioembolic stroke",
      "Large vessel atherosclerotic stroke", 
      "Small vessel lacunar stroke",
      "Hemorrhagic stroke"
    ],
    correctAnswer: 0,
    explanation: "Atrial fibrillation is a major risk factor for cardioembolic stroke due to thrombus formation in the left atrial appendage. Despite therapeutic anticoagulation (INR 2-3), breakthrough strokes can occur. Cardioembolic strokes typically cause large cortical infarcts with prominent language and motor deficits. The combination of atrial fibrillation and acute aphasia/hemiparesis strongly suggests cardioembolism.",
    category: "Neurology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["cardioembolic stroke", "atrial fibrillation", "anticoagulation", "aphasia"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology",
    system: "Nervous",
    topics: ["Cardioembolic Stroke", "Atrial Fibrillation", "Stroke Subtypes"],
    points: 15
  },
  {
    question: "A 40-year-old woman presents with fatigue, weight gain, and cold intolerance. Physical examination shows delayed relaxation of deep tendon reflexes and non-pitting edema. TSH is 25 mU/L, free T4 is 0.5 ng/dL. What type of edema is most characteristic of this condition?",
    options: [
      "Pitting edema",
      "Myxedema", 
      "Lymphedema",
      "Lipedema"
    ],
    correctAnswer: 1,
    explanation: "Myxedema is the characteristic non-pitting edema of severe hypothyroidism. It results from accumulation of mucopolysaccharides (hyaluronic acid, chondroitin sulfate) in the interstitial space, causing a firm, non-pitting swelling typically in the face, hands, and feet. The delayed relaxation phase of reflexes is another classic sign of hypothyroidism due to slow muscle contraction and relaxation.",
    category: "Endocrine", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["severe hypothyroidism", "myxedema", "delayed reflexes", "mucopolysaccharides"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Harrison's Endocrinology"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Severe Hypothyroidism", "Myxedema", "Thyroid Disorders"],
    points: 15
  },
  {
    question: "A 55-year-old man presents with progressive dyspnea, orthopnea, and bilateral lower extremity edema. Chest X-ray shows cardiomegaly and Kerley B lines. BNP is 1800 pg/mL (elevated). Echocardiogram shows EF 30%. What is the most likely diagnosis?",
    options: [
      "Pulmonary embolism",
      "Systolic heart failure", 
      "Diastolic heart failure",
      "Pneumonia"
    ],
    correctAnswer: 1,
    explanation: "Systolic heart failure (HFrEF) is characterized by reduced ejection fraction (<40%), symptoms of volume overload (dyspnea, orthopnea, edema), and elevated BNP. Kerley B lines on chest X-ray indicate pulmonary edema. The combination of reduced EF, elevated BNP, and classic heart failure symptoms confirms systolic heart failure. Treatment includes ACE inhibitors, beta-blockers, and diuretics.",
    category: "Cardiovascular", 
    difficulty: "easy",
    usmleCategory: "pathology",
    tags: ["systolic heart failure", "reduced ejection fraction", "BNP", "Kerley B lines"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "AHA Heart Failure Guidelines"],
    subject: "Internal Medicine",
    system: "Cardiovascular",
    topics: ["Systolic Heart Failure", "Heart Failure Diagnosis", "BNP"],
    points: 10
  },
  {
    question: "A 30-year-old woman presents with recurrent episodes of severe unilateral headache with nausea, vomiting, and photophobia. Episodes last 6-24 hours and are preceded by visual aura with zigzag lines. What is the most appropriate acute treatment?",
    options: [
      "Acetaminophen",
      "Sumatriptan", 
      "Caffeine",
      "Prednisone"
    ],
    correctAnswer: 1,
    explanation: "Migraine with aura is treated acutely with triptans (sumatriptan, rizatriptan, etc.), which are 5-HT1B/1D receptor agonists that cause vasoconstriction and reduce neurogenic inflammation. Triptans are most effective when taken early in the attack. They are contraindicated in patients with cardiovascular disease due to coronary vasoconstriction. NSAIDs can also be effective but triptans are more specific.",
    category: "Neurology", 
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["migraine with aura", "sumatriptan", "triptan", "5-HT agonist"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Adams and Victor's Neurology"],
    subject: "Neurology",
    system: "Nervous",
    topics: ["Migraine with Aura", "Triptan Therapy", "Headache Management"],
    points: 15
  },
  {
    question: "A 45-year-old man presents with progressive dyspnea and fatigue. Physical examination shows elevated JVP, hepatomegaly, and peripheral edema. Echocardiogram shows normal EF but impaired ventricular filling. Cardiac catheterization shows equalization of diastolic pressures. What is the most likely diagnosis?",
    options: [
      "Dilated cardiomyopathy",
      "Constrictive pericarditis", 
      "Restrictive cardiomyopathy",
      "Cardiac tamponade"
    ],
    correctAnswer: 1,
    explanation: "Constrictive pericarditis presents with right heart failure symptoms (elevated JVP, hepatomegaly, edema), normal EF, and equalization of diastolic pressures in all four cardiac chambers on catheterization. The rigid pericardium prevents normal ventricular filling. CT or MRI may show pericardial thickening/calcification. Treatment is surgical pericardiectomy. Restrictive cardiomyopathy has similar hemodynamics but involves myocardial disease.",
    category: "Cardiovascular", 
    difficulty: "hard",
    usmleCategory: "pathology",
    tags: ["constrictive pericarditis", "equalization of pressures", "pericardial disease", "right heart failure"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Braunwald's Heart Disease"],
    subject: "Cardiology",
    system: "Cardiovascular",
    topics: ["Constrictive Pericarditis", "Pericardial Disease", "Heart Failure"],
    points: 20
  },
  {
    question: "A 50-year-old man with diabetes presents with a non-healing foot ulcer for 6 weeks. The ulcer probes to bone. X-ray shows osteolytic changes in adjacent bone. What is the most appropriate diagnostic test?",
    options: [
      "MRI of the foot",
      "Bone scan", 
      "Bone biopsy with culture",
      "Blood cultures"
    ],
    correctAnswer: 2,
    explanation: "Diabetic foot osteomyelitis with probe-to-bone test and radiographic changes requires bone biopsy for definitive diagnosis and culture-guided antibiotic therapy. Bone biopsy provides both histologic confirmation of osteomyelitis and microbiologic identification of causative organisms. MRI can assess extent but doesn't provide microbiology. Treatment requires 6-8 weeks of pathogen-specific antibiotics.",
    category: "Infectious Disease", 
    difficulty: "medium",
    usmleCategory: "microbiology",
    tags: ["diabetic foot osteomyelitis", "bone biopsy", "probe to bone", "culture-guided therapy"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Mandell's Infectious Diseases"],
    subject: "Internal Medicine",
    system: "Musculoskeletal",
    topics: ["Diabetic Foot Osteomyelitis", "Bone Biopsy", "Diabetic Complications"],
    points: 15
  },
  {
    question: "A 35-year-old woman presents with fatigue, hair loss, and weight gain. Laboratory studies show TSH 8.2 mU/L (normal 0.5-5.0), free T4 1.0 ng/dL (normal 1.0-2.3), and positive anti-TPO antibodies. What is the most appropriate management?",
    options: [
      "Observation and repeat labs in 6 months",
      "Start levothyroxine therapy", 
      "Radioactive iodine therapy",
      "Thyroidectomy"
    ],
    correctAnswer: 1,
    explanation: "Subclinical hypothyroidism with symptoms, positive anti-TPO antibodies, and TSH >7-10 mU/L warrants treatment with levothyroxine. The positive anti-TPO antibodies indicate autoimmune thyroiditis (Hashimoto's) and predict progression to overt hypothyroidism. Treatment may improve symptoms and prevent progression. Asymptomatic patients with TSH 5-10 mU/L can be observed.",
    category: "Endocrine", 
    difficulty: "medium",
    usmleCategory: "pharmacology",
    tags: ["subclinical hypothyroidism", "anti-TPO positive", "levothyroxine", "Hashimoto thyroiditis"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "ATA Hypothyroidism Guidelines"],
    subject: "Internal Medicine",
    system: "Endocrine",
    topics: ["Subclinical Hypothyroidism", "Levothyroxine Indications", "Hashimoto Thyroiditis"],
    points: 15
  },
  {
    question: "A 25-year-old man presents with acute onset testicular pain and swelling. Physical examination shows an enlarged, tender left testis with absent cremasteric reflex. Doppler ultrasound shows decreased blood flow to the affected testis. What is the most appropriate immediate management?",
    options: [
      "Antibiotics and anti-inflammatory drugs",
      "Manual detorsion", 
      "Emergency surgical exploration",
      "Observation with pain control"
    ],
    correctAnswer: 2,
    explanation: "Testicular torsion is a urologic emergency requiring immediate surgical detorsion and orchiopexy. The combination of acute severe testicular pain, absent cremasteric reflex, and decreased blood flow on Doppler confirms the diagnosis. Testicular salvage rates are >90% if detorsion occurs within 6 hours but drop significantly after 12-24 hours. Manual detorsion can be attempted but surgical exploration is definitive.",
    category: "Urology", 
    difficulty: "medium",
    usmleCategory: "pathology",
    tags: ["testicular torsion", "emergency surgery", "orchiopexy", "Doppler ultrasound"],
    medicalReferences: ["First Aid USMLE Step 1 2025", "Campbell-Walsh Urology"],
    subject: "Urology",
    system: "Genitourinary",
    topics: ["Testicular Torsion", "Urologic Emergency", "Acute Scrotum"],
    points: 15
  },

  // Questions 151-250: Second batch expansion for comprehensive USMLE coverage
  {
    question: "A 45-year-old woman presents with episodic hypertension, headaches, and sweating. Her blood pressure during episodes reaches 200/120 mmHg. 24-hour urine collection shows elevated catecholamines. What is the most likely diagnosis?",
    options: [
      "Essential hypertension",
      "Pheochromocytoma",
      "Renal artery stenosis",
      "Primary hyperaldosteronism",
      "Hyperthyroidism"
    ],
    correctAnswer: 1,
    explanation: "The classic triad of episodic hypertension, headaches, and diaphoresis (sweating) combined with elevated urinary catecholamines strongly suggests pheochromocytoma. This rare tumor of chromaffin cells secretes excess epinephrine and norepinephrine.",
    category: "Endocrinology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["pheochromocytoma", "hypertension", "catecholamines", "adrenal", "episodic symptoms"],
    medicalReferences: ["First Aid Step 1", "Harrison's Internal Medicine"],
    subject: "Medicine",
    system: "Endocrine",
    topics: ["Adrenal disorders", "Secondary hypertension"],
    points: 15
  },

  {
    question: "A 32-year-old pregnant woman at 28 weeks gestation presents with new-onset seizure. Her blood pressure is 160/110 mmHg, and she has 3+ proteinuria. What is the immediate management priority?",
    options: [
      "IV labetalol for blood pressure control",
      "IV magnesium sulfate for seizure prevention",
      "Immediate cesarean delivery",
      "IV furosemide for fluid management",
      "Oral antihypertensive medications"
    ],
    correctAnswer: 1,
    explanation: "This patient has eclampsia (preeclampsia with seizure). IV magnesium sulfate is the first-line treatment for both seizure prevention and treatment in eclampsia. It prevents recurrent seizures and reduces maternal morbidity.",
    category: "Obstetrics & Gynecology",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["eclampsia", "preeclampsia", "pregnancy", "seizure", "magnesium sulfate"],
    medicalReferences: ["Williams Obstetrics", "ACOG Guidelines"],
    subject: "Obstetrics",
    system: "Reproductive",
    topics: ["Hypertensive disorders of pregnancy", "Eclampsia"],
    points: 20
  },

  {
    question: "A 65-year-old man with a history of smoking presents with a 3-month history of cough and 15-pound weight loss. Chest X-ray shows a 4-cm right upper lobe mass. What is the next best step?",
    options: [
      "Repeat chest X-ray in 3 months",
      "CT chest with contrast",
      "Bronchoscopy with biopsy",
      "PET scan",
      "Sputum cytology"
    ],
    correctAnswer: 1,
    explanation: "CT chest with contrast is the next appropriate step for further characterization of a lung mass. It provides better anatomical detail, helps assess mediastinal lymph nodes, and guides further diagnostic procedures like biopsy.",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["lung cancer", "lung mass", "smoking", "CT chest", "diagnostic workup"],
    medicalReferences: ["American College of Chest Physicians Guidelines"],
    subject: "Medicine",
    system: "Respiratory",
    topics: ["Lung cancer", "Diagnostic imaging"],
    points: 15
  },

  {
    question: "A 28-year-old woman presents with palpitations, weight loss, and heat intolerance. Physical exam reveals exophthalmos and a diffusely enlarged thyroid gland. TSH is suppressed, and free T4 is elevated. What is the most likely diagnosis?",
    options: [
      "Toxic multinodular goiter",
      "Graves' disease",
      "Subacute thyroiditis",
      "Thyroid storm",
      "Hashimoto's thyroiditis"
    ],
    correctAnswer: 1,
    explanation: "Graves' disease is characterized by hyperthyroidism with diffuse goiter and extrathyroidal manifestations like exophthalmos (eye protrusion). It's caused by TSH receptor antibodies and is the most common cause of hyperthyroidism in young adults.",
    category: "Endocrinology",
    difficulty: "easy",
    usmleCategory: "Step 1",
    tags: ["Graves disease", "hyperthyroidism", "exophthalmos", "TSH receptor antibodies"],
    medicalReferences: ["First Aid Step 1", "Robbins Pathology"],
    subject: "Medicine",
    system: "Endocrine",
    topics: ["Thyroid disorders", "Hyperthyroidism"],
    points: 10
  },

  {
    question: "A 4-year-old child presents with fever, barking cough, and inspiratory stridor. The child appears anxious and prefers to sit upright. What is the most appropriate initial management?",
    options: [
      "Intubation in the OR",
      "Nebulized epinephrine and corticosteroids",
      "Antibiotics and throat culture",
      "Chest X-ray and arterial blood gas",
      "Emergency tracheostomy"
    ],
    correctAnswer: 1,
    explanation: "This presentation suggests croup (laryngotracheobronchitis). Nebulized racemic epinephrine provides rapid relief of stridor by reducing laryngeal edema, and corticosteroids reduce inflammation and duration of symptoms.",
    category: "Pediatrics",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["croup", "stridor", "pediatrics", "epinephrine", "corticosteroids"],
    medicalReferences: ["Nelson Textbook of Pediatrics"],
    subject: "Pediatrics",
    system: "Respiratory",
    topics: ["Pediatric respiratory infections", "Upper airway obstruction"],
    points: 15
  },

  {
    question: "A 55-year-old man with diabetes mellitus type 2 presents with sudden onset of severe abdominal pain radiating to the back. Serum lipase is 800 U/L (normal <60). What is the most likely diagnosis?",
    options: [
      "Diabetic ketoacidosis",
      "Acute pancreatitis",
      "Peptic ulcer perforation",
      "Acute cholangitis",
      "Mesenteric ischemia"
    ],
    correctAnswer: 1,
    explanation: "The combination of severe epigastric pain radiating to the back with markedly elevated lipase (>3x normal) is diagnostic of acute pancreatitis. Diabetes is a risk factor, along with gallstones, alcohol, and hypertriglyceridemia.",
    category: "Gastroenterology",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["acute pancreatitis", "lipase", "diabetes", "abdominal pain"],
    medicalReferences: ["Sleisenger and Fordtran's GI Disease"],
    subject: "Medicine",
    system: "Gastrointestinal",
    topics: ["Pancreatic disorders", "Acute pancreatitis"],
    points: 10
  },

  {
    question: "A 72-year-old man presents with progressive memory loss over 2 years. Mini-Mental State Examination score is 18/30. MRI shows diffuse cortical atrophy. What medication should be started?",
    options: [
      "Memantine",
      "Donepezil",
      "Rivastigmine",
      "Galantamine",
      "Vitamin E"
    ],
    correctAnswer: 1,
    explanation: "Donepezil (acetylcholinesterase inhibitor) is first-line treatment for mild to moderate Alzheimer's disease. It can slow cognitive decline and improve quality of life. Memantine is typically reserved for moderate to severe disease.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["Alzheimer disease", "dementia", "donepezil", "acetylcholinesterase inhibitor"],
    medicalReferences: ["American Academy of Neurology Guidelines"],
    subject: "Medicine",
    system: "Neurological",
    topics: ["Dementia", "Alzheimer disease"],
    points: 15
  },

  {
    question: "A 25-year-old woman presents with a 6-month history of amenorrhea, galactorrhea, and headaches. Serum prolactin is 180 ng/mL (normal <25). What is the most likely diagnosis?",
    options: [
      "Pregnancy",
      "Prolactinoma",
      "Hypothyroidism",
      "Polycystic ovary syndrome",
      "Medication effect"
    ],
    correctAnswer: 1,
    explanation: "Markedly elevated prolactin (>150-200 ng/mL) with galactorrhea, amenorrhea, and headaches suggests a prolactin-secreting pituitary adenoma (prolactinoma). This is the most common functioning pituitary tumor.",
    category: "Endocrinology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["prolactinoma", "hyperprolactinemia", "amenorrhea", "galactorrhea", "pituitary adenoma"],
    medicalReferences: ["Endocrinology and Metabolism Clinics"],
    subject: "Medicine",
    system: "Endocrine",
    topics: ["Pituitary disorders", "Prolactinoma"],
    points: 15
  },

  {
    question: "A 16-year-old boy presents to the emergency department with severe testicular pain of 2-hour duration. Physical exam shows a high-riding, horizontally oriented left testicle that is exquisitely tender. What is the immediate management?",
    options: [
      "Ultrasound with Doppler",
      "Urinalysis and urine culture",
      "Immediate surgical exploration",
      "Antibiotics and pain control",
      "CT scan of pelvis"
    ],
    correctAnswer: 2,
    explanation: "This clinical presentation is highly suggestive of testicular torsion, which is a urological emergency. Immediate surgical exploration and detorsion are required to salvage the testicle. Delay increases risk of testicular loss.",
    category: "Urology",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["testicular torsion", "acute scrotum", "urological emergency", "orchiectomy"],
    medicalReferences: ["Campbell-Walsh Urology"],
    subject: "Surgery",
    system: "Genitourinary",
    topics: ["Testicular torsion", "Urological emergencies"],
    points: 20
  },

  {
    question: "A 35-year-old woman presents with fatigue, cold intolerance, and weight gain. Laboratory studies show TSH 25 mIU/L (normal 0.5-5) and low free T4. What is the most appropriate treatment?",
    options: [
      "Liothyronine (T3)",
      "Levothyroxine (T4)",
      "Methimazole",
      "Propranolol",
      "Thyroid extract"
    ],
    correctAnswer: 1,
    explanation: "Primary hypothyroidism (elevated TSH, low free T4) is treated with levothyroxine (synthetic T4), which is the standard of care. It has a long half-life and provides stable thyroid hormone replacement.",
    category: "Endocrinology",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["hypothyroidism", "levothyroxine", "TSH", "thyroid replacement"],
    medicalReferences: ["American Thyroid Association Guidelines"],
    subject: "Medicine",
    system: "Endocrine",
    topics: ["Thyroid disorders", "Hypothyroidism"],
    points: 10
  },

  {
    question: "A 58-year-old man with a history of myocardial infarction presents with shortness of breath and bilateral lower extremity edema. Echocardiogram shows ejection fraction of 25%. What medication has been shown to reduce mortality?",
    options: [
      "Digoxin",
      "Furosemide",
      "Lisinopril",
      "Amlodipine",
      "Metoprolol"
    ],
    correctAnswer: 2,
    explanation: "ACE inhibitors like lisinopril have proven mortality benefit in heart failure with reduced ejection fraction. They reduce preload, afterload, and prevent ventricular remodeling. They are first-line therapy along with beta-blockers.",
    category: "Cardiology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["heart failure", "ACE inhibitor", "reduced ejection fraction", "mortality benefit"],
    medicalReferences: ["AHA/ACC Heart Failure Guidelines"],
    subject: "Medicine",
    system: "Cardiovascular",
    topics: ["Heart failure", "Pharmacotherapy"],
    points: 15
  },

  {
    question: "A 22-year-old woman presents with dysuria, urinary frequency, and suprapubic pain. Urinalysis shows >10 WBCs/hpf and positive nitrites. She has no fever or flank pain. What is the most appropriate treatment?",
    options: [
      "Ciprofloxacin 500 mg BID x 7 days",
      "Trimethoprim-sulfamethoxazole BID x 3 days",
      "Cephalexin 500 mg QID x 7 days",
      "Nitrofurantoin 100 mg BID x 5 days",
      "Azithromycin 1 g single dose"
    ],
    correctAnswer: 3,
    explanation: "For uncomplicated cystitis in young women, nitrofurantoin is first-line therapy due to its excellent urinary concentration and low resistance rates. The 5-day course is as effective as longer courses.",
    category: "Internal Medicine",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["UTI", "cystitis", "nitrofurantoin", "uncomplicated", "women"],
    medicalReferences: ["Infectious Diseases Society Guidelines"],
    subject: "Medicine",
    system: "Genitourinary",
    topics: ["Urinary tract infection", "Antimicrobial therapy"],
    points: 15
  },

  {
    question: "A 3-year-old child presents with sudden onset of respiratory distress after playing with small toys. The child is drooling, unable to speak, and making high-pitched sounds. What is the immediate management?",
    options: [
      "Back blows and chest thrusts",
      "Heimlich maneuver",
      "Direct laryngoscopy and removal",
      "Nebulized epinephrine",
      "Immediate tracheostomy"
    ],
    correctAnswer: 0,
    explanation: "For conscious children under 1 year with suspected foreign body aspiration, back blows and chest thrusts are recommended. For children 1-8 years, abdominal thrusts (modified Heimlich) are appropriate if the child is conscious.",
    category: "Pediatrics",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["foreign body aspiration", "pediatric emergency", "airway obstruction", "choking"],
    medicalReferences: ["American Heart Association PALS"],
    subject: "Emergency Medicine",
    system: "Respiratory",
    topics: ["Pediatric emergencies", "Airway management"],
    points: 20
  },

  {
    question: "A 40-year-old man presents with severe, crampy abdominal pain and bloody diarrhea for 3 weeks. Colonoscopy shows continuous mucosal inflammation from rectum to splenic flexure. What is the most likely diagnosis?",
    options: [
      "Crohn's disease",
      "Ulcerative colitis",
      "Infectious colitis",
      "Ischemic colitis",
      "Diverticulitis"
    ],
    correctAnswer: 1,
    explanation: "Ulcerative colitis typically presents with continuous mucosal inflammation starting from the rectum and extending proximally. The continuous pattern from rectum to splenic flexure is characteristic, unlike the skip lesions seen in Crohn's disease.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["ulcerative colitis", "IBD", "bloody diarrhea", "continuous inflammation"],
    medicalReferences: ["American Gastroenterological Association"],
    subject: "Medicine",
    system: "Gastrointestinal",
    topics: ["Inflammatory bowel disease", "Ulcerative colitis"],
    points: 15
  },

  {
    question: "A 28-year-old woman presents with polyuria, polydipsia, and weight loss. Random glucose is 380 mg/dL. Serum ketones are elevated, and arterial pH is 7.25. What is the most appropriate initial treatment?",
    options: [
      "Regular insulin 10 units subcutaneously",
      "NPH insulin 20 units subcutaneously",
      "IV normal saline and insulin infusion",
      "Oral hypoglycemic agents",
      "IV bicarbonate"
    ],
    correctAnswer: 2,
    explanation: "This patient has diabetic ketoacidosis (DKA). Initial management includes IV fluid resuscitation with normal saline and continuous IV insulin infusion. This addresses both dehydration and ketosis while carefully lowering glucose levels.",
    category: "Endocrinology",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["DKA", "diabetic ketoacidosis", "insulin infusion", "fluid resuscitation"],
    medicalReferences: ["ADA Standards of Medical Care"],
    subject: "Emergency Medicine",
    system: "Endocrine",
    topics: ["Diabetic emergencies", "DKA management"],
    points: 20
  },

  {
    question: "A 65-year-old woman presents with progressive shortness of breath and orthopnea. Physical exam reveals jugular venous distension, bilateral crackles, and S3 gallop. Chest X-ray shows pulmonary edema. What is the most appropriate initial treatment?",
    options: [
      "IV nitroglycerin",
      "IV furosemide",
      "IV dobutamine",
      "Non-invasive positive pressure ventilation",
      "Emergency dialysis"
    ],
    correctAnswer: 1,
    explanation: "IV furosemide is the first-line treatment for acute heart failure with volume overload. It reduces preload by promoting diuresis and has venodilatory effects that provide rapid symptom relief.",
    category: "Cardiology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["acute heart failure", "pulmonary edema", "furosemide", "diuretic"],
    medicalReferences: ["AHA/ACC Acute Heart Failure Guidelines"],
    subject: "Emergency Medicine",
    system: "Cardiovascular",
    topics: ["Acute heart failure", "Volume overload"],
    points: 15
  },

  {
    question: "A 19-year-old college student presents with fever, headache, neck stiffness, and photophobia. Lumbar puncture shows turbid CSF with 2,000 WBCs/μL (90% neutrophils), protein 180 mg/dL, and glucose 35 mg/dL. What is the most likely organism?",
    options: [
      "Streptococcus pneumoniae",
      "Neisseria meningitidis",
      "Haemophilus influenzae",
      "Listeria monocytogenes",
      "Enterovirus"
    ],
    correctAnswer: 1,
    explanation: "In young adults (16-25 years), Neisseria meningitidis is the most common cause of bacterial meningitis. The CSF findings (high neutrophils, elevated protein, low glucose) are consistent with bacterial meningitis.",
    category: "Infectious Disease",
    difficulty: "medium",
    usmleCategory: "Step 1",
    tags: ["bacterial meningitis", "Neisseria meningitidis", "CSF analysis", "young adult"],
    medicalReferences: ["Mandell's Infectious Disease"],
    subject: "Medicine",
    system: "Neurological",
    topics: ["Meningitis", "CNS infections"],
    points: 15
  },

  {
    question: "A 45-year-old man with a history of alcohol use disorder presents with confusion, ataxia, and ophthalmoplegia. What vitamin deficiency is most likely responsible?",
    options: [
      "Vitamin B1 (thiamine)",
      "Vitamin B6 (pyridoxine)",
      "Vitamin B12 (cobalamin)",
      "Folate",
      "Niacin"
    ],
    correctAnswer: 0,
    explanation: "This triad of confusion, ataxia, and ophthalmoplegia (eye movement abnormalities) is classic for Wernicke encephalopathy, caused by thiamine (vitamin B1) deficiency. This is common in patients with alcohol use disorder.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "Step 1",
    tags: ["Wernicke encephalopathy", "thiamine deficiency", "alcohol use disorder", "triad"],
    medicalReferences: ["Adams and Victor's Neurology"],
    subject: "Medicine",
    system: "Neurological",
    topics: ["Nutritional deficiencies", "Alcohol-related disorders"],
    points: 15
  },

  {
    question: "A 30-year-old woman presents with recurrent episodes of palpitations, sweating, and feelings of impending doom lasting 10-15 minutes. Physical exam and ECG are normal. What is the most likely diagnosis?",
    options: [
      "Generalized anxiety disorder",
      "Panic disorder",
      "Hyperthyroidism",
      "Cardiac arrhythmia",
      "Pheochromocytoma"
    ],
    correctAnswer: 1,
    explanation: "Recurrent episodes of intense fear with physical symptoms (palpitations, sweating) lasting minutes and normal physical exam/ECG are characteristic of panic attacks, defining panic disorder when recurrent.",
    category: "Psychiatry",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["panic disorder", "panic attack", "anxiety", "palpitations"],
    medicalReferences: ["DSM-5", "American Psychiatric Association"],
    subject: "Psychiatry",
    system: "Neurological",
    topics: ["Anxiety disorders", "Panic disorder"],
    points: 10
  },

  {
    question: "A 6-month-old infant presents with failure to thrive, chronic diarrhea, and recurrent respiratory infections. Sweat chloride test is 70 mEq/L (normal <40). What is the most likely diagnosis?",
    options: [
      "Celiac disease",
      "Cystic fibrosis",
      "Primary immunodeficiency",
      "Inflammatory bowel disease",
      "Lactose intolerance"
    ],
    correctAnswer: 1,
    explanation: "The combination of failure to thrive, chronic diarrhea, recurrent respiratory infections, and elevated sweat chloride (>60 mEq/L) is diagnostic of cystic fibrosis, an autosomal recessive disorder affecting CFTR protein.",
    category: "Pediatrics",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["cystic fibrosis", "sweat test", "failure to thrive", "CFTR", "recurrent infections"],
    medicalReferences: ["Nelson Textbook of Pediatrics", "CFF Guidelines"],
    subject: "Pediatrics",
    system: "Respiratory",
    topics: ["Cystic fibrosis", "Genetic disorders"],
    points: 15
  },

  {
    question: "A 50-year-old woman presents with fatigue and laboratory studies showing Hgb 8.5 g/dL, MCV 110 fL, and macrocytic anemia. Serum B12 is low and anti-intrinsic factor antibodies are positive. What is the most likely diagnosis?",
    options: [
      "Iron deficiency anemia",
      "Pernicious anemia",
      "Folate deficiency",
      "Chronic kidney disease",
      "Hypothyroidism"
    ],
    correctAnswer: 1,
    explanation: "Macrocytic anemia with low B12 and positive anti-intrinsic factor antibodies is diagnostic of pernicious anemia, an autoimmune condition causing B12 malabsorption due to destruction of gastric parietal cells.",
    category: "Hematology",
    difficulty: "medium",
    usmleCategory: "Step 1",
    tags: ["pernicious anemia", "vitamin B12 deficiency", "macrocytic anemia", "intrinsic factor"],
    medicalReferences: ["Williams Hematology", "Wintrobe's Clinical Hematology"],
    subject: "Medicine",
    system: "Hematologic",
    topics: ["Megaloblastic anemia", "Vitamin deficiencies"],
    points: 15
  },

  {
    question: "A 25-year-old man presents with acute onset of pleuritic chest pain and shortness of breath. He is tall and thin. Chest X-ray shows a 30% pneumothorax. What is the most appropriate management?",
    options: [
      "Observation and serial chest X-rays",
      "Needle decompression",
      "Chest tube placement",
      "VATS (video-assisted thoracoscopy)",
      "Oxygen therapy only"
    ],
    correctAnswer: 2,
    explanation: "A pneumothorax >20-30% or causing significant symptoms requires chest tube placement for decompression. Large pneumothoraces (>30%) require active intervention rather than observation.",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["pneumothorax", "chest tube", "pleuritic pain", "spontaneous pneumothorax"],
    medicalReferences: ["American College of Chest Physicians"],
    subject: "Surgery",
    system: "Respiratory",
    topics: ["Pneumothorax", "Thoracic procedures"],
    points: 15
  },

  {
    question: "A 38-year-old woman presents with a 2-week history of progressive weakness in her arms and legs. Physical exam shows symmetric weakness, absent reflexes, and normal sensation. CSF shows elevated protein with normal cell count. What is the most likely diagnosis?",
    options: [
      "Multiple sclerosis",
      "Guillain-Barré syndrome",
      "Myasthenia gravis",
      "Polymyositis",
      "ALS (amyotrophic lateral sclerosis)"
    ],
    correctAnswer: 1,
    explanation: "Guillain-Barré syndrome presents with ascending symmetric weakness, areflexia, and CSF showing elevated protein with normal cell count (albuminocytologic dissociation). It's an acute inflammatory demyelinating polyneuropathy.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["Guillain-Barre syndrome", "ascending paralysis", "areflexia", "CSF protein"],
    medicalReferences: ["Adams and Victor's Neurology"],
    subject: "Medicine",
    system: "Neurological",
    topics: ["Peripheral neuropathy", "Demyelinating disorders"],
    points: 15
  },

  {
    question: "A 55-year-old man with diabetes presents with a non-healing ulcer on his right foot. The wound has been present for 6 weeks despite local care. What is the most important next step?",
    options: [
      "Oral antibiotics",
      "Topical antibiotics",
      "Wound debridement",
      "Vascular assessment",
      "Hyperbaric oxygen therapy"
    ],
    correctAnswer: 3,
    explanation: "Non-healing diabetic foot ulcers require vascular assessment to evaluate arterial perfusion. Poor circulation is a major factor preventing healing, and revascularization may be necessary before other treatments will be effective.",
    category: "Endocrinology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["diabetic foot ulcer", "non-healing wound", "vascular assessment", "peripheral arterial disease"],
    medicalReferences: ["American Diabetes Association", "Infectious Diseases Society"],
    subject: "Medicine",
    system: "Cardiovascular",
    topics: ["Diabetic complications", "Wound healing"],
    points: 15
  },

  {
    question: "A 42-year-old woman presents with fatigue, joint pain, and a facial rash that worsens with sun exposure. Laboratory studies show positive ANA and anti-dsDNA antibodies. What is the most likely diagnosis?",
    options: [
      "Rheumatoid arthritis",
      "Systemic lupus erythematosus",
      "Sjögren's syndrome",
      "Dermatomyositis",
      "Mixed connective tissue disease"
    ],
    correctAnswer: 1,
    explanation: "The combination of fatigue, arthritis, photosensitive facial rash, positive ANA, and anti-double-stranded DNA antibodies is characteristic of systemic lupus erythematosus (SLE). Anti-dsDNA is highly specific for SLE.",
    category: "Rheumatology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["SLE", "lupus", "anti-dsDNA", "photosensitive rash", "ANA"],
    medicalReferences: ["ACR Classification Criteria", "Textbook of Rheumatology"],
    subject: "Medicine",
    system: "Musculoskeletal",
    topics: ["Systemic lupus erythematosus", "Autoimmune disorders"],
    points: 15
  },

  {
    question: "A 35-year-old man presents with sudden onset of severe headache described as 'the worst headache of my life.' He has mild neck stiffness but no focal neurological deficits. What is the most appropriate initial diagnostic test?",
    options: [
      "MRI brain with gadolinium",
      "CT head without contrast",
      "Lumbar puncture",
      "CT angiography of head and neck",
      "Carotid ultrasound"
    ],
    correctAnswer: 1,
    explanation: "Sudden onset of severe 'thunderclap' headache raises concern for subarachnoid hemorrhage. CT head without contrast is the initial test of choice and will show blood in >95% of cases within 24 hours of symptom onset.",
    category: "Neurology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["subarachnoid hemorrhage", "thunderclap headache", "CT head", "worst headache"],
    medicalReferences: ["American Heart Association Stroke Guidelines"],
    subject: "Emergency Medicine",
    system: "Neurological",
    topics: ["Subarachnoid hemorrhage", "Headache evaluation"],
    points: 15
  },

  {
    question: "A 28-year-old pregnant woman at 32 weeks gestation presents with regular contractions every 3 minutes. Cervical exam shows 4 cm dilation. What is the most appropriate management?",
    options: [
      "Immediate delivery",
      "Tocolytics and corticosteroids",
      "Bed rest and observation",
      "Antibiotics for GBS prophylaxis",
      "Emergency cesarean section"
    ],
    correctAnswer: 1,
    explanation: "Preterm labor at 32 weeks should be managed with tocolytics to delay delivery and corticosteroids to accelerate fetal lung maturity. This combination improves neonatal outcomes by reducing respiratory distress syndrome.",
    category: "Obstetrics & Gynecology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["preterm labor", "tocolytics", "corticosteroids", "fetal lung maturity"],
    medicalReferences: ["ACOG Practice Bulletins"],
    subject: "Obstetrics",
    system: "Reproductive",
    topics: ["Preterm labor", "Obstetric emergencies"],
    points: 15
  },

  {
    question: "A 60-year-old man with COPD presents with worsening shortness of breath, increased sputum production, and sputum purulence. His symptoms have been present for 3 days. What is the most appropriate treatment?",
    options: [
      "Increase inhaled bronchodilators only",
      "Oral corticosteroids",
      "Antibiotics and oral corticosteroids",
      "Hospitalization and IV antibiotics",
      "Oxygen therapy only"
    ],
    correctAnswer: 2,
    explanation: "This patient has COPD exacerbation with increased dyspnea, sputum volume, and purulence. Treatment includes bronchodilators, oral corticosteroids, and antibiotics. The combination addresses inflammation and bacterial infection.",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["COPD exacerbation", "antibiotics", "corticosteroids", "sputum purulence"],
    medicalReferences: ["GOLD COPD Guidelines"],
    subject: "Medicine",
    system: "Respiratory",
    topics: ["COPD", "Acute exacerbations"],
    points: 15
  },

  {
    question: "A 45-year-old woman presents with a 6-month history of morning stiffness lasting over 1 hour, symmetric joint pain in hands and wrists, and fatigue. RF and anti-CCP antibodies are positive. What is the most likely diagnosis?",
    options: [
      "Osteoarthritis",
      "Rheumatoid arthritis",
      "Psoriatic arthritis",
      "Systemic lupus erythematosus",
      "Fibromyalgia"
    ],
    correctAnswer: 1,
    explanation: "Morning stiffness >1 hour, symmetric polyarthritis of small joints, and positive RF and anti-CCP antibodies are characteristic of rheumatoid arthritis. Anti-CCP is highly specific for RA and suggests erosive disease.",
    category: "Rheumatology",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["rheumatoid arthritis", "morning stiffness", "anti-CCP", "symmetric arthritis"],
    medicalReferences: ["ACR/EULAR RA Classification Criteria"],
    subject: "Medicine",
    system: "Musculoskeletal",
    topics: ["Rheumatoid arthritis", "Inflammatory arthritis"],
    points: 10
  },

  {
    question: "A 22-year-old woman presents with recurrent episodes of binge eating followed by self-induced vomiting and excessive exercise. She maintains normal weight but is preoccupied with body shape. What is the most likely diagnosis?",
    options: [
      "Anorexia nervosa",
      "Bulimia nervosa",
      "Binge eating disorder",
      "Body dysmorphic disorder",
      "Obsessive-compulsive disorder"
    ],
    correctAnswer: 1,
    explanation: "Bulimia nervosa is characterized by recurrent episodes of binge eating followed by compensatory behaviors (vomiting, exercise) with normal or near-normal weight. Patients are preoccupied with body weight and shape.",
    category: "Psychiatry",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["bulimia nervosa", "binge eating", "compensatory behaviors", "normal weight"],
    medicalReferences: ["DSM-5"],
    subject: "Psychiatry",
    system: "Neurological",
    topics: ["Eating disorders", "Bulimia nervosa"],
    points: 10
  },

  {
    question: "A 65-year-old man with diabetes and hypertension presents with chest pain and dyspnea. ECG shows ST-segment depression in leads V4-V6. Troponin I is elevated at 2.5 ng/mL. What is the diagnosis?",
    options: [
      "Stable angina",
      "ST-elevation myocardial infarction",
      "Non-ST elevation myocardial infarction",
      "Prinzmetal angina",
      "Pericarditis"
    ],
    correctAnswer: 2,
    explanation: "Chest pain with ST-depression and elevated troponin indicates Non-ST elevation myocardial infarction (NSTEMI). This represents partial thickness myocardial necrosis without complete coronary occlusion causing ST elevation.",
    category: "Cardiology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["NSTEMI", "ST depression", "troponin elevation", "acute coronary syndrome"],
    medicalReferences: ["AHA/ACC STEMI Guidelines"],
    subject: "Emergency Medicine",
    system: "Cardiovascular",
    topics: ["Myocardial infarction", "Acute coronary syndromes"],
    points: 15
  },

  {
    question: "A 8-year-old child presents with fever, sore throat, and difficulty swallowing. Physical exam shows tonsillar exudates and tender cervical lymphadenopathy. Rapid strep test is positive. What is the most appropriate treatment?",
    options: [
      "Supportive care only",
      "Amoxicillin",
      "Azithromycin",
      "Cephalexin",
      "Clindamycin"
    ],
    correctAnswer: 1,
    explanation: "Group A Streptococcus pharyngitis (strep throat) should be treated with amoxicillin as first-line therapy in children. It's effective, safe, and helps prevent complications like rheumatic fever and glomerulonephritis.",
    category: "Pediatrics",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["strep throat", "Group A streptococcus", "amoxicillin", "pediatric infection"],
    medicalReferences: ["AAP Red Book", "IDSA Guidelines"],
    subject: "Pediatrics",
    system: "Respiratory",
    topics: ["Streptococcal infections", "Pharyngitis"],
    points: 10
  },

  {
    question: "A 52-year-old woman presents with a 3-month history of progressive fatigue and shortness of breath. Laboratory studies show Hgb 7.2 g/dL, MCV 72 fL, and serum ferritin 8 ng/mL. What is the most likely diagnosis?",
    options: [
      "Anemia of chronic disease",
      "Iron deficiency anemia",
      "Thalassemia minor",
      "Sideroblastic anemia",
      "Vitamin B12 deficiency"
    ],
    correctAnswer: 1,
    explanation: "Microcytic anemia (MCV <80) with low ferritin indicates iron deficiency anemia. Low ferritin is the most specific test for iron deficiency. Further workup should focus on finding the source of iron loss.",
    category: "Hematology",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["iron deficiency anemia", "microcytic anemia", "low ferritin", "fatigue"],
    medicalReferences: ["Williams Hematology"],
    subject: "Medicine",
    system: "Hematologic",
    topics: ["Iron deficiency anemia", "Microcytic anemia"],
    points: 10
  },

  {
    question: "A 70-year-old man presents with gradually worsening urinary frequency, nocturia, and weak urinary stream. Digital rectal exam shows an enlarged, smooth prostate. PSA is 2.8 ng/mL. What is the most likely diagnosis?",
    options: [
      "Prostate cancer",
      "Benign prostatic hyperplasia",
      "Prostatitis",
      "Bladder cancer",
      "Urethral stricture"
    ],
    correctAnswer: 1,
    explanation: "Gradual onset of lower urinary tract symptoms (frequency, nocturia, weak stream) with enlarged, smooth prostate on DRE and normal PSA suggests benign prostatic hyperplasia (BPH), a common condition in older men.",
    category: "Urology",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["BPH", "benign prostatic hyperplasia", "LUTS", "enlarged prostate"],
    medicalReferences: ["AUA Guidelines on BPH"],
    subject: "Medicine",
    system: "Genitourinary",
    topics: ["Benign prostatic hyperplasia", "Lower urinary tract symptoms"],
    points: 10
  },

  {
    question: "A 26-year-old woman presents with pelvic pain, dyspareunia, and heavy menstrual bleeding. Pelvic exam reveals a tender, fixed mass in the posterior cul-de-sac. What is the most likely diagnosis?",
    options: [
      "Ovarian cyst",
      "Endometriosis",
      "Pelvic inflammatory disease",
      "Uterine fibroids",
      "Ovarian torsion"
    ],
    correctAnswer: 1,
    explanation: "The triad of dysmenorrhea, dyspareunia, and pelvic pain with a fixed pelvic mass is characteristic of endometriosis. The posterior cul-de-sac is a common location for endometrial implants.",
    category: "Obstetrics & Gynecology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["endometriosis", "dyspareunia", "pelvic pain", "fixed mass"],
    medicalReferences: ["ACOG Practice Bulletins"],
    subject: "Gynecology",
    system: "Reproductive",
    topics: ["Endometriosis", "Chronic pelvic pain"],
    points: 15
  },

  {
    question: "A 48-year-old man presents with acute onset of severe abdominal pain radiating to the right flank. The pain comes in waves and is associated with nausea and vomiting. Urinalysis shows microscopic hematuria. What is the most likely diagnosis?",
    options: [
      "Acute appendicitis",
      "Nephrolithiasis",
      "Acute cholecystitis",
      "Bowel obstruction",
      "Peptic ulcer perforation"
    ],
    correctAnswer: 1,
    explanation: "Severe colicky flank pain with microscopic hematuria is classic for nephrolithiasis (kidney stones). The pain typically radiates from flank to groin as the stone moves through the ureter.",
    category: "Urology",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["nephrolithiasis", "kidney stones", "flank pain", "hematuria"],
    medicalReferences: ["AUA Guidelines on Kidney Stones"],
    subject: "Emergency Medicine",
    system: "Genitourinary",
    topics: ["Nephrolithiasis", "Acute abdominal pain"],
    points: 10
  },

  {
    question: "A 35-year-old woman with a history of depression presents with confusion, agitation, and hyperthermia after starting a new medication. Physical exam shows dilated pupils, flushed skin, and muscle rigidity. What is the most likely diagnosis?",
    options: [
      "Neuroleptic malignant syndrome",
      "Serotonin syndrome",
      "Anticholinergic toxicity",
      "Heat stroke",
      "Thyroid storm"
    ],
    correctAnswer: 1,
    explanation: "Serotonin syndrome typically occurs when serotonergic medications are combined or doses are increased. It presents with altered mental status, hyperthermia, and neuromuscular hyperactivity including muscle rigidity and hyperreflexia.",
    category: "Psychiatry",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["serotonin syndrome", "hyperthermia", "muscle rigidity", "antidepressants"],
    medicalReferences: ["Psychiatric Emergency Medicine"],
    subject: "Emergency Medicine",
    system: "Neurological",
    topics: ["Drug toxicity", "Psychiatric emergencies"],
    points: 20
  },

  {
    question: "A 55-year-old man presents with progressive dysphagia, first to solids and then to liquids, accompanied by regurgitation and weight loss. Barium swallow shows a dilated esophagus with a bird's beak appearance. What is the most likely diagnosis?",
    options: [
      "Esophageal cancer",
      "Achalasia",
      "GERD with stricture",
      "Esophageal spasm",
      "Zenker diverticulum"
    ],
    correctAnswer: 1,
    explanation: "Progressive dysphagia from solids to liquids with regurgitation and the characteristic 'bird's beak' appearance on barium swallow is diagnostic of achalasia, caused by failure of the lower esophageal sphincter to relax.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["achalasia", "dysphagia", "bird's beak", "esophageal motility"],
    medicalReferences: ["ACG Clinical Guidelines"],
    subject: "Medicine",
    system: "Gastrointestinal",
    topics: ["Esophageal disorders", "Dysphagia"],
    points: 15
  },

  {
    question: "A 68-year-old woman presents with sudden onset of right-sided weakness and slurred speech that began 30 minutes ago. Her blood pressure is 180/100 mmHg. CT head shows no hemorrhage. What is the most appropriate immediate treatment?",
    options: [
      "IV labetalol for blood pressure",
      "IV alteplase (tPA)",
      "Aspirin 325 mg",
      "Clopidogrel 600 mg",
      "IV heparin"
    ],
    correctAnswer: 1,
    explanation: "Acute ischemic stroke within the 3-hour window (now extended to 4.5 hours in select patients) should be treated with IV alteplase if there are no contraindications. This can significantly improve outcomes by restoring cerebral perfusion.",
    category: "Neurology",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["acute stroke", "tPA", "alteplase", "thrombolysis", "time window"],
    medicalReferences: ["AHA/ASA Stroke Guidelines"],
    subject: "Emergency Medicine",
    system: "Neurological",
    topics: ["Acute stroke", "Thrombolytic therapy"],
    points: 20
  },

  {
    question: "A 32-year-old woman presents with amenorrhea for 3 months, weight gain, and purple striae on her abdomen. She also reports easy bruising and proximal muscle weakness. What is the most likely diagnosis?",
    options: [
      "Hypothyroidism",
      "Cushing syndrome",
      "Polycystic ovary syndrome",
      "Pregnancy",
      "Diabetes mellitus"
    ],
    correctAnswer: 1,
    explanation: "The constellation of central weight gain, purple striae, easy bruising, proximal muscle weakness, and amenorrhea suggests Cushing syndrome, caused by excess cortisol from various sources including pituitary adenoma or adrenal causes.",
    category: "Endocrinology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["Cushing syndrome", "hypercortisolism", "purple striae", "proximal weakness"],
    medicalReferences: ["Endocrine Society Clinical Guidelines"],
    subject: "Medicine",
    system: "Endocrine",
    topics: ["Cushing syndrome", "Adrenal disorders"],
    points: 15
  },

  {
    question: "A 75-year-old man with atrial fibrillation on warfarin presents with bright red blood per rectum. His INR is 4.2. Hemoglobin has dropped from 12.0 to 8.5 g/dL. What is the most appropriate immediate management?",
    options: [
      "Continue warfarin and observe",
      "Hold warfarin and give vitamin K",
      "Give fresh frozen plasma",
      "Reverse with prothrombin complex concentrate",
      "Start heparin instead"
    ],
    correctAnswer: 1,
    explanation: "Significant GI bleeding with supratherapeutic INR (>3.0) requires holding warfarin and giving vitamin K to reverse anticoagulation. The dose depends on severity - oral for mild, IV for severe bleeding.",
    category: "Hematology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["warfarin reversal", "GI bleeding", "vitamin K", "supratherapeutic INR"],
    medicalReferences: ["American College of Chest Physicians"],
    subject: "Emergency Medicine",
    system: "Hematologic",
    topics: ["Anticoagulation reversal", "GI bleeding"],
    points: 15
  },

  {
    question: "A 14-year-old boy presents with fever, sore throat, and fatigue for 2 weeks. Physical exam shows posterior cervical lymphadenopathy and splenomegaly. Monospot test is positive. What is the most likely diagnosis?",
    options: [
      "Streptococcal pharyngitis",
      "Infectious mononucleosis",
      "Acute leukemia",
      "Cytomegalovirus infection",
      "Toxoplasmosis"
    ],
    correctAnswer: 1,
    explanation: "The combination of fever, pharyngitis, fatigue, posterior cervical lymphadenopathy, splenomegaly, and positive monospot test is classic for infectious mononucleosis, typically caused by Epstein-Barr virus (EBV).",
    category: "Infectious Disease",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["infectious mononucleosis", "EBV", "monospot", "splenomegaly"],
    medicalReferences: ["Red Book", "Infectious Disease Textbook"],
    subject: "Pediatrics",
    system: "Hematologic",
    topics: ["Viral infections", "Infectious mononucleosis"],
    points: 10
  },

  {
    question: "A 45-year-old woman presents with a 2-month history of dry eyes and dry mouth. She also reports joint pain and fatigue. Laboratory studies show positive anti-Ro/SSA and anti-La/SSB antibodies. What is the most likely diagnosis?",
    options: [
      "Systemic lupus erythematosus",
      "Sjögren's syndrome",
      "Rheumatoid arthritis",
      "Scleroderma",
      "Mixed connective tissue disease"
    ],
    correctAnswer: 1,
    explanation: "Sjögren's syndrome is characterized by sicca symptoms (dry eyes and mouth) due to autoimmune destruction of exocrine glands. Anti-Ro/SSA and anti-La/SSB antibodies are highly specific for this condition.",
    category: "Rheumatology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["Sjogren syndrome", "sicca symptoms", "anti-Ro", "anti-La", "dry eyes"],
    medicalReferences: ["ACR Classification Criteria"],
    subject: "Medicine",
    system: "Musculoskeletal",
    topics: ["Sjögren's syndrome", "Autoimmune disorders"],
    points: 15
  },

  {
    question: "A 30-year-old man presents with recurrent episodes of severe abdominal pain, nausea, and vomiting. Family history is significant for similar symptoms in his father. Laboratory studies during an attack show elevated urinary porphobilinogen. What is the most likely diagnosis?",
    options: [
      "Inflammatory bowel disease",
      "Acute intermittent porphyria",
      "Hereditary pancreatitis",
      "Familial Mediterranean fever",
      "Gastroparesis"
    ],
    correctAnswer: 1,
    explanation: "Recurrent episodes of severe abdominal pain with neuropsychiatric symptoms, family history, and elevated urinary porphobilinogen suggest acute intermittent porphyria, an inherited disorder of heme biosynthesis.",
    category: "Internal Medicine",
    difficulty: "hard",
    usmleCategory: "Step 1",
    tags: ["acute intermittent porphyria", "porphobilinogen", "abdominal pain", "hereditary"],
    medicalReferences: ["American Porphyria Foundation"],
    subject: "Medicine",
    system: "Gastrointestinal",
    topics: ["Metabolic disorders", "Porphyrias"],
    points: 20
  },

  {
    question: "A 18-year-old college student presents with a 3-day history of fever, headache, and a petechial rash on his trunk and extremities. He appears acutely ill with nuchal rigidity. What is the most appropriate immediate action?",
    options: [
      "Obtain blood cultures",
      "Perform lumbar puncture",
      "Start IV antibiotics",
      "CT scan of head",
      "Isolation precautions"
    ],
    correctAnswer: 2,
    explanation: "This presentation suggests bacterial meningitis, likely meningococcal given the petechial rash and college setting. IV antibiotics should be started immediately - even minutes matter. Don't delay for diagnostic tests in fulminant cases.",
    category: "Infectious Disease",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["bacterial meningitis", "petechial rash", "empiric antibiotics", "emergency"],
    medicalReferences: ["IDSA Meningitis Guidelines"],
    subject: "Emergency Medicine",
    system: "Neurological",
    topics: ["Bacterial meningitis", "Medical emergencies"],
    points: 20
  },

  {
    question: "A 62-year-old woman presents with gradually progressive dyspnea on exertion and a chronic dry cough. Chest X-ray shows bilateral lower lobe reticular opacities. Pulmonary function tests show restrictive pattern. What is the most likely diagnosis?",
    options: [
      "Chronic obstructive pulmonary disease",
      "Idiopathic pulmonary fibrosis",
      "Congestive heart failure",
      "Pneumocystis pneumonia",
      "Sarcoidosis"
    ],
    correctAnswer: 1,
    explanation: "Progressive dyspnea with dry cough, bilateral lower lobe reticular opacities, and restrictive pulmonary function tests in an older adult suggests idiopathic pulmonary fibrosis, a progressive interstitial lung disease.",
    category: "Pulmonology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["idiopathic pulmonary fibrosis", "interstitial lung disease", "restrictive pattern", "reticular opacities"],
    medicalReferences: ["American Thoracic Society Guidelines"],
    subject: "Medicine",
    system: "Respiratory",
    topics: ["Interstitial lung disease", "Pulmonary fibrosis"],
    points: 15
  },

  {
    question: "A 28-year-old woman presents with recurrent miscarriages (3 in the past 2 years) and a history of deep vein thrombosis. Laboratory studies show prolonged aPTT that does not correct with mixing studies. What is the most likely diagnosis?",
    options: [
      "Factor VIII deficiency",
      "Antiphospholipid syndrome",
      "Protein C deficiency",
      "Factor V Leiden mutation",
      "Disseminated intravascular coagulation"
    ],
    correctAnswer: 1,
    explanation: "Recurrent pregnancy losses with thrombotic events and prolonged aPTT that doesn't correct with mixing studies suggests antiphospholipid syndrome, characterized by anticardiolipin antibodies and lupus anticoagulant.",
    category: "Hematology",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["antiphospholipid syndrome", "recurrent miscarriage", "thrombosis", "lupus anticoagulant"],
    medicalReferences: ["ASH Guidelines"],
    subject: "Medicine",
    system: "Hematologic",
    topics: ["Antiphospholipid syndrome", "Hypercoagulable states"],
    points: 20
  },

  {
    question: "A 50-year-old man with a history of alcohol use disorder presents with progressive jaundice, ascites, and spider angiomata. Laboratory studies show elevated bilirubin and AST > ALT. What is the most likely diagnosis?",
    options: [
      "Acute hepatitis A",
      "Alcoholic liver disease",
      "Hemochromatosis",
      "Primary biliary cholangitis",
      "Wilson disease"
    ],
    correctAnswer: 1,
    explanation: "Progressive jaundice, ascites, spider angiomata, and AST > ALT pattern in a patient with alcohol use disorder suggests alcoholic liver disease with cirrhosis. The AST:ALT ratio >2:1 is characteristic of alcoholic hepatitis.",
    category: "Gastroenterology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["alcoholic liver disease", "cirrhosis", "AST ALT ratio", "spider angiomata"],
    medicalReferences: ["AASLD Practice Guidelines"],
    subject: "Medicine",
    system: "Gastrointestinal",
    topics: ["Alcoholic liver disease", "Cirrhosis"],
    points: 15
  },

  {
    question: "A 16-year-old girl presents with a 6-month history of amenorrhea and significant weight loss. She denies hunger and expresses fear of weight gain despite being underweight. What is the most likely diagnosis?",
    options: [
      "Hyperthyroidism",
      "Anorexia nervosa",
      "Inflammatory bowel disease",
      "Type 1 diabetes mellitus",
      "Depression"
    ],
    correctAnswer: 1,
    explanation: "Amenorrhea, significant weight loss, denial of hunger, and fear of weight gain in an underweight adolescent female are characteristic features of anorexia nervosa, an eating disorder with high morbidity and mortality.",
    category: "Psychiatry",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["anorexia nervosa", "amenorrhea", "weight loss", "fear of weight gain"],
    medicalReferences: ["DSM-5"],
    subject: "Psychiatry",
    system: "Neurological",
    topics: ["Eating disorders", "Anorexia nervosa"],
    points: 10
  },

  {
    question: "A 45-year-old man presents with sudden onset of severe chest pain radiating to the back. Blood pressure is 220/110 mmHg in the right arm and 160/90 mmHg in the left arm. Chest X-ray shows widened mediastinum. What is the most likely diagnosis?",
    options: [
      "ST-elevation myocardial infarction",
      "Aortic dissection",
      "Pulmonary embolism",
      "Pericarditis",
      "Esophageal rupture"
    ],
    correctAnswer: 1,
    explanation: "Sudden onset of tearing chest pain radiating to the back, blood pressure differential between arms (>20 mmHg), and widened mediastinum on chest X-ray are classic for aortic dissection, a cardiovascular emergency.",
    category: "Cardiology",
    difficulty: "hard",
    usmleCategory: "Step 2 CK",
    tags: ["aortic dissection", "chest pain", "blood pressure differential", "widened mediastinum"],
    medicalReferences: ["AHA/ACC Guidelines"],
    subject: "Emergency Medicine",
    system: "Cardiovascular",
    topics: ["Aortic dissection", "Cardiovascular emergencies"],
    points: 20
  },

  {
    question: "A 38-year-old woman presents with a 3-week history of fatigue, palpitations, and heat intolerance. She has lost 8 pounds despite increased appetite. Thyroid is diffusely enlarged and non-tender. TSH is <0.01 mIU/L and free T4 is elevated. What is the most appropriate next test?",
    options: [
      "Thyroid ultrasound",
      "Radioactive iodine uptake scan",
      "Anti-TPO antibodies",
      "Fine needle aspiration",
      "CT neck with contrast"
    ],
    correctAnswer: 1,
    explanation: "In hyperthyroidism with diffuse goiter, a radioactive iodine uptake scan helps differentiate between Graves' disease (increased uptake) and thyroiditis (decreased uptake), which have different treatments.",
    category: "Endocrinology",
    difficulty: "medium",
    usmleCategory: "Step 2 CK",
    tags: ["hyperthyroidism", "radioiodine uptake", "Graves disease", "thyroiditis"],
    medicalReferences: ["American Thyroid Association"],
    subject: "Medicine",
    system: "Endocrine",
    topics: ["Hyperthyroidism", "Thyroid function tests"],
    points: 15
  },

  {
    question: "A 55-year-old man with diabetes presents with a red, swollen, and painful big toe. Joint aspiration shows needle-shaped, negatively birefringent crystals. What is the most likely diagnosis?",
    options: [
      "Septic arthritis",
      "Gout",
      "Pseudogout",
      "Reactive arthritis",
      "Rheumatoid arthritis"
    ],
    correctAnswer: 1,
    explanation: "Acute monoarticular arthritis of the first metatarsophalangeal joint with needle-shaped, negatively birefringent uric acid crystals is diagnostic of gout. Diabetes is a risk factor for hyperuricemia and gout.",
    category: "Rheumatology",
    difficulty: "easy",
    usmleCategory: "Step 2 CK",
    tags: ["gout", "uric acid crystals", "negatively birefringent", "big toe"],
    medicalReferences: ["ACR Gout Guidelines"],
    subject: "Medicine",
    system: "Musculoskeletal",
    topics: ["Gout", "Crystal arthropathies"],
    points: 10
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