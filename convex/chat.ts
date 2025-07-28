import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// ==============================
// CONVERSATION QUERIES
// ==============================

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
      .filter(
        ({ conversation }) => !args.type || conversation!.type === args.type
      )
      .filter(
        ({ conversation }) =>
          !args.projectId || conversation!.projectId === args.projectId
      );

    // Sort by last message time
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
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .filter((q) => q.eq(q.field("leftAt"), undefined))
          .collect();

        const participantsWithData = await Promise.all(
          allParticipants.map(async (p) => {
            const user = await ctx.db.get(p.userId);
            let profilePicture = null;
            if (user?.profilePicture) {
              profilePicture = await ctx.db.get(user.profilePicture);
            }

            return {
              ...p,
              user: user
                ? {
                    _id: user._id,
                    id: user._id, // Backward compatibility
                    name: user.name || "Unknown User",
                    email: user.email,
                    profilePicture: profilePicture,
                  }
                : null,
            };
          })
        );

        // Get last message
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .order("desc")
          .first();

        let lastMessageWithSender = null;
        if (lastMessage) {
          const sender = await ctx.db.get(lastMessage.senderId);
          lastMessageWithSender = {
            ...lastMessage,
            id: lastMessage._id, // Backward compatibility
            createdAt: new Date(lastMessage._creationTime).toISOString(),
            sender: sender
              ? {
                  _id: sender._id,
                  name: sender.name || "Unknown User",
                  email: sender.email,
                }
              : null,
          };
        }

        // Get unread count
        const lastReadMessageId = participation.lastReadMessageId;
        let unreadCount = 0;

        if (
          lastMessage &&
          (!lastReadMessageId || lastMessage._id !== lastReadMessageId)
        ) {
          const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
              q.eq("conversationId", conversation._id)
            )
            .filter((q) => {
              if (lastReadMessageId) {
                // Get the creation time of the last read message to compare
                const lastReadMessage = ctx.db.get(lastReadMessageId);
                return q.and(
                  q.gt(q.field("_creationTime"), participation.joinedAt),
                  q.neq(q.field("senderId"), args.userId),
                  q.eq(q.field("isDeleted"), false)
                );
              } else {
                return q.and(
                  q.gt(q.field("_creationTime"), participation.joinedAt),
                  q.neq(q.field("senderId"), args.userId),
                  q.eq(q.field("isDeleted"), false)
                );
              }
            })
            .collect();

          // If we have a last read message, filter out messages before it
          if (lastReadMessageId) {
            const lastReadMessage = await ctx.db.get(lastReadMessageId);
            if (lastReadMessage) {
              const filteredUnread = unreadMessages.filter(
                (msg) => msg._creationTime > lastReadMessage._creationTime
              );
              unreadCount = filteredUnread.length;
            } else {
              unreadCount = unreadMessages.length;
            }
          } else {
            unreadCount = unreadMessages.length;
          }
        }

        // Generate display data based on conversation type
        let displayData = {
          title: conversation.title,
          name: conversation.name,
          description: conversation.description,
          avatar: null as any,
        };

        if (conversation.type === "private" || conversation.type === "DIRECT") {
          const otherParticipant = participantsWithData.find(
            (p) => p.user && p.user._id !== args.userId
          );
          if (otherParticipant?.user) {
            displayData.title = otherParticipant.user.name;
            displayData.avatar = otherParticipant.user.profilePicture;
          }
        }

        return {
          ...conversation,
          _id: conversation._id,
          id: conversation._id, // Backward compatibility
          title: displayData.title,
          name: displayData.name,
          description: displayData.description,
          avatar: displayData.avatar,
          type: conversation.type || "group",
          participants: participantsWithData,
          lastMessage: lastMessageWithSender,
          messageCount: conversation.messageCount,
          unreadCount,
          isArchived: conversation.isArchived,
          createdAt: new Date(conversation._creationTime).toISOString(),
          updatedAt: new Date(conversation._creationTime).toISOString(),
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
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (!participation || participation.leftAt) {
      return null;
    }

    // Get all participants
    const participants = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    const participantsWithData = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        let profilePicture = null;
        if (user?.profilePicture) {
          profilePicture = await ctx.db.get(user.profilePicture);
        }

        return {
          ...p,
          user: user
            ? {
                _id: user._id,
                id: user._id,
                name: user.name || "Unknown User",
                email: user.email,
                profilePicture: profilePicture,
              }
            : null,
        };
      })
    );

    // Get project if exists
    const project = conversation.projectId
      ? await ctx.db.get(conversation.projectId)
      : null;

    return {
      ...conversation,
      _id: conversation._id,
      id: conversation._id,
      participants: participantsWithData,
      project,
      userRole: participation.role,
    };
  },
});

