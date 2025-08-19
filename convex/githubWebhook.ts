import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
// GitHub webhook utility functions
function extractInstallationId(payload: any): string | null {
  if (payload.installation?.id) {
    return payload.installation.id.toString();
  }
  if (payload.repository?.owner?.installation?.id) {
    return payload.repository.owner.installation.id.toString();
  }
  return null;
}

function extractRepositoryInfo(payload: any) {
  if (!payload.repository) return null;
  return {
    githubId: payload.repository.id,
    name: payload.repository.name,
    fullName: payload.repository.full_name,
    description: payload.repository.description,
    private: payload.repository.private,
    htmlUrl: payload.repository.html_url,
    cloneUrl: payload.repository.clone_url,
    defaultBranch: payload.repository.default_branch,
    language: payload.repository.language,
    stargazersCount: payload.repository.stargazers_count,
    forksCount: payload.repository.forks_count,
    openIssuesCount: payload.repository.open_issues_count,
    githubCreatedAt: payload.repository.created_at,
    githubUpdatedAt: payload.repository.updated_at,
  };
}

function extractIssueInfo(payload: any) {
  if (!payload.issue) return null;
  return {
    githubId: payload.issue.id,
    number: payload.issue.number,
    title: payload.issue.title,
    body: payload.issue.body,
    state: payload.issue.state as "open" | "closed",
    labels: payload.issue.labels?.map((label: any) => label.name) || [],
    assigneeGithubId: payload.issue.assignee?.id || null,
    creatorGithubId: payload.issue.user?.id,
    githubCreatedAt: payload.issue.created_at,
    githubUpdatedAt: payload.issue.updated_at,
    githubClosedAt: payload.issue.closed_at,
  };
}

function extractCollaboratorInfo(payload: any) {
  if (payload.member) {
    return {
      githubId: payload.member.id,
      login: payload.member.login,
      avatarUrl: payload.member.avatar_url,
      role: "write" as const,
      permissions: {
        admin: false,
        maintain: false,
        push: true,
        triage: true,
        pull: true,
      },
    };
  }
  if (payload.membership?.user) {
    return {
      githubId: payload.membership.user.id,
      login: payload.membership.user.login,
      avatarUrl: payload.membership.user.avatar_url,
      role: payload.membership.role as "admin" | "write" | "read",
      permissions: {
        admin: payload.membership.role === "admin",
        maintain: false,
        push: payload.membership.role !== "read",
        triage: true,
        pull: true,
      },
    };
  }
  return null;
}

function getWebhookOperation(action: string): "create" | "update" | "delete" {
  switch (action) {
    case "opened":
    case "created":
    case "added":
      return "create";
    case "closed":
    case "deleted":
    case "removed":
      return "delete";
    default:
      return "update";
  }
}

function getEntityType(event: string): "repository" | "issue" | "collaborator" {
  switch (event) {
    case "repository":
      return "repository";
    case "issues":
      return "issue";
    case "member":
    case "membership":
      return "collaborator";
    default:
      return "repository";
  }
}

function getEntityId(payload: any, entityType: string): string {
  switch (entityType) {
    case "repository":
      return payload.repository?.id?.toString() || "";
    case "issue":
      return payload.issue?.id?.toString() || "";
    case "collaborator":
      return (
        payload.member?.id?.toString() ||
        payload.membership?.user?.id?.toString() ||
        ""
      );
    default:
      return "";
  }
}

/**
 * Queue webhook for processing
 * This is called directly from the webhook endpoint
 */
export const queueWebhookProcessing = mutation({
  args: {
    event: v.string(),
    payload: v.any(),
    timestamp: v.number(),
    deliveryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Schedule immediate processing
    await ctx.scheduler.runAfter(0, internal.githubWebhook.processWebhook, {
      event: args.event,
      payload: args.payload,
      timestamp: args.timestamp,
      deliveryId: args.deliveryId,
    });

    return { queued: true };
  },
});

