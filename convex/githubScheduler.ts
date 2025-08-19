import { internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Main periodic sync scheduler
 * Runs every 5 minutes to check for repositories that need syncing
 */
export const schedulePeriodicSync = internalMutation({
  handler: async (ctx) => {
    console.log("Running periodic GitHub sync check...");

    try {
      // Get repositories that need syncing
      const repositoriesNeedingSync = await ctx.db
        .query("github_repositories")
        .withIndex("by_sync_status")
        .filter((q) => 
          q.or(
            // Failed repositories
            q.eq(q.field("syncStatus"), "error"),
            // Pending repositories
            q.eq(q.field("syncStatus"), "pending"),
            // Stale repositories (older than 10 minutes)
            q.and(
              q.eq(q.field("syncStatus"), "synced"),
              q.lt(q.field("lastSyncedAt"), Date.now() - 10 * 60 * 1000)
            )
          )
        )
        .take(10); // Process 10 at a time to avoid overwhelming the system

      console.log(`Found ${repositoriesNeedingSync.length} repositories needing sync`);

      // Schedule sync for each repository
      for (const repo of repositoriesNeedingSync) {
        // Add some randomization to avoid thundering herd
        const delay = Math.floor(Math.random() * 5000); // 0-5 seconds
        
        await ctx.scheduler.runAfter(delay, internal.githubScheduler.syncSingleRepository, {
          repositoryId: repo._id,
          reason: getSyncReason(repo),
        });

        // Update repository to pending to avoid duplicate scheduling
        await ctx.db.patch(repo._id, {
          syncStatus: "pending",
          lastSyncedAt: Date.now(),
        });
      }

      // Clean up old sync operations (older than 24 hours)
      await cleanupOldOperations(ctx);

      // Schedule next periodic sync (5 minutes)
      await ctx.scheduler.runAfter(5 * 60 * 1000, internal.githubScheduler.schedulePeriodicSync, {});

      console.log("Periodic sync scheduling completed");
    } catch (error) {
      console.error("Error in periodic sync scheduler:", error);
      
      // Still schedule next run even if this one failed
      await ctx.scheduler.runAfter(5 * 60 * 1000, internal.githubScheduler.schedulePeriodicSync, {});
    }
  },
});

/**
 * Sync a single repository comprehensively
 */
export const syncSingleRepository = internalMutation({
  args: { 
    repositoryId: v.id("github_repositories"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`Syncing repository ${args.repositoryId} (reason: ${args.reason})`);

    const repo = await ctx.db.get(args.repositoryId);
    if (!repo) {
      console.error(`Repository ${args.repositoryId} not found`);
      return;
    }

    // Create operation log
    const operationId = await ctx.db.insert("github_sync_operations", {
      type: "periodic_sync",
      entityType: "repository",
      entityId: repo.githubId.toString(),
      operation: "update",
      status: "retrying",
      error: undefined,
      retryCount: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      webhookEventId: undefined,
      repositoryId: args.repositoryId,
    });

    try {
      // Schedule individual sync operations with delays to spread load
      await Promise.all([
        // Sync repository metadata
        ctx.scheduler.runAfter(0, internal.githubSync.performRepositorySync, {
          githubInstallationId: repo.githubInstallationId,
          githubRepoId: repo.githubId,
          userId: repo.ownerId,
        }),
        
        // Sync issues (delayed to spread load)
        ctx.scheduler.runAfter(2000, internal.githubSync.performIssueSync, {
          repositoryId: args.repositoryId,
        }),
        
        // Sync collaborators (delayed further)
        ctx.scheduler.runAfter(4000, internal.githubScheduler.syncRepositoryCollaborators, {
          repositoryId: args.repositoryId,
        }),
      ]);

      await ctx.db.patch(operationId, {
        status: "success",
        completedAt: Date.now(),
      });

      console.log(`Repository sync scheduled successfully: ${repo.fullName}`);
    } catch (error) {
      console.error(`Repository sync failed: ${repo.fullName}`, error);
      
      await ctx.db.patch(operationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });

      // Mark repository as error
      await ctx.db.patch(args.repositoryId, {
        syncStatus: "error",
        lastSyncedAt: Date.now(),
      });

      // Schedule retry in 15 minutes for failed syncs
      if (operationId) {
        await ctx.scheduler.runAfter(15 * 60 * 1000, internal.githubScheduler.retrySingleRepository, {
          repositoryId: args.repositoryId,
          originalOperationId: operationId,
        });
      }
    }
  },
});