// ==============================
// MESSAGE QUERIES
// ==============================

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false));

    if (args.before !== undefined) {
      query = query.filter((q) => q.lt(q.field("_creationTime"), args.before!));
    }

    const messages = await query.order("desc").take(args.limit || 50);

    // Get sender information for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        let profilePicture = null;
        if (sender?.profilePicture) {
          profilePicture = await ctx.db.get(sender.profilePicture);
        }

        return {
          ...message,
          _id: message._id,
          id: message._id, // Backward compatibility
          createdAt: new Date(message._creationTime).toISOString(),
          updatedAt: new Date(message._creationTime).toISOString(),
          senderId: message.senderId,
          sender: sender
            ? {
                _id: sender._id,
                id: sender._id,
                name: sender.name || "Unknown User",
                email: sender.email,
                profilePicture: profilePicture,
              }
            : null,
          replyTo: message.replyToId
            ? await ctx.db.get(message.replyToId)
            : null,
          isOptimistic: false, // Server messages are never optimistic
        };
      })
    );

    return messagesWithSenders.reverse(); // Return in chronological order
  },
});

// ==============================
// MESSAGE MUTATIONS
// ==============================

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.optional(v.string()),
    replyToId: v.optional(v.id("messages")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Validate that user is participant
    const participation = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.senderId)
      )
      .first();

    if (!participation || participation.leftAt) {
      throw new Error("User is not a participant in this conversation");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      type: (args.type as "TEXT" | "IMAGE" | "FILE" | "SYSTEM") || "TEXT",
      replyToId: args.replyToId,
      isEdited: false,
      isDeleted: false,
    });

    // Update conversation message count and last message
    const conversation = await ctx.db.get(args.conversationId);
    if (conversation) {
      await ctx.db.patch(args.conversationId, {
        messageCount: conversation.messageCount + 1,
        lastMessageId: messageId,
      });
    }

    // Update participant's last read message since they're sending
    await ctx.db.patch(participation._id, {
      lastReadMessageId: messageId,
    });

    return messageId;
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    newContent: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== args.userId) {
      throw new Error("Unauthorized to edit this message");
    }

    await ctx.db.patch(args.messageId, {
      content: args.newContent,
      isEdited: true,
      editedAt: Date.now(),
    });

    return true;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== args.userId) {
      throw new Error("Unauthorized to delete this message");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });

    // Update conversation message count
    const conversation = await ctx.db.get(message.conversationId);
    if (conversation) {
      await ctx.db.patch(message.conversationId, {
        messageCount: Math.max(0, conversation.messageCount - 1),
      });
    }

    return true;
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    messageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (!participant) {
      throw new Error("User is not a participant in this conversation");
    }

    let messageToMark = args.messageId;

    // If no specific message provided, mark the latest message as read
    if (!messageToMark) {
      const latestMessage = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .order("desc")
        .first();

      if (latestMessage) {
        messageToMark = latestMessage._id;
      }
    }

    if (messageToMark) {
      await ctx.db.patch(participant._id, {
        lastReadMessageId: messageToMark,
      });
    }

    return true;
  },
});

// ==============================
// CONVERSATION MUTATIONS
// ==============================

export const createConversation = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    createdById: v.id("users"),
    projectId: v.optional(v.id("projects")),
    participantIds: v.optional(v.array(v.id("users"))),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      title: args.title,
      name: args.name,
      type: args.type,
      description: args.description,
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
      notifications: "all",
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
            notifications: "all",
          });
        }
      }
    }

    return conversationId;
  },
});