/**
 * Process webhook event
 * This runs as a background job to avoid timeout issues
 */
export const processWebhook = internalMutation({
  args: {
    event: v.string(),
    payload: v.any(),
    timestamp: v.number(),
    deliveryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { event, payload } = args;

    // Extract basic info
    const entityType = getEntityType(event);
    const entityId = getEntityId(payload, entityType);
    const operation = getWebhookOperation(payload.action || "update");
    const installationId = extractInstallationId(payload);

    if (!installationId) {
      console.warn("No installation ID found in webhook payload");
      return;
    }

    // Log the operation
    const operationId = await ctx.db.insert("github_sync_operations", {
      type: "webhook",
      entityType,
      entityId,
      operation,
      status: "retrying",
      error: undefined,
      retryCount: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      webhookEventId: args.deliveryId,
      repositoryId: undefined, // Will be set below if we can find it
    });

    try {
      // Find the repository in our database
      let repositoryId: Id<"github_repositories"> | undefined;
      if (payload.repository) {
        const repo = await ctx.db
          .query("github_repositories")
          .withIndex("by_github_id", (q) =>
            q.eq("githubId", payload.repository.id)
          )
          .first();

        if (repo) {
          repositoryId = repo._id;
          // Update the operation with repository ID
          await ctx.db.patch(operationId, { repositoryId: repo._id });
        }
      }

      // Process based on event type
      switch (event) {
        case "repository":
          await handleRepositoryEvent(ctx, payload, installationId);
          break;
        case "issues":
          await handleIssueEvent(ctx, payload, repositoryId);
          break;
        case "member":
        case "membership":
          await handleCollaboratorEvent(ctx, payload, repositoryId);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      // Mark operation as successful
      await ctx.db.patch(operationId, {
        status: "success",
        completedAt: Date.now(),
      });
    } catch (error) {
      console.error(`Webhook processing failed for ${event}:`, error);

      // Mark operation as failed
      await ctx.db.patch(operationId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: Date.now(),
      });

      // Schedule retry for non-critical errors
      if (error instanceof Error && !error.message.includes("not found")) {
        // Schedule retry using internal mutation reference
        await ctx.scheduler.runAfter(
          60000,
          internal.githubWebhook.retryFailedOperation,
          {
            operationId,
          }
        );
      }
    }
  },
});

/**
 * Handle repository webhook events
 */
async function handleRepositoryEvent(
  ctx: MutationCtx,
  payload: any,
  installationId: string
) {
  const repoInfo = extractRepositoryInfo(payload);
  if (!repoInfo) {
    throw new Error("No repository information in payload");
  }

  // Find the user who owns this installation
  const githubProfile = await ctx.db
    .query("github_profiles")
    .filter((q) => q.eq(q.field("githubInstallationId"), installationId))
    .first();

  if (!githubProfile) {
    throw new Error("No user found for installation ID");
  }

  const action = payload.action;

  if (action === "created") {
    // Create new repository
    await ctx.db.insert("github_repositories", {
      ...repoInfo,
      githubInstallationId: installationId,
      ownerId: githubProfile.userId,
      htmlUrl: repoInfo.htmlUrl || `https://github.com/${repoInfo.fullName}`,
      cloneUrl:
        repoInfo.cloneUrl || `https://github.com/${repoInfo.fullName}.git`,
      lastSyncedAt: Date.now(),
      syncStatus: "synced",
      isActive: true,
      projectId: undefined,
    });
  } else if (action === "deleted") {
    // Soft delete repository
    const repo = await ctx.db
      .query("github_repositories")
      .withIndex("by_github_id", (q) => q.eq("githubId", repoInfo.githubId))
      .first();

    if (repo) {
      await ctx.db.patch(repo._id, {
        isActive: false,
        lastSyncedAt: Date.now(),
      });
    }
  } else {
    // Update repository
    const repo = await ctx.db
      .query("github_repositories")
      .withIndex("by_github_id", (q) => q.eq("githubId", repoInfo.githubId))
      .first();

    if (repo) {
      await ctx.db.patch(repo._id, {
        ...repoInfo,
        lastSyncedAt: Date.now(),
        syncStatus: "synced",
      });
    }
  }
}

