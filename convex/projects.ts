import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { EnhancedProject } from "../types/convex";
import { generateProjectSlug } from "./utils/slugify";
import {
  ProjectStatusValidator,
  ProjectTypeValidator,
  ProjectPhaseValidator,
  PHASE_STATUS,
  PROJECT_STATUS,
} from "./schema";

export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    longDescription: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    type: v.optional(ProjectTypeValidator),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    budget: v.optional(v.number()),
    stacks: v.optional(v.array(v.string())),
    spent: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    ownerId: v.id("users"),
    teamLeadId: v.optional(v.id("users")),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      ...args,
      slug: "", // Temporary, will be updated below
      status: PROJECT_STATUS.PLANNED,
      phases: [
        {
          name: "Planning",
          status: PHASE_STATUS.NOT_STARTED,
          percentageDone: 0,
        },
        { name: "Design", status: PHASE_STATUS.NOT_STARTED, percentageDone: 0 },
        {
          name: "Development",
          status: PHASE_STATUS.NOT_STARTED,
          percentageDone: 0,
        },
        {
          name: "Testing/QA",
          status: PHASE_STATUS.NOT_STARTED,
          percentageDone: 0,
        },
        {
          name: "Deployment",
          status: PHASE_STATUS.NOT_STARTED,
          percentageDone: 0,
        },
        {
          name: "Maintenance",
          status: PHASE_STATUS.NOT_STARTED,
          percentageDone: 0,
        },
      ],
      milestones: {
        ideaRefinement: "not-started",
        documentation: "not-started",
        design: "not-started",
        development: "not-started",
        testing: "not-started",
        launch: "not-started",
        maintenance: "not-started",
        scaling: "not-started",
      },
    });

    // Generate and assign slug after project creation
    const slug = generateProjectSlug(args.title, projectId);
    await ctx.db.patch(projectId, { slug });

    // Create project conversation
    const conversationId = await ctx.db.insert("conversations", {
      title: `${args.title} - Project Chat`,
      type: "PROJECT",
      projectId,
      createdById: args.ownerId,
      isArchived: false,
      messageCount: 0,
    });

    // Add owner as conversation participant
    await ctx.db.insert("conversation_participants", {
      conversationId,
      userId: args.ownerId,
      role: "ADMIN",
      joinedAt: Date.now(),
    });

    // Add team lead as participant if specified
    if (args.teamLeadId) {
      await ctx.db.insert("conversation_participants", {
        conversationId,
        userId: args.teamLeadId,
        role: "MODERATOR",
        joinedAt: Date.now(),
      });
    }

    return projectId;
  },
});

