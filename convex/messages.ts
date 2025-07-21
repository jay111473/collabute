import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("user"),
    content: v.string(),
    type: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      type: (args.type as "TEXT" | "IMAGE" | "FILE" | "SYSTEM") || "TEXT",
      isEdited: false,
      isDeleted: false,
    });

    // Update conversation message count and last message
    await ctx.db.patch(args.conversationId, {
      messageCount: (await ctx.db.get(args.conversationId))!.messageCount + 1,
      lastMessageId: messageId,
    });

    // Update participant's last read if they're sending
    const participant = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.senderId)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        lastReadMessageId: messageId,
      });
    }

    return messageId;
  },
});

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

        return {
          ...message,
          sender: sender
            ? {
                ...sender,
                name: sender.name,
                email: sender.email,
                image: sender.image,
              }
            : null,
        };
      })
    );

    return messagesWithSenders.reverse(); // Return in chronological order
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    newContent: v.string(),
    userId: v.id("user"),
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
      editedAt: Date.now(),
    });

    return true;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("user"),
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
    userId: v.id("user"),
    messageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("conversation_participants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .first();

    if (participant && args.messageId) {
      await ctx.db.patch(participant._id, {
        lastReadMessageId: args.messageId,
      });
    }

    return true;
  },
});

export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("user"),
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

    // Count messages after participant joined, excluding their own messages
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

        return {
          ...message,
          sender: sender
            ? {
                ...sender,
                name: sender.name,
                email: sender.email,
                image: sender.image,
              }
            : null,
        };
      })
    );

    return messagesWithSenders;
  },
});