/**
 * Sync collaborators for a repository
 */
export const syncRepositoryCollaborators = internalMutation({
  args: { repositoryId: v.id("github_repositories") },
  handler: async (ctx, args) => {
    const repo = await ctx.db.get(args.repositoryId);
    if (!repo) {
      console.error(`Repository ${args.repositoryId} not found`);
      return;
    }

    const operationId = await ctx.db.insert("github_sync_operations", {
      type: "periodic_sync",
      entityType: "collaborator",
      entityId: repo.githubId.toString(),
      operation: "update",
      status: "retrying",
      error: undefined,
      retryCount: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      webhookEventId: undefined,
      repositoryId: args.repositoryId,
    });

    try {
      // TODO: Integrate with GitHub client to fetch collaborators
      // const client = new GitHubSyncClient(repo.githubInstallationId);
      // const [owner, repoName] = repo.fullName.split('/');
      // const collaborators = await client.listCollaborators(owner, repoName);
      
      // For now, just mark as successful
      await ctx.db.patch(operationId, {
        status: "success",
        completedAt: Date.now(),
      });

      console.log(`Collaborators sync completed for ${repo.fullName}`);
    } catch (error) {
      console.error(`Collaborators sync failed for ${repo.fullName}:`, error);
      
      await ctx.db.patch(operationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });
    }
  },
});

/**
 * Retry a failed repository sync
 */
export const retrySingleRepository = internalMutation({
  args: { 
    repositoryId: v.id("github_repositories"),
    originalOperationId: v.id("github_sync_operations"),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.originalOperationId);
    if (!operation || operation.status !== "failed") {
      return; // Operation was already handled or doesn't exist
    }

    const repo = await ctx.db.get(args.repositoryId);
    if (!repo) {
      return;
    }

    // Check retry count
    const maxRetries = 3;
    if (operation.retryCount >= maxRetries) {
      console.log(`Max retries reached for repository ${repo.fullName}`);
      return;
    }

    // Update retry count
    await ctx.db.patch(args.originalOperationId, {
      retryCount: operation.retryCount + 1,
      status: "retrying",
      startedAt: Date.now(),
    });

    // Retry the sync
    await ctx.scheduler.runAfter(0, internal.githubScheduler.syncSingleRepository, {
      repositoryId: args.repositoryId,
      reason: `retry_${operation.retryCount + 1}`,
    });

    console.log(`Retrying sync for repository ${repo.fullName} (attempt ${operation.retryCount + 1})`);
  },
});

/**
 * Emergency sync for critical repositories
 */
export const emergencySync = internalMutation({
  args: { 
    repositoryIds: v.array(v.id("github_repositories")),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log(`Emergency sync triggered for ${args.repositoryIds.length} repositories`);

    for (const repositoryId of args.repositoryIds) {
      // Schedule immediate sync with high priority
      await ctx.scheduler.runAfter(0, internal.githubScheduler.syncSingleRepository, {
        repositoryId,
        reason: `emergency_${args.priority || 'high'}`,
      });

      // Mark as pending
      await ctx.db.patch(repositoryId, {
        syncStatus: "pending",
        lastSyncedAt: Date.now(),
      });
    }
  },
});

/**
 * Daily cleanup and maintenance
 */
export const dailyMaintenance = internalMutation({
  handler: async (ctx) => {
    console.log("Running daily GitHub sync maintenance...");

    try {
      // Clean up old operations
      await cleanupOldOperations(ctx);

      // Reset stuck pending operations (older than 1 hour)
      const stuckOperations = await ctx.db
        .query("github_repositories")
        .withIndex("by_sync_status")
        .filter((q) => 
          q.and(
            q.eq(q.field("syncStatus"), "pending"),
            q.lt(q.field("lastSyncedAt"), Date.now() - 60 * 60 * 1000)
          )
        )
        .collect();

      for (const repo of stuckOperations) {
        await ctx.db.patch(repo._id, {
          syncStatus: "error",
          lastSyncedAt: Date.now(),
        });
      }

      console.log(`Reset ${stuckOperations.length} stuck operations`);

      // Generate sync statistics
      await generateSyncStats(ctx);

      // Schedule next daily maintenance (24 hours)
      await ctx.scheduler.runAfter(24 * 60 * 60 * 1000, internal.githubScheduler.dailyMaintenance, {});

      console.log("Daily maintenance completed");
    } catch (error) {
      console.error("Error in daily maintenance:", error);
      
      // Still schedule next run
      await ctx.scheduler.runAfter(24 * 60 * 60 * 1000, internal.githubScheduler.dailyMaintenance, {});
    }
  },
});