export const getProjects = query({
  args: {
    ownerId: v.optional(v.id("users")),
    status: v.optional(ProjectStatusValidator),
    type: v.optional(ProjectTypeValidator),
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let projects;

    if (args.ownerId) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId!))
        .collect();
    } else {
      projects = await ctx.db.query("projects").collect();
    }

    let filteredProjects = projects;

    if (args.status) {
      filteredProjects = filteredProjects.filter(
        (p) => p.status === args.status
      );
    }

    if (args.type) {
      filteredProjects = filteredProjects.filter((p) => p.type === args.type);
    }

    // Sort by creation time (newest first)
    filteredProjects.sort((a, b) => b._creationTime - a._creationTime);

    // Calculate pagination
    const page = args.page || 1;
    const limit = args.limit || 10;
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(filteredProjects.length / limit);
    const paginatedProjects = filteredProjects.slice(offset, offset + limit);

    // Get additional data for each project
    const projectsWithData = await Promise.all(
      paginatedProjects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);
        const teamLead = project.teamLeadId
          ? await ctx.db.get(project.teamLeadId)
          : null;

        // Get media for owner and team lead
        let ownerProfilePicture = null;
        if (owner?.profilePicture) {
          ownerProfilePicture = await ctx.db.get(owner.profilePicture);
        }

        let teamLeadProfilePicture = null;
        if (teamLead?.profilePicture) {
          teamLeadProfilePicture = await ctx.db.get(teamLead.profilePicture);
        }

        // Get repository if connected
        const repository = project.repositoryId
          ? await ctx.db.get(project.repositoryId)
          : null;

        // Get issue count
        const issueCount = await ctx.db
          .query("issues")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
          .then((issues) => issues.length);

        // Get collaborator count
        const collaboratorCount = await ctx.db
          .query("project_collaborators")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
          .then((collaborators) => collaborators.length);

        // Get collaborators with user data
        const collaborators = await ctx.db
          .query("project_collaborators")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        const collaboratorsWithData = await Promise.all(
          collaborators.map(async (collab) => {
            const user = await ctx.db.get(collab.userId);
            let profilePicture = null;
            if (user?.profilePicture) {
              profilePicture = await ctx.db.get(user.profilePicture);
            }

            return {
              ...collab,
              user: user
                ? {
                    ...user,
                    profilePicture: profilePicture,
                  }
                : null,
            };
          })
        );

        return {
          ...project,
          // Format dates as ISO strings for frontend
          startDate: new Date(project.startDate).toISOString(),
          endDate: project.endDate
            ? new Date(project.endDate).toISOString()
            : null,
          createdAt: new Date(project._creationTime).toISOString(),
          updatedAt: new Date(project._creationTime).toISOString(),

          // Populate owner with media
          owner: owner
            ? {
                ...owner,
                profilePicture: ownerProfilePicture,
              }
            : null,

          // Populate team lead with media
          teamLead: teamLead
            ? {
                ...teamLead,
                profilePicture: teamLeadProfilePicture,
              }
            : null,

          repository,
          issueCount,
          collaboratorCount,
          collaborators: collaboratorsWithData,

          // Transform milestones with proper defaults
          milestones: project.milestones || {
            ideaRefinement: "not-started",
            documentation: "not-started",
            design: "not-started",
            development: "not-started",
            testing: "not-started",
            launch: "not-started",
            maintenance: "not-started",
            scaling: "not-started",
          },

          // Transform stacks to expected format
          stacks: project.stacks || [],

          // Transform tags to expected format
          tags: project.tags?.map((tag) => ({ tag, id: tag })) || [],
        };
      })
    );

    return {
      projects: projectsWithData,
      totalPages,
      currentPage: page,
      totalProjects: filteredProjects.length,
      hasMore: page < totalPages,
    };
  },
});

export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!project) {
      return null;
    }

    const owner = await ctx.db.get(project.ownerId);
    const teamLead = project.teamLeadId
      ? await ctx.db.get(project.teamLeadId)
      : null;

    // Get media for owner and team lead
    let ownerProfilePicture = null;
    if (owner?.profilePicture) {
      ownerProfilePicture = await ctx.db.get(owner.profilePicture);
    }

    let teamLeadProfilePicture = null;
    if (teamLead?.profilePicture) {
      teamLeadProfilePicture = await ctx.db.get(teamLead.profilePicture);
    }

    // Get repository
    const repository = project.repositoryId
      ? await ctx.db.get(project.repositoryId)
      : null;

    // Get issues with populated data
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    const issuesWithData = await Promise.all(
      issues.map(async (issue) => {
        const reporter = await ctx.db.get(issue.reporterId);
        let reporterProfilePicture = null;
        if (reporter?.profilePicture) {
          reporterProfilePicture = await ctx.db.get(reporter.profilePicture);
        }

        // Get assignees if any
        const assignees = issue.assigneeIds
          ? await Promise.all(
              issue.assigneeIds.map(async (assigneeId) => {
                const assignee = await ctx.db.get(assigneeId);
                let assigneeProfilePicture = null;
                if (assignee?.profilePicture) {
                  assigneeProfilePicture = await ctx.db.get(
                    assignee.profilePicture
                  );
                }
                return assignee
                  ? {
                      ...assignee,
                      profilePicture: assigneeProfilePicture,
                    }
                  : null;
              })
            )
          : [];

        return {
          ...issue,
          createdAt: new Date(issue._creationTime).toISOString(),
          updatedAt: new Date(issue._creationTime).toISOString(),
          reporter: reporter
            ? {
                ...reporter,
                profilePicture: reporterProfilePicture,
              }
            : null,
          assignees: assignees.filter(Boolean),
        };
      })
    );

    // Get collaborators
    const collaborators = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    const collaboratorsWithData = await Promise.all(
      collaborators.map(async (collab) => {
        const user = await ctx.db.get(collab.userId);
        let profilePicture = null;
        if (user?.profilePicture) {
          profilePicture = await ctx.db.get(user.profilePicture);
        }

        return {
          ...collab,
          joinedAt: new Date(collab.joinedAt).toISOString(),
          user: user
            ? {
                ...user,
                profilePicture: profilePicture,
              }
            : null,
        };
      })
    );

    return {
      ...project,
      // Format dates as ISO strings
      startDate: new Date(project.startDate).toISOString(),
      endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
      createdAt: new Date(project._creationTime).toISOString(),
      updatedAt: new Date(project._creationTime).toISOString(),

      // Populate owner with media
      owner: owner
        ? {
            ...owner,
            profilePicture: ownerProfilePicture,
          }
        : null,

      // Populate team lead with media
      teamLead: teamLead
        ? {
            ...teamLead,
            profilePicture: teamLeadProfilePicture,
          }
        : null,

      repository,
      issues: issuesWithData,
      collaborators: collaboratorsWithData,

      // Transform milestones with proper defaults
      milestones: project.milestones || {
        ideaRefinement: "not-started",
        documentation: "not-started",
        design: "not-started",
        development: "not-started",
        testing: "not-started",
        launch: "not-started",
        maintenance: "not-started",
        scaling: "not-started",
      },

      // Transform stacks and tags
      stacks: project.stacks || [],
      tags: project.tags?.map((tag) => ({ tag, id: tag })) || [],
    };
  },
});

