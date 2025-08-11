import { v } from "convex/values";
import { internalQuery, internalMutation } from "./_generated/server";

/**
 * Internal function to get or create user from Clerk token
 * This bridges Clerk authentication with Convex data storage
 */
export const getOrCreateUser = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists in userProfiles
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkUserId))
      .unique();

    if (!userProfile) {
      // Create new user profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId: args.clerkUserId,
        email: args.email,
        name: args.name,
        medicalLevel: "student", // Default level
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
    } else {
      // Update existing profile with latest info from Clerk
      await ctx.db.patch(userProfile._id, {
        email: args.email,
        name: args.name,
        updatedAt: Date.now(),
      });

      userProfile = await ctx.db.get(userProfile._id);
    }

    return userProfile;
  },
});

/**
 * Internal function to get user profile by Clerk ID
 */
export const getUserProfile = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.clerkUserId))
      .unique();

    return userProfile;
  },
});

/**
 * Get the current user's Clerk ID from the authentication context
 * This function extracts the user ID from Clerk JWT token
 */
export const getCurrentClerkUserId = (ctx: any) => {
  const identity = ctx.auth.getUserIdentity();
  
  if (!identity) {
    return null;
  }

  // Clerk stores the user ID in the subject field
  return identity.subject;
};