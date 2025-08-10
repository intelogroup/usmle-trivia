import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// System Management Functions - Tags, Notifications, Admin Operations

// ============= TAG MANAGEMENT =============

// Create tag
export const createTag = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    color: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      // Validate input
      if (!args.name || args.name.trim().length === 0) {
        throw new ConvexError("Tag name cannot be empty");
      }
      
      if (args.name.trim().length > 50) {
        throw new ConvexError("Tag name cannot exceed 50 characters");
      }
      
      // Validate color format if provided
      if (args.color && !/^#[0-9A-Fa-f]{6}$/.test(args.color)) {
        throw new ConvexError("Invalid color format. Use hex format like #3B82F6");
      }

      // Check user permissions
      const user = await ctx.db.get(args.createdBy);
      if (!user) {
        throw new ConvexError("User not found");
      }
      
      if (!["editor", "moderator", "admin"].includes(user.role)) {
        throw new ConvexError("Insufficient permissions to create tags");
      }

      const tagName = args.name.trim().toLowerCase();
      
      // Check if tag already exists with better error handling
      let existingTag;
      try {
        existingTag = await ctx.db
          .query("tags")
          .withIndex("by_name", (q) => q.eq("name", tagName))
          .first();
      } catch (error) {
        console.error("Error checking for existing tag:", error);
        throw new ConvexError("Failed to verify tag uniqueness");
      }

      if (existingTag) {
        throw new ConvexError(`Tag "${args.name.trim()}" already exists`);
      }

      const now = Date.now();

      // Create tag with error handling
      let tagId;
      try {
        tagId = await ctx.db.insert("tags", {
          name: tagName,
          description: args.description?.trim(),
          category: args.category?.trim(),
          color: args.color || "#3B82F6", // Default blue
          isActive: true,
          createdBy: args.createdBy,
          createdAt: now,
          questionCount: 0,
        });
      } catch (error) {
        console.error("Error creating tag:", error);
        throw new ConvexError("Failed to create tag");
      }

      // Log tag creation with fallback
      try {
        await ctx.db.insert("auditLog", {
          entityType: "tag",
          entityId: String(tagId),
          action: "create",
          userId: args.createdBy,
          notes: `Tag created: ${args.name}`,
          timestamp: now,
        });
      } catch (error) {
        console.error("Failed to log tag creation:", error);
        // Continue without failing - audit log is not critical for functionality
      }

      return { tagId, success: true, name: tagName };
      
    } catch (error) {
      console.error("Error in createTag:", error);
      
      if (error instanceof ConvexError) {
        throw error;
      }
      
      throw new ConvexError(`Failed to create tag: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Get all tags with filtering
export const getTags = query({
  args: {
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("tags");

    if (args.category) {
      query = query.withIndex("by_category", (q) => q.eq("category", args.category));
    } else if (args.isActive !== undefined) {
      query = query.withIndex("by_active", (q) => q.eq("isActive", args.isActive));
    }

    const tags = await query.take(args.limit || 100);

    // Sort by question count (most used first)
    return tags.sort((a, b) => b.questionCount - a.questionCount);
  },
});

// Update tag usage count when questions are tagged
export const updateTagUsage = mutation({
  args: {
    tagName: v.string(),
    increment: v.boolean(), // true to increment, false to decrement
  },
  handler: async (ctx, args) => {
    const tag = await ctx.db
      .query("tags")
      .withIndex("by_name", (q) => q.eq("name", args.tagName.toLowerCase()))
      .first();

    if (tag) {
      const newCount = Math.max(0, tag.questionCount + (args.increment ? 1 : -1));
      await ctx.db.patch(tag._id, {
        questionCount: newCount,
      });
    }

    return { success: true };
  },
});

// ============= NOTIFICATION SYSTEM =============

// Create notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.string()), // JSON string
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      isRead: false,
      createdAt: Date.now(),
      actionUrl: args.actionUrl,
      metadata: args.metadata,
    });

    return { notificationId, success: true };
  },
});

// Get user notifications
export const getUserNotifications = query({
  args: {
    userId: v.id("users"),
    isRead: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.isRead !== undefined) {
      query = query.filter((q) => q.eq(q.field("isRead"), args.isRead!));
    }

    const notifications = await query
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

// Mark notifications as read
export const markNotificationsRead = mutation({
  args: {
    userId: v.id("users"),
    notificationIds: v.optional(v.array(v.id("notifications"))),
    markAllRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    if (args.markAllRead) {
      // Mark all unread notifications as read for the user
      const unreadNotifications = await ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) => 
          q.eq("userId", args.userId).eq("isRead", false)
        )
        .collect();

      for (const notification of unreadNotifications) {
        await ctx.db.patch(notification._id, {
          isRead: true,
          readAt: now,
        });
      }

      return { success: true, markedCount: unreadNotifications.length };
    } else if (args.notificationIds) {
      // Mark specific notifications as read
      let markedCount = 0;
      for (const notificationId of args.notificationIds) {
        const notification = await ctx.db.get(notificationId);
        if (notification && notification.userId === args.userId && !notification.isRead) {
          await ctx.db.patch(notificationId, {
            isRead: true,
            readAt: now,
          });
          markedCount++;
        }
      }

      return { success: true, markedCount };
    }

    return { success: false, message: "No notifications specified" };
  },
});

// Get notification count
export const getNotificationCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    return { unreadCount: unreadNotifications.length };
  },
});

// ============= SYSTEM CONFIGURATION =============

// Set system configuration
export const setSystemConfig = mutation({
  args: {
    key: v.string(),
    value: v.string(), // JSON string
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    updatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.updatedBy);
    if (!user || user.role !== "admin") {
      throw new ConvexError("Only admins can update system configuration");
    }

    const now = Date.now();

    // Check if config already exists
    const existingConfig = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existingConfig) {
      // Update existing config
      await ctx.db.patch(existingConfig._id, {
        value: args.value,
        description: args.description,
        updatedBy: args.updatedBy,
        updatedAt: now,
      });

      // Log config update
      await ctx.db.insert("auditLog", {
        entityType: "config",
        entityId: existingConfig._id,
        action: "update",
        userId: args.updatedBy,
        oldValues: JSON.stringify({ value: existingConfig.value }),
        newValues: JSON.stringify({ value: args.value }),
        notes: `System config updated: ${args.key}`,
        timestamp: now,
      });

      return { configId: existingConfig._id, success: true };
    } else {
      // Create new config
      const configId = await ctx.db.insert("systemConfig", {
        key: args.key,
        value: args.value,
        description: args.description,
        isActive: true,
        updatedBy: args.updatedBy,
        updatedAt: now,
        category: args.category || "settings",
      });

      // Log config creation
      await ctx.db.insert("auditLog", {
        entityType: "config",
        entityId: configId,
        action: "create",
        userId: args.updatedBy,
        notes: `System config created: ${args.key}`,
        timestamp: now,
      });

      return { configId, success: true };
    }
  },
});

// Get system configuration
export const getSystemConfig = query({
  args: {
    key: v.optional(v.string()),
    category: v.optional(v.string()),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.requestingUserId);
    if (!user || !["admin", "moderator"].includes(user.role)) {
      throw new ConvexError("Insufficient permissions to view system configuration");
    }

    if (args.key) {
      // Get specific config
      const config = await ctx.db
        .query("systemConfig")
        .withIndex("by_key", (q) => q.eq("key", args.key))
        .first();
      return config;
    } else {
      // Get all configs or by category
      let query = ctx.db.query("systemConfig");
      
      if (args.category) {
        query = query.withIndex("by_category", (q) => q.eq("category", args.category));
      }

      const configs = await query.collect();
      return configs;
    }
  },
});

// ============= ADMIN OPERATIONS =============

// Get system health status
export const getSystemHealth = query({
  args: {
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.requestingUserId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("Admin access required");
    }

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Count various entities
    const totalUsers = await ctx.db.query("users").collect();
    const activeUsers = totalUsers.filter(u => u.isActive);
    const recentUsers = totalUsers.filter(u => u.createdAt >= oneWeekAgo);

    const totalQuestions = await ctx.db.query("questions").collect();
    const publishedQuestions = totalQuestions.filter(q => q.status === "published");
    const recentQuestions = totalQuestions.filter(q => q.createdAt >= oneWeekAgo);

    const totalSessions = await ctx.db.query("quizSessions").collect();
    const recentSessions = totalSessions.filter(s => s.createdAt >= oneDayAgo);
    const completedSessions = totalSessions.filter(s => s.status === "completed");

    const pendingReviews = await ctx.db
      .query("contentReviews")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const activeSessions = await ctx.db
      .query("userSessions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();

    const flaggedQuestions = await ctx.db
      .query("flaggedQuestions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Calculate health scores (0-100)
    const userHealthScore = Math.min(100, (activeUsers.length / Math.max(totalUsers.length, 1)) * 100);
    const contentHealthScore = Math.min(100, (publishedQuestions.length / Math.max(totalQuestions.length, 1)) * 100);
    const activityHealthScore = recentSessions.length > 10 ? 100 : (recentSessions.length / 10) * 100;
    const reviewHealthScore = pendingReviews.length < 10 ? 100 : Math.max(0, 100 - (pendingReviews.length - 10) * 5);

    const overallHealthScore = Math.round((userHealthScore + contentHealthScore + activityHealthScore + reviewHealthScore) / 4);

    return {
      overallHealth: overallHealthScore,
      timestamp: now,
      metrics: {
        users: {
          total: totalUsers.length,
          active: activeUsers.length,
          newThisWeek: recentUsers.length,
          activeSessions: activeSessions.length,
          healthScore: Math.round(userHealthScore),
        },
        content: {
          totalQuestions: totalQuestions.length,
          published: publishedQuestions.length,
          newThisWeek: recentQuestions.length,
          pendingReviews: pendingReviews.length,
          flaggedQuestions: flaggedQuestions.length,
          healthScore: Math.round(contentHealthScore),
        },
        activity: {
          totalSessions: totalSessions.length,
          completedSessions: completedSessions.length,
          sessionsToday: recentSessions.length,
          completionRate: Math.round((completedSessions.length / Math.max(totalSessions.length, 1)) * 100),
          healthScore: Math.round(activityHealthScore),
        },
        workflow: {
          pendingReviews: pendingReviews.length,
          reviewHealthScore: Math.round(reviewHealthScore),
        },
      },
      alerts: [
        ...(pendingReviews.length > 20 ? ["High number of pending reviews"] : []),
        ...(flaggedQuestions.length > 10 ? ["Multiple flagged questions need attention"] : []),
        ...(recentSessions.length < 5 ? ["Low activity in last 24 hours"] : []),
        ...(activeUsers.length / totalUsers.length < 0.7 ? ["Low user activation rate"] : []),
      ],
    };
  },
});

// Clean up expired data (maintenance function)
export const cleanupExpiredData = mutation({
  args: {
    adminUserId: v.id("users"),
    daysToKeep: v.optional(v.number()), // Default 90 days
  },
  handler: async (ctx, args) => {
    try {
      // Validate admin permissions
      const admin = await ctx.db.get(args.adminUserId);
      if (!admin) {
        throw new ConvexError("Admin user not found");
      }
      
      if (admin.role !== "admin") {
        throw new ConvexError("Admin access required");
      }

      // Validate daysToKeep parameter
      const daysToKeep = args.daysToKeep || 90;
      if (daysToKeep < 7) {
        throw new ConvexError("Cannot delete data newer than 7 days for safety");
      }
      
      if (daysToKeep > 365) {
        console.warn(`Large cleanup period specified: ${daysToKeep} days`);
      }

      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const startTime = Date.now();
      
      console.log(`Starting data cleanup: deleting data older than ${daysToKeep} days`);

      // Clean up old analytics events with batch processing
      let deletedAnalytics = 0;
      let analyticsErrors = 0;
      
      try {
        const oldAnalytics = await ctx.db
          .query("analytics")
          .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoffTime))
          .collect();

        console.log(`Found ${oldAnalytics.length} analytics events to delete`);

        for (const event of oldAnalytics) {
          try {
            await ctx.db.delete(event._id);
            deletedAnalytics++;
            
            // Log progress every 100 deletions
            if (deletedAnalytics % 100 === 0) {
              console.log(`Deleted ${deletedAnalytics}/${oldAnalytics.length} analytics events`);
            }
          } catch (error) {
            console.error(`Failed to delete analytics event ${event._id}:`, error);
            analyticsErrors++;
          }
        }
      } catch (error) {
        console.error("Error querying analytics for cleanup:", error);
        throw new ConvexError("Failed to query analytics data for cleanup");
      }

      // Clean up old audit logs (keep more recent ones)
      let deletedAuditLogs = 0;
      let auditErrors = 0;
      
      try {
        const auditCutoffTime = Date.now() - (365 * 24 * 60 * 60 * 1000); // 1 year
        const oldAuditLogs = await ctx.db
          .query("auditLog")
          .withIndex("by_timestamp", (q) => q.lt("timestamp", auditCutoffTime))
          .collect();

        console.log(`Found ${oldAuditLogs.length} audit logs to delete`);

        for (const log of oldAuditLogs) {
          try {
            await ctx.db.delete(log._id);
            deletedAuditLogs++;
            
            if (deletedAuditLogs % 50 === 0) {
              console.log(`Deleted ${deletedAuditLogs}/${oldAuditLogs.length} audit logs`);
            }
          } catch (error) {
            console.error(`Failed to delete audit log ${log._id}:`, error);
            auditErrors++;
          }
        }
      } catch (error) {
        console.error("Error querying audit logs for cleanup:", error);
        // Continue with other cleanup operations
      }

      // Clean up old expired sessions
      let deletedSessions = 0;
      let sessionErrors = 0;
      
      try {
        const now = Date.now();
        const expiredSessions = await ctx.db
          .query("userSessions")
          .withIndex("by_expires", (q) => q.lt("expiresAt", now))
          .filter((q) => q.eq(q.field("isActive"), false))
          .collect();

        console.log(`Found ${expiredSessions.length} expired sessions to delete`);

        for (const session of expiredSessions) {
          try {
            await ctx.db.delete(session._id);
            deletedSessions++;
          } catch (error) {
            console.error(`Failed to delete session ${session._id}:`, error);
            sessionErrors++;
          }
        }
      } catch (error) {
        console.error("Error querying expired sessions:", error);
        // Continue with cleanup completion
      }

      const duration = Date.now() - startTime;
      const summary = {
        success: true,
        deletedAnalytics,
        deletedAuditLogs, 
        deletedSessions,
        errors: {
          analyticsErrors,
          auditErrors,
          sessionErrors
        },
        daysToKeep,
        durationMs: duration
      };

      console.log(`Data cleanup completed in ${duration}ms:`, summary);

      // Log cleanup activity
      try {
        await ctx.db.insert("auditLog", {
          entityType: "system",
          entityId: "cleanup",
          action: "data_cleanup",
          userId: args.adminUserId,
          notes: `Deleted ${deletedAnalytics + deletedAuditLogs + deletedSessions} records (${daysToKeep} day retention)`,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Failed to log cleanup activity:", error);
      }

      return summary;
      
    } catch (error) {
      console.error("Error in cleanupExpiredData:", error);
      
      if (error instanceof ConvexError) {
        throw error;
      }
      
      throw new ConvexError(`Data cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});
    for (const session of expiredSessions) {
      await ctx.db.delete(session._id);
      deletedSessions++;
    }

    // Clean up old notifications (older than 6 months)
    const notificationCutoff = Date.now() - (180 * 24 * 60 * 60 * 1000);
    const oldNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_created", (q) => q.lt("createdAt", notificationCutoff))
      .filter((q) => q.eq(q.field("isRead"), true))
      .collect();

    let deletedNotifications = 0;
    for (const notification of oldNotifications) {
      await ctx.db.delete(notification._id);
      deletedNotifications++;
    }

    // Log cleanup operation
    await ctx.db.insert("auditLog", {
      entityType: "system",
      entityId: "cleanup",
      action: "data_cleanup",
      userId: args.adminUserId,
      notes: `Cleaned up: ${deletedAnalytics} analytics, ${deletedAuditLogs} audit logs, ${deletedSessions} sessions, ${deletedNotifications} notifications`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      summary: {
        analyticsDeleted: deletedAnalytics,
        auditLogsDeleted: deletedAuditLogs,
        sessionsDeleted: deletedSessions,
        notificationsDeleted: deletedNotifications,
      },
    };
  },
});