export const getProjectsByProductId = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    return projects;
  },
});

export const getProjectsCountByProductId = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    return projects.length;
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      longDescription: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      type: v.optional(ProjectTypeValidator),
      status: v.optional(ProjectStatusValidator),
      phases: v.optional(v.array(ProjectPhaseValidator)),
      endDate: v.optional(v.number()),
      budget: v.optional(v.number()),
      stacks: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
      teamLeadId: v.optional(v.id("users")),
      milestones: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const updates: any = { ...args.updates };

    // Update slug if title changed
    if (args.updates.title) {
      updates.slug = generateProjectSlug(args.updates.title, args.projectId);
    }

    await ctx.db.patch(args.projectId, updates);
    return true;
  },
});

export const updateProjectPhase = mutation({
  args: {
    projectId: v.id("projects"),
    phaseName: v.string(),
    updates: v.object({
      status: v.optional(
        v.union(
          v.literal("not_started"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("blocked")
        )
      ),
      percentageDone: v.optional(v.number()),
      note: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const phases = project.phases || [];
    const phaseIndex = phases.findIndex((p) => p.name === args.phaseName);

    if (phaseIndex === -1) {
      throw new Error(`Phase "${args.phaseName}" not found`);
    }

    phases[phaseIndex] = {
      ...phases[phaseIndex],
      ...args.updates,
    };

    await ctx.db.patch(args.projectId, { phases });
    return true;
  },
});

export const addProjectPhase = mutation({
  args: {
    projectId: v.id("projects"),
    phase: ProjectPhaseValidator,
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const phases = project.phases || [];
    phases.push(args.phase);

    await ctx.db.patch(args.projectId, { phases });
    return true;
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    // Delete related data
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const issue of issues) {
      await ctx.db.delete(issue._id);
    }

    const collaborators = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const collab of collaborators) {
      await ctx.db.delete(collab._id);
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
    return true;
  },
});

export const addCollaborator = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if collaborator already exists
    const existing = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const collaboratorId = await ctx.db.insert("project_collaborators", {
      projectId: args.projectId,
      userId: args.userId,
      status: args.status || "ACTIVE",
      joinedAt: Date.now(),
    });

    // Add to project conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (conversation) {
      await ctx.db.insert("conversation_participants", {
        conversationId: conversation._id,
        userId: args.userId,
        role: "MEMBER",
        joinedAt: Date.now(),
      });
    }

    return collaboratorId;
  },
});

export const removeCollaborator = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const collaborator = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .first();

    if (collaborator) {
      await ctx.db.delete(collaborator._id);
    }

    // Remove from project conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (conversation) {
      const participant = await ctx.db
        .query("conversation_participants")
        .withIndex("by_conversation_user", (q) =>
          q.eq("conversationId", conversation._id).eq("userId", args.userId)
        )
        .first();

      if (participant) {
        await ctx.db.patch(participant._id, {
          leftAt: Date.now(),
        });
      }
    }

    return true;
  },
});

