import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Enhanced authentication functions implementing SPEC.md Section 7 requirements

// Hash password function (in production, use bcrypt or similar)
function hashPassword(password: string): string {
  // Simple hash for demo - in production use bcrypt
  return btoa(password + "salt_medical_quiz_2025").split('').reverse().join('');
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate JWT token hash
function generateTokenHash(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}

// Create a new user account with enhanced security
export const createUserSecure = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    role: v.optional(v.union(
      v.literal("user"), 
      v.literal("author"), 
      v.literal("editor"), 
      v.literal("moderator"), 
      v.literal("admin")
    )),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new ConvexError("Invalid email format");
    }

    // Validate password strength
    if (args.password.length < 8) {
      throw new ConvexError("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User with this email already exists");
    }

    const now = Date.now();

    // Create new user with enhanced fields
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role || "user",
      points: 0,
      level: 1,
      streak: 0,
      totalQuizzes: 0,
      accuracy: 0,
      passwordHash: hashPassword(args.password),
      isActive: true,
      emailVerified: false, // Would implement email verification flow
      createdAt: now,
      updatedAt: now,
    });

    // Log user creation in audit trail
    await ctx.db.insert("auditLog", {
      entityType: "user",
      entityId: userId,
      action: "create",
      userId: userId,
      notes: "User account created",
      timestamp: now,
    });

    return { userId, success: true };
  },
});

// Secure login with JWT session management
export const loginSecure = mutation({
  args: { 
    email: v.string(),
    password: v.string(),
    userAgent: v.optional(v.string()),
    deviceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (!user || !user.passwordHash) {
      throw new ConvexError("Invalid credentials");
    }

    if (!user.isActive) {
      throw new ConvexError("Account is deactivated");
    }

    // Verify password
    if (!verifyPassword(args.password, user.passwordHash)) {
      throw new ConvexError("Invalid credentials");
    }

    const now = Date.now();
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days
    const tokenHash = generateTokenHash();

    // Create session
    const sessionId = await ctx.db.insert("userSessions", {
      userId: user._id,
      tokenHash,
      expiresAt,
      createdAt: now,
      lastUsed: now,
      userAgent: args.userAgent,
      deviceType: args.deviceType,
      isActive: true,
    });

    // Update user's last login
    await ctx.db.patch(user._id, {
      lastLogin: now,
      updatedAt: now,
    });

    // Log login event
    await ctx.db.insert("analytics", {
      eventType: "login",
      userId: user._id,
      timestamp: now,
      userAgent: args.userAgent,
      deviceType: args.deviceType,
    });

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        points: user.points,
        level: user.level,
        streak: user.streak,
        accuracy: user.accuracy,
      },
      sessionToken: tokenHash,
      expiresAt,
    };
  },
});

// Validate session token
export const validateSession = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash))
      .first();

    if (!session || !session.isActive) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt <= Date.now()) {
      // Mark session as inactive
      await ctx.db.patch(session._id, { isActive: false });
      return null;
    }

    // Update last used timestamp
    await ctx.db.patch(session._id, { lastUsed: Date.now() });

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        points: user.points,
        level: user.level,
        streak: user.streak,
        accuracy: user.accuracy,
        medicalLevel: user.medicalLevel,
        specialties: user.specialties,
        studyGoals: user.studyGoals,
        preferences: user.preferences,
      },
      session: {
        _id: session._id,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        lastUsed: session.lastUsed,
      },
    };
  },
});

// Logout - invalidate session
export const logoutSecure = mutation({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("userSessions")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash))
      .first();

    if (session) {
      // Mark session as inactive
      await ctx.db.patch(session._id, { 
        isActive: false,
        lastUsed: Date.now(),
      });

      // Log logout event
      await ctx.db.insert("analytics", {
        eventType: "logout",
        userId: session.userId,
        timestamp: Date.now(),
      });
    }

    return { success: true };
  },
});

// Change password
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.passwordHash) {
      throw new ConvexError("User not found");
    }

    // Verify current password
    if (!verifyPassword(args.currentPassword, user.passwordHash)) {
      throw new ConvexError("Current password is incorrect");
    }

    // Validate new password strength
    if (args.newPassword.length < 8) {
      throw new ConvexError("New password must be at least 8 characters long");
    }

    const now = Date.now();

    // Update password
    await ctx.db.patch(args.userId, {
      passwordHash: hashPassword(args.newPassword),
      updatedAt: now,
    });

    // Invalidate all existing sessions except current one (for security)
    const sessions = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const session of sessions) {
      await ctx.db.patch(session._id, { isActive: false });
    }

    // Log password change in audit trail
    await ctx.db.insert("auditLog", {
      entityType: "user",
      entityId: args.userId,
      action: "password_change",
      userId: args.userId,
      notes: "Password changed by user",
      timestamp: now,
    });

    return { success: true };
  },
});

