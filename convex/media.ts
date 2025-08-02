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


export const get = query({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAllImages = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db.query("media")
      .filter((q) => q.eq(q.field("type"), "image"))
      .order("desc")
      .collect();
    
    return Promise.all(
      images.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId!);
        const user = await ctx.db.get(image.userId);
        return {
          ...image,
          url,
          uploaderName: user?.name || user?.email || "Unknown",
        };
      })
    );
  },
});

export const getUserImages = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("media")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("type"), "image")
        )
      )
      .order("desc")
      .collect();
    
    return Promise.all(
      images.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId!);
        return {
          ...image,
          url,
        };
      })
    );
  },
});

export const deleteImage = mutation({
  args: { imageId: v.id("media") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    await ctx.db.delete(args.imageId);
    if (image.storageId) {
      await ctx.storage.delete(image.storageId);
    }
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

export const create = mutation({
  args: {
    userId: v.id("users"),
    url: v.string(),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("media", {
      userId: args.userId,
      url: args.url,
      type: args.type,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

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
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImage = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Failed to get file URL from storage");
    }

    const mediaId = await ctx.db.insert("media", {
      userId: args.userId,
      url,
      storageId: args.storageId,
      type: "image",
      description: args.description || args.filename,
      createdAt: Date.now(),
    });

    return { mediaId, url };
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
      storageId: args.storageId,
      type: args.fileType,
      description: args.description || args.fileName,
      createdAt: Date.now(),
    });

    return { mediaId, url };
  },
});

export const update = mutation({
  args: {
    id: v.id("media"),
    url: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    return await ctx.db.patch(id, filteredUpdates);
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

export const remove = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
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

// ==============================
// ADMIN FUNCTIONS
// ==============================

// Count all media
export const count = query({
  args: {},
  handler: async (ctx) => {
    const media = await ctx.db.query("media").collect();
    return media.length;
  },
});

// List all media for admin
export const adminList = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const media = await ctx.db.query("media").order("desc").collect();
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return media.slice(offset, offset + limit);
  },
});


// List all media with optional filtering
export const list = query({
  args: {
    userId: v.optional(v.id("users")),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    let q = ctx.db.query("media");

    if (args.userId) {
      q = q.filter((q) => q.eq(q.field("userId"), args.userId));
    }

    if (args.type) {
      q = q.filter((q) => q.eq(q.field("type"), args.type));
    }

    return await q.order("desc").take(limit);
  },
});

// ==============================
// UTILITY FUNCTIONS FOR SAFE MEDIA ACCESS
// ==============================

export const getMediaUrl = query({
  args: { 
    mediaId: v.optional(v.id("media")) 
  },
  handler: async (ctx, args) => {
    if (!args.mediaId) return null;
    
    const media = await ctx.db.get(args.mediaId);
    if (!media) return null;
    
    let storageId = media.storageId;
    
    // If no storageId but we have a URL, try to extract storageId from the URL
    if (!storageId && media.url && media.url.includes('/api/storage/')) {
      const urlParts = media.url.split('/api/storage/');
      if (urlParts.length > 1) {
        storageId = urlParts[1] as any;
      }
    }
    
    // If we have a storageId, generate HTTP action URL
    if (storageId) {
      const baseUrl = process.env.CONVEX_SITE_URL;
      if (baseUrl) {
        return `${baseUrl}/images?storageId=${storageId}`;
      }
    }
    
    // Fallback to stored URL for backward compatibility
    return media.url || null;
  },
});

export const getMediaWithFreshUrl = query({
  args: { 
    mediaId: v.id("media") 
  },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    if (!media) return null;
    
    let freshUrl = null;
    let storageId = media.storageId;
    
    // If no storageId but we have a URL, try to extract storageId from the URL
    if (!storageId && media.url && media.url.includes('/api/storage/')) {
      const urlParts = media.url.split('/api/storage/');
      if (urlParts.length > 1) {
        storageId = urlParts[1] as any;
      }
    }
    
    if (storageId) {
      const baseUrl = process.env.CONVEX_SITE_URL;
      if (baseUrl) {
        freshUrl = `${baseUrl}/images?storageId=${storageId}`;
      }
    }
    
    return {
      ...media,
      url: freshUrl || media.url, // Use HTTP action URL if available, otherwise fallback
    };
  },
});

export const getMultipleMedia = query({
  args: { 
    mediaIds: v.array(v.id("media")) 
  },
  handler: async (ctx, args) => {
    const mediaPromises = args.mediaIds.map(id => ctx.db.get(id));
    const mediaResults = await Promise.all(mediaPromises);
    
    // Generate HTTP action URLs for media with storageId
    const mediaWithFreshUrls = mediaResults.map((media) => {
      if (!media) return null;
      
      let storageId = media.storageId;
      
      // If no storageId but we have a URL, try to extract storageId from the URL
      if (!storageId && media.url && media.url.includes('/api/storage/')) {
        const urlParts = media.url.split('/api/storage/');
        if (urlParts.length > 1) {
          storageId = urlParts[1] as any;
        }
      }
      
      if (storageId) {
        const baseUrl = process.env.CONVEX_SITE_URL;
        if (baseUrl) {
          const freshUrl = `${baseUrl}/images?storageId=${storageId}`;
          return { ...media, url: freshUrl };
        }
      }
      
      return media;
    });
    
    // Return map of ID to media object for easy lookup
    const mediaMap: Record<string, any> = {};
    args.mediaIds.forEach((id, index) => {
      if (mediaWithFreshUrls[index]) {
        mediaMap[id] = mediaWithFreshUrls[index];
      }
    });
    
    return mediaMap;
  },
});

export const getMediaByIds = query({
  args: { 
    ids: v.array(v.id("media")) 
  },
  handler: async (ctx, args) => {
    if (args.ids.length === 0) return [];
    
    const mediaPromises = args.ids.map(id => ctx.db.get(id));
    const mediaResults = await Promise.all(mediaPromises);
    
    // Filter out null results and return valid media objects
    return mediaResults.filter(Boolean);
  },
});

export const getSafeMediaUrl = query({
  args: { 
    mediaId: v.optional(v.id("media")),
    fallbackUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!args.mediaId) return args.fallbackUrl || null;
    
    try {
      const media = await ctx.db.get(args.mediaId);
      return media?.url || args.fallbackUrl || null;
    } catch (error) {
      console.error("Error fetching media:", error);
      return args.fallbackUrl || null;
    }
  },
});

