import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables, // Official Convex Auth tables
  
  // TEMPORARY: Override users table to allow existing medical fields during migration
  users: defineTable({
    // Standard Convex Auth fields
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    // TEMPORARY: Allow existing medical fields for migration
    accuracy: v.optional(v.number()),
    points: v.optional(v.number()),
    level: v.optional(v.number()),
    streak: v.optional(v.number()),
    totalQuizzes: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    emailVerified: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    role: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    lastLogin: v.optional(v.number()),
  }),
  
  // Medical app user profiles (separate from auth)
  userProfiles: defineTable({
    userId: v.string(), // Links to Convex Auth user
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    medicalLevel: v.optional(v.string()), // "student", "resident", "physician"
    specialties: v.optional(v.array(v.string())),
    studyGoals: v.optional(v.string()), // "USMLE Step 1", "USMLE Step 2", etc.
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      difficulty: v.optional(v.string()),
    })),
    // Game mechanics
    points: v.optional(v.number()),
    level: v.optional(v.number()),
    streak: v.optional(v.number()),
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
    totalQuizzes: v.optional(v.number()),
    accuracy: v.optional(v.number()),
    lastStudyDate: v.optional(v.string()), // YYYY-MM-DD
    streakFreezeCount: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    // Metadata
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_points", ["points"])
    .index("by_level", ["level"])
    .index("by_created", ["createdAt"]),

  questions: defineTable({
    question: v.string(),
    clinicalScenario: v.optional(v.string()), // Medical education specific field for USMLE
    options: v.array(v.string()),
    correctAnswer: v.number(),
    explanation: v.string(),
    medicalExplanation: v.optional(v.string()), // Enhanced medical explanation for USMLE
    category: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    usmleCategory: v.string(),
    tags: v.array(v.string()),
    medicalReferences: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    lastReviewed: v.optional(v.number()),
    // Content management workflow fields (SPEC.md Section 4) - made optional for migration
    status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("published"), v.literal("archived"))),
    authorId: v.optional(v.string()), // Who created the question - Convex Auth user ID
    editorId: v.optional(v.string()), // Who last edited - Convex Auth user ID  
    moderatorId: v.optional(v.string()), // Who approved - Convex Auth user ID
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
    // Medical education quiz sessions for USMLE preparation
    // Also aliased as quiz_sessions for backward compatibility
    userId: v.string(), // Convex Auth user ID
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
    createdBy: v.optional(v.string()), // Convex Auth user ID
    createdAt: v.number(),
    questionCount: v.number(), // How many questions use this tag
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .index("by_created_by", ["createdBy"]),

  // Individual question attempts (SPEC.md Section 5 - separate from sessions)
  attempts: defineTable({
    userId: v.string(), // Convex Auth user ID
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
    userId: v.optional(v.string()), // Convex Auth user ID
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
    userId: v.string(), // Convex Auth user ID - Who performed the action
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

  // Note: User sessions are handled automatically by Convex Auth

  // Enhanced leaderboard with more tracking
  leaderboard: defineTable({
    userId: v.string(), // Convex Auth user ID
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
    userId: v.string(), // Convex Auth user ID
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
    userId: v.string(), // Convex Auth user ID
    questionId: v.id("questions"),
    reason: v.string(),
    description: v.optional(v.string()), // Detailed description
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved"), v.literal("dismissed")),
    reviewedBy: v.optional(v.string()), // Convex Auth user ID
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
    userId1: v.string(), // Convex Auth user ID
    userId2: v.string(), // Convex Auth user ID
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
    creatorId: v.string(), // Convex Auth user ID
    members: v.array(v.string()), // Convex Auth user ID
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
    challengerId: v.string(), // Convex Auth user ID
    challengedId: v.string(), // Convex Auth user ID
    quizSessionId: v.optional(v.id("quizSessions")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("completed"), v.literal("declined"), v.literal("expired")),
    challengerScore: v.optional(v.number()),
    challengedScore: v.optional(v.number()),
    winnerId: v.optional(v.string()), // Convex Auth user ID
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
    reviewerId: v.string(), // Convex Auth user ID
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
    userId: v.string(), // Convex Auth user ID
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
    updatedBy: v.string(), // Convex Auth user ID
    updatedAt: v.number(),
    category: v.optional(v.string()), // "feature-flags", "settings", "limits"
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // MVP: Seen questions tracking to prevent repetition
  seenQuestions: defineTable({
    userId: v.string(), // Convex Auth user ID
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

  // Comprehensive quiz results for advanced analytics
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

  // Backward compatibility alias for quiz_sessions (referenced by testing framework)
  quiz_sessions: defineTable({
    // This is an alias for quizSessions table to support legacy references
    userId: v.string(), // Convex Auth user ID
    mode: v.union(v.literal("quick"), v.literal("timed"), v.literal("custom")),
    questions: v.array(v.id("questions")),
    answers: v.array(v.union(v.number(), v.null())),
    score: v.number(),
    timeSpent: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("abandoned")),
    completedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
});