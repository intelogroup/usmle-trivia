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