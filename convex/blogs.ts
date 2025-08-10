import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { BlogStatusValidator } from "./schema";

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
    const [category, tags, profilePicture, thumbnail, author] =
      await Promise.all([
        blog.category ? ctx.db.get(blog.category) : null,
        blog.tags
          ? Promise.all(blog.tags.map((tagId) => ctx.db.get(tagId)))
          : [],
        blog.profilePicture ? ctx.db.get(blog.profilePicture) : null,
        blog.thumbnail ? ctx.db.get(blog.thumbnail) : null,
        blog.authorId ? ctx.db.get(blog.authorId) : null,
      ]);

    // Get meta image if exists
    const metaImage = blog.meta?.image
      ? await ctx.db.get(blog.meta.image)
      : null;

    return {
      ...blog,
      category,
      tags: tags.filter(Boolean),
      profilePicture,
      thumbnail,
      author,
      meta: blog.meta
        ? {
            ...blog.meta,
            image: metaImage,
          }
        : undefined,
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
        const [category, tags, profilePicture, thumbnail, author] =
          await Promise.all([
            blog.category ? ctx.db.get(blog.category) : null,
            blog.tags
              ? Promise.all(blog.tags.map((tagId) => ctx.db.get(tagId)))
              : [],
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
        const [category, tags, profilePicture, thumbnail, author] =
          await Promise.all([
            blog.category ? ctx.db.get(blog.category) : null,
            blog.tags
              ? Promise.all(blog.tags.map((tagId) => ctx.db.get(tagId)))
              : [],
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
    const filteredBlogs = blogs.filter(
      (blog) => blog.tags && blog.tags.includes(args.tagId)
    );

    // Get related data for filtered blogs
    const blogsWithRelatedData = await Promise.all(
      filteredBlogs.map(async (blog) => {
        const [category, tags, profilePicture, thumbnail, author] =
          await Promise.all([
            blog.category ? ctx.db.get(blog.category) : null,
            blog.tags
              ? Promise.all(blog.tags.map((tagId) => ctx.db.get(tagId)))
              : [],
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
    tagId: v.optional(v.id("tags")),
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
      filteredBlogs = allBlogs.filter(
        (blog) => blog.tags && blog.tags.includes(args.tagId as Id<"tags">)
      );
    }

    // Apply pagination
    const paginatedBlogs = filteredBlogs.slice(offset, offset + limit);

    // Get related data for paginated blogs
    const blogsWithRelatedData = await Promise.all(
      paginatedBlogs.map(async (blog) => {
        const [category, tags, profilePicture, thumbnail, author] =
          await Promise.all([
            blog.category ? ctx.db.get(blog.category) : null,
            blog.tags
              ? Promise.all(blog.tags.map((tagId) => ctx.db.get(tagId)))
              : [],
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
      hasMore: offset + limit < filteredBlogs.length,
    };
  },
});

// Admin-specific queries and mutations
export const listAllBlogs = query({
  args: {},
  handler: async (ctx) => {
    const blogs = await ctx.db.query("blogs").order("desc").collect();

    const blogsWithRelatedData = await Promise.all(
      blogs.map(async (blog) => {
        const [category, tags, profilePicture, thumbnail, author] =
          await Promise.all([
            blog.category ? ctx.db.get(blog.category) : null,
            blog.tags
              ? Promise.all(blog.tags.map((tagId) => ctx.db.get(tagId)))
              : [],
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

export const createBlog = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    profilePicture: v.optional(v.id("media")),
    thumbnail: v.optional(v.id("media")),
    category: v.optional(v.id("categories")),
    tags: v.optional(v.array(v.id("tags"))),
    content: v.optional(v.any()), // Tiptap JSON content
    status: v.optional(BlogStatusValidator),
    authorId: v.optional(v.id("users")),
    meta: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        image: v.optional(v.id("media")),
      })
    ),
    faq: v.optional(
      v.array(
        v.object({
          id: v.optional(v.string()),
          question: v.optional(v.string()),
          answer: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    console.log("Creating blog with args:", {
      title: args.title,
      slug: args.slug,
      hasContent: !!args.content,
      contentType: typeof args.content,
      contentKeys: args.content ? Object.keys(args.content) : [],
    });

    try {
      const now = Date.now();

      // Validate content structure if present
      if (args.content) {
        try {
          // Test if content can be serialized/deserialized
          const contentTest = JSON.stringify(args.content);
          const parsed = JSON.parse(contentTest);

          // Basic TipTap structure validation
          if (parsed && typeof parsed === "object") {
            // Check for basic TipTap document structure
            if (!parsed.type || (parsed.type !== "doc" && !parsed.content)) {
              console.warn("Content may not be valid TipTap format:", parsed);
            }
          }

          console.log("Content validation passed for blog:", args.title);
        } catch (contentError) {
          console.error("Content validation failed:", contentError);
          console.error("Failed content:", args.content);
          throw new Error(`Invalid content structure: ${contentError}`);
        }
      }

      const blogData = {
        title: args.title,
        slug: args.slug,
        description: args.description,
        profilePicture: args.profilePicture,
        thumbnail: args.thumbnail,
        category: args.category,
        tags: args.tags,
        content: args.content,
        status: args.status || "draft",
        publishedAt: args.status === "published" ? now : undefined,
        updatedAt: now,
        authorId: args.authorId,
        meta: args.meta,
        faq: args.faq,
      };

      console.log("Inserting blog data:", {
        title: blogData.title,
        slug: blogData.slug,
        hasContent: !!blogData.content,
        status: blogData.status,
      });

      const blogId = await ctx.db.insert("blogs", blogData);

      console.log("Blog created successfully with ID:", blogId);
      return blogId;
    } catch (error) {
      console.error("Error creating blog:", error);
      console.error("Args that caused error:", args);
      throw new Error(`Failed to create blog: ${error}`);
    }
  },
});

export const updateBlog = mutation({
  args: {
    id: v.id("blogs"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    profilePicture: v.optional(v.id("media")),
    thumbnail: v.optional(v.id("media")),
    category: v.optional(v.id("categories")),
    tags: v.optional(v.array(v.id("tags"))),
    content: v.optional(v.any()), // Tiptap JSON content
    status: v.optional(BlogStatusValidator),
    authorId: v.optional(v.id("users")),
    meta: v.optional(
      v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        image: v.optional(v.id("media")),
      })
    ),
    faq: v.optional(
      v.array(
        v.object({
          id: v.optional(v.string()),
          question: v.optional(v.string()),
          answer: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    console.log("Updating blog with args:", {
      id: args.id,
      hasContent: !!args.content,
      contentType: typeof args.content,
      updateFields: Object.keys(args).filter((key) => key !== "id"),
    });

    try {
      const { id, ...updates } = args;
      const now = Date.now();

      const existingBlog = await ctx.db.get(id);
      if (!existingBlog) {
        throw new Error("Blog not found");
      }

      // Validate content structure if present
      if (updates.content) {
        try {
          // Test if content can be serialized/deserialized
          const contentTest = JSON.stringify(updates.content);
          const parsed = JSON.parse(contentTest);

          // Basic TipTap structure validation
          if (parsed && typeof parsed === "object") {
            // Check for basic TipTap document structure
            if (!parsed.type || (parsed.type !== "doc" && !parsed.content)) {
              console.warn("Content may not be valid TipTap format:", parsed);
            }
          }

          console.log("Content validation passed for blog update:", id);
        } catch (contentError) {
          console.error("Content validation failed:", contentError);
          console.error("Failed content:", updates.content);
          throw new Error(`Invalid content structure: ${contentError}`);
        }
      }

      const updatedFields: any = {
        ...updates,
        updatedAt: now,
      };

      // Set publishedAt when status changes to published
      if (
        updates.status === "published" &&
        existingBlog.status !== "published"
      ) {
        updatedFields.publishedAt = now;
      }

      console.log("Patching blog with fields:", {
        id,
        hasContent: !!updatedFields.content,
        status: updatedFields.status,
      });

      await ctx.db.patch(id, updatedFields);

      console.log("Blog updated successfully:", id);
      return id;
    } catch (error) {
      console.error("Error updating blog:", error);
      console.error("Args that caused error:", args);
      throw new Error(`Failed to update blog: ${error}`);
    }
  },
});

export const deleteBlog = mutation({
  args: { id: v.id("blogs") },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.id);
    if (!blog) {
      throw new Error("Blog not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getBlogById = query({
  args: { id: v.id("blogs") },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.id);
    if (!blog) {
      return null;
    }

    const [category, tags, profilePicture, thumbnail, author] =
      await Promise.all([
        blog.category ? ctx.db.get(blog.category) : null,
        blog.tags
          ? Promise.all(blog.tags.map((tagId) => ctx.db.get(tagId)))
          : [],
        blog.profilePicture ? ctx.db.get(blog.profilePicture) : null,
        blog.thumbnail ? ctx.db.get(blog.thumbnail) : null,
        blog.authorId ? ctx.db.get(blog.authorId) : null,
      ]);

    const metaImage = blog.meta?.image
      ? await ctx.db.get(blog.meta.image)
      : null;

    return {
      ...blog,
      category,
      tags: tags.filter(Boolean),
      profilePicture,
      thumbnail,
      author,
      meta: blog.meta
        ? {
            ...blog.meta,
            image: metaImage,
          }
        : undefined,
    };
  },
});

// Category management
export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", args);
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Tag management
export const createTag = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tags", args);
  },
});

export const updateTag = mutation({
  args: {
    id: v.id("tags"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteTag = mutation({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
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
        const [category, tags, profilePicture, thumbnail, author] =
          await Promise.all([
            blog.category ? ctx.db.get(blog.category) : null,
            blog.tags
              ? Promise.all(blog.tags.map((tagId) => ctx.db.get(tagId)))
              : [],
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
