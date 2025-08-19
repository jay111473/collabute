import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Get sync state for a specific repository
export const getRepositorySyncState = query({
  args: { repositoryId: v.id("github_repositories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const repo = await ctx.db.get(args.repositoryId);
    if (!repo) {
      return null;
    }

    // Verify user owns this repository
    if (repo.ownerId !== userId) {
      throw new Error("Access denied");
    }

    // Get last sync operation
    const lastOperation = await ctx.db
      .query("github_sync_operations")
      .withIndex("by_repository", q => q.eq("repositoryId", args.repositoryId))
      .order("desc")
      .first();

    // Get failed operations count
    const failedOperations = await ctx.db
      .query("github_sync_operations")
      .withIndex("by_repository", q => q.eq("repositoryId", args.repositoryId))
      .filter(q => q.eq(q.field("status"), "failed"))
      .collect();

    // Check if sync is stale (older than 10 minutes)
    const isStale = Date.now() - repo.lastSyncedAt > 10 * 60 * 1000;

    return {
      repositoryId: args.repositoryId,
      lastSyncedAt: repo.lastSyncedAt,
      syncStatus: repo.syncStatus,
      lastOperation,
      failedOperationsCount: failedOperations.length,
      isStale,
      needsAttention: repo.syncStatus === "error" || failedOperations.length > 3,
    };
  },
});

// Get sync overview for all user repositories
export const getUserSyncOverview = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const repositories = await ctx.db
      .query("github_repositories")
      .withIndex("by_owner", q => q.eq("ownerId", userId))
      .collect();

    const syncStats = {
      totalRepositories: repositories.length,
      syncedRepositories: 0,
      pendingRepositories: 0,
      errorRepositories: 0,
      staleRepositories: 0,
    };

    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes

    for (const repo of repositories) {
      switch (repo.syncStatus) {
        case "synced":
          syncStats.syncedRepositories++;
          break;
        case "pending":
          syncStats.pendingRepositories++;
          break;
        case "error":
          syncStats.errorRepositories++;
          break;
      }

      if (now - repo.lastSyncedAt > staleThreshold) {
        syncStats.staleRepositories++;
      }
    }

    // Get recent operations
    const recentOperations = await ctx.db
      .query("github_sync_operations")
      .withIndex("by_timestamp")
      .order("desc")
      .take(10);

    // Filter operations for user's repositories
    const userRepoIds = new Set(repositories.map(r => r._id));
    const userOperations = recentOperations.filter(op => 
      op.repositoryId && userRepoIds.has(op.repositoryId)
    );

    return {
      stats: syncStats,
      repositories: repositories.map(repo => ({
        _id: repo._id,
        name: repo.name,
        fullName: repo.fullName,
        syncStatus: repo.syncStatus,
        lastSyncedAt: repo.lastSyncedAt,
        isStale: now - repo.lastSyncedAt > staleThreshold,
      })),
      recentOperations: userOperations,
    };
  },
});

// Get detailed sync status for a repository including issues and collaborators
export const getDetailedRepositorySync = query({
  args: { repositoryId: v.id("github_repositories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const repo = await ctx.db.get(args.repositoryId);
    if (!repo || repo.ownerId !== userId) {
      return null;
    }

    // Get issues sync status
    const issues = await ctx.db
      .query("github_issues")
      .withIndex("by_repository", q => q.eq("repositoryId", args.repositoryId))
      .collect();

    const issueStats = {
      total: issues.length,
      synced: issues.filter(i => i.syncStatus === "synced").length,
      pending: issues.filter(i => i.syncStatus === "pending").length,
      error: issues.filter(i => i.syncStatus === "error").length,
    };

    // Get collaborators sync status
    const collaborators = await ctx.db
      .query("github_collaborators")
      .withIndex("by_repository", q => q.eq("repositoryId", args.repositoryId))
      .collect();

    // Get sync operations for this repository
    const operations = await ctx.db
      .query("github_sync_operations")
      .withIndex("by_repository", q => q.eq("repositoryId", args.repositoryId))
      .order("desc")
      .take(20);

    return {
      repository: {
        _id: repo._id,
        name: repo.name,
        fullName: repo.fullName,
        syncStatus: repo.syncStatus,
        lastSyncedAt: repo.lastSyncedAt,
      },
      issues: {
        stats: issueStats,
        recent: issues
          .sort((a, b) => b.lastSyncedAt - a.lastSyncedAt)
          .slice(0, 5)
          .map(issue => ({
            _id: issue._id,
            title: issue.title,
            number: issue.number,
            state: issue.state,
            syncStatus: issue.syncStatus,
            lastSyncedAt: issue.lastSyncedAt,
          })),
      },
      collaborators: {
        total: collaborators.length,
        list: collaborators.map(collab => ({
          _id: collab._id,
          login: collab.login,
          role: collab.role,
          lastSyncedAt: collab.lastSyncedAt,
        })),
      },
      operations,
    };
  },
});

// Get repositories that need syncing (for background jobs)
export const getRepositoriesNeedingSync = query({
  args: { 
    limit: v.optional(v.number()),
    maxAge: v.optional(v.number()) // Max age in milliseconds
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const maxAge = args.maxAge ?? 10 * 60 * 1000; // 10 minutes default
    const cutoffTime = Date.now() - maxAge;

    // Get repositories that are stale or have errors
    const staleRepos = await ctx.db
      .query("github_repositories")
      .withIndex("by_sync_status")
      .filter(q => 
        q.or(
          q.eq(q.field("syncStatus"), "error"),
          q.eq(q.field("syncStatus"), "pending"),
          q.and(
            q.eq(q.field("syncStatus"), "synced"),
            q.lt(q.field("lastSyncedAt"), cutoffTime)
          )
        )
      )
      .take(limit);

    return staleRepos.map(repo => ({
      _id: repo._id,
      githubId: repo.githubId,
      fullName: repo.fullName,
      githubInstallationId: repo.githubInstallationId,
      syncStatus: repo.syncStatus,
      lastSyncedAt: repo.lastSyncedAt,
      ownerId: repo.ownerId,
    }));
  },
});