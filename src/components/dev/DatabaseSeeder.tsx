import { useState } from 'react';
import { convexQuizService } from '../../services/convexQuiz';
import { loadSampleQuestions } from '../../services/questionService';

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

    logs.push(`🌱 Starting database seeding with Convex...`);
    logs.push(`📊 Loading sample questions...`);
    setResults([...logs]);

    try {
      // Load questions dynamically
      const sampleQuestions = await loadSampleQuestions();
      logs.push(`📊 Found ${sampleQuestions.length} questions to seed`);
      setResults([...logs]);

      // Use batch create for better performance
      const createdQuestions = await convexQuizService.seedQuestions(sampleQuestions);
      
      const successCount = createdQuestions.length;
      const errorCount = sampleQuestions.length - successCount;

      createdQuestions.forEach((question, index) => {
        logs.push(`✅ Question ${index + 1}/${sampleQuestions.length}: ${question.category} - ${question.difficulty}`);
        logs.push(`   ID: ${question._id}`);
      });

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
        logs.push('💥 No questions were seeded. Check the Convex configuration.');
      }

      setResults([...logs]);
    } catch (error: any) {
      logs.push(`❌ Failed to seed questions: ${error.message}`);
      logs.push('💥 Check the Convex configuration and deployment.');
      setResults([...logs]);
    }

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