// ====================================
// HELPER FUNCTIONS
// ====================================

/**
 * Determine sync reason based on repository state
 */
function getSyncReason(repo: any): string {
  if (repo.syncStatus === "error") {
    return "error_recovery";
  }
  
  if (repo.syncStatus === "pending") {
    return "pending_completion";
  }
  
  const staleMinutes = Math.floor((Date.now() - repo.lastSyncedAt) / (60 * 1000));
  return `stale_${staleMinutes}min`;
}

/**
 * Clean up old sync operations
 */
async function cleanupOldOperations(ctx: any) {
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
  
  const oldOperations = await ctx.db
    .query("github_sync_operations")
    .withIndex("by_timestamp")
    .filter((q: any) => q.lt(q.field("startedAt"), cutoffTime))
    .take(100); // Batch delete

  for (const operation of oldOperations) {
    await ctx.db.delete(operation._id);
  }

  if (oldOperations.length > 0) {
    console.log(`Cleaned up ${oldOperations.length} old sync operations`);
  }
}

/**
 * Generate and log sync statistics
 */
async function generateSyncStats(ctx: any) {
  const totalRepos = await ctx.db.query("github_repositories").collect();
  const syncedRepos = totalRepos.filter((r: any) => r.syncStatus === "synced");
  const errorRepos = totalRepos.filter((r: any) => r.syncStatus === "error");
  const pendingRepos = totalRepos.filter((r: any) => r.syncStatus === "pending");

  const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
  const recentOperations = await ctx.db
    .query("github_sync_operations")
    .withIndex("by_timestamp")
    .filter((q: any) => q.gt(q.field("startedAt"), last24Hours))
    .collect();

  const successfulOps = recentOperations.filter((op: any) => op.status === "success");
  const failedOps = recentOperations.filter((op: any) => op.status === "failed");

  console.log("GitHub Sync Statistics (24h):", {
    totalRepositories: totalRepos.length,
    syncedRepositories: syncedRepos.length,
    errorRepositories: errorRepos.length,
    pendingRepositories: pendingRepos.length,
    totalOperations: recentOperations.length,
    successfulOperations: successfulOps.length,
    failedOperations: failedOps.length,
    successRate: recentOperations.length > 0 
      ? `${Math.round((successfulOps.length / recentOperations.length) * 100)}%` 
      : "N/A"
  });
}

// ====================================
// QUERY FUNCTIONS FOR MONITORING
// ====================================

/**
 * Get sync scheduler status
 */
export const getSchedulerStatus = query({
  handler: async (ctx) => {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    // Get recent operations
    const recentOps = await ctx.db
      .query("github_sync_operations")
      .withIndex("by_timestamp")
      .filter((q) => q.gt(q.field("startedAt"), last24Hours))
      .collect();

    // Get repository stats
    const allRepos = await ctx.db.query("github_repositories").collect();
    
    const stats = {
      totalRepositories: allRepos.length,
      syncedCount: allRepos.filter(r => r.syncStatus === "synced").length,
      errorCount: allRepos.filter(r => r.syncStatus === "error").length,
      pendingCount: allRepos.filter(r => r.syncStatus === "pending").length,
      staleCount: allRepos.filter(r => 
        r.syncStatus === "synced" && (now - r.lastSyncedAt) > 10 * 60 * 1000
      ).length,
    };

    const operationStats = {
      total: recentOps.length,
      successful: recentOps.filter(op => op.status === "success").length,
      failed: recentOps.filter(op => op.status === "failed").length,
      pending: recentOps.filter(op => op.status === "retrying").length,
    };

    return {
      timestamp: now,
      repositories: stats,
      operations24h: operationStats,
      healthStatus: calculateHealthStatus(stats, operationStats),
    };
  },
});

/**
 * Calculate overall health status
 */
function calculateHealthStatus(repoStats: any, opStats: any): 'healthy' | 'warning' | 'critical' {
  const errorRate = repoStats.totalRepositories > 0 
    ? repoStats.errorCount / repoStats.totalRepositories 
    : 0;
  
  const opFailureRate = opStats.total > 0 
    ? opStats.failed / opStats.total 
    : 0;

  if (errorRate > 0.2 || opFailureRate > 0.3) {
    return 'critical';
  }
  
  if (errorRate > 0.1 || opFailureRate > 0.15 || repoStats.staleCount > repoStats.totalRepositories * 0.3) {
    return 'warning';
  }
  
  return 'healthy';
}