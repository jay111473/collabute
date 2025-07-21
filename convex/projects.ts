import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    longDescription: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    type: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    budget: v.optional(v.number()),
    stacks: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    ownerId: v.id("user"),
    teamLeadId: v.optional(v.id("user")),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const slug = args.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    const projectId = await ctx.db.insert("projects", {
      ...args,
      slug,
      status: "PLANNED",
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
    ownerId: v.optional(v.id("user")),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
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
      filteredProjects = filteredProjects.filter(p => p.status === args.status);
    }
    
    if (args.type) {
      filteredProjects = filteredProjects.filter(p => p.type === args.type);
    }

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
        const teamLead = project.teamLeadId ? await ctx.db.get(project.teamLeadId) : null;
        
        // Owner and teamLead data is directly available from unified user table

        // Get repository if connected
        const repository = project.repositoryId ? 
          await ctx.db.get(project.repositoryId) : null;

        // Get issue count
        const issueCount = await ctx.db
          .query("issues")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
          .then(issues => issues.length);

        // Get collaborator count
        const collaboratorCount = await ctx.db
          .query("project_collaborators")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
          .then(collaborators => collaborators.length);

        return {
          ...project,
          owner: owner ? {
            ...owner,
            name: owner.name,
            email: owner.email,
          } : null,
          teamLead: teamLead ? {
            ...teamLead,
            name: teamLead.name,
            email: teamLead.email,
          } : null,
          repository,
          issueCount,
          collaboratorCount,
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
    const teamLead = project.teamLeadId ? await ctx.db.get(project.teamLeadId) : null;
    
    // Owner and teamLead data is directly available from unified user table

    // Get repository
    const repository = project.repositoryId ? 
      await ctx.db.get(project.repositoryId) : null;

    // Get issues
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    // Get collaborators
    const collaborators = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    const collaboratorsWithData = await Promise.all(
      collaborators.map(async (collab) => {
        const user = await ctx.db.get(collab.userId);
        return {
          ...collab,
          user: user ? {
            ...user,
            name: user.name,
            email: user.email,
          } : null,
        };
      })
    );

    return {
      ...project,
      owner: owner ? {
        ...owner,
        name: owner.name,
        email: owner.email,
      } : null,
      teamLead: teamLead ? {
        ...teamLead,
        name: teamLead.name,
        email: teamLead.email,
      } : null,
      repository,
      issues,
      collaborators: collaboratorsWithData,
    };
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
      type: v.optional(v.string()),
      status: v.optional(v.string()),
      state: v.optional(v.string()),
      endDate: v.optional(v.number()),
      budget: v.optional(v.number()),
      stacks: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
      teamLeadId: v.optional(v.id("user")),
      milestones: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const updates: any = { ...args.updates };
    
    // Update slug if title changed
    if (args.updates.title) {
      updates.slug = args.updates.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    await ctx.db.patch(args.projectId, updates);
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
    userId: v.id("user"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if collaborator already exists
    const existing = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project_user", (q) => 
        q.eq("projectId", args.projectId).eq("userId", args.userId))
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
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    const collaborator = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project_user", (q) => 
        q.eq("projectId", args.projectId).eq("userId", args.userId))
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
          q.eq("conversationId", conversation._id).eq("userId", args.userId))
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
    
    const openIssues = issues.filter(i => i.status === "OPEN").length;
    const inProgressIssues = issues.filter(i => i.status === "IN_PROGRESS").length;
    const resolvedIssues = issues.filter(i => i.status === "RESOLVED").length;
    const closedIssues = issues.filter(i => i.status === "CLOSED").length;

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
      activeCollaborators: collaborators.filter(c => c.status === "ACTIVE").length,
    };
  },
});