export const createDirectConversation = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if direct conversation already exists
    const user1Participations = await ctx.db
      .query("conversation_participants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId1))
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    for (const participation of user1Participations) {
      const conversation = await ctx.db.get(participation.conversationId);
      if (conversation?.type === "private" || conversation?.type === "DIRECT") {
        const otherParticipant = await ctx.db
          .query("conversation_participants")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", participation.conversationId)
          )
          .filter((q) =>
            q.and(
              q.neq(q.field("userId"), args.userId1),
              q.eq(q.field("leftAt"), undefined)
            )
          )
          .first();

        if (otherParticipant?.userId === args.userId2) {
          return participation.conversationId;
        }
      }
    }

    // Get user names for conversation title
    const user1 = await ctx.db.get(args.userId1);
    const user2 = await ctx.db.get(args.userId2);
    const title = `${user1?.name || "User"} & ${user2?.name || "User"}`;

    // Create new direct conversation
    const conversationId = await ctx.db.insert("conversations", {
      title,
      type: "private",
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
      notifications: "all",
    });

    await ctx.db.insert("conversation_participants", {
      conversationId,
      userId: args.userId2,
      role: "MEMBER",
      joinedAt: Date.now(),
      notifications: "all",
    });

    return conversationId;
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
        q.eq("conversationId", args.conversationId).eq("userId", args.addedById)
      )
      .first();

    if (
      !adderParticipation ||
      !["ADMIN", "MODERATOR"].includes(adderParticipation.role || "")
    ) {
      throw new Error("Insufficient permissions to add participants");
    }

    // Check if user is already a participant
    const existingParticipation = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
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
        notifications: "all",
      });
      return existingParticipation._id;
    } else {
      return await ctx.db.insert("conversation_participants", {
        conversationId: args.conversationId,
        userId: args.userId,
        role: args.role || "MEMBER",
        joinedAt: Date.now(),
        notifications: "all",
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
          q
            .eq("conversationId", args.conversationId)
            .eq("userId", args.removedById)
        )
        .first();

      if (
        !removerParticipation ||
        !["ADMIN", "MODERATOR"].includes(removerParticipation.role || "")
      ) {
        throw new Error("Insufficient permissions to remove participants");
      }
    }

    const participation = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (participation) {
      await ctx.db.patch(participation._id, {
        leftAt: Date.now(),
      });
    }

    return true;
  },
});

// ==============================
// UTILITY QUERIES
// ==============================

export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (!participant) {
      return 0;
    }

    const lastReadMessageId = participant.lastReadMessageId;

    // If no last read message, count all messages after join time
    if (!lastReadMessageId) {
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .filter((q) =>
          q.and(
            q.gt(q.field("_creationTime"), participant.joinedAt),
            q.neq(q.field("senderId"), args.userId),
            q.eq(q.field("isDeleted"), false)
          )
        )
        .collect();
      return unreadMessages.length;
    }

    // Count messages after the last read message
    const lastReadMessage = await ctx.db.get(lastReadMessageId);
    if (!lastReadMessage) {
      return 0;
    }

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) =>
        q.and(
          q.gt(q.field("_creationTime"), lastReadMessage._creationTime),
          q.neq(q.field("senderId"), args.userId),
          q.eq(q.field("isDeleted"), false)
        )
      )
      .collect();

    return unreadMessages.length;
  },
});

export const searchMessages = query({
  args: {
    conversationId: v.id("conversations"),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Simple text search - in production you'd want full-text search
    const filteredMessages = messages
      .filter((message) =>
        message.content.toLowerCase().includes(args.searchTerm.toLowerCase())
      )
      .slice(0, args.limit || 20);

    // Get sender information
    const messagesWithSenders = await Promise.all(
      filteredMessages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        let profilePicture = null;
        if (sender?.profilePicture) {
          profilePicture = await ctx.db.get(sender.profilePicture);
        }

        return {
          ...message,
          _id: message._id,
          id: message._id,
          createdAt: new Date(message._creationTime).toISOString(),
          sender: sender
            ? {
                _id: sender._id,
                id: sender._id,
                name: sender.name || "Unknown User",
                email: sender.email,
                profilePicture: profilePicture,
              }
            : null,
        };
      })
    );

    return messagesWithSenders;
  },
});

// ==============================
// DIRECT MESSAGE HELPERS
// ==============================

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
      .filter((q) => q.eq(q.field("leftAt"), undefined))
      .collect();

    for (const participation of user1Participations) {
      const conversation = await ctx.db.get(participation.conversationId);
      if (conversation?.type === "private" || conversation?.type === "DIRECT") {
        const allParticipants = await ctx.db
          .query("conversation_participants")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", participation.conversationId)
          )
          .filter((q) => q.eq(q.field("leftAt"), undefined))
          .collect();

        if (allParticipants.length === 2) {
          const otherParticipant = allParticipants.find(
            (p) => p.userId !== args.userId1
          );
          if (otherParticipant?.userId === args.userId2) {
            return conversation;
          }
        }
      }
    }

    return null;
  },
});
