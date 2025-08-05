#!/usr/bin/env node

// Generate test user data and quiz sessions
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const CONVEX_URL = "https://formal-sardine-916.convex.cloud";

async function generateTestData() {
  console.log("🎯 Generating Test Data for MedQuiz Pro");
  console.log("======================================");
  
  const client = new ConvexHttpClient(CONVEX_URL);
  
  try {
    // Create test users
    const testUsers = [
      { email: "alex.chen@medschool.edu", name: "Alex Chen", password: "Test123!" },
      { email: "sarah.johnson@university.edu", name: "Sarah Johnson", password: "Test123!" },
      { email: "mike.rodriguez@hospital.org", name: "Mike Rodriguez", password: "Test123!" },
      { email: "emily.watson@clinic.com", name: "Emily Watson", password: "Test123!" },
      { email: "david.kim@medical.edu", name: "David Kim", password: "Test123!" }
    ];
    
    console.log("\n👥 Creating test users...");
    const userIds = [];
    
    for (const userData of testUsers) {
      try {
        const userId = await client.mutation(api.auth.createUser, userData);
        userIds.push({ id: userId, ...userData });
        console.log(`✅ Created user: ${userData.name}`);
      } catch (error) {
        if (error.message.includes("already exists")) {
          // Get existing user
          const user = await client.query(api.auth.getUserByEmail, { email: userData.email });
          if (user) {
            userIds.push({ id: user._id, ...userData });
            console.log(`⚠️  User already exists: ${userData.name}`);
          }
        }
      }
    }
    
    // Get all questions for quiz sessions
    console.log("\n📚 Fetching questions...");
    const questions = await client.query(api.quiz.getQuestions, { limit: 100 });
    console.log(`Found ${questions.length} questions`);
    
    // Generate quiz sessions for each user
    console.log("\n🎮 Creating quiz sessions...");
    
    for (const user of userIds) {
      // Create 2-3 quiz sessions per user
      const numSessions = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numSessions; i++) {
        const mode = ['quick', 'timed', 'custom'][Math.floor(Math.random() * 3)];
        const questionCount = mode === 'quick' ? 5 : mode === 'timed' ? 10 : 8;
        
        // Select random questions
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, questionCount);
        const questionIds = selectedQuestions.map(q => q._id);
        
        // Create quiz session
        const sessionId = await client.mutation(api.quiz.createQuizSession, {
          userId: user.id,
          mode,
          questionIds
        });
        
        // Simulate quiz completion
        const answers = [];
        let correctCount = 0;
        
        for (let j = 0; j < selectedQuestions.length; j++) {
          // Simulate answer (70-90% chance of correct answer)
          const isCorrect = Math.random() < (0.7 + Math.random() * 0.2);
          const answer = isCorrect 
            ? selectedQuestions[j].correctAnswer 
            : Math.floor(Math.random() * 4);
          
          answers.push(answer);
          if (answer === selectedQuestions[j].correctAnswer) {
            correctCount++;
          }
          
          // Submit answer
          await client.mutation(api.quiz.submitAnswer, {
            sessionId,
            questionIndex: j,
            answer,
            timeSpent: Math.floor(Math.random() * 60) + 20 // 20-80 seconds per question
          });
        }
        
        // Complete session
        const finalTimeSpent = questionCount * (Math.floor(Math.random() * 40) + 30);
        await client.mutation(api.quiz.completeQuizSession, {
          sessionId,
          finalTimeSpent
        });
        
        const score = Math.round((correctCount / questionCount) * 100);
        console.log(`✅ ${user.name} completed ${mode} quiz: ${score}%`);
      }
      
      // Update user stats
      const quizHistory = await client.query(api.quiz.getUserQuizHistory, { 
        userId: user.id, 
        limit: 10 
      });
      
      const completedQuizzes = quizHistory.filter(q => q.status === 'completed');
      const totalScore = completedQuizzes.reduce((sum, q) => sum + q.score, 0);
      const avgScore = Math.round(totalScore / completedQuizzes.length);
      const pointsEarned = completedQuizzes.length * 100 + totalScore;
      
      await client.mutation(api.auth.updateUserStats, {
        userId: user.id,
        quizScore: avgScore,
        questionsCount: completedQuizzes.length * 5,
        pointsEarned
      });
      
      console.log(`📊 ${user.name}: ${pointsEarned} points, ${avgScore}% average`);
    }
    
    // Display leaderboard
    console.log("\n🏆 Final Leaderboard:");
    const leaderboard = await client.query(api.auth.getLeaderboard, { limit: 10 });
    leaderboard.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.userName} - ${entry.points} points (${entry.accuracy}% accuracy)`);
    });
    
    console.log("\n🎉 Test data generation complete!");
    console.log("You can now log in with any of these users:");
    testUsers.forEach(user => {
      console.log(`  - ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error("❌ Error generating test data:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTestData().then(() => process.exit(0)).catch(() => process.exit(1));
}

export { generateTestData };