import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    createdById: v.id("users"),
    projectId: v.optional(v.id("projects")),
    participantIds: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      title: args.title,
      type: args.type,
      projectId: args.projectId,
      createdById: args.createdById,
      isArchived: false,
      messageCount: 0,
    });

    // Add creator as admin participant
    await ctx.db.insert("conversation_participants", {
      conversationId,
      userId: args.createdById,
      role: "ADMIN",
      joinedAt: Date.now(),
    });

    // Add other participants if specified
    if (args.participantIds) {
      for (const userId of args.participantIds) {
        if (userId !== args.createdById) {
          await ctx.db.insert("conversation_participants", {
            conversationId,
            userId,
            role: "MEMBER",
            joinedAt: Date.now(),
          });
        }
      }
    }

    return conversationId;
  },
});

export const getConversations = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user's conversation participations
    const participations = await ctx.db
      .query("conversation_participants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    // Get conversations
    const conversations = await Promise.all(
      participations.map(async (participation) => {
        const conversation = await ctx.db.get(participation.conversationId);
        return { conversation, participation };
      })
    );

    // Filter and sort conversations
    let filteredConversations = conversations
      .filter(({ conversation }) => conversation && !conversation.isArchived)
      .filter(({ conversation }) => !args.type || conversation!.type === args.type)
      .filter(({ conversation }) => !args.projectId || conversation!.projectId === args.projectId);

    // Sort by creation time for now (can be improved with last message tracking)
    filteredConversations.sort((a, b) => {
      const aTime = a.conversation!._creationTime;
      const bTime = b.conversation!._creationTime;
      return bTime - aTime;
    });

    // Apply limit
    if (args.limit) {
      filteredConversations = filteredConversations.slice(0, args.limit);
    }

    // Get additional data for each conversation
    const conversationsWithData = await Promise.all(
      filteredConversations.map(async ({ conversation, participation }) => {
        if (!conversation) return null;

        // Get all participants
        const allParticipants = await ctx.db
          .query("conversation_participants")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .filter((q) => q.eq(q.field("leftAt"), undefined))
          .collect();

        const participantsWithData = await Promise.all(
          allParticipants.map(async (p) => {
            const user = await ctx.db.get(p.userId);
            const authUser = user && user.authUserId ? await ctx.db.get(user.authUserId) : null;
            return {
              ...p,
              user: user ? {
                ...user,
                name: authUser?.name,
                email: authUser?.email,
                image: authUser?.image,
              } : null,
            };
          })
        );

        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .order("desc")
          .first();

        let lastMessageWithSender = null;
        if (lastMessage) {
          const sender = await ctx.db.get(lastMessage.senderId);
          const senderAuth = sender && sender.authUserId ? await ctx.db.get(sender.authUserId) : null;
          lastMessageWithSender = {
            ...lastMessage,
            sender: sender ? {
              ...sender,
              name: senderAuth?.name,
              email: senderAuth?.email,
            } : null,
          };
        }

        // Get unread count (simplified for now)
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .filter((q) => 
            q.and(
              q.gt(q.field("_creationTime"), participation.joinedAt),
              q.neq(q.field("senderId"), args.userId),
              q.eq(q.field("isDeleted"), false)
            )
          )
          .collect();

        return {
          ...conversation,
          participants: participantsWithData,
          lastMessage: lastMessageWithSender,
          unreadCount: unreadMessages.length,
          userRole: participation.role,
        };
      })
    );

    return conversationsWithData.filter(Boolean);
  },
});

export const getConversationById = query({
  args: { 
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    
    if (!conversation) {
      return null;
    }

    // Check if user is participant
    const participation = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) => 
        q.eq("conversationId", args.conversationId).eq("userId", args.userId))
      .first();

    if (!participation || participation.leftAt) {
      return null;
    }

    // Get all participants
    const participants = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    const participantsWithData = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        const authUser = user && user.authUserId ? await ctx.db.get(user.authUserId) : null;
        return {
          ...p,
          user: user ? {
            ...user,
            name: authUser?.name,
            email: authUser?.email,
            image: authUser?.image,
          } : null,
        };
      })
    );

    // Get project if exists
    const project = conversation.projectId ? 
      await ctx.db.get(conversation.projectId) : null;

    return {
      ...conversation,
      participants: participantsWithData,
      project,
      userRole: participation.role,
    };
  },
});

