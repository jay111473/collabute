import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ==============================
// QUERIES
// ==============================

export const getMediaById = query({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getMediaByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    return await ctx.db
      .query("media")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(limit);
  },
});

export const getMediaByType = query({
  args: {
    type: v.string(),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let query = ctx.db.query("media");

    if (args.userId) {
      query = query.filter((q) =>
        q.and(
          q.eq(q.field("type"), args.type),
          q.eq(q.field("userId"), args.userId)
        )
      );
    } else {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    return await query.order("desc").take(limit);
  },
});

export const getAllMedia = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;

    const media = await ctx.db.query("media").order("desc").collect();

    return media.slice(offset, offset + limit);
  },
});

// ==============================
// MUTATIONS
// ==============================

export const createMedia = mutation({
  args: {
    userId: v.id("users"),
    url: v.string(),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mediaId = await ctx.db.insert("media", {
      userId: args.userId,
      url: args.url,
      type: args.type,
      description: args.description,
      createdAt: Date.now(),
    });

    return mediaId;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createMediaFromUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    userId: v.id("users"),
    fileSize: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Failed to get file URL from storage");
    }
    
    const mediaId = await ctx.db.insert("media", {
      userId: args.userId,
      url,
      type: args.fileType,
      description: args.description || args.fileName,
      createdAt: Date.now(),
    });
    
    return { mediaId, url };
  },
});

export const updateMedia = mutation({
  args: {
    id: v.id("media"),
    url: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existingMedia = await ctx.db.get(id);
    if (!existingMedia) {
      throw new Error("Media not found");
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length === 0) {
      return existingMedia;
    }

    await ctx.db.patch(id, filteredUpdates);
    return await ctx.db.get(id);
  },
});

export const deleteMedia = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    const existingMedia = await ctx.db.get(args.id);
    if (!existingMedia) {
      throw new Error("Media not found");
    }

    await ctx.db.delete(args.id);
    return { success: true, deletedId: args.id };
  },
});

export const bulkDeleteMedia = mutation({
  args: { ids: v.array(v.id("media")) },
  handler: async (ctx, args) => {
    const deletedIds: Id<"media">[] = [];
    const notFoundIds: Id<"media">[] = [];

    for (const id of args.ids) {
      const existingMedia = await ctx.db.get(id);
      if (existingMedia) {
        await ctx.db.delete(id);
        deletedIds.push(id);
      } else {
        notFoundIds.push(id);
      }
    }

    return {
      success: true,
      deletedIds,
      notFoundIds,
      deletedCount: deletedIds.length,
    };
  },
});

// ==============================
// UTILITY FUNCTIONS
// ==============================

export const getMediaStats = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("media");

    if (args.userId) {
      query = query.filter((q) => q.eq(q.field("userId"), args.userId));
    }

    const allMedia = await query.collect();

    const stats = {
      total: allMedia.length,
      byType: {} as Record<string, number>,
      totalSize: 0,
    };

    allMedia.forEach((media) => {
      const type = media.type || "unknown";
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  },
});

export const searchMedia = query({
  args: {
    searchTerm: v.string(),
    userId: v.optional(v.id("users")),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let query = ctx.db.query("media");

    if (args.userId && args.type) {
      query = query.filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("type"), args.type)
        )
      );
    } else if (args.userId) {
      query = query.filter((q) => q.eq(q.field("userId"), args.userId));
    } else if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const allMedia = await query.collect();

    const searchTermLower = args.searchTerm.toLowerCase();
    const filteredMedia = allMedia.filter((media) => {
      const description = media.description?.toLowerCase() || "";
      const url = media.url.toLowerCase();

      return (
        description.includes(searchTermLower) || url.includes(searchTermLower)
      );
    });

    return filteredMedia
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});
