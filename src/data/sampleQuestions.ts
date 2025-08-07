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
    medicalReferences: ["First Aid USMLE Step 1 2025", "Pathoma Ch. 19"]
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