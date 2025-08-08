import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new issue
export const createIssue = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    longDescription: v.optional(v.string()),
    type: v.optional(v.string()),
    category: v.optional(v.array(v.string())),
    priority: v.optional(v.string()),
    budget: v.optional(v.number()),
    onboardingVideoLink: v.optional(v.string()),
    onboardingVideoUrl: v.optional(v.string()),
    onboardingThumbnailUrl: v.optional(v.string()),
    projectId: v.id("projects"),
    assigneeIds: v.optional(v.array(v.id("users"))),
    labels: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const issueId = await ctx.db.insert("issues", {
      ...args,
      slug,
      status: "OPEN",
      reporterId: userId,
      assigneeIds: args?.assigneeIds || [],
    });

    return issueId;
  },
});

// Get issue by ID with populated data
export const getIssueById = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) return null;

    // Get project data
    const project = await ctx.db.get(issue.projectId);
    if (!project) return null;

    // Get project owner
    const projectOwner = await ctx.db.get(project.ownerId);

    // Get project collaborators
    const collaborators = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", issue.projectId))
      .collect();

    const collaboratorsWithUsers = await Promise.all(
      collaborators.map(async (collab) => {
        const user = await ctx.db.get(collab.userId);
        return {
          ...collab,
          collabuter: user,
          status: collab.status || "active",
        };
      })
    );

    // Get assignees
    const assignees = issue.assigneeIds
      ? await Promise.all(
          issue.assigneeIds.map(async (id) => {
            const user = await ctx.db.get(id as any);
            return user;
          })
        ).then((users) => users.filter(Boolean))
      : [];

    // Get collaboration requests
    const collaborationRequests = await ctx.db
      .query("collaboration_requests")
      .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
      .collect();

    const collaborationRequestsWithDevelopers = await Promise.all(
      collaborationRequests.map(async (request) => {
        const developer = await ctx.db.get(request.developerId as any);
        return {
          ...request,
          developer,
        };
      })
    );

    // Get issue applications
    const applications = await ctx.db
      .query("issue_applications")
      .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
      .collect();

    const applicationsWithData = await Promise.all(
      applications.map(async (application) => {
        const applicant = await ctx.db.get(application.applicantId);
        return {
          ...application,
          requestStatus: application.status, // Map to match old interface
          applicant,
        };
      })
    );

    return {
      ...issue,
      project: {
        ...project,
        lead: projectOwner,
        collabuters: collaboratorsWithUsers,
      },
      assignees,
      collaborationRequests: collaborationRequestsWithDevelopers,
      requests: applicationsWithData, // Map applications to requests for compatibility
    };
  },
});

// Get issues by project
export const getIssuesByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let issuesQuery = ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId));

    if (args.status) {
      issuesQuery = issuesQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const issues = await issuesQuery.collect();

    if (args.limit) {
      return issues.slice(0, args.limit);
    }

    return issues;
  },
});

// Update issue
export const updateIssue = mutation({
  args: {
    issueId: v.id("issues"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      longDescription: v.optional(v.string()),
      type: v.optional(v.string()),
      category: v.optional(v.array(v.string())),
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      budget: v.optional(v.number()),
      assigneeIds: v.optional(v.array(v.id("users"))),
      labels: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const updates: any = { ...args.updates };

    // Update slug if title changed
    if (args.updates.title) {
      updates.slug = args.updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    await ctx.db.patch(args.issueId, updates);
    return true;
  },
});

// Delete issue
export const deleteIssue = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Delete related collaboration requests
    const collaborationRequests = await ctx.db
      .query("collaboration_requests")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();

    for (const request of collaborationRequests) {
      await ctx.db.delete(request._id);
    }

    // Delete the issue
    await ctx.db.delete(args.issueId);
    return true;
  },
});

// Create collaboration request
export const createCollaborationRequest = mutation({
  args: {
    issueId: v.id("issues"),
    percentageShare: v.number(),
    taskDefinition: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const requestId = await ctx.db.insert("collaboration_requests", {
      developerId: userId,
      issueId: args.issueId,
      percentageShare: args.percentageShare,
      taskDefinition: args.taskDefinition,
      status: "pending",
      requestedAt: Date.now(),
    });

    return requestId;
  },
});

