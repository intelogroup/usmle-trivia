import { mutation } from "./_generated/server";

// DANGER: This will clear all user data - use only for migration
export const clearUserData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🚨 CLEARING ALL USER DATA FOR CONVEX AUTH MIGRATION");
    
    let deletedCounts = {
      users: 0,
      userProfiles: 0,
      userSessions: 0,
      quizSessions: 0,
      quiz_sessions: 0,
      analytics: 0,
      attempts: 0,
      bookmarks: 0,
      flaggedQuestions: 0,
      friendships: 0,
      studyGroups: 0,
      challenges: 0,
      contentReviews: 0,
      notifications: 0,
      auditLog: 0,
      seenQuestions: 0,
      quizResults: 0,
      leaderboard: 0,
      metrics: 0,
    };
    
    try {
      // Clear users table
      const users = await ctx.db.query("users").collect();
      for (const user of users) {
        await ctx.db.delete(user._id);
        deletedCounts.users++;
      }
      
      // Clear userProfiles table  
      const userProfiles = await ctx.db.query("userProfiles").collect();
      for (const profile of userProfiles) {
        await ctx.db.delete(profile._id);
        deletedCounts.userProfiles++;
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
      
      // Clear quiz_sessions (backward compatibility table)
      const quiz_sessions = await ctx.db.query("quiz_sessions").collect();
      for (const session of quiz_sessions) {
        await ctx.db.delete(session._id);
        deletedCounts.quiz_sessions++;
      }
      
      // Clear leaderboard
      const leaderboard = await ctx.db.query("leaderboard").collect();
      for (const entry of leaderboard) {
        await ctx.db.delete(entry._id);
        deletedCounts.leaderboard++;
      }
      
      // Clear study groups
      const studyGroups = await ctx.db.query("studyGroups").collect();
      for (const group of studyGroups) {
        await ctx.db.delete(group._id);
        deletedCounts.studyGroups++;
      }
      
      // Clear content reviews
      const contentReviews = await ctx.db.query("contentReviews").collect();
      for (const review of contentReviews) {
        await ctx.db.delete(review._id);
        deletedCounts.contentReviews++;
      }
      
      // Clear metrics (user-specific metrics)
      const metrics = await ctx.db.query("metrics").collect();
      for (const metric of metrics) {
        await ctx.db.delete(metric._id);
        deletedCounts.metrics++;
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
      userProfiles: (await ctx.db.query("userProfiles").collect()).length,
      userSessions: (await ctx.db.query("userSessions").collect()).length,
      quizSessions: (await ctx.db.query("quizSessions").collect()).length,
      quiz_sessions: (await ctx.db.query("quiz_sessions").collect()).length,
      analytics: (await ctx.db.query("analytics").collect()).length,
      attempts: (await ctx.db.query("attempts").collect()).length,
      bookmarks: (await ctx.db.query("bookmarks").collect()).length,
      flaggedQuestions: (await ctx.db.query("flaggedQuestions").collect()).length,
      friendships: (await ctx.db.query("friendships").collect()).length,
      studyGroups: (await ctx.db.query("studyGroups").collect()).length,
      challenges: (await ctx.db.query("challenges").collect()).length,
      contentReviews: (await ctx.db.query("contentReviews").collect()).length,
      notifications: (await ctx.db.query("notifications").collect()).length,
      auditLog: (await ctx.db.query("auditLog").collect()).length,
      seenQuestions: (await ctx.db.query("seenQuestions").collect()).length,
      quizResults: (await ctx.db.query("quizResults").collect()).length,
      leaderboard: (await ctx.db.query("leaderboard").collect()).length,
      metrics: (await ctx.db.query("metrics").collect()).length,
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

// Verify what data will be preserved (questions, tags, system config)
export const verifyPreservedData = mutation({
  args: {},
  handler: async (ctx) => {
    const preservedData = {
      questions: (await ctx.db.query("questions").collect()).length,
      tags: (await ctx.db.query("tags").collect()).length,
      systemConfig: (await ctx.db.query("systemConfig").collect()).length,
    };
    
    // Get a sample of questions to verify they exist
    const sampleQuestions = await ctx.db.query("questions").take(5);
    const questionSamples = sampleQuestions.map(q => ({
      id: q._id,
      question: q.question.substring(0, 50) + "...",
      category: q.category,
      difficulty: q.difficulty,
    }));
    
    return {
      preservedData,
      questionSamples,
      message: "This data will be preserved after user data cleanup",
      timestamp: Date.now(),
    };
  },
});