import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { GitHubRepository, GitHubActivity, GitHubUserProfile } from "../types/convex";

// Get user's GitHub account from github_profiles table
export const getUserGitHubAccount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("github_profiles")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId)
      )
      .first();

    return account;
  },
});

// Sync GitHub repositories for a user
export const syncUserRepositories = mutation({
  args: {
    repositories: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        fullName: v.string(),
        description: v.optional(v.string()),
        private: v.boolean(),
        htmlUrl: v.string(),
        cloneUrl: v.string(),
        language: v.optional(v.string()),
        stargazersCount: v.number(),
        forksCount: v.number(),
        defaultBranch: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get current authenticated user ID
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get user's profile directly from unified user table
    const userProfile = await ctx.db.get(userId);

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    const syncedRepos = [];

    for (const repo of args.repositories) {
      // Check if repository already exists
      const existingRepo = await ctx.db
        .query("github_repositories")
        .withIndex("by_github_id", (q) => q.eq("githubId", repo.id))
        .first();

      if (existingRepo) {
        // Update existing repository
        await ctx.db.patch(existingRepo._id, {
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          private: repo.private,
          htmlUrl: repo.htmlUrl,
          cloneUrl: repo.cloneUrl,
          language: repo.language,
          stargazersCount: repo.stargazersCount,
          forksCount: repo.forksCount,
          defaultBranch: repo.defaultBranch,
          lastSyncAt: Date.now(),
        });
        syncedRepos.push(existingRepo._id);
      } else {
        // Create new repository record
        const repoId = await ctx.db.insert("github_repositories", {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          ownerId: userProfile._id,
          private: repo.private,
          htmlUrl: repo.htmlUrl,
          cloneUrl: repo.cloneUrl,
          language: repo.language,
          stargazersCount: repo.stargazersCount,
          forksCount: repo.forksCount,
          defaultBranch: repo.defaultBranch,
          isActive: true,
          lastSyncAt: Date.now(),
        });
        syncedRepos.push(repoId);
      }
    }

    return syncedRepos;
  },
});

// Get user's GitHub repositories
export const getUserRepositories = query({
  args: {
    userId: v.id("users"),
    includePrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("github_repositories")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId));

    const repositories = await query.collect();

    let filteredRepos = repositories.filter((repo) => repo.isActive);

    if (!args.includePrivate) {
      filteredRepos = filteredRepos.filter((repo) => !repo.private);
    }

    // Get connected projects for each repository
    const reposWithProjects = await Promise.all(
      filteredRepos.map(async (repo) => {
        const project = repo.projectId
          ? await ctx.db.get(repo.projectId)
          : null;
        return {
          ...repo,
          connectedProject: project,
        };
      })
    );

    return reposWithProjects;
  },
});

// Connect repository to project
export const connectRepositoryToProject = mutation({
  args: {
    repositoryId: v.id("github_repositories"),
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify user owns the repository
    const repository = await ctx.db.get(args.repositoryId);
    if (!repository) {
      throw new Error("Repository not found");
    }

    const userProfile = await ctx.db.get(args.userId);

    if (!userProfile || repository.ownerId !== userProfile._id) {
      throw new Error("Unauthorized to connect this repository");
    }

    // Verify user owns or is collaborator on the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const isOwner = project.ownerId === userProfile._id;
    const isCollaborator = await ctx.db
      .query("project_collaborators")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", userProfile._id)
      )
      .first();

    if (!isOwner && !isCollaborator) {
      throw new Error("Unauthorized to connect repository to this project");
    }

    // Connect repository to project
    await ctx.db.patch(args.repositoryId, {
      projectId: args.projectId,
    });

    // Update project with repository reference
    await ctx.db.patch(args.projectId, {
      repositoryId: args.repositoryId,
    });

    return true;
  },
});

