import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new question
export const createQuestion = mutation({
  args: {
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    explanation: v.string(),
    category: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    usmleCategory: v.string(),
    tags: v.array(v.string()),
    medicalReferences: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("questions", {
      ...args,
      lastReviewed: Date.now(),
    });
    
    return questionId;
  },
});

// Get questions with optional filters
export const getQuestions = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    usmleCategory: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("questions");
    
    // Apply filters with proper typing
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category!));
    }
    if (args.difficulty) {
      query = query.filter((q) => q.eq(q.field("difficulty"), args.difficulty! as "easy" | "medium" | "hard"));
    }
    if (args.usmleCategory) {
      query = query.filter((q) => q.eq(q.field("usmleCategory"), args.usmleCategory!));
    }
    
    const questions = await query.take(args.limit ?? 50);
    return questions;
  },
});

// Get a single question by ID
export const getQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    return question;
  },
});

// Get random questions for quiz
export const getRandomQuestions = query({
  args: {
    count: v.number(),
    difficulty: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("questions");
    
    // Apply filters with proper typing
    if (args.difficulty) {
      query = query.filter((q) => q.eq(q.field("difficulty"), args.difficulty! as "easy" | "medium" | "hard"));
    }
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category!));
    }
    
    const allQuestions = await query.collect();
    
    // Shuffle and take requested count
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, args.count);
  },
});

// Create a new quiz session
export const createQuizSession = mutation({
  args: {
    userId: v.id("users"),
    mode: v.union(v.literal("quick"), v.literal("timed"), v.literal("custom")),
    questionIds: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("quizSessions", {
      userId: args.userId,
      mode: args.mode,
      questions: args.questionIds,
      answers: new Array(args.questionIds.length).fill(null),
      score: 0,
      timeSpent: 0,
      status: "active",
    });
    
    return sessionId;
  },
});

// Get quiz session by ID
export const getQuizSession = query({
  args: { sessionId: v.id("quizSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session;
  },
});

// Submit an answer to a quiz question
export const submitAnswer = mutation({
  args: {
    sessionId: v.id("quizSessions"),
    questionIndex: v.number(),
    answer: v.number(),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError("Quiz session not found");
    }
    
    if (session.status !== "active") {
      throw new ConvexError("Quiz session is not active");
    }
    
    // Update the answers array
    const updatedAnswers = [...session.answers];
    updatedAnswers[args.questionIndex] = args.answer;
    
    await ctx.db.patch(args.sessionId, {
      answers: updatedAnswers,
      timeSpent: args.timeSpent,
    });
    
    return await ctx.db.get(args.sessionId);
  },
});

// Complete a quiz session
export const completeQuizSession = mutation({
  args: {
    sessionId: v.id("quizSessions"),
    finalTimeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError("Quiz session not found");
    }
    
    // Get all questions for this session to calculate score
    const questions = await Promise.all(
      session.questions.map(questionId => ctx.db.get(questionId))
    );
    
    // Calculate score
    let correctAnswers = 0;
    session.answers.forEach((answer, index) => {
      if (answer !== null && questions[index] && answer === questions[index]?.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // Update session
    await ctx.db.patch(args.sessionId, {
      score,
      timeSpent: args.finalTimeSpent,
      status: "completed",
      completedAt: Date.now(),
    });
    
    return await ctx.db.get(args.sessionId);
  },
});

// Get user's quiz history
export const getUserQuizHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("quizSessions")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", args.userId).eq("status", "completed")
      )
      .order("desc")
      .take(args.limit ?? 10);
    
    return sessions;
  },
});

// Search questions
export const searchQuestions = query({
  args: {
    searchTerm: v.string(),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("questions")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("question", args.searchTerm);
        
        if (args.category) {
          search = search.eq("category", args.category);
        }
        
        if (args.difficulty) {
          search = search.eq("difficulty", args.difficulty as "easy" | "medium" | "hard");
        }
        
        return search;
      })
      .take(args.limit ?? 20);
    
    return results;
  },
});