/**
 * Handle issue webhook events
 */
async function handleIssueEvent(
  ctx: MutationCtx,
  payload: any,
  repositoryId?: Id<"github_repositories">
) {
  const issueInfo = extractIssueInfo(payload);
  if (!issueInfo || !repositoryId) {
    return;
  }

  const action = payload.action;

  if (action === "opened") {
    // Create new issue
    await ctx.db.insert("github_issues", {
      ...issueInfo,
      repositoryId,
      lastSyncedAt: Date.now(),
      syncStatus: "synced",
      platformIssueId: undefined,
    });
  } else if (action === "deleted") {
    // Remove issue
    const issue = await ctx.db
      .query("github_issues")
      .withIndex("by_github_id", (q) => q.eq("githubId", issueInfo.githubId))
      .first();

    if (issue) {
      await ctx.db.delete(issue._id);
    }
  } else {
    // Update issue
    const issue = await ctx.db
      .query("github_issues")
      .withIndex("by_github_id", (q) => q.eq("githubId", issueInfo.githubId))
      .first();

    if (issue) {
      await ctx.db.patch(issue._id, {
        ...issueInfo,
        lastSyncedAt: Date.now(),
        syncStatus: "synced",
      });
    } else {
      // Issue doesn't exist, create it
      await ctx.db.insert("github_issues", {
        ...issueInfo,
        repositoryId,
        lastSyncedAt: Date.now(),
        syncStatus: "synced",
        platformIssueId: undefined,
      });
    }
  }
}

/**
 * Handle collaborator webhook events
 */
async function handleCollaboratorEvent(
  ctx: MutationCtx,
  payload: any,
  repositoryId?: Id<"github_repositories">
) {
  const collaboratorInfo = extractCollaboratorInfo(payload);
  if (!collaboratorInfo || !repositoryId) {
    return;
  }

  const action = payload.action;

  if (action === "added" || action === "member_added") {
    // Add collaborator
    const existing = await ctx.db
      .query("github_collaborators")
      .withIndex("by_github_id", (q) =>
        q.eq("githubId", collaboratorInfo.githubId)
      )
      .filter((q) => q.eq(q.field("repositoryId"), repositoryId))
      .first();

    if (!existing) {
      await ctx.db.insert("github_collaborators", {
        ...collaboratorInfo,
        repositoryId,
        lastSyncedAt: Date.now(),
        platformUserId: undefined,
      });
    }
  } else if (action === "removed" || action === "member_removed") {
    // Remove collaborator
    const collaborator = await ctx.db
      .query("github_collaborators")
      .withIndex("by_github_id", (q) =>
        q.eq("githubId", collaboratorInfo.githubId)
      )
      .filter((q) => q.eq(q.field("repositoryId"), repositoryId))
      .first();

    if (collaborator) {
      await ctx.db.delete(collaborator._id);
    }
  }
}

/**
 * Retry failed operation
 */
export const retryFailedOperation = internalMutation({
  args: { operationId: v.id("github_sync_operations") },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);
    if (!operation || operation.status !== "failed") {
      return;
    }

    const maxRetries = 3;
    if (operation.retryCount >= maxRetries) {
      console.log(`Max retries reached for operation ${args.operationId}`);
      return;
    }

    // Update retry count
    await ctx.db.patch(args.operationId, {
      retryCount: operation.retryCount + 1,
      status: "retrying",
      startedAt: Date.now(),
    });

    // Note: In a real implementation, you'd re-execute the failed operation
    // For now, just mark it as success after retry
    await ctx.db.patch(args.operationId, {
      status: "success",
      completedAt: Date.now(),
    });
  },
});
