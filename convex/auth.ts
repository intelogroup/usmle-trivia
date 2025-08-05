import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new user account
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(), // In a real app, this would be hashed
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User with this email already exists");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      points: 0,
      level: 1,
      streak: 0,
      totalQuizzes: 0,
      accuracy: 0,
    });

    return userId;
  },
});

// Get user by email (for login)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return user;
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      avatar: v.optional(v.string()),
      medicalLevel: v.optional(v.string()),
      specialties: v.optional(v.array(v.string())),
      studyGoals: v.optional(v.string()),
      preferences: v.optional(v.object({
        theme: v.optional(v.string()),
        notifications: v.optional(v.boolean()),
        difficulty: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, updates } = args;
    
    await ctx.db.patch(userId, updates);
    
    return await ctx.db.get(userId);
  },
});

// Update user stats after quiz completion
export const updateUserStats = mutation({
  args: {
    userId: v.id("users"),
    quizScore: v.number(),
    questionsCount: v.number(),
    pointsEarned: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, quizScore, questionsCount, pointsEarned } = args;
    
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Calculate new accuracy
    const totalQuestionsAnswered = user.totalQuizzes * 10 + questionsCount; // Assuming average 10 questions per quiz
    const currentCorrectAnswers = (user.accuracy / 100) * (user.totalQuizzes * 10);
    const newCorrectAnswers = currentCorrectAnswers + (quizScore / 100) * questionsCount;
    const newAccuracy = totalQuestionsAnswered > 0 
      ? Math.round((newCorrectAnswers / totalQuestionsAnswered) * 100) 
      : 0;

    // Calculate new level (level up every 1000 points)
    const newPoints = user.points + pointsEarned;
    const newLevel = Math.floor(newPoints / 1000) + 1;

    await ctx.db.patch(userId, {
      points: newPoints,
      level: newLevel,
      totalQuizzes: user.totalQuizzes + 1,
      accuracy: newAccuracy,
    });

    return await ctx.db.get(userId);
  },
});

// Get leaderboard
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const users = await ctx.db
      .query("users")
      .withIndex("by_points")
      .order("desc")
      .take(limit);

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar,
      points: user.points,
      level: user.level,
      accuracy: user.accuracy,
      totalQuizzes: user.totalQuizzes,
    }));
  },
});

// Get user profile with extended stats
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Get quiz statistics
    const quizSessions = await ctx.db
      .query("quizSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const completedSessions = quizSessions.filter(s => s.status === "completed");
    const totalQuizzes = completedSessions.length;
    const totalQuestions = completedSessions.reduce((sum, s) => sum + s.questions.length, 0);
    const averageScore = totalQuizzes > 0
      ? Math.round(completedSessions.reduce((sum, s) => sum + s.score, 0) / totalQuizzes)
      : 0;
    
    // Get friend count
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.eq(q.field("userId1"), args.userId),
          q.eq(q.field("userId2"), args.userId)
        )
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();
    
    const friendCount = friendships.length;
    
    // Get study groups
    const studyGroups = await ctx.db
      .query("studyGroups")
      .filter((q) => q.eq(q.field("creatorId"), args.userId))
      .collect();
    
    // Get bookmarked questions count
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return {
      ...user,
      stats: {
        totalQuizzes,
        totalQuestions,
        averageScore,
        friendCount,
        studyGroupCount: studyGroups.length,
        bookmarkedQuestions: bookmarks.length,
      },
    };
  },
});

// Search users by name or email
export const searchUsers = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const searchLower = args.searchTerm.toLowerCase();
    
    // Get all users and filter by search term
    const allUsers = await ctx.db.query("users").collect();
    
    const filtered = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
    
    return filtered.slice(0, limit).map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      level: user.level,
      points: user.points,
    }));
  },
});