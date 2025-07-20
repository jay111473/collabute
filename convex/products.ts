import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      name: args.name,
      description: args.description,
      category: args.category,
      price: args.price,
      isActive: args.isActive ?? true,
    });
  },
});

export const getProducts = query({
  args: {
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let products;

    if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    } else if (args.isActive !== undefined) {
      products = await ctx.db
        .query("products")
        .withIndex("by_active", (q) => q.eq("isActive", args.isActive!))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }

    let filteredProducts = products;

    // Apply additional filters if not using indexes
    if (args.isActive !== undefined && !args.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.isActive === args.isActive
      );
    }
    if (args.category && args.isActive !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.isActive === args.isActive
      );
    }

    // Calculate pagination
    const page = args.page || 1;
    const limit = args.limit || 10;
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(filteredProducts.length / limit);
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return {
      products: paginatedProducts,
      totalPages,
      currentPage: page,
      totalProducts: filteredProducts.length,
      hasMore: page < totalPages,
    };
  },
});

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      price: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, args.updates);
    return true;
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
    return true;
  },
});

export const getProductsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(args.limit || 20);
  },
});

export const getActiveProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .take(args.limit || 20);
  },
});
