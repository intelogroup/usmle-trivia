import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    // Role-based permissions for content management workflow (SPEC.md Section 4) - made optional for migration
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
    medicalLevel: v.optional(v.string()), // "student", "resident", "physician"
    specialties: v.optional(v.array(v.string())),
    studyGoals: v.optional(v.string()), // "USMLE Step 1", "USMLE Step 2", etc.
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      difficulty: v.optional(v.string()),
    })),
    // Enhanced authentication (SPEC.md Section 7)
    passwordHash: v.optional(v.string()), // Hashed password with bcrypt
    lastLogin: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    // Study streak tracking (MVP requirement)
    currentStreak: v.optional(v.number()), // Current consecutive days
    longestStreak: v.optional(v.number()), // Best streak achieved
    lastStudyDate: v.optional(v.string()), // Last study date (YYYY-MM-DD)
    streakFreezeCount: v.optional(v.number()), // Streak freezes available
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
    // Content management workflow fields (SPEC.md Section 4) - made optional for migration
    status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("published"), v.literal("archived"))),
    authorId: v.optional(v.id("users")), // Who created the question
    editorId: v.optional(v.id("users")), // Who last edited
    moderatorId: v.optional(v.id("users")), // Who approved
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    version: v.optional(v.number()), // Version control
    editNotes: v.optional(v.string()), // Editor notes
    isActive: v.optional(v.boolean()), // Active/inactive status
    qualityScore: v.optional(v.number()), // Quality rating 1-5
    reportCount: v.optional(v.number()), // How many times reported
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
    timeSpent: v.number(), // Time in seconds
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("abandoned")),
    completedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    // Enhanced session tracking
    deviceType: v.optional(v.string()), // "mobile", "tablet", "desktop"
    userAgent: v.optional(v.string()),
    // MVP: Abandonment and resume tracking
    abandonReason: v.optional(v.string()), // "timeout", "manual", "disconnect", "browser_close"
    lastQuestionIndex: v.optional(v.number()), // Last question user was on
    canResume: v.optional(v.boolean()), // Whether session can be resumed
    abandonedAt: v.optional(v.number()), // When session was abandoned
    resumedAt: v.optional(v.number()), // When session was resumed
    sessionMetadata: v.optional(v.object({
      pauseCount: v.optional(v.number()),
      hintsUsed: v.optional(v.number()),
      averageTimePerQuestion: v.optional(v.number()),
      totalPauseTime: v.optional(v.number()), // Time spent paused
    })),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_completion", ["completedAt"])
    .index("by_created", ["createdAt"]),

  // Tags collection as specified in SPEC.md Section 5
  tags: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    color: v.optional(v.string()), // For UI display
    isActive: v.boolean(),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    questionCount: v.number(), // How many questions use this tag
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"]),

  // Individual question attempts (SPEC.md Section 5 - separate from sessions)
  attempts: defineTable({
    userId: v.id("users"),
    questionId: v.id("questions"),
    answer: v.number(), // User's selected answer
    isCorrect: v.boolean(),
    timeSpent: v.number(), // Time in seconds on this question
    sessionId: v.optional(v.id("quizSessions")), // Reference to session if part of one
    timestamp: v.number(),
    difficulty: v.string(), // Difficulty at time of attempt
    category: v.string(), // Category at time of attempt
    confidenceLevel: v.optional(v.number()), // 1-5 how confident user was
    hintUsed: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_question", ["questionId"])
    .index("by_user_question", ["userId", "questionId"])
    .index("by_session", ["sessionId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_correct", ["isCorrect"]),

  // Analytics and reporting data (SPEC.md Section 9)
  analytics: defineTable({
    eventType: v.string(), // "quiz_start", "quiz_complete", "question_view", "login", etc.
    userId: v.optional(v.id("users")),
    sessionId: v.optional(v.id("quizSessions")),
    questionId: v.optional(v.id("questions")),
    metadata: v.optional(v.object({
      score: v.optional(v.number()),
      timeSpent: v.optional(v.number()),
      difficulty: v.optional(v.string()),
      category: v.optional(v.string()),
      mode: v.optional(v.string()),
      pageUrl: v.optional(v.string()),
      referrer: v.optional(v.string()),
    })),
    timestamp: v.number(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()), // Hashed for privacy
    deviceType: v.optional(v.string()),
  })
    .index("by_event_type", ["eventType"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_event_timestamp", ["eventType", "timestamp"]),

  // Daily/weekly/monthly aggregated metrics (SPEC.md Section 9)
  metrics: defineTable({
    metricType: v.string(), // "daily_active_users", "quiz_completion_rate", "avg_session_length", etc.
    period: v.string(), // "2025-01-15" or "2025-01-W03" or "2025-01"
    value: v.number(),
    metadata: v.optional(v.object({
      category: v.optional(v.string()),
      difficulty: v.optional(v.string()),
      userRole: v.optional(v.string()),
      deviceType: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_metric_type", ["metricType"])
    .index("by_period", ["period"])
    .index("by_type_period", ["metricType", "period"])
    .index("by_created", ["createdAt"]),

  // Content management workflow audit trail (SPEC.md Section 4)
  auditLog: defineTable({
    entityType: v.string(), // "question", "user", "tag"
    entityId: v.string(), // ID of the entity
    action: v.string(), // "create", "update", "delete", "publish", "approve", "reject"
    userId: v.id("users"), // Who performed the action
    oldValues: v.optional(v.string()), // JSON string of previous values
    newValues: v.optional(v.string()), // JSON string of new values
    notes: v.optional(v.string()),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()), // Hashed
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_entity_timestamp", ["entityType", "timestamp"]),

  // User sessions for JWT management (SPEC.md Section 7)
  userSessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(), // JWT token hash
    expiresAt: v.number(),
    createdAt: v.number(),
    lastUsed: v.number(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()), // Hashed
    isActive: v.boolean(),
    deviceType: v.optional(v.string()),
    refreshTokenHash: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_token_hash", ["tokenHash"])
    .index("by_expires", ["expiresAt"])
    .index("by_active", ["isActive"])
    .index("by_last_used", ["lastUsed"]),

  // Enhanced leaderboard with more tracking
  leaderboard: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    points: v.number(),
    level: v.number(),
    accuracy: v.number(),
    totalQuizzes: v.number(),
    rank: v.number(),
    lastUpdated: v.number(),
    category: v.optional(v.string()), // Category-specific leaderboards
    period: v.optional(v.string()), // "weekly", "monthly", "all-time"
    streak: v.number(),
    avgSessionLength: v.number(),
  })
    .index("by_rank", ["rank"])
    .index("by_points", ["points"])
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_period", ["period"])
    .index("by_category_rank", ["category", "rank"]),

  // Bookmarked questions for users
  bookmarks: defineTable({
    userId: v.id("users"),
    questionId: v.id("questions"),
    createdAt: v.number(),
    notes: v.optional(v.string()), // User's personal notes
    tags: v.optional(v.array(v.string())), // User's personal tags
  })
    .index("by_user", ["userId"])
    .index("by_user_question", ["userId", "questionId"])
    .index("by_created", ["createdAt"]),

  // Flagged questions for review (enhanced)
  flaggedQuestions: defineTable({
    userId: v.id("users"),
    questionId: v.id("questions"),
    reason: v.string(),
    description: v.optional(v.string()), // Detailed description
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved"), v.literal("dismissed")),
    reviewedBy: v.optional(v.id("users")),
    reviewNotes: v.optional(v.string()),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
  })
    .index("by_user", ["userId"])
    .index("by_question", ["questionId"])
    .index("by_user_question", ["userId", "questionId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created", ["createdAt"]),

  // User relationships for friends/study groups
  friendships: defineTable({
    userId1: v.id("users"),
    userId2: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("blocked")),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_user1", ["userId1"])
    .index("by_user2", ["userId2"])
    .index("by_users", ["userId1", "userId2"])
    .index("by_status", ["status"]),

  // Study groups (enhanced)
  studyGroups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("users"),
    members: v.array(v.id("users")),
    isPublic: v.boolean(),
    category: v.optional(v.string()),
    createdAt: v.number(),
    isActive: v.boolean(),
    memberLimit: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    studyPlan: v.optional(v.string()), // JSON string of study plan
    lastActivity: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_public", ["isPublic"])
    .index("by_active", ["isActive"])
    .index("by_category", ["category"])
    .index("by_last_activity", ["lastActivity"]),

  // Quiz challenges between users (enhanced)
  challenges: defineTable({
    challengerId: v.id("users"),
    challengedId: v.id("users"),
    quizSessionId: v.optional(v.id("quizSessions")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("completed"), v.literal("declined"), v.literal("expired")),
    challengerScore: v.optional(v.number()),
    challengedScore: v.optional(v.number()),
    winnerId: v.optional(v.id("users")),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    questionCount: v.number(),
    timeLimit: v.optional(v.number()), // Time limit in seconds
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    prize: v.optional(v.string()), // Virtual prize/badge
    notes: v.optional(v.string()),
  })
    .index("by_challenger", ["challengerId"])
    .index("by_challenged", ["challengedId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_expires", ["expiresAt"]),

  // Content review workflow
  contentReviews: defineTable({
    questionId: v.id("questions"),
    reviewerId: v.id("users"),
    reviewType: v.union(v.literal("editorial"), v.literal("fact-check"), v.literal("quality")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("needs-revision")),
    score: v.optional(v.number()), // Quality score 1-5
    feedback: v.optional(v.string()),
    suggestedChanges: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  })
    .index("by_question", ["questionId"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created", ["createdAt"]),

  // Notification system
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "friend_request", "challenge", "achievement", "system"
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.string()), // JSON metadata
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "isRead"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  // System configuration and feature flags
  systemConfig: defineTable({
    key: v.string(),
    value: v.string(), // JSON string
    description: v.optional(v.string()),
    isActive: v.boolean(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
    category: v.optional(v.string()), // "feature-flags", "settings", "limits"
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // MVP: Seen questions tracking to prevent repetition
  seenQuestions: defineTable({
    userId: v.id("users"),
    questionId: v.id("questions"),
    seenAt: v.number(), // Timestamp when first seen
    seenCount: v.number(), // How many times seen
    lastSeenInSession: v.optional(v.id("quizSessions")), // Last session where seen
    wasAnswered: v.boolean(), // Whether user attempted to answer
    wasCorrect: v.optional(v.boolean()), // If answered, was it correct
    shouldAvoid: v.optional(v.boolean()), // Avoid showing again soon
    avoidUntil: v.optional(v.number()), // Timestamp to avoid until
  })
    .index("by_user", ["userId"])
    .index("by_question", ["questionId"])
    .index("by_user_question", ["userId", "questionId"])
    .index("by_user_seen", ["userId", "seenAt"])
    .index("by_should_avoid", ["shouldAvoid", "avoidUntil"])
    .index("by_user_unanswered", ["userId", "wasAnswered"]),
});