// Update collaboration request status
export const updateCollaborationRequestStatus = mutation({
  args: {
    requestId: v.id("collaboration_requests"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    await ctx.db.patch(args.requestId, {
      status: args.status,
    });

    return true;
  },
});

// Get all issues (for dashboard)
export const getAllIssues = query({
  args: {
    status: v.union(
      v.literal("OPEN"),
      v.literal("IN_PROGRESS"),
      v.literal("RESOLVED"),
      v.literal("CLOSED")
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let issues;

    if (args.status) {
      issues = await ctx.db
        .query("issues")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .collect();
    } else {
      issues = await ctx.db.query("issues").collect();
    }

    // Apply pagination
    if (args.offset) {
      issues = issues.slice(args.offset);
    }
    if (args.limit) {
      issues = issues.slice(0, args.limit);
    }

    // Get populated data for each issue
    const issuesWithData = await Promise.all(
      issues.map(async (issue) => {
        const project = await ctx.db.get(issue.projectId);
        return {
          ...issue,
          project,
        };
      })
    );

    return issuesWithData;
  },
});

// Get issues with request counts (optimized for list views)
export const getIssuesWithRequests = query({
  args: {
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let issues;

    // Filter by project if provided
    if (args.projectId) {
      issues = await ctx.db
        .query("issues")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect();
    } else {
      issues = await ctx.db.query("issues").collect();
    }

    // Filter by status if provided
    if (args.status) {
      issues = issues.filter(issue => issue.status === args.status);
    }

    // Apply pagination
    if (args.offset) {
      issues = issues.slice(args.offset);
    }
    if (args.limit) {
      issues = issues.slice(0, args.limit);
    }

    // Get request counts and basic project data for each issue
    const issuesWithRequests = await Promise.all(
      issues.map(async (issue) => {
        // Get collaboration requests count
        const collaborationRequests = await ctx.db
          .query("collaboration_requests")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();

        // Get issue applications count  
        const applications = await ctx.db
          .query("issue_applications")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();

        // Combine both types of requests
        const allRequests = [
          ...collaborationRequests.map(req => ({ ...req, requestStatus: req.status })),
          ...applications.map(app => ({ ...app, requestStatus: app.status }))
        ];

        // Get basic project data
        const project = await ctx.db.get(issue.projectId);

        return {
          ...issue,
          project,
          requests: allRequests,
          requestCounts: {
            total: allRequests.length,
            pending: allRequests.filter(req => req.requestStatus === "pending").length,
            accepted: allRequests.filter(req => req.requestStatus === "accepted").length,
            rejected: allRequests.filter(req => req.requestStatus === "rejected").length,
          },
        };
      })
    );

    return issuesWithRequests;
  },
});

// Create an application for an issue
export const createIssueApplication = mutation({
  args: {
    issueId: v.id("issues"),
    proposal: v.string(),
    attachments: v.optional(v.array(v.id("media"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Check if user already applied to this issue
    const existingApplication = await ctx.db
      .query("issue_applications")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .filter((q) => q.eq(q.field("applicantId"), userId))
      .first();

    if (existingApplication) {
      throw new Error("You have already applied to this issue");
    }

    const applicationId = await ctx.db.insert("issue_applications", {
      issueId: args.issueId,
      applicantId: userId,
      proposal: args.proposal,
      attachments: args.attachments,
      status: "pending",
      appliedAt: Date.now(),
    });

    return applicationId;
  },
});

// Get applications for an issue
export const getIssueApplications = query({
  args: {
    issueId: v.id("issues"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let applicationsQuery = ctx.db
      .query("issue_applications")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId));

    if (args.status) {
      applicationsQuery = applicationsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const applications = await applicationsQuery.collect();

    // Get applicant data for each application
    const applicationsWithData = await Promise.all(
      applications.map(async (application) => {
        const applicant = await ctx.db.get(application.applicantId);
        return {
          ...application,
          applicant,
        };
      })
    );

    return applicationsWithData;
  },
});

// Update application status
export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("issue_applications"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewedById: userId,
    });

    return true;
  },
});

// Admin queries
export const count = query({
  args: {},
  handler: async (ctx) => {
    const issues = await ctx.db.query("issues").collect();
    return issues.length;
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const issues = await ctx.db.query("issues").collect();
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return issues.slice(offset, offset + limit);
  },
});