// Batch create questions (for seeding)
export const batchCreateQuestions = mutation({
  args: {
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.number(),
      explanation: v.string(),
      category: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      usmleCategory: v.string(),
      tags: v.array(v.string()),
      medicalReferences: v.optional(v.array(v.string())),
      imageUrl: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const questionIds = [];
    
    for (const questionData of args.questions) {
      try {
        const questionId = await ctx.db.insert("questions", {
          ...questionData,
          lastReviewed: Date.now(),
        });
        questionIds.push(questionId);
      } catch (error) {
        console.error("Failed to create question:", error);
      }
    }
    
    return questionIds;
  },
});

// Get questions by IDs (for quiz review)
export const getQuestionsByIds = query({
  args: {
    questionIds: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    const questions = [];
    
    for (const id of args.questionIds) {
      const question = await ctx.db.get(id);
      if (question) {
        questions.push(question);
      }
    }
    
    return questions;
  },
});

// Bookmark a question
export const bookmarkQuestion = mutation({
  args: {
    userId: v.id("users"),
    questionId: v.id("questions"),
    bookmarked: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if bookmark already exists
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_question", (q) => 
        q.eq("userId", args.userId).eq("questionId", args.questionId)
      )
      .first();
    
    if (args.bookmarked && !existing) {
      // Add bookmark
      await ctx.db.insert("bookmarks", {
        userId: args.userId,
        questionId: args.questionId,
        createdAt: Date.now(),
      });
    } else if (!args.bookmarked && existing) {
      // Remove bookmark
      await ctx.db.delete(existing._id);
    }
    
    return { success: true };
  },
});

// Flag a question for review
export const flagQuestion = mutation({
  args: {
    userId: v.id("users"),
    questionId: v.id("questions"),
    flagged: v.boolean(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if flag already exists
    const existing = await ctx.db
      .query("flaggedQuestions")
      .withIndex("by_user_question", (q) => 
        q.eq("userId", args.userId).eq("questionId", args.questionId)
      )
      .first();
    
    if (args.flagged && !existing) {
      // Add flag
      await ctx.db.insert("flaggedQuestions", {
        userId: args.userId,
        questionId: args.questionId,
        reason: args.reason,
        createdAt: Date.now(),
      });
    } else if (!args.flagged && existing) {
      // Remove flag
      await ctx.db.delete(existing._id);
    }
    
    return { success: true };
  },
});

// Get user's bookmarked questions
export const getUserBookmarks = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(args.limit ?? 50);
    
    // Get the actual questions
    const questions = [];
    for (const bookmark of bookmarks) {
      const question = await ctx.db.get(bookmark.questionId);
      if (question) {
        questions.push({
          ...question,
          bookmarkedAt: bookmark.createdAt,
        });
      }
    }
    
    return questions;
  },
});

// Save comprehensive quiz results
export const saveQuizResults = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    mode: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    incorrectAnswers: v.number(),
    timeSpent: v.number(),
    averageTimePerQuestion: v.number(),
    completionRate: v.number(),
    performanceMetrics: v.object({
      accuracy: v.number(),
      speed: v.number(),
      consistency: v.number(),
      strengthAreas: v.array(v.string()),
      improvementAreas: v.array(v.string()),
    }),
    questionBreakdown: v.array(v.object({
      questionId: v.string(),
      category: v.string(),
      difficulty: v.string(),
      userAnswer: v.number(),
      correctAnswer: v.number(),
      isCorrect: v.boolean(),
      timeSpent: v.optional(v.number()),
    })),
    timestamp: v.number(),
    autoAdvanceCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const resultId = await ctx.db.insert("quizResults", {
        sessionId: args.sessionId,
        userId: args.userId,
        mode: args.mode,
        score: args.score,
        totalQuestions: args.totalQuestions,
        correctAnswers: args.correctAnswers,
        incorrectAnswers: args.incorrectAnswers,
        timeSpent: args.timeSpent,
        averageTimePerQuestion: args.averageTimePerQuestion,
        completionRate: args.completionRate,
        performanceMetrics: args.performanceMetrics,
        questionBreakdown: args.questionBreakdown,
        timestamp: args.timestamp,
        autoAdvanceCount: args.autoAdvanceCount || 0,
        createdAt: Date.now(),
      });
      
      console.log("Quiz results saved:", resultId);
      return resultId;
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      throw new ConvexError("Failed to save quiz results");
    }
  },
});

