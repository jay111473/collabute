import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import type { Product, User } from "../types/convex";

// List all products with optional filtering
export const list = query({
  args: {
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    } else if (args.isActive !== undefined) {
      return await ctx.db
        .query("products")
        .withIndex("by_active", (q) => q.eq("isActive", args.isActive ?? true))
        .collect();
    }

    return await ctx.db.query("products").collect();
  },
});

// Get product by ID
export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create new product
export const create = mutation({
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

// Update product
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    return await ctx.db.patch(id, filteredUpdates);
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

// Delete product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Toggle product active status
export const toggleActive = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    return await ctx.db.patch(args.id, {
      isActive: !product.isActive,
    });
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

export const getProductsTeamLeads = query({
  args: { productId: v.id("products"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const teamLeadsIds = projects
      .map((project) => project.teamLeadId)
      .filter(Boolean);
    
    const uniqueTeamLeadsIds = [...new Set(teamLeadsIds)];
    
    const teamLeads = await Promise.all(
      uniqueTeamLeadsIds.map(async (id) => {
        if (!id) return null;
        const user = await ctx.db.get(id);
        return user;
      })
    );

    return teamLeads.filter(Boolean);
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

// Get products with their associated projects
export const getProductsWithProjects = query({
  args: {
    userId: v.optional(v.id("users")),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
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

    // Get projects for each product
    const productsWithProjects = await Promise.all(
      products.map(async (product) => {
        let projectsQuery = ctx.db
          .query("projects")
          .withIndex("by_product", (q) => q.eq("productId", product._id));

        // If userId is provided, filter by user's projects
        if (args.userId) {
          projectsQuery = projectsQuery.filter((q) => 
            q.eq(q.field("ownerId"), args.userId)
          );
        }

        const projects = await projectsQuery.collect();

        // Populate teamLead data for each project
        const projectsWithTeamLeads = await Promise.all(
          projects.map(async (project) => {
            if (project.teamLeadId) {
              const teamLead = await ctx.db.get(project.teamLeadId);
              return {
                ...project,
                teamLead,
              };
            }
            return {
              ...project,
              teamLead: null,
            };
          })
        );

        return {
          ...product,
          projects: projectsWithTeamLeads,
        };
      })
    );

    return productsWithProjects;
  },
});

// Count all products
export const count = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.length;
  },
});
