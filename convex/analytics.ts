import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Analytics and Reporting Functions - SPEC.md Section 9 Implementation

// Track events for analytics (page views, quiz events, user actions)
export const trackEvent = mutation({
  args: {
    eventType: v.string(),
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
    userAgent: v.optional(v.string()),
    deviceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Validate event type
      const validEventTypes = [
        "quiz_start", "quiz_complete", "question_view", "answer_selected",
        "login", "logout", "registration", "page_view"
      ];
      
      if (!validEventTypes.includes(args.eventType)) {
        console.warn(`Unknown event type: ${args.eventType}`);
      }
      
      const timestamp = Date.now();
      
      // Validate user exists if provided
      if (args.userId) {
        const user = await ctx.db.get(args.userId);
        if (!user) {
          console.warn(`Event tracking: User ${args.userId} not found`);
          // Continue tracking event but note the issue
        }
      }
      
      // Validate session exists if provided
      if (args.sessionId) {
        const session = await ctx.db.get(args.sessionId);
        if (!session) {
          console.warn(`Event tracking: Session ${args.sessionId} not found`);
        }
      }
      
      // Create analytics event with error recovery
      const eventId = await ctx.db.insert("analytics", {
        eventType: args.eventType,
        userId: args.userId,
        sessionId: args.sessionId,
        questionId: args.questionId,
        metadata: args.metadata,
        timestamp,
        userAgent: args.userAgent,
        deviceType: args.deviceType,
        // Note: ipAddress would be hashed in production for privacy
      });

      return { success: true, eventId };
      
    } catch (error) {
      console.error(`Failed to track event ${args.eventType}:`, error);
      
      // Try to insert a minimal event record for debugging
      try {
        await ctx.db.insert("analytics", {
          eventType: "error_tracking_failed",
          userId: args.userId,
          metadata: { 
            originalEventType: args.eventType,
            error: error instanceof Error ? error.message : String(error)
          },
          timestamp: Date.now(),
        });
      } catch (fallbackError) {
        console.error("Failed to insert fallback event:", fallbackError);
      }
      
      // Don't throw error for analytics - return success to avoid breaking user flows
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
});

// Generate daily metrics aggregation
export const generateDailyMetrics = mutation({
  args: {
    date: v.string(), // Format: "2025-01-15"
  },
  handler: async (ctx, args) => {
    try {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(args.date)) {
        throw new ConvexError("Invalid date format. Expected YYYY-MM-DD");
      }

      const startTime = new Date(args.date).getTime();
      
      // Validate date is valid
      if (isNaN(startTime)) {
        throw new ConvexError("Invalid date provided");
      }
      
      const endTime = startTime + (24 * 60 * 60 * 1000); // 24 hours

      // Get all analytics events for the day with error handling
      let dayEvents;
      try {
        dayEvents = await ctx.db
          .query("analytics")
          .withIndex("by_timestamp", (q) => q.gte("timestamp", startTime).lt("timestamp", endTime))
          .collect();
      } catch (error) {
        console.error(`Failed to query analytics for date ${args.date}:`, error);
        throw new ConvexError("Failed to retrieve analytics data");
      }

      // Calculate metrics with error handling
      let dau = 0;
      let completionRate = 0;
      let avgSessionLength = 0;
      let avgQuizScore = 0;
      let pageViews = 0;
      let questionAttempts = 0;
      let registrations = 0;
      let logins = 0;

      try {
        // Calculate Daily Active Users (DAU)
        const uniqueUsers = new Set(dayEvents.filter(e => e.userId).map(e => e.userId));
        dau = uniqueUsers.size;

        // Quiz completion rate
        const quizStartEvents = dayEvents.filter(e => e.eventType === "quiz_start");
        const quizCompleteEvents = dayEvents.filter(e => e.eventType === "quiz_complete");
        completionRate = quizStartEvents.length > 0 
          ? Math.round((quizCompleteEvents.length / quizStartEvents.length) * 100) 
          : 0;

        // Average session length
        const sessionLengths = quizCompleteEvents
          .map(e => e.metadata?.timeSpent)
          .filter(t => typeof t === 'number' && t > 0) as number[];
        avgSessionLength = sessionLengths.length > 0
          ? Math.round(sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length)
          : 0;

        // Average quiz score
        const quizScores = quizCompleteEvents
          .map(e => e.metadata?.score)
          .filter(s => typeof s === 'number' && s >= 0) as number[];
        avgQuizScore = quizScores.length > 0
          ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
          : 0;

        // Count events
        pageViews = dayEvents.filter(e => e.eventType === "page_view").length;
        questionAttempts = dayEvents.filter(e => e.eventType === "question_attempt").length;
        registrations = dayEvents.filter(e => e.eventType === "user_register" || e.eventType === "registration").length;
        logins = dayEvents.filter(e => e.eventType === "login").length;
        
      } catch (error) {
        console.error(`Error calculating metrics for date ${args.date}:`, error);
        // Continue with default values (0) rather than failing completely
      }

      const now = Date.now();
      const metrics = [
        { metricType: "daily_active_users", period: args.date, value: dau },
        { metricType: "quiz_completion_rate", period: args.date, value: completionRate },
        { metricType: "avg_session_length", period: args.date, value: avgSessionLength },
        { metricType: "avg_quiz_score", period: args.date, value: avgQuizScore },
        { metricType: "page_views", period: args.date, value: pageViews },
        { metricType: "question_attempts", period: args.date, value: questionAttempts },
        { metricType: "user_registrations", period: args.date, value: registrations },
        { metricType: "user_logins", period: args.date, value: logins },
      ];

      // Insert metrics into database with individual error handling
      let successfulInserts = 0;
      const failedMetrics = [];

      for (const metric of metrics) {
        try {
          // Check if metric already exists for this date
          const existing = await ctx.db
            .query("metrics")
            .withIndex("by_type_period", (q) => 
              q.eq("metricType", metric.metricType).eq("period", metric.period)
            )
            .first();

          if (existing) {
            // Update existing metric
            await ctx.db.patch(existing._id, {
              value: metric.value,
              updatedAt: now,
            });
          } else {
            // Create new metric
            await ctx.db.insert("metrics", {
              ...metric,
              createdAt: now,
              updatedAt: now,
            });
          }
          successfulInserts++;
          
        } catch (error) {
          console.error(`Failed to insert metric ${metric.metricType} for ${args.date}:`, error);
          failedMetrics.push(metric.metricType);
        }
      }

      if (failedMetrics.length > 0) {
        console.warn(`Failed to insert ${failedMetrics.length} metrics: ${failedMetrics.join(', ')}`);
      }

      return { 
        success: true, 
        metricsGenerated: successfulInserts,
        totalEvents: dayEvents.length,
        failedMetrics: failedMetrics.length > 0 ? failedMetrics : undefined
      };
      
    } catch (error) {
      console.error(`Failed to generate daily metrics for ${args.date}:`, error);
      
      if (error instanceof ConvexError) {
        throw error;
      }
      
      throw new ConvexError(`Failed to generate daily metrics: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Get performance dashboard data
export const getDashboardMetrics = query({
  args: {
    requestingUserId: v.id("users"),
    period: v.optional(v.string()), // "7d", "30d", "90d"
  },
  handler: async (ctx, args) => {
    const requestingUser = await ctx.db.get(args.requestingUserId);
    if (!requestingUser || !["admin", "moderator"].includes(requestingUser.role)) {
      throw new ConvexError("Unauthorized access");
    }

    const period = args.period || "30d";
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Format date strings
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      dates.push(date.toISOString().split('T')[0]);
    }

    // Get metrics for the period
    const metrics = await ctx.db
      .query("metrics")
      .withIndex("by_period", (q) => q.gte("period", dates[0]).lte("period", dates[dates.length - 1]))
      .collect();

    // Group metrics by type
    const metricsByType = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = [];
      }
      acc[metric.metricType].push(metric);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate totals and trends
    const calculateTrend = (values: number[]) => {
      if (values.length < 2) return 0;
      const recent = values.slice(-7).reduce((sum, val) => sum + val, 0) / 7;
      const previous = values.slice(-14, -7).reduce((sum, val) => sum + val, 0) / 7;
      return previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;
    };

    const totalUsers = await ctx.db
      .query("users")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const totalQuestions = await ctx.db
      .query("questions")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const recentQuizzes = await ctx.db
      .query("quizSessions")
      .withIndex("by_completion", (q) => 
        q.gte("completedAt", startDate.getTime())
      )
      .collect();

    return {
      summary: {
        totalUsers: totalUsers.length,
        totalQuestions: totalQuestions.length,
        totalQuizzes: recentQuizzes.length,
        avgAccuracy: Math.round(
          totalUsers.reduce((sum, user) => sum + user.accuracy, 0) / totalUsers.length
        ),
      },
      trends: {
        dau: {
          current: metricsByType.daily_active_users?.slice(-1)[0]?.value || 0,
          trend: calculateTrend(metricsByType.daily_active_users?.map(m => m.value) || []),
        },
        completionRate: {
          current: metricsByType.quiz_completion_rate?.slice(-1)[0]?.value || 0,
          trend: calculateTrend(metricsByType.quiz_completion_rate?.map(m => m.value) || []),
        },
        avgSessionLength: {
          current: metricsByType.avg_session_length?.slice(-1)[0]?.value || 0,
          trend: calculateTrend(metricsByType.avg_session_length?.map(m => m.value) || []),
        },
        avgQuizScore: {
          current: metricsByType.avg_quiz_score?.slice(-1)[0]?.value || 0,
          trend: calculateTrend(metricsByType.avg_quiz_score?.map(m => m.value) || []),
        },
      },
      dailyMetrics: dates.map(date => ({
        date,
        dau: metricsByType.daily_active_users?.find(m => m.period === date)?.value || 0,
        completionRate: metricsByType.quiz_completion_rate?.find(m => m.period === date)?.value || 0,
        avgScore: metricsByType.avg_quiz_score?.find(m => m.period === date)?.value || 0,
        pageViews: metricsByType.page_views?.find(m => m.period === date)?.value || 0,
      })),
    };
  },
});

// Get user performance analytics
export const getUserAnalytics = query({
  args: {
    userId: v.id("users"),
    requestingUserId: v.id("users"),
    period: v.optional(v.string()), // "7d", "30d", "90d", "all"
  },
  handler: async (ctx, args) => {
    const requestingUser = await ctx.db.get(args.requestingUserId);
    
    // Users can view their own analytics, admins can view anyone's
    if (args.userId !== args.requestingUserId && 
        (!requestingUser || !["admin", "moderator"].includes(requestingUser.role))) {
      throw new ConvexError("Unauthorized access");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const period = args.period || "30d";
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 999;
    const cutoffTime = period === "all" ? 0 : Date.now() - (days * 24 * 60 * 60 * 1000);

    // Get user's quiz sessions
    const quizSessions = await ctx.db
      .query("quizSessions")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", args.userId).eq("status", "completed")
      )
      .filter((q) => q.gte(q.field("completedAt"), cutoffTime))
      .collect();

    // Get user's attempts
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .collect();

    // Calculate performance metrics
    const totalQuizzes = quizSessions.length;
    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const avgScore = totalQuizzes > 0 
      ? Math.round(quizSessions.reduce((sum, s) => sum + s.score, 0) / totalQuizzes)
      : 0;
    const totalTimeSpent = quizSessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const avgTimePerQuiz = totalQuizzes > 0 ? Math.round(totalTimeSpent / totalQuizzes) : 0;

    // Category performance
    const categoryStats = attempts.reduce((acc, attempt) => {
      if (!acc[attempt.category]) {
        acc[attempt.category] = { total: 0, correct: 0 };
      }
      acc[attempt.category].total++;
      if (attempt.isCorrect) {
        acc[attempt.category].correct++;
      }
      return acc;
    }, {} as Record<string, { total: number; correct: number }>);

    const categoryPerformance = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
    })).sort((a, b) => b.accuracy - a.accuracy);

    // Difficulty performance
    const difficultyStats = attempts.reduce((acc, attempt) => {
      if (!acc[attempt.difficulty]) {
        acc[attempt.difficulty] = { total: 0, correct: 0 };
      }
      acc[attempt.difficulty].total++;
      if (attempt.isCorrect) {
        acc[attempt.difficulty].correct++;
      }
      return acc;
    }, {} as Record<string, { total: number; correct: number }>);

    const difficultyPerformance = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
    }));

    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentSessions = quizSessions.filter(s => (s.completedAt || 0) >= sevenDaysAgo);
    const recentAttempts = attempts.filter(a => a.timestamp >= sevenDaysAgo);

    // Study streak calculation
    const studyDays = [...new Set(attempts.map(a => 
      new Date(a.timestamp).toISOString().split('T')[0]
    ))].sort();
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 1;
    
    for (let i = studyDays.length - 1; i > 0; i--) {
      const currentDate = new Date(studyDays[i]);
      const prevDate = new Date(studyDays[i - 1]);
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    
    // Current streak (consecutive days including today)
    const today = new Date().toISOString().split('T')[0];
    if (studyDays.includes(today)) {
      currentStreak = 1;
      for (let i = studyDays.length - 2; i >= 0; i--) {
        const currentDate = new Date(studyDays[i + 1]);
        const prevDate = new Date(studyDays[i]);
        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      overview: {
        totalQuizzes,
        totalQuestions,
        accuracy,
        avgScore,
        totalTimeSpent,
        avgTimePerQuiz,
        currentStreak,
        maxStreak,
        studyDays: studyDays.length,
      },
      recentActivity: {
        quizzesThisWeek: recentSessions.length,
        questionsThisWeek: recentAttempts.length,
        accuracyThisWeek: recentAttempts.length > 0 
          ? Math.round((recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100)
          : 0,
      },
      categoryPerformance,
      difficultyPerformance,
      progressOverTime: studyDays.slice(-30).map(date => {
        const dayAttempts = attempts.filter(a => 
          new Date(a.timestamp).toISOString().split('T')[0] === date
        );
        return {
          date,
          questionsAnswered: dayAttempts.length,
          accuracy: dayAttempts.length > 0 
            ? Math.round((dayAttempts.filter(a => a.isCorrect).length / dayAttempts.length) * 100)
            : 0,
        };
      }),
    };
  },
});

// Get system-wide analytics for admins
export const getSystemAnalytics = query({
  args: {
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requestingUser = await ctx.db.get(args.requestingUserId);
    if (!requestingUser || requestingUser.role !== "admin") {
      throw new ConvexError("Admin access required");
    }

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    const activeUsers = allUsers.filter(u => u.isActive);
    const recentUsers = allUsers.filter(u => u.createdAt >= thirtyDaysAgo);

    // Get all questions
    const allQuestions = await ctx.db.query("questions").collect();
    const publishedQuestions = allQuestions.filter(q => q.status === "published");
    const recentQuestions = allQuestions.filter(q => q.createdAt >= thirtyDaysAgo);

    // Get recent quiz sessions
    const recentSessions = await ctx.db
      .query("quizSessions")
      .withIndex("by_completion", (q) => q.gte("completedAt", thirtyDaysAgo))
      .collect();

    // Get recent attempts
    const recentAttempts = await ctx.db
      .query("attempts")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", thirtyDaysAgo))
      .collect();

    // Calculate system metrics
    const systemAccuracy = recentAttempts.length > 0
      ? Math.round((recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100)
      : 0;

    const avgQuizScore = recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length)
      : 0;

    const avgSessionLength = recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum, s) => sum + s.timeSpent, 0) / recentSessions.length)
      : 0;

    // User role distribution
    const roleDistribution = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Question category distribution
    const categoryDistribution = publishedQuestions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top performing users
    const topUsers = activeUsers
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map(u => ({
        _id: u._id,
        name: u.name,
        points: u.points,
        accuracy: u.accuracy,
        level: u.level,
        totalQuizzes: u.totalQuizzes,
      }));

    return {
      userMetrics: {
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        newUsersThisMonth: recentUsers.length,
        roleDistribution,
      },
      contentMetrics: {
        totalQuestions: allQuestions.length,
        publishedQuestions: publishedQuestions.length,
        newQuestionsThisMonth: recentQuestions.length,
        categoryDistribution,
      },
      activityMetrics: {
        quizzesThisMonth: recentSessions.length,
        questionsAnsweredThisMonth: recentAttempts.length,
        systemAccuracy,
        avgQuizScore,
        avgSessionLength,
      },
      topUsers,
    };
  },
});

// Track individual question attempt
export const trackQuestionAttempt = mutation({
  args: {
    userId: v.id("users"),
    questionId: v.id("questions"),
    answer: v.number(),
    timeSpent: v.number(),
    sessionId: v.optional(v.id("quizSessions")),
    confidenceLevel: v.optional(v.number()),
    hintUsed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new ConvexError("Question not found");
    }

    const isCorrect = args.answer === question.correctAnswer;
    const timestamp = Date.now();

    // Create attempt record
    await ctx.db.insert("attempts", {
      userId: args.userId,
      questionId: args.questionId,
      answer: args.answer,
      isCorrect,
      timeSpent: args.timeSpent,
      sessionId: args.sessionId,
      timestamp,
      difficulty: question.difficulty,
      category: question.category,
      confidenceLevel: args.confidenceLevel,
      hintUsed: args.hintUsed,
    });

    // Track analytics event
    await ctx.db.insert("analytics", {
      eventType: "question_attempt",
      userId: args.userId,
      questionId: args.questionId,
      sessionId: args.sessionId,
      metadata: {
        timeSpent: args.timeSpent,
        difficulty: question.difficulty,
        category: question.category,
      },
      timestamp,
    });

    return { success: true, isCorrect };
  },
});