// Disconnect repository from project
export const disconnectRepositoryFromProject = mutation({
  args: {
    repositoryId: v.id("github_repositories"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const repository = await ctx.db.get(args.repositoryId);
    if (!repository) {
      throw new Error("Repository not found");
    }

    const userProfile = await ctx.db.get(args.userId);

    if (!userProfile || repository.ownerId !== userProfile._id) {
      throw new Error("Unauthorized to disconnect this repository");
    }

    const oldProjectId = repository.projectId;

    // Disconnect repository
    await ctx.db.patch(args.repositoryId, {
      projectId: undefined,
    });

    // Update project to remove repository reference
    if (oldProjectId) {
      await ctx.db.patch(oldProjectId, {
        repositoryId: undefined,
      });
    }

    return true;
  },
});

// Sync GitHub issues for a repository
export const syncRepositoryIssues = mutation({
  args: {
    repositoryId: v.id("github_repositories"),
    issues: v.array(
      v.object({
        number: v.number(),
        title: v.string(),
        body: v.optional(v.string()),
        state: v.string(),
        labels: v.array(v.string()),
        assignee: v.optional(v.string()),
        milestone: v.optional(v.string()),
        createdAt: v.string(),
        updatedAt: v.string(),
        closedAt: v.optional(v.string()),
        htmlUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const repository = await ctx.db.get(args.repositoryId);
    if (!repository || !repository.projectId) {
      throw new Error("Repository not found or not connected to project");
    }

    const syncedIssues = [];

    for (const issue of args.issues) {
      // Check if issue already exists
      const existingIssue = await ctx.db
        .query("issues")
        .withIndex("by_github_number", (q) =>
          q
            .eq("githubIssueNumber", issue.number)
            .eq("projectId", repository.projectId!)
        )
        .first();

      const issueData = {
        title: issue.title,
        slug: `github-${issue.number}`,
        description: issue.body || "",
        status: (issue.state === "open" ? "OPEN" : "CLOSED") as "OPEN" | "CLOSED",
        priority: "MEDIUM", // Default priority
        labels: issue.labels,
        githubIssueNumber: issue.number,
        githubUrl: issue.htmlUrl,
        lastSyncAt: Date.now(),
      };

      if (existingIssue) {
        // Update existing issue
        await ctx.db.patch(existingIssue._id, issueData);
        syncedIssues.push(existingIssue._id);
      } else {
        // Create new issue
        const issueId = await ctx.db.insert("issues", {
          ...issueData,
          projectId: repository.projectId!,
          reporterId: repository.ownerId,
          type: "BUG",
        });
        syncedIssues.push(issueId);
      }
    }

    return syncedIssues;
  },
});

// Get repository stats
export const getRepositoryStats = query({
  args: { repositoryId: v.id("github_repositories") },
  handler: async (ctx, args) => {
    const repository = await ctx.db.get(args.repositoryId);
    if (!repository) {
      return null;
    }

    let issueStats = null;
    if (repository.projectId) {
      const issues = await ctx.db
        .query("issues")
        .withIndex("by_project", (q) =>
          q.eq("projectId", repository.projectId!)
        )
        .filter((q) => q.neq(q.field("githubIssueNumber"), undefined))
        .collect();

      issueStats = {
        total: issues.length,
        open: issues.filter((i) => i.status === "OPEN").length,
        closed: issues.filter((i) => i.status === "CLOSED").length,
        inProgress: issues.filter((i) => i.status === "IN_PROGRESS").length,
      };
    }

    return {
      repository,
      issueStats,
    };
  },
});

// Fetch user's GitHub repositories from GitHub API and store them
export const fetchAndStoreRepositories = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    console.log("Fetching GitHub repositories for user:", userId);
    
    // Get GitHub profile and access token
    const githubProfile = await ctx.runQuery("auth:getGithubProfile" as any, { userId });
    
    if (!githubProfile || !githubProfile.githubAccessToken) {
      throw new Error("GitHub profile not found or access token missing");
    }

    try {
      // Fetch repositories from GitHub API
      const response = await fetch("https://api.github.com/user/repos?per_page=100", {
        headers: {
          Authorization: `Bearer ${githubProfile.githubAccessToken}`,
          "User-Agent": "Collabute-App",
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const repos = await response.json();
      console.log(`Fetched ${repos.length} repositories from GitHub`);
      
      // Prepare repository data for sync
      const repoData = repos.map((repo: GitHubRepository) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || "",
        private: repo.private,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        language: repo.language || "",
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        defaultBranch: repo.default_branch,
      }));

      // Store repositories using existing sync function
      const syncedRepoIds = await ctx.runMutation("github:syncUserRepositories" as any, {
        userId,
        repositories: repoData,
      });

      // Update GitHub profile with latest stats
      await ctx.runMutation("auth:updateGithubProfile" as any, {
        userId,
        githubUsername: repos[0]?.owner?.login,
        publicRepos: repos.filter((r: GitHubRepository) => !r.private).length,
      });

      console.log(`Synced ${syncedRepoIds.length} repositories`);
      return { syncedCount: syncedRepoIds.length, repositories: repoData };
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error);
      throw error;
    }
  },
});

// Fetch user's GitHub activities/events
export const fetchGithubActivities = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    console.log("Fetching GitHub activities for user:", userId);
    
    const githubProfile = await ctx.runQuery("auth:getGithubProfile" as any, { userId });
    
    if (!githubProfile || !githubProfile.githubAccessToken || !githubProfile.githubUsername) {
      throw new Error("GitHub profile incomplete - username or access token missing");
    }

    try {
      // Fetch user events from GitHub API
      const response = await fetch(`https://api.github.com/users/${githubProfile.githubUsername}/events?per_page=100`, {
        headers: {
          Authorization: `Bearer ${githubProfile.githubAccessToken}`,
          "User-Agent": "Collabute-App",
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const activities = await response.json();
      console.log(`Fetched ${activities.length} activities from GitHub`);
      
      // Filter relevant activities (commits, PRs, issues, repository creation)
      const relevantActivities = activities.filter((activity: GitHubActivity) => 
        ['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent', 'ForkEvent'].includes(activity.type)
      );

      console.log(`Found ${relevantActivities.length} relevant activities`);
      return relevantActivities;
    } catch (error) {
      console.error("Error fetching GitHub activities:", error);
      throw error;
    }
  },
});

// Fetch user profile data from GitHub API
export const fetchGithubUserProfile = action({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    console.log("Fetching GitHub user profile for user:", userId);
    
    const githubProfile = await ctx.runQuery("auth:getGithubProfile" as any, { userId });
    
    if (!githubProfile || !githubProfile.githubAccessToken) {
      throw new Error("GitHub profile not found or access token missing");
    }

    try {
      // Fetch user profile from GitHub API
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${githubProfile.githubAccessToken}`,
          "User-Agent": "Collabute-App",
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const profile = await response.json();
      console.log("Fetched GitHub profile:", profile.login);
      
      // Update GitHub profile with fetched data
      await ctx.runMutation("auth:updateGithubProfile" as any, {
        userId,
        githubUsername: profile.login,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
      });

      return profile;
    } catch (error) {
      console.error("Error fetching GitHub user profile:", error);
      throw error;
    }
  },
});
