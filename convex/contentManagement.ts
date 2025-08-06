import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Content Management Workflow Functions - SPEC.md Section 4 Implementation
// Implements Author, Editor, Moderator, Admin roles and approval workflow

// Create question draft (Author role)
export const createQuestionDraft = mutation({
  args: {
    authorId: v.id("users"),
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
  },
  handler: async (ctx, args) => {
    const author = await ctx.db.get(args.authorId);
    if (!author || !["author", "editor", "moderator", "admin"].includes(author.role)) {
      throw new ConvexError("Insufficient permissions to create questions");
    }

    // Validate question data
    if (args.options.length < 2) {
      throw new ConvexError("Question must have at least 2 options");
    }

    if (args.correctAnswer >= args.options.length || args.correctAnswer < 0) {
      throw new ConvexError("Invalid correct answer index");
    }

    const now = Date.now();

    // Create question in draft status
    const questionId = await ctx.db.insert("questions", {
      question: args.question,
      options: args.options,
      correctAnswer: args.correctAnswer,
      explanation: args.explanation,
      category: args.category,
      difficulty: args.difficulty,
      usmleCategory: args.usmleCategory,
      tags: args.tags,
      medicalReferences: args.medicalReferences,
      imageUrl: args.imageUrl,
      status: "draft",
      authorId: args.authorId,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isActive: true,
      qualityScore: 0,
      reportCount: 0,
      lastReviewed: now,
    });

    // Log creation in audit trail
    await ctx.db.insert("auditLog", {
      entityType: "question",
      entityId: questionId,
      action: "create",
      userId: args.authorId,
      notes: "Question draft created",
      timestamp: now,
    });

    // Track analytics event
    await ctx.db.insert("analytics", {
      eventType: "question_created",
      userId: args.authorId,
      questionId: questionId,
      timestamp: now,
      metadata: {
        category: args.category,
        difficulty: args.difficulty,
      },
    });

    return { questionId, success: true };
  },
});

// Submit question for review (Author -> Editor)
export const submitQuestionForReview = mutation({
  args: {
    questionId: v.id("questions"),
    authorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new ConvexError("Question not found");
    }

    const author = await ctx.db.get(args.authorId);
    if (!author || question.authorId !== args.authorId) {
      throw new ConvexError("Only the author can submit their question for review");
    }

    if (question.status !== "draft") {
      throw new ConvexError("Only draft questions can be submitted for review");
    }

    const now = Date.now();

    // Update question status to review
    await ctx.db.patch(args.questionId, {
      status: "review",
      updatedAt: now,
    });

    // Create content review entry
    await ctx.db.insert("contentReviews", {
      questionId: args.questionId,
      reviewerId: args.authorId, // Will be assigned to an editor
      reviewType: "editorial",
      status: "pending",
      createdAt: now,
      priority: "medium",
    });

    // Log status change
    await ctx.db.insert("auditLog", {
      entityType: "question",
      entityId: args.questionId,
      action: "submit_review",
      userId: args.authorId,
      oldValues: JSON.stringify({ status: "draft" }),
      newValues: JSON.stringify({ status: "review" }),
      notes: "Question submitted for editorial review",
      timestamp: now,
    });

    return { success: true };
  },
});

