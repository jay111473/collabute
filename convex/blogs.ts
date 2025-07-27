import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBlogBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const blog = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("status"), "published"))
      .first();

    if (!blog) {
      return null;
    }

    // Get related data
    const [category, tags, profilePicture, thumbnail, author] = await Promise.all([
      blog.category ? ctx.db.get(blog.category) : null,
      blog.tags ? Promise.all(blog.tags.map(tagId => ctx.db.get(tagId))) : [],
      blog.profilePicture ? ctx.db.get(blog.profilePicture) : null,
      blog.thumbnail ? ctx.db.get(blog.thumbnail) : null,
      blog.authorId ? ctx.db.get(blog.authorId) : null,
    ]);

    // Get meta image if exists
    const metaImage = blog.meta?.image ? await ctx.db.get(blog.meta.image) : null;

    return {
      ...blog,
      category,
      tags: tags.filter(Boolean),
      profilePicture,
      thumbnail,
      author,
      meta: blog.meta ? {
        ...blog.meta,
        image: metaImage,
      } : undefined,
    };
  },
});

export const getBlogs = query({
  args: {},
  handler: async (ctx) => {
    const blogs = await ctx.db
      .query("blogs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    // Get related data for all blogs
    const blogsWithRelatedData = await Promise.all(
      blogs.map(async (blog) => {
        const [category, tags, profilePicture, thumbnail, author] = await Promise.all([
          blog.category ? ctx.db.get(blog.category) : null,
          blog.tags ? Promise.all(blog.tags.map(tagId => ctx.db.get(tagId))) : [],
          blog.profilePicture ? ctx.db.get(blog.profilePicture) : null,
          blog.thumbnail ? ctx.db.get(blog.thumbnail) : null,
          blog.authorId ? ctx.db.get(blog.authorId) : null,
        ]);

        return {
          ...blog,
          category,
          tags: tags.filter(Boolean),
          profilePicture,
          thumbnail,
          author,
        };
      })
    );

    return blogsWithRelatedData;
  },
});

export const getBlogsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const blogs = await ctx.db
      .query("blogs")
      .withIndex("by_category", (q) => q.eq("category", args.categoryId))
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc")
      .collect();

    // Get related data for all blogs
    const blogsWithRelatedData = await Promise.all(
      blogs.map(async (blog) => {
        const [category, tags, profilePicture, thumbnail, author] = await Promise.all([
          blog.category ? ctx.db.get(blog.category) : null,
          blog.tags ? Promise.all(blog.tags.map(tagId => ctx.db.get(tagId))) : [],
          blog.profilePicture ? ctx.db.get(blog.profilePicture) : null,
          blog.thumbnail ? ctx.db.get(blog.thumbnail) : null,
          blog.authorId ? ctx.db.get(blog.authorId) : null,
        ]);

        return {
          ...blog,
          category,
          tags: tags.filter(Boolean),
          profilePicture,
          thumbnail,
          author,
        };
      })
    );

    return blogsWithRelatedData;
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
  },
});

export const getTags = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tags").order("asc").collect();
  },
});

export const getBlogsByTag = query({
  args: { tagId: v.id("tags") },
  handler: async (ctx, args) => {
    const blogs = await ctx.db
      .query("blogs")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "published"),
          q.neq(q.field("tags"), undefined)
        )
      )
      .order("desc")
      .collect();

    // Filter blogs that contain the specified tag
    const filteredBlogs = blogs.filter(blog => 
      blog.tags && blog.tags.includes(args.tagId)
    );

    // Get related data for filtered blogs
    const blogsWithRelatedData = await Promise.all(
      filteredBlogs.map(async (blog) => {
        const [category, tags, profilePicture, thumbnail, author] = await Promise.all([
          blog.category ? ctx.db.get(blog.category) : null,
          blog.tags ? Promise.all(blog.tags.map(tagId => ctx.db.get(tagId))) : [],
          blog.profilePicture ? ctx.db.get(blog.profilePicture) : null,
          blog.thumbnail ? ctx.db.get(blog.thumbnail) : null,
          blog.authorId ? ctx.db.get(blog.authorId) : null,
        ]);

        return {
          ...blog,
          category,
          tags: tags.filter(Boolean),
          profilePicture,
          thumbnail,
          author,
        };
      })
    );

    return blogsWithRelatedData;
  },
});

export const getBlogsWithPagination = query({
  args: { 
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    tagId: v.optional(v.id("tags"))
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const offset = args.offset || 0;
    
    let query = ctx.db
      .query("blogs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc");

    // Apply category filter if provided
    if (args.categoryId) {
      query = ctx.db
        .query("blogs")
        .withIndex("by_category", (q) => q.eq("category", args.categoryId))
        .filter((q) => q.eq(q.field("status"), "published"))
        .order("desc");
    }

    const allBlogs = await query.collect();
    
    // Apply tag filter if provided
    let filteredBlogs = allBlogs;
    if (args.tagId) {
      filteredBlogs = allBlogs.filter(blog => 
        blog.tags && blog.tags.includes(args.tagId)
      );
    }

    // Apply pagination
    const paginatedBlogs = filteredBlogs.slice(offset, offset + limit);

    // Get related data for paginated blogs
    const blogsWithRelatedData = await Promise.all(
      paginatedBlogs.map(async (blog) => {
        const [category, tags, profilePicture, thumbnail, author] = await Promise.all([
          blog.category ? ctx.db.get(blog.category) : null,
          blog.tags ? Promise.all(blog.tags.map(tagId => ctx.db.get(tagId))) : [],
          blog.profilePicture ? ctx.db.get(blog.profilePicture) : null,
          blog.thumbnail ? ctx.db.get(blog.thumbnail) : null,
          blog.authorId ? ctx.db.get(blog.authorId) : null,
        ]);

        return {
          ...blog,
          category,
          tags: tags.filter(Boolean),
          profilePicture,
          thumbnail,
          author,
        };
      })
    );

    return {
      blogs: blogsWithRelatedData,
      total: filteredBlogs.length,
      hasMore: offset + limit < filteredBlogs.length
    };
  },
});

export const getFeaturedBlogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;
    
    // Get most recent published blogs as featured
    const blogs = await ctx.db
      .query("blogs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit);

    // Get related data for featured blogs
    const blogsWithRelatedData = await Promise.all(
      blogs.map(async (blog) => {
        const [category, tags, profilePicture, thumbnail, author] = await Promise.all([
          blog.category ? ctx.db.get(blog.category) : null,
          blog.tags ? Promise.all(blog.tags.map(tagId => ctx.db.get(tagId))) : [],
          blog.profilePicture ? ctx.db.get(blog.profilePicture) : null,
          blog.thumbnail ? ctx.db.get(blog.thumbnail) : null,
          blog.authorId ? ctx.db.get(blog.authorId) : null,
        ]);

        return {
          ...blog,
          category,
          tags: tags.filter(Boolean),
          profilePicture,
          thumbnail,
          author,
        };
      })
    );

    return blogsWithRelatedData;
  },
});