// Get comprehensive quiz results for a user
export const getUserQuizResults = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("quizResults")
      .filter((q) => q.eq(q.field("userId"), args.userId));
    
    if (args.mode) {
      query = query.filter((q) => q.eq(q.field("mode"), args.mode));
    }
    
    const results = await query
      .order("desc") // Most recent first
      .take(args.limit ?? 20);
    
    return results;
  },
});

// Get quiz analytics for a user
export const getUserQuizAnalytics = query({
  args: {
    userId: v.string(),
    timeframe: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const timeframe = args.timeframe || "all";
    const now = Date.now();
    let startTime = 0;
    
    switch (timeframe) {
      case "week":
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = 0;
    }
    
    const results = await ctx.db
      .query("quizResults")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gte(q.field("timestamp"), startTime)
        )
      )
      .collect();
    
    if (results.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        strengthAreas: [],
        improvementAreas: [],
        progressTrend: "stable",
      };
    }
    
    // Calculate analytics
    const totalQuizzes = results.length;
    const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalQuizzes);
    const totalTimeSpent = results.reduce((sum, r) => sum + r.timeSpent, 0);
    
    // Aggregate strength and improvement areas
    const strengthMap = new Map<string, number>();
    const improvementMap = new Map<string, number>();
    
    results.forEach(result => {
      result.performanceMetrics.strengthAreas.forEach(area => {
        strengthMap.set(area, (strengthMap.get(area) || 0) + 1);
      });
      result.performanceMetrics.improvementAreas.forEach(area => {
        improvementMap.set(area, (improvementMap.get(area) || 0) + 1);
      });
    });
    
    // Get top areas
    const strengthAreas = Array.from(strengthMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area]) => area);
    
    const improvementAreas = Array.from(improvementMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area]) => area);
    
    // Calculate progress trend (simple version)
    let progressTrend: "improving" | "declining" | "stable" = "stable";
    if (results.length >= 3) {
      const recent = results.slice(0, Math.ceil(results.length / 2));
      const older = results.slice(Math.ceil(results.length / 2));
      
      const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
      const olderAvg = older.reduce((sum, r) => sum + r.score, 0) / older.length;
      
      if (recentAvg > olderAvg + 5) progressTrend = "improving";
      else if (recentAvg < olderAvg - 5) progressTrend = "declining";
    }
    
    return {
      totalQuizzes,
      averageScore,
      totalTimeSpent,
      strengthAreas,
      improvementAreas,
      progressTrend,
    };
  },
});

