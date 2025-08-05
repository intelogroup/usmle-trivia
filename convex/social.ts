import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send friend request
export const sendFriendRequest = mutation({
  args: {
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.fromUserId === args.toUserId) {
      throw new ConvexError("Cannot send friend request to yourself");
    }
    
    // Check if friendship already exists
    const existing = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => 
        q.eq("userId1", args.fromUserId).eq("userId2", args.toUserId)
      )
      .first();
    
    const existingReverse = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => 
        q.eq("userId1", args.toUserId).eq("userId2", args.fromUserId)
      )
      .first();
    
    if (existing || existingReverse) {
      throw new ConvexError("Friend request already exists");
    }
    
    // Create friend request
    const friendshipId = await ctx.db.insert("friendships", {
      userId1: args.fromUserId,
      userId2: args.toUserId,
      status: "pending",
      createdAt: Date.now(),
    });
    
    return friendshipId;
  },
});

// Accept friend request
export const acceptFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new ConvexError("Friend request not found");
    }
    
    // Ensure the user is the recipient of the request
    if (friendship.userId2 !== args.userId) {
      throw new ConvexError("You cannot accept this friend request");
    }
    
    if (friendship.status !== "pending") {
      throw new ConvexError("Friend request is not pending");
    }
    
    // Update status to accepted
    await ctx.db.patch(args.friendshipId, {
      status: "accepted",
    });
    
    return { success: true };
  },
});

// Decline or remove friend
export const removeFriend = mutation({
  args: {
    friendshipId: v.id("friendships"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) {
      throw new ConvexError("Friendship not found");
    }
    
    // Ensure the user is part of this friendship
    if (friendship.userId1 !== args.userId && friendship.userId2 !== args.userId) {
      throw new ConvexError("You are not part of this friendship");
    }
    
    // Delete the friendship
    await ctx.db.delete(args.friendshipId);
    
    return { success: true };
  },
});

// Get user's friends
export const getUserFriends = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("blocked"))),
  },
  handler: async (ctx, args) => {
    // Get friendships where user is either userId1 or userId2
    const friendships1 = await ctx.db
      .query("friendships")
      .withIndex("by_user1", (q) => q.eq("userId1", args.userId))
      .collect();
    
    const friendships2 = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("userId2", args.userId))
      .collect();
    
    const allFriendships = [...friendships1, ...friendships2];
    
    // Filter by status if provided
    const filtered = args.status 
      ? allFriendships.filter(f => f.status === args.status)
      : allFriendships;
    
    // Get friend details
    const friendsWithDetails = [];
    
    for (const friendship of filtered) {
      const friendId = friendship.userId1 === args.userId 
        ? friendship.userId2 
        : friendship.userId1;
      
      const friend = await ctx.db.get(friendId);
      if (friend) {
        friendsWithDetails.push({
          friendship: {
            _id: friendship._id,
            status: friendship.status,
            createdAt: friendship.createdAt,
            isInitiator: friendship.userId1 === args.userId,
          },
          friend: {
            _id: friend._id,
            name: friend.name,
            email: friend.email,
            avatar: friend.avatar,
            level: friend.level,
            points: friend.points,
            accuracy: friend.accuracy,
          },
        });
      }
    }
    
    return friendsWithDetails;
  },
});

// Get pending friend requests
export const getPendingRequests = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get pending requests where user is the recipient (userId2)
    const pendingRequests = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("userId2", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
    
    // Get sender details
    const requestsWithDetails = [];
    
    for (const request of pendingRequests) {
      const sender = await ctx.db.get(request.userId1);
      if (sender) {
        requestsWithDetails.push({
          request: {
            _id: request._id,
            createdAt: request.createdAt,
          },
          sender: {
            _id: sender._id,
            name: sender.name,
            email: sender.email,
            avatar: sender.avatar,
            level: sender.level,
            points: sender.points,
          },
        });
      }
    }
    
    return requestsWithDetails;
  },
});

// Create study group
export const createStudyGroup = mutation({
  args: {
    creatorId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("studyGroups", {
      name: args.name,
      description: args.description,
      creatorId: args.creatorId,
      members: [args.creatorId], // Creator is the first member
      isPublic: args.isPublic,
      category: args.category,
      createdAt: Date.now(),
    });
    
    return groupId;
  },
});

// Join study group
export const joinStudyGroup = mutation({
  args: {
    groupId: v.id("studyGroups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new ConvexError("Study group not found");
    }
    
    // Check if already a member
    if (group.members.includes(args.userId)) {
      throw new ConvexError("Already a member of this group");
    }
    
    // Add user to members
    await ctx.db.patch(args.groupId, {
      members: [...group.members, args.userId],
    });
    
    return { success: true };
  },
});

// Leave study group
export const leaveStudyGroup = mutation({
  args: {
    groupId: v.id("studyGroups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new ConvexError("Study group not found");
    }
    
    // Check if member
    if (!group.members.includes(args.userId)) {
      throw new ConvexError("Not a member of this group");
    }
    
    // Cannot leave if you're the creator and only member
    if (group.creatorId === args.userId && group.members.length === 1) {
      throw new ConvexError("Cannot leave group as the only member. Delete the group instead.");
    }
    
    // Remove user from members
    await ctx.db.patch(args.groupId, {
      members: group.members.filter(id => id !== args.userId),
    });
    
    return { success: true };
  },
});

