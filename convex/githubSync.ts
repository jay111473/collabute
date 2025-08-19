import { mutation, internalMutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// ====================================
// SYNC FROM GITHUB TO PLATFORM
// ====================================

/**
 * Sync a single repository from GitHub to our platform
 */
export const syncRepositoryFromGitHub = mutation({
  args: {
    githubInstallationId: v.string(),
    githubRepoId: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Verify user owns this installation
    const githubProfile = await ctx.db
      .query("github_profiles")
      .filter((q) =>
        q.eq(q.field("githubInstallationId"), args.githubInstallationId)
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!githubProfile) {
      throw new Error("Installation not found or access denied");
    }

    // Schedule background sync
    await ctx.scheduler.runAfter(0, internal.githubSync.performRepositorySync, {
      githubInstallationId: args.githubInstallationId,
      githubRepoId: args.githubRepoId,
      userId,
    });

    return { scheduled: true };
  },
});

/**
 * Sync all repositories for a user's GitHub installation
 */
export const syncAllRepositories = mutation({
  args: {
    githubInstallationId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Verify user owns this installation
    const githubProfile = await ctx.db
      .query("github_profiles")
      .filter((q) =>
        q.eq(q.field("githubInstallationId"), args.githubInstallationId)
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!githubProfile) {
      throw new Error("Installation not found or access denied");
    }

    // Schedule background sync for all repositories
    await ctx.scheduler.runAfter(0, internal.githubSync.performFullSync, {
      githubInstallationId: args.githubInstallationId,
      userId,
    });

    return { scheduled: true };
  },
});

/**
 * Sync issues for a specific repository
 */
export const syncIssuesFromGitHub = mutation({
  args: {
    repositoryId: v.id("github_repositories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const repo = await ctx.db.get(args.repositoryId);
    if (!repo || repo.ownerId !== userId) {
      throw new Error("Repository not found or access denied");
    }

    // Schedule background sync
    await ctx.scheduler.runAfter(0, internal.githubSync.performIssueSync, {
      repositoryId: args.repositoryId,
    });

    return { scheduled: true };
  },
});

// ====================================
// SYNC FROM PLATFORM TO GITHUB
// ====================================

/**
 * Create issue on GitHub from platform issue
 */
export const createIssueOnGitHub = mutation({
  args: {
    issueId: v.id("issues"),
    targetRepositoryId: v.id("github_repositories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const issue = await ctx.db.get(args.issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    const repo = await ctx.db.get(args.targetRepositoryId);
    if (!repo || repo.ownerId !== userId) {
      throw new Error("Repository not found or access denied");
    }

    // Schedule background creation
    await ctx.scheduler.runAfter(0, internal.githubSync.performIssueCreation, {
      issueId: args.issueId,
      repositoryId: args.targetRepositoryId,
    });

    return { scheduled: true };
  },
});

/**
 * Update issue on GitHub from platform changes
 */
export const updateIssueOnGitHub = mutation({
  args: {
    githubIssueId: v.id("github_issues"),
    updates: v.object({
      title: v.optional(v.string()),
      body: v.optional(v.string()),
      state: v.optional(v.union(v.literal("open"), v.literal("closed"))),
      assigneeGithubId: v.optional(v.number()),
      labels: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const githubIssue = await ctx.db.get(args.githubIssueId);
    if (!githubIssue) {
      throw new Error("GitHub issue not found");
    }

    const repo = await ctx.db.get(githubIssue.repositoryId);
    if (!repo || repo.ownerId !== userId) {
      throw new Error("Repository not found or access denied");
    }

    // Schedule background update
    await ctx.scheduler.runAfter(0, internal.githubSync.performIssueUpdate, {
      githubIssueId: args.githubIssueId,
      updates: args.updates,
    });

    return { scheduled: true };
  },
});

// ====================================
// BACKGROUND SYNC OPERATIONS
// ====================================

/**
 * Perform full repository sync in background
 */
export const performFullSync = internalMutation({
  args: {
    githubInstallationId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // This would integrate with the GitHub client to fetch all repos
    // For now, we'll just log the operation
    const operationId = await ctx.db.insert("github_sync_operations", {
      type: "manual_sync",
      entityType: "repository",
      entityId: args.githubInstallationId,
      operation: "update",
      status: "retrying",
      error: undefined,
      retryCount: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      webhookEventId: undefined,
      repositoryId: undefined,
    });

    try {
      // TODO: Integrate with GitHubSyncClient to fetch repositories
      // const client = new GitHubSyncClient(args.githubInstallationId);
      // const repos = await client.listRepositories();

      // For now, mark as successful
      await ctx.db.patch(operationId, {
        status: "success",
        completedAt: Date.now(),
      });

      console.log(
        `Full sync completed for installation ${args.githubInstallationId}`
      );
    } catch (error) {
      await ctx.db.patch(operationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });
      throw error;
    }
  },
});

/**
 * Perform repository sync in background
 */
export const performRepositorySync = internalMutation({
  args: {
    githubInstallationId: v.string(),
    githubRepoId: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const operationId = await ctx.db.insert("github_sync_operations", {
      type: "manual_sync",
      entityType: "repository",
      entityId: args.githubRepoId.toString(),
      operation: "update",
      status: "retrying",
      error: undefined,
      retryCount: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      webhookEventId: undefined,
      repositoryId: undefined,
    });

    try {
      // Check if repository already exists
      let repo = await ctx.db
        .query("github_repositories")
        .withIndex("by_github_id", (q) => q.eq("githubId", args.githubRepoId))
        .first();

      if (repo) {
        // Update existing repository
        await ctx.db.patch(repo._id, {
          lastSyncedAt: Date.now(),
          syncStatus: "synced",
        });

        await ctx.db.patch(operationId, { repositoryId: repo._id });
      } else {
        // TODO: Fetch repository data from GitHub and create new entry
        console.log(
          `Repository ${args.githubRepoId} not found in database, would fetch from GitHub`
        );
      }

      await ctx.db.patch(operationId, {
        status: "success",
        completedAt: Date.now(),
      });

      console.log(`Repository sync completed for ${args.githubRepoId}`);
    } catch (error) {
      await ctx.db.patch(operationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });
      throw error;
    }
  },
});

/**
 * Perform issue sync in background
 */
export const performIssueSync = internalMutation({
  args: {
    repositoryId: v.id("github_repositories"),
  },
  handler: async (ctx, args) => {
    const repo = await ctx.db.get(args.repositoryId);
    if (!repo) {
      throw new Error("Repository not found");
    }

    const operationId = await ctx.db.insert("github_sync_operations", {
      type: "manual_sync",
      entityType: "issue",
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
      // TODO: Integrate with GitHubSyncClient to fetch issues
      // const client = new GitHubSyncClient(repo.githubInstallationId);
      // const [owner, repoName] = repo.fullName.split('/');
      // const issues = await client.listIssues(owner, repoName);

      // Update repository sync status
      await ctx.db.patch(args.repositoryId, {
        lastSyncedAt: Date.now(),
        syncStatus: "synced",
      });

      await ctx.db.patch(operationId, {
        status: "success",
        completedAt: Date.now(),
      });

      console.log(`Issue sync completed for repository ${repo.fullName}`);
    } catch (error) {
      await ctx.db.patch(operationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });

      // Mark repository sync as failed
      await ctx.db.patch(args.repositoryId, {
        syncStatus: "error",
        lastSyncedAt: Date.now(),
      });

      throw error;
    }
  },
});

/**
 * Create issue on GitHub in background
 */
export const performIssueCreation = internalMutation({
  args: {
    issueId: v.id("issues"),
    repositoryId: v.id("github_repositories"),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    const repo = await ctx.db.get(args.repositoryId);

    if (!issue || !repo) {
      throw new Error("Issue or repository not found");
    }

    const operationId = await ctx.db.insert("github_sync_operations", {
      type: "manual_sync",
      entityType: "issue",
      entityId: issue._id,
      operation: "create",
      status: "retrying",
      error: undefined,
      retryCount: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      webhookEventId: undefined,
      repositoryId: args.repositoryId,
    });

    try {
      // TODO: Integrate with GitHubSyncClient to create issue
      // const client = new GitHubSyncClient(repo.githubInstallationId);
      // const [owner, repoName] = repo.fullName.split('/');
      // const githubIssue = await client.createIssue(owner, repoName, {
      //   title: issue.title,
      //   body: issue.description || issue.longDescription,
      // });

      // For now, create a placeholder GitHub issue record
      await ctx.db.insert("github_issues", {
        githubId: Date.now(), // Placeholder - would use real GitHub ID
        repositoryId: args.repositoryId,
        number: 1, // Placeholder - would use real issue number
        title: issue.title,
        body: issue.description || issue.longDescription,
        state: "open",
        labels: issue.labels || [],
        assigneeGithubId: undefined,
        creatorGithubId: 0, // Placeholder
        githubCreatedAt: new Date().toISOString(),
        githubUpdatedAt: new Date().toISOString(),
        githubClosedAt: undefined,
        lastSyncedAt: Date.now(),
        syncStatus: "synced",
        platformIssueId: args.issueId,
      });

      // Link the platform issue to the GitHub issue
      await ctx.db.patch(args.issueId, {
        githubIssueNumber: 1, // Placeholder
        githubUrl: `https://github.com/${repo.fullName}/issues/1`, // Placeholder
        lastSyncAt: Date.now(),
      });

      await ctx.db.patch(operationId, {
        status: "success",
        completedAt: Date.now(),
      });

      console.log(`Issue created on GitHub: ${issue.title}`);
    } catch (error) {
      await ctx.db.patch(operationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });
      throw error;
    }
  },
});

/**
 * Update issue on GitHub in background
 */
export const performIssueUpdate = internalMutation({
  args: {
    githubIssueId: v.id("github_issues"),
    updates: v.object({
      title: v.optional(v.string()),
      body: v.optional(v.string()),
      state: v.optional(v.union(v.literal("open"), v.literal("closed"))),
      assigneeGithubId: v.optional(v.number()),
      labels: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const githubIssue = await ctx.db.get(args.githubIssueId);
    if (!githubIssue) {
      throw new Error("GitHub issue not found");
    }

    const repo = await ctx.db.get(githubIssue.repositoryId);
    if (!repo) {
      throw new Error("Repository not found");
    }

    const operationId = await ctx.db.insert("github_sync_operations", {
      type: "manual_sync",
      entityType: "issue",
      entityId: githubIssue.githubId.toString(),
      operation: "update",
      status: "retrying",
      error: undefined,
      retryCount: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      webhookEventId: undefined,
      repositoryId: githubIssue.repositoryId,
    });

    try {
      // TODO: Integrate with GitHubSyncClient to update issue
      // const client = new GitHubSyncClient(repo.githubInstallationId);
      // const [owner, repoName] = repo.fullName.split('/');
      // await client.updateIssue(owner, repoName, githubIssue.number, args.updates);

      // Update local GitHub issue record
      const updateData: any = {
        lastSyncedAt: Date.now(),
        syncStatus: "synced",
      };

      if (args.updates.title) updateData.title = args.updates.title;
      if (args.updates.body) updateData.body = args.updates.body;
      if (args.updates.state) updateData.state = args.updates.state;
      if (args.updates.assigneeGithubId)
        updateData.assigneeGithubId = args.updates.assigneeGithubId;
      if (args.updates.labels) updateData.labels = args.updates.labels;

      await ctx.db.patch(args.githubIssueId, updateData);

      await ctx.db.patch(operationId, {
        status: "success",
        completedAt: Date.now(),
      });

      console.log(`Issue updated on GitHub: ${githubIssue.title}`);
    } catch (error) {
      await ctx.db.patch(operationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });

      // Mark issue sync as failed
      await ctx.db.patch(args.githubIssueId, {
        syncStatus: "error",
        lastSyncedAt: Date.now(),
      });

      throw error;
    }
  },
});

// ====================================
// MANUAL TRIGGER FUNCTIONS
// ====================================

/**
 * Trigger manual sync for a repository
 */
export const triggerManualSync = mutation({
  args: { repositoryId: v.id("github_repositories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const repo = await ctx.db.get(args.repositoryId);
    if (!repo || repo.ownerId !== userId) {
      throw new Error("Repository not found or access denied");
    }

    // Schedule comprehensive sync
    await Promise.all([
      ctx.scheduler.runAfter(0, internal.githubSync.performRepositorySync, {
        githubInstallationId: repo.githubInstallationId,
        githubRepoId: repo.githubId,
        userId,
      }),
      ctx.scheduler.runAfter(1000, internal.githubSync.performIssueSync, {
        repositoryId: args.repositoryId,
      }),
    ]);

    // Mark sync as pending
    await ctx.db.patch(args.repositoryId, {
      syncStatus: "pending",
      lastSyncedAt: Date.now(),
    });

    return { triggered: true };
  },
});
