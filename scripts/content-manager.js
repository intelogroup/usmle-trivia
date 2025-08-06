#!/usr/bin/env node

/**
 * Content Management Script for USMLE Quiz Questions
 * 
 * Usage:
 * - Import questions: node scripts/content-manager.js import <file.json>
 * - Export questions: node scripts/content-manager.js export [output.json]
 * - Validate questions: node scripts/content-manager.js validate
 * - Seed sample data: node scripts/content-manager.js seed
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Convex client
const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://formal-sardine-916.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Question validation schema
const questionSchema = {
  required: ["question", "type", "options", "correctAnswer", "explanation", "category", "difficulty"],
  types: {
    question: "string",
    type: ["single", "multiple"],
    options: "array",
    correctAnswer: ["string", "array"],
    explanation: "string",
    category: "string",
    difficulty: ["easy", "medium", "hard"],
    tags: "array",
    references: "array"
  }
};

// Sample USMLE questions for seeding
const sampleQuestions = [
  {
    question: "A 45-year-old man presents with progressive weakness and muscle atrophy in his hands. Physical examination reveals fasciculations in the tongue and upper extremities. Deep tendon reflexes are hyperactive. Which of the following is the most likely diagnosis?",
    type: "single",
    options: [
      "Multiple sclerosis",
      "Amyotrophic lateral sclerosis",
      "Guillain-Barré syndrome",
      "Myasthenia gravis"
    ],
    correctAnswer: "Amyotrophic lateral sclerosis",
    explanation: "ALS presents with both upper motor neuron signs (hyperreflexia) and lower motor neuron signs (fasciculations, muscle atrophy). The combination of these findings is pathognomonic for ALS.",
    category: "Neurology",
    difficulty: "medium",
    tags: ["Motor neuron disease", "Neurodegeneration"],
    references: ["First Aid USMLE Step 1", "Pathoma"]
  },
  {
    question: "A 28-year-old woman presents with amenorrhea for 3 months. She reports galactorrhea and headaches. MRI reveals a 8mm pituitary mass. Which of the following is the most appropriate initial treatment?",
    type: "single",
    options: [
      "Transsphenoidal surgery",
      "Radiation therapy",
      "Cabergoline",
      "Observation"
    ],
    correctAnswer: "Cabergoline",
    explanation: "This patient has a prolactinoma (microprolactinoma < 10mm). First-line treatment is medical therapy with dopamine agonists like cabergoline or bromocriptine, which reduce prolactin levels and tumor size.",
    category: "Endocrinology",
    difficulty: "medium",
    tags: ["Pituitary adenoma", "Prolactinoma", "Amenorrhea"],
    references: ["First Aid USMLE Step 2 CK", "UpToDate"]
  },
  {
    question: "A 6-month-old infant is brought to the emergency department with lethargy and poor feeding. Laboratory studies show blood glucose of 35 mg/dL, elevated liver enzymes, and hepatomegaly. Which enzyme deficiency is most likely?",
    type: "single",
    options: [
      "Glucose-6-phosphatase",
      "Alpha-glucosidase",
      "Debranching enzyme",
      "Phosphorylase"
    ],
    correctAnswer: "Glucose-6-phosphatase",
    explanation: "Von Gierke disease (Type I glycogen storage disease) is caused by glucose-6-phosphatase deficiency. It presents with severe fasting hypoglycemia, hepatomegaly, and lactic acidosis in infants.",
    category: "Biochemistry",
    difficulty: "hard",
    tags: ["Glycogen storage disease", "Metabolic disorder", "Pediatrics"],
    references: ["First Aid USMLE Step 1", "Biochemistry - Lippincott"]
  },
  {
    question: "A 35-year-old man with HIV (CD4 count 45 cells/μL) presents with dyspnea and dry cough. Chest X-ray shows bilateral interstitial infiltrates. Which of the following is the most appropriate initial treatment?",
    type: "single",
    options: [
      "Azithromycin",
      "Trimethoprim-sulfamethoxazole",
      "Fluconazole",
      "Isoniazid"
    ],
    correctAnswer: "Trimethoprim-sulfamethoxazole",
    explanation: "This presentation is classic for Pneumocystis jirovecii pneumonia (PCP) in an AIDS patient (CD4 < 200). TMP-SMX is the first-line treatment. Steroids should be added if PaO2 < 70 mmHg.",
    category: "Infectious Disease",
    difficulty: "medium",
    tags: ["HIV/AIDS", "Opportunistic infection", "Pneumonia"],
    references: ["First Aid USMLE Step 2 CK", "CDC Guidelines"]
  },
  {
    question: "A 62-year-old woman with a history of rheumatoid arthritis presents with splenomegaly and recurrent infections. Laboratory studies show neutropenia. Which of the following is the most likely diagnosis?",
    type: "single",
    options: [
      "Drug-induced neutropenia",
      "Felty syndrome",
      "Large granular lymphocyte leukemia",
      "Systemic lupus erythematosus"
    ],
    correctAnswer: "Felty syndrome",
    explanation: "Felty syndrome is characterized by the triad of rheumatoid arthritis, splenomegaly, and neutropenia. It occurs in patients with severe, long-standing RA and increases infection risk.",
    category: "Rheumatology",
    difficulty: "hard",
    tags: ["Rheumatoid arthritis", "Autoimmune", "Hematology"],
    references: ["Robbins Pathology", "Harrison's Internal Medicine"]
  }
];

// Validation function
function validateQuestion(question, index) {
  const errors = [];
  
  // Check required fields
  for (const field of questionSchema.required) {
    if (!question[field]) {
      errors.push(`Question ${index + 1}: Missing required field '${field}'`);
    }
  }
  
  // Validate types
  if (question.type && !["single", "multiple"].includes(question.type)) {
    errors.push(`Question ${index + 1}: Invalid type '${question.type}'`);
  }
  
  if (question.difficulty && !["easy", "medium", "hard"].includes(question.difficulty)) {
    errors.push(`Question ${index + 1}: Invalid difficulty '${question.difficulty}'`);
  }
  
  // Validate options
  if (question.options && !Array.isArray(question.options)) {
    errors.push(`Question ${index + 1}: Options must be an array`);
  } else if (question.options && question.options.length < 2) {
    errors.push(`Question ${index + 1}: Must have at least 2 options`);
  }
  
  // Validate correct answer
  if (question.type === "single" && typeof question.correctAnswer !== "string") {
    errors.push(`Question ${index + 1}: Single-choice question must have string correctAnswer`);
  }
  
  if (question.type === "multiple" && !Array.isArray(question.correctAnswer)) {
    errors.push(`Question ${index + 1}: Multiple-choice question must have array correctAnswer`);
  }
  
  return errors;
}

// Import questions from JSON file
async function importQuestions(filePath) {
  try {
    console.log("📚 Importing questions from:", filePath);
    
    const data = await fs.readFile(filePath, "utf-8");
    const questions = JSON.parse(data);
    
    if (!Array.isArray(questions)) {
      throw new Error("Input file must contain an array of questions");
    }
    
    // Validate all questions
    const allErrors = [];
    questions.forEach((q, i) => {
      const errors = validateQuestion(q, i);
      allErrors.push(...errors);
    });
    
    if (allErrors.length > 0) {
      console.error("❌ Validation errors:");
      allErrors.forEach(err => console.error("  -", err));
      process.exit(1);
    }
    
    console.log(`✅ Validated ${questions.length} questions`);
    
    // Import to Convex
    let imported = 0;
    for (const question of questions) {
      try {
        await client.mutation(api.questions.createQuestion, question);
        imported++;
        console.log(`  ✅ Imported question ${imported}/${questions.length}`);
      } catch (error) {
        console.error(`  ❌ Failed to import question: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully imported ${imported}/${questions.length} questions`);
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    process.exit(1);
  }
}

// Export questions to JSON file
async function exportQuestions(outputPath = "questions-export.json") {
  try {
    console.log("📤 Exporting questions from Convex...");
    
    const questions = await client.query(api.questions.listQuestions, {});
    
    if (!questions || questions.length === 0) {
      console.log("⚠️ No questions found in database");
      return;
    }
    
    // Clean up Convex metadata
    const cleanQuestions = questions.map(q => ({
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty,
      tags: q.tags || [],
      references: q.references || []
    }));
    
    const fullPath = path.resolve(outputPath);
    await fs.writeFile(fullPath, JSON.stringify(cleanQuestions, null, 2));
    
    console.log(`✅ Exported ${cleanQuestions.length} questions to ${fullPath}`);
  } catch (error) {
    console.error("❌ Export failed:", error.message);
    process.exit(1);
  }
}

// Validate existing questions in database
async function validateQuestions() {
  try {
    console.log("🔍 Validating questions in database...");
    
    const questions = await client.query(api.questions.listQuestions, {});
    
    if (!questions || questions.length === 0) {
      console.log("⚠️ No questions found in database");
      return;
    }
    
    const allErrors = [];
    questions.forEach((q, i) => {
      const errors = validateQuestion(q, i);
      allErrors.push(...errors);
    });
    
    if (allErrors.length > 0) {
      console.error("❌ Validation errors found:");
      allErrors.forEach(err => console.error("  -", err));
    } else {
      console.log(`✅ All ${questions.length} questions are valid`);
    }
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
    process.exit(1);
  }
}

// Seed sample questions
async function seedQuestions() {
  try {
    console.log("🌱 Seeding sample USMLE questions...");
    
    let seeded = 0;
    for (const question of sampleQuestions) {
      try {
        await client.mutation(api.questions.createQuestion, question);
        seeded++;
        console.log(`  ✅ Seeded question ${seeded}/${sampleQuestions.length}: ${question.category}`);
      } catch (error) {
        console.error(`  ⚠️ Skipped (may already exist): ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Successfully seeded ${seeded} sample questions`);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

// Main CLI
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  console.log("🏥 USMLE Quiz Content Manager");
  console.log("📡 Convex URL:", CONVEX_URL);
  console.log("");
  
  switch (command) {
    case "import":
      if (!arg) {
        console.error("❌ Please provide a JSON file path");
        console.log("Usage: node scripts/content-manager.js import <file.json>");
        process.exit(1);
      }
      await importQuestions(arg);
      break;
      
    case "export":
      await exportQuestions(arg);
      break;
      
    case "validate":
      await validateQuestions();
      break;
      
    case "seed":
      await seedQuestions();
      break;
      
    default:
      console.log("Available commands:");
      console.log("  import <file.json>  - Import questions from JSON file");
      console.log("  export [output.json] - Export questions to JSON file");
      console.log("  validate            - Validate questions in database");
      console.log("  seed                - Seed sample USMLE questions");
      console.log("");
      console.log("Example:");
      console.log("  node scripts/content-manager.js seed");
      console.log("  node scripts/content-manager.js export my-questions.json");
      console.log("  node scripts/content-manager.js import my-questions.json");
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}