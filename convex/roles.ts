"use client";

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all roles
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("roles").collect();
  },
});

// Get role by ID
export const get = query({
  args: { id: v.id("roles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get role by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("roles")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Create new role
export const create = mutation({
  args: {
    name: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("roles", args);
  },
});

// Update role
export const update = mutation({
  args: {
    id: v.id("roles"),
    name: v.optional(v.string()),
    displayName: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    permissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(id, filteredUpdates);
  },
});

// Delete role
export const remove = mutation({
  args: { id: v.id("roles") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Toggle role active status
export const toggleActive = mutation({
  args: { id: v.id("roles") },
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.id);
    if (!role) throw new Error("Role not found");
    
    return await ctx.db.patch(args.id, {
      isActive: !role.isActive,
    });
  },
});