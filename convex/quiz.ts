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
    
    // Apply filters
    if (args.category) {
      query = query.withIndex("by_category", (q) => q.eq("category", args.category));
    } else if (args.difficulty) {
      query = query.withIndex("by_difficulty", (q) => 
        q.eq("difficulty", args.difficulty as "easy" | "medium" | "hard")
      );
    } else if (args.usmleCategory) {
      query = query.withIndex("by_usmle_category", (q) => q.eq("usmleCategory", args.usmleCategory));
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
    
    // Apply filters
    if (args.difficulty) {
      query = query.withIndex("by_difficulty", (q) => 
        q.eq("difficulty", args.difficulty as "easy" | "medium" | "hard")
      );
    } else if (args.category) {
      query = query.withIndex("by_category", (q) => q.eq("category", args.category));
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