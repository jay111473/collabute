import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all transactions with optional filtering
export const list = query({
  args: {
    userId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("transactions");
    
    if (args.userId) {
      q = q.withIndex("by_user", (q) => q.eq("userId", args.userId));
    } else if (args.projectId) {
      q = q.withIndex("by_project", (q) => q.eq("projectId", args.projectId));
    } else if (args.status) {
      q = q.withIndex("by_status", (q) => q.eq("status", args.status));
    }
    
    return await q.collect();
  },
});

// Get transaction by ID
export const get = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get user transactions
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get project transactions
export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.query("transactions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// Create new transaction
export const create = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    type: v.string(),
    method: v.string(),
    status: v.string(),
    reference: v.optional(v.string()),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", args);
  },
});

// Update transaction
export const update = mutation({
  args: {
    id: v.id("transactions"),
    userId: v.optional(v.id("users")),
    amount: v.optional(v.number()),
    type: v.optional(v.string()),
    method: v.optional(v.string()),
    status: v.optional(v.string()),
    reference: v.optional(v.string()),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(id, filteredUpdates);
  },
});

// Delete transaction
export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Update transaction status
export const updateStatus = mutation({
  args: {
    id: v.id("transactions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});

// Get transaction stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await ctx.db.query("transactions").collect();
    
    const stats = transactions.reduce(
      (acc, transaction) => {
        acc.total += transaction.amount;
        acc.count += 1;
        
        if (transaction.status === "completed") {
          acc.completed += transaction.amount;
          acc.completedCount += 1;
        } else if (transaction.status === "pending") {
          acc.pending += transaction.amount;
          acc.pendingCount += 1;
        } else if (transaction.status === "failed") {
          acc.failed += transaction.amount;
          acc.failedCount += 1;
        }
        
        return acc;
      },
      {
        total: 0,
        count: 0,
        completed: 0,
        completedCount: 0,
        pending: 0,
        pendingCount: 0,
        failed: 0,
        failedCount: 0,
      }
    );
    
    return stats;
  },
});

// Count all transactions
export const count = query({
  args: {},
  handler: async (ctx) => {
    const transactions = await ctx.db.query("transactions").collect();
    return transactions.length;
  },
});