// Get user's study groups
export const getUserStudyGroups = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all groups where user is a member
    const allGroups = await ctx.db.query("studyGroups").collect();
    
    const userGroups = allGroups.filter(group => 
      group.members.includes(args.userId)
    );
    
    // Get member details for each group
    const groupsWithDetails = [];
    
    for (const group of userGroups) {
      const members = [];
      for (const memberId of group.members.slice(0, 5)) { // Limit to 5 members for preview
        const member = await ctx.db.get(memberId);
        if (member) {
          members.push({
            _id: member._id,
            name: member.name,
            avatar: member.avatar,
          });
        }
      }
      
      groupsWithDetails.push({
        ...group,
        memberDetails: members,
        totalMembers: group.members.length,
      });
    }
    
    return groupsWithDetails;
  },
});

// Get public study groups
export const getPublicStudyGroups = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("studyGroups")
      .withIndex("by_public", (q) => q.eq("isPublic", true));
    
    const groups = await query.take(args.limit ?? 20);
    
    // Filter by category if provided
    const filtered = args.category 
      ? groups.filter(g => g.category === args.category)
      : groups;
    
    // Get creator details for each group
    const groupsWithDetails = [];
    
    for (const group of filtered) {
      const creator = await ctx.db.get(group.creatorId);
      if (creator) {
        groupsWithDetails.push({
          ...group,
          creatorName: creator.name,
          creatorAvatar: creator.avatar,
        });
      }
    }
    
    return groupsWithDetails;
  },
});

// Create quiz challenge
export const createChallenge = mutation({
  args: {
    challengerId: v.id("users"),
    challengedId: v.id("users"),
    category: v.optional(v.string()),
    questionCount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.challengerId === args.challengedId) {
      throw new ConvexError("Cannot challenge yourself");
    }
    
    // Check if they are friends
    const friendship1 = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => 
        q.eq("userId1", args.challengerId).eq("userId2", args.challengedId)
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();
    
    const friendship2 = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => 
        q.eq("userId1", args.challengedId).eq("userId2", args.challengerId)
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();
    
    if (!friendship1 && !friendship2) {
      throw new ConvexError("Can only challenge friends");
    }
    
    // Create challenge
    const challengeId = await ctx.db.insert("challenges", {
      challengerId: args.challengerId,
      challengedId: args.challengedId,
      status: "pending",
      category: args.category,
      questionCount: args.questionCount,
      createdAt: Date.now(),
    });
    
    return challengeId;
  },
});

// Accept challenge
export const acceptChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new ConvexError("Challenge not found");
    }
    
    if (challenge.challengedId !== args.userId) {
      throw new ConvexError("You cannot accept this challenge");
    }
    
    if (challenge.status !== "pending") {
      throw new ConvexError("Challenge is not pending");
    }
    
    await ctx.db.patch(args.challengeId, {
      status: "accepted",
    });
    
    return { success: true };
  },
});

// Complete challenge
export const completeChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
    userId: v.id("users"),
    score: v.number(),
    quizSessionId: v.id("quizSessions"),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) {
      throw new ConvexError("Challenge not found");
    }
    
    if (challenge.status !== "accepted") {
      throw new ConvexError("Challenge is not active");
    }
    
    // Update challenge with score
    const updates: any = {};
    
    if (args.userId === challenge.challengerId) {
      updates.challengerScore = args.score;
    } else if (args.userId === challenge.challengedId) {
      updates.challengedScore = args.score;
    } else {
      throw new ConvexError("You are not part of this challenge");
    }
    
    // Check if both have completed
    const otherScore = args.userId === challenge.challengerId 
      ? challenge.challengedScore 
      : challenge.challengerScore;
    
    if (otherScore !== undefined) {
      // Both have completed, determine winner
      updates.status = "completed";
      updates.completedAt = Date.now();
      
      if (args.score > otherScore) {
        updates.winnerId = args.userId;
      } else if (otherScore > args.score) {
        updates.winnerId = args.userId === challenge.challengerId 
          ? challenge.challengedId 
          : challenge.challengerId;
      }
      // If tie, no winner
    }
    
    await ctx.db.patch(args.challengeId, updates);
    
    return { success: true };
  },
});

// Get user's challenges
export const getUserChallenges = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("completed"), v.literal("declined"))),
  },
  handler: async (ctx, args) => {
    // Get challenges where user is either challenger or challenged
    const asChallenger = await ctx.db
      .query("challenges")
      .withIndex("by_challenger", (q) => q.eq("challengerId", args.userId))
      .collect();
    
    const asChallenged = await ctx.db
      .query("challenges")
      .withIndex("by_challenged", (q) => q.eq("challengedId", args.userId))
      .collect();
    
    const allChallenges = [...asChallenger, ...asChallenged];
    
    // Filter by status if provided
    const filtered = args.status 
      ? allChallenges.filter(c => c.status === args.status)
      : allChallenges;
    
    // Get opponent details
    const challengesWithDetails = [];
    
    for (const challenge of filtered) {
      const opponentId = challenge.challengerId === args.userId 
        ? challenge.challengedId 
        : challenge.challengerId;
      
      const opponent = await ctx.db.get(opponentId);
      if (opponent) {
        challengesWithDetails.push({
          ...challenge,
          isChallenger: challenge.challengerId === args.userId,
          opponent: {
            _id: opponent._id,
            name: opponent.name,
            avatar: opponent.avatar,
            level: opponent.level,
          },
        });
      }
    }
    
    return challengesWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});