export const addParticipant = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    addedById: v.id("users"),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if adder has permission
    const adderParticipation = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) => 
        q.eq("conversationId", args.conversationId).eq("userId", args.addedById))
      .first();

    if (!adderParticipation || !["ADMIN", "MODERATOR"].includes(adderParticipation.role || "")) {
      throw new Error("Insufficient permissions to add participants");
    }

    // Check if user is already a participant
    const existingParticipation = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) => 
        q.eq("conversationId", args.conversationId).eq("userId", args.userId))
      .first();

    if (existingParticipation && !existingParticipation.leftAt) {
      return existingParticipation._id;
    }

    // Add new participant or reactivate existing
    if (existingParticipation) {
      await ctx.db.patch(existingParticipation._id, {
        leftAt: undefined,
        role: args.role || "MEMBER",
        joinedAt: Date.now(),
      });
      return existingParticipation._id;
    } else {
      return await ctx.db.insert("conversation_participants", {
        conversationId: args.conversationId,
        userId: args.userId,
        role: args.role || "MEMBER",
        joinedAt: Date.now(),
      });
    }
  },
});

export const removeParticipant = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    removedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Users can remove themselves, or admins/moderators can remove others
    if (args.userId !== args.removedById) {
      const removerParticipation = await ctx.db
        .query("conversation_participants")
        .withIndex("by_conversation_user", (q) => 
          q.eq("conversationId", args.conversationId).eq("userId", args.removedById))
        .first();

      if (!removerParticipation || !["ADMIN", "MODERATOR"].includes(removerParticipation.role || "")) {
        throw new Error("Insufficient permissions to remove participants");
      }
    }

    const participation = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) => 
        q.eq("conversationId", args.conversationId).eq("userId", args.userId))
      .first();

    if (participation) {
      await ctx.db.patch(participation._id, {
        leftAt: Date.now(),
      });
    }

    return true;
  },
});

export const updateConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    updates: v.object({
      title: v.optional(v.string()),
      isArchived: v.optional(v.boolean()),
    }),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user has permission to update
    const participation = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) => 
        q.eq("conversationId", args.conversationId).eq("userId", args.userId))
      .first();

    if (!participation || !["ADMIN", "MODERATOR"].includes(participation.role || "")) {
      throw new Error("Insufficient permissions to update conversation");
    }

    await ctx.db.patch(args.conversationId, args.updates);
    return true;
  },
});

export const getDirectConversation = query({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Find direct conversations involving both users
    const user1Participations = await ctx.db
      .query("conversation_participants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId1))
      .collect();

    const user2Participations = await ctx.db
      .query("conversation_participants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId2))
      .collect();

    // Find common conversations
    const commonConversations = user1Participations
      .filter(p1 => user2Participations.some(p2 => p2.conversationId === p1.conversationId))
      .map(p => p.conversationId);

    // Find direct message conversation (type: DIRECT, only 2 participants)
    for (const conversationId of commonConversations) {
      const conversation = await ctx.db.get(conversationId);
      if (conversation?.type === "DIRECT") {
        const participantCount = await ctx.db
          .query("conversation_participants")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
          .filter((q) => q.eq(q.field("leftAt"), undefined))
          .collect();

        if (participantCount.length === 2) {
          return conversation;
        }
      }
    }

    return null;
  },
});

export const createDirectConversation = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if direct conversation already exists
    const existing = await ctx.db
      .query("conversation_participants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId1))
      .collect();

    for (const participation of existing) {
      const conversation = await ctx.db.get(participation.conversationId);
      if (conversation?.type === "DIRECT") {
        const otherParticipant = await ctx.db
          .query("conversation_participants")
          .withIndex("by_conversation", (q) => q.eq("conversationId", participation.conversationId))
          .filter((q) => q.neq(q.field("userId"), args.userId1))
          .first();

        if (otherParticipant?.userId === args.userId2) {
          return participation.conversationId;
        }
      }
    }

    // Create new direct conversation
    const conversationId = await ctx.db.insert("conversations", {
      title: "Direct Message",
      type: "DIRECT",
      createdById: args.userId1,
      isArchived: false,
      messageCount: 0,
    });

    // Add both users as participants
    await ctx.db.insert("conversation_participants", {
      conversationId,
      userId: args.userId1,
      role: "MEMBER",
      joinedAt: Date.now(),
    });

    await ctx.db.insert("conversation_participants", {
      conversationId,
      userId: args.userId2,
      role: "MEMBER",
      joinedAt: Date.now(),
    });

    return conversationId;
  },
});