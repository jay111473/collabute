import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { GithubRepository } from "../types/convex";

// List all GitHub repositories
export const list = query({
  args: {
    ownerId: v.optional(v.id("users")),
    projectId: v.optional(v.id("projects")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.ownerId) {
      const repositories = await ctx.db
        .query("github_repositories")
        .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId!))
        .collect();

      if (args.isActive !== undefined) {
        return repositories.filter((repo) => repo.isActive === args.isActive);
      }

      return repositories;
    } else if (args.projectId) {
      const repositories = await ctx.db
        .query("github_repositories")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();

      if (args.isActive !== undefined) {
        return repositories.filter((repo) => repo.isActive === args.isActive);
      }

      return repositories;
    }

    const repositories = await ctx.db.query("github_repositories").collect();

    if (args.isActive !== undefined) {
      return repositories.filter((repo) => repo.isActive === args.isActive);
    }

    return repositories;
  },
});

// Get repository by ID
export const get = query({
  args: { id: v.id("github_repositories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get repository by GitHub ID
export const getByGithubId = query({
  args: { githubId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("github_repositories")
      .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
      .first();
  },
});

// Get repository by full name
export const getByFullName = query({
  args: { fullName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("github_repositories")
      .withIndex("by_full_name", (q) => q.eq("fullName", args.fullName))
      .first();
  },
});

// Get repositories by owner
export const getByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("github_repositories")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

// Create new repository
export const create = mutation({
  args: {
    githubId: v.number(),
    name: v.string(),
    fullName: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    private: v.boolean(),
    htmlUrl: v.string(),
    cloneUrl: v.string(),
    language: v.optional(v.string()),
    stargazersCount: v.number(),
    forksCount: v.number(),
    openIssuesCount: v.number(),
    defaultBranch: v.string(),
    githubCreatedAt: v.string(),
    githubUpdatedAt: v.string(),
    githubInstallationId: v.string(),
    syncStatus: v.union(v.literal("synced"), v.literal("pending"), v.literal("error")),
    isActive: v.boolean(),
    lastSyncedAt: v.number(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("github_repositories", args);
  },
});

// Update repository
export const update = mutation({
  args: {
    id: v.id("github_repositories"),
    githubId: v.optional(v.number()),
    name: v.optional(v.string()),
    fullName: v.optional(v.string()),
    description: v.optional(v.string()),
    ownerId: v.optional(v.id("users")),
    private: v.optional(v.boolean()),
    htmlUrl: v.optional(v.string()),
    cloneUrl: v.optional(v.string()),
    language: v.optional(v.string()),
    stargazersCount: v.optional(v.number()),
    forksCount: v.optional(v.number()),
    defaultBranch: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    lastSyncedAt: v.optional(v.number()),
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

// Delete repository
export const remove = mutation({
  args: { id: v.id("github_repositories") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Toggle repository active status
export const toggleActive = mutation({
  args: { id: v.id("github_repositories") },
  handler: async (ctx, args) => {
    const repo = await ctx.db.get(args.id);
    if (!repo) throw new Error("Repository not found");

    return await ctx.db.patch(args.id, {
      isActive: !repo.isActive,
    });
  },
});

// Update sync timestamp
export const updateSyncTime = mutation({
  args: { id: v.id("github_repositories") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      lastSyncedAt: Date.now(),
    });
  },
});

// Link repository to project
export const linkToProject = mutation({
  args: {
    id: v.id("github_repositories"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      projectId: args.projectId,
    });
  },
});

// Unlink repository from project
export const unlinkFromProject = mutation({
  args: { id: v.id("github_repositories") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      projectId: undefined,
    });
  },
});

// Count all repositories
export const count = query({
  args: {},
  handler: async (ctx) => {
    const repositories = await ctx.db.query("github_repositories").collect();
    return repositories.length;
  },
});
