import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("user"), 
      v.literal("author"), 
      v.literal("editor"), 
      v.literal("moderator"), 
      v.literal("admin")
    )),
    points: v.optional(v.number()),
    level: v.optional(v.number()),
    streak: v.optional(v.number()),
    totalQuizzes: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    medicalLevel: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    studyGoals: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      difficulty: v.optional(v.string()),
    })),
    passwordHash: v.optional(v.string()),
    lastLogin: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
    lastStudyDate: v.optional(v.string()),
    streakFreezeCount: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_points", ["points"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("by_created", ["createdAt"]),

  questions: defineTable({
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
    lastReviewed: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("published"), v.literal("archived"))),
    authorId: v.optional(v.id("users")),
    editorId: v.optional(v.id("users")),
    moderatorId: v.optional(v.id("users")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    version: v.optional(v.number()),
    editNotes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    qualityScore: v.optional(v.number()),
    reportCount: v.optional(v.number()),
  })
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"])
    .index("by_usmle_category", ["usmleCategory"])
    .index("by_status", ["status"])
    .index("by_author", ["authorId"])
    .index("by_published", ["publishedAt"])
    .index("by_active", ["isActive"])
    .index("by_quality", ["qualityScore"])
    .searchIndex("search_content", {
      searchField: "question",
      filterFields: ["category", "difficulty", "usmleCategory", "status"]
    }),

  quizSessions: defineTable({
    userId: v.id("users"),
    mode: v.union(v.literal("quick"), v.literal("timed"), v.literal("custom")),
    questions: v.array(v.id("questions")),
    answers: v.array(v.union(v.number(), v.null())),
    score: v.number(),
    timeSpent: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("abandoned")),
    completedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    deviceType: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    abandonReason: v.optional(v.string()),
    lastQuestionIndex: v.optional(v.number()),
    canResume: v.optional(v.boolean()),
    abandonedAt: v.optional(v.number()),
    resumedAt: v.optional(v.number()),
    sessionMetadata: v.optional(v.object({
      pauseCount: v.optional(v.number()),
      hintsUsed: v.optional(v.number()),
      averageTimePerQuestion: v.optional(v.number()),
      totalPauseTime: v.optional(v.number()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_completion", ["completedAt"])
    .index("by_created", ["createdAt"]),

  quizResults: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_mode", ["mode"])
    .index("by_score", ["score"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_mode", ["userId", "mode"])
    .index("by_user_timestamp", ["userId", "timestamp"]),
});