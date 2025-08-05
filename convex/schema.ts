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

  // Bookmarked questions for users
  bookmarks: defineTable({
    userId: v.id("users"),
    questionId: v.id("questions"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_question", ["userId", "questionId"]),

  // Flagged questions for review
  flaggedQuestions: defineTable({
    userId: v.id("users"),
    questionId: v.id("questions"),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_question", ["questionId"])
    .index("by_user_question", ["userId", "questionId"]),

  // User relationships for friends/study groups
  friendships: defineTable({
    userId1: v.id("users"),
    userId2: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("blocked")),
    createdAt: v.number(),
  })
    .index("by_user1", ["userId1"])
    .index("by_user2", ["userId2"])
    .index("by_users", ["userId1", "userId2"]),

  // Study groups
  studyGroups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("users"),
    members: v.array(v.id("users")),
    isPublic: v.boolean(),
    category: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_public", ["isPublic"]),

  // Quiz challenges between users
  challenges: defineTable({
    challengerId: v.id("users"),
    challengedId: v.id("users"),
    quizSessionId: v.optional(v.id("quizSessions")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("completed"), v.literal("declined")),
    challengerScore: v.optional(v.number()),
    challengedScore: v.optional(v.number()),
    winnerId: v.optional(v.id("users")),
    category: v.optional(v.string()),
    questionCount: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_challenger", ["challengerId"])
    .index("by_challenged", ["challengedId"])
    .index("by_status", ["status"]),
});