// Editor review and approval
export const reviewQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    editorId: v.id("users"),
    action: v.union(v.literal("approve"), v.literal("reject"), v.literal("needs-revision")),
    feedback: v.optional(v.string()),
    suggestedChanges: v.optional(v.string()),
    qualityScore: v.optional(v.number()), // 1-5 rating
    editNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!editor || !["editor", "moderator", "admin"].includes(editor.role)) {
      throw new ConvexError("Insufficient permissions to review questions");
    }

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new ConvexError("Question not found");
    }

    if (question.status !== "review") {
      throw new ConvexError("Question is not under review");
    }

    const now = Date.now();
    let newStatus: "draft" | "review" | "published" | "archived";

    switch (args.action) {
      case "approve":
        newStatus = "published";
        break;
      case "reject":
        newStatus = "archived";
        break;
      case "needs-revision":
        newStatus = "draft";
        break;
      default:
        throw new ConvexError("Invalid review action");
    }

    // Update question
    const updates: any = {
      status: newStatus,
      editorId: args.editorId,
      updatedAt: now,
      editNotes: args.editNotes,
    };

    if (args.qualityScore) {
      updates.qualityScore = args.qualityScore;
    }

    if (newStatus === "published") {
      updates.publishedAt = now;
    }

    await ctx.db.patch(args.questionId, updates);

    // Update content review
    const review = await ctx.db
      .query("contentReviews")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (review) {
      await ctx.db.patch(review._id, {
        reviewerId: args.editorId,
        status: args.action === "approve" ? "approved" : "rejected",
        feedback: args.feedback,
        suggestedChanges: args.suggestedChanges,
        score: args.qualityScore,
        completedAt: now,
      });
    }

    // Log review action
    await ctx.db.insert("auditLog", {
      entityType: "question",
      entityId: args.questionId,
      action: `review_${args.action}`,
      userId: args.editorId,
      oldValues: JSON.stringify({ status: "review" }),
      newValues: JSON.stringify({ status: newStatus }),
      notes: args.feedback || `Question ${args.action} by editor`,
      timestamp: now,
    });

    // Notify author (would implement notification system)
    await ctx.db.insert("notifications", {
      userId: question.authorId!,
      type: "question_review",
      title: `Question ${args.action}`,
      message: `Your question has been ${args.action} by an editor${args.feedback ? ': ' + args.feedback : ''}`,
      isRead: false,
      createdAt: now,
      metadata: JSON.stringify({ questionId: args.questionId, action: args.action }),
    });

    return { success: true, newStatus };
  },
});

// Moderator final approval for publishing
export const moderatorApproval = mutation({
  args: {
    questionId: v.id("questions"),
    moderatorId: v.id("users"),
    approved: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const moderator = await ctx.db.get(args.moderatorId);
    if (!moderator || !["moderator", "admin"].includes(moderator.role)) {
      throw new ConvexError("Insufficient permissions for moderator approval");
    }

    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new ConvexError("Question not found");
    }

    if (question.status !== "published") {
      throw new ConvexError("Question must be editor-approved before moderator approval");
    }

    const now = Date.now();

    // Update question with moderator approval
    await ctx.db.patch(args.questionId, {
      moderatorId: args.moderatorId,
      updatedAt: now,
      status: args.approved ? "published" : "review",
    });

    // Log moderator action
    await ctx.db.insert("auditLog", {
      entityType: "question",
      entityId: args.questionId,
      action: args.approved ? "moderator_approve" : "moderator_reject",
      userId: args.moderatorId,
      notes: args.notes || `Moderator ${args.approved ? 'approved' : 'rejected'} question`,
      timestamp: now,
    });

    return { success: true };
  },
});

// Get questions by status for content management dashboard
export const getQuestionsByStatus = query({
  args: {
    requestingUserId: v.id("users"),
    status: v.optional(v.union(v.literal("draft"), v.literal("review"), v.literal("published"), v.literal("archived"))),
    authorId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requestingUser = await ctx.db.get(args.requestingUserId);
    if (!requestingUser) {
      throw new ConvexError("User not found");
    }

    // Role-based access control
    const canViewAll = ["admin", "moderator", "editor"].includes(requestingUser.role);
    const canViewOwn = ["author"].includes(requestingUser.role);

    if (!canViewAll && !canViewOwn) {
      throw new ConvexError("Insufficient permissions");
    }

    let query = ctx.db.query("questions");
    
    // Apply status filter
    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    }

    let questions = await query.take(args.limit || 50);

    // Filter by author if specified or if user can only view their own
    if (args.authorId) {
      questions = questions.filter(q => q.authorId === args.authorId);
    } else if (!canViewAll) {
      // Authors can only see their own questions
      questions = questions.filter(q => q.authorId === args.requestingUserId);
    }

    // Get author details for each question
    const questionsWithDetails = [];
    for (const question of questions) {
      const author = question.authorId ? await ctx.db.get(question.authorId) : null;
      const editor = question.editorId ? await ctx.db.get(question.editorId) : null;
      const moderator = question.moderatorId ? await ctx.db.get(question.moderatorId) : null;

      questionsWithDetails.push({
        ...question,
        authorName: author?.name,
        editorName: editor?.name,
        moderatorName: moderator?.name,
      });
    }

    return questionsWithDetails;
  },
});