export const connectRepository = mutation({
  args: {
    projectId: v.id("projects"),
    repoFullName: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the repository
    const repository = await ctx.db
      .query("github_repositories")
      .withIndex("by_full_name", (q) => q.eq("fullName", args.repoFullName))
      .first();

    if (!repository) {
      throw new Error("Repository not found");
    }

    // Connect repository to project
    await ctx.db.patch(repository._id, {
      projectId: args.projectId,
    });

    // Update project with repository reference
    await ctx.db.patch(args.projectId, {
      repositoryId: repository._id,
    });

    return repository._id;
  },
});

export const getProjectStats = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const issuesQuery = ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId));

    const issues = await issuesQuery.collect();

    const openIssues = issues.filter((i) => i.status === "OPEN").length;
    const inProgressIssues = issues.filter(
      (i) => i.status === "IN_PROGRESS"
    ).length;
    const resolvedIssues = issues.filter((i) => i.status === "RESOLVED").length;
    const closedIssues = issues.filter((i) => i.status === "CLOSED").length;

    const collaborators = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return {
      totalIssues: issues.length,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      totalCollaborators: collaborators.length,
      activeCollaborators: collaborators.filter((c) => c.status === "ACTIVE")
        .length,
    };
  },
});

// Simple projects query for direct usage (replaces the hook)
export const getAllProjects = query({
  args: {
    ownerId: v.optional(v.id("users")),
    status: v.optional(ProjectStatusValidator),
    type: v.optional(ProjectTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let projects;

    if (args.ownerId) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId!))
        .collect();
    } else {
      projects = await ctx.db.query("projects").collect();
    }

    // Apply filters
    if (args.status) {
      projects = projects.filter((p) => p.status === args.status);
    }

    if (args.type) {
      projects = projects.filter((p) => p.type === args.type);
    }

    // Sort by creation time (newest first)
    projects.sort((a, b) => b._creationTime - a._creationTime);

    // Apply limit
    if (args.limit) {
      projects = projects.slice(0, args.limit);
    }

    // Populate with media and additional data
    const projectsWithData = await Promise.all(
      projects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);
        const teamLead = project.teamLeadId
          ? await ctx.db.get(project.teamLeadId)
          : null;

        // Get media
        let ownerProfilePicture = null;
        if (owner?.profilePicture) {
          ownerProfilePicture = await ctx.db.get(owner.profilePicture);
        }

        let teamLeadProfilePicture = null;
        if (teamLead?.profilePicture) {
          teamLeadProfilePicture = await ctx.db.get(teamLead.profilePicture);
        }

        // Get counts
        const issueCount = await ctx.db
          .query("issues")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
          .then((issues) => issues.length);

        const collaboratorCount = await ctx.db
          .query("project_collaborators")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
          .then((collaborators) => collaborators.length);

        return {
          ...project,
          // Format dates as ISO strings
          startDate: new Date(project.startDate).toISOString(),
          endDate: project.endDate
            ? new Date(project.endDate).toISOString()
            : null,
          createdAt: new Date(project._creationTime).toISOString(),
          updatedAt: new Date(project._creationTime).toISOString(),

          // Populate owner with media
          owner: owner
            ? {
                ...owner,
                profilePicture: ownerProfilePicture,
              }
            : null,

          // Populate team lead with media
          teamLead: teamLead
            ? {
                ...teamLead,
                profilePicture: teamLeadProfilePicture,
              }
            : null,

          // Add counts
          issueCount,
          collaboratorCount,

          // Transform data to expected format
          milestones: project.milestones || {
            ideaRefinement: "not-started",
            documentation: "not-started",
            design: "not-started",
            development: "not-started",
            testing: "not-started",
            launch: "not-started",
            maintenance: "not-started",
            scaling: "not-started",
          },

          stacks: project.stacks || [],
          tags: project.tags?.map((tag) => ({ tag, id: tag })) || [],
        };
      })
    );

    return projectsWithData as unknown as EnhancedProject[];
  },
});

