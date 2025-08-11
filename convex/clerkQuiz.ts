import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to get current user from Clerk identity
const getCurrentUserId = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  return identity.subject;
};

// Create a new quiz session for Clerk user
export const createQuizSession = mutation({
  args: {
    mode: v.union(v.literal("quick"), v.literal("timed"), v.literal("custom")),
    questionIds: v.array(v.id("questions")),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    const sessionId = await ctx.db.insert("quizSessions", {
      userId,
      mode: args.mode,
      questions: args.questionIds,
      answers: new Array(args.questionIds.length).fill(null),
      score: 0,
      timeSpent: 0,
      status: "active",
      createdAt: Date.now(),
    });
    
    return sessionId;
  },
});

// Get quiz session by ID (with user verification)
export const getQuizSession = query({
  args: { sessionId: v.id("quizSessions") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    
    // Verify session belongs to current user
    if (session && session.userId !== userId) {
      throw new ConvexError("Access denied");
    }
    
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
    const userId = await getCurrentUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    
    if (!session) {
      throw new ConvexError("Quiz session not found");
    }
    
    // Verify session belongs to current user
    if (session.userId !== userId) {
      throw new ConvexError("Access denied");
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
    const userId = await getCurrentUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    
    if (!session) {
      throw new ConvexError("Quiz session not found");
    }
    
    // Verify session belongs to current user
    if (session.userId !== userId) {
      throw new ConvexError("Access denied");
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
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    const sessions = await ctx.db
      .query("quizSessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("status"), "completed")
        )
      )
      .order("desc")
      .take(args.limit ?? 10);
    
    return sessions;
  },
});

// Bookmark a question
export const bookmarkQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    bookmarked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Check if bookmark already exists
    const existing = await ctx.db
      .query("bookmarks")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("questionId"), args.questionId)
        )
      )
      .first();
    
    if (args.bookmarked && !existing) {
      // Add bookmark
      await ctx.db.insert("bookmarks", {
        userId,
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
    questionId: v.id("questions"),
    flagged: v.boolean(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    // Check if flag already exists
    const existing = await ctx.db
      .query("flaggedQuestions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("questionId"), args.questionId)
        )
      )
      .first();
    
    if (args.flagged && !existing) {
      // Add flag
      await ctx.db.insert("flaggedQuestions", {
        userId,
        questionId: args.questionId,
        reason: args.reason,
        status: "pending",
        priority: "medium",
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
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    const bookmarks = await ctx.db
      .query("bookmarks")
      .filter((q) => q.eq(q.field("userId"), userId))
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
    const userId = await getCurrentUserId(ctx);
    
    try {
      const resultId = await ctx.db.insert("quizResults", {
        sessionId: args.sessionId,
        userId,
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
      
      return resultId;
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      throw new ConvexError("Failed to save quiz results");
    }
  },
});

// Get comprehensive quiz results for current user
export const getUserQuizResults = query({
  args: {
    limit: v.optional(v.number()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    let query = ctx.db.query("quizResults")
      .filter((q) => q.eq(q.field("userId"), userId));
    
    if (args.mode) {
      query = query.filter((q) => q.eq(q.field("mode"), args.mode));
    }
    
    const results = await query
      .order("desc") // Most recent first
      .take(args.limit ?? 20);
    
    return results;
  },
});

// Get quiz analytics for current user
export const getUserQuizAnalytics = query({
  args: {
    timeframe: v.optional(v.union(v.literal("week"), v.literal("month"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
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
          q.eq(q.field("userId"), userId),
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
        progressTrend: "stable" as const,
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
    
    // Calculate progress trend
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