// Update user profile with role validation
export const updateUserProfileSecure = mutation({
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
    requestingUserId: v.id("users"), // Who is making the update
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const requestingUser = await ctx.db.get(args.requestingUserId);
    
    if (!user || !requestingUser) {
      throw new ConvexError("User not found");
    }

    // Authorization check - users can update their own profile or admins can update any
    if (args.userId !== args.requestingUserId && requestingUser.role !== "admin") {
      throw new ConvexError("Unauthorized to update this profile");
    }

    const now = Date.now();

    // Update user profile
    await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: now,
    });

    // Log profile update in audit trail
    await ctx.db.insert("auditLog", {
      entityType: "user",
      entityId: args.userId,
      action: "profile_update",
      userId: args.requestingUserId,
      newValues: JSON.stringify(args.updates),
      timestamp: now,
    });

    return await ctx.db.get(args.userId);
  },
});

// Admin function to update user roles
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(
      v.literal("user"), 
      v.literal("author"), 
      v.literal("editor"), 
      v.literal("moderator"), 
      v.literal("admin")
    ),
    adminUserId: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminUserId);
    if (!admin || admin.role !== "admin") {
      throw new ConvexError("Only admins can update user roles");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const now = Date.now();
    const oldRole = user.role;

    // Update user role
    await ctx.db.patch(args.userId, {
      role: args.newRole,
      updatedAt: now,
    });

    // Log role change in audit trail
    await ctx.db.insert("auditLog", {
      entityType: "user",
      entityId: args.userId,
      action: "role_change",
      userId: args.adminUserId,
      oldValues: JSON.stringify({ role: oldRole }),
      newValues: JSON.stringify({ role: args.newRole }),
      notes: args.notes || `Role changed from ${oldRole} to ${args.newRole}`,
      timestamp: now,
    });

    return { success: true };
  },
});

// Deactivate user account
export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
    adminUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminUserId);
    if (!admin || (admin.role !== "admin" && admin.role !== "moderator")) {
      throw new ConvexError("Only admins or moderators can deactivate users");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const now = Date.now();

    // Deactivate user
    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: now,
    });

    // Invalidate all user sessions
    const sessions = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const session of sessions) {
      await ctx.db.patch(session._id, { isActive: false });
    }

    // Log deactivation in audit trail
    await ctx.db.insert("auditLog", {
      entityType: "user",
      entityId: args.userId,
      action: "deactivate",
      userId: args.adminUserId,
      notes: args.reason || "Account deactivated",
      timestamp: now,
    });

    return { success: true };
  },
});

// Get users with role-based filtering (for admins)
export const getUsersWithFilters = query({
  args: {
    requestingUserId: v.id("users"),
    filters: v.optional(v.object({
      role: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      medicalLevel: v.optional(v.string()),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const requestingUser = await ctx.db.get(args.requestingUserId);
    if (!requestingUser || (requestingUser.role !== "admin" && requestingUser.role !== "moderator")) {
      throw new ConvexError("Unauthorized access");
    }

    let query = ctx.db.query("users");
    const limit = args.limit || 50;

    // Apply filters
    if (args.filters?.role) {
      query = query.withIndex("by_role", (q) => q.eq("role", args.filters!.role as any));
    }
    if (args.filters?.isActive !== undefined) {
      query = query.withIndex("by_active", (q) => q.eq("isActive", args.filters!.isActive!));
    }

    const users = await query.take(limit);

    // Filter by medical level if specified
    const filtered = args.filters?.medicalLevel
      ? users.filter(u => u.medicalLevel === args.filters!.medicalLevel)
      : users;

    return filtered.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      points: user.points,
      level: user.level,
      accuracy: user.accuracy,
      medicalLevel: user.medicalLevel,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }));
  },
});

// Clean expired sessions (maintenance function)
export const cleanExpiredSessions = mutation({
  args: {},
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiredSessions = await ctx.db
      .query("userSessions")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    let cleanedCount = 0;
    for (const session of expiredSessions) {
      await ctx.db.patch(session._id, { isActive: false });
      cleanedCount++;
    }

    return { cleanedSessions: cleanedCount };
  },
});