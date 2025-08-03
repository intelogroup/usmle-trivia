import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    points: v.number(),
    level: v.number(),
    streak: v.number(),
    totalQuizzes: v.number(),
    accuracy: v.number(),
    medicalLevel: v.optional(v.string()), // "student", "resident", "physician"
    specialties: v.optional(v.array(v.string())),
    studyGoals: v.optional(v.string()), // "USMLE Step 1", "USMLE Step 2", etc.
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      difficulty: v.optional(v.string()),
    })),
  })
    .index("by_email", ["email"])
    .index("by_points", ["points"]),

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
  })
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"])
    .index("by_usmle_category", ["usmleCategory"])
    .searchIndex("search_content", {
      searchField: "question",
      filterFields: ["category", "difficulty", "usmleCategory"]
    }),

  quizSessions: defineTable({
    userId: v.id("users"),
    mode: v.union(v.literal("quick"), v.literal("timed"), v.literal("custom")),
    questions: v.array(v.id("questions")),
    answers: v.array(v.union(v.number(), v.null())),
    score: v.number(),
    timeSpent: v.number(), // Time in seconds
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("abandoned")),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_completion", ["completedAt"]),

  leaderboard: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    points: v.number(),
    level: v.number(),
    accuracy: v.number(),
    totalQuizzes: v.number(),
    rank: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_rank", ["rank"])
    .index("by_points", ["points"])
    .index("by_user", ["userId"]),
});