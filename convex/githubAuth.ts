import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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