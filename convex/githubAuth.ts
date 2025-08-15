import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Check if user has GitHub connected - only accessible by authenticated users
export const checkGitHubConnection = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        isConnected: false,
        hasGitHubAccess: false,
        githubUsername: null,
        error: null, // Don't expose authentication status
      };
    }

    try {
      // Only query for the current user's GitHub profile
      const githubProfile = await ctx.db
        .query("github_profiles")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (!githubProfile) {
        return {
          isConnected: false,
          hasGitHubAccess: false,
          githubUsername: null,
          error: null,
        };
      }

      // Validate profile belongs to authenticated user
      if (githubProfile.userId !== userId) {
        return {
          isConnected: false,
          hasGitHubAccess: false,
          githubUsername: null,
          error: null,
        };
      }

      return {
        isConnected: true,
        hasGitHubAccess: githubProfile.githubConnected,
        githubUsername: githubProfile.githubUsername,
        error: null,
      };
    } catch (error) {
      // Don't expose internal errors
      return {
        isConnected: false,
        hasGitHubAccess: false,
        githubUsername: null,
        error: null,
      };
    }
  },
});

// Get GitHub profile - only for authenticated user's own profile
export const getGitHubProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    try {
      // Only return the authenticated user's own GitHub profile
      const githubProfile = await ctx.db
        .query("github_profiles")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      // Don't expose access token in the response for security
      if (githubProfile) {
        const { githubAccessToken, ...safeProfile } = githubProfile;
        return safeProfile;
      }

      return null;
    } catch (error) {
      return null;
    }
  },
});

// Connect GitHub account - stores GitHub OAuth data for authenticated user
export const connectGitHub = mutation({
  args: {
    githubId: v.string(),
    githubUsername: v.string(),
    githubAccessToken: v.optional(v.string()),
    githubInstallationId: v.optional(v.string()),
    publicRepos: v.optional(v.number()),
    followers: v.optional(v.number()),
    following: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    try {
      // Check if GitHub profile already exists for this user
      const existingProfile = await ctx.db
        .query("github_profiles")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      const githubData = {
        userId,
        githubId: args.githubId,
        githubUsername: args.githubUsername,
        githubConnected: true,
        githubConnectedAt: Date.now(),
        githubAccessToken: args.githubAccessToken,
        githubInstallationId: args.githubInstallationId,
        publicRepos: args.publicRepos,
        followers: args.followers,
        following: args.following,
        githubLastFetch: Date.now(),
      };

      if (existingProfile && existingProfile.userId === userId) {
        // Update existing profile
        await ctx.db.patch(existingProfile._id, githubData);
        return { success: true, profileId: existingProfile._id };
      } else {
        // Create new profile
        const profileId = await ctx.db.insert("github_profiles", githubData);
        return { success: true, profileId };
      }
    } catch (error) {
      throw new Error("Failed to connect GitHub account");
    }
  },
});

// Disconnect GitHub account - only allows users to disconnect their own account
export const disconnectGitHub = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    try {
      // Only allow disconnecting the authenticated user's own GitHub profile
      const githubProfile = await ctx.db
        .query("github_profiles")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (githubProfile && githubProfile.userId === userId) {
        await ctx.db.delete(githubProfile._id);
      }

      // Also remove repositories owned by this user
      const repositories = await ctx.db
        .query("github_repositories")
        .filter((q) => q.eq(q.field("ownerId"), userId))
        .collect();

      for (const repo of repositories) {
        // Double-check ownership before deletion
        if (repo.ownerId === userId) {
          await ctx.db.delete(repo._id);
        }
      }

      return { success: true };
    } catch (error) {
      throw new Error("Failed to disconnect GitHub account");
    }
  },
});