// Optimized query for project details view
export const getProjectDetailsById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Get owner and team lead with profile pictures
    const owner = await ctx.db.get(project.ownerId);
    const teamLead = project.teamLeadId
      ? await ctx.db.get(project.teamLeadId)
      : null;

    let ownerProfilePicture = null;
    if (owner?.profilePicture) {
      ownerProfilePicture = await ctx.db.get(owner.profilePicture);
    }

    let teamLeadProfilePicture = null;
    if (teamLead?.profilePicture) {
      teamLeadProfilePicture = await ctx.db.get(teamLead.profilePicture);
    }

    // Get issues for status counts (not full data to optimize performance)
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    // Get collaborators with user data and profile pictures
    const collaborators = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    const collaboratorsWithData = await Promise.all(
      collaborators.map(async (collab) => {
        const user = await ctx.db.get(collab.userId);
        let profilePicture = null;
        if (user?.profilePicture) {
          profilePicture = await ctx.db.get(user.profilePicture);
        }

        return {
          ...collab,
          joinedAt: new Date(collab.joinedAt).toISOString(),
          user: user
            ? {
                ...user,
                profilePicture: profilePicture,
              }
            : null,
        };
      })
    );

    // Get repository if connected
    const repository = project.repositoryId
      ? await ctx.db.get(project.repositoryId)
      : null;

    return {
      ...project,
      // Format dates as ISO strings
      startDate: new Date(project.startDate).toISOString(),
      endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
      createdAt: new Date(project._creationTime).toISOString(),
      updatedAt: new Date(project._creationTime).toISOString(),

      // Populate owner with media
      owner: owner
        ? {
            ...owner,
            profilePicture: ownerProfilePicture,
          }
        : null,

      // Populate team lead with media
      teamLead: teamLead
        ? {
            ...teamLead,
            profilePicture: teamLeadProfilePicture,
          }
        : null,

      // Add repository
      repository,

      // Add issues for progress calculation (minimal data for performance)
      issues: issues.map((issue) => ({
        _id: issue._id,
        status: issue.status,
        title: issue.title,
        priority: issue.priority,
      })),

      // Add collaborators with user data
      collaborators: collaboratorsWithData,

      // Add counts for quick access
      issueCount: issues.length,
      collaboratorCount: collaborators.length,

      // Transform milestones with proper defaults
      milestones: project.milestones || {
        ideaRefinement: "not-started",
        documentation: "not-started",
        design: "not-started",
        development: "not-started",
        testing: "not-started",
        launch: "not-started",
        maintenance: "not-started",
        scaling: "not-started",
      },

      // Transform stacks and tags
      stacks: project.stacks || [],
      tags: project.tags?.map((tag) => ({ tag, id: tag })) || [],
    };
  },
});

export const getProjectDetailsBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!project) return null;

    // Get owner and team lead with profile pictures
    const owner = await ctx.db.get(project.ownerId);
    const teamLead = project.teamLeadId
      ? await ctx.db.get(project.teamLeadId)
      : null;

    let ownerProfilePicture = null;
    if (owner?.profilePicture) {
      ownerProfilePicture = await ctx.db.get(owner.profilePicture);
    }

    let teamLeadProfilePicture = null;
    if (teamLead?.profilePicture) {
      teamLeadProfilePicture = await ctx.db.get(teamLead.profilePicture);
    }

    // Get issues for status counts (not full data to optimize performance)
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    // Get collaborators with user data and profile pictures
    const collaborators = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    const collaboratorsWithData = await Promise.all(
      collaborators.map(async (collab) => {
        const user = await ctx.db.get(collab.userId);
        let profilePicture = null;
        if (user?.profilePicture) {
          profilePicture = await ctx.db.get(user.profilePicture);
        }

        return {
          ...collab,
          joinedAt: new Date(collab.joinedAt).toISOString(),
          user: user
            ? {
                ...user,
                profilePicture: profilePicture,
              }
            : null,
        };
      })
    );

    // Get repository if connected
    const repository = project.repositoryId
      ? await ctx.db.get(project.repositoryId)
      : null;

    return {
      ...project,
      // Format dates as ISO strings
      startDate: new Date(project.startDate).toISOString(),
      endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
      createdAt: new Date(project._creationTime).toISOString(),
      updatedAt: new Date(project._creationTime).toISOString(),

      // Populate owner with media
      owner: owner
        ? {
            ...owner,
            profilePicture: ownerProfilePicture,
          }
        : null,

      // Populate team lead with media
      teamLead: teamLead
        ? {
            ...teamLead,
            profilePicture: teamLeadProfilePicture,
          }
        : null,

      // Add repository
      repository,

      // Add issues for progress calculation (minimal data for performance)
      issues: issues.map((issue) => ({
        _id: issue._id,
        status: issue.status,
        title: issue.title,
        priority: issue.priority,
      })),

      // Add collaborators with user data
      collaborators: collaboratorsWithData,

      // Add counts for quick access
      issueCount: issues.length,
      collaboratorCount: collaborators.length,

      // Transform milestones with proper defaults
      milestones: project.milestones || {
        ideaRefinement: "not-started",
        documentation: "not-started",
        design: "not-started",
        development: "not-started",
        testing: "not-started",
        launch: "not-started",
        maintenance: "not-started",
        scaling: "not-started",
      },

      // Transform stacks and tags
      stacks: project.stacks || [],
      tags: project.tags?.map((tag) => ({ tag, id: tag })) || [],
    };
  },
});