export const getByStorageId = query({
  args: { 
    storageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("media")
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first();
    
    return media;
  },
});

// Batch media fetcher with user profiles
export const getUsersWithMedia = query({
  args: { 
    userIds: v.array(v.id("users")) 
  },
  handler: async (ctx, args) => {
    const usersPromises = args.userIds.map(id => ctx.db.get(id));
    const users = await Promise.all(usersPromises);
    
    // Get all profile picture IDs
    const profilePictureIds = users
      .filter(Boolean)
      .map(user => user!.profilePicture)
      .filter(Boolean) as Id<"media">[];
    
    // Fetch all media in one batch
    const mediaPromises = profilePictureIds.map(id => ctx.db.get(id));
    const mediaResults = await Promise.all(mediaPromises);
    
    // Create media lookup map
    const mediaMap: Record<string, any> = {};
    profilePictureIds.forEach((id, index) => {
      if (mediaResults[index]) {
        mediaMap[id] = mediaResults[index];
      }
    });
    
    // Return users with populated media
    return users.map(user => {
      if (!user) return null;
      
      return {
        ...user,
        profilePictureMedia: user.profilePicture ? mediaMap[user.profilePicture] : null,
      };
    }).filter(Boolean);
  },
});

// ==============================
// MEDIA VALIDATION AND HELPERS
// ==============================

export const validateMediaAccess = query({
  args: { 
    mediaId: v.id("media"),
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    
    if (!media) {
      return { hasAccess: false, reason: "Media not found" };
    }
    
    // Check if user owns the media or if it's public
    if (media.userId === args.userId) {
      return { hasAccess: true, media };
    }
    
    // For now, allow access to all media (adjust based on your privacy requirements)
    return { hasAccess: true, media };
  },
});

export const getMediaWithValidation = query({
  args: { 
    mediaId: v.id("media"),
    requestingUserId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.mediaId);
    
    if (!media) return null;
    
    // If no requesting user, return basic info only
    if (!args.requestingUserId) {
      return {
        _id: media._id,
        url: media.url,
        type: media.type,
        description: media.description,
      };
    }
    
    // Return full media object if user has access
    return media;
  },
});