// Export data for compliance/backup
export const exportUserData = query({
  args: {
    userId: v.id("users"),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requestingUser = await ctx.db.get(args.requestingUserId);
    
    // Users can export their own data, admins can export any user's data
    if (args.userId !== args.requestingUserId && 
        (!requestingUser || requestingUser.role !== "admin")) {
      throw new ConvexError("Unauthorized to export this user's data");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Get user's data
    const quizSessions = await ctx.db
      .query("quizSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const flaggedQuestions = await ctx.db
      .query("flaggedQuestions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get user's created questions (if author/editor/etc)
    const createdQuestions = await ctx.db
      .query("questions")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .collect();

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        points: user.points,
        level: user.level,
        accuracy: user.accuracy,
        medicalLevel: user.medicalLevel,
        specialties: user.specialties,
        studyGoals: user.studyGoals,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      activity: {
        quizSessions: quizSessions.length,
        attempts: attempts.length,
        bookmarks: bookmarks.length,
        flaggedQuestions: flaggedQuestions.length,
        notifications: notifications.length,
        createdQuestions: createdQuestions.length,
      },
      exportDate: Date.now(),
    };
  },
});

// Feature flag management
export const setFeatureFlag = mutation({
  args: {
    flagName: v.string(),
    enabled: v.boolean(),
    adminUserId: v.id("users"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminUserId);
    if (!admin || admin.role !== "admin") {
      throw new ConvexError("Admin access required");
    }

    await ctx.db.insert("systemConfig", {
      key: `feature_${args.flagName}`,
      value: JSON.stringify({ enabled: args.enabled }),
      description: args.description || `Feature flag: ${args.flagName}`,
      isActive: true,
      updatedBy: args.adminUserId,
      updatedAt: Date.now(),
      category: "feature-flags",
    });

    return { success: true };
  },
});

// Get feature flags
export const getFeatureFlags = query({
  args: {
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.requestingUserId);
    if (!user || !["admin", "moderator"].includes(user.role)) {
      throw new ConvexError("Insufficient permissions to view feature flags");
    }

    const featureConfigs = await ctx.db
      .query("systemConfig")
      .withIndex("by_category", (q) => q.eq("category", "feature-flags"))
      .collect();

    return featureConfigs.map(config => ({
      name: config.key.replace('feature_', ''),
      enabled: JSON.parse(config.value).enabled,
      description: config.description,
      updatedAt: config.updatedAt,
    }));
  },
});