export const getExplorePageData = query({
  args: {
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db.query("projects").collect();

    const typeCounts = {
      "Back-end": projects.filter(
        (p) =>
          p.type === "backend" || p.type === "ai_ml" || p.type === "database"
      ).length,
      "Front-end": projects.filter(
        (p) => p.type === "frontend" || p.type === "mobile"
      ).length,
      "QA / Test": projects.filter((p) => p.type === "ai_ml").length,
      Deployment: projects.filter(
        (p) => p.type === "devops" || p.type === "cloud_infrastructure"
      ).length,
      Design: projects.filter(
        (p) => p.type === "frontend" || p.type === "mobile"
      ).length,
    };

    // Calculate pagination
    const page = args.page || 1;
    const limit = args.limit || 10;
    const offset = (page - 1) * limit;
    const totalProjects = projects.length;
    const totalPages = Math.ceil(totalProjects / limit);

    // Get paginated projects
    const paginatedProjects = projects.slice(offset, offset + limit);

    const featuredProjects = projects.slice(0, 2);

    const allProjects = paginatedProjects;

    const projectsWithData = await Promise.all(
      allProjects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);
        const teamLead = project.teamLeadId
          ? await ctx.db.get(project.teamLeadId)
          : null;

        // Get issue count
        const issueCount = await ctx.db
          .query("issues")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
          .then((issues) => issues.length);

        // Get collaborator count
        const collaboratorCount = await ctx.db
          .query("project_collaborators")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
          .then((collaborators) => collaborators.length);

        // Calculate progress from phases
        const progress = project.phases
          ? Math.round(
              project.phases.reduce(
                (sum, phase) => sum + phase.percentageDone,
                0
              ) / project.phases.length
            )
          : 0;

        // Format deadline
        let deadlineText = "No deadline";
        if (project.endDate) {
          const endDate = new Date(project.endDate);
          const now = new Date();
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            deadlineText = "Overdue";
          } else if (diffDays === 0) {
            deadlineText = "Due today";
          } else if (diffDays === 1) {
            deadlineText = "Due tomorrow";
          } else if (diffDays < 7) {
            deadlineText = `Due in ${diffDays} days`;
          } else if (diffDays < 30) {
            const weeks = Math.ceil(diffDays / 7);
            deadlineText = `Due in ${weeks} weeks`;
          } else {
            deadlineText = endDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }
        }

        return {
          ...project,
          // Format dates as ISO strings
          startDate: new Date(project.startDate).toISOString(),
          endDate: project.endDate
            ? new Date(project.endDate).toISOString()
            : null,
          createdAt: new Date(project._creationTime).toISOString(),
          updatedAt: new Date(project._creationTime).toISOString(),

          issueCount,
          collaboratorCount,
          progress,
          deadlineText,

          // Populate owner and team lead
          owner: owner ? { ...owner } : null,
          teamLead: teamLead ? { ...teamLead } : null,

          // Transform data to expected format
          milestones: project.milestones || {
            ideaRefinement: "not-started",
            documentation: "not-started",
            design: "not-started",
            development: "not-started",
            testing: "not-started",
            launch: "not-started",
            maintenance: "not-started",
            scaling: "not-started",
          },

          stacks: project.stacks || [],
          tags: project.tags?.map((tag) => ({ tag, id: tag })) || [],
        };
      })
    );

    return {
      typeCounts,
      featuredProjects: projectsWithData.slice(0, 2),
      allProjects: projectsWithData,
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    };
  },
});

// Admin queries
export const count = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return projects.length;
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db.query("projects").collect();
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return projects.slice(offset, offset + limit);
  },
});