// Enhanced quiz completion with automatic point calculation and stats update
export const completeQuizWithStats = mutation({
  args: {
    sessionId: v.id("quizSessions"),
    finalTimeSpent: v.number(),
    autoAdvanceCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      console.log(`Starting enhanced quiz completion for session: ${args.sessionId}`);
      
      // Get the quiz session
      const session = await ctx.db.get(args.sessionId);
      if (!session) {
        throw new ConvexError("Quiz session not found");
      }

      if (session.status !== "active") {
        throw new ConvexError("Quiz session is not active");
      }

      // Get all questions for this session to calculate detailed results
      const questions = await Promise.all(
        session.questions.map(questionId => ctx.db.get(questionId))
      );

      // Filter out any null questions (in case some were deleted)
      const validQuestions = questions.filter(q => q !== null);
      
      if (validQuestions.length === 0) {
        throw new ConvexError("No valid questions found for this session");
      }

      // Calculate detailed results
      let correctAnswers = 0;
      let totalPointsEarned = 0;
      const questionBreakdown = [];
      const categoryStats = new Map<string, { correct: number; total: number }>();
      const difficultyStats = new Map<string, { correct: number; total: number }>();

      // Point values by difficulty
      const pointValues = {
        easy: 2,
        medium: 5,
        hard: 10
      };

      session.answers.forEach((answer, index) => {
        const question = validQuestions[index];
        if (!question) return;

        const isCorrect = answer !== null && answer === question.correctAnswer;
        const points = isCorrect ? pointValues[question.difficulty] : 0;
        
        if (isCorrect) {
          correctAnswers++;
          totalPointsEarned += points;
        }

        // Track category stats
        const catStat = categoryStats.get(question.category) || { correct: 0, total: 0 };
        catStat.total++;
        if (isCorrect) catStat.correct++;
        categoryStats.set(question.category, catStat);

        // Track difficulty stats
        const diffStat = difficultyStats.get(question.difficulty) || { correct: 0, total: 0 };
        diffStat.total++;
        if (isCorrect) diffStat.correct++;
        difficultyStats.set(question.difficulty, diffStat);

        // Add to question breakdown
        questionBreakdown.push({
          questionId: question._id,
          category: question.category,
          difficulty: question.difficulty,
          userAnswer: answer ?? -1,
          correctAnswer: question.correctAnswer,
          isCorrect,
          timeSpent: Math.floor(args.finalTimeSpent / validQuestions.length), // Approximate time per question
          pointsEarned: points
        });
      });

      // Calculate performance metrics
      const accuracy = Math.round((correctAnswers / validQuestions.length) * 100);
      const averageTimePerQuestion = Math.round(args.finalTimeSpent / validQuestions.length);
      const completionRate = 100; // Assuming completed quiz
      
      // Determine strength and improvement areas based on category performance
      const strengthAreas: string[] = [];
      const improvementAreas: string[] = [];
      
      categoryStats.forEach((stats, category) => {
        const categoryAccuracy = (stats.correct / stats.total) * 100;
        if (categoryAccuracy >= 80) {
          strengthAreas.push(category);
        } else if (categoryAccuracy < 50) {
          improvementAreas.push(category);
        }
      });

      // Performance metrics object
      const performanceMetrics = {
        accuracy,
        speed: averageTimePerQuestion > 120 ? 1 : averageTimePerQuestion > 60 ? 3 : 5, // 1-5 scale
        consistency: accuracy > 90 ? 5 : accuracy > 70 ? 4 : accuracy > 50 ? 3 : 2, // 1-5 scale
        strengthAreas,
        improvementAreas
      };

      console.log(`Calculated results - Score: ${accuracy}%, Points: ${totalPointsEarned}, Correct: ${correctAnswers}/${validQuestions.length}`);

      // Update the quiz session
      await ctx.db.patch(args.sessionId, {
        score: accuracy,
        timeSpent: args.finalTimeSpent,
        status: "completed",
        completedAt: Date.now(),
      });

      // Get updated session
      const completedSession = await ctx.db.get(args.sessionId);
      if (!completedSession) {
        throw new ConvexError("Failed to retrieve completed session");
      }

      // Update user stats with calculated points
      console.log(`Updating user stats for user: ${session.userId} with ${totalPointsEarned} points`);
      
      let updatedUserStats;
      try {
        updatedUserStats = await ctx.runMutation("auth:updateUserStats", {
          userId: session.userId,
          quizScore: accuracy,
          questionsCount: validQuestions.length,
          pointsEarned: totalPointsEarned,
        });
        console.log("User stats updated successfully");
      } catch (error) {
        console.error("Error updating user stats:", error);
        // Continue with quiz completion even if stats update fails
        updatedUserStats = null;
      }

      // Save comprehensive quiz results
      console.log("Saving comprehensive quiz results");
      
      let quizResultId;
      try {
        quizResultId = await ctx.runMutation("quiz:saveQuizResults", {
          sessionId: String(args.sessionId),
          userId: String(session.userId),
          mode: session.mode,
          score: accuracy,
          totalQuestions: validQuestions.length,
          correctAnswers,
          incorrectAnswers: validQuestions.length - correctAnswers,
          timeSpent: args.finalTimeSpent,
          averageTimePerQuestion,
          completionRate,
          performanceMetrics,
          questionBreakdown,
          timestamp: Date.now(),
          autoAdvanceCount: args.autoAdvanceCount || 0,
        });
        console.log(`Quiz results saved with ID: ${quizResultId}`);
      } catch (error) {
        console.error("Error saving quiz results:", error);
        // Continue even if detailed results save fails
        quizResultId = null;
      }

      console.log("Enhanced quiz completion successful");

      // Return comprehensive completion data
      return {
        session: completedSession,
        userStats: updatedUserStats,
        results: {
          score: accuracy,
          correctAnswers,
          totalQuestions: validQuestions.length,
          pointsEarned: totalPointsEarned,
          timeSpent: args.finalTimeSpent,
          performanceMetrics,
          quizResultId
        }
      };

    } catch (error) {
      console.error("Error in completeQuizWithStats:", error);
      
      // If there's an error, try to fall back to basic completion
      try {
        console.log("Attempting fallback to basic quiz completion");
        const basicCompletion = await ctx.runMutation("quiz:completeQuizSession", {
          sessionId: args.sessionId,
          finalTimeSpent: args.finalTimeSpent,
        });
        
        return {
          session: basicCompletion,
          userStats: null,
          results: {
            score: basicCompletion?.score || 0,
            correctAnswers: 0,
            totalQuestions: 0,
            pointsEarned: 0,
            timeSpent: args.finalTimeSpent,
            performanceMetrics: {
              accuracy: 0,
              speed: 3,
              consistency: 3,
              strengthAreas: [],
              improvementAreas: []
            },
            quizResultId: null
          },
          error: "Enhanced completion failed, used basic completion"
        };
      } catch (fallbackError) {
        console.error("Fallback completion also failed:", fallbackError);
        throw new ConvexError(`Quiz completion failed: ${error.message}`);
      }
    }
  },
});

