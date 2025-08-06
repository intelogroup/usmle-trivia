import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// MVP: Quiz Session Management - Abandon and Resume Functionality
// Handles abandoned quizzes, resume capability, and seen question tracking

// Abandon a quiz session with proper tracking
export const abandonQuizSession = mutation({
  args: {
    sessionId: v.id("quizSessions"),
    reason: v.string(), // "timeout", "manual", "disconnect", "browser_close"
    lastQuestionIndex: v.number(), // Last question user was on
    currentAnswers: v.array(v.union(v.number(), v.null())), // Current answers array
    timeSpent: v.number(), // Time spent so far
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError("Quiz session not found");
    }
    
    if (session.status !== "active") {
      throw new ConvexError("Only active quiz sessions can be abandoned");
    }
    
    // Update session status to abandoned
    await ctx.db.patch(args.sessionId, {
      status: "abandoned",
      abandonReason: args.reason,
      lastQuestionIndex: args.lastQuestionIndex,
      answers: args.currentAnswers,
      timeSpent: args.timeSpent,
      abandonedAt: Date.now(),
      canResume: true, // Allow resumption
    });
    
    // Record seen questions and attempts for answered questions
    for (let i = 0; i <= args.lastQuestionIndex; i++) {
      const questionId = session.questions[i];
      const userAnswer = args.currentAnswers[i];
      
      if (questionId) {
        // Track that user has seen this question
        await recordSeenQuestion(ctx, session.userId, questionId, args.sessionId, userAnswer !== null, userAnswer);
        
        // If user answered, record the attempt
        if (userAnswer !== null) {
          const question = await ctx.db.get(questionId);
          if (question) {
            const isCorrect = userAnswer === question.correctAnswer;
            
            await ctx.db.insert("attempts", {
              userId: session.userId,
              questionId: questionId,
              answer: userAnswer,
              isCorrect,
              timeSpent: Math.floor(args.timeSpent / (i + 1)), // Rough estimate per question
              sessionId: args.sessionId,
              timestamp: Date.now(),
              difficulty: question.difficulty,
              category: question.category,
            });
          }
        }
      }
    }
    
    return {
      message: "Quiz session abandoned successfully",
      canResume: true,
      questionsAnswered: args.currentAnswers.filter(a => a !== null).length,
      totalQuestions: session.questions.length,
    };
  },
});

// Resume an abandoned quiz session
export const resumeQuizSession = mutation({
  args: {
    sessionId: v.id("quizSessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError("Quiz session not found");
    }
    
    // Verify ownership
    if (session.userId !== args.userId) {
      throw new ConvexError("You can only resume your own quiz sessions");
    }
    
    if (session.status !== "abandoned" || !session.canResume) {
      throw new ConvexError("This quiz session cannot be resumed");
    }
    
    // Check if session is not too old (max 24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (session.abandonedAt && Date.now() - session.abandonedAt > twentyFourHours) {
      await ctx.db.patch(args.sessionId, {
        canResume: false,
      });
      throw new ConvexError("Quiz session is too old to resume (max 24 hours)");
    }
    
    // Reactivate the session
    await ctx.db.patch(args.sessionId, {
      status: "active",
      resumedAt: Date.now(),
    });
    
    return {
      session: await ctx.db.get(args.sessionId),
      message: "Quiz session resumed successfully",
      questionsRemaining: session.questions.length - (session.answers?.filter(a => a !== null).length || 0),
    };
  },
});

// Get resumable quiz sessions for a user
export const getResumableQuizzes = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("quizSessions")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", args.userId).eq("status", "abandoned")
      )
      .filter((q) => q.eq(q.field("canResume"), true))
      .order("desc")
      .take(5); // Limit to 5 most recent
    
    const resumable = [];
    
    for (const session of sessions) {
      // Check if not too old
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (session.abandonedAt && Date.now() - session.abandonedAt < twentyFourHours) {
        const questionsAnswered = session.answers?.filter(a => a !== null).length || 0;
        
        resumable.push({
          sessionId: session._id,
          mode: session.mode,
          questionsAnswered,
          totalQuestions: session.questions.length,
          abandonedAt: session.abandonedAt,
          abandonReason: session.abandonReason,
          lastQuestionIndex: session.lastQuestionIndex,
          timeSpent: session.timeSpent,
          hoursAgo: Math.floor((Date.now() - (session.abandonedAt || 0)) / (1000 * 60 * 60)),
        });
      }
    }
    
    return resumable;
  },
});