// Get pending reviews for editors
export const getPendingReviews = query({
  args: {
    editorId: v.id("users"),
    reviewType: v.optional(v.union(v.literal("editorial"), v.literal("fact-check"), v.literal("quality"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const editor = await ctx.db.get(args.editorId);
    if (!editor || !["editor", "moderator", "admin"].includes(editor.role)) {
      throw new ConvexError("Insufficient permissions to view reviews");
    }

    const query = ctx.db
      .query("contentReviews")
      .withIndex("by_status", (q) => q.eq("status", "pending"));

    const reviews = await query.collect();

    // Apply filters
    let filteredReviews = reviews;
    if (args.reviewType) {
      filteredReviews = filteredReviews.filter(r => r.reviewType === args.reviewType);
    }
    if (args.priority) {
      filteredReviews = filteredReviews.filter(r => r.priority === args.priority);
    }

    // Get question details
    const reviewsWithDetails = [];
    for (const review of filteredReviews) {
      const question = await ctx.db.get(review.questionId);
      if (question) {
        const author = question.authorId ? await ctx.db.get(question.authorId) : null;
        reviewsWithDetails.push({
          ...review,
          question: {
            ...question,
            authorName: author?.name,
          },
        });
      }
    }

    return reviewsWithDetails.sort((a, b) => {
      // Sort by priority (high > medium > low) then by creation date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.createdAt - b.createdAt;
    });
  },
});

// Assign reviewer to question
export const assignReviewer = mutation({
  args: {
    reviewId: v.id("contentReviews"),
    reviewerId: v.id("users"),
    assignerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const assigner = await ctx.db.get(args.assignerId);
    if (!assigner || !["moderator", "admin"].includes(assigner.role)) {
      throw new ConvexError("Only moderators and admins can assign reviewers");
    }

    const reviewer = await ctx.db.get(args.reviewerId);
    if (!reviewer || !["editor", "moderator", "admin"].includes(reviewer.role)) {
      throw new ConvexError("Invalid reviewer role");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new ConvexError("Review not found");
    }

    const now = Date.now();

    // Update review with assigned reviewer
    await ctx.db.patch(args.reviewId, {
      reviewerId: args.reviewerId,
      // updatedAt: now, // Add this field to schema if needed
    });

    // Log assignment
    await ctx.db.insert("auditLog", {
      entityType: "review",
      entityId: args.reviewId,
      action: "assign_reviewer",
      userId: args.assignerId,
      notes: `Assigned reviewer ${reviewer.name}`,
      timestamp: now,
    });

    // Notify reviewer
    await ctx.db.insert("notifications", {
      userId: args.reviewerId,
      type: "review_assignment",
      title: "Review Assignment",
      message: `You have been assigned to review a question`,
      isRead: false,
      createdAt: now,
      metadata: JSON.stringify({ reviewId: args.reviewId }),
    });

    return { success: true };
  },
});

// Get content management statistics
export const getContentStats = query({
  args: {
    requestingUserId: v.id("users"),
    period: v.optional(v.string()), // "7d", "30d", "90d"
  },
  handler: async (ctx, args) => {
    const requestingUser = await ctx.db.get(args.requestingUserId);
    if (!requestingUser || !["editor", "moderator", "admin"].includes(requestingUser.role)) {
      throw new ConvexError("Insufficient permissions to view content statistics");
    }

    const period = args.period || "30d";
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    // Get all questions
    const allQuestions = await ctx.db.query("questions").collect();
    
    // Get recent questions
    const recentQuestions = allQuestions.filter(q => q.createdAt >= cutoffTime);

    // Status breakdown
    const statusBreakdown = allQuestions.reduce((acc, q) => {
      acc[q.status] = (acc[q.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Category breakdown
    const categoryBreakdown = allQuestions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Difficulty breakdown
    const difficultyBreakdown = allQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Author productivity
    const authorStats = recentQuestions.reduce((acc, q) => {
      if (q.authorId) {
        if (!acc[q.authorId]) {
          acc[q.authorId] = { created: 0, published: 0 };
        }
        acc[q.authorId].created++;
        if (q.status === "published") {
          acc[q.authorId].published++;
        }
      }
      return acc;
    }, {} as Record<string, { created: number; published: number }>);

    // Get pending reviews
    const pendingReviews = await ctx.db
      .query("contentReviews")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Quality metrics
    const publishedQuestions = allQuestions.filter(q => q.status === "published");
    const avgQualityScore = publishedQuestions.length > 0
      ? publishedQuestions
          .filter(q => q.qualityScore)
          .reduce((sum, q) => sum + (q.qualityScore || 0), 0) / publishedQuestions.filter(q => q.qualityScore).length
      : 0;

    return {
      overview: {
        totalQuestions: allQuestions.length,
        recentQuestions: recentQuestions.length,
        publishedQuestions: statusBreakdown.published || 0,
        pendingReviews: pendingReviews.length,
        avgQualityScore: Math.round(avgQualityScore * 10) / 10,
      },
      breakdowns: {
        status: statusBreakdown,
        category: categoryBreakdown,
        difficulty: difficultyBreakdown,
      },
      workflow: {
        drafts: statusBreakdown.draft || 0,
        inReview: statusBreakdown.review || 0,
        published: statusBreakdown.published || 0,
        archived: statusBreakdown.archived || 0,
        pendingReviews: pendingReviews.length,
      },
      productivity: Object.entries(authorStats).map(([authorId, stats]) => ({
        authorId,
        ...stats,
        publishRate: stats.created > 0 ? Math.round((stats.published / stats.created) * 100) : 0,
      })),
    };
  },
});

// Flag question for content issues
export const flagQuestionContent = mutation({
  args: {
    questionId: v.id("questions"),
    userId: v.id("users"),
    reason: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new ConvexError("Question not found");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const now = Date.now();

    // Create flag record
    await ctx.db.insert("flaggedQuestions", {
      userId: args.userId,
      questionId: args.questionId,
      reason: args.reason,
      description: args.description,
      status: "pending",
      createdAt: now,
      priority: args.priority,
    });

    // Increment report count on question
    await ctx.db.patch(args.questionId, {
      reportCount: (question.reportCount || 0) + 1,
    });

    // Log flag action
    await ctx.db.insert("auditLog", {
      entityType: "question",
      entityId: args.questionId,
      action: "flag_content",
      userId: args.userId,
      notes: `Content flagged: ${args.reason}`,
      timestamp: now,
    });

    // Notify moderators for high/critical priority flags
    if (args.priority === "high" || args.priority === "critical") {
      const moderators = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", "moderator"))
        .collect();

      for (const moderator of moderators) {
        await ctx.db.insert("notifications", {
          userId: moderator._id,
          type: "content_flag",
          title: `${args.priority.toUpperCase()} Priority Content Flag`,
          message: `Question flagged for: ${args.reason}`,
          isRead: false,
          createdAt: now,
          actionUrl: `/admin/questions/${args.questionId}`,
          metadata: JSON.stringify({ questionId: args.questionId, priority: args.priority }),
        });
      }
    }

    return { success: true };
  },
});

// Bulk operations for content management
export const bulkUpdateQuestions = mutation({
  args: {
    questionIds: v.array(v.id("questions")),
    action: v.union(v.literal("publish"), v.literal("archive"), v.literal("delete")),
    userId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !["moderator", "admin"].includes(user.role)) {
      throw new ConvexError("Insufficient permissions for bulk operations");
    }

    const now = Date.now();
    let updatedCount = 0;

    for (const questionId of args.questionIds) {
      const question = await ctx.db.get(questionId);
      if (!question) continue;

      try {
        switch (args.action) {
          case "publish":
            if (question.status === "review") {
              await ctx.db.patch(questionId, {
                status: "published",
                publishedAt: now,
                updatedAt: now,
              });
              updatedCount++;
            }
            break;
          case "archive":
            await ctx.db.patch(questionId, {
              status: "archived",
              updatedAt: now,
            });
            updatedCount++;
            break;
          case "delete":
            // Only admins can delete
            if (user.role === "admin") {
              await ctx.db.delete(questionId);
              updatedCount++;
            }
            break;
        }

        // Log bulk action
        await ctx.db.insert("auditLog", {
          entityType: "question",
          entityId: questionId,
          action: `bulk_${args.action}`,
          userId: args.userId,
          notes: args.notes || `Bulk ${args.action} operation`,
          timestamp: now,
        });
      } catch (error) {
        console.error(`Failed to ${args.action} question ${questionId}:`, error);
      }
    }

    return { success: true, updatedCount };
  },
});