// Get point values for questions based on difficulty
export const getQuestionPointValues = query({
  args: {
    questionIds: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    const questions = await Promise.all(
      args.questionIds.map(questionId => ctx.db.get(questionId))
    );

    const pointValues = {
      easy: 2,
      medium: 5,
      hard: 10
    };

    return questions.map(question => ({
      questionId: question?._id,
      difficulty: question?.difficulty,
      pointValue: question ? pointValues[question.difficulty] : 0,
    }));
  },
});

// Calculate total potential points for a quiz session
export const calculateQuizPotentialPoints = query({
  args: {
    sessionId: v.id("quizSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return { totalPoints: 0, breakdown: [] };
    }

    const questions = await Promise.all(
      session.questions.map(questionId => ctx.db.get(questionId))
    );

    const pointValues = {
      easy: 2,
      medium: 5,
      hard: 10
    };

    const breakdown = questions
      .filter(q => q !== null)
      .map(question => ({
        questionId: question!._id,
        difficulty: question!.difficulty,
        pointValue: pointValues[question!.difficulty],
        category: question!.category
      }));

    const totalPoints = breakdown.reduce((sum, item) => sum + item.pointValue, 0);

    return {
      totalPoints,
      breakdown,
      difficultyBreakdown: {
        easy: breakdown.filter(q => q.difficulty === "easy").length,
        medium: breakdown.filter(q => q.difficulty === "medium").length,
        hard: breakdown.filter(q => q.difficulty === "hard").length,
      }
    };
  },
});