/**
 * Script to seed the database with sample USMLE questions
 * Run this once to populate the questions collection
 */

import { quizService } from '../services/quiz';
import { sampleQuestions } from '../data/sampleQuestions';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log(`📚 Seeding ${sampleQuestions.length} sample questions...`);

    const createdQuestions = await quizService.seedQuestions(sampleQuestions);
    
    console.log(`✅ Successfully created ${createdQuestions.length} questions`);
    console.log('🎯 Sample questions by category:');
    
    // Group by category for summary
    const categoryCounts = createdQuestions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} questions`);
    });

    console.log('🎯 Sample questions by difficulty:');
    const difficultyCounts = createdQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(difficultyCounts).forEach(([difficulty, count]) => {
      console.log(`   ${difficulty}: ${count} questions`);
    });

    console.log('🚀 Database seeding completed successfully!');
    console.log('💡 You can now start creating quizzes with these questions.');
    
    return createdQuestions;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Export for use in other scripts or manual execution
export { sampleQuestions };

// Only run if this script is executed directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}