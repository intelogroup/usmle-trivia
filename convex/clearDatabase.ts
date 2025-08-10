import { mutation } from "./_generated/server";

// DANGER: This will clear all user data - use only for migration
export const clearUserData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🚨 CLEARING ALL USER DATA FOR CONVEX AUTH MIGRATION");
    
    let deletedCounts = {
      users: 0,
      userSessions: 0,
      quizSessions: 0,
      analytics: 0,
      attempts: 0,
      bookmarks: 0,
      flaggedQuestions: 0,
      friendships: 0,
      challenges: 0,
      notifications: 0,
      auditLog: 0,
      seenQuestions: 0,
      quizResults: 0,
    };
    
    try {
      // Clear users table
      const users = await ctx.db.query("users").collect();
      for (const user of users) {
        await ctx.db.delete(user._id);
        deletedCounts.users++;
      }
      
      // Clear userSessions table  
      const sessions = await ctx.db.query("userSessions").collect();
      for (const session of sessions) {
        await ctx.db.delete(session._id);
        deletedCounts.userSessions++;
      }
      
      // Clear user-specific data from other tables
      const quizSessions = await ctx.db.query("quizSessions").collect();
      for (const session of quizSessions) {
        await ctx.db.delete(session._id);
        deletedCounts.quizSessions++;
      }
      
      // Clear analytics data
      const analytics = await ctx.db.query("analytics").collect();
      for (const record of analytics) {
        await ctx.db.delete(record._id);
        deletedCounts.analytics++;
      }
      
      // Clear attempts
      const attempts = await ctx.db.query("attempts").collect();
      for (const attempt of attempts) {
        await ctx.db.delete(attempt._id);
        deletedCounts.attempts++;
      }
      
      // Clear bookmarks
      const bookmarks = await ctx.db.query("bookmarks").collect();
      for (const bookmark of bookmarks) {
        await ctx.db.delete(bookmark._id);
        deletedCounts.bookmarks++;
      }
      
      // Clear flagged questions
      const flagged = await ctx.db.query("flaggedQuestions").collect();
      for (const flag of flagged) {
        await ctx.db.delete(flag._id);
        deletedCounts.flaggedQuestions++;
      }
      
      // Clear social features
      const friendships = await ctx.db.query("friendships").collect();
      for (const friendship of friendships) {
        await ctx.db.delete(friendship._id);
        deletedCounts.friendships++;
      }
      
      const challenges = await ctx.db.query("challenges").collect();
      for (const challenge of challenges) {
        await ctx.db.delete(challenge._id);
        deletedCounts.challenges++;
      }
      
      // Clear notifications
      const notifications = await ctx.db.query("notifications").collect();
      for (const notification of notifications) {
        await ctx.db.delete(notification._id);
        deletedCounts.notifications++;
      }
      
      // Clear audit logs
      const auditLogs = await ctx.db.query("auditLog").collect();
      for (const log of auditLogs) {
        await ctx.db.delete(log._id);
        deletedCounts.auditLog++;
      }
      
      // Clear seen questions
      const seenQuestions = await ctx.db.query("seenQuestions").collect();
      for (const seen of seenQuestions) {
        await ctx.db.delete(seen._id);
        deletedCounts.seenQuestions++;
      }
      
      // Clear quiz results
      const quizResults = await ctx.db.query("quizResults").collect();
      for (const result of quizResults) {
        await ctx.db.delete(result._id);
        deletedCounts.quizResults++;
      }
      
      console.log("✅ Database clearing completed:", deletedCounts);
      
      return {
        success: true,
        message: "All user data cleared successfully",
        deletedCounts,
        timestamp: Date.now(),
      };
      
    } catch (error) {
      console.error("❌ Error clearing database:", error);
      return {
        success: false,
        message: `Error clearing database: ${error}`,
        deletedCounts,
        timestamp: Date.now(),
      };
    }
  },
});

// Verify database is empty
export const verifyDatabaseEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const counts = {
      users: (await ctx.db.query("users").collect()).length,
      userSessions: (await ctx.db.query("userSessions").collect()).length,
      quizSessions: (await ctx.db.query("quizSessions").collect()).length,
      analytics: (await ctx.db.query("analytics").collect()).length,
      attempts: (await ctx.db.query("attempts").collect()).length,
      bookmarks: (await ctx.db.query("bookmarks").collect()).length,
      flaggedQuestions: (await ctx.db.query("flaggedQuestions").collect()).length,
      friendships: (await ctx.db.query("friendships").collect()).length,
      challenges: (await ctx.db.query("challenges").collect()).length,
      notifications: (await ctx.db.query("notifications").collect()).length,
      auditLog: (await ctx.db.query("auditLog").collect()).length,
      seenQuestions: (await ctx.db.query("seenQuestions").collect()).length,
      quizResults: (await ctx.db.query("quizResults").collect()).length,
    };
    
    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return {
      isEmpty: totalRecords === 0,
      counts,
      totalRecords,
      timestamp: Date.now(),
    };
  },
});