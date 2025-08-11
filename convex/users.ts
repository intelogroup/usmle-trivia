import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

/**
 * Get current user's Clerk ID from auth context
 */
const getCurrentClerkUserId = (ctx: any) => {
  const identity = ctx.auth.getUserIdentity();
  
  if (!identity) {
    return null;
  }

  // Clerk stores the user ID in the subject field
  return identity.subject;
};

/**
 * Get or create a user profile for the authenticated user
 * This function ensures every Clerk user has a corresponding profile in Convex
 */
export const getOrCreateUserProfile = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;

    // Check if user profile already exists
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", clerkUserId))
      .unique();

    if (!userProfile) {
      // Create new user profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId: clerkUserId,
        email: args.email || identity.email,
        name: args.name || identity.name,
        medicalLevel: "student", // Default to student
        points: 0,
        level: 1,
        streak: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalQuizzes: 0,
        accuracy: 0,
        streakFreezeCount: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      userProfile = await ctx.db.get(profileId);
    }

    return userProfile;
  },
});

/**
 * Get the current user's profile
 */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    const clerkUserId = identity.subject;

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", clerkUserId))
      .unique();

    return userProfile;
  },
});

/**
 * Update user profile information
 */
export const updateUserProfile = mutation({
  args: {
    medicalLevel: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    studyGoals: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.optional(v.string()),
      notifications: v.optional(v.boolean()),
      difficulty: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", clerkUserId))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    await ctx.db.patch(userProfile._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userProfile._id);
  },
});

/**
 * Update user game statistics (points, level, streak, etc.)
 */
export const updateUserStats = mutation({
  args: {
    points: v.optional(v.number()),
    level: v.optional(v.number()),
    streak: v.optional(v.number()),
    totalQuizzes: v.optional(v.number()),
    accuracy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", clerkUserId))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Update current streak and track longest streak
    const updates: any = {
      ...args,
      updatedAt: Date.now(),
    };

    if (args.streak !== undefined) {
      updates.currentStreak = args.streak;
      updates.longestStreak = Math.max(userProfile.longestStreak || 0, args.streak);
    }

    await ctx.db.patch(userProfile._id, updates);

    return await ctx.db.get(userProfile._id);
  },
});

/**
 * Sync user data from Clerk webhook
 * This function should be called when user data is updated in Clerk
 */
export const syncUserFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This is typically called from a webhook, so we don't check auth
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkUserId))
      .unique();

    if (userProfile) {
      // Update existing profile
      await ctx.db.patch(userProfile._id, {
        email: args.email,
        name: args.name,
        updatedAt: Date.now(),
      });
    } else {
      // Create new profile
      await ctx.db.insert("userProfiles", {
        userId: args.clerkUserId,
        email: args.email,
        name: args.name,
        medicalLevel: "student",
        points: 0,
        level: 1,
        streak: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalQuizzes: 0,
        accuracy: 0,
        streakFreezeCount: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Get leaderboard data
 */
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const userProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_points")
      .order("desc")
      .take(limit);

    return userProfiles.map((profile, index) => ({
      ...profile,
      rank: index + 1,
    }));
  },
});