// Helper function to record seen questions
async function recordSeenQuestion(
  ctx: any,
  userId: string,
  questionId: string,
  sessionId: string,
  wasAnswered: boolean,
  answer?: number | null
) {
  // Check if already seen
  const existing = await ctx.db
    .query("seenQuestions")
    .withIndex("by_user_question", (q) => 
      q.eq("userId", userId).eq("questionId", questionId)
    )
    .first();
  
  if (existing) {
    // Update existing record
    await ctx.db.patch(existing._id, {
      seenCount: existing.seenCount + 1,
      lastSeenInSession: sessionId,
      wasAnswered: wasAnswered || existing.wasAnswered,
      wasCorrect: answer !== null && answer !== undefined ? 
        await isAnswerCorrect(ctx, questionId, answer) : existing.wasCorrect,
    });
  } else {
    // Create new record
    const wasCorrect = answer !== null && answer !== undefined ? 
      await isAnswerCorrect(ctx, questionId, answer) : undefined;
    
    await ctx.db.insert("seenQuestions", {
      userId,
      questionId,
      seenAt: Date.now(),
      seenCount: 1,
      lastSeenInSession: sessionId,
      wasAnswered,
      wasCorrect,
      shouldAvoid: false,
    });
  }
}

// Helper to check if answer is correct
async function isAnswerCorrect(ctx: any, questionId: string, answer: number): Promise<boolean> {
  const question = await ctx.db.get(questionId);
  return question ? answer === question.correctAnswer : false;
}

// Get fresh questions for a user (avoiding recently seen)
export const getFreshQuestions = query({
  args: {
    userId: v.id("users"),
    count: v.number(),
    difficulty: v.optional(v.string()),
    category: v.optional(v.string()),
    avoidRecentlySeenHours: v.optional(v.number()), // Default 24 hours
  },
  handler: async (ctx, args) => {
    const avoidHours = args.avoidRecentlySeenHours || 24;
    const cutoffTime = Date.now() - (avoidHours * 60 * 60 * 1000);
    
    // Get recently seen questions to avoid
    const recentlySeen = await ctx.db
      .query("seenQuestions")
      .withIndex("by_user_seen", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("seenAt"), cutoffTime))
      .collect();
    
    const avoidQuestionIds = new Set(recentlySeen.map(sq => sq.questionId));
    
    // Get questions with filters
    let query = ctx.db.query("questions");
    
    if (args.difficulty) {
      query = query.filter((q) => q.eq(q.field("difficulty"), args.difficulty));
    }
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    
    // Filter out published questions only
    query = query.filter((q) => q.eq(q.field("status"), "published"));
    
    const allQuestions = await query.collect();
    
    // Filter out recently seen questions
    const freshQuestions = allQuestions.filter(q => !avoidQuestionIds.has(q._id));
    
    // Shuffle and take requested count
    const shuffled = freshQuestions.sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, args.count);
  },
});

// Mark questions as should avoid (for user feedback)
export const markQuestionToAvoid = mutation({
  args: {
    userId: v.id("users"),
    questionId: v.id("questions"),
    avoidForHours: v.number(), // How long to avoid
    reason: v.optional(v.string()), // "too_difficult", "not_relevant", "repeated"
  },
  handler: async (ctx, args) => {
    const avoidUntil = Date.now() + (args.avoidForHours * 60 * 60 * 1000);
    
    const existing = await ctx.db
      .query("seenQuestions")
      .withIndex("by_user_question", (q) => 
        q.eq("userId", args.userId).eq("questionId", args.questionId)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        shouldAvoid: true,
        avoidUntil,
      });
    } else {
      await ctx.db.insert("seenQuestions", {
        userId: args.userId,
        questionId: args.questionId,
        seenAt: Date.now(),
        seenCount: 1,
        wasAnswered: false,
        shouldAvoid: true,
        avoidUntil,
      });
    }
    
    return { message: `Question marked to avoid for ${args.avoidForHours} hours` };
  },
});

// Get user's question history and statistics
export const getUserQuestionStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const seenQuestions = await ctx.db
      .query("seenQuestions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const totalSeen = seenQuestions.length;
    const answered = seenQuestions.filter(sq => sq.wasAnswered).length;
    const correct = seenQuestions.filter(sq => sq.wasCorrect === true).length;
    const avoided = seenQuestions.filter(sq => sq.shouldAvoid).length;
    
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    
    return {
      totalQuestionsSeen: totalSeen,
      questionsAnswered: answered,
      correctAnswers: correct,
      accuracy,
      questionsAvoiding: avoided,
      averageSeenCount: totalSeen > 0 ? 
        Math.round(seenQuestions.reduce((sum, sq) => sum + sq.seenCount, 0) / totalSeen * 10) / 10 : 0,
    };
  },
});

// Clean up old abandoned sessions (maintenance function)
export const cleanupOldAbandonedSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const oldSessions = await ctx.db
      .query("quizSessions")
      .withIndex("by_status", (q) => q.eq("status", "abandoned"))
      .filter((q) => q.lt(q.field("abandonedAt"), sevenDaysAgo))
      .collect();
    
    let cleaned = 0;
    for (const session of oldSessions) {
      await ctx.db.patch(session._id, {
        canResume: false,
      });
      cleaned++;
    }
    
    return { 
      message: `Cleaned up ${cleaned} old abandoned sessions`,
      cleanedCount: cleaned 
    };
  },
});