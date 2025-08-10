import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Create user profile after Convex Auth creates user
export const createUserProfile = mutation({
  args: {
    userId: v.string(), // From Convex Auth
    medicalLevel: v.optional(v.string()),
    studyGoals: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
      
    if (existing) {
      return { profileId: existing._id, message: "Profile already exists" };
    }
    
    // Create medical profile with defaults
    const profileId = await ctx.db.insert("userProfiles", {
      userId: args.userId,
      medicalLevel: args.medicalLevel || "student",
      studyGoals: args.studyGoals,
      preferences: {
        theme: "light",
        notifications: true,
        difficulty: "medium",
      },
      // Initialize game mechanics
      points: 0,
      level: 1,
      streak: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalQuizzes: 0,
      accuracy: 0,
      streakFreezeCount: 3, // Start with 3 streak freezes
      lastStudyDate: new Date().toISOString().split('T')[0],
      // Metadata
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    console.log(`✅ Created user profile for ${args.userId}`);
    
    return { profileId, message: "Profile created successfully" };
  },
});

// Get user profile by user ID
export const getUserProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
  },
});

// Get current user's profile (uses auth context)
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .first();
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.string(),
    updates: v.object({
      medicalLevel: v.optional(v.string()),
      studyGoals: v.optional(v.string()),
      preferences: v.optional(v.object({
        theme: v.optional(v.string()),
        notifications: v.optional(v.boolean()),
        difficulty: v.optional(v.string()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
      
    if (!profile) {
      throw new ConvexError("User profile not found");
    }
    
    await ctx.db.patch(profile._id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(profile._id);
  },
});

// Update user stats after quiz completion
export const updateUserStats = mutation({
  args: {
    userId: v.string(),
    pointsEarned: v.number(),
    quizScore: v.number(),
    questionsCount: v.number(),
    timeSpent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log(`📊 Updating stats for user ${args.userId}: +${args.pointsEarned} points, ${args.quizScore}% score`);
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();
      
    if (!profile) {
      throw new ConvexError("User profile not found - create profile first");
    }
    
    // Calculate new totals
    const currentPoints = profile.points || 0;
    const currentTotalQuizzes = profile.totalQuizzes || 0;
    const currentAccuracy = profile.accuracy || 0;
    
    // Update points and level
    const newPoints = currentPoints + args.pointsEarned;
    const newLevel = Math.floor(newPoints / 100) + 1;
    
    // Calculate new weighted accuracy
    const newTotalQuizzes = currentTotalQuizzes + 1;
    const newAccuracy = currentTotalQuizzes === 0 
      ? args.quizScore 
      : Math.round((currentAccuracy * currentTotalQuizzes + args.quizScore) / newTotalQuizzes);
    
    // Update study streak
    const today = new Date().toISOString().split('T')[0];
    const lastStudyDate = profile.lastStudyDate;
    
    let newCurrentStreak = profile.currentStreak || 0;
    let newLongestStreak = profile.longestStreak || 0;
    
    if (lastStudyDate !== today) {
      // Check if this maintains the streak (yesterday or today)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastStudyDate === yesterdayStr) {
        // Continuing streak
        newCurrentStreak = newCurrentStreak + 1;
      } else {
        // Streak broken or first quiz
        newCurrentStreak = 1;
      }
      
      // Update longest streak
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    }
    
    // Update profile
    await ctx.db.patch(profile._id, {
      points: newPoints,
      level: newLevel,
      totalQuizzes: newTotalQuizzes,
      accuracy: newAccuracy,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      streak: newCurrentStreak, // Backward compatibility
      lastStudyDate: today,
      updatedAt: Date.now(),
    });
    
    console.log(`✅ Stats updated: Points: ${currentPoints} → ${newPoints}, Level: ${profile.level} → ${newLevel}, Streak: ${newCurrentStreak}`);
    
    // Return updated stats for UI feedback
    return {
      success: true,
      changes: {
        pointsEarned: args.pointsEarned,
        newPoints,
        newLevel,
        newAccuracy,
        newTotalQuizzes,
        streakContinued: newCurrentStreak > (profile.currentStreak || 0),
        newCurrentStreak,
        levelUp: newLevel > (profile.level || 1),
      },
      message: `Great job! You earned ${args.pointsEarned} points and scored ${args.quizScore}%`
    };
  },
});

// Get leaderboard with user profiles
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_points", q => q)
      .order("desc")
      .take(args.limit || 10);
    
    // Get user details from Convex Auth for each profile
    const leaderboard = await Promise.all(
      profiles.map(async (profile, index) => {
        // Note: We'll need to get user details from Convex Auth user table
        // For now, return profile data only
        return {
          userId: profile.userId,
          userName: `User ${profile.userId.slice(0, 8)}`, // Placeholder until we get actual names
          points: profile.points || 0,
          accuracy: profile.accuracy || 0,
          totalQuizzes: profile.totalQuizzes || 0,
          level: profile.level || 1,
          streak: profile.currentStreak || 0,
          rank: index + 1,
        };
      })
    );
    
    return leaderboard;
  },
});

// Search user profiles  
export const searchUserProfiles = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Simple search by user ID (we'll need to enhance this)
    const profiles = await ctx.db.query("userProfiles").collect();
    
    const filtered = profiles
      .filter(profile => 
        profile.userId.toLowerCase().includes(args.searchTerm.toLowerCase()) ||
        (profile.medicalLevel && profile.medicalLevel.toLowerCase().includes(args.searchTerm.toLowerCase()))
      )
      .slice(0, args.limit || 20);
    
    return filtered;
  },
});

// Initialize user profile after Convex Auth registration
export const initializeUserProfileFromAuth = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }
    
    // Check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .first();
      
    if (existing) {
      return { profileId: existing._id, message: "Profile already exists" };
    }
    
    // Create default profile
    const profileId = await ctx.db.insert("userProfiles", {
      userId: identity.subject,
      medicalLevel: "student", // Default
      studyGoals: undefined,
      preferences: {
        theme: "light",
        notifications: true,
        difficulty: "medium",
      },
      points: 0,
      level: 1,
      streak: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalQuizzes: 0,
      accuracy: 0,
      streakFreezeCount: 3,
      lastStudyDate: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    console.log(`✅ Auto-created profile for authenticated user ${identity.subject}`);
    
    return { profileId, message: "Profile auto-created successfully" };
  },
});