import { useState } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '../../services/appwrite';
import { ID } from 'appwrite';
import { sampleQuestions } from '../../data/sampleQuestions';

export function DatabaseSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Show seeder only in development
  if (import.meta.env.PROD) {
    return null;
  }

  const seedQuestions = async () => {
    setIsSeeding(true);
    setResults([]);
    const logs: string[] = [];

    logs.push(`🌱 Starting database seeding...`);
    logs.push(`📊 Found ${sampleQuestions.length} questions to seed`);
    setResults([...logs]);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sampleQuestions.length; i++) {
      const question = sampleQuestions[i];
      
      try {
        // Transform the question data to match database schema
        const questionDoc = {
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
        };

        // Create the question document
        const result = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.QUESTIONS,
          ID.unique(),
          questionDoc
        );

        const successMsg = `✅ Question ${i + 1}/${sampleQuestions.length}: ${question.category} - ${question.difficulty}`;
        logs.push(successMsg);
        logs.push(`   ID: ${result.$id}`);
        setResults([...logs]);
        successCount++;
        
      } catch (error: any) {
        const errorMsg = `❌ Failed to seed question ${i + 1}: ${error.message}`;
        const questionPreview = `   Question: ${question.question.substring(0, 50)}...`;
        logs.push(errorMsg);
        logs.push(questionPreview);
        setResults([...logs]);
        errorCount++;
      }
    }

    // Final summary
    logs.push('');
    logs.push('🎯 Seeding Summary:');
    logs.push(`✅ Successfully seeded: ${successCount} questions`);
    logs.push(`❌ Failed to seed: ${errorCount} questions`);

    if (successCount === sampleQuestions.length) {
      logs.push('🚀 Database seeding completed successfully!');
      logs.push('💡 You can now test the quiz functionality with real medical questions.');
    } else if (successCount > 0) {
      logs.push('⚠️  Partial success. Some questions were seeded successfully.');
    } else {
      logs.push('💥 No questions were seeded. Check the database configuration and permissions.');
    }

    setResults([...logs]);
    setIsSeeding(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          🛠️ Dev Tools
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Database Seeder</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={seedQuestions}
          disabled={isSeeding}
          className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
            isSeeding 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          } transition-colors`}
        >
          {isSeeding ? '🌱 Seeding...' : '🌱 Seed Sample Questions'}
        </button>

        {results.length > 0 && (
          <>
            <button
              onClick={clearResults}
              className="w-full px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Clear Results
            </button>
            
            <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
              <div className="text-xs font-mono space-y-1">
                {results.map((line, index) => (
                  <div 
                    key={index} 
                    className={`${
                      line.includes('✅') ? 'text-green-600' :
                      line.includes('❌') ? 'text-red-600' :
                      line.includes('🎯') || line.includes('🚀') ? 'text-blue-600 font-medium' :
                      'text-gray-700'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}